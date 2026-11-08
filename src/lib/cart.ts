import type {Product} from './domain';
export function cartItems(products:Product[], cart:Record<string,number>){
 return Object.entries(cart).flatMap(([key,quantity])=>{
  const [id,...ids]=key.split('::');const product=products.find(p=>p.id===id);
  if(!product||!Number.isInteger(quantity)||quantity<1||quantity>20||new Set(ids).size!==ids.length)return [];
  const extras=ids.map(id=>product.extras?.find(e=>e.id===id));if(extras.some(e=>!e))return [];
  const chosen=extras.filter(e=>!!e);
  return [{...product,id:key,baseId:id,selectedExtras:chosen,price:product.price+chosen.reduce((s,e)=>s+e.price,0)}];
 });
}
export function trackCatalog(slug:string,kind:'visit'|'whatsapp'){
 try{let visitor=sessionStorage.getItem('fooddf-visitor');if(!visitor){visitor=crypto.randomUUID();sessionStorage.setItem('fooddf-visitor',visitor);}void fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({restaurant_slug:slug,visitor,kind}),keepalive:true}).catch(()=>{});}catch{/* Statistics never interrupt an order. */}
}
