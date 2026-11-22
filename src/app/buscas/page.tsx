import type { Metadata } from 'next';
import RestaurantCatalog from '@/components/restaurant-catalog';
import { getRestaurants } from '@/lib/server/catalog';
import { ogDefaults, twitterDefaults, indexableRobots, siteOrigin } from '@/lib/seo';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ uf?: string; cidade?: string; ordem?: string; q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = await searchParams;
  const uf = query.uf?.toUpperCase();
  const cidade = query.cidade?.trim();

  let title = 'Buscar restaurantes e cardápios digitais | FOODDF';
  let description = 'Encontre restaurantes por estado e cidade. Filtre por maior avaliação, veja o cardápio completo e peça direto pelo WhatsApp sem taxas abusivas.';

  if (cidade && uf) {
    title = `Restaurantes em ${cidade}, ${uf} | Melhores Avaliações – FOODDF`;
    description = `Explore os melhores restaurantes em ${cidade} (${uf}). Peça pelo WhatsApp com preço justo no FOODDF.`;
  } else if (uf) {
    title = `Restaurantes em ${uf} | Melhores Avaliações – FOODDF`;
    description = `Restaurantes cadastrados no estado ${uf}. Conheça os cardápios digitais e peça direto pelo WhatsApp.`;
  }

  return {
    title,
    description,
    keywords: [
      'restaurantes em Brasília',
      'busca de restaurantes',
      'cardápio digital',
      'pedir pelo WhatsApp',
      'maior avaliação',
      'delivery sem taxa',
      'FOODDF',
    ],
    alternates: { canonical: '/buscas' },
    robots: indexableRobots,
    openGraph: ogDefaults('/buscas', title, description),
    twitter: twitterDefaults,
  };
}

export default async function BuscasPage({ searchParams }: Props) {
  const query = await searchParams;
  const initialUf = query.uf?.toUpperCase() || 'DF';
  const initialCity = query.cidade?.trim() || 'Brasília';

  // Carrega todos os restaurantes cadastrados com avaliações dinâmicas
  const result = await getRestaurants().catch(() => ({ restaurants: [], mode: 'demo' as const }));

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FOODDF', item: siteOrigin },
      { '@type': 'ListItem', position: 2, name: 'Buscas de Restaurantes', item: `${siteOrigin}/buscas` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <RestaurantCatalog
        initialRestaurants={result.restaurants}
        initialUf={initialUf}
        initialCity={initialCity}
      />
    </>
  );
}
