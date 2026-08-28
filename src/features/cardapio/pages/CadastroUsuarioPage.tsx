import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';
import type { Comprador } from '../../../store/auth.store';

export function CadastroUsuarioPage() {
  const navigate = useNavigate();
  const cadastrarComprador = useAuthStore((state) => state.cadastrarComprador);

  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  
  // Endereço (autocompletados por CEP)
  const [rua, setRua] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [numero, setNumero] = useState('');
  const [pontoReferencia, setPontoReferencia] = useState('');

  // Segurança
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Feedbacks
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erro, setErro] = useState('');

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '');
    setCep(valor);

    if (valor.length === 8) {
      setBuscandoCep(true);
      setErro('');
      try {
        const resposta = await fetch(`https://viacep.com.br/ws/${valor}/json/`);
        const dados = await resposta.json();
        
        if (dados.erro) {
          setErro('CEP não encontrado. Por favor, digite os dados de endereço manualmente.');
        } else {
          setRua(dados.logradouro || '');
          setBairro(dados.bairro || '');
          setCidade(dados.localidade || '');
          setEstado(dados.uf || '');
        }
      } catch {
        setErro('Erro ao buscar CEP de forma automática. Digite o endereço manualmente.');
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmarSenha) {
      setErro('A confirmação de senha não confere.');
      return;
    }

    const novoComprador: Comprador = {
      email,
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
      fotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' // Foto padrão inicial
    };

    cadastrarComprador(novoComprador, senha);
    navigate('/login');
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-cadastro">
        <h2>Cadastrar usuário</h2>
        {erro && <div className="auth-erro">{erro}</div>}

        <form onSubmit={handleSubmit} className="auth-form split-grid">
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
            <input type="text" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(11) 99999-9999" required />
          </div>

          <div className="auth-input-group">
            <label>CEP {buscandoCep && <span className="cep-loading">🔎 buscando...</span>}:</label>
            <input type="text" maxLength={8} value={cep} onChange={handleCepChange} placeholder="Apenas números (Ex: 01001000)" required />
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
            <label>Estado (UF):</label>
            <input type="text" maxLength={2} value={estado} onChange={e => setEstado(e.target.value)} required />
          </div>

          <div className="auth-input-group span-2">
            <label>Ponto de referência (*opcional):</label>
            <input type="text" value={pontoReferencia} onChange={e => setPontoReferencia(e.target.value)} />
          </div>

          <div className="auth-input-group span-2">
            <label>Email:</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="auth-input-group">
            <label>Senha:</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
          </div>

          <div className="auth-input-group">
            <label>Confirmar Senha:</label>
            <input type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} required />
          </div>

          <button type="submit" className="btn-auth-submit span-2">Cadastrar Minha Conta</button>
        </form>

        <div className="auth-footer-links">
          <p>Já possui cadastro? <Link to="/login">Faça Login</Link></p>
          <Link to="/" className="btn-voltar-home">Cancelar e Voltar</Link>
        </div>
      </div>
    </div>
  );
}