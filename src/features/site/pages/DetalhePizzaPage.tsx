import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCardapioStore } from '../../../store/cardapio.store';
import { useCarrinhoStore } from '../../../store/carrinho.store';
import { useRestauranteStore } from '../../../store/restaurante.store';
import { useAuthStore } from '../../../store/auth.store';
import type { Tamanho } from '../../../types';

export function DetalhePizzaPage() {
  const { id } = useParams<{ readonly id: string }>();
  const navigate = useNavigate();
  const pizzas = useCardapioStore((state) => state.pizzas);
  const config = useRestauranteStore((state) => state.config);
  const adicionarItem = useCarrinhoStore((state) => state.adicionarItem);
  const usuarioLogado = useAuthStore((state) => state.usuarioLogado);

  const pizza = pizzas.find((p) => p.id === id);
  const semTamanho = pizza?.categoria === 'bebida' || pizza?.categoria === 'combo';
  const temSelecaoDeItens = pizza?.tipo === 'personalizavel';

  const [tamanho, setTamanho] = useState<Tamanho>('Grande');
  const [extras, setExtras] = useState<readonly string[]>([]);
  const [itensSelecionados, setItensSelecionados] = useState<readonly string[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [sucesso, setSucesso] = useState(false);

  if (!pizza) {
    return (
      <div className="status-container erro">
        <span>❌</span>
        <p>Esse item não foi encontrado no cardápio.</p>
        <Link to="/" className="btn-recarregar">Voltar ao Cardápio</Link>
      </div>
    );
  }

  // Sabores/itens que a pizzaria explicitamente liberou para essa pizza
  // personalizável ou combo — quem decide isso é o admin/cozinha no
  // cadastro do item, não uma lista automática.
  const itensDisponiveis = pizzas.filter((p) => pizza.saboresPermitidosIds?.includes(p.id));

  const limiteItens = pizza.categoria === 'combo'
    ? (pizza.maxSaboresGrande ?? 2)
    : tamanho === 'Brotinho' ? (pizza.maxSaboresBrotinho ?? 1)
    : tamanho === 'Média' ? (pizza.maxSaboresMedia ?? 2)
    : (pizza.maxSaboresGrande ?? 3);

  const toggleItemSelecionado = (nome: string) => {
    setItensSelecionados((prev) => {
      if (prev.includes(nome)) return prev.filter((s) => s !== nome);
      if (prev.length >= limiteItens) return [...prev.slice(1), nome];
      return [...prev, nome];
    });
  };

  const toggleExtra = (nome: string) => {
    setExtras((prev) => (prev.includes(nome) ? prev.filter((e) => e !== nome) : [...prev, nome]));
  };

  const obterCustoExtrasUnitario = () => {
    let total = 0;
    extras.forEach((nomeExtra) => {
      const match = config.adicionaisDisponiveis.find((a) => a.nome === nomeExtra);
      total += match ? match.preco : 0;
    });
    return total;
  };

  const obterPrecoCalculado = () => {
    if (semTamanho) return (Number(pizza.precoGrande) + obterCustoExtrasUnitario()) * quantidade;
    let base = Number(pizza.precoBrotinho);
    if (tamanho === 'Média') base = Number(pizza.precoMedia);
    if (tamanho === 'Grande') base = Number(pizza.precoGrande);
    return (base + obterCustoExtrasUnitario()) * quantidade;
  };

  const handleComprar = () => {
    if (!usuarioLogado || usuarioLogado.papel !== 'cliente') {
      navigate('/login');
      return;
    }
    if (temSelecaoDeItens && itensSelecionados.length === 0) {
      alert(pizza.categoria === 'combo' ? 'Escolha os itens do combo!' : 'Escolha pelo menos 1 sabor para montar sua pizza!');
      return;
    }

    const nomeFinal = temSelecaoDeItens ? `${pizza.nome} (${itensSelecionados.join(' / ')})` : pizza.nome;

    adicionarItem(
      {
        pizza: { ...pizza, nome: nomeFinal },
        tamanho: semTamanho ? 'Único' : tamanho,
        extras: semTamanho && pizza.categoria === 'combo' ? extras : semTamanho ? [] : extras,
        observacoes,
        quantidade,
        saboresSelecionados: temSelecaoDeItens ? itensSelecionados : undefined
      },
      obterCustoExtrasUnitario()
    );

    setSucesso(true);
  };

  return (
    <div className="container-detalhe">
      <Link to="/" className="btn-voltar">← Voltar ao Cardápio</Link>

      <div className="detalhe-grid">
        <div className="detalhe-imagem">
          <img src={pizza.imagemUrl} alt={pizza.nome} className="detalhe-pizza-img-grande" />
        </div>

        <div className="detalhe-form">
          <span className="categoria-tag" style={{ backgroundColor: config.corPrimaria }}>{pizza.categoria}</span>
          <h2>{pizza.nome}</h2>
          <p className="descricao">{pizza.descricao}</p>

          {!semTamanho && (
            <div className="grupo-opcao">
              <label>Tamanho</label>
              <div className="botoes-grupo">
                {(['Brotinho', 'Média', 'Grande'] as const).map((t) => (
                  <button key={t} onClick={() => setTamanho(t)} className={tamanho === t ? 'btn-opcao ativo' : 'btn-opcao'} style={tamanho === t ? { backgroundColor: config.corPrimaria, borderColor: config.corPrimaria } : {}}>{t}</button>
                ))}
              </div>
            </div>
          )}

          {temSelecaoDeItens && (
            <div className="grupo-opcao">
              <label className="label-instrucao-gourmet">
                {pizza.categoria === 'combo' ? `Escolha ${limiteItens} item(ns) do combo:` : `Escolha até ${limiteItens} sabor(es):`}
              </label>
              {itensDisponiveis.length === 0 ? (
                <p className="subtext">A pizzaria ainda não cadastrou opções disponíveis para este item.</p>
              ) : (
                <div className="extras-grid">
                  {itensDisponiveis.map((s) => (
                    <label key={s.id} className={itensSelecionados.includes(s.nome) ? 'checkbox-extra-sabor sabor-ativo' : 'checkbox-extra-sabor'}>
                      <input type="checkbox" checked={itensSelecionados.includes(s.nome)} onChange={() => toggleItemSelecionado(s.nome)} />
                      {s.nome} {pizza.categoria === 'combo' && <span className="subtext">({s.categoria})</span>}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {config.adicionaisDisponiveis.length > 0 && (
            <div className="grupo-opcao">
              <label>Adicionais</label>
              <div className="extras-grid">
                {config.adicionaisDisponiveis.map((a) => (
                  <label key={a.id} className="checkbox-extra">
                    <input type="checkbox" checked={extras.includes(a.nome)} onChange={() => toggleExtra(a.nome)} />
                    {a.nome} (+R$ {a.preco.toFixed(2)})
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="grupo-opcao">
            <label>Observações</label>
            <textarea className="textarea-obs" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Ex: sem cebola, caprichar no molho..." />
          </div>

          <div className="detalhe-rodape">
            <div className="quantidade-controle">
              <button onClick={() => setQuantidade((q) => Math.max(1, q - 1))}>-</button>
              <span>{quantidade}</span>
              <button onClick={() => setQuantidade((q) => q + 1)}>+</button>
            </div>
            <button onClick={handleComprar} className="btn-final-pedido" style={{ backgroundColor: config.corPrimaria }}>
              Adicionar ao Carrinho — R$ {obterPrecoCalculado().toFixed(2)}
            </button>
          </div>
        </div>
      </div>

      {sucesso && (
        <div className="modal-adicionado-overlay" onClick={() => setSucesso(false)}>
          <div className="modal-adicionado-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-sucesso-header">
              <span className="modal-sucesso-emoji">✅</span>
              <h3>Adicionado ao carrinho!</h3>
              <p>{pizza.nome} foi adicionado com sucesso.</p>
            </div>
            <div className="modal-sucesso-botoes">
              <button onClick={() => setSucesso(false)} className="btn-modal-continuar">Continuar Comprando</button>
              <Link to="/carrinho" className="btn-modal-carrinho" style={{ backgroundColor: config.corPrimaria }}>Ver Carrinho</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
