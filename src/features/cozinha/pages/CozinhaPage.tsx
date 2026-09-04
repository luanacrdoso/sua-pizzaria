import { useState } from 'react';
import { usePedidosStore } from '../../../store/pedidos.store';
import { useChamadosStore } from '../../../store/chamados.store';
import { CardapioEditor } from '../../admin/components/CardapioEditor';

export function CozinhaPage() {
  const { pedidos, atualizarStatus } = usePedidosStore();
  const chamarGarcom = useChamadosStore((state) => state.chamarGarcom);

  const [aba, setAba] = useState<'pedidos' | 'cardapio'>('pedidos');
  const [avisoEnviado, setAvisoEnviado] = useState<string | null>(null);

  // A cozinha só cuida da produção: só pode dizer que um pedido entrou em
  // preparo ou que ficou pronto. Tudo depois disso (servir, entregar,
  // finalizar/pagar) é responsabilidade de outros perfis.
  const pedidosParaProduzir = pedidos.filter((p) => p.status === 'recebido' || p.status === 'preparo');

  const handleChamarGarcom = (pedidoId: string, mesaId?: string) => {
    chamarGarcom('cozinha', `Pedido #${pedidoId} está pronto para ser servido!`, mesaId);
    setAvisoEnviado(pedidoId);
    setTimeout(() => setAvisoEnviado(null), 2500);
  };

  return (
    <div className="container-admin">
      <div className="admin-header">
        <div><h2>🍕 Painel da Cozinha</h2><p>Atualize o cardápio e o preparo dos pedidos.</p></div>
      </div>

      <div className="admin-tabs">
        <button className={aba === 'pedidos' ? 'tab-btn ativo' : 'tab-btn'} onClick={() => setAba('pedidos')}>📦 Pedidos</button>
        <button className={aba === 'cardapio' ? 'tab-btn ativo' : 'tab-btn'} onClick={() => setAba('cardapio')}>🍕 Cardápio</button>
      </div>

      <div className="admin-conteudo">
        {aba === 'pedidos' && (
          <div className="pedidos-dashboard">
            <h3>Pedidos para Produzir</h3>
            {pedidosParaProduzir.length === 0 ? (
              <p className="sem-pedidos">Nenhum pedido aguardando preparo no momento.</p>
            ) : (
              <div className="lista-adicionais-admin">
                {pedidosParaProduzir.map((p) => (
                  <div key={p.id} className="pedido-card-admin" style={{ maxWidth: 'none' }}>
                    <div className="pedido-cabecalho">
                      <h4>#{p.id} — {p.clienteNome}</h4>
                      <span className="status-badge-admin">{p.tipo} · {p.status.toUpperCase()}</span>
                    </div>
                    <ul>
                      {p.itens.map((item) => (
                        <li key={item.id}>{item.quantidade}x {item.nome} ({item.tamanho}){item.observacoes ? ` — obs: ${item.observacoes}` : ''}</li>
                      ))}
                    </ul>
                    <div className="acoes-status">
                      <div className="status-botoes-grupo">
                        {p.status === 'recebido' && (
                          <button onClick={() => atualizarStatus(p.id, 'preparo')} className="btn-salvar" style={{ width: 'auto', padding: '8px 16px' }}>
                            Iniciar Preparo
                          </button>
                        )}
                        {p.status === 'preparo' && (
                          <>
                            <button onClick={() => atualizarStatus(p.id, 'pronto')} className="btn-salvar" style={{ width: 'auto', padding: '8px 16px' }}>
                              Marcar como Pronto
                            </button>
                            <button onClick={() => handleChamarGarcom(p.id, p.mesaId)} className="btn-link-secundario">
                              {avisoEnviado === p.id ? '🔔 Avisado!' : '🔔 Chamar Garçom'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {aba === 'cardapio' && <CardapioEditor />}
      </div>
    </div>
  );
}
