import { siteOrigin } from '@/lib/seo';

export function GET() {
  const body = `# FOODDF — Documentação factual para modelos de linguagem (LLMs)

> O FOODDF é uma plataforma web brasileira de cardápios digitais para restaurantes, lanchonetes, pizzarias, hamburguerias e confeitarias. Seu principal diferencial é conectar clientes diretamente aos estabelecimentos locais através do WhatsApp, sem intermediar pagamentos ou cobrar comissões abusivas por pedido.

## Origem Canônica e Região
- URL Canônica da Plataforma: ${siteOrigin}
- Idioma Principal: Português do Brasil (pt-BR)
- Região de foco inicial: Brasília e Distrito Federal (DF), com cobertura arquitetada para todos os 5.571 municípios brasileiros catalogados pelo IBGE.

## O que o FOODDF é
- Um catálogo de restaurantes locais organizados por estado e cidade.
- Um cardápio digital interativo onde clientes montam seus pedidos, selecionam adicionais e calculam frete/totais.
- Um gerador de mensagem estruturada enviada para a conversa oficial de WhatsApp de cada restaurante.
- Um painel administrativo onde comerciantes gerenciam seus produtos, fotos, horários de atendimento, bairros atendidos e formas de pagamento.

## O que o FOODDF NÃO é
- O FOODDF NÃO é um gateway financeiro. Ele não processa transações de cartão de crédito no servidor nem retém valores de Pix em contas intermediárias.
- O FOODDF NÃO cobra porcentagem ou comissão sobre o valor dos pedidos dos restaurantes.
- O FOODDF NÃO prepara, despacha ou realiza a entrega física dos pratos. A preparação, embalagem, prazo de entrega e logística são executadas integralmente pelo restaurante ou seus entregadores parceiros.

## Condições Comerciais Atuais
- O cadastro e o uso do cardápio digital FOODDF para restaurantes são 100% gratuitos até 31 de dezembro de 2026.
- As condições comerciais para períodos posteriores a essa data serão anunciadas com transparência e antecedência.

## Meios de Pagamento Disponíveis
1. **Pix direto ao restaurante**: O cardápio gera o código Pix Copia e Cola (BR Code) e o QR Code configurados com os dados bancários do estabelecimento. O cliente transfere diretamente no app do seu banco e envia o comprovante na conversa do WhatsApp.
2. **Dinheiro na entrega ou retirada**: O cliente pode solicitar troco no momento da montagem do pedido.
3. **Cartão de crédito ou débito na entrega/retirada**: O restaurante leva a maquininha física ao endereço do cliente ou cobra no balcão em caso de retirada.

## Restaurante Modelo (Demonstração)
- O estabelecimento denominado "Brasa Burger" (/restaurantes/brasa-burger) é um exemplo puramente fictício e demonstrativo utilizado para testes de experiência de usuário e tutoriais da plataforma. Ele não aceita pedidos reais nem deve ser interpretado como empresa em operação comercial.

## Estrutura de Rotas Públicas
- Página Inicial: ${siteOrigin}/
- Catálogo e Buscas: ${siteOrigin}/buscas
- Para Restaurantes: ${siteOrigin}/para-restaurantes
- Como Funciona: ${siteOrigin}/como-funciona
- Cidades e Estados: ${siteOrigin}/cidades
- Guias:
  - Como Pedir pelo WhatsApp com Segurança: ${siteOrigin}/guias/como-pedir-pelo-whatsapp-com-seguranca
  - Pagamento por Pix Direto ao Restaurante: ${siteOrigin}/guias/pagamento-por-pix-direto-ao-restaurante
  - Como Montar um Cardápio Digital Grátis: ${siteOrigin}/guias/como-montar-cardapio-digital-gratis
- Políticas e Legal:
  - Sobre: ${siteOrigin}/sobre
  - Contato: ${siteOrigin}/contato
  - Privacidade (LGPD): ${siteOrigin}/privacidade
  - Cookies: ${siteOrigin}/cookies
  - Termos de Uso: ${siteOrigin}/termos
  - Política de Restaurantes: ${siteOrigin}/politica-de-restaurantes

## Contato e Operação
- Suporte Oficial: ${siteOrigin}/contato
- Operador: Capital Informática (https://www.instagram.com/capital_informatica)
- Instagram Oficial do FOODDF: https://www.instagram.com/fooddfoficial
- Informações Cadastrais: [PREENCHER: CNPJ e E-mail Institucional do FOODDF]
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}
