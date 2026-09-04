import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Papel } from '../types';
import { useContasStore, ADMIN_SITE } from './contas.store';

interface AuthState {
  readonly usuarioLogado: { readonly papel: Papel; readonly username: string } | null;
  readonly fazerLogin: (username: string, senha: string) => 'ok' | 'senha_invalida' | 'pendente_aprovacao';
  readonly fazerLogout: () => void;
}

// Só guarda "quem está logado nesta aba". Fica em sessionStorage (por
// aba/sessão do navegador), não em localStorage — assim dá pra testar
// vários perfis ao mesmo tempo em abas diferentes (ex: cozinha numa aba,
// garçom em outra, cliente em outra) sem uma aba "deslogar" a outra.
// A lista de contas/cadastros em si mora em contas.store.ts, compartilhada
// entre todas as abas.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuarioLogado: null,

      fazerLogin: (username, senha) => {
        if (username === ADMIN_SITE.username && senha === ADMIN_SITE.senha) {
          set({ usuarioLogado: { papel: 'admin', username } });
          return 'ok';
        }

        const { credenciais, funcionarios } = useContasStore.getState();
        const conta = credenciais.find((c) => c.username === username && c.senha === senha);
        if (!conta) return 'senha_invalida';

        if (conta.papel !== 'cliente') {
          const func = funcionarios.find((f) => f.username === username);
          if (func && !func.aprovado) return 'pendente_aprovacao';
        }

        set({ usuarioLogado: { papel: conta.papel, username } });
        return 'ok';
      },

      fazerLogout: () => set({ usuarioLogado: null })
    }),
    {
      name: 'callidus-auth',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
