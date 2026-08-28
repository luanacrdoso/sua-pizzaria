import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';
import { useTenantStore } from '../../../store/tenant.store';

export function LoginPage() {
  const navigate = useNavigate();
  const fazerLogin = useAuthStore((state) => state.fazerLogin);
  const tenants = useTenantStore((state) => state.tenants);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mensagemRecuperacao, setMensagemRecuperacao] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      setErro('Por favor, digite seu e-mail e senha.');
      return;
    }

    const tipo = fazerLogin(email, senha);

    if (tipo === 'comprador') {
      navigate('/');
    } else if (tipo === 'pizzaria') {
      const meuTenant = tenants.find((t) => t.donoEmail === email);
      if (meuTenant) {
        navigate(`/store/${meuTenant.id}/admin`);
      } else {
        navigate('/');
      }
    } else if (tipo === 'admin') {
      navigate('/admin-plataforma');
    } else {
      setErro('E-mail ou senha incorretos. Verifique suas credenciais.');
    }
  };

  const handleEsqueciSenha = () => {
    if (!email) {
      setErro('Digite seu e-mail no campo acima para recuperar a senha.');
      return;
    }
    setErro('');
    setMensagemRecuperacao(`Um link de recuperação de senha foi enviado com sucesso para: ${email}`);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-fazer-login">
        <h2>Login</h2>

        {erro && <div className="auth-erro">{erro}</div>}
        {mensagemRecuperacao && <div className="auth-sucesso">{mensagemRecuperacao}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-input-group">
            <label htmlFor="login-email">Email:</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              required
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="login-senha">Senha:</label>
            <input
              id="login-senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>

          <button type="submit" className="btn-auth-submit">Entrar</button>
        </form>

        <button onClick={handleEsqueciSenha} className="btn-esqueci-senha">
          Esqueci minha senha
        </button>

        <div className="auth-footer-links">
          <p>Não tem conta? Cadastre-se como:</p>
          <div className="links-cadastro-flex">
            <Link to="/cadastrar-usuario" className="btn-link-secundario">Comprador 🛒</Link>
            <Link to="/cadastrar-pizzaria" className="btn-link-secundario">Pizzaria 🍕</Link>
          </div>
          <Link to="/" className="btn-voltar-home">Voltar ao Portal</Link>
        </div>
      </div>
    </div>
  );
}