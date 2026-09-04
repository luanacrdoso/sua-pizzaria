import { useState } from 'react';
import { useAuthStore } from '../../../store/auth.store';
import { usePedidosStore } from '../../../store/pedidos.store';

type Periodo = 'todos' | 'mensal' | 'semanal';

const UM_DIA_MS = 24 * 60 * 60 * 1000;

export function MotoboyPage() {
  const usuarioLogado = useAuthStore((state) => state.usuarioLogado);
  const { pedidos, assumirEntrega, atualizarStatus, finalizarPedido } = usePedidosStore();

  const [aba, setAba] = useState<'disponiveis' | 'minhas' | 'dashboard'>('disponiveis');
  const [periodo, setPeriodo] = useState<Periodo>('todos');

  const meuUsername = usuarioLogado?.username ?? '';

  // Fica "disponível para retirar" quando a cozinha marca como pronto —
  // antes esse filtro olhava para o status 'preparo', o que fazia o pedido
  // nunca aparecer aqui (a cozinha não tinha como avançar além de "pronto").
  const disponiveis = pedidos.filter((p) => p.tipo === 'entrega' && p.status === 'pronto' && !p.motoboyUsername);
  const minhasEntregas = pedidos.filter((p) => p.motoboyUsername === meuUsername);
  const aCaminho = minhasEntregas.filter((p) => p.status === 'pronto');
  const entreguesAguardandoFinalizar = minhasEntregas.filter((p) => p.status === 'entregue');

  const dentroDoPeriodo = (criadoEm: number) => {
    if (periodo === 'todos') return true;
    const limite = periodo === 'semanal' ? 7 * UM_DIA_MS : 30 * UM_DIA_MS;
    return Date.now() - criadoEm <= limite;
  };

  const entregasConcluidas = minhasEntregas.filter(
    (p) => (p.status === 'entregue' || p.status === 'finalizado') && dentroDoPeriodo(p.criadoEm)
  );
  const totalGanhos = entregasConcluidas.reduce((acc, p) => acc + p.taxaEntrega, 0);

  const handleAssumir = (pedidoId: string) => {
    if (!meuUsername) return;
    assumirEntrega(pedidoId, meuUsername);
  };

  return (
    <div className="container-admin">
      <div className="admin-header">
        <div><h2>🛵 Painel do Motoboy</h2><p>Assuma entregas, confirme e acompanhe seu histórico.</p></div>
      </div>

      <div className="admin-tabs">
        <button className={aba === 'disponiveis' ? 'tab-btn ativo' : 'tab-btn'} onClick={() => setAba('disponiveis')}>
          📦 Disponíveis {disponiveis.length > 0 && <span className="badge-carrinho">{disponiveis.length}</span>}
        </button>
        <button className={aba === 'minhas' ? 'tab-btn ativo' : 'tab-btn'} onClick={() => setAba('minhas')}>🛵 Minhas Entregas</button>
        <button className={aba === 'dashboard' ? 'tab-btn ativo' : 'tab-btn'} onClick={() => setAba('dashboard')}>📊 Dashboard</button>
      </div>

      <div className="admin-conteudo">
        {aba === 'disponiveis' && (
          <div className="pedidos-dashboard">
            <h3>Entregas Disponíveis</h3>
            <p className="subtext" style={{ marginBottom: 16 }}>Você pode assumir mais de uma entrega ao mesmo tempo.</p>
            {disponiveis.length === 0 ? <p className="sem-pedidos">Nenhuma entrega pronta para retirada no momento.</p> : (
              <div className="lista-adicionais-admin">
                {disponiveis.map((p) => (
                  <div key={p.id} className="pedido-card-admin" style={{ maxWidth: 'none' }}>
                    <div className="pedido-cabecalho">
                      <h4>#{p.id} — {p.clienteNome}</h4>
                      <span className="status-badge-admin">R$ {p.taxaEntrega.toFixed(2)} de taxa</span>
                    </div>
                    <p className="metodo-pagamento">{p.enderecoEntrega}</p>
                    <ul>
                      {p.itens.map((item) => (
                        <li key={item.id}>{item.quantidade}x {item.nome} ({item.tamanho})</li>
                      ))}
                    </ul>
                    <button onClick={() => handleAssumir(p.id)} className="btn-salvar" style={{ width: 'auto', padding: '8px 16px' }}>Assumir Entrega</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {aba === 'minhas' && (
          <div className="admin-duas-colunas">
            <div className="tabela-pizzas">
              <h3>A Caminho</h3>
              {aCaminho.length === 0 ? <p className="subtext">Nenhuma entrega a caminho no momento.</p> : (
                <div className="lista-adicionais-admin">
                  {aCaminho.map((p) => (
                    <div key={p.id} className="pedido-card-admin" style={{ maxWidth: 'none' }}>
                      <div className="pedido-cabecalho">
                        <h4>#{p.id} — {p.clienteNome}</h4>
                        <span className="status-badge-admin">R$ {p.taxaEntrega.toFixed(2)} de taxa</span>
                      </div>
                      <p className="metodo-pagamento">{p.enderecoEntrega}</p>
                      <ul>
                        {p.itens.map((item) => (
                          <li key={item.id}>{item.quantidade}x {item.nome} ({item.tamanho})</li>
                        ))}
                      </ul>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {p.clienteTelefone && (
                          <a href={`https://wa.me/55${p.clienteTelefone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="btn-link-secundario">💬 Contatar</a>
                        )}
                        <button onClick={() => atualizarStatus(p.id, 'entregue')} className="btn-salvar" style={{ width: 'auto', padding: '8px 16px' }}>Confirmar Entrega</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="tabela-pizzas">
              <h3>Entregues — Aguardando Fechar</h3>
              {entreguesAguardandoFinalizar.length === 0 ? <p className="subtext">Nenhuma entrega aguardando fechamento.</p> : (
                <div className="lista-adicionais-admin">
                  {entreguesAguardandoFinalizar.map((p) => (
                    <div key={p.id} className="adicional-admin-item">
                      <div><strong>#{p.id} — {p.clienteNome}</strong><span>R$ {p.total.toFixed(2)} · {p.formaPagamento}</span></div>
                      <button onClick={() => finalizarPedido(p.id)} className="btn-salvar" style={{ width: 'auto', padding: '8px 16px' }}>Marcar como Pago/Finalizado</button>
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
              <h3>📊 Meu Histórico</h3>
              <div className="status-botoes-grupo" style={{ marginBottom: 16 }}>
                <button onClick={() => setPeriodo('todos')} className={periodo === 'todos' ? 'periodo-btn ativo' : 'periodo-btn'}>Todos</button>
                <button onClick={() => setPeriodo('mensal')} className={periodo === 'mensal' ? 'periodo-btn ativo' : 'periodo-btn'}>Últimos 30 dias</button>
                <button onClick={() => setPeriodo('semanal')} className={periodo === 'semanal' ? 'periodo-btn ativo' : 'periodo-btn'}>Últimos 7 dias</button>
              </div>
              <div className="resumo-linha total"><span>Entregas concluídas no período:</span><span>{entregasConcluidas.length}</span></div>
              <div className="resumo-linha"><span>Valor ganho (taxas de entrega):</span><span>R$ {totalGanhos.toFixed(2)}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
