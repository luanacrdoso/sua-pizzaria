import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './App.css';
import App from './App.tsx';
import { ativarSincronizacaoEntreAbas } from './store/crossTabSync';
import { useRestauranteStore } from './store/restaurante.store';
import { useCardapioStore } from './store/cardapio.store';
import { usePedidosStore } from './store/pedidos.store';
import { useChamadosStore } from './store/chamados.store';
import { useContasStore } from './store/contas.store';

ativarSincronizacaoEntreAbas([useRestauranteStore, useCardapioStore, usePedidosStore, useChamadosStore, useContasStore]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
