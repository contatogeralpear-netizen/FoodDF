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
  const privateOrDuplicate = Boolean(query.restaurante || query.pedido);
  const title = 'Restaurantes e cardápios em Brasília | Peça pelo WhatsApp';
  const description = 'Encontre restaurantes por estado e cidade, veja os cardápios e peça pelo WhatsApp. Cardápio digital grátis para restaurantes no FOODDF.';
  return {
    title,
    description,
    keywords: ['restaurantes em Brasília', 'cardápio digital', 'pedir comida pelo WhatsApp', 'delivery Brasília', 'FOODDF'],
    alternates: { canonical: legacySlug ? restaurantPath(legacySlug) : '/' },
    openGraph: ogDefaults('/', title, description),
    twitter: twitterDefaults,
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
    sameAs: [],
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
