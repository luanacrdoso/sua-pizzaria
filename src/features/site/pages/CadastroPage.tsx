import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useContasStore } from '../../../store/contas.store';
import type { CargoFuncionario } from '../../../store/contas.store';

type TipoCadastro = 'cliente' | 'funcionario';

const CARGOS: readonly { readonly valor: CargoFuncionario; readonly rotulo: string }[] = [
  { valor: 'balcao', rotulo: 'Funcionário do Balcão' },
  { valor: 'cozinha', rotulo: 'Admin da Cozinha' },
  { valor: 'garcom', rotulo: 'Garçom' },
  { valor: 'motoboy', rotulo: 'Motoboy' }
];

export function CadastroPage() {
  const navigate = useNavigate();
  const cadastrarCliente = useContasStore((state) => state.cadastrarCliente);
  const cadastrarFuncionario = useContasStore((state) => state.cadastrarFuncionario);

  const [tipo, setTipo] = useState<TipoCadastro>('cliente');
  const [cargo, setCargo] = useState<CargoFuncionario>('balcao');

  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');

  // Endereço (só faz sentido para cliente, usado em pedidos de entrega)
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [numero, setNumero] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false);

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '');
    setCep(valor);
    if (valor.length === 8) {
      setBuscandoCep(true);
      try {
        const resposta = await fetch(`https://viacep.com.br/ws/${valor}/json/`);
        const dados = await resposta.json();
        if (!dados.erro) {
          setRua(dados.logradouro || '');
          setBairro(dados.bairro || '');
          setCidade(dados.localidade || '');
          setEstado(dados.uf || '');
        }
      } catch {
        // silencioso: usuário pode preencher manualmente
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (senha !== confirmarSenha) {
      setErro('A confirmação de senha não confere.');
      return;
    }
    if (senha.length < 4) {
      setErro('A senha precisa ter pelo menos 4 caracteres.');
      return;
    }

    if (tipo === 'cliente') {
      const resultado = cadastrarCliente(
        { username, nome, telefone, cpf: cpf || undefined, cep, rua, bairro, cidade, estado, numero },
        senha
      );
      if (resultado === 'username_em_uso') {
        setErro('Esse nome de usuário já está em uso. Escolha outro.');
        return;
      }
      navigate('/login');
    } else {
      const resultado = cadastrarFuncionario({ username, nome, telefone, cargo }, senha);
      if (resultado === 'username_em_uso') {
        setErro('Esse nome de usuário já está em uso. Escolha outro.');
        return;
      }
      setSucesso(true);
    }
  };

  if (sucesso) {
    return (
      <div className="auth-page-wrapper">
        <div className="auth-card-fazer-login">
          <h2>Cadastro enviado ✅</h2>
          <p>Seu cadastro de funcionário foi enviado. Você poderá entrar assim que o Admin do Site confirmar o seu acesso.</p>
          <Link to="/login" className="btn-auth-submit text-center">Ir para o Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-cadastro">
        <h2>Criar conta</h2>
        {erro && <div className="auth-erro">{erro}</div>}

        <div className="links-cadastro-flex">
          <button type="button" onClick={() => setTipo('cliente')} className={tipo === 'cliente' ? 'btn-categoria ativo-toggle' : 'btn-categoria'}>Sou Cliente</button>
          <button type="button" onClick={() => setTipo('funcionario')} className={tipo === 'funcionario' ? 'btn-categoria ativo-toggle' : 'btn-categoria'}>Sou Funcionário</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form split-grid">
          {tipo === 'funcionario' && (
            <div className="auth-input-group span-2">
              <label>Cargo:</label>
              <select value={cargo} onChange={(e) => setCargo(e.target.value as CargoFuncionario)}>
                {CARGOS.map((c) => <option key={c.valor} value={c.valor}>{c.rotulo}</option>)}
              </select>
            </div>
          )}

          <div className="auth-input-group">
            <label>Nome completo:</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>

          <div className="auth-input-group">
            <label>Telefone:</label>
            <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" required />
          </div>

          {tipo === 'cliente' && (
            <div className="auth-input-group">
              <label>CPF (opcional, para nota fiscal):</label>
              <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
            </div>
          )}

          <div className="auth-input-group">
            <label>Nome de usuário:</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          <div className="auth-input-group">
            <label>Senha:</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          </div>

          <div className="auth-input-group">
            <label>Confirmar senha:</label>
            <input type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required />
          </div>

          {tipo === 'cliente' && (
            <>
              <div className="auth-input-group">
                <label>CEP {buscandoCep && <span className="cep-loading">🔎 buscando...</span>}:</label>
                <input type="text" maxLength={8} value={cep} onChange={handleCepChange} placeholder="Apenas números" required />
              </div>
              <div className="auth-input-group">
                <label>Número:</label>
                <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} required />
              </div>
              <div className="auth-input-group span-2">
                <label>Rua:</label>
                <input type="text" value={rua} onChange={(e) => setRua(e.target.value)} required />
              </div>
              <div className="auth-input-group">
                <label>Bairro:</label>
                <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} required />
              </div>
              <div className="auth-input-group">
                <label>Cidade/UF:</label>
                <input type="text" value={`${cidade}${estado ? '/' + estado : ''}`} onChange={(e) => setCidade(e.target.value)} required />
              </div>
            </>
          )}

          <button type="submit" className="btn-auth-submit span-2">Criar Conta</button>
        </form>

        <div className="auth-footer-links">
          <p>Já tem conta? <Link to="/login">Entrar</Link></p>
        </div>
      </div>
    </div>
  );
}
