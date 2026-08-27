import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdicionalConfig {
  readonly id: string;
  readonly nome: string;
  readonly preco: number;
}

export interface TenantConfig {
  readonly id: string; // Ex: 'bella-pizza', 'luigi-pizzaria'
  readonly nome: string;
  readonly logotipoUrl: string;
  readonly corPrimaria: string;
  readonly corSecundaria: string;
  readonly taxaEntrega: number;
  readonly tempoPreparoEstimado: string;
  readonly formasPagamentoAceitas: readonly string[];
  readonly endereco: string;
  readonly horarioFuncionamento: string;
  readonly diasFuncionamento: string; // Ex: "Terça a Domingo"
  readonly descricao: string;
  readonly donoEmail: string;
  readonly chavePix?: string;
  readonly adicionaisDisponiveis: readonly AdicionalConfig[];
  readonly telefone: string; // CORREÇÃO: adicionando telefone!
}

interface TenantState {
  readonly tenants: readonly TenantConfig[];
  readonly cadastrarTenant: (novo: TenantConfig) => void;
  readonly atualizarTenantConfig: (id: string, novasConfigs: Partial<TenantConfig>) => void;
  readonly excluirTenant: (id: string) => void;
  readonly redefinirPadrao: () => void;
}

export const ADICIONAIS_PADRAO: readonly AdicionalConfig[] = [
  { id: '1', nome: 'Bacon', preco: 4.50 },
  { id: '2', nome: 'Queijo Extra', preco: 6.00 },
  { id: '3', nome: 'Cebola Crispy', preco: 4.00 },
  { id: '4', nome: 'Alho Frito', preco: 3.50 },
  { id: '5', nome: 'Tomate Cereja', preco: 4.00 }
];

const TENANTS_PADRAO: readonly TenantConfig[] = [
  {
    id: "callidus-pizzas",
    nome: "Callidus Pizzas",
    logotipoUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&auto=format&fit=crop&q=80",
    corPrimaria: "#ef4444",
    corSecundaria: "#f59e0b",
    taxaEntrega: 7.50,
    tempoPreparoEstimado: "30-40 min",
    formasPagamentoAceitas: ["Cartão de Crédito", "Pix", "Dinheiro"],
    endereco: "Av. do E-Commerce, 100 - Silicon Valley",
    horarioFuncionamento: "18:00 às 23:30",
    diasFuncionamento: "Terça a Domingo",
    descricao: "Massa de fermentação lenta com ingredientes frescos selecionados.",
    donoEmail: "admin@pizzashop.com",
    chavePix: "suachavepix@email.com",
    adicionaisDisponiveis: ADICIONAIS_PADRAO,
    telefone: "(11) 99999-9999"
  }
];

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      tenants: TENANTS_PADRAO,
      cadastrarTenant: (novo) =>
        set((state) => ({
          tenants: [...state.tenants, novo]
        })),
      atualizarTenantConfig: (id, novasConfigs) =>
        set((state) => ({
          tenants: state.tenants.map((t) =>
            t.id === id ? { ...t, ...novasConfigs } : t
          )
        })),
      excluirTenant: (id) =>
        set((state) => ({
          tenants: state.tenants.filter((t) => t.id !== id)
        })),
      redefinirPadrao: () => set({ tenants: TENANTS_PADRAO })
    }),
    {
      name: 'sua-pizzaria-saas-tenants',
      // Versão 2: campo "telefone" passou a ser obrigatório no TenantConfig.
      // Sem essa migração, quem já tinha dados salvos de uma versão anterior
      // (sem telefone) recebia undefined e a tela de status quebrava ao
      // chamar .replace() nesse valor.
      version: 2,
      migrate: (persistedState, versionPersistida) => {
        const estado = persistedState as TenantState;
        if (versionPersistida < 2 && estado?.tenants) {
          return {
            ...estado,
            tenants: estado.tenants.map((t) => ({
              ...t,
              telefone: t.telefone ?? ''
            }))
          };
        }
        return estado;
      }
    }
  )
);
