// Snapshot of https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome, fetched 2026-11-16.
import municipalities from './municipalities.json';
import { states } from './domain';
import type { IndexableRestaurant } from './server/catalog';

export const locationSlug = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Todas as cidades / Regiões Administrativas e áreas principais do Distrito Federal.
 */
export const DF_CITIES: readonly string[] = [
  'Água Quente',
  'Águas Claras',
  'Arapoanga',
  'Arniqueira',
  'Asa Norte',
  'Asa Sul',
  'Brasília',
  'Brazlândia',
  'Candangolândia',
  'Ceilândia',
  'Cruzeiro',
  'Fercal',
  'Gama',
  'Guará',
  'Itapoã',
  'Jardim Botânico',
  'Lago Norte',
  'Lago Sul',
  'Noroeste',
  'Núcleo Bandeirante',
  'Paranoá',
  'Park Way',
  'Planaltina',
  'Plano Piloto',
  'Recanto das Emas',
  'Riacho Fundo',
  'Riacho Fundo II',
  'Samambaia',
  'Santa Maria',
  'São Sebastião',
  'SCIA / Estrutural',
  'SIA',
  'Sobradinho',
  'Sobradinho II',
  'Sol Nascente / Pôr do Sol',
  'Sudoeste / Octogonal',
  'Taguatinga',
  'Varjão',
  'Vicente Pires',
];

const dfExtraEntries = DF_CITIES.filter(name => name !== 'Brasília').map((name, idx) => ({
  id: 5300200 + idx,
  name,
  state: 'DF',
}));

export const allMunicipalities = [...municipalities, ...dfExtraEntries];

export function getCitiesForState(uf: string): string[] {
  const code = (uf || '').trim().toUpperCase();
  if (!code) return [];
  if (code === 'DF') {
    return [...DF_CITIES].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }
  return municipalities
    .filter(m => m.state.toUpperCase() === code)
    .map(m => m.name)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

const DF_NEIGHBORHOOD_RULES: ReadonlyArray<[RegExp, string]> = [
  [/aguas\s*claras/i, 'Águas Claras'],
  [/agua\s*quente/i, 'Água Quente'],
  [/arniqueira|areal/i, 'Arniqueira'],
  [/arapoanga/i, 'Arapoanga'],
  [/asa\s*norte/i, 'Asa Norte'],
  [/asa\s*sul/i, 'Asa Sul'],
  [/noroeste/i, 'Noroeste'],
  [/sudoeste|octogonal/i, 'Sudoeste / Octogonal'],
  [/brazlandia/i, 'Brazlândia'],
  [/candangolandia/i, 'Candangolândia'],
  [/sol\s*nascente|por\s*do\s*sol/i, 'Sol Nascente / Pôr do Sol'],
  [/ceilandia/i, 'Ceilândia'],
  [/cruzeiro/i, 'Cruzeiro'],
  [/fercal/i, 'Fercal'],
  [/gama/i, 'Gama'],
  [/guara/i, 'Guará'],
  [/itapoa/i, 'Itapoã'],
  [/jardim\s*botanico/i, 'Jardim Botânico'],
  [/lago\s*norte/i, 'Lago Norte'],
  [/lago\s*sul/i, 'Lago Sul'],
  [/nucleo\s*bandeirante/i, 'Núcleo Bandeirante'],
  [/paranoa/i, 'Paranoá'],
  [/park\s*way/i, 'Park Way'],
  [/planaltina/i, 'Planaltina'],
  [/recanto\s*das\s*emas/i, 'Recanto das Emas'],
  [/riacho\s*fundo\s*(ii|2)/i, 'Riacho Fundo II'],
  [/riacho\s*fundo/i, 'Riacho Fundo'],
  [/samambaia/i, 'Samambaia'],
  [/santa\s*maria/i, 'Santa Maria'],
  [/sao\s*sebastiao/i, 'São Sebastião'],
  [/estrutural|\bscia\b/i, 'SCIA / Estrutural'],
  [/\bsia\b|setor\s*de\s*industria/i, 'SIA'],
  [/sobradinho\s*(ii|2)/i, 'Sobradinho II'],
  [/sobradinho/i, 'Sobradinho'],
  [/taguatinga/i, 'Taguatinga'],
  [/varjao/i, 'Varjão'],
  [/vicente\s*pires/i, 'Vicente Pires'],
  [/plano\s*piloto/i, 'Plano Piloto'],
];

const stripAccents = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function resolveCityFromCepData(
  uf: string,
  cityFromApi: string,
  neighborhood = '',
  street = ''
): string {
  const code = (uf || '').trim().toUpperCase();
  const options = getCitiesForState(code);
  if (!options.length) return cityFromApi || '';

  if (code === 'DF') {
    const probe = stripAccents(`${neighborhood} ${street}`);
    for (const [pattern, target] of DF_NEIGHBORHOOD_RULES) {
      if (pattern.test(probe)) return target;
    }
    return 'Brasília';
  }

  const normalizedTarget = stripAccents((cityFromApi || '').trim()).toLowerCase();
  const exact = options.find(opt => stripAccents(opt).toLowerCase() === normalizedTarget);
  return exact || cityFromApi || options[0];
}

export const getState = (uf: string) => states.find(([code]) => code.toLowerCase() === uf.toLowerCase());
export const statePath = (uf: string) => `/cidades/${uf.toLowerCase()}`;
export const cityPath = (uf: string, city: string) => `${statePath(uf)}/${locationSlug(city)}`;
export const restaurantsInCity = (restaurants: IndexableRestaurant[], uf: string, city: string) =>
  restaurants.filter(r => r.state.toLowerCase() === uf.toLowerCase() && locationSlug(r.city) === locationSlug(city));
