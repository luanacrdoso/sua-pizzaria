import { Link } from 'react-router-dom';
import { useCarrinhoStore } from '../../../store/carrinho.store';
import { useRestauranteStore } from '../../../store/restaurante.store';

export function CarrinhoPage() {
  const config = useRestauranteStore((state) => state.config);
  const { itens, atualizarQuantidade, removerItem, obterSubtotal } = useCarrinhoStore();

  const subtotal = obterSubtotal();
  const total = subtotal + (subtotal > 0 ? config.taxaEntrega : 0);

  if (itens.length === 0) {
    return (
      <div className="status-container vazio">
        <span>🛒</span>
        <p>Seu carrinho está vazio.</p>
        <Link to="/" className="btn-recarregar" style={{ backgroundColor: config.corPrimaria }}>Ir para o Cardápio</Link>
      </div>
    );
  }

  return (
    <div className="container-carrinho">
      <h2>Seu Carrinho</h2>
      <div className="carrinho-grid">
        <div className="carrinho-lista">
          {itens.map((item) => (
            <article key={item.idUnico} className="carrinho-item">
              <img src={item.pizza.imagemUrl} alt={item.pizza.nome} className="carrinho-item-img" />
              <div className="carrinho-item-detalhes">
                <h4>{item.pizza.nome}</h4>
                <p>Tamanho: {item.tamanho}</p>
                {item.extras.length > 0 && <p className="extras">Extras: {item.extras.join(', ')}</p>}
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
          <div className="resumo-linha"><span>Subtotal:</span><span>R$ {subtotal.toFixed(2)}</span></div>
          <div className="resumo-linha"><span>Taxa de Entrega (se aplicável):</span><span>R$ {config.taxaEntrega.toFixed(2)}</span></div>
          <div className="resumo-linha total"><span>Total estimado:</span><span>R$ {total.toFixed(2)}</span></div>
          <Link to="/checkout" className="btn-prosseguir" style={{ backgroundColor: config.corPrimaria }}>Prosseguir ➡️</Link>
        </div>
      </div>
    </div>
  );
}
