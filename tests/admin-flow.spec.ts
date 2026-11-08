import { test, expect, type Page } from '@playwright/test';
import { newRestaurant, newProduct } from '../src/lib/admin';

// Browser interaction tests use an isolated API fixture. Real RLS/CRUD are tested
// separately by admin-security.sql, inside a rolled-back database transaction.
async function fixture(page:Page, allowed=true,empty=false){
 const store={...newRestaurant(),id:'brasa-burger',slug:'brasa-burger',name:'Brasa Burger',address:'CLS 308, Loja 12',whatsapp:'5561982429847',status:'published',payment_methods:['pix','cash','card'],description:'Hambúrgueres artesanais feitos na hora.'};
 const tables:Record<string,Record<string,unknown>[]>={restaurants:[store],products:[{...newProduct(store.id),id:'brasa-bacon',name:'Brasa Bacon',description:'Burger com cheddar e bacon',price:3490,featured:true}],categories:[{id:crypto.randomUUID(),restaurant_id:store.id,name:'Lanches',sort_order:1}],restaurant_plans:[]};
 const user={id:'550e8400-e29b-41d4-a716-446655440001',email:'admin@fooddf.invalid',aud:'authenticated',role:'authenticated',email_confirmed_at:new Date().toISOString(),app_metadata:{provider:'email'},user_metadata:{},created_at:new Date().toISOString()};
 if(empty){tables.restaurants=[];tables.products=[];tables.categories=[];}
 await page.addInitScript(({user})=>localStorage.setItem('sb-qegwmsvwmanppoksqsgp-auth-token',JSON.stringify({access_token:'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjQxMDAwMDAwMDB9.fixture',refresh_token:'fixture',expires_at:4100000000,expires_in:3600,token_type:'bearer',user})),{user});
 await page.route('https://qegwmsvwmanppoksqsgp.supabase.co/**',async route=>{
  const req=route.request();const url=new URL(req.url());let data:unknown=null;
  if(url.pathname==='/auth/v1/user')data=user;
  else if(url.pathname.endsWith('/rpc/fooddf_has_panel_access'))data=allowed;
  else if(url.pathname.endsWith('/rpc/fooddf_create_restaurant')){data={...store,...req.postDataJSON().payload,id:crypto.randomUUID()};tables.restaurants.push(data as Record<string,unknown>);}
  else if(url.pathname.endsWith('/rpc/fooddf_admin_metrics'))data=[];
  else if(url.pathname.endsWith('/rpc/fooddf_rename_category')){const body=req.postDataJSON();const c=tables.categories.find(c=>c.id===body.category_id)!;tables.products.forEach(p=>{if(p.category===c.name)p.category=body.new_name});c.name=body.new_name;}
  else if(url.pathname.startsWith('/storage/v1/object/')){if(req.method()==='POST')data={Key:url.pathname};else return route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jBzQAAAAASUVORK5CYII=','base64')});}
  else if(url.pathname.startsWith('/rest/v1/')){
   const table=url.pathname.split('/').pop()!;const matches=(row:Record<string,unknown>)=>[...url.searchParams].every(([key,v])=>!v.startsWith('eq.')||String(row[key])===v.slice(3));
   if(!tables[table])throw Error(`Unhandled fixture table ${table}`);
   if(req.method()==='PATCH'){tables[table].filter(matches).forEach(row=>Object.assign(row,req.postDataJSON()));}
   if(req.method()==='POST'){const body=req.postDataJSON();const existing=table==='restaurant_plans'?tables[table].find(r=>r.restaurant_id===body.restaurant_id):undefined;if(existing)Object.assign(existing,body);else tables[table].push({id:crypto.randomUUID(),...body});data=existing||tables[table].at(-1);}
   else if(req.method()==='DELETE'){tables[table]=tables[table].filter(r=>!matches(r));data=null;}
   else data=tables[table].filter(matches);
   if(req.headers()['accept']?.includes('vnd.pgrst.object'))data=Array.isArray(data)?data[0]||null:data;
  }else throw Error(`Unhandled fixture request ${url.pathname}`);
  await route.fulfill({contentType:'application/json',body:JSON.stringify(data)});
 });
 return tables;
}
async function nav(page:Page,name:string){if(await page.getByRole('button',{name:'Abrir navegação'}).isVisible())await page.getByRole('button',{name:'Abrir navegação'}).click();await page.getByRole('navigation',{name:'Navegação administrativa'}).getByRole('button',{name,exact:true}).click();}
const save=(page:Page,name:string)=>page.getByRole('button',{name,exact:true}).filter({visible:true}).first().click();

test('painel: produto, foto, adicionais, categorias, configurações e persistência',async({page},info)=>{
 const tables=await fixture(page);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/paineladministativo');await expect(page.getByRole('heading',{name:'Olá, empreendedor!'})).toBeVisible();
 await expect(page.getByRole('switch',{name:'Restaurante aberto'})).toBeChecked();await expect(page.getByLabel('Selecionar restaurante')).toHaveCount(0);await expect(page.getByRole('button',{name:'Cadastrar restaurante',exact:true})).toHaveCount(0);
 await page.screenshot({path:`artifacts/admin-overview-${info.project.name}.png`,fullPage:true});
 await nav(page,'Cardápio');await page.getByRole('button',{name:'Editar Brasa Bacon',exact:true}).click();
 await page.getByLabel('Preço promocional (R$)',{exact:true}).fill('2990');
 await page.getByRole('button',{name:'Adicionar opção'}).click();await page.getByLabel('Nome adicional 1').fill('Bacon extra');await page.getByLabel('Valor adicional 1').fill('500');
 await page.locator('input[type=file]').setInputFiles({name:'burger.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jBzQAAAAASUVORK5CYII=','base64')});
 await expect(page.getByRole('button',{name:'Remover imagem'})).toBeVisible();
 await page.screenshot({path:`artifacts/admin-product-${info.project.name}.png`,fullPage:true});
 await save(page,'Salvar produto');await expect(page.getByRole('heading',{name:'Meu cardápio'})).toBeVisible();
 expect(tables.products[0].promo_price).toBe(2990);expect(tables.products[0].image_url).toContain('/restaurant-images/');expect(tables.products[0].extras).toHaveLength(1);
 await page.getByRole('switch',{name:'Disponibilidade Brasa Bacon'}).click();await expect(page.getByText('Pausado',{exact:true})).toBeVisible();expect(tables.products[0].active).toBe(false);
 await page.getByRole('button',{name:'Gerenciar categorias'}).click();await page.getByRole('button',{name:'Renomear Lanches'}).click();await page.getByLabel('Novo nome da categoria').fill('Artesanais');await page.getByRole('button',{name:'Salvar nome'}).click();await expect(page.getByRole('button',{name:'Renomear Artesanais'})).toBeVisible();expect(tables.products[0].category).toBe('Artesanais');await page.getByRole('button',{name:'Fechar janela'}).click();
 await nav(page,'Pagamentos e entrega');await page.getByLabel('Taxa de entrega (R$)').fill('750');await page.getByRole('switch',{name:'Aceitar Pix'}).click();await page.getByLabel('Novo bairro').fill('Asa Norte');await page.getByRole('button',{name:'Adicionar',exact:true}).click();await save(page,'Salvar configurações');await expect(page.getByRole('status')).toContainText('Restaurante salvo');expect(tables.restaurants[0].delivery_fee).toBe(750);expect(tables.restaurants[0].payment_methods).not.toContain('pix');
 await page.reload();await expect(page.getByRole('heading',{name:'Olá, empreendedor!'})).toBeVisible();await nav(page,'Cardápio');await expect(page.getByText('Pausado',{exact:true})).toBeVisible();await expect(page.locator('tbody')).toContainText('29,90');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);expect(errors).toEqual([]);
});

