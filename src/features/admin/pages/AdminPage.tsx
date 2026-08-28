import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTenantStore } from '../../../store/tenant.store';
import { GerenciarCardapio } from '../components/GerenciarCardapio';
import { useAuthStore } from '../../../store/auth.store';

export function AdminPage() {
  const { tenantId } = useParams<{ readonly tenantId: string }>();
  const { tenants, atualizarTenantConfig } = useTenantStore();
  const navigate = useNavigate();
  const excluirContaDono = useAuthStore((state) => state.excluirContaDono);
  const usuarioLogado = useAuthStore((state) => state.usuarioLogado);
  const config = tenants.find((t) => t.id === tenantId);

  // Estados Form Customização
  const [nome, setNome] = useState('');
  const [logotipoUrl, setLogotipoUrl] = useState('');
  const [corPrimaria, setCorPrimaria] = useState('');
  const [corSecundaria, setCorSecundaria] = useState('');
  const [taxaEntrega, setTaxaEntrega] = useState(0);
  const [tempoPreparo, setTempoPreparo] = useState('');
  const [endereco, setEndereco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [horario, setHorario] = useState('');
  const [dias, setDias] = useState('');
  const [sucesso, setSucesso] = useState(false);

  // Adicionais
  const [novoExtraNome, setNovoExtraNome] = useState('');
  const [novoExtraPreco, setNovoExtraPreco] = useState('');

  // Pix Key
  const [chavePix, setChavePix] = useState('');

  // Gestão de Pedidos
  const [pedidoAtivo, setPedidoAtivo] = useState<any>(null);

  // Abas Administrativas
  const [abaAtiva, setAbaAtiva] = useState<'customizacao' | 'cardapio' | 'adicionais' | 'pix' | 'pedidos'>('customizacao');

  useEffect(() => {
    if (config) {
      setNome(config.nome);
      setLogotipoUrl(config.logotipoUrl);
      setCorPrimaria(config.corPrimaria);
      setCorSecundaria(config.corSecundaria);
      setTaxaEntrega(config.taxaEntrega);
      setTempoPreparo(config.tempoPreparoEstimado);
      setEndereco(config.endereco);
      setDescricao(config.descricao);
      setHorario(config.horarioFuncionamento || '18:00 às 23:30');
      setDias(config.diasFuncionamento || 'Terça a Domingo');
      setChavePix(config.chavePix || '');
    }
  }, [config]);

  useEffect(() => {
    if (!config) return;
    const currentTenantId = config.id;
    
    function carregarPedido() {
      const salvo = localStorage.getItem(`pizzashop-pedido-ativo-${currentTenantId}`);
      if (salvo) {
        setPedidoAtivo(JSON.parse(salvo));
      }
    }
    carregarPedido();
    const interval = setInterval(carregarPedido, 3000);
    return () => clearInterval(interval);
  }, [config]);

  if (!config) {
    return (
      <div className="status-container erro">
        <p>Pizzaria não cadastrada na plataforma.</p>
        <Link to="/" className="btn-recarregar">Voltar ao Portal SaaS</Link>
      </div>
    );
  }

  const handleSalvarConfig = (e: React.FormEvent) => {
    e.preventDefault();
    atualizarTenantConfig(config.id, {
      nome,
      logotipoUrl,
      corPrimaria,
      corSecundaria,
      taxaEntrega: Number(taxaEntrega),
      tempoPreparoEstimado: tempoPreparo,
      endereco,
      descricao,
      horarioFuncionamento: horario,
      diasFuncionamento: dias,
      chavePix
    });
    setSucesso(true);
    setTimeout(() => setSucesso(false), 2000);
  };

  const handleAdicionarExtra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoExtraNome || !novoExtraPreco) return;

    const novoExtra = {
      id: Math.random().toString(),
      nome: novoExtraNome,
      preco: Number(novoExtraPreco)
    };

    const listaAtual = config.adicionaisDisponiveis || [];
    atualizarTenantConfig(config.id, {
      adicionaisDisponiveis: [...listaAtual, novoExtra]
    });

    setNovoExtraNome('');
    setNovoExtraPreco('');
    setSucesso(true);
    setTimeout(() => setSucesso(false), 1500);
  };

  const handleRemoverExtra = (idExtra: string) => {
    const listaAtual = config.adicionaisDisponiveis || [];
    atualizarTenantConfig(config.id, {
      adicionaisDisponiveis: listaAtual.filter(a => a.id !== idExtra)
    });
  };

  const handleAtualizarStatusPedido = (novoStatus: string) => {
    if (!pedidoAtivo) return;
    const atualizado = { ...pedidoAtivo, status: novoStatus };
    setPedidoAtivo(atualizado);
    localStorage.setItem(`pizzashop-pedido-ativo-${config.id}`, JSON.stringify(atualizado));
  };

  const handleExcluirConta = () => {
    if (!usuarioLogado) return;
    if (confirm('Atenção: sua conta de pizzaria será apagada de forma irreversível. Deseja prosseguir?')) {
      excluirContaDono(usuarioLogado.email);
      navigate('/');
    }
  };
  return (
    <div className="container-admin">
      <div className="admin-header">
        <div>
          <h2>🛠️ Central de Gerenciamento de {config.nome}</h2>
          <p>Configurações de identidade visual, cardápio, adicionais e pedidos.</p>
        </div>
        <Link to={`/store/${config.id}`} className="btn-voltar-loja-admin">Ir para a Loja 🍕</Link>
        <Link to={`/store/${config.id}`} className="btn-voltar-loja-admin">Ir para a Loja 🍕</Link>
        <button onClick={handleExcluirConta} className="btn-deletar-conta">Excluir Conta 🗑️</button>
      </div>

      <div className="admin-tabs">
        <button className={abaAtiva === 'customizacao' ? "tab-btn ativo" : "tab-btn"} onClick={() => setAbaAtiva('customizacao')}>🎨 Aparência & Taxas</button>
        <button className={abaAtiva === 'cardapio' ? "tab-btn ativo" : "tab-btn"} onClick={() => setAbaAtiva('cardapio')}>🍕 Gerenciar Cardápio</button>
        <button className={abaAtiva === 'adicionais' ? "tab-btn ativo" : "tab-btn"} onClick={() => setAbaAtiva('adicionais')}>🥓 Adicionais (Extras)</button>
        <button className={abaAtiva === 'pix' ? "tab-btn ativo" : "tab-btn"} onClick={() => setAbaAtiva('pix')}>💳 Recebimento PIX</button>
        <button className={abaAtiva === 'pedidos' ? "tab-btn ativo" : "tab-btn"} onClick={() => setAbaAtiva('pedidos')}>📦 Pedidos Ativos</button>
      </div>

      <div className="admin-conteudo">
        {abaAtiva === 'customizacao' && (
          <div className="admin-duas-colunas">
            <form onSubmit={handleSalvarConfig} className="form-admin-config">
              <h3>🎨 Identidade Visual, Funcionamento & Taxas</h3>
              {sucesso && <p className="msg-sucesso">✓ Configurações gravadas com sucesso!</p>}

              <div className="input-group">
                <label>Nome Comercial da Pizzaria</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
              </div>

              <div className="input-group">
                <label>Slogan ou Descrição Curta</label>
                <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)} required />
              </div>

              <div className="input-group">
                <label>Logotipo (URL da Imagem)</label>
                <input type="text" value={logotipoUrl} onChange={e => setLogotipoUrl(e.target.value)} required />
              </div>

              <div className="cores-flex">
                <div className="input-group">
                  <label>Dias de Funcionamento</label>
                  <input type="text" value={dias} onChange={e => setDias(e.target.value)} placeholder="Ex: Terça a Domingo" required />
                </div>
                <div className="input-group">
                  <label>Horário de Funcionamento</label>
                  <input type="text" value={horario} onChange={e => setHorario(e.target.value)} placeholder="Ex: 18:00 às 23:30" required />
                </div>
              </div>

              <div className="cores-flex">
                <div className="input-group">
                  <label>Cor Primária (Destaques)</label>
                  <input type="color" value={corPrimaria} onChange={e => setCorPrimaria(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Cor Secundária (Fundo)</label>
                  <input type="color" value={corSecundaria} onChange={e => setCorSecundaria(e.target.value)} />
                </div>
              </div>

              <div className="cores-flex">
                <div className="input-group">
                  <label>Taxa de Entrega (R$)</label>
                  <input type="number" step="0.10" value={taxaEntrega} onChange={e => setTaxaEntrega(Number(e.target.value))} required />
                </div>
                <div className="input-group">
                  <label>Tempo Estimado de Preparo</label>
                  <input type="text" value={tempoPreparo} onChange={e => setTempoPreparo(e.target.value)} required />
                </div>
              </div>

              <div className="input-group">
                <label>Endereço Físico do Estabelecimento</label>
                <input type="text" value={endereco} onChange={e => setEndereco(e.target.value)} required />
              </div>

              <button type="submit" className="btn-salvar" style={{ backgroundColor: corPrimaria }}>Gravar Alterações</button>
            </form>

            <div className="admin-preview-box">
              <h3>👀 Mockup em Tempo Real</h3>
              <div className="layout-mockup" style={{ borderColor: corPrimaria }}>
                <header className="mockup-nav" style={{ backgroundColor: corPrimaria }}>
                  <img src={logotipoUrl} alt="logo" />
                  <strong>{nome}</strong>
                </header>
                <div className="mockup-banner" style={{ backgroundImage: `linear-gradient(135deg, ${corPrimaria}, ${corSecundaria})` }}>
                  <h4>Boas-vindas ao {nome}</h4>
                  <p>{descricao}</p>
                </div>
                <div className="mockup-card">
                  <span style={{ backgroundColor: corPrimaria }}>Pizza de Queijo</span>
                  <button style={{ backgroundColor: corPrimaria }}>Comprar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'cardapio' && <GerenciarCardapio />}

        {abaAtiva === 'adicionais' && (
          <div className="admin-duas-colunas">
            <form onSubmit={handleAdicionarExtra} className="form-admin-config">
              <h3>🥓 Adicionar Novo Ingrediente Adicional</h3>
              {sucesso && <p className="msg-sucesso">✓ Adicional adicionado!</p>}

              <div className="input-group">
                <label>Nome do Ingrediente Extra</label>
                <input type="text" value={novoExtraNome} onChange={e => setNovoExtraNome(e.target.value)} placeholder="Ex: Catupiry na Borda, Bacon Extra" required />
              </div>

              <div className="input-group">
                <label>Preço Cobrado pelo Adicional (R$)</label>
                <input type="number" step="0.05" value={novoExtraPreco} onChange={e => setNovoExtraPreco(e.target.value)} placeholder="Ex: 5.50" required />
              </div>

              <button type="submit" className="btn-salvar" style={{ backgroundColor: corPrimaria }}>Adicionar Adicional</button>
            </form>

            <div className="tabela-pizzas">
              <h3>📋 Adicionais Cadastrados</h3>
              <div className="lista-adicionais-admin">
                {(!config.adicionaisDisponiveis || config.adicionaisDisponiveis.length === 0) ? (
                  <p className="subtext">Nenhum adicional cadastrado. O cliente verá os padrão.</p>
                ) : (
                  config.adicionaisDisponiveis.map(extra => (
                    <div key={extra.id} className="adicional-admin-item">
                      <div>
                        <strong>{extra.nome}</strong>
                        <span>R$ {extra.preco.toFixed(2)}</span>
                      </div>
                      <button onClick={() => handleRemoverExtra(extra.id)} className="btn-excluir-adicional">Remover 🗑️</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'pix' && (
          <form onSubmit={handleSalvarConfig} className="form-admin-config max-w-700">
            <h3> Chave PIX da Pizzaria</h3>
            <p className="subtext">Cadastre a sua chave Pix para gerar automaticamente os QR Codes de cobrança no checkout dos clientes.</p>
            {sucesso && <p className="msg-sucesso">✓ Chave Pix salva!</p>}

            <div className="input-group">
              <label>Chave Pix Bancária:</label>
              <input
                type="text"
                placeholder="Insira chave (Celular, E-mail, CPF/CNPJ, etc.)"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-salvar" style={{ backgroundColor: corPrimaria }}>Salvar Chave Pix</button>
          </form>
        )}

        {abaAtiva === 'pedidos' && (
          <div className="pedidos-dashboard">
            <h3>📦 Pedidos de {config.nome}</h3>
            {pedidoAtivo ? (
              <div className="pedido-card-admin">
                <div className="pedido-cabecalho">
                  <h4>Pedido #{pedidoAtivo.id}</h4>
                  <span className={`status-badge-admin ${pedidoAtivo.status}`}>{pedidoAtivo.status.toUpperCase()}</span>
                </div>
                <p>Cliente: <strong>{pedidoAtivo.cliente}</strong></p>
                <p>Método de Pagamento: <strong>{pedidoAtivo.pagamento}</strong></p>
                <ul>
                  {pedidoAtivo.itens.map((i: string, idx: number) => <li key={idx}>{i}</li>)}
                </ul>
                <div className="total-admin">Total: R$ {Number(pedidoAtivo.total).toFixed(2)}</div>
                
                <div className="acoes-status">
                  <label>Avançar Status de Entrega:</label>
                  <div className="status-botoes-grupo">
                    <button onClick={() => handleAtualizarStatusPedido('recebido')} className={pedidoAtivo.status === 'recebido' ? 'ativo' : ''}>Recebido</button>
                    <button onClick={() => handleAtualizarStatusPedido('preparo')} className={pedidoAtivo.status === 'preparo' ? 'ativo' : ''}>Preparo</button>
                    <button onClick={() => handleAtualizarStatusPedido('entrega')} className={pedidoAtivo.status === 'entrega' ? 'ativo' : ''}>A Caminho</button>
                    <button onClick={() => handleAtualizarStatusPedido('entregue')} className={pedidoAtivo.status === 'entregue' ? 'ativo' : ''}>Entregue</button>
                  </div>
                </div>

                {pedidoAtivo.avaliacaoEstrelas > 0 && (
                  <div className="feedback-recebido-admin">
                    <h5>⭐ Avaliação do Cliente:</h5>
                    <p>Nota: <strong>{pedidoAtivo.avaliacaoEstrelas}/5</strong></p>
                    {pedidoAtivo.avaliacaoComentario && <p>Comentário: <em>"{pedidoAtivo.avaliacaoComentario}"</em></p>}
                  </div>
                )}
              </div>
            ) : (
              <p className="sem-pedidos">Sem pedidos ativos no momento para hoje.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}