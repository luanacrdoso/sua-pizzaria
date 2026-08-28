import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';
import { useTenantStore } from '../../../store/tenant.store';

// (login admin@pizzashop.com) senha = admin123
export function PainelSuperAdminPage() {
  const navigate = useNavigate();
  const usuarioLogado = useAuthStore((state) => state.usuarioLogado);
  const fazerLogout = useAuthStore((state) => state.fazerLogout);
  const { tenants, excluirTenant } = useTenantStore();

  if (!usuarioLogado || usuarioLogado.tipo !== 'admin') {
    return (
      <div className="auth-page-wrapper">
        <div className="auth-card-fazer-login">
          <p>Esta área é restrita à equipe da plataforma.</p>
          <Link to="/login" className="btn-auth-submit text-center">Ir para o Login</Link>
        </div>
      </div>
    );
  }

  const handleExcluirPizzaria = (id: string, nome: string) => {
    if (confirm(`Excluir a pizzaria "${nome}" da plataforma? Essa ação não pode ser desfeita.`)) {
      excluirTenant(id);
    }
  };

  return (
    <div className="portal-container">
      <header className="portal-top-bar">
        <div className="portal-logo">
          <span>🛡️</span>
          <h1>Painel da Plataforma</h1>
        </div>
        <div className="portal-top-acoes">
          <div className="user-logado-menu">
            <span>Logado como <strong>{usuarioLogado.email}</strong></span>
            <button onClick={() => navigate('/')} className="btn-perfil-portal">Voltar ao Portal</button>
            <button onClick={() => { fazerLogout(); navigate('/'); }} className="btn-sair-portal">Sair</button>
          </div>
        </div>
      </header>

      <main className="portal-catalogo">
        <div className="portal-busca-secao">
          <h3>Pizzarias Cadastradas ({tenants.length})</h3>
        </div>

        {tenants.length === 0 ? (
          <div className="portal-vazio">Nenhuma pizzaria cadastrada na plataforma no momento.</div>
        ) : (
          <div className="lista-adicionais-admin">
            {tenants.map((t) => (
              <div key={t.id} className="adicional-admin-item">
                <div>
                  <strong>{t.nome}</strong>
                  <span>{t.endereco} · dono: {t.donoEmail}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link to={`/store/${t.id}`} className="btn-link-secundario">Ver Loja</Link>
                  <Link to={`/store/${t.id}/admin`} className="btn-link-secundario">Ver Painel</Link>
                  <button onClick={() => handleExcluirPizzaria(t.id, t.nome)} className="btn-excluir">Excluir 🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
