import type { MetadataRoute } from 'next';
import { restaurantPath } from '@/lib/domain';
import { getIndexableRestaurants } from '@/lib/server/catalog';
import { siteOrigin } from '@/lib/seo';
import { allMunicipalities, cityPath, getState, locationSlug, statePath } from '@/lib/locations';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fail rather than silently serving an incomplete sitemap during a database outage.
  const restaurants = await getIndexableRestaurants();
  const locations = new Set(restaurants.map(r=>`${r.state.toUpperCase()}:${locationSlug(r.city)}`));
  const cities = allMunicipalities.filter(c=>locations.has(`${c.state}:${locationSlug(c.name)}`));
  const states = new Set(cities.map(c=>c.state));
  return [
    { url: `${siteOrigin}/` },
    { url: `${siteOrigin}/para-restaurantes` },
    { url: `${siteOrigin}/cidades` },
    { url: `${siteOrigin}/como-funciona` },
    ...restaurants.map(r => ({ url: `${siteOrigin}${restaurantPath(r.slug)}` })),
    ...[...states].filter(uf=>getState(uf)).map(uf=>({url:`${siteOrigin}${statePath(uf)}`})),
    ...cities.map(city=>({url:`${siteOrigin}${cityPath(city.state,city.name)}`})),
  ];
}
