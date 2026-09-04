import { useState } from 'react';
import { useAuthStore } from '../../../store/auth.store';
import { useRestauranteStore } from '../../../store/restaurante.store';
import { useCardapioStore } from '../../../store/cardapio.store';
import { usePedidosStore } from '../../../store/pedidos.store';
import { useChamadosStore } from '../../../store/chamados.store';
import type { ItemPedido, Pedido, Tamanho } from '../../../types';

type Periodo = 'todos' | 'mensal' | 'semanal';

const UM_DIA_MS = 24 * 60 * 60 * 1000;

export function GarcomPage() {
  const usuarioLogado = useAuthStore((state) => state.usuarioLogado);
  const { mesas, assumirMesa, liberarMesa, config } = useRestauranteStore();
  const pizzas = useCardapioStore((state) => state.pizzas);
  const { pedidos, criarPedido, adicionarItensAoPedido, atualizarStatus, definirGorjeta, confirmarGorjeta, finalizarPedido, marcarItemServido } = usePedidosStore();
  const { chamados, marcarAtendido } = useChamadosStore();

  const [aba, setAba] = useState<'mesas' | 'registrar' | 'comandas' | 'dashboard'>('mesas');
  const [periodo, setPeriodo] = useState<Periodo>('todos');

  // Montagem de item na hora de anotar o pedido
  const [mesaSelecionada, setMesaSelecionada] = useState('');
  const [pizzaSelecionadaId, setPizzaSelecionadaId] = useState('');
  const [tamanho, setTamanho] = useState<Tamanho>('Grande');
  const [itensSelecionados, setItensSelecionados] = useState<readonly string[]>([]);
  const [itensRascunho, setItensRascunho] = useState<readonly ItemPedido[]>([]);
  const [incluirGorjeta, setIncluirGorjeta] = useState(false);

  const meuUsername = usuarioLogado?.username ?? '';
  const minhasMesas = mesas.filter((m) => m.garcomResponsavelUsername === meuUsername);
  const mesasAguardandoAtendimento = mesas.filter((m) => m.status === 'ocupada' && !m.garcomResponsavelUsername);
  const mesasLivres = mesas.filter((m) => m.status === 'livre');
  const chamadosPendentes = chamados.filter((c) => !c.atendido);

  const pizzaSelecionada = pizzas.find((p) => p.id === pizzaSelecionadaId);
  const semTamanho = pizzaSelecionada?.categoria === 'bebida' || pizzaSelecionada?.categoria === 'combo';
  const temSelecaoDeItens = pizzaSelecionada?.tipo === 'personalizavel';
  const itensDisponiveis = pizzaSelecionada ? pizzas.filter((p) => pizzaSelecionada.saboresPermitidosIds?.includes(p.id)) : [];
  const limiteItens = !pizzaSelecionada ? 1
    : pizzaSelecionada.categoria === 'combo' ? (pizzaSelecionada.maxSaboresGrande ?? 2)
    : tamanho === 'Brotinho' ? (pizzaSelecionada.maxSaboresBrotinho ?? 1)
    : tamanho === 'Média' ? (pizzaSelecionada.maxSaboresMedia ?? 2) : (pizzaSelecionada.maxSaboresGrande ?? 3);

  // Comanda aberta de cada mesa (pedido presencial ainda não finalizado)
  const comandaDaMesa = (mesaId: string) => pedidos.find((p) => p.mesaId === mesaId && p.status !== 'finalizado');
  const minhasComandas = pedidos.filter((p) => p.mesaId && minhasMesas.some((m) => m.id === p.mesaId) && p.status !== 'finalizado');

  const dentroDoPeriodo = (criadoEm: number) => {
    if (periodo === 'todos') return true;
    const limite = periodo === 'semanal' ? 7 * UM_DIA_MS : 30 * UM_DIA_MS;
    return Date.now() - criadoEm <= limite;
  };

  const pedidosComGorjetaMinha = pedidos.filter(
    (p) => p.gorjeta?.garcomUsername === meuUsername && p.gorjeta.confirmadaPeloGarcom && dentroDoPeriodo(p.criadoEm)
  );
  const totalGanhos = pedidosComGorjetaMinha.reduce((acc, p) => acc + (p.gorjeta?.valor ?? 0), 0);
  const comandasAtendidas = new Set(pedidosComGorjetaMinha.map((p) => p.id)).size;

  const toggleItemSelecionado = (nome: string) => {
    setItensSelecionados((prev) => {
      if (prev.includes(nome)) return prev.filter((s) => s !== nome);
      if (prev.length >= limiteItens) return [...prev.slice(1), nome];
      return [...prev, nome];
    });
  };

  const handleAdicionarItem = () => {
    if (!pizzaSelecionada) return;
    if (temSelecaoDeItens && itensSelecionados.length === 0) {
      alert('Escolha pelo menos 1 item.');
      return;
    }

    const precoUnitario = semTamanho ? Number(pizzaSelecionada.precoGrande)
      : tamanho === 'Brotinho' ? Number(pizzaSelecionada.precoBrotinho)
      : tamanho === 'Média' ? Number(pizzaSelecionada.precoMedia) : Number(pizzaSelecionada.precoGrande);

    const nome = temSelecaoDeItens ? `${pizzaSelecionada.nome} (${itensSelecionados.join(' / ')})` : pizzaSelecionada.nome;

    setItensRascunho((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        pizzaId: pizzaSelecionada.id,
        nome,
        imagemUrl: pizzaSelecionada.imagemUrl,
        tamanho: semTamanho ? 'Único' : tamanho,
        extras: [],
        saboresSelecionados: temSelecaoDeItens ? itensSelecionados : undefined,
        observacoes: '',
        quantidade: 1,
        precoUnitario,
        servido: false
      }
    ]);

    setPizzaSelecionadaId('');
    setItensSelecionados([]);
    setTamanho('Grande');
  };

  const handleRegistrarPedido = (e: React.FormEvent) => {
    e.preventDefault();
    const mesa = mesas.find((m) => m.id === mesaSelecionada);
    if (!mesa || itensRascunho.length === 0 || !meuUsername) return;

    // Quem anota o pedido assume a mesa na hora, caso ainda não tenha
    // garçom responsável.
    if (mesa.status === 'livre' || !mesa.garcomResponsavelUsername) {
      assumirMesa(mesa.id, meuUsername);
    }

    const comandaAberta = comandaDaMesa(mesa.id);

    if (comandaAberta) {
      adicionarItensAoPedido(comandaAberta.id, itensRascunho);
      if (incluirGorjeta && !comandaAberta.gorjeta) {
        definirGorjeta(comandaAberta.id, meuUsername);
      }
    } else {
      const subtotal = itensRascunho.reduce((acc, i) => acc + i.precoUnitario * i.quantidade, 0);
      const novoId = Math.floor(1000 + Math.random() * 9000).toString();
      const pedido: Pedido = {
        id: novoId,
        tipo: 'presencial',
        clienteUsername: 'garcom',
        clienteNome: `Mesa ${mesa.numero}`,
        clienteTelefone: '',
        itens: itensRascunho,
        subtotal,
        taxaEntrega: 0,
        total: subtotal,
        formaPagamento: 'Dinheiro',
        mesaId: mesa.id,
        gorjeta: incluirGorjeta ? { percentual: 10, valor: subtotal * 0.10, garcomUsername: meuUsername, confirmadaPeloGarcom: false } : undefined,
        status: 'recebido',
        criadoEm: Date.now()
      };
      criarPedido(pedido);
    }

    setItensRascunho([]);
    setMesaSelecionada('');
    setIncluirGorjeta(false);
    setAba('comandas');
  };

  return (
    <div className="container-admin">
      <div className="admin-header">
        <div><h2>🧑‍🍳 Painel do Garçom</h2><p>Assuma mesas, anote comandas e acompanhe seus ganhos.</p></div>
      </div>

      <div className="admin-tabs">
        <button className={aba === 'mesas' ? 'tab-btn ativo' : 'tab-btn'} onClick={() => setAba('mesas')}>
          🪑 Mesas {chamadosPendentes.length > 0 && <span className="badge-carrinho">{chamadosPendentes.length}</span>}
        </button>
        <button className={aba === 'registrar' ? 'tab-btn ativo' : 'tab-btn'} onClick={() => setAba('registrar')}>➕ Anotar Pedido</button>
        <button className={aba === 'comandas' ? 'tab-btn ativo' : 'tab-btn'} onClick={() => setAba('comandas')}>📋 Comandas</button>
        <button className={aba === 'dashboard' ? 'tab-btn ativo' : 'tab-btn'} onClick={() => setAba('dashboard')}>📊 Dashboard</button>
      </div>

      <div className="admin-conteudo">
        {aba === 'mesas' && (
          <div className="admin-duas-colunas">
            <div className="tabela-pizzas">
              <h3>Mesas Livres</h3>
              {mesasLivres.length === 0 ? <p className="subtext">Nenhuma mesa livre no momento.</p> : (
                <div className="lista-adicionais-admin">
                  {mesasLivres.map((m) => (
                    <div key={m.id} className="adicional-admin-item">
                      <div><strong>Mesa {m.numero}</strong><span>{m.capacidade} lugares</span></div>
                      <button onClick={() => assumirMesa(m.id, meuUsername)} className="btn-salvar" style={{ width: 'auto', padding: '8px 16px' }}>Assumir Mesa</button>
                    </div>
                  ))}
                </div>
              )}

              <h3 style={{ marginTop: 24 }}>Aguardando Atendimento</h3>
              <p className="subtext" style={{ marginBottom: 12 }}>Mesas onde o cliente já fez o pedido pelo site, mas ainda não têm garçom.</p>
              {mesasAguardandoAtendimento.length === 0 ? <p className="subtext">Nenhuma mesa aguardando.</p> : (
                <div className="lista-adicionais-admin">
                  {mesasAguardandoAtendimento.map((m) => (
                    <div key={m.id} className="adicional-admin-item">
                      <div><strong>Mesa {m.numero}</strong><span>{m.capacidade} lugares</span></div>
                      <button onClick={() => assumirMesa(m.id, meuUsername)} className="btn-salvar" style={{ width: 'auto', padding: '8px 16px' }}>Assumir Mesa</button>
                    </div>
                  ))}
                </div>
              )}

              <h3 style={{ marginTop: 24 }}>Minhas Mesas</h3>
              {minhasMesas.length === 0 ? <p className="subtext">Você ainda não assumiu nenhuma mesa.</p> : (
                <div className="lista-adicionais-admin">
                  {minhasMesas.map((m) => (
                    <div key={m.id} className="adicional-admin-item">
                      <div><strong>Mesa {m.numero}</strong><span>{m.capacidade} lugares</span></div>
                      <button onClick={() => liberarMesa(m.id)} className="btn-excluir-adicional">Liberar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="tabela-pizzas">
              <h3>🔔 Chamados</h3>
              {chamadosPendentes.length === 0 ? <p className="subtext">Nenhum chamado pendente.</p> : (
                <div className="lista-adicionais-admin">
                  {chamadosPendentes.map((c) => (
                    <div key={c.id} className="adicional-admin-item">
                      <div><strong>{c.origem === 'cliente' ? 'Cliente chamando' : 'Cozinha avisando'}</strong><span>{c.mensagem}</span></div>
                      <button onClick={() => marcarAtendido(c.id)} className="btn-link-secundario">Marcar como atendido</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {aba === 'registrar' && (
          <div className="admin-duas-colunas">
            <form onSubmit={handleRegistrarPedido} className="form-admin-config">
              <h3>Anotar Pedido</h3>
              <div className="input-group">
                <label>Mesa</label>
                <select value={mesaSelecionada} onChange={(e) => setMesaSelecionada(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {mesas.map((m) => (
                    <option key={m.id} value={m.id}>
                      Mesa {m.numero}{m.garcomResponsavelUsername && m.garcomResponsavelUsername !== meuUsername ? ` (com ${m.garcomResponsavelUsername})` : ''}
                    </option>
                  ))}
                </select>
                <p className="subtext" style={{ marginTop: 6 }}>Se a mesa ainda não tiver garçom, ela é atribuída a você automaticamente ao anotar o pedido.</p>
              </div>

              <div className="input-group">
                <label>Item do cardápio</label>
                <select value={pizzaSelecionadaId} onChange={(e) => setPizzaSelecionadaId(e.target.value)}>
                  <option value="">Selecione...</option>
                  {pizzas.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>

              {pizzaSelecionada && !semTamanho && (
                <div className="input-group">
                  <label>Tamanho</label>
                  <div className="botoes-grupo">
                    {(['Brotinho', 'Média', 'Grande'] as const).map((t) => (
                      <button key={t} type="button" onClick={() => setTamanho(t)} className={tamanho === t ? 'btn-opcao ativo' : 'btn-opcao'}>{t}</button>
                    ))}
                  </div>
                </div>
              )}

              {pizzaSelecionada && temSelecaoDeItens && (
                <div className="input-group">
                  <label>{pizzaSelecionada.categoria === 'combo' ? `Itens do combo (${limiteItens})` : `Sabores (até ${limiteItens})`}</label>
                  <div className="extras-grid">
                    {itensDisponiveis.map((s) => (
                      <label key={s.id} className={itensSelecionados.includes(s.nome) ? 'checkbox-extra-sabor sabor-ativo' : 'checkbox-extra-sabor'}>
                        <input type="checkbox" checked={itensSelecionados.includes(s.nome)} onChange={() => toggleItemSelecionado(s.nome)} />
                        {s.nome}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button type="button" onClick={handleAdicionarItem} disabled={!pizzaSelecionadaId} className="btn-link-secundario" style={{ marginTop: 4 }}>+ Adicionar item à comanda</button>

              {itensRascunho.length > 0 && (
                <ul style={{ margin: '16px 0' }}>
                  {itensRascunho.map((i) => <li key={i.id}>{i.quantidade}x {i.nome} ({i.tamanho}) — R$ {i.precoUnitario.toFixed(2)}</li>)}
                </ul>
              )}

              <label className="opcao-pagamento-radio" style={{ marginBottom: 16 }}>
                <input type="checkbox" checked={incluirGorjeta} onChange={(e) => setIncluirGorjeta(e.target.checked)} />
                Cliente quer deixar 10% de gorjeta para mim
              </label>

              <button type="submit" disabled={itensRascunho.length === 0 || !mesaSelecionada} className="btn-crud-add">Enviar para a Cozinha</button>
            </form>
          </div>
        )}

        {aba === 'comandas' && (
          <div className="pedidos-dashboard">
            <h3>Comandas das Minhas Mesas</h3>
            {minhasComandas.length === 0 ? <p className="sem-pedidos">Nenhuma comanda aberta nas suas mesas.</p> : (
              <div className="lista-adicionais-admin">
                {minhasComandas.map((p) => {
                  const mesaNum = mesas.find((m) => m.id === p.mesaId)?.numero;
                  return (
                    <div key={p.id} className="pedido-card-admin" style={{ maxWidth: 'none' }}>
                      <div className="pedido-cabecalho">
                        <h4>Mesa {mesaNum} — Comanda #{p.id}</h4>
                        <span className="status-badge-admin">{p.status.toUpperCase()}</span>
                      </div>
                      <ul>
                        {p.itens.map((item) => (
                          <li key={item.id}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <input type="checkbox" checked={item.servido} onChange={(e) => marcarItemServido(p.id, item.id, e.target.checked)} />
                              {item.quantidade}x {item.nome} ({item.tamanho}) — R$ {(item.precoUnitario * item.quantidade).toFixed(2)} {item.servido ? '✅' : ''}
                            </label>
                          </li>
                        ))}
                      </ul>
                      <p className="total-admin">Total: R$ {p.total.toFixed(2)}</p>
                      {p.gorjeta && (
                        <p className="metodo-pagamento">Gorjeta: R$ {p.gorjeta.valor.toFixed(2)} {p.gorjeta.confirmadaPeloGarcom ? '(confirmada)' : '(aguardando confirmação)'}</p>
                      )}
                      <div className="acoes-status">
                        <div className="status-botoes-grupo">
                          {p.status === 'pronto' && (
                            <button onClick={() => atualizarStatus(p.id, 'entregue')} className="btn-salvar" style={{ width: 'auto', padding: '8px 16px' }}>Marcar como Servido</button>
                          )}
                          {p.status === 'entregue' && (
                            <button onClick={() => finalizarPedido(p.id)} className="btn-salvar" style={{ width: 'auto', padding: '8px 16px' }}>Finalizar Comanda (Pago)</button>
                          )}
                          {!p.gorjeta && (
                            <button onClick={() => definirGorjeta(p.id, meuUsername)} className="btn-link-secundario">+ Incluir gorjeta de 10%</button>
                          )}
                          {p.gorjeta && !p.gorjeta.confirmadaPeloGarcom && (
                            <button onClick={() => confirmarGorjeta(p.id)} className="btn-link-secundario">Confirmar Gorjeta</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {aba === 'dashboard' && (
          <div className="admin-duas-colunas">
            <div className="tabela-pizzas">
              <h3>📊 Meus Ganhos (gorjetas de 10%)</h3>
              <div className="status-botoes-grupo" style={{ marginBottom: 16 }}>
                <button onClick={() => setPeriodo('todos')} className={periodo === 'todos' ? 'periodo-btn ativo' : 'periodo-btn'}>Todos</button>
                <button onClick={() => setPeriodo('mensal')} className={periodo === 'mensal' ? 'periodo-btn ativo' : 'periodo-btn'}>Últimos 30 dias</button>
                <button onClick={() => setPeriodo('semanal')} className={periodo === 'semanal' ? 'periodo-btn ativo' : 'periodo-btn'}>Últimos 7 dias</button>
              </div>
              <div className="resumo-linha total"><span>Total em gorjetas:</span><span>R$ {totalGanhos.toFixed(2)}</span></div>
              <div className="resumo-linha"><span>Comandas atendidas no período:</span><span>{comandasAtendidas}</span></div>
              <p className="subtext" style={{ marginTop: 12 }}>A pizzaria trabalha com {config.formasPagamentoAceitas.join(', ')}.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
