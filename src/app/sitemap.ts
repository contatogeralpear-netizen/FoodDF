import type { MetadataRoute } from 'next';
import { restaurantPath } from '@/lib/domain';
import { getIndexableRestaurants } from '@/lib/server/catalog';
import { siteOrigin } from '@/lib/seo';
import { allMunicipalities, cityPath, getState, locationSlug, statePath } from '@/lib/locations';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const restaurants = await getIndexableRestaurants();
  const locations = new Set(restaurants.map(r => `${r.state.toUpperCase()}:${locationSlug(r.city)}`));
  const cities = allMunicipalities.filter(c => locations.has(`${c.state}:${locationSlug(c.name)}`));
  const states = new Set(cities.map(c => c.state));

  return [
    {
      url: `${siteOrigin}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteOrigin}/para-restaurantes`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteOrigin}/cidades`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteOrigin}/como-funciona`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...restaurants.map(r => ({
      url: `${siteOrigin}${restaurantPath(r.slug)}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...[...states].filter(uf => getState(uf)).map(uf => ({
      url: `${siteOrigin}${statePath(uf)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...cities.map(city => ({
      url: `${siteOrigin}${cityPath(city.state, city.name)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
