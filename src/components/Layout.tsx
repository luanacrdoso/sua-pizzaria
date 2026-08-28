import { Outlet, useParams } from 'react-router-dom';
import { useTenantStore } from '../store/tenant.store';
import { Navbar } from './Navbar';

export function Layout() {
  const { tenantId } = useParams<{ readonly tenantId: string }>();
  const config = useTenantStore((state) => state.tenants.find((t) => t.id === tenantId));

  if (!config) {
    return (
      <div className="status-container erro">
        <p>Pizzaria não cadastrada na plataforma.</p>
      </div>
    );
  }

  const styleVariables = {
    '--color-primary': config.corPrimaria,
    '--color-secondary': config.corSecundaria,
  } as React.CSSProperties;

  return (
    <div className="layout-master" style={styleVariables}>
      <Navbar />
      <main className="layout-content">
        <Outlet />
      </main>
      <footer className="loja-footer">
        <div className="footer-cols">
          <div>
            <h5>{config.nome}</h5>
            <p>{config.descricao}</p>
          </div>
          <div>
            <h5>Horário e Atendimento</h5>
            <p>{config.diasFuncionamento}, das {config.horarioFuncionamento}</p>
          </div>
          <div>
            <h5>Endereço da Pizzaria</h5>
            <p>{config.endereco}</p>
          </div>
        </div>
        <div className="footer-copyright">
          © {new Date().getFullYear()} {config.nome} - Todos os direitos reservados. White-Label SaaS.
        </div>
      </footer>
    </div>
  );
}