import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Pizza, Tamanho } from '../types';

export interface ItemCarrinho {
  readonly idUnico: string;
  readonly pizza: Pizza;
  readonly tamanho: Tamanho;
  readonly extras: readonly string[];
  readonly observacoes: string;
  readonly quantidade: number;
  readonly precoUnitario: number;
  readonly saboresSelecionados?: readonly string[];
}

interface CarrinhoState {
  readonly itens: readonly ItemCarrinho[];
  readonly adicionarItem: (item: Omit<ItemCarrinho, 'idUnico' | 'precoUnitario'>, custoExtrasUnitario?: number) => void;
  readonly removerItem: (idUnico: string) => void;
  readonly atualizarQuantidade: (idUnico: string, quantidade: number) => void;
  readonly esvaziarCarrinho: () => void;
  readonly obterTotalItens: () => number;
  readonly obterSubtotal: () => number;
}

export const useCarrinhoStore = create<CarrinhoState>()(
  persist(
    (set, get) => ({
      itens: [],

      adicionarItem: (novoItem, custoExtrasUnitario = 0) => {
        const saboresSlug = novoItem.saboresSelecionados ? novoItem.saboresSelecionados.join('-') : 'unico';
        const idUnico = `${novoItem.pizza.id}-${novoItem.tamanho}-${novoItem.extras.join('-')}-${saboresSlug}`;

        let precoBaseTamanho = Number(novoItem.pizza.precoBrotinho);
        if (novoItem.tamanho === 'Média') precoBaseTamanho = Number(novoItem.pizza.precoMedia);
        if (novoItem.tamanho === 'Grande') precoBaseTamanho = Number(novoItem.pizza.precoGrande);

        const precoUnitario = precoBaseTamanho + custoExtrasUnitario;

        const itensAtuais = get().itens;
        const itemExistente = itensAtuais.find((item) => item.idUnico === idUnico);

        if (itemExistente) {
          set({
            itens: itensAtuais.map((item) =>
              item.idUnico === idUnico ? { ...item, quantidade: item.quantidade + novoItem.quantidade } : item
            )
          });
        } else {
          set({ itens: [...itensAtuais, { ...novoItem, idUnico, precoUnitario }] });
        }
      },

      removerItem: (idUnico) => set((state) => ({ itens: state.itens.filter((item) => item.idUnico !== idUnico) })),

      atualizarQuantidade: (idUnico, quantidade) => {
        if (quantidade <= 0) {
          get().removerItem(idUnico);
          return;
        }
        set((state) => ({
          itens: state.itens.map((item) => (item.idUnico === idUnico ? { ...item, quantidade } : item))
        }));
      },

      esvaziarCarrinho: () => set({ itens: [] }),

      obterTotalItens: () => get().itens.reduce((acc, item) => acc + item.quantidade, 0),

      obterSubtotal: () => get().itens.reduce((acc, item) => acc + item.precoUnitario * item.quantidade, 0)
    }),
    {
      name: 'callidus-carrinho',

      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
