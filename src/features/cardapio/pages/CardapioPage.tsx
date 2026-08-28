import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pizzaService } from '../api/pizza.service';
import type { Pizza, CategoriaPizza } from '../types/pizza';
import { PizzaCard } from '../components/PizzaCard';
import { Loading } from '../../../components/Loading';
import { useTenantStore } from '../../../store/tenant.store';

export function CardapioPage() {
  const { tenantId } = useParams<{ readonly tenantId: string }>();
  const currentTenantId = tenantId || '';
  const config = useTenantStore((state) => state.tenants.find((t) => t.id === currentTenantId));
  
  const [pizzas, setPizzas] = useState<readonly Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [pesquisa, setPesquisa] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaPizza | 'todos'>('todos');

  useEffect(() => {
    if (!currentTenantId) return;
    async function carregarCardapio() {
      try {
        setLoading(true);
        const dados = await pizzaService.listarTodas(currentTenantId);
        setPizzas(dados);
      } catch (err) {
        setErro("Não foi possível carregar o cardápio. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }
    carregarCardapio();
  }, [tenantId]);

  if (!config) return null;
  if (loading) return <Loading />;

  const pizzasFiltradas = pizzas.filter((pizza) => {
    const atendePesquisa = pizza.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
                          pizza.descricao.toLowerCase().includes(pesquisa.toLowerCase());
    const atendeCategoria = categoriaAtiva === 'todos' || pizza.categoria === categoriaAtiva;
    return atendePesquisa && atendeCategoria;
  });

  return (
    <div className="cardapio-container">
      <section className="cardapio-banner">
        <div className="banner-conteudo">
          <span className="banner-tag" style={{ backgroundColor: config.corSecundaria }}>🍕 {config.diasFuncionamento}</span>
          <h1 className="banner-title">{config.nome}</h1>
          <p className="banner-text">{config.descricao}</p>
          <div className="banner-badges">
            <span className="badge-item">⚡ Preparo: {config.tempoPreparoEstimado}</span>
            <span className="badge-item">🛵 Entrega: R$ {config.taxaEntrega.toFixed(2)}</span>
            <span className="badge-item">⏱️ {config.horarioFuncionamento}</span>
          </div>
        </div>
      </section>

      <section className="controles-cardapio">
        <div className="categorias-list">
          {([
            { id: 'todos', label: '🍕 Todos' },
            { id: 'tradicional', label: 'Clássicas' },
            { id: 'especial', label: 'Especiais' },
            { id: 'doce', label: 'Doces' },
            { id: 'vegetariana', label: 'Vegetarianas' }
          ] as const).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`btn-categoria ${categoriaAtiva === cat.id ? 'ativa' : ''}`}
              style={{
                backgroundColor: categoriaAtiva === cat.id ? config.corPrimaria : 'transparent',
                borderColor: config.corPrimaria,
                color: categoriaAtiva === cat.id ? '#ffffff' : '#1e293b'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Buscar sabor no cardápio..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          className="campo-busca"
        />
      </section>

      {erro ? (
        <div className="mensagem-erro-container">{erro}</div>
      ) : pizzas.length === 0 ? (
        <div className="cardapio-vazio-cadastro">
          <h3>Esta pizzaria ainda não possui produtos cadastrados no cardápio. 🍕</h3>
          <p>Se você for o proprietário, faça login e clique no botão de gerenciamento para cadastrar suas deliciosas receitas!</p>
          <Link to="/login" className="btn-alerta-ir-carrinho" style={{ backgroundColor: config.corPrimaria, display: 'inline-block', marginTop: '15px' }}>Ir para Login</Link>
        </div>
      ) : pizzasFiltradas.length === 0 ? (
        <div className="sem-resultados">Nenhuma pizza encontrada para o filtro selecionado.</div>
      ) : (
        <div className="pizzas-grid">
          {pizzasFiltradas.map((pizza) => (
            <PizzaCard key={pizza.id} pizza={pizza} />
          ))}
        </div>
      )}
    </div>
  );
}