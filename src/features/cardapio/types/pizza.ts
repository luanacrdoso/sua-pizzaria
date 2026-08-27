export type CategoriaPizza = 'tradicional' | 'especial' | 'doce' | 'vegetariana';

export interface Pizza {
  readonly id: string;
  readonly nome: string;
  readonly descricao: string;
  readonly precoBase: string; 
  readonly precoBrotinho: string;
  readonly precoMedia: string;
  readonly precoGrande: string;
  readonly categoria: CategoriaPizza;
  readonly imagemUrl: string;
  readonly ingredientes: readonly string[];
  readonly tipo: 'sabor_unico' | 'personalizavel';
  readonly maxSaboresBrotinho?: number;
  readonly maxSaboresMedia?: number;
  readonly maxSaboresGrande?: number;
}
