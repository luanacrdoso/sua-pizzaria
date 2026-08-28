import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Pizza } from '../features/cardapio/types/pizza';

export interface ItemCarrinho {
  readonly idUnico: string;
  readonly tenantId: string;
  readonly pizza: Pizza;
  readonly tamanho: 'Brotinho' | 'Média' | 'Grande';
  readonly borda: 'Sem Borda' | 'Catupiry' | 'Cheddar';
  readonly extras: readonly string[];
  readonly observacoes: string;
  readonly quantidade: number;
  readonly precoUnitario: number;
  readonly saboresSelecionados?: readonly string[]; // Para pizzas multi-sabor
}

interface CarrinhoState {
  readonly itens: readonly ItemCarrinho[];
  readonly adicionarItem: (tenantId: string, item: Omit<ItemCarrinho, 'idUnico' | 'precoUnitario' | 'tenantId'>) => void;
  readonly removerItem: (idUnico: string) => void;
  readonly atualizarQuantidade: (idUnico: string, quantidade: number) => void;
  readonly esvaviarCarrinhoDoTenant: (tenantId: string) => void;
  readonly obterTotalItens: (tenantId: string) => number;
  readonly obterSubtotal: (tenantId: string) => number;
}

export const useCarrinhoStore = create<CarrinhoState>()(
  persist(
    (set, get) => ({
      itens: [] as ItemCarrinho[],

      adicionarItem: (tenantId, novoItem) => {
        const saboresSlug = novoItem.saboresSelecionados ? novoItem.saboresSelecionados.join('-') : 'unico';
        const idUnico = ${tenantId}-${novoItem.pizza.id}-${novoItem.tamanho}-${novoItem.borda}-${novoItem.extras.join('-')}-${saboresSlug};

        // Custo com base no tamanho selecionado na pizza
        let precoBaseTamanho = Number(novoItem.pizza.precoBrotinho);
        if (novoItem.tamanho === 'Média') precoBaseTamanho = Number(novoItem.pizza.precoMedia);
        if (novoItem.tamanho === 'Grande') precoBaseTamanho = Number(novoItem.pizza.precoGrande);

        const adicionalBorda = novoItem.borda !== 'Sem Borda' ? 6.50 : 0;

        // O custo unitário leva em consideração os adicionais customizados do banco de dados (que calculamos na página)
        // ou adicionamos +4.00 padrão por item se for extra livre não tabelado
        const precoUnitario = precoBaseTamanho + adicionalBorda;

        const itensAtuais = get().itens;
        const itemExistente = itensAtuais.find((item) => item.idUnico === idUnico);

        if (itemExistente) {
          set({
            itens: itensAtuais.map((item) =>
              item.idUnico === idUnico
                ? { ...item, quantidade: item.quantidade + novoItem.quantidade }
                : item
            )
          });
        } else {
          set({
            itens: [...itensAtuais, { ...novoItem, idUnico, tenantId, precoUnitario }]
          });
        }
      },

      removerItem: (idUnico) => set((state) => ({
        itens: state.itens.filter((item) => item.idUnico !== idUnico)
      })),

      atualizarQuantidade: (idUnico, quantidade) => {
        if (quantidade <= 0) {
          get().removerItem(idUnico);
          return;
        }
        set((state) => ({
          itens: state.itens.map((item) =>
            item.idUnico === idUnico ? { ...item, quantidade } : item
          )
        }));
      },

      esvaviarCarrinhoDoTenant: (tenantId) => set((state) => ({
        itens: state.itens.filter((item) => item.tenantId !== tenantId)
      })),

      obterTotalItens: (tenantId) =>
        get().itens
          .filter((item) => item.tenantId === tenantId)
          .reduce((acc, item) => acc + item.quantidade, 0),

      obterSubtotal: (tenantId) =>
        get().itens
          .filter((item) => item.tenantId === tenantId)
          .reduce((acc, item) => acc + (item.precoUnitario * item.quantidade), 0)
    }),
    {
      name: 'sua-pizzaria-saas-carrinhos'
    }
  )
);
