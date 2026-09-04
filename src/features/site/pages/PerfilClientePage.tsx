import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';
import { useContasStore } from '../../../store/contas.store';
import { usePedidosStore } from '../../../store/pedidos.store';

export function PerfilClientePage() {
  const navigate = useNavigate();
  const usuarioLogado = useAuthStore((state) => state.usuarioLogado);
  const clientes = useContasStore((state) => state.clientes);
  const atualizarCliente = useContasStore((state) => state.atualizarCliente);
  const fazerLogout = useAuthStore((state) => state.fazerLogout);
  const pedidos = usePedidosStore((state) => state.pedidos);

  const dados = clientes.find((c) => c.username === usuarioLogado?.username);

  const [nome, setNome] = useState(dados?.nome ?? '');
  const [telefone, setTelefone] = useState(dados?.telefone ?? '');
  const [cpf, setCpf] = useState(dados?.cpf ?? '');
  const [rua, setRua] = useState(dados?.rua ?? '');
  const [numero, setNumero] = useState(dados?.numero ?? '');
  const [bairro, setBairro] = useState(dados?.bairro ?? '');
  const [sucesso, setSucesso] = useState(false);

  if (!usuarioLogado || usuarioLogado.papel !== 'cliente' || !dados) {
    return (
      <div className="auth-page-wrapper">
        <div className="auth-card-fazer-login">
          <p>Você precisa estar logado como cliente para ver este painel.</p>
          <Link to="/login" className="btn-auth-submit text-center">Ir para o Login</Link>
        </div>
      </div>
    );
  }

  const meusPedidos = pedidos.filter((p) => p.clienteUsername === usuarioLogado.username).sort((a, b) => b.criadoEm - a.criadoEm);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    atualizarCliente(dados.username, { nome, telefone, cpf: cpf || undefined, rua, numero, bairro });
    setSucesso(true);
    setTimeout(() => setSucesso(false), 2000);
  };

  return (
    <div className="max-w-700">
      <div className="perfil-header-flex">
        <h2>Meu Perfil</h2>
        <div className="botoes-perfil-top">
          <button onClick={() => { fazerLogout(); navigate('/'); }} className="btn-sair-conta">Sair</button>
        </div>
      </div>

      {sucesso && <div className="auth-sucesso">✓ Dados atualizados com sucesso!</div>}

      <form onSubmit={handleSalvar} className="auth-form">
        <div className="auth-input-group">
          <label>Nome:</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div className="auth-input-group">
          <label>Telefone:</label>
          <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
        </div>
        <div className="auth-input-group">
          <label>CPF (para nota fiscal):</label>
          <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} />
        </div>
        <div className="auth-input-group">
          <label>Rua:</label>
          <input type="text" value={rua} onChange={(e) => setRua(e.target.value)} required />
        </div>
        <div className="auth-input-group">
          <label>Número:</label>
          <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} required />
        </div>
        <div className="auth-input-group">
          <label>Bairro:</label>
          <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} required />
        </div>
        <button type="submit" className="btn-auth-submit">Salvar Alterações</button>
      </form>

      <div className="tabela-pizzas" style={{ marginTop: 32 }}>
        <h3>Meus Pedidos</h3>
        {meusPedidos.length === 0 ? (
          <p className="subtext">Você ainda não fez nenhum pedido.</p>
        ) : (
          <div className="lista-adicionais-admin">
            {meusPedidos.map((p) => (
              <div key={p.id} className="adicional-admin-item">
                <div>
                  <strong>Pedido #{p.id}</strong>
                  <span>{p.tipo} · R$ {p.total.toFixed(2)} · {p.status}</span>
                </div>
                <Link to={`/pedido/${p.id}`} className="btn-link-secundario">Ver</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
