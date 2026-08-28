import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';
import { useTenantStore } from '../../../store/tenant.store';
import type { DonoPizzaria } from '../../../store/auth.store';
import type { TenantConfig } from '../../../store/tenant.store';

export function CadastroPizzariaPage() {

  const navigate = useNavigate();
  const cadastrarDono = useAuthStore((state) => state.cadastrarDono);
  const cadastrarTenant = useTenantStore((state) => state.cadastrarTenant);

  // Campos cadastrais
  const [nomeDono, setNomeDono] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [nomePizzaria, setNomePizzaria] = useState('');
  const [descricao, setDescricao] = useState('');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100');
  const [corPrimaria, setCorPrimaria] = useState('#ef4444');
  const [corSecundaria, setCorSecundaria] = useState('#f59e0b');

  // CEP & Endereço
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [numero, setNumero] = useState('');

  // Contato e Login
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erro, setErro] = useState('');

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
        console.error('ViaCEP offline.');
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeDono || !cnpj || !nomePizzaria || !email || !senha) {
      setErro('Por favor preencha todos os dados obrigatórios.');
      return;
    }

    const enderecoCompleto = `${rua}, ${numero} - ${bairro}, ${cidade}/${estado}`;

    // 1. Cadastra o Dono no banco de login
    const novoDono: DonoPizzaria = {
      email,
      nomeDono,
      cnpj,
      nomePizzaria,
      descricao,
      corPrimaria,
      corSecundaria,
      telefone,
      cep,
      rua,
      bairro,
      cidade,
      estado,
      numero,
      logoUrl
    };
    cadastrarDono(novoDono, senha);

    // 2. Cadastra a Pizzaria na Store de Rotas (Tenant)
    const slug = nomePizzaria.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const novoTenant: TenantConfig = {
      id: slug,
      nome: nomePizzaria,
      logotipoUrl: logoUrl,
      corPrimaria,
      corSecundaria,
      taxaEntrega: 6.00,
      tempoPreparoEstimado: '30-45 min',
      formasPagamentoAceitas: ['Pix', 'Cartão de Crédito'],
      endereco: enderecoCompleto,
      horarioFuncionamento: '18h às 23h30',
      diasFuncionamento: 'Terça a Domingo', // Suporte total aos dias de funcionamento
      descricao,
      donoEmail: email,
      chavePix: email,
      telefone, // Salva o telefone no tenant para contato direto do cliente
      adicionaisDisponiveis: [] // Inicia sem opcionais específicos (customizados via painel)
    };
    cadastrarTenant(novoTenant);

    navigate('/login');
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-cadastro max-w-700">
        <h2>Cadastrar pizzaria</h2>
        {erro && <div className="auth-erro">{erro}</div>}

        <form onSubmit={handleSubmit} className="auth-form split-grid">
          <div className="auth-input-group">
            <label>Nome do Dono:</label>
            <input type="text" value={nomeDono} onChange={e => setNomeDono(e.target.value)} required />
          </div>

          <div className="auth-input-group">
            <label>CNPJ da Pizzaria:</label>
            <input type="text" value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" required />
          </div>

          <div className="auth-input-group span-2">
            <label>Nome Comercial da Pizzaria:</label>
            <input type="text" value={nomePizzaria} onChange={e => setNomePizzaria(e.target.value)} placeholder="Ex: Forno Di Napoli" required />
          </div>

          <div className="auth-input-group span-2">
            <label>Descrição do Estabelecimento:</label>
            <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Pizzas artesanais italianas..." required />
          </div>

          <div className="auth-input-group span-2">
            <label>Logo (Imagem URL):</label>
            <input type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} required />
          </div>

          <div className="auth-input-group">
            <label>Cor Primária:</label>
            <input type="color" value={corPrimaria} onChange={e => setCorPrimaria(e.target.value)} />
          </div>

          <div className="auth-input-group">
            <label>Cor Secundária:</label>
            <input type="color" value={corSecundaria} onChange={e => setCorSecundaria(e.target.value)} />
          </div>

          <div className="auth-input-group">
            <label>CEP {buscandoCep && '🔎'}:</label>
            <input type="text" maxLength={8} value={cep} onChange={handleCepChange} required />
          </div>

          <div className="auth-input-group span-2">
            <label>Rua:</label>
            <input type="text" value={rua} onChange={e => setRua(e.target.value)} required />
          </div>

          <div className="auth-input-group">
            <label>Número:</label>
            <input type="text" value={numero} onChange={e => setNumero(e.target.value)} required />
          </div>

          <div className="auth-input-group">
            <label>Telefone de Contato:</label>
            <input type="text" value={telefone} onChange={e => setTelefone(e.target.value)} required />
          </div>

          <div className="auth-input-group span-2">
            <label>Email de Contato (Login):</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="auth-input-group span-2">
            <label>Senha:</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
          </div>

          <button type="submit" className="btn-auth-submit span-2">Lançar Pizzaria SaaS 🍕</button>
        </form>

        <div className="auth-footer-links">
          <Link to="/" className="btn-voltar-home">Cancelar e Voltar</Link>
        </div>
      </div>
    </div>
  );
}