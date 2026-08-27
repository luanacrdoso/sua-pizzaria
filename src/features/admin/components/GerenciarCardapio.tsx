import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { pizzaService } from '../../cardapio/api/pizza.service';
import type { Pizza, CategoriaPizza } from '../../cardapio/types/pizza';

export function GerenciarCardapio() {
  const { tenantId } = useParams<{ readonly tenantId: string }>();
  const currentTenantId = tenantId || '';
  const [pizzas, setPizzas] = useState<readonly Pizza[]>([]);
  
  // Campos do formulário
  const [novoNome, setNovoNome] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novaCategoria, setNovaCategoria] = useState<CategoriaPizza>('tradicional');
  const [novaImagem, setNovaImagem] = useState('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400');
  
  // Preços diferenciados por tamanho
  const [precoBrotinho, setPrecoBrotinho] = useState('');
  const [precoMedia, setPrecoMedia] = useState('');
  const [precoGrande, setPrecoGrande] = useState('');
  
  // Configuração Multi-sabores / Personalizável
  const [tipoPizza, setTipoPizza] = useState<'sabor_unico' | 'personalizavel'>('sabor_unico');
  const [maxBrotinho, setMaxBrotinho] = useState(1);
  const [maxMedia, setMaxMedia] = useState(2);
  const [maxGrande, setMaxGrande] = useState(3);

  useEffect(() => {
    if (!currentTenantId) return;
    async function carregar() {
      const dados = await pizzaService.listarTodas(currentTenantId);
      setPizzas(dados);
    }
    carregar();
  }, [currentTenantId]);

  const handleAddPizza = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId || !novoNome || !precoBrotinho || !precoMedia || !precoGrande) return;

    const nova: Pizza = {
      id: Math.random().toString(),
      nome: novoNome,
      descricao: novaDescricao || (tipoPizza === 'personalizavel' ? 'Escolha seus sabores favoritos!' : 'Deliciosa pizza assada ao forno.'),
      precoBase: precoBrotinho,
      precoBrotinho: Number(precoBrotinho).toFixed(2),
      precoMedia: Number(precoMedia).toFixed(2),
      precoGrande: Number(precoGrande).toFixed(2),
      categoria: novaCategoria,
      imagemUrl: novaImagem || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      ingredientes: ["Ingrediente Padrão"],
      tipo: tipoPizza,
      maxSaboresBrotinho: tipoPizza === 'personalizavel' ? Number(maxBrotinho) : undefined,
      maxSaboresMedia: tipoPizza === 'personalizavel' ? Number(maxMedia) : undefined,
      maxSaboresGrande: tipoPizza === 'personalizavel' ? Number(maxGrande) : undefined
    };

    const novoCatalogo = [...pizzas, nova];
    setPizzas(novoCatalogo);
    pizzaService.salvarCardapioLocal(currentTenantId, novoCatalogo);

    // Limpa Formulário
    setNovoNome('');
    setNovaDescricao('');
    setPrecoBrotinho('');
    setPrecoMedia('');
    setPrecoGrande('');
    setTipoPizza('sabor_unico');
  };

  const handleExcluirPizza = (id: string) => {
    if (!currentTenantId) return;
    const filtrado = pizzas.filter(p => p.id !== id);
    setPizzas(filtrado);
    pizzaService.salvarCardapioLocal(currentTenantId, filtrado);
  };

  return (
    <div className="crud-container">
      <form onSubmit={handleAddPizza} className="form-crud">
        <h3>🍕 Criar Nova Pizza</h3>
        
        <div className="input-group">
          <label>Nome do Produto (ou Sabor)</label>
          <input type="text" value={novoNome} onChange={e => setNovoNome(e.target.value)} placeholder="Ex: Pepperoni Suprema" required />
        </div>

        <div className="input-group">
          <label>Tipo de Pizza</label>
          <select value={tipoPizza} onChange={e => setTipoPizza(e.target.value as 'sabor_unico' | 'personalizavel')}>
            <option value="sabor_unico">Sabor Único (Tradicional)</option>
            <option value="personalizavel">Personalizável (Permite múltiplos sabores)</option>
          </select>
        </div>

        {tipoPizza === 'personalizavel' ? (
          <div className="cores-flex">
            <div className="input-group">
              <label>Max Sabores Brotinho</label>
              <input type="number" min={1} value={maxBrotinho} onChange={e => setMaxBrotinho(Number(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Max Sabores Média</label>
              <input type="number" min={1} value={maxMedia} onChange={e => setMaxMedia(Number(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Max Sabores Grande</label>
              <input type="number" min={1} value={maxGrande} onChange={e => setMaxGrande(Number(e.target.value))} />
            </div>
          </div>
        ) : (
          <div className="input-group">
            <label>Descrição Detalhada</label>
            <input type="text" value={novaDescricao} onChange={e => setNovaDescricao(e.target.value)} placeholder="Ex: Molho de tomate, muçarela, calabresa e cebola..." />
          </div>
        )}

        <div className="cores-flex">
          <div className="input-group">
            <label>Preço Brotinho (R$)</label>
            <input type="number" step="0.10" value={precoBrotinho} onChange={e => setPrecoBrotinho(e.target.value)} placeholder="Ex: 29.90" required />
          </div>
          <div className="input-group">
            <label>Preço Média (R$)</label>
            <input type="number" step="0.10" value={precoMedia} onChange={e => setPrecoMedia(e.target.value)} placeholder="Ex: 39.90" required />
          </div>
          <div className="input-group">
            <label>Preço Grande (R$)</label>
            <input type="number" step="0.10" value={precoGrande} onChange={e => setPrecoGrande(e.target.value)} placeholder="Ex: 49.90" required />
          </div>
        </div>

        <div className="input-group">
          <label>URL da Imagem da Pizza</label>
          <input type="text" value={novaImagem} onChange={e => setNovaImagem(e.target.value)} placeholder="Link da imagem (Unsplash/Imgur)" />
        </div>

        <div className="input-group">
          <label>Categoria</label>
          <select value={novaCategoria} onChange={e => setNovaCategoria(e.target.value as CategoriaPizza)}>
            <option value="tradicional">Tradicionais</option>
            <option value="especial">Especiais</option>
            <option value="vegetariana">Vegetarianas</option>
            <option value="doce">Doces</option>
          </select>
        </div>

        <button type="submit" className="btn-crud-add">Gravar no Cardápio</button>
      </form>

      <div className="tabela-pizzas">
        <h3>📋 Cardápio Cadastrado</h3>
        <div className="grade-pizzas-crud">
          {pizzas.length === 0 ? (
            <p className="subtext">Seu cardápio está completamente vazio. Comece criando sabores acima!</p>
          ) : (
            pizzas.map(pizza => (
              <div key={pizza.id} className="pizza-crud-item">
                <img src={pizza.imagemUrl} alt={pizza.nome} />
                <div className="info">
                  <strong>{pizza.nome} ({pizza.tipo === 'personalizavel' ? 'Multisabores' : 'Sabor único'})</strong>
                  <span>Brotinho: R$ {Number(pizza.precoBrotinho).toFixed(2)} | Média: R$ {Number(pizza.precoMedia).toFixed(2)} | Grande: R$ {Number(pizza.precoGrande).toFixed(2)}</span>
                </div>
                <button onClick={() => handleExcluirPizza(pizza.id)} className="btn-excluir">Excluir</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}