export type ScheduleHour = { day: string; enabled: boolean; open: string; close: string };
export type ProductExtra = {id:string;name:string;price:number};
export type Product = { id: string; name: string; description: string; price: number; category: string; image: string; originalPrice?:number; featured?:boolean; serves?:number; extras?:ProductExtra[]; rating?:number; reviewCount?:number };
export type Restaurant = { id: string; slug: string; name: string; state: string; city: string; address: string; deliveryFee: number; isDemo: boolean; whatsapp?: string | null; pixKey?: string | null; pixName?: string | null; pixCity?: string | null; acceptingOrders?: boolean; description?:string; cuisine?:string; logo?:string|null; cover?:string|null; isOpen?:boolean; openingHours?:ScheduleHour[]; deliveryEnabled?:boolean; pickupEnabled?:boolean; minOrder?:number; estimatedTime?:string; neighborhoods?:string[]; paymentMethods?:('pix'|'cash'|'card')[]; receiptRequired?:boolean; rating?:number; reviewCount?:number };
export type Customer = { name: string; phone: string; cep?: string; city?: string; address: string; neighborhood: string; complement: string; notes: string };
export type PublicCatalog = { products: Product[]; restaurant: Restaurant; mode: 'demo' | 'live' };
export const restaurantPath = (slug: string) => `/restaurantes/${encodeURIComponent(slug)}`;
export const demoRestaurant: Restaurant = { id: 'brasa-burger', slug: 'brasa-burger', name: 'Brasa Burger', state: 'DF', city: 'Brasília', address: 'CLS 308, Bloco B, Loja 12 — Asa Sul', deliveryFee: 500, isDemo: true, acceptingOrders: false, description: 'Hambúrgueres artesanais, refeições e bebidas na brasa.', cuisine: 'Hambúrguer Artesanal', cover: 'hero', logo: 'logo', isOpen: true, rating: 4.9, reviewCount: 28 };
export const demoProducts: Product[] = [
 { id: 'brasa-bacon', name: 'Brasa Bacon', description: 'Burger 180 g, cheddar cremoso, bacon e salada no pão brioche.', price: 3490, category: 'Lanches', image: 'burger', rating: 4.9, reviewCount: 38 },
 { id: 'prato-da-casa', name: 'Prato da casa', description: 'Arroz soltinho, feijão, bife na brasa e salada fresquinha.', price: 2990, category: 'Refeições', image: 'meal', rating: 4.8, reviewCount: 27 },
 { id: 'batata-crocante', name: 'Batata crocante', description: 'Douradinhas por fora, macias por dentro. Porção individual.', price: 1200, category: 'Lanches', image: 'fries', rating: 4.7, reviewCount: 19 },
 { id: 'combo-brasa', name: 'Combo da Brasa', description: 'Brasa Bacon + batata crocante. A dupla que não tem erro.', price: 4590, category: 'Combos', image: 'combo', rating: 5.0, reviewCount: 42 },
 { id: 'refrigerante-lata', name: 'Refrigerante em lata', description: 'Bem gelado para acompanhar. Lata de 350 ml.', price: 600, category: 'Bebidas', image: 'drink', rating: 4.9, reviewCount: 15 },
];
export const states = [ ['AC','Acre'],['AL','Alagoas'],['AP','Amapá'],['AM','Amazonas'],['BA','Bahia'],['CE','Ceará'],['DF','Distrito Federal'],['ES','Espírito Santo'],['GO','Goiás'],['MA','Maranhão'],['MT','Mato Grosso'],['MS','Mato Grosso do Sul'],['MG','Minas Gerais'],['PA','Pará'],['PB','Paraíba'],['PR','Paraná'],['PE','Pernambuco'],['PI','Piauí'],['RJ','Rio de Janeiro'],['RN','Rio Grande do Norte'],['RS','Rio Grande do Sul'],['RO','Rondônia'],['RR','Roraima'],['SC','Santa Catarina'],['SP','São Paulo'],['SE','Sergipe'],['TO','Tocantins'] ];
export const money = (cents: number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);
export function formatPhone(value: string) { const n=value.replace(/\D/g,'').slice(0,11); return n.length>6?`(${n.slice(0,2)}) ${n.slice(2,n.length>10?7:6)}-${n.slice(n.length>10?7:6)}`:n.length>2?`(${n.slice(0,2)}) ${n.slice(2)}`:n; }
export function pixPayload(key:string,name:string,city:string,total:number) {
 const field=(id:string,value:string)=>id+String(value.length).padStart(2,'0')+value;
 const clean=(v:string,max:number)=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9 ]/g,'').toUpperCase().slice(0,max);
 let data=field('00','01')+field('26',field('00','br.gov.bcb.pix')+field('01',key))+field('52','0000')+field('53','986')+field('54',(total/100).toFixed(2))+field('58','BR')+field('59',clean(name,25))+field('60',clean(city,15))+field('62',field('05','***'))+'6304';
 let crc=0xffff; for(let i=0;i<data.length;i++){crc^=data.charCodeAt(i)<<8;for(let j=0;j<8;j++)crc=(crc&0x8000)?(crc<<1)^0x1021:crc<<1;crc&=0xffff;} return data+crc.toString(16).toUpperCase().padStart(4,'0');
}

