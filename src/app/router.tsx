import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { HomePage } from '../features/site/pages/HomePage';
import { LoginPage } from '../features/site/pages/LoginPage';
import { CadastroPage } from '../features/site/pages/CadastroPage';
import { DetalhePizzaPage } from '../features/site/pages/DetalhePizzaPage';
import { CarrinhoPage } from '../features/site/pages/CarrinhoPage';
import { CheckoutPage } from '../features/site/pages/CheckoutPage';
import { PagamentoPage } from '../features/site/pages/PagamentoPage';
import { StatusPedidoPage } from '../features/site/pages/StatusPedidoPage';
import { PerfilClientePage } from '../features/site/pages/PerfilClientePage';
import { AdminSitePage } from '../features/admin/pages/AdminSitePage';
import { BalcaoPage } from '../features/balcao/pages/BalcaoPage';
import { CozinhaPage } from '../features/cozinha/pages/CozinhaPage';
import { GarcomPage } from '../features/garcom/pages/GarcomPage';
import { MotoboyPage } from '../features/motoboy/pages/MotoboyPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '', element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'cadastro', element: <CadastroPage /> },
      { path: 'pizza/:id', element: <DetalhePizzaPage /> },
      { path: 'carrinho', element: <CarrinhoPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'pagamento', element: <PagamentoPage /> },
      { path: 'pedido/:orderId', element: <StatusPedidoPage /> },
      { path: 'perfil', element: <PerfilClientePage /> },
      { path: 'admin', element: <AdminSitePage /> },
      { path: 'balcao', element: <BalcaoPage /> },
      { path: 'cozinha', element: <CozinhaPage /> },
      { path: 'garcom', element: <GarcomPage /> },
      { path: 'motoboy', element: <MotoboyPage /> }
    ]
  }
]);
