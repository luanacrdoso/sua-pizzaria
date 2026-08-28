import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTenantStore } from '../../../store/tenant.store';
import { useCarrinhoStore } from '../../../store/carrinho.store';

export function PagamentoPixPage() {
  const { tenantId } = useParams<{ readonly tenantId: string }>();
  const navigate = useNavigate();

  const config = useTenantStore((state) => state.tenants.find((t) => t.id === tenantId));
  const esvaziarCarrinho = useCarrinhoStore((state) => state.esvaziarCarrinhoDoTenant);

  const [pedido, setPedido] = useState<any>(null);
  const [segundosRestantes, setSegundosRestantes] = useState(10);

  useEffect(() => {
    if (!config) return;
    const salvo = localStorage.getItem(`pizzashop-pedido-ativo-${config.id}`);
    if (salvo) {
      setPedido(JSON.parse(salvo));
    }
  }, [config]);

  useEffect(() => {
    if (segundosRestantes <= 0) {
      if (pedido && config) {
        esvaziarCarrinho(config.id);
        navigate(`/store/${config.id}/status/${pedido.id}`);
      }
      return;
    }

    const timer = setTimeout(() => {
      setSegundosRestantes(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [segundosRestantes, pedido, config, navigate, esvaziarCarrinho]);

  if (!config || !pedido) return null;

  return (
    <div className="container-pix">
      <div className="pix-card">
        <h2>⚡ Pagamento via PIX</h2>
        <p>Utilize o QR Code abaixo para pagar o seu pedido para <strong>{config.nome}</strong></p>

        {/* CORREÇÃO: Div com centralização e tamanho proporcional (150px) */}
        <div className="qr-code-box-compacta">
          <svg viewBox="0 0 100 100" className="qr-svg">
            <rect width="100" height="100" fill="#ffffff" />
            <path d="M5,5 h30 v30 h-30 z M15,15 h10 v10 h-10 z" fill="#000" />
            <path d="M65,5 h30 v30 h-30 z M75,15 h10 v10 h-10 z" fill="#000" />
            <path d="M5,65 h30 v30 h-30 z M15,75 h10 v10 h-10 z" fill="#000" />
            <rect x="40" y="40" width="20" height="20" fill={config.corPrimaria} />
            <rect x="10" y="45" width="15" height="10" fill="#000" />
            <rect x="50" y="10" width="15" height="15" fill="#000" />
            <rect x="75" y="75" width="10" height="10" fill="#000" />
            <rect x="45" y="70" width="15" height="15" fill="#000" />
          </svg>
        </div>

        <div className="pix-dados">
          <div className="dado-linha">
            <span>Chave PIX cadastrada:</span>
            <strong>{config.chavePix || config.donoEmail}</strong>
          </div>
          <div className="dado-linha">
            <span>Valor total a transferir:</span>
            <span className="valor-pix">R$ {Number(pedido.total).toFixed(2)}</span>
          </div>
        </div>

        <div className="pix-status-loading">
          <div className="loading-spinner-pix"></div>
          <p>Confirmando transferência bancária... ({segundosRestantes}s)</p>
        </div>

        <p className="pix-aviso-seguro">Segurança ponta a ponta. Não recarregue a aba do navegador.</p>
      </div>
    </div>
  );
}