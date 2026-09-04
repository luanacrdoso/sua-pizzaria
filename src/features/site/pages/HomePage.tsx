import { useMemo, useState } from 'react';
import { useRestauranteStore } from '../../../store/restaurante.store';
import { useCardapioStore } from '../../../store/cardapio.store';
import { usePedidosStore } from '../../../store/pedidos.store';
import { Estrelas } from '../../../components/Estrelas';
import { PizzaCard } from '../components/PizzaCard';

const CATEGORIAS = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'tradicional', rotulo: 'Tradicionais' },
  { valor: 'especial', rotulo: 'Especiais' },
  { valor: 'vegetariana', rotulo: 'Vegetarianas' },
  { valor: 'doce', rotulo: 'Doces' },
  { valor: 'bebida', rotulo: 'Bebidas' },
  { valor: 'combo', rotulo: 'Combos' }
] as const;

export function HomePage() {
  const config = useRestauranteStore((state) => state.config);
  const pizzas = useCardapioStore((state) => state.pizzas);
  const pedidos = usePedidosStore((state) => state.pedidos);

  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState<(typeof CATEGORIAS)[number]['valor']>('todas');

  const avaliacoes = pedidos.filter((p) => (p.avaliacaoEstrelas ?? 0) > 0);
  const media = avaliacoes.length > 0
    ? avaliacoes.reduce((acc, p) => acc + (p.avaliacaoEstrelas ?? 0), 0) / avaliacoes.length
    : 0;

  const pizzasFiltradas = useMemo(() => {
    return pizzas.filter((p) => {
      const bateCategoria = categoria === 'todas' || p.categoria === categoria;
      const bateBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
      return bateCategoria && bateBusca;
    });
  }, [pizzas, categoria, busca]);

  return (
    <div className="cardapio-container">
      <section
        className="home-hero-capa"
        style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.55)), url(${config.capaUrl})` }}
      >
        <img src={config.logoUrl} alt={config.nome} className="home-hero-logo" />
        <h1>{config.nome}</h1>
        <p>{config.descricao}</p>
        <Estrelas media={media} quantidade={avaliacoes.length} />
        <div className="banner-badges">
          <span className="badge-item">📍 {config.endereco}</span>
          <span className="badge-item">🕒 {config.diasFuncionamento} · {config.horarioFuncionamento}</span>
          <span className="badge-item">🛵 Taxa de entrega: R$ {config.taxaEntrega.toFixed(2)}</span>
        </div>
      </section>

      <div className="controles-cardapio">
        <div className="categorias-list">
          {CATEGORIAS.map((c) => (
            <button
              key={c.valor}
              onClick={() => setCategoria(c.valor)}
              className="btn-categoria"
              style={categoria === c.valor ? { backgroundColor: config.corPrimaria, color: 'white', borderColor: config.corPrimaria } : {}}
            >
              {c.rotulo}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Buscar no cardápio..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="campo-busca"
        />
      </div>

      {pizzas.length === 0 ? (
        <div className="cardapio-vazio-cadastro">
          <p>Este cardápio ainda está sendo preparado pela equipe da pizzaria. Volte em breve! 🍕</p>
        </div>
      ) : pizzasFiltradas.length === 0 ? (
        <div className="sem-resultados">
          <p>Nenhuma pizza encontrada para esse filtro.</p>
        </div>
      ) : (
        <div className="pizzas-grid">
          {pizzasFiltradas.map((pizza) => <PizzaCard key={pizza.id} pizza={pizza} />)}
        </div>
      )}
    </div>
  );
}
