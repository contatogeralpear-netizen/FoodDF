import type { Metadata } from 'next';
import FoodApp from '@/components/food-app';
import { getRestaurants } from '@/lib/server/catalog';
import { restaurantPath } from '@/lib/domain';
import { siteOrigin, ogDefaults, twitterDefaults } from '@/lib/seo';
import { isFreePromotionActive } from '@/lib/promotion';

type HomeProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const query = await searchParams;
  const legacySlug = typeof query.restaurante === 'string' && /^[a-z0-9-]{1,100}$/.test(query.restaurante) ? query.restaurante : null;
  const orderParam = typeof query.pedido === 'string' && /^FD\d{1,15}$/i.test(query.pedido) ? query.pedido.toUpperCase() : null;
  const privateOrDuplicate = Boolean(query.restaurante || query.pedido);
  const pageTitle = orderParam
    ? `Pedido ${orderParam} — Acompanhe e Avalie no FOODDF`
    : 'FOODDF — Restaurantes e cardápios por cidade | Peça pelo WhatsApp';
  const description = orderParam
    ? `Acompanhe o andamento do pedido ${orderParam} em tempo real e realize sua avaliação do atendimento e da refeição escolhida.`
    : 'Encontre restaurantes por estado e cidade, conheça os cardápios digitais e combine seu pedido direto pelo WhatsApp no FOODDF.';
  const og = ogDefaults('/', pageTitle, description);
  if (legacySlug || orderParam) {
    const shareLogoUrl = `${siteOrigin}/api/og/restaurant?slug=${encodeURIComponent(legacySlug || 'brasa-burger')}${orderParam ? `&pedido=${encodeURIComponent(orderParam)}` : ''}`;
    og.images = [{ url: shareLogoUrl, width: 600, height: 600, alt: pageTitle }];
  }
  return {
    title: { absolute: pageTitle },
    description,
    keywords: ['restaurantes em Brasília', 'cardápio digital', 'pedir comida pelo WhatsApp', 'delivery Brasília', 'FOODDF'],
    alternates: { canonical: legacySlug ? restaurantPath(legacySlug) : '/' },
    openGraph: og,
    twitter: legacySlug || orderParam ? { card: 'summary', images: [og.images[0].url] } : twitterDefaults,
    ...(privateOrDuplicate ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function Page() {
  const result = await getRestaurants().catch(() => null);
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FOODDF',
    url: `${siteOrigin}/`,
    logo: `${siteOrigin}/icon.svg`,
    description: 'Plataforma de cardápios digitais e pedidos pelo WhatsApp para restaurantes do Brasil.',
    sameAs: [
      'https://www.instagram.com/fooddfoficial'
    ],
  };
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FOODDF',
    url: `${siteOrigin}/`,
    inLanguage: 'pt-BR',
    description: 'Encontre restaurantes por estado e cidade, conheça os cardápios e peça pelo WhatsApp.',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${siteOrigin}/cidades` },
      'query-input': 'required name=search_term_string',
    },
  };
  const schemas = [organizationSchema, websiteSchema];
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} />
    <FoodApp initialRestaurants={result?.restaurants || []} initialCatalogError={!result} promotionActive={isFreePromotionActive()} />
  </>;
}
