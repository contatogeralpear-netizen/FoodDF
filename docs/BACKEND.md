# FOODDF — base de dados e API

O FOODDF é um marketplace. Cada conta confirma seu e-mail e cadastra seu próprio restaurante em /paineladministativo. O painel de gestão global não faz parte desta etapa.

## Estado desta entrega

- Projeto Supabase: `qegwmsvwmanppoksqsgp`.
- Catálogo público conectado ao Supabase com restaurantes e produtos publicados.
- Restaurante **Brasa Burger**, em Brasília/DF, é fictício (`is_demo = true`). Cinco produtos e preços ilustrativos seguem as telas de referência.
- WhatsApp de teste autorizado: `5561982429847`. A interface identifica os resumos como pedido fictício. Não há confirmação automática de envio ou de pagamento.
- Nenhuma chave Pix foi inventada. `pix_key`, `pix_name` e `pix_city` estão vazios.
- Painel administrativo individual com cadastro e edição do próprio restaurante, CRUD de produtos/categorias, fotos, promoções, adicionais, horários e configurações de pagamento/entrega.
- O envio de pedidos persistidos e de comprovantes privados permanece desativado por `FOODDF_ACCEPT_ORDERS=false` e ausência de chave secreta. Quando `acceptingOrders` retornado pelo catálogo é falso, o cliente prepara o resumo e abre o WhatsApp diretamente, sem criar um pedido no banco. A demonstração sempre identifica o pedido como fictício.

## Autenticação e administração

O painel usa `supabase-js` com a chave publicável e login por link de e-mail (`signInWithOtp`). O endereço de retorno é `https://fooddf.vercel.app/paineladministativo`, que deve estar na lista de URLs permitidas do Supabase Auth. A entrega do e-mail e o primeiro acesso pela caixa de entrada ainda não foram verificados.

`fooddf_private.restaurant_members` vincula um e-mail confirmado a um restaurante. Não pode ser lida ou alterada pelos clientes. `can_manage` consulta o usuário confirmado e o vínculo no banco, sem confiar em metadados editáveis. O antigo `is_admin` retorna false; não há superadministrador habilitado. `fooddf_has_panel_access` permite abrir o cadastro para contas confirmadas.

`fooddf_create_restaurant` cria o primeiro rascunho e o vínculo de propriedade em uma transação, com bloqueio para cadastros simultâneos e limite de um restaurante por conta. Todas as operações autenticadas são limitadas pela RLS ao restaurante do proprietário. Uma conta não lista outras lojas nem acessa seus produtos, categorias, planos ou métricas. Novos restaurantes começam em rascunho. O controle is_open é manual; horários são informativos.

As tabelas `restaurants` e `products` guardam as configurações da loja e os campos de apresentação do cardápio. `categories` organiza os nomes por restaurante; a RPC `fooddf_rename_category` atualiza o nome e os produtos vinculados na mesma transação. Produtos podem ter preço promocional, destaque, disponibilidade, quantidade de pessoas servidas e adicionais com preço em centavos.

As fotos de produtos, logos e capas ficam no bucket público `restaurant-images`. A leitura é pública para exibição no cardápio; envio e gerenciamento exigem vínculo com o restaurante indicado no primeiro segmento do caminho do arquivo. São aceitos JPG, PNG e WebP de até 5 MB. Comprovantes de pagamento usam outro bucket, privado, e não devem ser enviados como imagens de catálogo.

`restaurant_plans` registra o início do teste de sete dias e o interesse no Pro de R$ 24,90/mês, valor de referência. Não há gateway, contratação, cobrança recorrente ou bloqueio automático após o teste.

`catalog_events` registra visitas e cliques no WhatsApp, deduplicados por restaurante, dia, identificador de sessão e tipo. Não recebe nome, telefone ou endereço do cliente. As métricas são aproximações de uso, não pedidos confirmados nem pagamentos. `fooddf_admin_metrics` retorna a agregação dos últimos sete dias apenas ao proprietário do restaurante.

## Ambiente

Use `.env.example` como referência. `.env.local` deve permanecer fora do Git.

- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: chave pública, sujeita a RLS.
- `SUPABASE_SECRET_KEY`: opcional nesta fase; chave apenas do servidor, nunca com prefixo `NEXT_PUBLIC_`.
- `FOODDF_ACCEPT_ORDERS`: `false` por padrão. A ativação futura exige chave secreta e restaurante real com `accepting_orders=true`, `status='published'`, `active=true`, `is_demo=false` e WhatsApp válido.
- `FOODDF_SITE_URL`: origem oficial opcional para as requisições de escrita.

O servidor também aceita `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` como aliases. Uma falha de conexão com um banco configurado é mostrada como erro; não há substituição silenciosa por catálogo fictício. Sem qualquer configuração, a API oferece exclusivamente o modelo local Brasa Burger.

## Endpoints

`GET /api/restaurants?state=DF&city=Brasília` retorna `{restaurants,mode}`. Os filtros são opcionais. Cada restaurante inclui `id`, `slug`, `name`, `state`, `city`, `address`, `deliveryFee` em centavos, `isDemo`, `acceptingOrders` e suas configurações públicas. `acceptingOrders` indica que a persistência pelo servidor está habilitada; o encaminhamento direto por WhatsApp não depende dessa opção.

