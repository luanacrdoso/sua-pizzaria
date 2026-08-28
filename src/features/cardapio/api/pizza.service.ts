import type { Pizza } from '../types/pizza';

const PIZZAS_MOCK: readonly Pizza[] = [
  {
    id: "1",
    nome: "Margherita Especial",
    descricao: "Molho de tomate artesanal, muçarela de búfala, manjericão fresco picado e um fio de azeite de oliva extra virgem.",
    precoBase: "42.90",
    precoBrotinho: "42.90",
    precoMedia: "50.90",
    precoGrande: "57.90",
    categoria: "tradicional",
    imagemUrl: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&auto=format&fit=crop&q=80",
    ingredientes: ["Molho de Tomate", "Muçarela de Búfala", "Manjericão", "Azeite"],
    tipo: "sabor_unico"
  },
  {
    id: "2",
    nome: "Calabresa Premium",
    descricao: "Muçarela artesanal, calabresa defumada selecionada cortada fininha e cebola roxa marinada em orégano.",
    precoBase: "45.90",
    precoBrotinho: "45.90",
    precoMedia: "53.90",
    precoGrande: "60.90",
    categoria: "tradicional",
    imagemUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&auto=format&fit=crop&q=80",
    ingredientes: ["Muçarela", "Calabresa", "Cebola Roxa", "Orégano"],
    tipo: "sabor_unico"
  },
  {
    id: "3",
    nome: "Quatro Queijos Suprema",
    descricao: "Fusão cremosa e equilibrada de muçarela, provolone defumado, gorgonzola Dolce e catupiry original.",
    precoBase: "49.90",
    precoBrotinho: "49.90",
    precoMedia: "57.90",
    precoGrande: "64.90",
    categoria: "especial",
    imagemUrl: "https://images.unsplash.com/photo-1573821663912-569905455b1c?w=400&auto=format&fit=crop&q=80",
    ingredientes: ["Muçarela", "Provolone", "Gorgonzola", "Catupiry"],
    tipo: "sabor_unico"
  },
  {
    id: "4",
    nome: "Shimeji com Alho Poró",
    descricao: "Combinação gourmet de cogumelos shimeji salteados na manteiga de ervas, alho-poró crocante e cream cheese.",
    precoBase: "54.90",
    precoBrotinho: "54.90",
    precoMedia: "62.90",
    precoGrande: "69.90",
    categoria: "vegetariana",
    imagemUrl: "https://images.unsplash.com/photo-1571066811602-71683a3f680d?w=400&auto=format&fit=crop&q=80",
    ingredientes: ["Shimeji", "Alho-poró", "Cream Cheese", "Muçarela"],
    tipo: "sabor_unico"
  },
  {
    id: "5",
    nome: "Sensação Belga",
    descricao: "Base doce com chocolate belga meio amargo coberto com fatias finas de morangos e raspas de chocolate branco.",
    precoBase: "48.90",
    precoBrotinho: "48.90",
    precoMedia: "56.90",
    precoGrande: "63.90",
    categoria: "doce",
    imagemUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop&q=80",
    ingredientes: ["Chocolate Belga", "Morangos", "Chocolate Branco"],
    tipo: "sabor_unico"
  },
  {
    id: "pizza-personalizavel",
    nome: "Pizza de Dois ou Mais Sabores 🎨",
    descricao: "Monte sua pizza combinando os sabores disponíveis! Escolha até 3 sabores dependendo do tamanho.",
    precoBase: "35.00",
    precoBrotinho: "35.00",
    precoMedia: "45.00",
    precoGrande: "55.00",
    categoria: "especial",
    imagemUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80",
    ingredientes: ["Escolha seus sabores favoritos!"],
    tipo: "personalizavel",
    maxSaboresBrotinho: 1,
    maxSaboresMedia: 2,
    maxSaboresGrande: 3
  }
];

export const pizzaService = {
  async listarTodas(tenantId: string): Promise<readonly Pizza[]> {
    try {
      const salvoLocal = localStorage.getItem(`pizzashop-catalogo-${tenantId}`);
      if (salvoLocal) {
        return JSON.parse(salvoLocal) as readonly Pizza[];
      }
      return PIZZAS_MOCK;
    } catch {
      return PIZZAS_MOCK;
    }
  },

  salvarCardapioLocal(tenantId: string, catalogo: readonly Pizza[]): void {
    localStorage.setItem(`pizzashop-catalogo-${tenantId}`, JSON.stringify(catalogo));
  }
};