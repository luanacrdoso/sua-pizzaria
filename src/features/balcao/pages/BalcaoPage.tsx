import { useState } from 'react';
import { useRestauranteStore } from '../../../store/restaurante.store';
import { useCardapioStore } from '../../../store/cardapio.store';
import { usePedidosStore } from '../../../store/pedidos.store';
import type { ItemPedido, Pedido, Tamanho } from '../../../types';

export function BalcaoPage() {
  const mesas = useRestauranteStore((state) => state.mesas);
  const pizzas = useCardapioStore((state) => state.pizzas);
  const { pedidos, criarPedido, atualizarStatus, finalizarPedido } = usePedidosStore();

  const [aba, setAba] = useState<'mesas' | 'registrar' | 'pedidos'>('mesas');

  const [clienteNome, setClienteNome] = useState('');
  const [pizzaSelecionadaId, setPizzaSelecionadaId] = useState('');
  const [tamanho, setTamanho] = useState<Tamanho>('Grande');
  const [itensSelecionados, setItensSelecionados] = useState<readonly string[]>([]);
  const [itensRascunho, setItensRascunho] = useState<readonly ItemPedido[]>([]);

  const pizzaSelecionada = pizzas.find((p) => p.id === pizzaSelecionadaId);
  const semTamanho = pizzaSelecionada?.categoria === 'bebida' || pizzaSelecionada?.categoria === 'combo';
  const temSelecaoDeItens = pizzaSelecionada?.tipo === 'personalizavel';
  const itensDisponiveis = pizzaSelecionada ? pizzas.filter((p) => pizzaSelecionada.saboresPermitidosIds?.includes(p.id)) : [];
  const limiteItens = !pizzaSelecionada ? 1
    : pizzaSelecionada.categoria === 'combo' ? (pizzaSelecionada.maxSaboresGrande ?? 2)
    : tamanho === 'Brotinho' ? (pizzaSelecionada.maxSaboresBrotinho ?? 1)
    : tamanho === 'Média' ? (pizzaSelecionada.maxSaboresMedia ?? 2) : (pizzaSelecionada.maxSaboresGrande ?? 3);

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
    if (!clienteNome || itensRascunho.length === 0) return;

    const subtotal = itensRascunho.reduce((acc, i) => acc + i.precoUnitario * i.quantidade, 0);

    const pedido: Pedido = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      tipo: 'retirada',
      clienteUsername: 'balcao',
      clienteNome,
      clienteTelefone: '',
      itens: itensRascunho,
      subtotal,
      taxaEntrega: 0,
      total: subtotal,
      formaPagamento: 'Dinheiro',
      status: 'recebido',
      criadoEm: Date.now()
    };

    criarPedido(pedido);
    setClienteNome('');
    setItensRascunho([]);
    setAba('pedidos');
  };

  const pedidosEmAndamento = pedidos.filter((p) => p.status !== 'finalizado');

  return (
    <div className="container-admin">
      <div className="admin-header">
        <div><h2>🧾 Painel do Balcão</h2><p>Acompanhe as mesas e registre pedidos de retirada.</p></div>
      </div>

      <div className="admin-tabs">
        <button className={aba === 'mesas' ? 'tab-btn ativo' : 'tab-btn'} onClick={() => setAba('mesas')}>🪑 Mesas</button>
        <button className={aba === 'registrar' ? 'tab-btn ativo' : 'tab-btn'} onClick={() => setAba('registrar')}>➕ Registrar Retirada</button>
        <button className={aba === 'pedidos' ? 'tab-btn ativo' : 'tab-btn'} onClick={() => setAba('pedidos')}>📦 Pedidos</button>
      </div>

      <div className="admin-conteudo">
        {aba === 'mesas' && (
          <div className="tabela-pizzas">
            <h3>Disponibilidade de Mesas</h3>
            {mesas.length === 0 ? <p className="subtext">Nenhuma mesa cadastrada ainda.</p> : (
              <div className="lista-adicionais-admin">
                {mesas.map((m) => (
                  <div key={m.id} className="adicional-admin-item">
                    <div><strong>Mesa {m.numero}</strong><span>{m.capacidade} lugares</span></div>
                    <span className={`status-badge-admin ${m.status === 'livre' ? 'entregue' : ''}`}>{m.status === 'livre' ? 'LIVRE' : m.garcomResponsavelUsername ? `OCUPADA (${m.garcomResponsavelUsername})` : 'AGUARDANDO GARÇOM'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {aba === 'registrar' && (
          <div className="admin-duas-colunas">
            <form onSubmit={handleRegistrarPedido} className="form-admin-config">
              <h3>Registrar Pedido de Retirada</h3>
              <div className="input-group"><label>Nome do cliente</label><input type="text" value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} required /></div>

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

              <button type="button" onClick={handleAdicionarItem} disabled={!pizzaSelecionadaId} className="btn-link-secundario" style={{ marginTop: 4 }}>+ Adicionar item</button>

              {itensRascunho.length > 0 && (
                <ul style={{ margin: '16px 0' }}>
                  {itensRascunho.map((i) => <li key={i.id}>{i.quantidade}x {i.nome} ({i.tamanho}) — R$ {i.precoUnitario.toFixed(2)}</li>)}
                </ul>
              )}

              <button type="submit" className="btn-crud-add">Registrar Pedido</button>
            </form>
          </div>
        )}

        {aba === 'pedidos' && (
          <div className="pedidos-dashboard">
            <h3>Pedidos em Andamento</h3>
            {pedidosEmAndamento.length === 0 ? (
              <p className="sem-pedidos">Nenhum pedido em andamento.</p>
            ) : (
              <div className="lista-adicionais-admin">
                {pedidosEmAndamento.map((p) => (
                  <div key={p.id} className="pedido-card-admin" style={{ maxWidth: 'none' }}>
                    <div className="pedido-cabecalho">
                      <h4>#{p.id} — {p.clienteNome}</h4>
                      <span className="status-badge-admin">{p.status.toUpperCase()}</span>
                    </div>
                    <ul>
                      {p.itens.map((item) => (
                        <li key={item.id}>{item.quantidade}x {item.nome} ({item.tamanho}) — R$ {(item.precoUnitario * item.quantidade).toFixed(2)}</li>
                      ))}
                    </ul>
                    <p className="total-admin">Total: R$ {p.total.toFixed(2)} · {p.tipo}</p>
                    <div className="acoes-status">
                      <div className="status-botoes-grupo">
                        {p.tipo === 'retirada' && p.status === 'pronto' && (
                          <button onClick={() => atualizarStatus(p.id, 'entregue')} className="btn-salvar" style={{ width: 'auto', padding: '8px 16px' }}>Confirmar Retirada</button>
                        )}
                        {p.tipo === 'retirada' && p.status === 'entregue' && (
                          <button onClick={() => finalizarPedido(p.id)} className="btn-salvar" style={{ width: 'auto', padding: '8px 16px' }}>Marcar como Pago</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
