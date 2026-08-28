import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';

export function PerfilCompradorPage() {
  const navigate = useNavigate();
  const { usuarioLogado, compradores, atualizarComprador, excluirContaComprador, fazerLogout } = useAuthStore();

  const dadosComprador = compradores.find(c => c.email === usuarioLogado?.email);

  // IMPORTANTE: todos os Hooks precisam ser chamados sempre, na mesma ordem,
  // em TODO render — nunca depois de um `return` condicional. Por isso os
  // estados abaixo usam valores de fallback e são chamados antes do guard
  // de "não está logado".
  const [nome, setNome] = useState(dadosComprador?.nome ?? '');
  const [sobrenome, setSobrenome] = useState(dadosComprador?.sobrenome ?? '');
  const [telefone, setTelefone] = useState(dadosComprador?.telefone ?? '');
  const [cep, setCep] = useState(dadosComprador?.cep ?? '');
  const [rua, setRua] = useState(dadosComprador?.rua ?? '');
  const [bairro, setBairro] = useState(dadosComprador?.bairro ?? '');
  const [cidade, setCidade] = useState(dadosComprador?.cidade ?? '');
  const [estado, setEstado] = useState(dadosComprador?.estado ?? '');
  const [numero, setNumero] = useState(dadosComprador?.numero ?? '');
  const [pontoReferencia, setPontoReferencia] = useState(dadosComprador?.pontoReferencia || '');
  const [fotoUrl, setFotoUrl] = useState(dadosComprador?.fotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');

  const [sucesso, setSucesso] = useState(false);

  if (!usuarioLogado || !dadosComprador) {
    return (
      <div className="auth-page-wrapper">
        <div className="auth-card-fazer-login">
          <p>Você precisa estar logado como comprador para ver este painel.</p>
          <Link to="/login" className="btn-auth-submit text-center">Ir para o Login</Link>
        </div>
      </div>
    );
  }

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    atualizarComprador(usuarioLogado.email, {
      nome,
      sobrenome,
      telefone,
      cep,
      rua,
      bairro,
      cidade,
      estado,
      numero,
      pontoReferencia,
      fotoUrl
    });
    setSucesso(true);
    setTimeout(() => setSucesso(false), 2000);
  };

  const handleDeletarConta = () => {
    if (confirm('Atenção: sua conta será apagada de forma irreversível. Deseja prosseguir?')) {
      excluirContaComprador(usuarioLogado.email);
      navigate('/');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-cadastro max-w-700">
        <div className="perfil-header-flex">
          <div className="perfil-avatar-preview">
            <img src={fotoUrl} alt="Visualização do Perfil" className="avatar-preview-redondo" />
            <div>
              <h2>Meu Perfil</h2>
              <p className="subtext">Gerencie sua conta e endereço de entrega.</p>
            </div>
          </div>
          <div className="botoes-perfil-top">
            <button onClick={() => { fazerLogout(); navigate('/'); }} className="btn-sair-conta">Sair da Conta 🚪</button>
            <button onClick={handleDeletarConta} className="btn-deletar-conta">Excluir Conta 🗑️</button>
          </div>
        </div>

        {sucesso && <div className="auth-sucesso">✓ Perfil atualizado com sucesso!</div>}

        <form onSubmit={handleSalvar} className="auth-form split-grid">
          <div className="auth-input-group span-2">
            <label>Link da Foto de Perfil (URL):</label>
            <input type="text" value={fotoUrl} onChange={e => setFotoUrl(e.target.value)} placeholder="Cole o link de uma imagem" required />
          </div>

          <div className="auth-input-group">
            <label>Nome:</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
          </div>

          <div className="auth-input-group">
            <label>Sobrenome:</label>
            <input type="text" value={sobrenome} onChange={e => setSobrenome(e.target.value)} required />
          </div>

          <div className="auth-input-group">
            <label>Telefone:</label>
            <input type="text" value={telefone} onChange={e => setTelefone(e.target.value)} required />
          </div>

          <div className="auth-input-group">
            <label>CEP:</label>
            <input type="text" value={cep} onChange={e => setCep(e.target.value)} required />
          </div>

          <div className="auth-input-group span-2">
            <label>Rua:</label>
            <input type="text" value={rua} onChange={e => setRua(e.target.value)} required />
          </div>

          <div className="auth-input-group">
            <label>Bairro:</label>
            <input type="text" value={bairro} onChange={e => setBairro(e.target.value)} required />
          </div>

          <div className="auth-input-group">
            <label>Número:</label>
            <input type="text" value={numero} onChange={e => setNumero(e.target.value)} required />
          </div>

          <div className="auth-input-group">
            <label>Cidade:</label>
            <input type="text" value={cidade} onChange={e => setCidade(e.target.value)} required />
          </div>

          <div className="auth-input-group">
            <label>Estado:</label>
            <input type="text" maxLength={2} value={estado} onChange={e => setEstado(e.target.value)} required />
          </div>

          <div className="auth-input-group span-2">
            <label>Ponto de referência:</label>
            <input type="text" value={pontoReferencia} onChange={e => setPontoReferencia(e.target.value)} />
          </div>

          <button type="submit" className="btn-auth-submit span-2">Salvar Alterações</button>
        </form>

        <div className="auth-footer-links">
          <Link to="/" className="btn-voltar-home">Voltar ao Portal</Link>
        </div>
      </div>
    </div>
  );
}