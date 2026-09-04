// Tipos compartilhados do domínio. Centralizados aqui porque agora são
// usados por várias stores diferentes (cardápio, pedidos, mesas, auth).

export type Papel = 'admin' | 'balcao' | 'cliente' | 'cozinha' | 'garcom' | 'motoboy';

export type CategoriaPizza = 'tradicional' | 'especial' | 'vegetariana' | 'doce' | 'bebida' | 'combo';

export type Tamanho = 'Brotinho' | 'Média' | 'Grande' | 'Único';

export interface Adicional {
  readonly id: string;
  readonly nome: string;
  readonly preco: number;
}

export interface Pizza {
  readonly id: string;
  readonly nome: string;
  readonly descricao: string;
  readonly categoria: CategoriaPizza;
  readonly imagemUrl: string;
  readonly precoBrotinho: string;
  readonly precoMedia: string;
  readonly precoGrande: string;
  readonly tipo: 'sabor_unico' | 'personalizavel';
  // Para pizzas personalizáveis: quais sabores (ids de pizzas "sabor_unico")
  // o admin/cozinha liberou para o cliente escolher nessa pizza montada.
  readonly saboresPermitidosIds?: readonly string[];
  readonly maxSaboresBrotinho?: number;
  readonly maxSaboresMedia?: number;
  readonly maxSaboresGrande?: number;
}

// Checkpoints únicos do pedido, na ordem em que acontecem. O rótulo exibido
// no passo "entregue" muda conforme o tipo (Servido / Entregue), mas é o
// mesmo valor internamente — ver ROTULO_ENTREGUE em StatusPedidoPage.
export type StatusPedido = 'recebido' | 'preparo' | 'pronto' | 'entregue' | 'finalizado';

export type TipoPedido = 'entrega' | 'presencial' | 'retirada';

export interface ItemPedido {
  readonly id: string;
  readonly pizzaId: string;
  readonly nome: string;
  readonly imagemUrl: string;
  readonly tamanho: Tamanho;
  readonly extras: readonly string[];
  readonly saboresSelecionados?: readonly string[];
  readonly observacoes: string;
  readonly quantidade: number;
  readonly precoUnitario: number;
  // Marcado pelo garçom quando o item já foi levado à mesa. Só faz sentido
  // para comandas presenciais, mas existe no tipo geral para simplificar.
  readonly servido: boolean;
}

export interface Gorjeta {
  readonly percentual: number;
  readonly valor: number;
  readonly garcomUsername: string;
  readonly confirmadaPeloGarcom: boolean;
}

export interface Pedido {
  readonly id: string;
  readonly tipo: TipoPedido;
  readonly clienteUsername: string;
  readonly clienteNome: string;
  readonly clienteTelefone: string;
  readonly itens: readonly ItemPedido[];
  readonly subtotal: number;
  readonly taxaEntrega: number;
  readonly total: number;
  readonly formaPagamento: string;
  readonly cpfNota?: string;
  readonly enderecoEntrega?: string;
  readonly mesaId?: string;
  readonly gorjeta?: Gorjeta;
  readonly status: StatusPedido;
  readonly motoboyUsername?: string;
  readonly clienteConfirmouEntrega?: boolean;
  readonly avaliacaoEstrelas?: number;
  readonly avaliacaoComentario?: string;
  readonly criadoEm: number;
}

export interface Mesa {
  readonly id: string;
  readonly numero: number;
  readonly capacidade: number;
  readonly status: 'livre' | 'ocupada';
  readonly garcomResponsavelUsername?: string;
}

export interface Chamado {
  readonly id: string;
  readonly origem: 'cliente' | 'cozinha';
  readonly mesaId?: string;
  readonly mensagem: string;
  readonly atendido: boolean;
  readonly criadoEm: number;
}
