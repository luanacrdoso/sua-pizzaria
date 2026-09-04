# 🍕 Pizzaria Callidus

Software white-label para pizzarias: um site só, personalizável do zero,
com pedidos por delivery, retirada e presencial (sistema de comanda e
mesas).

## Tecnologias

- React 18 + TypeScript
- Vite
- React Router
- Zustand (estado global + persistência)

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Login do Admin do Site

- **Usuário:** `calliduspizzaria`
- **Senha:** `equipe3`

O cardápio começa vazio — cadastre os itens pela aba "Cardápio" do painel
antes de testar o fluxo de compra.

## Perfis de acesso

| Perfil | O que faz |
|---|---|
| Admin do Site | Personaliza a pizzaria, cardápio, pagamento, aprova funcionários, dashboard |
| Cliente | Faz pedidos, chama garçom, paga, avalia |
| Balcão | Registra pedidos de retirada |
| Cozinha | Atualiza cardápio e status de preparo |
| Garçom | Assume mesas, anota comandas, recebe gorjeta |
| Motoboy | Assume e confirma entregas |

Cadastro de funcionário fica pendente até o Admin do Site aprovar.

## Observações

- Não há backend: os dados ficam salvos no navegador (localStorage/
  sessionStorage).
- Pagamento via Pix é simulado.
