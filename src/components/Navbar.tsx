import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useRestauranteStore } from '../store/restaurante.store';
import { useCarrinhoStore } from '../store/carrinho.store';
import { useAuthStore } from '../store/auth.store';

const PAINEL_POR_PAPEL: Record<string, { readonly rota: string; readonly rotulo: string }> = {
  admin: { rota: '/admin', rotulo: '🛠️ Painel Admin' },
  balcao: { rota: '/balcao', rotulo: '🧾 Balcão' },
  cozinha: { rota: '/cozinha', rotulo: '🍕 Cozinha' },
  garcom: { rota: '/garcom', rotulo: '🧑‍🍳 Garçom' },
  motoboy: { rota: '/motoboy', rotulo: '🛵 Motoboy' }
};

export function Navbar() {
  const config = useRestauranteStore((state) => state.config);
  const navigate = useNavigate();
  const location = useLocation();
  const totalItens = useCarrinhoStore((state) => state.obterTotalItens());
  const usuarioLogado = useAuthStore((state) => state.usuarioLogado);
  const fazerLogout = useAuthStore((state) => state.fazerLogout);

  const painel = usuarioLogado ? PAINEL_POR_PAPEL[usuarioLogado.papel] : undefined;
  const jaEstaNoProprioPainel = painel && location.pathname.startsWith(painel.rota);

  const handleSair = () => {
    fazerLogout();
    navigate('/');
  };

  return (
    <header className="loja-navbar">
      <div className="loja-nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img src={config.logoUrl} alt={config.nome} className="loja-logo-img" />
        <span className="loja-nav-name">{config.nome}</span>
      </div>

      <nav className="loja-nav-links">
        {painel && !jaEstaNoProprioPainel && (
          <Link to={painel.rota} className="loja-link-item-admin">{painel.rotulo}</Link>
        )}

        {!usuarioLogado && (
          <>
            <Link to="/login" className="loja-link-item">Entrar</Link>
            <Link to="/cadastro" className="btn-login-nav">Cadastre-se</Link>
          </>
        )}

        {usuarioLogado?.papel === 'cliente' && (
          <>
            <Link to="/perfil" className="loja-link-item">Meu Perfil</Link>
            <Link to="/carrinho" className="btn-carrinho-nav">
              🛒 Carrinho {totalItens > 0 && <span className="badge-carrinho">{totalItens}</span>}
            </Link>
          </>
        )}

        {usuarioLogado && (
          <div className="loja-usuario-logado-drop">
            <span className="user-email-nav">{usuarioLogado.username}</span>
            <button onClick={handleSair} className="btn-sair-nav">Sair</button>
          </div>
        )}
      </nav>
    </header>
  );
}
