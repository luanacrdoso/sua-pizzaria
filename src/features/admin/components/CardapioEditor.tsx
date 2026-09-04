import { useState } from 'react';
import { useCardapioStore } from '../../../store/cardapio.store';
import type { CategoriaPizza, Pizza } from '../../../types';

export function CardapioEditor() {
  const { pizzas, adicionarPizza, editarPizza, removerPizza } = useCardapioStore();

  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<CategoriaPizza>('tradicional');
  const [imagemUrl, setImagemUrl] = useState('');
  const [precoUnico, setPrecoUnico] = useState('');
  const [precoBrotinho, setPrecoBrotinho] = useState('');
  const [precoMedia, setPrecoMedia] = useState('');
  const [precoGrande, setPrecoGrande] = useState('');
  const [tipoPizza, setTipoPizza] = useState<'sabor_unico' | 'personalizavel'>('sabor_unico');
  const [saboresPermitidosIds, setSaboresPermitidosIds] = useState<readonly string[]>([]);
  const [maxBrotinho, setMaxBrotinho] = useState(1);
  const [maxMedia, setMaxMedia] = useState(2);
  const [maxGrande, setMaxGrande] = useState(3);
  const [qtdItensCombo, setQtdItensCombo] = useState(2);

  const ehBebida = categoria === 'bebida';
  const ehCombo = categoria === 'combo';
  const semTamanho = ehBebida || ehCombo;
  // Pizza personalizável: escolhe só entre sabores de pizza.
  // Combo: escolhe entre pizzas (sabor único) e bebidas juntas.
  const poolSabores = ehCombo
    ? pizzas.filter((p) => p.categoria !== 'combo')
    : pizzas.filter((p) => p.tipo === 'sabor_unico' && p.categoria !== 'bebida' && p.categoria !== 'combo');

  const toggleSaborPermitido = (id: string) => {
    setSaboresPermitidosIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const limparFormulario = () => {
    setEditandoId(null);
    setNome('');
    setDescricao('');
    setImagemUrl('');
    setPrecoUnico('');
    setPrecoBrotinho('');
    setPrecoMedia('');
    setPrecoGrande('');
    setTipoPizza('sabor_unico');
    setCategoria('tradicional');
    setSaboresPermitidosIds([]);
    setMaxBrotinho(1);
    setMaxMedia(2);
    setMaxGrande(3);
    setQtdItensCombo(2);
  };

  const handleEditar = (pizza: Pizza) => {
    setEditandoId(pizza.id);
    setNome(pizza.nome);
    setDescricao(pizza.descricao);
    setCategoria(pizza.categoria);
    setImagemUrl(pizza.imagemUrl);
    if (pizza.categoria === 'bebida' || pizza.categoria === 'combo') {
      setPrecoUnico(pizza.precoGrande);
    } else {
      setPrecoBrotinho(pizza.precoBrotinho);
      setPrecoMedia(pizza.precoMedia);
      setPrecoGrande(pizza.precoGrande);
    }
    setTipoPizza(pizza.tipo);
    setSaboresPermitidosIds(pizza.saboresPermitidosIds ?? []);
    setMaxBrotinho(pizza.maxSaboresBrotinho ?? 1);
    setMaxMedia(pizza.maxSaboresMedia ?? 2);
    setMaxGrande(pizza.maxSaboresGrande ?? 3);
    setQtdItensCombo(pizza.maxSaboresGrande ?? 2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) return;
    if (semTamanho && !precoUnico) return;
    if (!semTamanho && (!precoBrotinho || !precoMedia || !precoGrande)) return;
    if ((ehCombo || (!semTamanho && tipoPizza === 'personalizavel')) && saboresPermitidosIds.length === 0) {
      alert('Selecione pelo menos um item disponível.');
      return;
    }

    const precoFinalBrotinho = semTamanho ? Number(precoUnico).toFixed(2) : Number(precoBrotinho).toFixed(2);
    const precoFinalMedia = semTamanho ? Number(precoUnico).toFixed(2) : Number(precoMedia).toFixed(2);
    const precoFinalGrande = semTamanho ? Number(precoUnico).toFixed(2) : Number(precoGrande).toFixed(2);

    const dados: Pizza = {
      id: editandoId ?? `pizza-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      nome,
      descricao: descricao || (ehCombo ? 'Combo especial da casa.' : tipoPizza === 'personalizavel' ? 'Escolha seus sabores favoritos!' : 'Delicioso item do nosso cardápio.'),
      categoria,
      imagemUrl: imagemUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      precoBrotinho: precoFinalBrotinho,
      precoMedia: precoFinalMedia,
      precoGrande: precoFinalGrande,
      tipo: ehBebida ? 'sabor_unico' : ehCombo ? 'personalizavel' : tipoPizza,
      saboresPermitidosIds: ehCombo || (!semTamanho && tipoPizza === 'personalizavel') ? saboresPermitidosIds : undefined,
      maxSaboresBrotinho: !semTamanho && tipoPizza === 'personalizavel' ? Number(maxBrotinho) : undefined,
      maxSaboresMedia: !semTamanho && tipoPizza === 'personalizavel' ? Number(maxMedia) : undefined,
      maxSaboresGrande: ehCombo ? Number(qtdItensCombo) : !semTamanho && tipoPizza === 'personalizavel' ? Number(maxGrande) : undefined
    };

    if (editandoId) {
      editarPizza(editandoId, dados);
    } else {
      adicionarPizza(dados);
    }

    limparFormulario();
  };

  return (
    <div className="crud-container">
      <form onSubmit={handleSalvar} className="form-crud">
        <h3>{editandoId ? '✏️ Editar Item do Cardápio' : '🍕 Criar Item do Cardápio'}</h3>

        <div className="input-group">
          <label>Nome do Produto (pizza, sabor, bebida ou combo)</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Pepperoni Suprema / Coca-Cola 2L / Combo Casal" required />
        </div>

        <div className="input-group">
          <label>Categoria</label>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaPizza)}>
            <option value="tradicional">Pizza Tradicional</option>
            <option value="especial">Pizza Especial</option>
            <option value="vegetariana">Pizza Vegetariana</option>
            <option value="doce">Pizza Doce</option>
            <option value="bebida">Bebida</option>
            <option value="combo">Combo (pizzas e/ou bebidas)</option>
          </select>
        </div>

        {!semTamanho && (
          <div className="input-group">
            <label>Tipo de Pizza</label>
            <select value={tipoPizza} onChange={(e) => setTipoPizza(e.target.value as 'sabor_unico' | 'personalizavel')}>
              <option value="sabor_unico">Sabor Único (também vira opção de sabor nas pizzas personalizáveis e nos combos)</option>
              <option value="personalizavel">Personalizável (o cliente monta com os sabores que você liberar)</option>
            </select>
          </div>
        )}

        {!semTamanho && tipoPizza === 'personalizavel' && (
          <>
            <div className="input-group">
              <label>Quais sabores o cliente pode escolher nessa pizza?</label>
              {poolSabores.length === 0 ? (
                <p className="subtext">Cadastre primeiro pizzas do tipo "Sabor Único" para poder liberá-las aqui.</p>
              ) : (
                <div className="extras-grid">
                  {poolSabores.map((s) => (
                    <label key={s.id} className="checkbox-extra">
                      <input type="checkbox" checked={saboresPermitidosIds.includes(s.id)} onChange={() => toggleSaborPermitido(s.id)} />
                      {s.nome}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="cores-flex">
              <div className="input-group">
                <label>Máx. sabores (Brotinho)</label>
                <input type="number" min={1} value={maxBrotinho} onChange={(e) => setMaxBrotinho(Number(e.target.value))} />
              </div>
              <div className="input-group">
                <label>Máx. sabores (Média)</label>
                <input type="number" min={1} value={maxMedia} onChange={(e) => setMaxMedia(Number(e.target.value))} />
              </div>
              <div className="input-group">
                <label>Máx. sabores (Grande)</label>
                <input type="number" min={1} value={maxGrande} onChange={(e) => setMaxGrande(Number(e.target.value))} />
              </div>
            </div>
          </>
        )}

        {ehCombo && (
          <>
            <div className="input-group">
              <label>O que pode entrar nesse combo? (pizzas e/ou bebidas)</label>
              {poolSabores.length === 0 ? (
                <p className="subtext">Cadastre primeiro pizzas e/ou bebidas para poder incluí-las num combo.</p>
              ) : (
                <div className="extras-grid">
                  {poolSabores.map((s) => (
                    <label key={s.id} className="checkbox-extra">
                      <input type="checkbox" checked={saboresPermitidosIds.includes(s.id)} onChange={() => toggleSaborPermitido(s.id)} />
                      {s.nome} <span className="subtext">({s.categoria})</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="input-group">
              <label>Quantos itens o cliente escolhe nesse combo?</label>
              <input type="number" min={1} value={qtdItensCombo} onChange={(e) => setQtdItensCombo(Number(e.target.value))} />
            </div>
          </>
        )}

        {!semTamanho && (
          <div className="input-group">
            <label>Descrição</label>
            <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Molho de tomate, muçarela, calabresa..." />
          </div>
        )}
        {ehBebida && (
          <div className="input-group">
            <label>Descrição</label>
            <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Lata 350ml gelada" />
          </div>
        )}

        {semTamanho ? (
          <div className="input-group">
            <label>Preço (R$)</label>
            <input type="number" step="0.10" value={precoUnico} onChange={(e) => setPrecoUnico(e.target.value)} required />
          </div>
        ) : (
          <div className="cores-flex">
            <div className="input-group">
              <label>Preço Brotinho (R$)</label>
              <input type="number" step="0.10" value={precoBrotinho} onChange={(e) => setPrecoBrotinho(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Preço Média (R$)</label>
              <input type="number" step="0.10" value={precoMedia} onChange={(e) => setPrecoMedia(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Preço Grande (R$)</label>
              <input type="number" step="0.10" value={precoGrande} onChange={(e) => setPrecoGrande(e.target.value)} required />
            </div>
          </div>
        )}

        <div className="input-group">
          <label>URL da Imagem</label>
          <input type="text" value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} placeholder="Link da imagem (Unsplash/Imgur)" />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn-crud-add">{editandoId ? 'Salvar Alterações' : 'Gravar no Cardápio'}</button>
          {editandoId && (
            <button type="button" onClick={limparFormulario} className="btn-link-secundario">Cancelar Edição</button>
          )}
        </div>
      </form>

      <div className="tabela-pizzas">
        <h3>📋 Cardápio Atual</h3>
        <div className="grade-pizzas-crud">
          {pizzas.length === 0 ? (
            <p className="subtext">Cardápio vazio. Comece criando itens ao lado!</p>
          ) : (
            pizzas.map((pizza) => (
              <div key={pizza.id} className="pizza-crud-item">
                <img src={pizza.imagemUrl} alt={pizza.nome} />
                <div className="info">
                  <strong>{pizza.nome} ({pizza.categoria === 'bebida' ? 'bebida' : pizza.categoria === 'combo' ? 'combo' : pizza.tipo === 'personalizavel' ? 'Multisabores' : 'Sabor único'})</strong>
                  {pizza.categoria === 'bebida' || pizza.categoria === 'combo' ? (
                    <span>R$ {Number(pizza.precoGrande).toFixed(2)}</span>
                  ) : (
                    <span>Brotinho: R$ {Number(pizza.precoBrotinho).toFixed(2)} | Média: R$ {Number(pizza.precoMedia).toFixed(2)} | Grande: R$ {Number(pizza.precoGrande).toFixed(2)}</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEditar(pizza)} className="btn-link-secundario">Editar</button>
                  <button onClick={() => removerPizza(pizza.id)} className="btn-excluir">Excluir</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
