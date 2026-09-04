import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ItemPedido, Pedido, StatusPedido } from '../types';
import { useRestauranteStore } from './restaurante.store';

interface PedidosState {
  readonly pedidos: readonly Pedido[];
  readonly criarPedido: (pedido: Pedido) => void;
  readonly atualizarStatus: (pedidoId: string, status: StatusPedido) => void;
  // Adiciona a gorjeta de 10% a uma comanda que ainda não tinha.
  readonly definirGorjeta: (pedidoId: string, garcomUsername: string) => void;
  readonly confirmarGorjeta: (pedidoId: string) => void;
  // Motoboy assume a responsabilidade da entrega,
  // sem necessariamente mudar o status ainda.
  readonly assumirEntrega: (pedidoId: string, motoboyUsername: string) => void;
  readonly confirmarEntregaCliente: (pedidoId: string) => void;
  readonly avaliarPedido: (pedidoId: string, estrelas: number, comentario: string) => void;
  // Comanda: adicionar mais itens a um pedido presencial já existente,
  // enquanto ele não estiver finalizado.
  readonly adicionarItensAoPedido: (pedidoId: string, novosItens: readonly ItemPedido[]) => void;
  readonly marcarItemServido: (pedidoId: string, itemId: string, servido: boolean) => void;
  // Fecha a comanda/pedido como paga.
  readonly finalizarPedido: (pedidoId: string) => void;
}

export const usePedidosStore = create<PedidosState>()(
  persist(
    (set, get) => ({
      pedidos: [],

      criarPedido: (pedido) => set((state) => ({ pedidos: [...state.pedidos, pedido] })),

      atualizarStatus: (pedidoId, status) =>
        set((state) => ({
          pedidos: state.pedidos.map((p) => (p.id === pedidoId ? { ...p, status } : p))
        })),

      definirGorjeta: (pedidoId, garcomUsername) =>
        set((state) => ({
          pedidos: state.pedidos.map((p) =>
            p.id === pedidoId && !p.gorjeta
              ? { ...p, gorjeta: { percentual: 10, valor: p.subtotal * 0.10, garcomUsername, confirmadaPeloGarcom: false } }
              : p
          )
        })),

      // A gorjeta de 10% (pedidos presenciais) só entra na conta de ganhos
      // do garçom depois que ele mesmo confirma que recebeu, evitando que o
      // cliente marque a opção e o valor já contar como "garantido" antes
      // da confirmação humana.
      confirmarGorjeta: (pedidoId) =>
        set((state) => ({
          pedidos: state.pedidos.map((p) =>
            p.id === pedidoId && p.gorjeta ? { ...p, gorjeta: { ...p.gorjeta, confirmadaPeloGarcom: true } } : p
          )
        })),

      assumirEntrega: (pedidoId, motoboyUsername) =>
        set((state) => ({
          pedidos: state.pedidos.map((p) => (p.id === pedidoId ? { ...p, motoboyUsername } : p))
        })),

      confirmarEntregaCliente: (pedidoId) =>
        set((state) => ({
          pedidos: state.pedidos.map((p) =>
            p.id === pedidoId ? { ...p, clienteConfirmouEntrega: true, status: 'entregue' } : p
          )
        })),

      avaliarPedido: (pedidoId, estrelas, comentario) =>
        set((state) => ({
          pedidos: state.pedidos.map((p) =>
            p.id === pedidoId ? { ...p, avaliacaoEstrelas: estrelas, avaliacaoComentario: comentario } : p
          )
        })),

      adicionarItensAoPedido: (pedidoId, novosItens) =>
        set((state) => ({
          pedidos: state.pedidos.map((p) => {
            if (p.id !== pedidoId) return p;
            const itens = [...p.itens, ...novosItens];
            const subtotal = itens.reduce((acc, i) => acc + i.precoUnitario * i.quantidade, 0);
            return { ...p, itens, subtotal, total: subtotal + p.taxaEntrega };
          })
        })),

      marcarItemServido: (pedidoId, itemId, servido) =>
        set((state) => ({
          pedidos: state.pedidos.map((p) =>
            p.id === pedidoId
              ? { ...p, itens: p.itens.map((i) => (i.id === itemId ? { ...i, servido } : i)) }
              : p
          )
        })),

      finalizarPedido: (pedidoId) => {
        set((state) => ({
          pedidos: state.pedidos.map((p) => (p.id === pedidoId ? { ...p, status: 'finalizado' } : p))
        }));
        // Comanda fechada e paga: a mesa volta a ficar livre para outro
        // cliente, sem precisar o garçom liberar manualmente.
        const pedido = get().pedidos.find((p) => p.id === pedidoId);
        if (pedido?.mesaId) {
          useRestauranteStore.getState().liberarMesa(pedido.mesaId);
        }
      }
    }),
    { name: 'callidus-pedidos' }
  )
);
