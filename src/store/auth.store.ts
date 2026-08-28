import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Comprador {
  readonly email: string;
  readonly nome: string;
  readonly sobrenome: string;
  readonly telefone: string;
  readonly cep: string;
  readonly rua: string;
  readonly bairro: string;
  readonly cidade: string;
  readonly estado: string;
  readonly numero: string;
  readonly pontoReferencia?: string;
  readonly fotoUrl?: string; // Foto de perfil do comprador
}

export interface DonoPizzaria {
  readonly email: string;
  readonly nomeDono: string;
  readonly cnpj: string;
  readonly nomePizzaria: string;
  readonly descricao: string;
  readonly corPrimaria: string;
  readonly corSecundaria: string;
  readonly telefone: string;
  readonly cep: string;
  readonly rua: string;
  readonly bairro: string;
  readonly cidade: string;
  readonly estado: string;
  readonly numero: string;
  readonly logoUrl: string;
  readonly chavePix?: string;
}

interface AuthState {
  readonly usuarioLogado: { readonly tipo: 'comprador' | 'pizzaria' | 'admin'; readonly email: string } | null;
  readonly compradores: readonly Comprador[];
  readonly donos: readonly DonoPizzaria[];
  readonly credenciais: readonly { readonly email: string; readonly senha: string }[];
  readonly cadastrarComprador: (comprador: Comprador, senha: string) => void;
  readonly cadastrarDono: (dono: DonoPizzaria, senha: string) => void;
  readonly fazerLogin: (email: string, senha: string) => 'comprador' | 'pizzaria' | null;
  readonly fazerLogout: () => void;
  readonly atualizarComprador: (email: string, dados: Partial<Comprador>) => void;
  readonly atualizarDono: (email: string, dados: Partial<DonoPizzaria>) => void;
  readonly excluirContaComprador: (email: string) => void;
  readonly excluirContaDono: (email: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuarioLogado: null,
      compradores: [],
      donos: [],
      credenciais: [],

      cadastrarComprador: (comprador, senha) => {
        set((state) => ({
          compradores: [...state.compradores, comprador],
          credenciais: [...state.credenciais, { email: comprador.email, senha }]
        }));
      },

      cadastrarDono: (dono, senha) => {
        set((state) => ({
          donos: [...state.donos, dono],
          credenciais: [...state.credenciais, { email: dono.email, senha }]
        }));
      },

      fazerLogin: (email, senha) => {
        const conta = get().credenciais.find((c) => c.email === email && c.senha === senha);
        if (!conta) return null;

        const eComprador = get().compradores.some((c) => c.email === email);
        const tipo = eComprador ? 'comprador' : 'pizzaria';

        set({ usuarioLogado: { tipo, email } });
        return tipo;
      },

      fazerLogout: () => set({ usuarioLogado: null }),

      atualizarComprador: (email, dados) => {
        set((state) => ({
          compradores: state.compradores.map((c) =>
            c.email === email ? { ...c, ...dados } : c
          )
        }));
      },

      atualizarDono: (email, dados) => {
        set((state) => ({
          donos: state.donos.map((d) =>
            d.email === email ? { ...d, ...dados } : d
          )
        }));
      },

      excluirContaComprador: (email) => {
        set((state) => ({
          compradores: state.compradores.filter((c) => c.email !== email),
          credenciais: state.credenciais.filter((c) => c.email !== email),
          usuarioLogado: state.usuarioLogado?.email === email ? null : state.usuarioLogado
        }));
      },

      excluirContaDono: (email) => {
        set((state) => ({
          donos: state.donos.filter((d) => d.email !== email),
          credenciais: state.credenciais.filter((c) => c.email !== email),
          usuarioLogado: state.usuarioLogado?.email === email ? null : state.usuarioLogado
        }));
      }
    }),
    {
      name: 'sua-pizzaria-saas-auth'
    }
  )
);