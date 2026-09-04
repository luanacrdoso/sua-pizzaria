import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';

const ROTA_POR_PAPEL: Record<string, string> = {
  admin: '/admin',
  balcao: '/balcao',
  cozinha: '/cozinha',
  garcom: '/garcom',
  motoboy: '/motoboy',
  cliente: '/'
};

export function LoginPage() {
  const navigate = useNavigate();
  const fazerLogin = useAuthStore((state) => state.fazerLogin);
  const usuarioLogado = useAuthStore((state) => state.usuarioLogado);

  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const resultado = fazerLogin(username.trim(), senha);

    if (resultado === 'senha_invalida') {
      setErro('Usuário ou senha incorretos.');
      return;
    }
    if (resultado === 'pendente_aprovacao') {
      setErro('Seu cadastro de funcionário ainda não foi aprovado pelo Admin do Site. Tente novamente mais tarde.');
      return;
    }

    const papel = useAuthStore.getState().usuarioLogado?.papel ?? 'cliente';
    navigate(ROTA_POR_PAPEL[papel] ?? '/');
  };

  if (usuarioLogado) {
    navigate(ROTA_POR_PAPEL[usuarioLogado.papel] ?? '/');
    return null;
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-fazer-login">
        <h2>Entrar</h2>
        {erro && <div className="auth-erro">{erro}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label>Usuário:</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
          </div>
          <div className="auth-input-group">
            <label>Senha:</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          </div>
          <button type="submit" className="btn-auth-submit">Entrar</button>
        </form>

        <div className="auth-footer-links">
          <p>Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
          <Link to="/" className="btn-voltar-home">← Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
}
