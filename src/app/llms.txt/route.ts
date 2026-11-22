import { siteOrigin } from '@/lib/seo';

export function GET() {
  const body = `# FOODDF

> Plataforma brasileira de cardápios digitais onde o cliente encontra restaurantes por estado e cidade, explora o cardápio e faz o pedido direto pelo WhatsApp.

## Páginas principais

- [Página inicial](${siteOrigin}/): encontre restaurantes por estado e cidade, veja cardápios e peça pelo WhatsApp.
- [Para restaurantes](${siteOrigin}/para-restaurantes): cadastre seu restaurante e use o cardápio digital FOODDF gratuitamente.
- [Como funciona](${siteOrigin}/como-funciona): entenda o passo a passo para fazer um pedido pelo FOODDF.
- [Cidades e estados](${siteOrigin}/cidades): explore todas as cidades do Brasil com restaurantes disponíveis.
- [Versão completa](${siteOrigin}/llms-full.txt): informações detalhadas para modelos de linguagem.

## Palavras-chave

Restaurantes em Brasília, cardápio digital grátis, pedir comida pelo WhatsApp, delivery, cardápio online.

## Contato

Site: ${siteOrigin}
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}
