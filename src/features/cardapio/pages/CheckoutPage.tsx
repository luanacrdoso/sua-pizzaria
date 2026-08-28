import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCarrinhoStore } from '../../../store/carrinho.store';
import { useTenantStore } from '../../../store/tenant.store';
import { useAuthStore } from '../../../store/auth.store';

export function CheckoutPage() {
  const { tenantId } = useParams<{ readonly tenantId: string }>();
  const navigate = useNavigate();

  const config = useTenantStore((state) => state.tenants.find((t) => t.id === tenantId));
  const { usuarioLogado, compradores } = useAuthStore();
  const { itens, obterSubtotal } = useCarrinhoStore();

  const dadosComprador = compradores.find(c => c.email === usuarioLogado?.email);

  const [nome, setNome] = useState(dadosComprador ? `${dadosComprador.nome} ${dadosComprador.sobrenome}` : '');
  const [telefone, setTelefone] = useState(dadosComprador ? dadosComprador.telefone : '');
  const [endereco, setEndereco] = useState(
    dadosComprador 
      ? `${dadosComprador.rua}, ${dadosComprador.numero} - ${dadosComprador.bairro}, ${dadosComprador.cidade}/${dadosComprador.estado} (${dadosComprador.pontoReferencia || 'Sem referência'})`
      : ''
  );
  const [formaPagamento, setFormaPagamento] = useState('');
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');

  if (!config) return null;

  const itensDoTenant = itens.filter(item => item.tenantId === config.id);
  const subtotal = obterSubtotal(config.id);
  const total = subtotal + config.taxaEntrega;

  const handleFinalizar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !telefone || !endereco || !formaPagamento) {
      setErro("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setProcessando(true);
    setErro('');

    setTimeout(() => {
      setProcessando(false);
      const orderId = Math.floor(1000 + Math.random() * 9000).toString();
      
      const dadosPedido = {
        id: orderId,
        tenantId: config.id,
        cliente: nome,
        itens: itensDoTenant.map(i => `${i.quantidade}x ${i.pizza.nome} (${i.tamanho})`),
        total: total,
        status: 'recebido',
        pagamento: formaPagamento,
        avaliacaoEstrelas: 0,
        avaliacaoComentario: '',
        confirmadoEntrega: false
      };

      localStorage.setItem(`pizzashop-pedido-ativo-${config.id}`, JSON.stringify(dadosPedido));

      if (formaPagamento === 'Pix') {
        navigate(`/store/${config.id}/checkout/pagamento`);
      } else {
        navigate(`/store/${config.id}/status/${orderId}`);
      }
    }, 1500);
  };

  if (itensDoTenant.length === 0) return <div className="status-container erro">Carrinho vazio para esta pizzaria.</div>;

  return (
    <div className="container-checkout">
      <h2>Checkout do Pedido</h2>
      
      {processando ? (
        <div className="status-container processando">
          <div className="loading-spinner"></div>
          <h3>Simulando Gateway de Pagamento...</h3>
          <p>Seus dados de pagamento estão sendo processados de forma segura.</p>
        </div>
      ) : (
        <form onSubmit={handleFinalizar} className="checkout-form">
          <div className="form-secao">
            <h3>📝 Dados de Entrega</h3>
            {erro && <p className="mensagem-erro-valida">{erro}</p>}
            
            <div className="input-group">
              <label>Seu Nome Completo *</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: João da Silva" required />
            </div>

            <div className="input-group">
              <label>Telefone de Contato *</label>
              <input type="text" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="Ex: (11) 99999-9999" required />
            </div>

            <div className="input-group">
              <label>Endereço de Entrega Completo *</label>
              <input type="text" value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Ex: Rua, Número, Bairro, Cidade/UF..." required />
            </div>
          </div>

          <div className="form-secao">
            <h3>💳 Método de Pagamento</h3>
            <p className="subtext">Opções aceitas por {config.nome}:</p>
            <div className="pagamentos-opcoes">
              {config.formasPagamentoAceitas.map(op => (
                <label key={op} className="opcao-pagamento-radio">
                  <input
                    type="radio"
                    name="pagamento"
                    value={op}
                    checked={formaPagamento === op}
                    onChange={() => setFormaPagamento(op)}
                  />
                  <span>{op}</span>
                </label>
              ))}
            </div>

            <div className="resumo-financeiro-checkout">
              <div className="resumo-linha"><span>Subtotal:</span><span>R$ {subtotal.toFixed(2)}</span></div>
              <div className="resumo-linha"><span>Taxa de Entrega:</span><span>R$ {config.taxaEntrega.toFixed(2)}</span></div>
              <div className="resumo-linha total"><span>Total a pagar:</span><span>R$ {total.toFixed(2)}</span></div>
            </div>

            <button type="submit" className="btn-finalizar" style={{ backgroundColor: config.corPrimaria }}>
              {formaPagamento === 'Pix' ? 'Gerar QR Code do PIX ⚡' : 'Finalizar Compra 🍕'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}