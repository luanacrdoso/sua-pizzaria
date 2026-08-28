import { Link, useParams } from 'react-router-dom';
import { useCarrinhoStore } from '../../../store/carrinho.store';
import { useTenantStore } from '../../../store/tenant.store';

export function CarrinhoPage() {
  const { tenantId } = useParams<{ readonly tenantId: string }>();
  const config = useTenantStore((state) => state.tenants.find((t) => t.id === tenantId));
  const { itens, atualizarQuantidade, removerItem, obterSubtotal } = useCarrinhoStore();

  if (!config) return null;

  const itensDoTenant = itens.filter(item => item.tenantId === config.id);
  const subtotal = obterSubtotal(config.id);
  const total = subtotal + (subtotal > 0 ? config.taxaEntrega : 0);

  if (itensDoTenant.length === 0) {
    return (
      <div className="status-container vazio">
        <span>🛒</span>
        <p>Seu carrinho para esta pizzaria está vazio.</p>
        <Link to={`/store/${config.id}`} className="btn-recarregar" style={{ backgroundColor: config.corPrimaria }}>
          Ir para o Cardápio
        </Link>
      </div>
    );
  }

  return (
    <div className="container-carrinho">
      <h2>Seu Carrinho em "{config.nome}"</h2>

      <div className="carrinho-grid">
        <div className="carrinho-lista">
          {itensDoTenant.map((item) => (
            <article key={item.idUnico} className="carrinho-item">
              <img src={item.pizza.imagemUrl} alt={item.pizza.nome} className="carrinho-item-img" />
              <div className="carrinho-item-detalhes">
                <h4>{item.pizza.nome}</h4>
                <p>Tamanho: {item.tamanho} | Borda: {item.borda}</p>
                {item.extras.length > 0 && <p className="extras">Extras adicionados: {item.extras.join(', ')}</p>}
                {item.observacoes && <p className="obs">"{item.observacoes}"</p>}
                <strong className="preco-unit">Preço Unitário: R$ {item.precoUnitario.toFixed(2)}</strong>
              </div>

              <div className="carrinho-item-acoes">
                <div className="quantidade-controle">
                  <button onClick={() => atualizarQuantidade(item.idUnico, item.quantidade - 1)}>-</button>
                  <span>{item.quantidade}</span>
                  <button onClick={() => atualizarQuantidade(item.idUnico, item.quantidade + 1)}>+</button>
                </div>
                <button onClick={() => removerItem(item.idUnico)} className="btn-remover">Remover</button>
              </div>
            </article>
          ))}
        </div>

        <div className="carrinho-resumo">
          <h3>Resumo do Pedido</h3>
          <div className="resumo-linha">
            <span>Subtotal:</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          <div className="resumo-linha">
            <span>Taxa de Entrega:</span>
            <span>R$ {config.taxaEntrega.toFixed(2)}</span>
          </div>
          <div className="resumo-linha total">
            <span>Total:</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>

          <Link to={`/store/${config.id}/checkout`} className="btn-prosseguir" style={{ backgroundColor: config.corPrimaria }}>
            Prosseguir para o Checkout ➡️
          </Link>
        </div>
      </div>
    </div>
  );
}