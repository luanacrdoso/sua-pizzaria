import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTenantStore } from '../../../store/tenant.store';

export function StatusPedidoPage() {
  const { tenantId } = useParams<{ readonly tenantId: string }>();
  const config = useTenantStore((state) => state.tenants.find((t) => t.id === tenantId));
  const [pedido, setPedido] = useState<any>(null);

  const [estrelas, setEstrelas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [avaliado, setAvaliado] = useState(false);

  useEffect(() => {
    if (!config) return;
    function checarStatus() {
      const salvo = localStorage.getItem(`pizzashop-pedido-ativo-${config?.id}`);
      if (salvo) {
        setPedido(JSON.parse(salvo));
      }
    }
    checarStatus();
    const interval = setInterval(checarStatus, 2000);
    return () => clearInterval(interval);
  }, [config]);

  if (!config) return null;

  if (!pedido) {
    return (
      <div className="container-status-vazio">
        <span>🔔</span>
        <p>Nenhum pedido ativo em {config.nome}.</p>
        <Link to={`/store/${config.id}`} className="btn-recarregar" style={{ backgroundColor: config.corPrimaria }}>
          Ir para o Cardápio
        </Link>
      </div>
    );
  }

  const obterStatusEtapa = (statusAtual: string, etapa: string) => {
    const ordem = ['recebido', 'preparo', 'entrega', 'entregue'];
    const idxAtual = ordem.indexOf(statusAtual);
    const idxEtapa = ordem.indexOf(etapa);

    if (idxAtual >= idxEtapa) return 'concluida';
    return 'pendente';
  };

  const handleConfirmarEntrega = () => {
    const atualizado = { ...pedido, status: 'entregue', confirmadoEntrega: true };
    setPedido(atualizado);
    localStorage.setItem(`pizzashop-pedido-ativo-${config.id}`, JSON.stringify(atualizado));
  };

  const handleEnviarAvaliacao = () => {
    if (estrelas === 0) {
      alert('Escolha pelo menos 1 estrela!');
      return;
    }
    const atualizado = { ...pedido, avaliacaoEstrelas: estrelas, avaliacaoComentario: comentario };
    setPedido(atualizado);
    localStorage.setItem(`pizzashop-pedido-ativo-${config.id}`, JSON.stringify(atualizado));
    setAvaliado(true);
  };

  return (
    <div className="status-layout-centralizado">
      <div className="container-status-caixa-branca">
        <h2>Acompanhamento do Pedido #{pedido.id}</h2>

        <div className="linha-do-tempo">
          <div className={`etapa ${obterStatusEtapa(pedido.status, 'recebido')}`}>
            <span className="icone-etapa">📝</span>
            <span className="nome-etapa">Recebido</span>
          </div>
          <div className={`etapa ${obterStatusEtapa(pedido.status, 'preparo')}`}>
            <span className="icone-etapa">👨‍🍳</span>
            <span className="nome-etapa">Preparo</span>
          </div>
          <div className={`etapa ${obterStatusEtapa(pedido.status, 'entrega')}`}>
            <span className="icone-etapa">🛵</span>
            <span className="nome-etapa">A Caminho</span>
          </div>
          <div className={`etapa ${obterStatusEtapa(pedido.status, 'entregue')}`}>
            <span className="icone-etapa">🎉</span>
            <span className="nome-etapa">Entregue</span>
          </div>
        </div>

        <div className="pedido-detalhe-caixa">
          <h3>Resumo do seu Pedido</h3>
          <ul>
            {pedido.itens.map((i: string, idx: number) => <li key={idx}>{i}</li>)}
          </ul>
          <div className="total">
            Total Pago: <strong>R$ {Number(pedido.total).toFixed(2)}</strong>
          </div>
          <div className="metodo-pagamento">
            Método de Pagamento: <strong>{pedido.pagamento}</strong>
          </div>
          <div className="metodo-pagamento">
            Cliente: <strong>{pedido.cliente}</strong>
          </div>
        </div>

        <div className="pedido-operacoes-status">
          {pedido.status !== 'entregue' ? (
            <div className="painel-operacao-pendente">
              <p className="previsao-espera">⏱️ Previsão de entrega: <strong>{config.tempoPreparoEstimado}</strong></p>
              
              <button onClick={handleConfirmarEntrega} className="btn-confirmar-entrega" style={{ backgroundColor: config.corPrimaria }}>
                Confirmar Entrega do Pedido ✓
              </button>
            </div>
          ) : (
            <div className="painel-avaliacao-entregue">
              <h3>Seu pedido chegou! 🎉</h3>
              {!avaliado && pedido.avaliacaoEstrelas === 0 ? (
                <div className="formulario-avaliacao">
                  <p>O que você achou do serviço e do sabor? Deixe sua avaliação:</p>
                  <div className="estrelas-selecao">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEstrelas(star)}
                        className={estrelas >= star ? "star-btn ativa" : "star-btn"}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Escreva um comentário opcional para a pizzaria..."
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    className="textarea-avaliacao"
                  />
                  <button onClick={handleEnviarAvaliacao} className="btn-enviar-avaliacao" style={{ backgroundColor: config.corPrimaria }}>
                    Enviar Avaliação
                  </button>
                </div>
              ) : (
                <div className="avaliacao-agradecimento">
                  <p>Agradecemos imensamente pela avaliação ({estrelas}/5 estrelas)!</p>
                  <Link to={`/store/${config.id}`} className="btn-voltar-home-status" style={{ backgroundColor: config.corPrimaria }}>Voltar ao Cardápio</Link>
                </div>
              )}
            </div>
          )}

          <div className="contato-pizzaria-status">
            <h4>Fale Conosco</h4>
            <div className="botoes-contato-flex">
              {config.telefone ? (
                <>
                  <a href={`tel:${config.telefone}`} className="btn-contato tel">📞 Ligar na Loja</a>
                  <a
                    href={`https://wa.me/55${config.telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-contato wpp"
                  >
                    💬 Chamar WhatsApp
                  </a>
                </>
              ) : (
                <p className="sem-contato-aviso">Esta pizzaria ainda não cadastrou um telefone de contato.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}