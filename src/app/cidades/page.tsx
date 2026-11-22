import type { Metadata } from 'next';
import { states } from '@/lib/domain';
import { allMunicipalities, statePath } from '@/lib/locations';
import { ogDefaults, twitterDefaults, indexableRobots } from '@/lib/seo';

const title = 'Restaurantes por cidade e estado do Brasil';
const description = 'Explore as cidades brasileiras por estado e descubra onde encontrar restaurantes com cardápio digital e pedidos pelo WhatsApp no FOODDF.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['restaurantes por cidade', 'cidades do Brasil', 'cardápio digital', 'delivery por estado', 'FOODDF'],
  alternates: { canonical: '/cidades' },
  robots: indexableRobots,
  openGraph: ogDefaults('/cidades', title, description),
  twitter: twitterDefaults,
};
export default function Cities(){return <main className="location-page"><nav className="location-nav"><a className="location-brand" href="/">FOODDF</a><a href="/para-restaurantes">Cadastrar meu restaurante</a></nav><section className="location-content"><p>ENCONTRE SUA REGIÃO</p><h1>Cidades e estados do Brasil</h1><p>Escolha um estado para explorar suas cidades. Os estabelecimentos disponíveis aparecem nas páginas de suas respectivas localidades.</p><div className="location-grid">{states.map(([uf,name])=><a className="location-card" key={uf} href={statePath(uf)}><span>{name}</span><small>{allMunicipalities.filter(city=>city.state===uf).length} municípios</small></a>)}</div></section><footer className="location-footer"><a href="/">Voltar ao FOODDF</a><a href="/para-restaurantes">Para restaurantes</a></footer></main>}
