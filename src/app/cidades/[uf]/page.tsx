import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allMunicipalities, cityPath, getState, locationSlug, statePath } from '@/lib/locations';
import { getIndexableRestaurants } from '@/lib/server/catalog';
import { ogDefaults, twitterDefaults, indexableRobots, siteOrigin } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ uf: string }> };
const load = cache(getIndexableRestaurants);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uf } = await params;
  const state = getState(uf);
  if (!state) return { robots: { index: false, follow: true } };
  const restaurants = await load();
  const knownCities = new Set(allMunicipalities.filter(c => c.state === state[0]).map(c => locationSlug(c.name)));
  const hasLocations = restaurants.some(r => r.state.toUpperCase() === state[0] && knownCities.has(locationSlug(r.city)));
  const title = `Cidades de ${state[1]} com restaurantes`;
  const description = `Consulte os municípios de ${state[1]} e encontre os restaurantes com cardápio digital e pedidos pelo WhatsApp no FOODDF.`;
  return {
    title,
    description,
    keywords: [`restaurantes ${state[1]}`, `cidades ${state[1]}`, `delivery ${state[1]}`, 'cardápio digital'],
    alternates: { canonical: statePath(state[0]) },
    openGraph: ogDefaults(statePath(state[0]), title, description),
    twitter: twitterDefaults,
    ...(!hasLocations ? { robots: { index: false, follow: true } } : { robots: indexableRobots }),
  };
}

export default async function StatePage({ params }: Props) {
  const { uf } = await params;
  const state = getState(uf);
  if (!state) notFound();
  const restaurants = await load();
  const citySlugs = new Set(restaurants.filter(r => r.state.toUpperCase() === state[0]).map(r => locationSlug(r.city)));
  const cities = allMunicipalities.filter(c => c.state === state[0]);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FOODDF', item: siteOrigin },
      { '@type': 'ListItem', position: 2, name: 'Cidades e estados', item: `${siteOrigin}/cidades` },
      { '@type': 'ListItem', position: 3, name: state[1] },
    ],
  };

  return (
    <main className="location-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <nav className="location-nav">
        <a className="location-brand" href="/">FOODDF</a>
        <a href="/para-restaurantes">Cadastrar meu restaurante</a>
      </nav>
      <section className="location-content">
        <a href="/cidades">← Todos os estados</a>
        <h1>Cidades de {state[1]}</h1>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--muted)', marginTop: '6px', marginBottom: '16px' }}>
          Municípios com cardápios e restaurantes disponíveis em {state[1]}
        </h2>
        <p>Explore os municípios de {state[1]}. Escolha uma cidade para consultar os restaurantes disponíveis.</p>
        <ul className="location-city-list">
          {cities.map(city => (
            <li key={city.id}>
              <a href={cityPath(state[0], city.name)} rel={citySlugs.has(locationSlug(city.name)) ? undefined : 'nofollow'}>
                {city.name}
              </a>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: '24px', fontSize: '12px', color: '#7a6072' }}>
          Municípios com base territorial do IBGE. A publicação de estabelecimentos é realizada mediante cadastro ativo do restaurante.
        </p>
      </section>
      <footer className="location-footer">
        <a href="/">Voltar ao FOODDF</a>
        <a href="/cidades">Todos os estados</a>
      </footer>
    </main>
  );
}
