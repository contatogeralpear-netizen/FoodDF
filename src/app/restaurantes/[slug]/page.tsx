import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import FoodApp from '@/components/food-app';
import { restaurantPath } from '@/lib/domain';
import { getCatalog, RestaurantNotFoundError } from '@/lib/server/catalog';
import { isFreePromotionActive } from '@/lib/promotion';
import { indexableRobots, ogDefaults, twitterDefaults, siteOrigin } from '@/lib/seo';

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

    const schemas = [];
    if (!catalog.restaurant.isDemo) {
      const restaurantSchema = {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: catalog.restaurant.name,
        description: catalog.restaurant.description || `Cardápio de ${catalog.restaurant.name} em ${catalog.restaurant.city}/${catalog.restaurant.state}`,
        url: `${siteOrigin}${restaurantPath(catalog.restaurant.slug)}`,
        image: catalog.restaurant.cover || catalog.restaurant.logo || undefined,
        servesCuisine: catalog.restaurant.cuisine || undefined,
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'BR',
          addressRegion: catalog.restaurant.state,
          addressLocality: catalog.restaurant.city,
          streetAddress: catalog.restaurant.address,
        },
        hasMenu: {
          '@type': 'Menu',
          name: `Cardápio de ${catalog.restaurant.name}`,
          hasMenuItem: catalog.products.map(p => ({
            '@type': 'MenuItem',
            name: p.name,
            description: p.description,
            offers: {
              '@type': 'Offer',
              price: (p.price / 100).toFixed(2),
              priceCurrency: 'BRL',
            },
          })),
        },
      };
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'FOODDF', item: siteOrigin },
          { '@type': 'ListItem', position: 2, name: 'Cidades', item: `${siteOrigin}/cidades` },
          { '@type': 'ListItem', position: 3, name: catalog.restaurant.state, item: `${siteOrigin}/cidades/${catalog.restaurant.state.toLowerCase()}` },
          { '@type': 'ListItem', position: 4, name: catalog.restaurant.name },
        ],
      };
      schemas.push(restaurantSchema, breadcrumbSchema);
    }

    return <>
      {schemas.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }}
        />
      )}
      <FoodApp initialCatalog={catalog} promotionActive={isFreePromotionActive()} />
    </>;
  } catch (error) {
    if (error instanceof RestaurantNotFoundError) notFound();
    throw error;
  }
}
