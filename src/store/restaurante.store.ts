import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Adicional, Mesa } from '../types';

export interface RestauranteConfig {
  readonly nome: string;
  readonly logoUrl: string;
  readonly capaUrl: string;
  readonly corPrimaria: string;
  readonly corSecundaria: string;
  readonly descricao: string;
  readonly endereco: string;
  readonly horarioFuncionamento: string;
  readonly diasFuncionamento: string;
  readonly telefone: string;
  readonly taxaEntrega: number;
  readonly tempoPreparoEstimado: string;
  readonly formasPagamentoAceitas: readonly string[];
  readonly chavePix: string;
  readonly adicionaisDisponiveis: readonly Adicional[];
}

const CONFIG_PADRAO: RestauranteConfig = {
  nome: 'Pizzaria Callidus',
  logoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80',
  capaUrl: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=1200&auto=format&fit=crop&q=80',
  corPrimaria: '#ef4444',
  corSecundaria: '#f59e0b',
  descricao: 'Massa de fermentação lenta com ingredientes frescos selecionados.',
  endereco: 'Av. do E-Commerce, 100 - Silicon Valley',
  horarioFuncionamento: '18:00 às 23:30',
  diasFuncionamento: 'Terça a Domingo',
  telefone: '(11) 99999-9999',
  taxaEntrega: 7.50,
  tempoPreparoEstimado: '30-40 min',
  formasPagamentoAceitas: ['Cartão de Crédito', 'Pix', 'Dinheiro'],
  chavePix: 'suachavepix@email.com',
  adicionaisDisponiveis: []
};

interface RestauranteState {
  readonly config: RestauranteConfig;
  readonly mesas: readonly Mesa[];
  readonly atualizarConfig: (dados: Partial<RestauranteConfig>) => void;
  readonly adicionarAdicional: (adicional: Adicional) => void;
  readonly removerAdicional: (id: string) => void;
  readonly cadastrarMesas: (quantidade: number, capacidade: number) => void;
  readonly assumirMesa: (mesaId: string, garcomUsername: string) => void;
  // Ocupa a mesa sem atribuir garçom ainda — usado quando o cliente faz o
  // pedido presencial direto pelo site antes de qualquer garçom "assumir"
  // a mesa. Fica "aguardando atendimento" até um garçom assumir.
  readonly ocuparMesaSemGarcom: (mesaId: string) => void;
  readonly liberarMesa: (mesaId: string) => void;
}

export const useRestauranteStore = create<RestauranteState>()(
  persist(
    (set, get) => ({
      config: CONFIG_PADRAO,
      mesas: [],

      atualizarConfig: (dados) => set((state) => ({ config: { ...state.config, ...dados } })),

      adicionarAdicional: (adicional) =>
        set((state) => ({
          config: { ...state.config, adicionaisDisponiveis: [...state.config.adicionaisDisponiveis, adicional] }
        })),

      removerAdicional: (id) =>
        set((state) => ({
          config: {
            ...state.config,
            adicionaisDisponiveis: state.config.adicionaisDisponiveis.filter((a) => a.id !== id)
          }
        })),

      cadastrarMesas: (quantidade, capacidade) => {
        const jaExistentes = get().mesas.length;
        const novas: Mesa[] = Array.from({ length: quantidade }, (_, i) => ({
          id: `mesa-${jaExistentes + i + 1}-${Date.now()}`,
          numero: jaExistentes + i + 1,
          capacidade,
          status: 'livre'
        }));
        set((state) => ({ mesas: [...state.mesas, ...novas] }));
      },

      assumirMesa: (mesaId, garcomUsername) =>
        set((state) => ({
          mesas: state.mesas.map((m) =>
            m.id === mesaId ? { ...m, status: 'ocupada', garcomResponsavelUsername: garcomUsername } : m
          )
        })),

      ocuparMesaSemGarcom: (mesaId) =>
        set((state) => ({
          mesas: state.mesas.map((m) => (m.id === mesaId && m.status === 'livre' ? { ...m, status: 'ocupada' } : m))
        })),

      liberarMesa: (mesaId) =>
        set((state) => ({
          mesas: state.mesas.map((m) =>
            m.id === mesaId ? { ...m, status: 'livre', garcomResponsavelUsername: undefined } : m
          )
        }))
    }),
    { name: 'callidus-restaurante' }
  )
);
