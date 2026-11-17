import type { MetadataRoute } from 'next';
import { restaurantPath } from '@/lib/domain';
import { getIndexableRestaurantSlugs } from '@/lib/server/catalog';
import { siteOrigin } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fail rather than silently serving an incomplete sitemap during a database outage.
  const slugs = await getIndexableRestaurantSlugs();
  return [
    { url: `${siteOrigin}/` },
    { url: `${siteOrigin}/para-restaurantes` },
    ...slugs.map(slug => ({ url: `${siteOrigin}${restaurantPath(slug)}` })),
  ];
}