const WEEKDAY_ORDER = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'] as const;
const EN_TO_PT_DAY: Record<string, string> = {
 Mon: 'Segunda',
 Tue: 'Terça',
 Wed: 'Quarta',
 Thu: 'Quinta',
 Fri: 'Sexta',
 Sat: 'Sábado',
 Sun: 'Domingo',
};

function parseTimeToMinutes(hhmm: string): number | null {
 const m = /^(\d{1,2}):(\d{2})$/.exec((hhmm || '').trim());
 if (!m) return null;
 const h = Number(m[1]);
 const min = Number(m[2]);
 if (h < 0 || h > 23 || min < 0 || min > 59) return null;
 return h * 60 + min;
}

export function hasEnabledHours(openingHours?: ScheduleHour[] | null): boolean {
 return Boolean(openingHours && openingHours.some(h => h.enabled && h.open && h.close));
}

/**
 * Quando houver pelo menos um dia de horário de funcionamento habilitado,
 * calcula automaticamente se o restaurante está Aberto ou Fechado no horário atual de Brasília.
 */
export function isOpenNowByHours(
 openingHours?: ScheduleHour[] | null,
 fallbackIsOpen = true,
 now: Date = new Date()
): boolean {
 if (!openingHours?.length || !hasEnabledHours(openingHours)) {
  return fallbackIsOpen;
 }

 const parts = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Sao_Paulo',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
 }).formatToParts(now);

 const wk = parts.find(p => p.type === 'weekday')?.value || 'Mon';
 const rawHour = Number(parts.find(p => p.type === 'hour')?.value || '0');
 const hour = rawHour === 24 ? 0 : rawHour;
 const minute = Number(parts.find(p => p.type === 'minute')?.value || '0');
 const nowMinutes = hour * 60 + minute;

 const todayName = EN_TO_PT_DAY[wk] || 'Segunda';
 const todayIdx = WEEKDAY_ORDER.indexOf(todayName as (typeof WEEKDAY_ORDER)[number]);
 const yesterdayName = WEEKDAY_ORDER[(todayIdx + 6) % 7];

 // Verifica se o turno da madrugada do dia anterior ainda está em aberto
 const yesterday = openingHours.find(h => h.day === yesterdayName);
 if (yesterday?.enabled) {
  const yOpen = parseTimeToMinutes(yesterday.open);
  const yClose = parseTimeToMinutes(yesterday.close);
  if (yOpen !== null && yClose !== null && yClose < yOpen && nowMinutes <= yClose) {
   return true;
  }
 }

 const today = openingHours.find(h => h.day === todayName);
 if (!today?.enabled) return false;

 const openMin = parseTimeToMinutes(today.open);
 const closeMin = parseTimeToMinutes(today.close);
 if (openMin === null || closeMin === null) return false;

 if (openMin <= closeMin) {
  return nowMinutes >= openMin && nowMinutes <= closeMin;
 }
 // Fechamento após a meia-noite (ex.: 18:00 até 02:00)
 return nowMinutes >= openMin;
}
