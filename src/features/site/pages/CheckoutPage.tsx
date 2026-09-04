import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCarrinhoStore } from '../../../store/carrinho.store';
import { useRestauranteStore } from '../../../store/restaurante.store';
import { useAuthStore } from '../../../store/auth.store';
import { useContasStore } from '../../../store/contas.store';
import { usePedidosStore } from '../../../store/pedidos.store';
import type { ItemPedido, Pedido, TipoPedido } from '../../../types';

export function CheckoutPage() {
  const navigate = useNavigate();
  const config = useRestauranteStore((state) => state.config);
  const { mesas, ocuparMesaSemGarcom } = useRestauranteStore();
  const { itens, obterSubtotal, esvaziarCarrinho } = useCarrinhoStore();
  const usuarioLogado = useAuthStore((state) => state.usuarioLogado);
  const clientes = useContasStore((state) => state.clientes);
  const criarPedido = usePedidosStore((state) => state.criarPedido);

  const cliente = clientes.find((c) => c.username === usuarioLogado?.username);

  const [tipoPedido, setTipoPedido] = useState<TipoPedido>('entrega');
  const [endereco, setEndereco] = useState(cliente ? `${cliente.rua}, ${cliente.numero} - ${cliente.bairro}, ${cliente.cidade}/${cliente.estado}` : '');
  const [mesaId, setMesaId] = useState('');
  const [quererGorjeta, setQuererGorjeta] = useState(false);
  const [cpfNota, setCpfNota] = useState(cliente?.cpf || '');
  const [formaPagamento, setFormaPagamento] = useState(config.formasPagamentoAceitas[0] || 'Pix');
  const [erro, setErro] = useState('');

  const mesaEscolhida = mesas.find((m) => m.id === mesaId);
  const subtotal = obterSubtotal();
  const taxaEntrega = tipoPedido === 'entrega' ? config.taxaEntrega : 0;
  const total = subtotal + taxaEntrega;

  if (!usuarioLogado || usuarioLogado.papel !== 'cliente') {
    return (
      <div className="auth-page-wrapper">
        <div className="auth-card-fazer-login">
          <p>Você precisa estar logado como cliente para finalizar um pedido.</p>
          <Link to="/login" className="btn-auth-submit text-center">Ir para o Login</Link>
        </div>
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div className="status-container vazio">
        <span>🛒</span>
        <p>Seu carrinho está vazio.</p>
        <Link to="/" className="btn-recarregar" style={{ backgroundColor: config.corPrimaria }}>Ir para o Cardápio</Link>
      </div>
    );
  }

  const handleFinalizar = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (tipoPedido === 'entrega' && !endereco.trim()) {
      setErro('Informe o endereço de entrega.');
      return;
    }
    if (tipoPedido === 'presencial' && !mesaId) {
      setErro('Escolha a mesa em que você está.');
      return;
    }

    // Se a mesa ainda estava livre, o pedido já a ocupa — um garçom
    // "assume" a responsabilidade dela depois, na própria tela dele.
    if (tipoPedido === 'presencial' && mesaEscolhida?.status === 'livre') {
      ocuparMesaSemGarcom(mesaEscolhida.id);
    }

    const orderId = Math.floor(1000 + Math.random() * 9000).toString();

    const itensPedido: readonly ItemPedido[] = itens.map((item, idx) => ({
      id: `${orderId}-${idx}-${Date.now()}`,
      pizzaId: item.pizza.id,
      nome: item.pizza.nome,
      imagemUrl: item.pizza.imagemUrl,
      tamanho: item.tamanho,
      extras: item.extras,
      saboresSelecionados: item.saboresSelecionados,
      observacoes: item.observacoes,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
      servido: false
    }));

    const pedido: Pedido = {
      id: orderId,
      tipo: tipoPedido,
      clienteUsername: usuarioLogado.username,
      clienteNome: cliente?.nome || usuarioLogado.username,
      clienteTelefone: cliente?.telefone || '',
      itens: itensPedido,
      subtotal,
      taxaEntrega,
      total,
      formaPagamento,
      cpfNota: cpfNota || undefined,
      enderecoEntrega: tipoPedido === 'entrega' ? endereco : undefined,
      mesaId: tipoPedido === 'presencial' ? mesaId : undefined,
      gorjeta: tipoPedido === 'presencial' && quererGorjeta && mesaEscolhida?.garcomResponsavelUsername
        ? { percentual: 10, valor: subtotal * 0.10, garcomUsername: mesaEscolhida.garcomResponsavelUsername, confirmadaPeloGarcom: false }
        : undefined,
      status: 'recebido',
      criadoEm: Date.now()
    };

    criarPedido(pedido);

    if (formaPagamento === 'Pix') {
      sessionStorage.setItem('callidus-pedido-pendente-pix', orderId);
      navigate('/pagamento');
    } else {
      esvaziarCarrinho();
      navigate(`/pedido/${orderId}`);
    }
  };

  return (
    <div className="container-checkout">
      <h2>Finalizar Pedido</h2>
      {erro && <div className="auth-erro">{erro}</div>}

      <form onSubmit={handleFinalizar} className="checkout-form">
        <div className="form-secao">
          <h3>Como você quer receber seu pedido?</h3>
          <div className="pagamentos-opcoes">
            <label className="opcao-pagamento-radio">
              <input type="radio" name="tipoPedido" checked={tipoPedido === 'entrega'} onChange={() => setTipoPedido('entrega')} />
              🛵 Entrega no meu endereço
            </label>
            <label className="opcao-pagamento-radio">
              <input type="radio" name="tipoPedido" checked={tipoPedido === 'presencial'} onChange={() => setTipoPedido('presencial')} />
              🍽️ Vou comer na pizzaria (presencial)
            </label>
            <label className="opcao-pagamento-radio">
              <input type="radio" name="tipoPedido" checked={tipoPedido === 'retirada'} onChange={() => setTipoPedido('retirada')} />
              🏠 Vou retirar no balcão
            </label>
          </div>
        </div>

        {tipoPedido === 'entrega' && (
          <div className="form-secao">
            <h3>Endereço de Entrega</h3>
            <div className="input-group">
              <label>Endereço completo:</label>
              <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} required />
            </div>
          </div>
        )}

        {tipoPedido === 'presencial' && (
          <div className="form-secao">
            <h3>Sua Mesa</h3>
            {mesas.length === 0 ? (
              <p className="subtext">A pizzaria ainda não cadastrou mesas. Peça para um funcionário anotar seu pedido.</p>
            ) : (
              <div className="input-group">
                <label>Selecione sua mesa:</label>
                <select value={mesaId} onChange={(e) => setMesaId(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {mesas.map((m) => (
                    <option key={m.id} value={m.id}>
                      Mesa {m.numero}{m.garcomResponsavelUsername ? ` (garçom: ${m.garcomResponsavelUsername})` : m.status === 'ocupada' ? ' (aguardando garçom)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {mesaEscolhida?.garcomResponsavelUsername && (
              <label className="opcao-pagamento-radio">
                <input type="checkbox" checked={quererGorjeta} onChange={(e) => setQuererGorjeta(e.target.checked)} />
                Deixar 10% de gorjeta para o garçom (R$ {(subtotal * 0.10).toFixed(2)}) — sujeito à confirmação do garçom
              </label>
            )}
          </div>
        )}

        <div className="form-secao">
          <h3>Forma de Pagamento</h3>
          <div className="pagamentos-opcoes">
            {config.formasPagamentoAceitas.map((forma) => (
              <label key={forma} className="opcao-pagamento-radio">
                <input type="radio" name="formaPagamento" checked={formaPagamento === forma} onChange={() => setFormaPagamento(forma)} />
                {forma}
              </label>
            ))}
          </div>
        </div>

        <div className="form-secao">
          <h3>Nota Fiscal</h3>
          <div className="input-group">
            <label>CPF na nota (opcional):</label>
            <input type="text" value={cpfNota} onChange={(e) => setCpfNota(e.target.value)} placeholder="000.000.000-00" />
          </div>
        </div>

        <div className="form-secao">
          <div className="resumo-financeiro-checkout">
            <div className="resumo-linha"><span>Subtotal:</span><span>R$ {subtotal.toFixed(2)}</span></div>
            <div className="resumo-linha"><span>Taxa de Entrega:</span><span>R$ {taxaEntrega.toFixed(2)}</span></div>
            {tipoPedido === 'presencial' && quererGorjeta && mesaEscolhida?.garcomResponsavelUsername && (
              <div className="resumo-linha"><span>Gorjeta (10%):</span><span>R$ {(subtotal * 0.10).toFixed(2)}</span></div>
            )}
            <div className="resumo-linha total"><span>Total:</span><span>R$ {total.toFixed(2)}</span></div>
          </div>
          <button type="submit" className="btn-finalizar" style={{ backgroundColor: config.corPrimaria }}>Confirmar Pedido</button>
        </div>
      </form>
    </div>
  );
}
