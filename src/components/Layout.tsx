import type { CSSProperties } from 'react';
import { Outlet } from 'react-router-dom';
import { useRestauranteStore } from '../store/restaurante.store';
import { Navbar } from './Navbar';

export function Layout() {
  const config = useRestauranteStore((state) => state.config);

  const temaStyle: CSSProperties = {
    ['--color-primary' as string]: config.corPrimaria,
    ['--color-secondary' as string]: config.corSecundaria
  };

  return (
    <div className="layout-master" style={temaStyle}>
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
            <h5>Endereço</h5>
            <p>{config.endereco}</p>
          </div>
          <div>
            <h5>Funcionamento</h5>
            <p>{config.diasFuncionamento}</p>
            <p>{config.horarioFuncionamento}</p>
          </div>
        </div>
        <div className="footer-copyright">© {new Date().getFullYear()} {config.nome} — Todos os direitos reservados.</div>
      </footer>
    </div>
  );
}
