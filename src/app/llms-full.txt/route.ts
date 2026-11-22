import { siteOrigin } from '@/lib/seo';

export function GET() {
  const body = `# FOODDF — Informações completas para modelos de linguagem

> FOODDF é uma plataforma brasileira de cardápios digitais e pedidos via WhatsApp. Restaurantes, lanchonetes, pizzarias, cafeterias e hamburguerias se cadastram, organizam seus cardápios, e clientes encontram os estabelecimentos por estado e cidade, exploram os produtos e encaminham o pedido diretamente pelo WhatsApp do restaurante.

## URL do site

${siteOrigin}

## Como funciona (para o cliente)

1. **Escolha sua região**: selecione estado e cidade na página inicial.
2. **Explore os cardápios**: abra o restaurante desejado e confira produtos, preços, informações de entrega ou retirada.
3. **Monte sua sacola**: escolha os itens, informe dados de entrega ou retirada e a forma de pagamento.
4. **Confirme pelo WhatsApp**: revise o resumo do pedido e envie na conversa com o restaurante. O restaurante confirma disponibilidade, prazo e pagamento.

## Como funciona (para o restaurante)

1. Cadastre seu estabelecimento informando dados, localização e WhatsApp.
2. Organize seu cardápio: adicione produtos, fotos, categorias e preços.
3. Receba pedidos pelo WhatsApp configurado. O restaurante confirma o pedido diretamente com o cliente.

## Promoção atual

Cadastro e uso são gratuitos para restaurantes até 31 de dezembro de 2026. As condições após essa data serão informadas quando definidas.

## Formas de pagamento aceitas

Pix, dinheiro (na entrega/retirada) e cartão (crédito ou débito na entrega). A confirmação do pagamento é feita pelo restaurante.

## Perguntas frequentes

**O FOODDF confirma o pagamento automaticamente?**
Não. Quando o restaurante oferece Pix, confirme os dados do recebedor antes de pagar. A conferência do pagamento é feita pelo estabelecimento.

**Que tipos de estabelecimento podem se cadastrar?**
Restaurantes, lanchonetes, pizzarias, cafeterias, hamburguerias e outros estabelecimentos de alimentação.

**O Brasa Burger é um restaurante real?**
Não. É uma demonstração fictícia para conhecer o FOODDF. Não faça pagamentos para testar.

## Páginas do site

- Página inicial: ${siteOrigin}/
- Para restaurantes: ${siteOrigin}/para-restaurantes
- Como funciona: ${siteOrigin}/como-funciona
- Cidades e estados: ${siteOrigin}/cidades
- Restaurante (exemplo): ${siteOrigin}/restaurantes/brasa-burger (demonstração fictícia)

## Dados técnicos

- Stack: Next.js (App Router) hospedado na Vercel.
- Dados de restaurantes e produtos armazenados no Supabase.
- Municípios brasileiros com base no IBGE.
- O site está disponível em português brasileiro (pt-BR).
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}
