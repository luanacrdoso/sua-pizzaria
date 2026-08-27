import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pizzaService } from '../api/pizza.service';
import type { Pizza } from '../types/pizza';
import { useCarrinhoStore } from '../../../store/carrinho.store';
import { Loading } from '../../../components/Loading';
import { useTenantStore } from '../../../store/tenant.store';

export function DetalhePizzaPage() {
  const { tenantId, id } = useParams<{ readonly tenantId: string; readonly id: string }>();

  const config = useTenantStore((state) => state.tenants.find((t) => t.id === tenantId));
  const adicionarItem = useCarrinhoStore((state) => state.adicionarItem);

  const [pizza, setPizza] = useState<Pizza | null>(null);
  const [saboresUnicosDisponiveis, setSaboresUnicosDisponiveis] = useState<readonly Pizza[]>([]);
  const [loading, setLoading] = useState(true);

  // Customizações do pedido
  const [tamanho, setTamanho] = useState<'Brotinho' | 'Média' | 'Grande'>('Grande');
  const [borda, setBorda] = useState<'Sem Borda' | 'Catupiry' | 'Cheddar'>('Sem Borda');
  const [extras, setExtras] = useState<readonly string[]>([]);
  const [saboresSelecionados, setSaboresSelecionados] = useState<readonly string[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    const tenantIdAtual = tenantId;
    async function carregarDados() {
      try {
        const todas = await pizzaService.listarTodas(tenantIdAtual);
        const encontrada = todas.find(p => p.id === id);
        if (encontrada) {
          setPizza(encontrada);
        }
        // Carrega sabores de sabor_unico da pizzaria para a montagem de pizzas personalizaveis
        setSaboresUnicosDisponiveis(todas.filter(p => p.tipo === 'sabor_unico'));
      } catch {
        console.error("Erro ao carregar detalhes.");
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [id, tenantId]);

  if (loading) return <Loading />;
  if (!pizza || !config) return <div className="status-container erro">Pizza não encontrada. <Link to={`/store/${tenantId}`}>Voltar</Link></div>;

  // Define adicionais customizados cadastrados pela pizzaria no Admin, ou padrão se vazio
  const listaAdicionais = config.adicionaisDisponiveis && config.adicionaisDisponiveis.length > 0 
    ? config.adicionaisDisponiveis 
    : [
        { id: '1', nome: 'Bacon', preco: 4.50 },
        { id: '2', nome: 'Queijo Extra', preco: 6.00 },
        { id: '3', nome: 'Cebola Crispy', preco: 4.00 },
        { id: '4', nome: 'Alho Frito', preco: 3.50 },
        { id: '5', nome: 'Tomate Cereja', preco: 4.00 }
      ];

  // Máximo de sabores permitidos por tamanho
  const obterLimiteSabores = () => {
    if (tamanho === 'Brotinho') return pizza.maxSaboresBrotinho || 1;
    if (tamanho === 'Média') return pizza.maxSaboresMedia || 2;
    return pizza.maxSaboresGrande || 3;
  };

  const handleToggleExtra = (extraNome: string) => {
    setExtras(prev => prev.includes(extraNome) ? prev.filter(e => e !== extraNome) : [...prev, extraNome]);
  };

  const handleToggleSabor = (saborNome: string) => {
    const limite = obterLimiteSabores();
    setSaboresSelecionados(prev => {
      if (prev.includes(saborNome)) {
        return prev.filter(s => s !== saborNome);
      }
      if (prev.length >= limite) {
        return [...prev.slice(1), saborNome]; // Remove o mais antigo e insere o novo
      }
      return [...prev, saborNome];
    });
  };

  const obterPrecoCalculado = () => {
    let base = Number(pizza.precoBrotinho);
    if (tamanho === 'Média') base = Number(pizza.precoMedia);
    if (tamanho === 'Grande') base = Number(pizza.precoGrande);

    const adicionalBorda = borda !== 'Sem Borda' ? 6.50 : 0;
    
    // Calcula o preço dos adicionais customizados selecionados
    let adicionalExtras = 0;
    extras.forEach(nomeExtra => {
      const matchExtra = listaAdicionais.find(a => a.nome === nomeExtra);
      adicionalExtras += matchExtra ? matchExtra.preco : 4.00;
    });

    return (base + adicionalBorda + adicionalExtras) * quantidade;
  };

  const handleComprar = () => {
    if (pizza.tipo === 'personalizavel' && saboresSelecionados.length === 0) {
      alert('Escolha pelo menos 1 sabor para montar sua pizza!');
      return;
    }

    const pizzaAdicionada: Pizza = {
      ...pizza,
      // Atualiza o nome da pizza de acordo com os sabores selecionados se for personalizável
      nome: pizza.tipo === 'personalizavel' 
        ? `Personalizada (${saboresSelecionados.join(' / ')})` 
        : pizza.nome,
      descricao: pizza.tipo === 'personalizavel'
        ? `Pizza montada com os sabores: ${saboresSelecionados.join(', ')}.`
        : pizza.descricao
    };

    adicionarItem(config.id, {
      pizza: pizzaAdicionada,
      tamanho,
      borda,
      extras,
      observacoes,
      quantidade,
      saboresSelecionados: pizza.tipo === 'personalizavel' ? saboresSelecionados : undefined
    });

    setSucesso(true); // Ativa o modal de confirmação premium ao invés de jogar o cliente na outra página!
  };

  return (
    <div className="container-detalhe">
      <Link to={`/store/${config.id}`} className="btn-voltar">⬅ Voltar ao Cardápio</Link>

      <div className="detalhe-grid">
        <div className="detalhe-imagem">
          <img src={pizza.imagemUrl} alt={pizza.nome} className="detalhe-pizza-img-grande" />
        </div>

        <div className="detalhe-form">
          <span className="categoria-tag" style={{ backgroundColor: config.corPrimaria }}>{pizza.categoria}</span>
          <h2>{pizza.nome}</h2>
          <p className="descricao">{pizza.descricao}</p>

          {/* Se a pizza for personalizável, lista sabores de Sabor Único */}
          {pizza.tipo === 'personalizavel' && (
            <div className="grupo-opcao">
              <label className="label-instrucao-gourmet">🍕 Monte sua Pizza! Escolha até {obterLimiteSabores()} sabores:</label>
              {saboresUnicosDisponiveis.length === 0 ? (
                <p className="subtext">Nenhum sabor de pizza unitário cadastrado para seleção.</p>
              ) : (
                <div className="extras-grid">
                  {saboresUnicosDisponiveis.map(sabor => (
                    <label key={sabor.id} className={`checkbox-extra-sabor ${saboresSelecionados.includes(sabor.nome) ? 'sabor-ativo' : ''}`}>
                      <input
                        type="checkbox"
                        checked={saboresSelecionados.includes(sabor.nome)}
                        onChange={() => handleToggleSabor(sabor.nome)}
                      />
                      <span>{sabor.nome}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Opções de Tamanho */}
          <div className="grupo-opcao">
            <label>1. Escolha o Tamanho:</label>
            <div className="botoes-grupo">
              {(['Brotinho', 'Média', 'Grande'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  className={tamanho === t ? "btn-opcao ativo" : "btn-opcao"}
                  style={{
                    backgroundColor: tamanho === t ? config.corPrimaria : '#f1f5f9',
                    color: tamanho === t ? '#ffffff' : '#1e293b'
                  }}
                  onClick={() => {
                    setTamanho(t);
                    setSaboresSelecionados([]); // Reseta sabores selecionados para re-montagem
                  }}
                >
                  {t} (R$ {t === 'Brotinho' ? Number(pizza.precoBrotinho).toFixed(2) : t === 'Média' ? Number(pizza.precoMedia).toFixed(2) : Number(pizza.precoGrande).toFixed(2)})
                </button>
              ))}
            </div>
          </div>

          {/* Opções de Borda */}
          <div className="grupo-opcao">
            <label>2. Escolha a Borda:</label>
            <div className="botoes-grupo">
              {(['Sem Borda', 'Catupiry', 'Cheddar'] as const).map(b => (
                <button
                  key={b}
                  type="button"
                  className={borda === b ? "btn-opcao ativo" : "btn-opcao"}
                  style={{
                    backgroundColor: borda === b ? config.corPrimaria : '#f1f5f9',
                    color: borda === b ? '#ffffff' : '#1e293b'
                  }}
                  onClick={() => setBorda(b)}
                >
                  {b} {b !== 'Sem Borda' && '(+R$ 6,50)'}
                </button>
              ))}
            </div>
          </div>

          {/* Ingredientes Extras Dinâmicos */}
          <div className="grupo-opcao">
            <label>3. Ingredientes Adicionais (Extras):</label>
            <div className="extras-grid">
              {listaAdicionais.map(e => (
                <label key={e.id} className="checkbox-extra">
                  <input
                    type="checkbox"
                    checked={extras.includes(e.nome)}
                    onChange={() => handleToggleExtra(e.nome)}
                  />
                  <span>{e.nome} (+R$ {Number(e.preco).toFixed(2)})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div className="grupo-opcao">
            <label htmlFor="obs">Observações do pedido:</label>
            <textarea
              id="obs"
              placeholder="Ex: Sem cebola, bem assada, cortar em 8 pedaços..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="textarea-obs"
            />
          </div>

          {/* Rodapé do Pedido */}
          <div className="detalhe-rodape">
            <div className="quantidade-controle">
              <button onClick={() => setQuantidade(q => Math.max(1, q - 1))}>-</button>
              <span>{quantidade}</span>
              <button onClick={() => setQuantidade(q => q + 1)}>+</button>
            </div>

            <button onClick={handleComprar} className="btn-final-pedido" style={{ backgroundColor: config.corPrimaria }}>
              🛒 Adicionar R$ {obterPrecoCalculado().toFixed(2)}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO PREMIUM (Evita Redirecionamento de uma vez só) */}
      {sucesso && (
        <div className="modal-adicionado-overlay">
          <div className="modal-adicionado-box">
            <div className="modal-sucesso-header">
              <span className="modal-sucesso-emoji">🍕</span>
              <h3>Adicionado ao Carrinho!</h3>
              <p>O item foi adicionado com total sucesso na sua sacola de compras.</p>
            </div>
            <div className="modal-sucesso-botoes">
              <button onClick={() => setSucesso(false)} className="btn-modal-continuar">Continuar Comprando</button>
              <Link to={`/store/${config.id}/carrinho`} className="btn-modal-carrinho" style={{ backgroundColor: config.corPrimaria }}>Ver meu Carrinho 🛒</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}