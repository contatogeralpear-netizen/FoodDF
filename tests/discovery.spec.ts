import { expect, test } from '@playwright/test';

test('buscadores encontram as páginas públicas sem indexar a demonstração ou os painéis', async ({ request }) => {
  const home = await request.get('/');
  const homeHtml = await home.text();
  expect(home.status()).toBe(200);
  expect(homeHtml).toContain('rel="canonical"');
  expect(homeHtml).toContain('application/ld+json');
  expect(homeHtml).toContain('name="google-site-verification"');
  expect(homeHtml).toContain('href="/para-restaurantes"');

  const demo = await request.get('/restaurantes/brasa-burger');
  const demoHtml = await demo.text();
  expect(demo.status()).toBe(200);
  expect(demoHtml).toContain('Brasa Burger');
  expect(demoHtml).toContain('Brasa Bacon');
  expect(demoHtml).toMatch(/name="robots" content="noindex, follow"/);
  expect(demoHtml).toContain('rel="canonical" href="https://fooddf.vercel.app/restaurantes/brasa-burger"');

  const legacy = await request.get('/?restaurante=brasa-burger');
  expect(await legacy.text()).toMatch(/name="robots" content="noindex, follow"/);
  const orderLink = await request.get('/?pedido=FD1042');
  expect(await orderLink.text()).toMatch(/name="robots" content="noindex, follow"/);
  const admin = await request.get('/paineladministativo');
  expect(admin.headers()['x-robots-tag']).toContain('noindex');
  expect((await request.get('/restaurantes/nao-existe')).status()).toBe(404);

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain('https://fooddf.vercel.app/para-restaurantes');
  expect(xml).not.toContain('brasa-burger');
  expect(xml).not.toContain('paineladministativo');

  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Sitemap: https://fooddf.vercel.app/sitemap.xml');
  expect((await request.get('/llms.txt')).status()).toBe(200);
});

test('a home permite conhecer o serviço e iniciar o cadastro de restaurante', async ({ page }) => {
  const transitionErrors: string[] = [];
  page.on('pageerror', error => { if (error.message.includes('ViewTransition')) transitionErrors.push(error.message); });
  await page.goto('/');
  await page.getByRole('link', { name: 'Conhecer o FOODDF para restaurantes' }).click();
  await expect(page.getByRole('heading', { name: 'Seu cardápio mais perto de quem tem fome.' })).toBeVisible();
  await page.getByRole('link', { name: /Cadastrar meu restaurante grátis|Criar conta para meu restaurante/ }).click();
  await expect(page.getByRole('heading', { name: 'Crie sua conta' })).toBeVisible();
  await expect(page.getByLabel('Nome da empresa')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(transitionErrors).toEqual([]);
});

test('o novo endereço do cardápio preserva os links antigos e o carrinho', async ({ page }) => {
  await page.goto('/');
  const demo = page.getByRole('link', { name: /Restaurante modelo.*Brasa Burger/ });
  await expect(demo).toHaveAttribute('href', '/restaurantes/brasa-burger');
  await demo.click();
  await expect(page).toHaveURL(/\/restaurantes\/brasa-burger$/);
  await page.getByRole('button', { name: 'Adicionar Brasa Bacon' }).click();
  await page.reload();
  await expect(page.locator('.product-card').filter({ hasText: 'Brasa Bacon' }).getByRole('button', { name: 'Aumentar Brasa Bacon' })).toBeVisible();
  await page.goto('/?restaurante=brasa-burger');
  await expect(page.getByRole('heading', { name: 'Brasa Burger', exact: true })).toBeVisible();
});
