import type { MetadataRoute } from 'next';
import { restaurantPath } from '@/lib/domain';
import { getIndexableRestaurants } from '@/lib/server/catalog';
import { siteOrigin } from '@/lib/seo';
import { allMunicipalities, cityPath, getState, locationSlug, statePath } from '@/lib/locations';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const restaurants = await getIndexableRestaurants().catch(() => []);
  const locations = new Set(restaurants.map(r => `${r.state.toUpperCase()}:${locationSlug(r.city)}`));
  const cities = allMunicipalities.filter(c => locations.has(`${c.state}:${locationSlug(c.name)}`));
  const states = new Set(cities.map(c => c.state));

  // Páginas estáticas canônicas e de conteúdo substancial
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteOrigin}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteOrigin}/buscas`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${siteOrigin}/para-restaurantes`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteOrigin}/como-funciona`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteOrigin}/cidades`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Guias editoriais para GEO/AEO
    {
      url: `${siteOrigin}/guias/como-pedir-pelo-whatsapp-com-seguranca`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${siteOrigin}/guias/pagamento-por-pix-direto-ao-restaurante`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${siteOrigin}/guias/como-montar-cardapio-digital-gratis`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    // Páginas institucionais e de conformidade legal / AdSense
    {
      url: `${siteOrigin}/sobre`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteOrigin}/contato`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteOrigin}/privacidade`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteOrigin}/cookies`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteOrigin}/termos`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteOrigin}/politica-de-restaurantes`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Apenas restaurantes reais indexáveis (is_demo === false)
  const restaurantRoutes: MetadataRoute.Sitemap = restaurants.map(r => ({
    url: `${siteOrigin}${restaurantPath(r.slug)}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }));

  // Apenas estados que possuem pelo menos 1 restaurante real publicado
  const stateRoutes: MetadataRoute.Sitemap = [...states]
    .filter(uf => getState(uf))
    .map(uf => ({
      url: `${siteOrigin}${statePath(uf)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  // Apenas cidades que possuem pelo menos 1 restaurante real publicado
  const cityRoutes: MetadataRoute.Sitemap = cities.map(city => ({
    url: `${siteOrigin}${cityPath(city.state, city.name)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...restaurantRoutes, ...stateRoutes, ...cityRoutes];
}
