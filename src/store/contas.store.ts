import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Papel } from '../types';

export interface Cliente {
  readonly username: string;
  readonly nome: string;
  readonly telefone: string;
  readonly cpf?: string;
  readonly cep: string;
  readonly rua: string;
  readonly bairro: string;
  readonly cidade: string;
  readonly estado: string;
  readonly numero: string;
}

export type CargoFuncionario = 'balcao' | 'cozinha' | 'garcom' | 'motoboy';

export interface Funcionario {
  readonly username: string;
  readonly nome: string;
  readonly telefone: string;
  readonly cargo: CargoFuncionario;
  // Cadastros de funcionário precisam ser confirmados pelo Admin do Site
  // antes do login funcionar de verdade — ver requisito "confirmar
  // cadastros de funcionários".
  readonly aprovado: boolean;
}

// Login único e fixo da conta que administra o site inteiro (não é um
// funcionário comum, não passa por aprovação e não fica nesta lista).
export const ADMIN_SITE = {
  username: 'calliduspizzaria',
  senha: 'equipe3'
};

export interface Credencial {
  readonly username: string;
  readonly senha: string;
  readonly papel: Papel;
}

// Cadastros (clientes, funcionários, credenciais) ficam em localStorage —
// compartilhados entre todas as abas do navegador. Diferente de quem está
// logado agora (ver auth.store.ts, que é por aba), a "lista de contas" é o
// mesmo "banco de dados" para todo mundo: um funcionário cadastrado numa
// aba precisa aparecer pendente de aprovação para o Admin do Site em
// qualquer outra aba aberta.
//
// MIGRAÇÃO: numa versão anterior deste projeto, clientes/funcionários
// ficavam guardados dentro do auth.store.ts, salvo sob a chave
// "callidus-auth" no localStorage. Quando o login virou "por aba"
// (sessionStorage), essa chave antiga ficou orfã — os dados continuam lá,
// só que nada mais lê. A função abaixo migra esses dados automaticamente
// na primeira vez que o app carrega com a nova versão, pra ninguém perder
// cadastros/pedidos de teste que já tinha feito.
function migrarContasAntigasSeNecessario() {
  try {
    if (localStorage.getItem('callidus-contas')) return;
    const antigo = localStorage.getItem('callidus-auth');
    if (!antigo) return;
    const parsed = JSON.parse(antigo);
    const estadoAntigo = parsed?.state;
    if (!estadoAntigo) return;
    const clientes = estadoAntigo.clientes ?? [];
    const funcionarios = estadoAntigo.funcionarios ?? [];
    const credenciais = estadoAntigo.credenciais ?? [];
    if (clientes.length === 0 && funcionarios.length === 0 && credenciais.length === 0) return;
    localStorage.setItem('callidus-contas', JSON.stringify({ state: { clientes, funcionarios, credenciais }, version: 0 }));
  } catch {
    // Se o formato antigo não bater, simplesmente começa do zero.
  }
}
migrarContasAntigasSeNecessario();

interface ContasState {
  readonly clientes: readonly Cliente[];
  readonly funcionarios: readonly Funcionario[];
  readonly credenciais: readonly Credencial[];

  readonly cadastrarCliente: (cliente: Cliente, senha: string) => 'ok' | 'username_em_uso';
  readonly cadastrarFuncionario: (funcionario: Omit<Funcionario, 'aprovado'>, senha: string) => 'ok' | 'username_em_uso';
  readonly aprovarFuncionario: (username: string) => void;
  readonly reprovarFuncionario: (username: string) => void;
  readonly atualizarCliente: (username: string, dados: Partial<Cliente>) => void;
}

// Cadastros (clientes, funcionários, credenciais) ficam em localStorage —
// compartilhados entre todas as abas do navegador. Diferente de quem está
// logado agora (ver auth.store.ts, que é por aba), a "lista de contas" é o
// mesmo "banco de dados" para todo mundo: um funcionário cadastrado numa
// aba precisa aparecer pendente de aprovação para o Admin do Site em
// qualquer outra aba aberta.
export const useContasStore = create<ContasState>()(
  persist(
    (set, get) => ({
      clientes: [],
      funcionarios: [],
      credenciais: [],

      cadastrarCliente: (cliente, senha) => {
        const usernameEmUso =
          get().clientes.some((c) => c.username === cliente.username) ||
          get().funcionarios.some((f) => f.username === cliente.username) ||
          cliente.username === ADMIN_SITE.username;
        if (usernameEmUso) return 'username_em_uso';

        set((state) => ({
          clientes: [...state.clientes, cliente],
          credenciais: [...state.credenciais, { username: cliente.username, senha, papel: 'cliente' }]
        }));
        return 'ok';
      },

      cadastrarFuncionario: (funcionario, senha) => {
        const usernameEmUso =
          get().clientes.some((c) => c.username === funcionario.username) ||
          get().funcionarios.some((f) => f.username === funcionario.username) ||
          funcionario.username === ADMIN_SITE.username;
        if (usernameEmUso) return 'username_em_uso';

        set((state) => ({
          funcionarios: [...state.funcionarios, { ...funcionario, aprovado: false }],
          credenciais: [...state.credenciais, { username: funcionario.username, senha, papel: funcionario.cargo }]
        }));
        return 'ok';
      },

      aprovarFuncionario: (username) =>
        set((state) => ({
          funcionarios: state.funcionarios.map((f) => (f.username === username ? { ...f, aprovado: true } : f))
        })),

      reprovarFuncionario: (username) =>
        set((state) => ({
          funcionarios: state.funcionarios.filter((f) => f.username !== username),
          credenciais: state.credenciais.filter((c) => c.username !== username)
        })),

      atualizarCliente: (username, dados) =>
        set((state) => ({
          clientes: state.clientes.map((c) => (c.username === username ? { ...c, ...dados } : c))
        }))
    }),
    { name: 'callidus-contas' }
  )
);
