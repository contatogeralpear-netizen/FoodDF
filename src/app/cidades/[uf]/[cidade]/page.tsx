import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { restaurantPath, money } from '@/lib/domain';
import { allMunicipalities, cityPath, getState, locationSlug, restaurantsInCity, statePath } from '@/lib/locations';
import { getIndexableRestaurants, getRestaurants } from '@/lib/server/catalog';
import { ogDefaults, twitterDefaults, indexableRobots, siteOrigin } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ uf: string; cidade: string }> };
const load = cache(getIndexableRestaurants);

function findCity(uf: string, slug: string) {
  return allMunicipalities.find(c => c.state.toLowerCase() === uf.toLowerCase() && locationSlug(c.name) === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uf, cidade } = await params;
  const city = findCity(uf, cidade);
  if (!city) return { robots: { index: false, follow: true } };
  const stores = restaurantsInCity(await load(), uf, city.name);
  const title = `Restaurantes em ${city.name}, ${city.state}`;
  const description = `Explore os cardápios dos restaurantes disponíveis em ${city.name}, ${city.state}, com pedidos pelo WhatsApp no FOODDF.`;
  return {
    title,
    description,
    keywords: [`restaurantes em ${city.name}`, `delivery ${city.name}`, `cardápio ${city.name}`],
    alternates: { canonical: cityPath(city.state, city.name) },
    openGraph: ogDefaults(cityPath(city.state, city.name), title, description),
    twitter: twitterDefaults,
    ...(!stores.length ? { robots: { index: false, follow: true } } : { robots: indexableRobots }),
  };
}

export default async function CityPage({ params }: Props) {
  const { uf, cidade } = await params;
  const city = findCity(uf, cidade);
  const state = getState(uf);
  if (!city || !state) notFound();

  // Busca restaurantes cadastrados e ativos nesta cidade (com fallback gracioso de demonstração)
  const { restaurants } = await getRestaurants(state[0], city.name).catch(() => ({ restaurants: [] }));

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FOODDF', item: siteOrigin },
      { '@type': 'ListItem', position: 2, name: 'Cidades e estados', item: `${siteOrigin}/cidades` },
      { '@type': 'ListItem', position: 3, name: state[1], item: `${siteOrigin}${statePath(state[0])}` },
      { '@type': 'ListItem', position: 4, name: city.name },
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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="/buscas" style={{ fontWeight: 700, color: '#ff5900' }}>Explorar Todos os Restaurantes</a>
          <a href="/para-restaurantes">Cadastrar meu restaurante</a>
        </div>
      </nav>

      <section className="location-content">
        <a href={statePath(state[0])}>← Cidades de {state[1]}</a>
        <h1>Restaurantes em {city.name} / {city.state}</h1>

        {restaurants.length > 0 ? (
          <>
            <p>Conheça os estabelecimentos disponíveis em {city.name} e explore seus cardápios com pedidos direto pelo WhatsApp.</p>
            <div className="location-grid">
              {restaurants.map(store => (
                <a className="location-card" href={restaurantPath(store.slug)} key={store.slug}>
                  <span>
                    <strong>{store.name}</strong>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: '#ff9d00', fontWeight: 800 }}>
                      ★ {(store.rating ?? 4.9).toFixed(1)} <small style={{ color: '#7a6072', fontWeight: 600 }}>({store.reviewCount ?? 1} avaliações)</small>
                    </span>
                    <small style={{ display: 'block', fontWeight: 400, marginTop: 4, color: '#666' }}>
                      {store.description || store.cuisine || 'Ver cardápio'}
                    </small>
                    <small style={{ display: 'block', marginTop: 4, color: '#ff5900', fontWeight: 700 }}>
                      Entrega: {store.deliveryFee ? money(store.deliveryFee) : 'Grátis'}
                    </small>
                  </span>
                  <span>Ver Cardápio →</span>
                </a>
              ))}
            </div>
            <div style={{ marginTop: '28px', padding: '16px', background: '#f8f2eb', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#2c1223' }}>
                Quer ver restaurantes de outras cidades ou filtrar por maior avaliação?
              </p>
              <a
                href={`/buscas?uf=${state[0]}&cidade=${encodeURIComponent(city.name)}`}
                className="button primary"
                style={{ display: 'inline-block', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}
              >
                Abrir Catálogo com Filtros de Avaliação
              </a>
            </div>
          </>
        ) : (
          <>
            <p>Ainda não há restaurantes publicados nesta cidade. Você pode explorar outras localidades ou cadastrar seu estabelecimento gratuitamente.</p>
            <div className="location-footer" style={{ marginTop: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <a href="/buscas?uf=DF&cidade=Brasília" className="button primary" style={{ padding: '10px 18px', textDecoration: 'none' }}>
                Ver Restaurantes em Brasília (DF)
              </a>
              <a href={statePath(state[0])}>Explorar outras cidades de {state[1]}</a>
              <a href="/para-restaurantes">Cadastrar meu restaurante</a>
            </div>
          </>
        )}
      </section>

      <footer className="location-footer">
        <a href="/">Voltar ao FOODDF</a>
        <a href="/buscas">Buscar restaurantes</a>
        <a href="/cidades">Cidades e estados</a>
      </footer>
    </main>
  );
}
