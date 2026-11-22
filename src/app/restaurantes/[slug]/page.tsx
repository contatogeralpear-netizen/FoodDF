import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import FoodApp from '@/components/food-app';
import { restaurantPath } from '@/lib/domain';
import { getCatalog, RestaurantNotFoundError } from '@/lib/server/catalog';
import { isFreePromotionActive } from '@/lib/promotion';
import { indexableRobots, ogDefaults, twitterDefaults } from '@/lib/seo';

export const dynamic = 'force-dynamic';

type RestaurantPageProps = { params: Promise<{ slug: string }> };
const loadCatalog = cache(getCatalog);

export async function generateMetadata({ params }: RestaurantPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { restaurant } = await loadCatalog(slug);
    const title = restaurant.isDemo
      ? `${restaurant.name} — demonstração | FOODDF`
      : `${restaurant.name} em ${restaurant.city}/${restaurant.state} | FOODDF`;
    const description = restaurant.isDemo
      ? 'Conheça um cardápio fictício e veja como funciona o FOODDF. Não há cobrança na demonstração.'
      : `${restaurant.description || `Conheça o cardápio de ${restaurant.name}`} · ${restaurant.city}/${restaurant.state}.`;
    return {
      title,
      description,
      keywords: restaurant.isDemo
        ? ['restaurante demonstração', 'cardápio digital', 'FOODDF']
        : [`${restaurant.name}`, `restaurante em ${restaurant.city}`, `cardápio ${restaurant.name}`, `delivery ${restaurant.city}`],
      alternates: { canonical: restaurantPath(restaurant.slug) },
      ...(restaurant.isDemo ? { robots: { index: false, follow: true } } : { robots: indexableRobots }),
      openGraph: ogDefaults(restaurantPath(restaurant.slug), title, description),
      twitter: twitterDefaults,
    };
  } catch (error) {
    if (!(error instanceof RestaurantNotFoundError)) throw error;
    return { title: 'Restaurante não encontrado | FOODDF', robots: { index: false, follow: true } };
  }
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { slug } = await params;
  try {
    const catalog = await loadCatalog(slug);
    if (catalog.restaurant.slug !== slug) permanentRedirect(restaurantPath(catalog.restaurant.slug));
    return <FoodApp initialCatalog={catalog} promotionActive={isFreePromotionActive()} />;
  } catch (error) {
    if (error instanceof RestaurantNotFoundError) notFound();
    throw error;
  }
}
