import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRestauranteStore } from '../../../store/restaurante.store';
import { usePedidosStore } from '../../../store/pedidos.store';
import { useChamadosStore } from '../../../store/chamados.store';
import type { StatusPedido } from '../../../types';

const ETAPAS: readonly { readonly status: StatusPedido; readonly icone: string }[] = [
  { status: 'recebido', icone: '📥' },
  { status: 'preparo', icone: '👨‍🍳' },
  { status: 'pronto', icone: '🍕' },
  { status: 'entregue', icone: '✅' },
  { status: 'finalizado', icone: '💰' }
];

export function StatusPedidoPage() {
  const { orderId } = useParams<{ readonly orderId: string }>();
  const config = useRestauranteStore((state) => state.config);
  const pedidos = usePedidosStore((state) => state.pedidos);
  const confirmarEntregaCliente = usePedidosStore((state) => state.confirmarEntregaCliente);
  const avaliarPedido = usePedidosStore((state) => state.avaliarPedido);
  const chamarGarcom = useChamadosStore((state) => state.chamarGarcom);

  const [estrelas, setEstrelas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [chamadoEnviado, setChamadoEnviado] = useState(false);

  const pedido = pedidos.find((p) => p.id === orderId);

  if (!pedido) {
    return (
      <div className="status-layout-centralizado">
        <div className="container-status-vazio">
          <span>❌</span>
          <p>Pedido não encontrado.</p>
          <Link to="/" className="btn-voltar-home-status" style={{ backgroundColor: config.corPrimaria }}>Voltar ao Início</Link>
        </div>
      </div>
    );
  }

  // O rótulo do 4º checkpoint muda conforme o tipo de pedido, mas é o
  // mesmo status internamente ('entregue').
  const rotuloEntregue = pedido.tipo === 'presencial' ? 'Servido' : 'Entregue';
  const rotulos: Record<StatusPedido, string> = {
    recebido: 'Recebido',
    preparo: 'Em Preparo',
    pronto: pedido.tipo === 'retirada' ? 'Pronto p/ Retirar' : 'Pronto',
    entregue: rotuloEntregue,
    finalizado: 'Finalizado'
  };

  const indiceAtual = ETAPAS.findIndex((e) => e.status === pedido.status);
  const aguardandoAvaliacao = pedido.status === 'entregue' || pedido.status === 'finalizado';
  const avaliado = (pedido.avaliacaoEstrelas ?? 0) > 0;

  const handleChamarGarcom = () => {
    chamarGarcom('cliente', `Cliente do pedido #${pedido.id} está chamando o garçom.`, pedido.mesaId);
    setChamadoEnviado(true);
  };

  const handleEnviarAvaliacao = () => {
    if (estrelas === 0) return;
    avaliarPedido(pedido.id, estrelas, comentario);
  };

  return (
    <div className="status-layout-centralizado">
      <div className="container-status-caixa-branca">
        <h2>Acompanhe seu Pedido #{pedido.id}</h2>

        <div className="linha-do-tempo">
          {ETAPAS.map((etapa, idx) => (
            <div key={etapa.status} className={idx <= indiceAtual ? 'etapa concluida' : 'etapa'}>
              <div className="icone-etapa">{etapa.icone}</div>
              <span className="nome-etapa">{rotulos[etapa.status]}</span>
            </div>
          ))}
        </div>

        <div className="pedido-detalhe-caixa">
          <h3>Resumo do Pedido</h3>
          <ul>
            {pedido.itens.map((item) => (
              <li key={item.id}>{item.quantidade}x {item.nome} ({item.tamanho}) {item.servido && pedido.tipo === 'presencial' ? '· já servido ✅' : ''}</li>
            ))}
          </ul>
          <p className="total">Total: <strong>R$ {pedido.total.toFixed(2)}</strong></p>
          <p className="metodo-pagamento">Pagamento: {pedido.formaPagamento}</p>
          {pedido.cpfNota && <p className="metodo-pagamento">CPF na nota: {pedido.cpfNota}</p>}
          {pedido.tipo === 'entrega' && <p className="metodo-pagamento">Entrega em: {pedido.enderecoEntrega}</p>}
          {pedido.gorjeta && <p className="metodo-pagamento">Gorjeta ao garçom: R$ {pedido.gorjeta.valor.toFixed(2)} {pedido.gorjeta.confirmadaPeloGarcom ? '(confirmada)' : '(aguardando confirmação do garçom)'}</p>}
        </div>

        {pedido.tipo === 'presencial' && pedido.status !== 'finalizado' && (
          <div className="painel-operacao-pendente">
            <button onClick={handleChamarGarcom} disabled={chamadoEnviado} className="btn-confirmar-entrega" style={{ backgroundColor: config.corPrimaria }}>
              {chamadoEnviado ? '🔔 Garçom foi chamado!' : '🔔 Chamar Garçom'}
            </button>
          </div>
        )}

        {pedido.tipo === 'entrega' && pedido.status === 'pronto' && pedido.motoboyUsername && (
          <div className="painel-operacao-pendente">
            <p className="previsao-espera">Seu pedido está a caminho com {pedido.motoboyUsername}!</p>
            <button onClick={() => confirmarEntregaCliente(pedido.id)} className="btn-confirmar-entrega" style={{ backgroundColor: config.corPrimaria }}>
              ✅ Confirmar que Recebi o Pedido
            </button>
          </div>
        )}

        {aguardandoAvaliacao && (
          <div className="painel-avaliacao-entregue">
            {!avaliado ? (
              <div className="formulario-avaliacao">
                <h3>Como foi sua experiência?</h3>
                <p>Avalie seu pedido:</p>
                <div className="estrelas-selecao">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setEstrelas(n)} className={n <= estrelas ? 'star-btn ativa' : 'star-btn'}>★</button>
                  ))}
                </div>
                <textarea className="textarea-avaliacao" placeholder="Deixe um comentário (opcional)" value={comentario} onChange={(e) => setComentario(e.target.value)} />
                <button onClick={handleEnviarAvaliacao} className="btn-enviar-avaliacao" style={{ backgroundColor: config.corPrimaria }}>Enviar Avaliação</button>
              </div>
            ) : (
              <div className="avaliacao-agradecimento">
                <p>Agradecemos imensamente pela avaliação ({pedido.avaliacaoEstrelas}/5 estrelas)!</p>
                <div className="botoes-agradecimento-flex">
                  <Link to="/" className="btn-voltar-home-status" style={{ backgroundColor: config.corPrimaria }}>Voltar ao Cardápio</Link>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="contato-pizzaria-status">
          <h4>Precisa falar com a pizzaria?</h4>
          <div className="botoes-contato-flex">
            {config.telefone ? (
              <>
                <a href={`tel:${config.telefone}`} className="btn-contato tel">📞 Ligar</a>
                <a href={`https://wa.me/55${config.telefone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="btn-contato wpp">💬 WhatsApp</a>
              </>
            ) : (
              <p className="sem-contato-aviso">Telefone de contato não cadastrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
