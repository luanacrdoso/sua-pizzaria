import { Link } from 'react-router-dom';
import type { Pizza } from '../../../types';

interface PizzaCardProps {
  readonly pizza: Pizza;
}

export function PizzaCard({ pizza }: PizzaCardProps) {
  return (
    <article className="pizza-card">
      <div className="pizza-card-img-container">
        <img src={pizza.imagemUrl} alt={pizza.nome} />
        <span className="pizza-card-tag">{pizza.categoria}</span>
      </div>
      <div className="pizza-card-corpo">
        <h3>{pizza.nome}</h3>
        <p className="pizza-card-desc">
          {pizza.tipo === 'personalizavel' ? 'Monte sua própria combinação de sabores.' : pizza.descricao}
        </p>
        <div className="pizza-card-rodape">
          <div className="pizza-preco">
            <span className="legenda">a partir de</span>
            <span className="valor">R$ {Number(pizza.precoBrotinho).toFixed(2)}</span>
          </div>
          <Link to={`/pizza/${pizza.id}`} className="btn-pedir">Pedir 🍕</Link>
        </div>
      </div>
    </article>
  );
}
