# O que foi corrigido nesta versão

## 1. O bug que você reportou (tela de acompanhamento do pedido)

**Erro:** `Cannot read properties of undefined (reading 'replace')` em `StatusPedidoPage.tsx`.

**Causa raiz:** o campo `telefone` foi adicionado depois ao tipo `TenantConfig`
(`src/store/tenant.store.ts`), mas esse store usa `zustand/persist`, que salva os
dados no `localStorage` do navegador. Quem já tinha aberto o app antes dessa
mudança ficou com uma pizzaria salva **sem** o campo `telefone` — e o código
fazia `config.telefone.replace(...)` sem checar se o valor existia.

**Correção aplicada:**
- Adicionada uma função `migrate` com `version: 2` no `tenant.store.ts`, que
  preenche `telefone: ''` automaticamente em dados antigos salvos no navegador.
- A tela de status agora trata o caso de telefone vazio mostrando um aviso em
  vez de quebrar.
- **Se o erro persistir no seu navegador atual**, é só limpar o `localStorage`
  do site uma vez (DevTools → Application → Local Storage → apagar as chaves
  `sua-pizzaria-saas-tenants` e `pizzashop-pedido-ativo-*`) ou usar uma aba
  anônima — a migração cuida do resto a partir daí.

## 2. Outros bugs reais encontrados ao compilar o projeto

O `.docx` continha um bug muito comum de projetos React/TS que só aparece
quando você realmente tenta rodar o código:

- **`Navbar.tsx`, `CadastroPizzariaPage.tsx`, `CheckoutPage.tsx`,
  `PagamentoPixPage.tsx`** — importavam `useNavigate` mas nunca chamavam
  `const navigate = useNavigate()`. Isso quebraria o app assim que você
  tentasse navegar do carrinho → checkout → pagamento → status.
- **`DetalhePizzaPage.tsx`** — usava uma variável `currentTenantId` que não
  existia (o nome certo era `tenantId`).
- **`Loading.tsx` e `MensagemErro.tsx`** — estavam referenciados por várias
  páginas, mas **não existiam** no material entregue (o "código fonte
  completo" na verdade estava incompleto). Recriei os dois componentes.
- **`PerfilCompradorPage.tsx`** — tinha um `return` condicional **antes** de
  vários `useState`, o que viola as Regras dos Hooks do React e causa
  comportamento imprevisível (ex: ao logar/deslogar, trocar de conta). Os
  hooks foram movidos para antes do `return` condicional.
- **`GerenciarCardapio.tsx`** — o `useEffect` que carrega o cardápio dependia
  de `tenantId` (do `useParams`) mas usava `currentTenantId` dentro. Corrigido
  para depender da variável realmente usada.

Depois dessas correções, `npm run build` (TypeScript + Vite) e o linter rodam
100% limpos.

## 3. Interface "feia e desorganizada"

Ao investigar, descobri o motivo real: **o arquivo `App.css` do documento
estava cortado pela metade.** Ele terminava abruptamente no meio, com o
comentário `/* Demais classes preservadas */` sem nenhuma linha depois. Das
225 classes CSS usadas no código, **mais de 140 não tinham nenhum estilo
definido** — ou seja, mais da metade das telas (login, cadastro, carrinho,
checkout, pagamento PIX, acompanhamento de pedido, painel administrativo
inteiro) estava sendo renderizada como HTML puro, sem nenhum CSS. É por isso
que a interface parecia quebrada.

**O que fiz:** reescrevi o `App.css` do zero, cobrindo 100% das classes
usadas no projeto, com um sistema de design coerente:

- **Paleta:** tom "forno de pedra" — creme quente de menu de trattoria (`#FBF7EF`)
  com dourado de crosta assada (`#BD7A24`) como cor da plataforma, e tinta
  quase-preta (`#2A2118`) para texto. Cada pizzaria continua podendo definir
  sua própria `corPrimaria`/`corSecundaria` no painel admin — isso é aplicado
  dinamicamente via CSS variables (`--color-primary`/`--color-secondary`) só
  dentro da loja, sem conflitar com a identidade da plataforma (portal, login,
  cadastro).
- **Tipografia:** título com serifa (`Fraunces`) para dar personalidade de
  cardápio, texto em sans-serif (`Inter`) para leitura confortável.
- **Consistência:** escala única de espaçamento, raio de borda e sombra
  (`--radius-sm/md/lg`, `--shadow-sm/md/lg`) usada em todos os cards, botões e
  formulários, em vez de valores soltos e diferentes em cada página.
- **Responsividade:** grids e formulários colapsam para 1 coluna em telas
  menores (breakpoints em 900px e 640px), já que o projeto é uma PWA
  mobile-first.
- **Acessibilidade:** foco visível (`:focus-visible`) em botões, links e
  campos, e `prefers-reduced-motion` respeitado no spinner de carregamento.

## Resumo rápido

| Item | Status |
|---|---|
| Bug do `.replace()` no acompanhamento de pedido | ✅ Corrigido (+ migração de dados antigos) |
| `useNavigate` sem `navigate()` em 4 páginas | ✅ Corrigido |
| Variável inexistente em `DetalhePizzaPage` | ✅ Corrigido |
| Componentes `Loading`/`MensagemErro` ausentes | ✅ Recriados |
| Ordem de Hooks quebrada em `PerfilCompradorPage` | ✅ Corrigido |
| Dependência errada de `useEffect` | ✅ Corrigido |
| CSS cortado pela metade (140+ classes sem estilo) | ✅ Reescrito do zero |
| `npm run build` / TypeScript / lint | ✅ Limpos |