`GET /api/catalog?restaurant=brasa-burger` aceita slug ou ID e retorna `{products,restaurant,mode}`. Produtos incluem `{id,name,description,price,category,image,originalPrice,featured,serves,extras}`. `price` é o preço efetivo em centavos, considerando a promoção; `originalPrice` permite mostrar o valor anterior. `image` é um identificador de asset (`burger`, `meal`, `fries`, `combo`, `drink`) ou URL pública da foto. O restaurante inclui dados Pix/WhatsApp, logo, capa, descrição, horários, abertura, meios de pagamento, entrega/retirada, taxa, pedido mínimo e bairros. A interface abre uma loja em `/?restaurante=slug`.

`GET /api/config?restaurant=brasa-burger` retorna dados da loja, modo e formatos/limite para comprovantes.

`POST /api/events` recebe `{restaurant_slug,visitor,kind}`, sendo `visitor` um UUID de sessão e `kind` igual a `visit` ou `whatsapp`. A RPC `fooddf_track_event` só grava eventos para lojas públicas/ativas e ignora duplicatas do mesmo dia. O público não tem acesso direto à tabela de eventos ou às estatísticas.

`POST /api/orders` está preparado para a etapa de pedidos reais. O contrato é:

```json
{
  "requestId": "UUID estável para este envio",
  "accessToken": "outro UUID aleatório mantido pelo cliente",
  "restaurantId": "id-da-loja",
  "items": [{ "productId": "id-do-produto", "quantity": 1, "extraIds": [] }],
  "customer": { "name": "Nome", "phone": "(61) 99999-0000" },
  "fulfillment": "delivery",
  "address": "Endereço completo",
  "notes": "",
  "paymentMethod": "cash",
  "changeFor": null
}
```

`fulfillment`: `delivery` ou `pickup`. `paymentMethod`: `pix`, `cash` ou `card`. `changeFor`: centavos, somente para dinheiro. `extraIds` é opcional e identifica os adicionais escolhidos. O servidor consulta preços, promoções, adicionais e taxa atuais, confere abertura, modalidades aceitas e pedido mínimo; o contrato estrito rejeita campos desconhecidos. A resposta traz `orderId`, `reference`, `subtotal`, `deliveryFee`, `total`, `status`, `paymentStatus` e `accessToken`. Repetir o mesmo `requestId`, token e corpo recupera o pedido, evitando duplicação. O token é armazenado somente como hash SHA-256. Nenhuma chamada desta API confirma pagamento.

`POST /api/receipts` recebe `multipart/form-data` com `orderId`, `accessToken` e `file`. Somente o titular do token pode anexar ao pedido, dentro de 24 horas. O primeiro comprovante é preservado em retries. PNG, JPG e PDF têm limite de 4 MB, tipo MIME e assinatura de arquivo verificados. O bucket `payment-receipts` é privado; a API retorna URL assinada válida por 24 horas. Anexar o arquivo não altera o pagamento de `pending` para `confirmed`.

A persistência de pedidos e comprovantes ainda precisa de testes completos em ambiente habilitado antes de sua ativação. No fluxo atual pelo WhatsApp, o comprovante fica na memória da página e precisa ser anexado manualmente na conversa; selecionar o arquivo não o transmite. O usuário revisa e confirma o envio no WhatsApp. O restaurante confirma disponibilidade, pedido e pagamento.

## Proteções e migrações

Todas as tabelas públicas têm RLS. A role authenticated acessa somente registros do próprio restaurante. A role anon lê apenas restaurantes publicados e campos públicos permitidos explicitamente; owner_id, telefone interno e metadados administrativos não são concedidos. Produtos públicos são filtrados por atividade e publicação. Pedidos persistidos e comprovantes privados continuam restritos à API futura do servidor.

As migrações em `supabase/migrations` foram geradas com Supabase CLI 3.0.0 e aplicadas ao projeto via conector Supabase. Além da base e dos reforços de segurança, `admin_panel` adiciona cadastros, autorização, imagens, planos e eventos; `admin_metrics` adiciona a agregação administrativa. Nenhuma credencial está nas migrações. A migração restaurant_isolation substitui a autorização global por propriedade individual. Tabelas privadas não têm políticas para clientes por intenção.

Verificação local da lógica de preços/validação:

```powershell
node --test src/lib/server/order-validation.test.mjs
npm run typecheck
```

Validações remotas conferem catálogo público, RLS ativo, ausência de acesso público a pedidos, bucket privado e advisors de segurança. Os índices podem aparecer como ainda não utilizados em um projeto recém-criado.

`tests/admin-security.sql` cria duas contas e lojas em transação revertida, testa isolamento de leitura/escrita, uploads, planos, métricas, duplicidade de cadastro e contas não confirmadas. Fixtures não persistem.

`tests/admin-flow.spec.ts` usa APIs simuladas e isoladas para validar a interface em desktop/celular, inclusive fotos, adicionais, salvamento, troca de restaurante e planos. Esses testes não comprovam entrega de e-mail nem uma sessão autenticada real de ponta a ponta.

Referências: [RLS no Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security), [chaves de API](https://supabase.com/docs/guides/getting-started/api-keys), [arquivos privados e URLs assinadas](https://supabase.com/docs/guides/storage/serving/downloads).
