import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { PortalPage } from '../features/cardapio/pages/PortalPage';
import { LoginPage } from '../features/cardapio/pages/LoginPage';
import { CadastroUsuarioPage } from '../features/cardapio/pages/CadastroUsuarioPage';
import { CadastroPizzariaPage } from '../features/cardapio/pages/CadastroPizzariaPage';
import { PerfilCompradorPage } from '../features/cardapio/pages/PerfilCompradorPage';
import { CardapioPage } from '../features/cardapio/pages/CardapioPage';
import { DetalhePizzaPage } from '../features/cardapio/pages/DetalhePizzaPage';
import { CarrinhoPage } from '../features/cardapio/pages/CarrinhoPage';
import { CheckoutPage } from '../features/cardapio/pages/CheckoutPage';
import { PagamentoPixPage } from '../features/cardapio/pages/PagamentoPixPage';
import { StatusPedidoPage } from '../features/cardapio/pages/StatusPedidoPage';
import { AdminPage } from '../features/admin/pages/AdminPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PortalPage />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/cadastrar-usuario',
    element: <CadastroUsuarioPage />
  },
  {
    path: '/cadastrar-pizzaria',
    element: <CadastroPizzariaPage />
  },
  {
    path: '/perfil-comprador',
    element: <PerfilCompradorPage />
  },
  {
    path: '/store/:tenantId',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <CardapioPage />
      },
      {
        path: 'pizza/:id',
        element: <DetalhePizzaPage />
      },
      {
        path: 'carrinho',
        element: <CarrinhoPage />
      },
      {
        path: 'checkout',
        element: <CheckoutPage />
      },
      {
        path: 'checkout/pagamento',
        element: <PagamentoPixPage />
      },
      {
        path: 'status/:orderId',
        element: <StatusPedidoPage />
      },
      {
        path: 'admin',
        element: <AdminPage />
      }
    ]
  }
]);