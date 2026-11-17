// Snapshot of https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome, fetched 2026-11-16.
import municipalities from './municipalities.json';
import { states } from './domain';
import type { IndexableRestaurant } from './server/catalog';

export const locationSlug=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const allMunicipalities=municipalities;
export const getState=(uf:string)=>states.find(([code])=>code.toLowerCase()===uf.toLowerCase());
export const statePath=(uf:string)=>`/cidades/${uf.toLowerCase()}`;
export const cityPath=(uf:string,city:string)=>`${statePath(uf)}/${locationSlug(city)}`;
export const restaurantsInCity=(restaurants:IndexableRestaurant[],uf:string,city:string)=>restaurants.filter(r=>r.state.toLowerCase()===uf.toLowerCase()&&locationSlug(r.city)===locationSlug(city));
