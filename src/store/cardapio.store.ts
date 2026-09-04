import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Pizza } from '../types';

interface CardapioState {
  readonly pizzas: readonly Pizza[];
  readonly adicionarPizza: (pizza: Pizza) => void;
  readonly editarPizza: (id: string, dados: Partial<Pizza>) => void;
  readonly removerPizza: (id: string) => void;
}

export const useCardapioStore = create<CardapioState>()(
  persist(
    (set) => ({
      pizzas: [],

      adicionarPizza: (pizza) => set((state) => ({ pizzas: [...state.pizzas, pizza] })),

      editarPizza: (id, dados) =>
        set((state) => ({
          pizzas: state.pizzas.map((p) => (p.id === id ? { ...p, ...dados } : p))
        })),

      removerPizza: (id) =>
        set((state) => ({
          pizzas: state.pizzas
            .filter((p) => p.id !== id)
            .map((p) =>
              p.saboresPermitidosIds
                ? { ...p, saboresPermitidosIds: p.saboresPermitidosIds.filter((sid) => sid !== id) }
                : p
            )
        }))
    }),
    { name: 'callidus-cardapio' }
  )
);
