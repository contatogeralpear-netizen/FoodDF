import type { Metadata } from 'next';
import { states } from '@/lib/domain';
import { allMunicipalities, statePath } from '@/lib/locations';

export const metadata:Metadata={title:'Cidades e estados | FOODDF',description:'Explore as cidades brasileiras por estado e descubra onde encontrar restaurantes no FOODDF.',alternates:{canonical:'/cidades'}};
export default function Cities(){return <main className="location-page"><nav className="location-nav"><a className="location-brand" href="/">FOODDF</a><a href="/para-restaurantes">Cadastrar meu restaurante</a></nav><section className="location-content"><p>ENCONTRE SUA REGIÃO</p><h1>Cidades e estados do Brasil</h1><p>Escolha um estado para explorar suas cidades. Os estabelecimentos disponíveis aparecem nas páginas de suas respectivas localidades.</p><div className="location-grid">{states.map(([uf,name])=><a className="location-card" key={uf} href={statePath(uf)}><span>{name}</span><small>{allMunicipalities.filter(city=>city.state===uf).length} municípios</small></a>)}</div></section><footer className="location-footer"><a href="/">Voltar ao FOODDF</a><a href="/para-restaurantes">Para restaurantes</a></footer></main>}