test('painel: cadastro inicial individual e planos sem cobrança',async({page},info)=>{
 const tables=await fixture(page,true,true);await page.goto('/paineladministativo');await expect(page.getByRole('heading',{name:'Cadastro do restaurante'})).toBeVisible();
 await page.getByLabel('Nome do restaurante',{exact:true}).fill('Restaurante Modelo 2');await page.getByLabel('WhatsApp para pedidos').fill('61982429847');await page.locator('.admin-slug input').fill('modelo-dois');await save(page,'Salvar alterações');await expect(page.getByRole('status')).toContainText('Restaurante salvo');expect(tables.restaurants).toHaveLength(1);expect(tables.restaurants[0].status).toBe('draft');
 await page.getByRole('button',{name:'Endereço',exact:true}).click();await page.getByLabel('Endereço completo').fill('Rua fictícia, 10');await page.getByLabel('Estado',{exact:true}).selectOption('SP');await page.getByLabel('Cidade',{exact:true}).fill('São Paulo');await save(page,'Salvar alterações');await expect(page.getByRole('status')).toContainText('Restaurante salvo');
 await nav(page,'Planos');await page.getByRole('button',{name:'Começar teste grátis'}).click();await expect(page.getByRole('button',{name:/Teste ativo/})).toBeDisabled();await page.getByRole('button',{name:'Tenho interesse no Pro'}).click();await expect(page.getByRole('button',{name:'Interesse registrado'})).toBeDisabled();expect(tables.restaurant_plans[0].requested_plan).toBe('pro');
 await page.screenshot({path:`artifacts/admin-plans-${info.project.name}.png`,fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});

test('conta não autorizada não recebe o painel',async({page})=>{await fixture(page,false);await page.goto('/paineladministativo');await expect(page.getByRole('heading',{name:'Acesso restrito'})).toBeVisible();await expect(page.getByRole('navigation',{name:'Navegação administrativa'})).toHaveCount(0);});
