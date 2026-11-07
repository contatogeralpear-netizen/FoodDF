export type Product = { id: string; name: string; description: string; price: number; category: string; image: string };
export type Restaurant = { id: string; slug: string; name: string; state: string; city: string; address: string; deliveryFee: number; isDemo: boolean; whatsapp?: string | null; pixKey?: string | null; pixName?: string | null; pixCity?: string | null; acceptingOrders?: boolean };
export type Customer = { name: string; phone: string; address: string; neighborhood: string; complement: string; notes: string };
export const demoRestaurant: Restaurant = { id: 'brasa-burger', slug: 'brasa-burger', name: 'Brasa Burger', state: 'DF', city: 'Brasília', address: 'CLS 308, Bloco B, Loja 12 — Asa Sul', deliveryFee: 500, isDemo: true, acceptingOrders: true };
export const demoProducts: Product[] = [
 { id: 'brasa-bacon', name: 'Brasa Bacon', description: 'Burger 180 g, cheddar cremoso, bacon e salada no pão brioche.', price: 3490, category: 'Lanches', image: 'burger' },
 { id: 'prato-da-casa', name: 'Prato da casa', description: 'Arroz soltinho, feijão, bife na brasa e salada fresquinha.', price: 2990, category: 'Refeições', image: 'meal' },
 { id: 'batata-crocante', name: 'Batata crocante', description: 'Douradinhas por fora, macias por dentro. Porção individual.', price: 1200, category: 'Lanches', image: 'fries' },
 { id: 'combo-brasa', name: 'Combo da Brasa', description: 'Brasa Bacon + batata crocante. A dupla que não tem erro.', price: 4590, category: 'Combos', image: 'combo' },
 { id: 'refrigerante-lata', name: 'Refrigerante em lata', description: 'Bem gelado para acompanhar. Lata de 350 ml.', price: 600, category: 'Bebidas', image: 'drink' },
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
