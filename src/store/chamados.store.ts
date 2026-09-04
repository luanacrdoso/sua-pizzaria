import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Chamado } from '../types';

interface ChamadosState {
  readonly chamados: readonly Chamado[];
  readonly chamarGarcom: (origem: 'cliente' | 'cozinha', mensagem: string, mesaId?: string) => void;
  readonly marcarAtendido: (id: string) => void;
}

export const useChamadosStore = create<ChamadosState>()(
  persist(
    (set) => ({
      chamados: [],

      chamarGarcom: (origem, mensagem, mesaId) =>
        set((state) => ({
          chamados: [
            ...state.chamados,
            { id: `chamado-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, origem, mensagem, mesaId, atendido: false, criadoEm: Date.now() }
          ]
        })),

      marcarAtendido: (id) =>
        set((state) => ({
          chamados: state.chamados.map((c) => (c.id === id ? { ...c, atendido: true } : c))
        }))
    }),
    { name: 'callidus-chamados' }
  )
);
