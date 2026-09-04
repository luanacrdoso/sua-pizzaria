import { useState } from 'react';
import { useRestauranteStore } from '../../../store/restaurante.store';
import { useContasStore } from '../../../store/contas.store';
import { usePedidosStore } from '../../../store/pedidos.store';
import { CardapioEditor } from '../components/CardapioEditor';

const FORMAS_DISPONIVEIS = ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'];

export function AdminSitePage() {
  const { config, mesas, atualizarConfig, adicionarAdicional, removerAdicional, cadastrarMesas } = useRestauranteStore();
  const { funcionarios, aprovarFuncionario, reprovarFuncionario } = useContasStore();
  const pedidos = usePedidosStore((state) => state.pedidos);

  const [aba, setAba] = useState<'aparencia' | 'cardapio' | 'pagamento' | 'pedidos' | 'funcionarios' | 'dashboard'>('aparencia');

  // Form: aparência
  const [nome, setNome] = useState(config.nome);
  const [descricao, setDescricao] = useState(config.descricao);
  const [logoUrl, setLogoUrl] = useState(config.logoUrl);
  const [capaUrl, setCapaUrl] = useState(config.capaUrl);
  const [corPrimaria, setCorPrimaria] = useState(config.corPrimaria);
  const [corSecundaria, setCorSecundaria] = useState(config.corSecundaria);
  const [endereco, setEndereco] = useState(config.endereco);
  const [dias, setDias] = useState(config.diasFuncionamento);
  const [horario, setHorario] = useState(config.horarioFuncionamento);
  const [telefone, setTelefone] = useState(config.telefone);
  const [tempoPreparo, setTempoPreparo] = useState(config.tempoPreparoEstimado);
  const [taxaEntrega, setTaxaEntrega] = useState(config.taxaEntrega);
  const [qtdMesas, setQtdMesas] = useState(4);
  const [capMesas, setCapMesas] = useState(4);
  const [sucesso, setSucesso] = useState(false);

  // Form: pagamento
  const [chavePix, setChavePix] = useState(config.chavePix);
  const [novoExtraNome, setNovoExtraNome] = useState('');
  const [novoExtraPreco, setNovoExtraPreco] = useState('');

  const funcionariosPendentes = funcionarios.filter((f) => !f.aprovado);
  const funcionariosAtivos = funcionarios.filter((f) => f.aprovado);

  const faturamentoTotal = pedidos.reduce((acc, p) => acc + p.total, 0);
  const pedidosPorTipo = {
    entrega: pedidos.filter((p) => p.tipo === 'entrega').length,
    presencial: pedidos.filter((p) => p.tipo === 'presencial').length,
    retirada: pedidos.filter((p) => p.tipo === 'retirada').length
  };

  const handleSalvarAparencia = (e: React.FormEvent) => {
    e.preventDefault();
    atualizarConfig({ nome, descricao, logoUrl, capaUrl, corPrimaria, corSecundaria, endereco, diasFuncionamento: dias, horarioFuncionamento: horario, telefone, tempoPreparoEstimado: tempoPreparo, taxaEntrega: Number(taxaEntrega) });
    setSucesso(true);
    setTimeout(() => setSucesso(false), 2000);
  };

  const handleCadastrarMesas = (e: React.FormEvent) => {
    e.preventDefault();
    cadastrarMesas(Number(qtdMesas), Number(capMesas));
  };

  const toggleForma = (forma: string) => {
    const atuais = config.formasPagamentoAceitas;
    const novas = atuais.includes(forma) ? atuais.filter((f) => f !== forma) : [...atuais, forma];
    atualizarConfig({ formasPagamentoAceitas: novas });
  };

  const handleSalvarPix = (e: React.FormEvent) => {
    e.preventDefault();
    atualizarConfig({ chavePix });
    setSucesso(true);
    setTimeout(() => setSucesso(false), 2000);
  };

  const handleAdicionarExtra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoExtraNome || !novoExtraPreco) return;
    adicionarAdicional({ id: `extra-${Date.now()}`, nome: novoExtraNome, preco: Number(novoExtraPreco) });
    setNovoExtraNome('');
    setNovoExtraPreco('');
  };

  return (
    <div className="container-admin">
      <div className="admin-header">
        <div>
          <h2>🛠️ Painel do Admin do Site — {config.nome}</h2>
          <p>Personalize a identidade da pizzaria, o cardápio, o pagamento e acompanhe a operação.</p>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={aba === 'aparencia' ? 'tab-btn ativo' : 'tab-btn'} onClick={() => setAba('aparencia')}>🎨 Aparência & Mesas</button>
        <button className={aba === 'cardapio' ? 'tab-btn ativo' : 'tab-btn'} onClick={() => setAba('cardapio')}>🍕 Cardápio</button>
        <button className={aba === 'pagamento' ? 'tab-btn ativo' : 'tab-btn'} onClick={() => setAba('pagamento')}>💳 Pagamento</button>
        <button className={aba === 'pedidos' ? 'tab-btn ativo' : 'tab-btn'} onClick={() => setAba('pedidos')}>📦 Pedidos</button>
        <button className={aba === 'funcionarios' ? 'tab-btn ativo' : 'tab-btn'}
          onClick={() => setAba('funcionarios')}>
          👥 Funcionários {funcionariosPendentes.length > 0 && <span className="badge-carrinho">{funcionariosPendentes.length}</span>}
        </button>
        <button className={aba === 'dashboard' ? 'tab-btn ativo' : 'tab-btn'} onClick={() => setAba('dashboard')}>📊 Dashboard</button>
      </div>

      <div className="admin-conteudo">
        {aba === 'aparencia' && (
          <div className="admin-duas-colunas">
            <form onSubmit={handleSalvarAparencia} className="form-admin-config">
              <h3>🎨 Identidade Visual & Funcionamento</h3>
              {sucesso && <p className="msg-sucesso">✓ Configurações gravadas com sucesso!</p>}

              <div className="input-group"><label>Nome da Pizzaria</label><input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required /></div>
              <div className="input-group"><label>Slogan/Descrição</label><input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} required /></div>
              <div className="input-group"><label>Logotipo (URL)</label><input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} required /></div>
              <div className="input-group"><label>Imagem de Capa (URL)</label><input type="text" value={capaUrl} onChange={(e) => setCapaUrl(e.target.value)} required /></div>

              <div className="cores-flex">
                <div className="input-group"><label>Cor Primária</label><input type="color" value={corPrimaria} onChange={(e) => setCorPrimaria(e.target.value)} /></div>
                <div className="input-group"><label>Cor Secundária</label><input type="color" value={corSecundaria} onChange={(e) => setCorSecundaria(e.target.value)} /></div>
              </div>

              <div className="cores-flex">
                <div className="input-group"><label>Dias de Funcionamento</label><input type="text" value={dias} onChange={(e) => setDias(e.target.value)} required /></div>
                <div className="input-group"><label>Horário</label><input type="text" value={horario} onChange={(e) => setHorario(e.target.value)} required /></div>
              </div>

              <div className="cores-flex">
                <div className="input-group"><label>Telefone</label><input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} required /></div>
                <div className="input-group"><label>Tempo de Preparo</label><input type="text" value={tempoPreparo} onChange={(e) => setTempoPreparo(e.target.value)} required /></div>
              </div>

              <div className="cores-flex">
                <div className="input-group"><label>Taxa de Entrega (R$)</label><input type="number" step="0.10" value={taxaEntrega} onChange={(e) => setTaxaEntrega(Number(e.target.value))} required /></div>
                <div className="input-group"><label>Endereço</label><input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} required /></div>
              </div>

              <button type="submit" className="btn-salvar" style={{ backgroundColor: corPrimaria }}>Gravar Alterações</button>
            </form>

            <div className="admin-preview-box">
              <h3>🪑 Mesas do Salão</h3>
              <p className="subtext">Total cadastrado: {mesas.length} mesa(s).</p>
              <form onSubmit={handleCadastrarMesas} className="auth-form">
                <div className="auth-input-group">
                  <label>Quantidade de mesas a adicionar</label>
                  <input type="number" min={1} value={qtdMesas} onChange={(e) => setQtdMesas(Number(e.target.value))} />
                </div>
                <div className="auth-input-group">
                  <label>Capacidade de cada mesa</label>
                  <input type="number" min={1} value={capMesas} onChange={(e) => setCapMesas(Number(e.target.value))} />
                </div>
                <button type="submit" className="btn-auth-submit">Adicionar Mesas</button>
              </form>

              <div className="lista-adicionais-admin" style={{ marginTop: 16 }}>
                {mesas.map((m) => (
                  <div key={m.id} className="adicional-admin-item">
                    <div><strong>Mesa {m.numero}</strong><span>{m.capacidade} lugares · {m.status === 'ocupada' ? `com ${m.garcomResponsavelUsername}` : 'livre'}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {aba === 'cardapio' && <CardapioEditor />}

        {aba === 'pagamento' && (
          <div className="admin-duas-colunas">
            <div className="form-admin-config">
              <form onSubmit={handleSalvarPix}>
                <h3>💳 Chave Pix</h3>
                {sucesso && <p className="msg-sucesso">✓ Salvo!</p>}
                <div className="input-group"><label>Chave Pix</label><input type="text" value={chavePix} onChange={(e) => setChavePix(e.target.value)} required /></div>
                <button type="submit" className="btn-salvar" style={{ backgroundColor: config.corPrimaria }}>Salvar Chave Pix</button>
              </form>

              <h3 style={{ marginTop: 24 }}>Formas de Pagamento Aceitas</h3>
              <div className="pagamentos-opcoes">
                {FORMAS_DISPONIVEIS.map((forma) => (
                  <label key={forma} className="opcao-pagamento-radio">
                    <input type="checkbox" checked={config.formasPagamentoAceitas.includes(forma)} onChange={() => toggleForma(forma)} />
                    {forma}
                  </label>
                ))}
              </div>

              <form onSubmit={handleAdicionarExtra} style={{ marginTop: 24 }}>
                <h3>🥓 Adicionais do Cardápio</h3>
                <div className="input-group"><label>Nome do adicional</label><input type="text" value={novoExtraNome} onChange={(e) => setNovoExtraNome(e.target.value)} /></div>
                <div className="input-group"><label>Preço (R$)</label><input type="number" step="0.05" value={novoExtraPreco} onChange={(e) => setNovoExtraPreco(e.target.value)} /></div>
                <button type="submit" className="btn-salvar" style={{ backgroundColor: config.corPrimaria }}>Adicionar</button>
              </form>
            </div>

            <div className="tabela-pizzas">
              <h3>📋 Adicionais Cadastrados</h3>
              <div className="lista-adicionais-admin">
                {config.adicionaisDisponiveis.length === 0 ? (
                  <p className="subtext">Nenhum adicional cadastrado ainda.</p>
                ) : (
                  config.adicionaisDisponiveis.map((extra) => (
                    <div key={extra.id} className="adicional-admin-item">
                      <div><strong>{extra.nome}</strong><span>R$ {extra.preco.toFixed(2)}</span></div>
                      <button onClick={() => removerAdicional(extra.id)} className="btn-excluir-adicional">Remover 🗑️</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {aba === 'pedidos' && (
          <div className="pedidos-dashboard">
            <h3>📦 Status de Todos os Pedidos</h3>
            {pedidos.length === 0 ? (
              <p className="sem-pedidos">Nenhum pedido registrado ainda.</p>
            ) : (
              <div className="lista-adicionais-admin">
                {[...pedidos].sort((a, b) => b.criadoEm - a.criadoEm).map((p) => (
                  <div key={p.id} className="adicional-admin-item">
                    <div><strong>Pedido #{p.id} — {p.clienteNome}</strong><span>{p.tipo} · R$ {p.total.toFixed(2)}</span></div>
                    <span className={`status-badge-admin ${p.status === 'finalizado' ? 'entregue' : ''}`}>{p.status.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {aba === 'funcionarios' && (
          <div className="admin-duas-colunas">
            <div className="tabela-pizzas">
              <h3>⏳ Cadastros Pendentes</h3>
              {funcionariosPendentes.length === 0 ? (
                <p className="subtext">Nenhum cadastro aguardando aprovação.</p>
              ) : (
                <div className="lista-adicionais-admin">
                  {funcionariosPendentes.map((f) => (
                    <div key={f.username} className="adicional-admin-item">
                      <div><strong>{f.nome} (@{f.username})</strong><span>{f.cargo}</span></div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => aprovarFuncionario(f.username)} className="btn-salvar" style={{ backgroundColor: config.corPrimaria, width: 'auto', padding: '8px 16px' }}>Aprovar</button>
                        <button onClick={() => reprovarFuncionario(f.username)} className="btn-excluir-adicional">Recusar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="tabela-pizzas">
              <h3>✅ Equipe Ativa</h3>
              {funcionariosAtivos.length === 0 ? (
                <p className="subtext">Nenhum funcionário aprovado ainda.</p>
              ) : (
                <div className="lista-adicionais-admin">
                  {funcionariosAtivos.map((f) => (
                    <div key={f.username} className="adicional-admin-item">
                      <div><strong>{f.nome} (@{f.username})</strong><span>{f.cargo}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {aba === 'dashboard' && (
          <div className="admin-duas-colunas">
            <div className="tabela-pizzas">
              <h3>📊 Visão Geral</h3>
              <div className="resumo-linha"><span>Total de pedidos:</span><span>{pedidos.length}</span></div>
              <div className="resumo-linha"><span>Faturamento total:</span><span>R$ {faturamentoTotal.toFixed(2)}</span></div>
              <div className="resumo-linha"><span>Pedidos de entrega:</span><span>{pedidosPorTipo.entrega}</span></div>
              <div className="resumo-linha"><span>Pedidos presenciais:</span><span>{pedidosPorTipo.presencial}</span></div>
              <div className="resumo-linha"><span>Pedidos de retirada:</span><span>{pedidosPorTipo.retirada}</span></div>
              <div className="resumo-linha total"><span>Funcionários ativos:</span><span>{funcionariosAtivos.length}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
