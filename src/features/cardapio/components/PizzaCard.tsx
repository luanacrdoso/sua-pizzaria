import { Link, useParams } from 'react-router-dom';
import type { Pizza } from '../types/pizza';

interface PizzaCardProps {
  readonly pizza: Pizza;
}

export function PizzaCard({ pizza }: PizzaCardProps) {
  const { tenantId } = useParams<{ readonly tenantId: string }>();

  return (
    <article className="pizza-card">
      <div className="pizza-card-img-container">
        <img src={pizza.imagemUrl} alt={pizza.nome} loading="lazy" />
        <span className="pizza-card-tag">{pizza.categoria}</span>
      </div>

      <div className="pizza-card-corpo">
        <header>
          <h3>{pizza.nome}</h3>
        </header>
        <p className="pizza-card-desc">{pizza.descricao}</p>

        <div className="pizza-card-rodape">
          <div className="pizza-preco">
            <span className="legenda">
              {pizza.tipo === 'personalizavel' ? 'Monte a sua' : 'A partir de'}
            </span>
            <span className="valor">R$ {Number(pizza.precoBrotinho).toFixed(2)}</span>
          </div>

          <Link to={`/store/${tenantId}/pizza/${pizza.id}`} className="btn-pedir">
            {pizza.tipo === 'personalizavel' ? 'Escolher Sabores 🎨' : 'Montar Pizza 🍕'}
          </Link>
        </div>
      </div>
    </article>
  );
}