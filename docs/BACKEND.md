# FOODDF — base de dados e API

O FOODDF é um marketplace: o cliente escolhe estado, cidade e restaurante. O cadastro e a administração dos estabelecimentos pertencem a uma etapa posterior. Não existe inscrição pública de lojistas nesta versão.

## Estado desta entrega

- Projeto Supabase: `qegwmsvwmanppoksqsgp`.
- Catálogo público conectado ao Supabase com restaurantes e produtos publicados.
- Restaurante **Brasa Burger**, em Brasília/DF, é fictício (`is_demo = true`). Cinco produtos e preços ilustrativos seguem as telas de referência.
- WhatsApp de teste autorizado: `5561982429847`. A interface identifica os resumos como pedido fictício. Não há confirmação automática de envio ou de pagamento.
- Nenhuma chave Pix foi inventada. `pix_key`, `pix_name` e `pix_city` estão vazios.
- O envio de pedidos persistidos e de comprovantes privados permanece desativado por `FOODDF_ACCEPT_ORDERS=false` e ausência de chave secreta. A navegação de demonstração funciona independentemente dessas operações.

## Ambiente

Use `.env.example` como referência. `.env.local` deve permanecer fora do Git.

- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: chave pública, sujeita a RLS.
- `SUPABASE_SECRET_KEY`: opcional nesta fase; chave apenas do servidor, nunca com prefixo `NEXT_PUBLIC_`.
- `FOODDF_ACCEPT_ORDERS`: `false` por padrão. A ativação futura exige chave secreta e restaurante real com `accepting_orders=true`, `status='published'`, `active=true`, `is_demo=false` e WhatsApp válido.
- `FOODDF_SITE_URL`: origem oficial opcional para as requisições de escrita.

O servidor também aceita `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` como aliases. Uma falha de conexão com um banco configurado é mostrada como erro; não há substituição silenciosa por catálogo fictício. Sem qualquer configuração, a API oferece exclusivamente o modelo local Brasa Burger.

## Endpoints

`GET /api/restaurants?state=DF&city=Brasília` retorna `{restaurants,mode}`. Os filtros são opcionais. Cada restaurante inclui `id`, `slug`, `name`, `state`, `city`, `address`, `deliveryFee` em centavos, `isDemo` e `acceptingOrders`.

`GET /api/catalog?restaurant=brasa-burger` aceita slug ou ID e retorna `{products,restaurant,mode}`. Produtos seguem `{id,name,description,price,category,image}`; `price` é inteiro em centavos e `image` é um dos identificadores dos assets (`burger`, `meal`, `fries`, `combo`, `drink`). O restaurante inclui os dados Pix/WhatsApp quando cadastrados. A interface abre uma loja em `/?restaurante=slug`.

`GET /api/config?restaurant=brasa-burger` retorna dados da loja, modo e formatos/limite para comprovantes.

`POST /api/orders` está preparado para a etapa de pedidos reais. O contrato é:

```json
{
  "requestId": "UUID estável para este envio",
  "accessToken": "outro UUID aleatório mantido pelo cliente",
  "restaurantId": "id-da-loja",
  "items": [{ "productId": "id-do-produto", "quantity": 1 }],
  "customer": { "name": "Nome", "phone": "(61) 99999-0000" },
  "fulfillment": "delivery",
  "address": "Endereço completo",
  "notes": "",
  "paymentMethod": "cash",
  "changeFor": null
}
```

`fulfillment`: `delivery` ou `pickup`. `paymentMethod`: `pix`, `cash` ou `card`. `changeFor`: centavos, somente para dinheiro. O servidor consulta os preços e a taxa atuais do restaurante; ignora nenhuma entrada desconhecida, pois o contrato estrito rejeita campos extras. A resposta traz `orderId`, `reference`, `subtotal`, `deliveryFee`, `total`, `status`, `paymentStatus` e `accessToken`. Repetir o mesmo `requestId`, token e corpo recupera o pedido, evitando duplicação. O token é armazenado somente como hash SHA-256. Nenhuma chamada desta API confirma pagamento.

`POST /api/receipts` recebe `multipart/form-data` com `orderId`, `accessToken` e `file`. Somente o titular do token pode anexar ao pedido, dentro de 24 horas. O primeiro comprovante é preservado em retries. PNG, JPG e PDF têm limite de 4 MB, tipo MIME e assinatura de arquivo verificados. O bucket `payment-receipts` é privado; a API retorna URL assinada válida por 24 horas. Anexar o arquivo não altera o pagamento de `pending` para `confirmed`.

As operações reais ainda precisam de testes completos em ambiente habilitado, configuração do restaurante e implementação administrativa antes da abertura para clientes. O front-end atual usa o fluxo de demonstração, sem criar pedidos reais nem enviar comprovantes ao banco.

## Proteções e migrações

Todas as tabelas públicas têm RLS. `anon` e `authenticated` só leem restaurantes publicados/ativos e seus produtos ativos. Nenhuma dessas roles pode ler ou inserir pedidos, usar o limitador de requisições ou acessar comprovantes. As escritas da API usam cliente exclusivo do servidor e validação de origem. Há limite persistente de dez tentativas por minuto/IP para pedidos e anexos; o IP é guardado como HMAC, não em texto.

As migrações em `supabase/migrations` foram geradas com Supabase CLI 3.0.0 e aplicadas ao projeto via conector Supabase. A segunda migração remove acesso público a uma função administrativa criada pelo bootstrap da plataforma e reforça a obrigatoriedade de endereço de entrega. Nenhuma credencial está nas migrações.

Verificação local da lógica de preços/validação:

```powershell
node --test src/lib/server/order-validation.test.mjs
npm run typecheck
```

Validações remotas conferem catálogo público, RLS ativo, ausência de acesso público a pedidos, bucket privado e advisors de segurança. Os índices podem aparecer como ainda não utilizados em um projeto recém-criado.

Referências: [RLS no Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security), [chaves de API](https://supabase.com/docs/guides/getting-started/api-keys), [arquivos privados e URLs assinadas](https://supabase.com/docs/guides/storage/serving/downloads).
