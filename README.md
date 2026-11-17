# FOODDF

Plataforma de restaurantes com seleção por estado e cidade, cardápio, carrinho e finalização pelo WhatsApp. Inclui painel administrativo individual para cada restaurante, baseado nas telas fornecidas.

## Desenvolvimento

Requer Node.js 22 ou superior. Execute `npm ci`, copie `.env.example` para `.env.local` e configure o projeto Supabase. Inicie com `npm run dev`.

Sem configuração de banco, o catálogo usa o restaurante modelo local. Com Supabase, os restaurantes publicados e seus produtos são carregados do banco, respeitando as políticas RLS.

## Painel administrativo

Acesse `/paineladministativo` — a grafia da rota segue a solicitação original. O acesso usa e-mail e senha, com criação de conta e recuperação por e-mail. Cada conta autorizada acessa somente os dados do estabelecimento vinculado; a autorização é aplicada no banco. A gestão geral possui uma área separada em `/adminmaster`.

O painel permite selecionar ou cadastrar restaurantes, editar endereço e horários, publicar ou manter a loja em rascunho, gerenciar categorias e produtos, fotos, promoções e adicionais. Também configura Pix, dinheiro, cartão, entrega, retirada, taxa, pedido mínimo, bairros e WhatsApp. As alterações salvas alimentam o cardápio público. Os horários são informativos; a chave “Restaurante aberto” controla manualmente a abertura para novos pedidos.

Visitas e cliques no WhatsApp são contados por sessão/dia. Cliques não equivalem a pedidos confirmados. A área de planos registra o início de um teste de sete dias e o interesse no Pro de R$ 24,90/mês, valor de referência. Não contrata assinatura, cobra valores nem bloqueia o cardápio nesta fase.

O endereço de retorno de confirmação e recuperação configurado pelo aplicativo é `https://fooddf.vercel.app/`; esse endereço deve estar permitido no Supabase. A entrega de e-mails depende da configuração do serviço de autenticação.

## Páginas públicas e busca

Cada restaurante publicado e ativo possui uma página em `/restaurantes/slug`, com nome e cardápio no HTML inicial. Os endereços antigos `/?restaurante=slug` continuam funcionando, com indicação de não indexação para evitar cópias. As páginas de pedidos, o restaurante de demonstração e os painéis também não devem ser indexados.

`/para-restaurantes` apresenta o serviço e direciona ao cadastro. O sitemap contém a home, essa página e restaurantes reais publicados e ativos; rascunhos, bloqueados e demonstrações não entram. O sitemap único tem capacidade para 49.998 restaurantes; acima disso será necessário dividi-lo. `robots.txt` declara a política de agentes, e `llms.txt` é apenas um guia opcional, sem garantia de resultados em mecanismos de busca.

## Demonstração

Brasa Burger é um restaurante fictício em Brasília/DF, com cinco produtos. O botão de envio abre o WhatsApp configurado com uma mensagem explicitamente identificada como pedido fictício. O usuário confirma o envio no WhatsApp. Não há pagamento real, confirmação automática nem gravação de pedidos fictícios.

Quando a persistência de pedidos não está habilitada, inclusive na demonstração, o fluxo prepara o resumo e abre o WhatsApp diretamente. O comprovante selecionado fica apenas na memória da página; é necessário anexá-lo manualmente na conversa. O usuário confirma o envio. O carrinho é guardado no navegador sem os dados pessoais do cliente; as estatísticas usam um identificador aleatório de sessão.

## Verificação

- `npm run typecheck`
- `npm run build`
- `npm run test:e2e` com o servidor local aberto (instale o navegador com `npx playwright install chromium`).
- `node --test tests/catalog-seo.integration.mjs`, após `npm run build`, para verificar o catálogo e o sitemap com um banco simulado isolado.
- `node --test src/lib/server/order-validation.test.mjs` para validação de pedidos, quando disponível.

Os testes de navegador cobrem desktop e celular, filtros, busca, persistência do carrinho, entrega/retirada, troco, Pix demonstrativo, comprovante e conteúdo/destino do link WhatsApp. Não enviam mensagens.

Os testes do painel em `tests/admin-flow.spec.ts` usam respostas de API isoladas para verificar formulários, imagens, adicionais, categorias, configurações, cadastro individual e ausência de seletor de outras lojas, planos e bloqueio de contas sem autorização. Não substituem o teste de autenticação por e-mail. `tests/admin-security.sql` verifica CRUD e políticas de acesso no Supabase dentro de uma transação integralmente revertida.

## Implantação

Next.js App Router + TypeScript, GitHub, Vercel e Supabase. As variáveis são descritas em `.env.example`. Chaves secretas nunca devem ser expostas em `NEXT_PUBLIC_*` nem versionadas.

Consulte [docs/BACKEND.md](docs/BACKEND.md) para estrutura do banco, endpoints e requisitos para ativar a persistência de pedidos e comprovantes. Esta implantação mantém `FOODDF_ACCEPT_ORDERS=false` e não configura chave secreta de servidor; o encaminhamento direto pelo WhatsApp funciona independentemente dessa persistência.

As imagens originais fornecidas foram reutilizadas com recortes por viewport SVG, preservando os arquivos de referência. Fotos enviadas no painel usam o bucket público `restaurant-images`, com JPG, PNG ou WebP de até 5 MB.
