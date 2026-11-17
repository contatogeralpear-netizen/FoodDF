import { siteOrigin } from '@/lib/seo';

export function GET() {
  return new Response(`# FOODDF\n\n> Plataforma para consultar cardápios de restaurantes.\n\n- [Página inicial](${siteOrigin}/): escolha estado e cidade para encontrar restaurantes.\n- [Para restaurantes](${siteOrigin}/para-restaurantes): informações sobre o cadastro de estabelecimentos.\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
