import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import test from 'node:test';

const baseRestaurant = {
  state: 'DF', city: 'Brasília', address: 'Endereço de teste', complement: '', neighborhood: '',
  delivery_fee: 500, whatsapp: '5561999990000', pix_key: null, pix_name: null, pix_city: null,
  accepting_orders: false, description: 'Cardápio de teste', cuisine: 'Pizzaria', logo_url: null,
  cover_url: null, is_open: true, opening_hours: [], delivery_enabled: true, pickup_enabled: true,
  min_order: 0, estimated_time: '30–45 min', neighborhoods: [], payment_methods: ['cash'], receipt_required: false,
};
const restaurants = [
  { ...baseRestaurant, id: 'one', slug: 'loja-ativa', name: 'Loja Ativa', is_demo: false, status: 'published', active: true },
  { ...baseRestaurant, id: 'two', slug: 'loja-rascunho', name: 'Loja Rascunho', is_demo: false, status: 'draft', active: true },
  { ...baseRestaurant, id: 'three', slug: 'loja-bloqueada', name: 'Loja Bloqueada', is_demo: false, status: 'published', active: false },
  { ...baseRestaurant, id: 'four', slug: 'loja-modelo', name: 'Loja Modelo', is_demo: true, status: 'published', active: true },
];
const products = [
  { id: 'item-one', restaurant_id: 'one', active: true, name: 'Pizza de teste', description: 'Pizza da loja ativa', price: 2000, category: 'Pizzas', image: 'burger', image_url: null, promo_price: null, featured: false, serves: 1, extras: [] },
];

function listen(server) {
  return new Promise(resolveListen => server.listen(0, '127.0.0.1', () => resolveListen(server.address().port)));
}
function close(server) { return new Promise(resolveClose => server.close(resolveClose)); }
function sleep(ms) { return new Promise(resolveSleep => setTimeout(resolveSleep, ms)); }

test('páginas e sitemap expõem apenas lojas públicas; falhas não viram loja inexistente', { timeout: 60000 }, async t => {
  let unavailable = false;
  const fakeDatabase = createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost');
    response.setHeader('Content-Type', 'application/json');
    if (unavailable) { response.writeHead(503); response.end('{"message":"fixture unavailable"}'); return; }
    if (url.pathname === '/rest/v1/restaurants') {
      let rows = restaurants;
      for (const field of ['status', 'active', 'is_demo']) {
        const value = url.searchParams.get(field);
        if (value?.startsWith('eq.')) rows = rows.filter(row => String(row[field]) === value.slice(3));
      }
      const identifier = url.searchParams.get('or')?.match(/slug\.eq\.([a-z0-9-]+)/)?.[1];
      if (identifier) rows = rows.filter(row => row.id === identifier || row.slug === identifier);
      const offset = Number(url.searchParams.get('offset') || 0);
      const limit = Number(url.searchParams.get('limit') || rows.length);
      rows = rows.slice(offset, offset + limit);
      response.end(JSON.stringify(rows));
      return;
    }
    if (url.pathname === '/rest/v1/products') {
      const restaurantId = url.searchParams.get('restaurant_id')?.replace(/^eq\./, '');
      const onlyActive = url.searchParams.get('active') === 'eq.true';
      response.end(JSON.stringify(products.filter(product => product.restaurant_id === restaurantId && (!onlyActive || product.active))));
      return;
    }
    response.writeHead(404);
    response.end('{}');
  });
  const databasePort = await listen(fakeDatabase);
  t.after(() => close(fakeDatabase));

  const temporaryPort = createServer();
  const appPort = await listen(temporaryPort);
  await close(temporaryPort);
  const app = spawn(process.execPath, [resolve('node_modules/next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', String(appPort)], {
    env: { ...process.env, SUPABASE_URL: `http://127.0.0.1:${databasePort}`, SUPABASE_PUBLISHABLE_KEY: 'local-fixture', SUPABASE_SECRET_KEY: '', NEXT_PUBLIC_SUPABASE_URL: '', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '', FOODDF_ACCEPT_ORDERS: 'false' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  app.stdout.on('data', data => { log += data.toString(); });
  app.stderr.on('data', data => { log += data.toString(); });
  t.after(() => { app.kill(); });
  const base = `http://127.0.0.1:${appPort}`;
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`${base}/`)).ok) { ready = true; break; } } catch { /* Startup is still in progress. */ }
    if (app.exitCode !== null) break;
    await sleep(200);
  }
  assert.ok(ready, `Application failed to start: ${log}`);

  const home = await (await fetch(`${base}/`)).text();
  assert.match(home, /href="\/restaurantes\/loja-ativa"/);
  assert.doesNotMatch(home, /Loja Rascunho|Loja Bloqueada/);
  const restaurant = await fetch(`${base}/restaurantes/loja-ativa`);
  const html = await restaurant.text();
  assert.equal(restaurant.status, 200);
  assert.match(html, /Loja Ativa em Brasília\/DF/);
  assert.match(html, /Pizza de teste/);
  assert.doesNotMatch(html, /name="robots" content="[^"]*noindex/);
  const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
  assert.match(sitemap, /\/restaurantes\/loja-ativa/);
  assert.match(sitemap, /\/cidades\/df\/brasilia/);
  assert.doesNotMatch(sitemap, /\/cidades\/sp/);
  assert.doesNotMatch(sitemap, /loja-modelo|loja-rascunho|loja-bloqueada/);
  const directory=await (await fetch(`${base}/cidades`)).text();
  assert.match(directory,/Distrito Federal/);
  assert.match(directory,/São Paulo/);
  const state=await (await fetch(`${base}/cidades/df`)).text();
  assert.match(state,/href="\/cidades\/df\/brasilia"/);
  const city=await (await fetch(`${base}/cidades/df/brasilia`)).text();
  assert.match(city,/Loja Ativa/);
  assert.doesNotMatch(city,/Loja Rascunho|Loja Bloqueada|Loja Modelo/);
  assert.doesNotMatch(city,/name="robots" content="[^"]*noindex/);
  const empty=await (await fetch(`${base}/cidades/sp/sao-paulo`)).text();
  assert.match(empty,/name="robots" content="noindex, follow"/);
  for (const slug of ['loja-rascunho', 'loja-bloqueada', 'nao-existe']) {
    assert.equal((await fetch(`${base}/restaurantes/${slug}`)).status, 404);
  }

  unavailable = true;
  assert.equal((await fetch(`${base}/api/catalog?restaurant=loja-ativa`)).status, 503);
  assert.equal((await fetch(`${base}/sitemap.xml`)).status, 500);
});
