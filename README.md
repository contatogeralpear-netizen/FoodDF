# FOODDF

Plataforma de restaurantes com seleção por estado e cidade, cardápio, carrinho e finalização pelo WhatsApp. Primeira versão do cliente, baseada nas telas fornecidas. Cadastro de estabelecimentos e painel administrativo ficam para a próxima etapa.

## Desenvolvimento

Requer Node.js 22 ou superior. Execute `npm ci`, copie `.env.example` para `.env.local` e configure o projeto Supabase. Inicie com `npm run dev`.

Sem configuração de banco, o catálogo usa o restaurante modelo local. Com Supabase, os restaurantes publicados e seus produtos são carregados do banco, respeitando as políticas RLS.

## Demonstração

Brasa Burger é um restaurante fictício em Brasília/DF, com cinco produtos. O botão de envio abre o WhatsApp configurado com uma mensagem explicitamente identificada como pedido fictício. O usuário confirma o envio no WhatsApp. Não há pagamento real, confirmação automática nem gravação de pedidos fictícios.

O comprovante selecionado no fluxo de demonstração fica apenas na memória da página; é necessário anexá-lo manualmente no WhatsApp. Apenas o carrinho é guardado no navegador, sem dados pessoais do cliente.

## Verificação

- `npm run typecheck`
- `npm run build`
- `npm run test:e2e` com o servidor local aberto (instale o navegador com `npx playwright install chromium`).
- `node --test src/lib/server/order-validation.test.mjs` para validação de pedidos, quando disponível.

Os testes de navegador cobrem desktop e celular, filtros, busca, persistência do carrinho, entrega/retirada, troco, Pix demonstrativo, comprovante e conteúdo/destino do link WhatsApp. Não enviam mensagens.

## Implantação

Next.js App Router + TypeScript, GitHub, Vercel e Supabase. As variáveis são descritas em `.env.example`. Chaves secretas nunca devem ser expostas em `NEXT_PUBLIC_*` nem versionadas.

Consulte [docs/BACKEND.md](docs/BACKEND.md) para estrutura do banco, endpoints e requisitos para ativar pedidos reais. Esta implantação mantém `FOODDF_ACCEPT_ORDERS=false`.

As imagens originais fornecidas foram reutilizadas com recortes por viewport SVG, preservando os arquivos de referência.
