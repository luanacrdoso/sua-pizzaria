import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRestauranteStore } from '../../../store/restaurante.store';
import { useCarrinhoStore } from '../../../store/carrinho.store';
import { usePedidosStore } from '../../../store/pedidos.store';

const TOLERANCIA_SEGUNDOS = 5 * 60;

function formatarTempo(segundos: number): string {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${min}:${seg.toString().padStart(2, '0')}`;
}

export function PagamentoPage() {
  const navigate = useNavigate();
  const config = useRestauranteStore((state) => state.config);
  const esvaziarCarrinho = useCarrinhoStore((state) => state.esvaziarCarrinho);
  const pedidos = usePedidosStore((state) => state.pedidos);
  const [hidratado, setHidratado] = useState(usePedidosStore.persist.hasHydrated());

  useEffect(() => {
    if (hidratado) return;
    const unsub = usePedidosStore.persist.onFinishHydration(() => setHidratado(true));
    return unsub;
  }, [hidratado]);

  const [confirmando, setConfirmando] = useState(true);
  const [expirado, setExpirado] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(TOLERANCIA_SEGUNDOS);

  const [orderId] = useState(() => sessionStorage.getItem('callidus-pedido-pendente-pix'));
  const pedido = pedidos.find((p) => p.id === orderId);

  const confirmarPagamento = () => {
    setConfirmando(false);
    esvaziarCarrinho();
    sessionStorage.removeItem('callidus-pedido-pendente-pix');
  };

  useEffect(() => {
    if (!orderId || !confirmando) return;
    const intervalo = setInterval(() => {
      setSegundosRestantes((atual) => {
        if (atual <= 1) {
          clearInterval(intervalo);
          setExpirado(true);
          setConfirmando(false);
          return 0;
        }
        return atual - 1;
      });
    }, 1000);
    return () => clearInterval(intervalo);
  }, [orderId, confirmando]);

  if (!hidratado) {
    return <div className="loading-wrap"><span className="loading-spinner" /><p>Carregando...</p></div>;
  }

  if (!orderId || !pedido) {
    return (
      <div className="status-container erro">
        <span>❌</span>
        <p>Nenhum pagamento pendente encontrado.</p>
        <Link to="/" className="btn-recarregar">Voltar ao Cardápio</Link>
      </div>
    );
  }

  const progresso = ((TOLERANCIA_SEGUNDOS - segundosRestantes) / TOLERANCIA_SEGUNDOS) * 100;

  return (
    <div className="container-pix">
      <div className="pix-card">
        <h2>Pagamento via Pix</h2>
        <p>Pedido #{pedido.id}</p>

        <div className="qr-code-box-compacta">
          <svg viewBox="0 0 100 100" className="qr-svg">
            <rect width="100" height="100" fill="white" />
            <rect x="10" y="10" width="25" height="25" fill="black" />
            <rect x="65" y="10" width="25" height="25" fill="black" />
            <rect x="10" y="65" width="25" height="25" fill="black" />
            <rect x="45" y="45" width="10" height="10" fill="black" />
            <rect x="45" y="60" width="10" height="10" fill="black" />
            <rect x="60" y="45" width="10" height="10" fill="black" />
          </svg>
        </div>

        <div className="pix-dados">
          <div className="dado-linha"><span>Chave Pix:</span><span>{config.chavePix}</span></div>
          <div className="dado-linha"><span>Valor:</span><span className="valor-pix">R$ {pedido.total.toFixed(2)}</span></div>
        </div>

        {expirado ? (
          <div className="auth-erro">⏱️ Tempo para pagamento esgotado. Volte ao carrinho e tente novamente.</div>
        ) : confirmando ? (
          <>
            <div className="pix-status-loading">
              <span className="loading-spinner-pix" /> Aguardando confirmação do pagamento...
            </div>
            <div className="pix-tolerancia">Você tem até <strong>{formatarTempo(segundosRestantes)}</strong> para pagar</div>
            <div className="pix-progresso-track">
              <div className="pix-progresso-fill" style={{ width: `${progresso}%`, backgroundColor: config.corPrimaria }} />
            </div>
            <button onClick={confirmarPagamento} className="btn-finalizar" style={{ backgroundColor: config.corPrimaria }}>
              🧪 Simular Pagamento Agora (ambiente de teste)
            </button>
          </>
        ) : (
          <>
            <div className="auth-sucesso">✓ Pagamento confirmado com sucesso!</div>
            <button onClick={() => navigate(`/pedido/${pedido.id}`)} className="btn-finalizar" style={{ backgroundColor: config.corPrimaria }}>
              Acompanhar Pedido
            </button>
          </>
        )}
      </div>
    </div>
  );
}
