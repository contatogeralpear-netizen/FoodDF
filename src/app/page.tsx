import type { Metadata } from 'next';
import FoodApp from '@/components/food-app';
import { getRestaurants } from '@/lib/server/catalog';
import { restaurantPath } from '@/lib/domain';
import { siteOrigin } from '@/lib/seo';
import { isFreePromotionActive } from '@/lib/promotion';

type HomeProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const query = await searchParams;
  const legacySlug = typeof query.restaurante === 'string' && /^[a-z0-9-]{1,100}$/.test(query.restaurante) ? query.restaurante : null;
  const privateOrDuplicate = Boolean(query.restaurante || query.pedido);
  return {
    alternates: { canonical: legacySlug ? restaurantPath(legacySlug) : '/' },
    ...(privateOrDuplicate ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function Page() {
  const result = await getRestaurants().catch(() => null);
  const schema = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'FOODDF', url: `${siteOrigin}/`, inLanguage: 'pt-BR' };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <FoodApp initialRestaurants={result?.restaurants || []} initialCatalogError={!result} promotionActive={isFreePromotionActive()} />
  </>;
}
