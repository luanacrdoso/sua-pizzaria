import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTenantStore } from '../../../store/tenant.store';
import { useAuthStore } from '../../../store/auth.store';

export function PortalPage() {
  const navigate = useNavigate();
  const tenants = useTenantStore((state) => state.tenants);
  const { usuarioLogado, compradores, donos, fazerLogout } = useAuthStore();
  
  const [pesquisa, setPesquisa] = useState('');

  const pizzariasFiltradas = tenants.filter((t) =>
    t.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
    t.descricao.toLowerCase().includes(pesquisa.toLowerCase())
  );

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

  return (
    <div className="portal-container">
      <header className="portal-top-bar">
        <div className="portal-logo">
          <span>🍕</span>
          <h1>Sua Pizzaria</h1>
        </div>
        <div className="portal-top-acoes">
          {usuarioLogado ? (
            <div className="user-logado-menu">
              <span>Olá, <strong>{obterNomeExibicao()}</strong>!</span>
              {usuarioLogado.tipo === 'comprador' ? (
                <button onClick={() => navigate('/perfil-comprador')} className="btn-perfil-portal">Meu Perfil 👤</button>
              ) : (
                <button onClick={() => {
                  const meuTenant = tenants.find((t) => t.donoEmail === usuarioLogado.email);
                  if (meuTenant) navigate(`/store/${meuTenant.id}/admin`);
                }} className="btn-perfil-portal">Painel Admin 🛠️</button>
              )}
              <button onClick={() => fazerLogout()} className="btn-sair-portal">Sair</button>
            </div>
          ) : (
            <Link to="/login" className="btn-login-header">Minha Conta 👤</Link>
          )}
        </div>
      </header>

      <section className="portal-hero">
        <div className="hero-content">
          <h2>A sua pizza favorita, a um clique de distância.</h2>
          
          <div className="portal-cta-botoes">
            <Link to="/cadastrar-pizzaria" className="btn-cta-pizzaria">Lançar Minha Pizzaria </Link>
            <Link to="/cadastrar-usuario" className="btn-cta-usuario">Criar Conta de Comprador</Link>
          </div>
        </div>
      </section>

      <main className="portal-catalogo">
        <div className="portal-busca-secao">
          <h3>Pizzarias Ativas</h3>
          <input
            type="text"
            placeholder="Buscar por nome ou descrição da pizzaria..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            className="portal-busca-input"
          />
        </div>

        {pizzariasFiltradas.length === 0 ? (
          <div className="portal-vazio">
            <p>Nenhuma pizzaria cadastrada no momento.</p>
          </div>
        ) : (
          <div className="portal-grid">
            {pizzariasFiltradas.map((pizzaria) => (
              <article key={pizzaria.id} className="portal-card">
                <div className="portal-card-img" style={{ backgroundImage: `url(${pizzaria.logotipoUrl})` }}></div>
                <div className="portal-card-info">
                  <h4>{pizzaria.nome}</h4>
                  <p className="desc">{pizzaria.descricao}</p>
                  <p className="endereco">📍 {pizzaria.endereco}</p>
                  
                  <div className="portal-card-footer">
                    <span className="taxa">🛵 R$ {pizzaria.taxaEntrega.toFixed(2)}</span>
                    <span className="tempo">⏱️ {pizzaria.tempoPreparoEstimado}</span>
                  </div>

                  <Link to={`/store/${pizzaria.id}`} className="btn-visitar" style={{ backgroundColor: pizzaria.corPrimaria }}>
                    Entrar no Cardápio ➔
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}