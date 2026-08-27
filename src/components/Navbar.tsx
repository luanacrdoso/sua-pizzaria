import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTenantStore } from '../store/tenant.store';
import { useCarrinhoStore } from '../store/carrinho.store';
import { useAuthStore } from '../store/auth.store';

export function Navbar() {
  const { tenantId } = useParams<{ readonly tenantId: string }>();
  const navigate = useNavigate();

  const config = useTenantStore((state) => state.tenants.find((t) => t.id === tenantId));
  const totalItens = useCarrinhoStore((state) => state.obterTotalItens(tenantId || ''));
  const { usuarioLogado, compradores, donos, fazerLogout } = useAuthStore();

  if (!config) return null;

  // Recupera o nome de batismo do usuário logado
  const obterNomeExibicao = () => {
    if (!usuarioLogado) return '';
    if (usuarioLogado.tipo === 'comprador') {
      const comp = compradores.find(c => c.email === usuarioLogado.email);
      return comp ? comp.nome : usuarioLogado.email.split('@')[0];
    } else {
      const dono = donos.find(d => d.email === usuarioLogado.email);
      return dono ? dono.nomeDono : usuarioLogado.email.split('@')[0];
    }
  };

  const obterFotoPerfil = () => {
    if (usuarioLogado?.tipo === 'comprador') {
      const comp = compradores.find(c => c.email === usuarioLogado.email);
      return comp?.fotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
    }
    return config.logotipoUrl;
  };

  const eDonoDaLoja = usuarioLogado?.tipo === 'pizzaria' && config.donoEmail === usuarioLogado.email;

  return (
    <header className="loja-navbar">
      <div className="loja-nav-brand" onClick={() => navigate(`/store/${config.id}`)} style={{ cursor: 'pointer' }}>
        <img src={config.logotipoUrl} alt={config.nome} className="loja-logo-img" />
        <span className="loja-nav-name">{config.nome}</span>
      </div>

      <nav className="loja-nav-links">
        {/* Link administrativo restrito e discreto para o dono */}
        {eDonoDaLoja && (
          <Link to={`/store/${config.id}/admin`} className="loja-link-item-admin">🛠️ Gerenciar Loja</Link>
        )}

        {usuarioLogado ? (
          <div className="loja-usuario-logado-drop">
            <img src={obterFotoPerfil()} alt="Perfil" className="avatar-pequeno-nav" onClick={() => usuarioLogado.tipo === 'comprador' && navigate('/perfil-comprador')} style={{ cursor: 'pointer' }} />
            <span className="user-email-nav">
              Olá, <strong>{obterNomeExibicao()}</strong>!
            </span>
            <button onClick={() => { fazerLogout(); navigate('/'); }} className="btn-sair-nav">Sair</button>
          </div>
        ) : (
          <Link to="/login" className="loja-link-item btn-login-nav">Entrar / Cadastrar 👤</Link>
        )}

        <Link to={`/store/${config.id}/carrinho`} className="btn-carrinho-nav" style={{ backgroundColor: config.corPrimaria }}>
          🛒 Carrinho {totalItens > 0 && <span className="badge-carrinho">{totalItens}</span>}
        </Link>
      </nav>
    </header>
  );
}