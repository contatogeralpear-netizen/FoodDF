import { siteOrigin } from '@/lib/seo';

export function GET() {
  const body = `# FOODDF

> Plataforma brasileira de cardápios digitais onde clientes encontram restaurantes por estado e cidade, exploram pratos e realizam o pedido diretamente pelo WhatsApp do estabelecimento.

## Páginas principais

- [Página inicial](${siteOrigin}/): Encontre restaurantes por estado e cidade, veja cardápios e envie pedidos pelo WhatsApp.
- [Buscar restaurantes](${siteOrigin}/buscas): Catálogo completo com filtros de estados, cidades e ordenação.
- [Para restaurantes](${siteOrigin}/para-restaurantes): Informações sobre como cadastrar seu restaurante e usar o cardápio digital gratuitamente até 31/12/2026.
- [Como funciona](${siteOrigin}/como-funciona): Passo a passo detalhado para clientes e restaurantes realizarem pedidos.
- [Cidades e estados](${siteOrigin}/cidades): Diretório com todas as unidades federativas e municípios do Brasil.

## Guias informativos

- [Como pedir comida pelo WhatsApp com segurança](${siteOrigin}/guias/como-pedir-pelo-whatsapp-com-seguranca): Boas práticas e segurança em pedidos de delivery pelo WhatsApp.
- [Pagamento por Pix direto ao restaurante](${siteOrigin}/guias/pagamento-por-pix-direto-ao-restaurante): Funcionamento do Pix ponta a ponta sem taxas de intermediação.
- [Como montar um cardápio digital grátis](${siteOrigin}/guias/como-montar-cardapio-digital-gratis): Dicas para estruturar categorias e potencializar vendas no delivery.

## Políticas e Informações Institucionais

- [Sobre o FOODDF](${siteOrigin}/sobre): Missão, propósito e funcionamento da plataforma.
- [Contato e Suporte](${siteOrigin}/contato): Canais de atendimento oficial ao cliente e aos estabelecimentos.
- [Política de Privacidade (LGPD)](${siteOrigin}/privacidade): Tratamento de dados pessoais, direitos dos titulares e conformidade com a Lei Geral de Proteção de Dados.
- [Preferências de Cookies](${siteOrigin}/cookies): Tipos de cookies utilizados e opções de consentimento.
- [Termos de Uso](${siteOrigin}/termos): Condições gerais de navegação e responsabilidades contratuais.
- [Diretrizes para Restaurantes](${siteOrigin}/politica-de-restaurantes): Regras de cadastro, veracidade de cardápio e boas práticas.

## Documentação completa

- [Versão detalhada para modelos de IA](${siteOrigin}/llms-full.txt): Informações técnicas e factuais completas sobre a plataforma.
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}
