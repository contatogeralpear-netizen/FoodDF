'use client';

import Image from 'next/image';
import SiteFooter from './footer';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Bike, Check, ChevronDown, ChevronRight, CircleHelp, Clock3, Copy, CreditCard, Flame, Info, MapPin, MessageCircle, Minus, Banknote, Paperclip, Pencil, Plus, QrCode, Search, ShieldCheck, ShoppingBag, Sparkles, Star, Store, Trash2, UserRound, UtensilsCrossed, X, CheckCircle2, Share2 } from 'lucide-react';
import QRCode from 'qrcode';
import { cartItems, trackCatalog } from '@/lib/cart';
import { FoodImage } from './food-image';
import TrackOrder from './track-order';
import { getCitiesForState } from '@/lib/locations';
import { demoProducts, formatPhone, money, pixPayload, restaurantPath, states, type Customer, type Product, type PublicCatalog, type Restaurant } from '@/lib/domain';

const HOME_CATEGORIES = [
  { id: 'hamburgueres', label: 'Hambúrgueres', query: 'Hambúrguer', image: '/images/home/cat-hamburgueres.webp', alt: 'Hambúrguer artesanal com queijo cheddar derretido e bacon crocante' },
  { id: 'pizzas', label: 'Pizzas', query: 'Pizza', image: '/images/home/cat-pizzas.webp', alt: 'Pizza artesanal assada no forno a lenha com queijo puxando' },
  { id: 'comida-brasileira', label: 'Comida brasileira', query: 'Brasileira', image: '/images/home/cat-comida-brasileira.webp', alt: 'Prato típico de comida brasileira com arroz, feijão, couve, farofa e laranja' },
  { id: 'acai', label: 'Açaí', query: 'Açaí', image: '/images/home/cat-acai.webp', alt: 'Tigela de açaí cremoso com banana, granola e morangos frescos' },
  { id: 'doces', label: 'Doces', query: 'Doces', image: '/images/home/cat-doces.webp', alt: 'Fatia de bolo de chocolate com recheio cremoso e granulado de brigadeiro' },
] as const;

function SparkBurst() {
  return (
    <svg className="home-heading-sparks" width="28" height="26" viewBox="0 0 28 26" fill="none" aria-hidden="true">
      <line x1="5" y1="14" x2="9" y2="3" stroke="#f26716" strokeWidth="3.2" strokeLinecap="round" />
      <line x1="12" y1="18" x2="21" y2="9" stroke="#f26716" strokeWidth="3.2" strokeLinecap="round" />
      <line x1="15" y1="23" x2="25" y2="20" stroke="#f26716" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

function StepRegionIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M9 33L16 28L24 31L32 28L39 33L31 39L24 36.5L17 39L9 33Z" stroke="#ef5a0c" strokeWidth="2.4" strokeLinejoin="round" fill="#fff3eb" />
      <path d="M24 31C24 31 33 22.2 33 15.5C33 10.5294 28.9706 6.5 24 6.5C19.0294 6.5 15 10.5294 15 15.5C15 22.2 24 31 24 31Z" fill="#ef5a0c" />
      <circle cx="24" cy="15.5" r="3.6" fill="#ffffff" />
    </svg>
  );
}

function StepRestaurantIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M11 22V38C11 39.1 11.9 40 13 40H35C36.1 40 37 39.1 37 38V22" stroke="#4a0e27" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="#fffaf6" />
      <path d="M20 40V29H28V40" stroke="#4a0e27" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 18L11.5 10H36.5L40 18" fill="#ef5a0c" stroke="#ef5a0c" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M8 18C8 20.5 9.8 22.5 12 22.5C14.2 22.5 16 20.5 16 18C16 20.5 17.8 22.5 20 22.5C22.2 22.5 24 20.5 24 18C24 20.5 25.8 22.5 28 22.5C30.2 22.5 32 20.5 32 18C32 20.5 33.8 22.5 36 22.5C38.2 22.5 40 20.5 40 18H8Z" fill="#ef5a0c" />
      <line x1="16.5" y1="10" x2="15.5" y2="19" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="24" y1="10" x2="24" y2="19" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="31.5" y1="10" x2="32.5" y2="19" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function StepMenuIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="10" y="10" width="28" height="30" rx="4" fill="#fffaf6" stroke="#4a0e27" strokeWidth="2.5" />
      <path d="M19 8H29C29.8 8 30.5 8.7 30.5 9.5V12.5C30.5 13.3 29.8 14 29 14H19C18.2 14 17.5 13.3 17.5 12.5V9.5C17.5 8.7 18.2 8 19 8Z" fill="#fffaf6" stroke="#4a0e27" strokeWidth="2.3" />
      <path d="M15.5 18V23.5M18.5 18V23.5M15.5 21.5C15.5 23 18.5 23 18.5 21.5M17 23V33" stroke="#ef5a0c" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 18V25.5M22 18C23.8 18 24.2 21 22 23V33" stroke="#ef5a0c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="27" y1="20" x2="33.5" y2="20" stroke="#4a0e27" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="27" y1="25.5" x2="33.5" y2="25.5" stroke="#4a0e27" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="27" y1="31" x2="32" y2="31" stroke="#4a0e27" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function StepWhatsappIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24.2 8C15.36 8 8.2 15.12 8.2 23.9C8.2 26.82 9 29.55 10.38 31.9L8 40L16.35 37.68C18.64 38.94 21.33 39.8 24.2 39.8C33.04 39.8 40.2 32.68 40.2 23.9C40.2 15.12 33.04 8 24.2 8Z" stroke="#25d366" strokeWidth="3.1" strokeLinejoin="round" fill="#f3fdf6" />
      <path d="M19.3 16.8C18.9 15.9 18.45 15.88 18.05 15.86C17.72 15.84 17.35 15.84 16.98 15.84C16.6 15.84 16 15.98 15.5 16.52C14.98 17.08 13.55 18.42 13.55 21.15C13.55 23.88 15.55 26.52 15.82 26.9C16.1 27.26 19.68 33.08 25.35 35.3C30.06 37.15 31.02 36.78 32.04 36.68C33.06 36.58 35.34 35.34 35.8 34.04C36.26 32.74 36.26 31.62 36.12 31.38C35.98 31.15 35.61 31.01 35.05 30.73C34.5 30.45 31.76 29.1 31.25 28.92C30.74 28.73 30.37 28.64 30 29.2C29.63 29.75 28.56 31.01 28.24 31.38C27.91 31.75 27.59 31.8 27.03 31.52C26.47 31.24 24.68 30.65 22.55 28.76C20.9 27.28 19.78 25.46 19.45 24.9C19.13 24.34 19.42 24.04 19.7 23.76C19.95 23.51 20.26 23.11 20.54 22.79C20.82 22.46 20.91 22.23 21.1 21.86C21.28 21.48 21.19 21.16 21.05 20.88C20.91 20.6 19.83 17.85 19.3 16.8Z" fill="#25d366" transform="scale(0.84) translate(4.5 4.2)" />
    </svg>
  );
}

function StepReceiveIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M8 22.5L24 9.5L40 22.5" stroke="#4a0e27" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 19.5V37.5C12.5 38.6 13.4 39.5 14.5 39.5H33.5C34.6 39.5 35.5 38.6 35.5 37.5V19.5" stroke="#4a0e27" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 25H31L32.2 38.5H19.8L21 25Z" fill="#ef5a0c" stroke="#ef5a0c" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M23.5 25V23C23.5 21.5 24.6 20.3 26 20.3C27.4 20.3 28.5 21.5 28.5 23V25" stroke="#4a0e27" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

const HOME_STEPS = [
  { id: 'regiao', lines: ['Escolha', 'sua região'], Icon: StepRegionIcon },
  { id: 'restaurante', lines: ['Escolha o melhor', 'restaurante', 'para você'], Icon: StepRestaurantIcon },
  { id: 'cardapio', lines: ['Monte seu pedido', 'pelo cardápio', 'digital'], Icon: StepMenuIcon },
  { id: 'whatsapp', lines: ['Envie o pedido', 'pelo', 'WhatsApp'], Icon: StepWhatsappIcon },
  { id: 'receba', lines: ['Receba em casa', 'ou retire no', 'restaurante'], Icon: StepReceiveIcon },
] as const;

type Step = 'menu'|'details'|'payment'|'pix'|'review';
type Cart = Record<string,number>;
const emptyCustomer:Customer={name:'',phone:'',address:'',neighborhood:'',complement:'',notes:''};


type PlatformBanner={id:string;title:string;image_url:string;link_url:string};
export default function FoodApp({initialRestaurants=[],initialCatalog,initialCatalogError=false,promotionActive=false}:{initialRestaurants?:Restaurant[];initialCatalog?:PublicCatalog;initialCatalogError?:boolean;promotionActive?:boolean}){
 const [banners,setBanners]=useState<PlatformBanner[]>([]);
 useEffect(()=>{const controller=new AbortController();fetch('/api/banners',{signal:controller.signal}).then(r=>r.ok?r.json():{banners:[]}).then(data=>setBanners(data.banners||[])).catch(()=>{});return()=>controller.abort()},[]);
 useEffect(()=>{const hash=window.location.hash;if(/(?:^#|&)type=(?:signup|recovery|invite|magiclink)(?:&|$)/.test(hash))window.location.replace('/painel'+hash);},[]);
 const [restaurants,setRestaurants]=useState<Restaurant[]>(initialRestaurants);
 const [restaurant,setRestaurant]=useState<Restaurant|null>(initialCatalog?.restaurant||null);
 const [products,setProducts]=useState<Product[]>(initialCatalog?.products||demoProducts);
 const [state,setState]=useState(initialCatalog?.restaurant.state||'DF'); const [city,setCity]=useState(initialCatalog?.restaurant.city||'Brasília');
 const [search,setSearch]=useState(''); const [category,setCategory]=useState('Todos');
 const [step,setStep]=useState<Step>('menu'); const [cart,setCart]=useState<Cart>({});
 const [customer,setCustomer]=useState<Customer>(emptyCustomer);
 const [fulfillment,setFulfillment]=useState<'delivery'|'pickup'>(initialCatalog?.restaurant.deliveryEnabled===false?'pickup':'delivery');
 const [payment,setPayment]=useState<'pix'|'cash'|'card'>(initialCatalog?.restaurant.paymentMethods?.[0]||'pix');
 const [change,setChange]=useState(''); const [receipt,setReceipt]=useState<File|null>(null);
 const [help,setHelp]=useState(false); const [location,setLocation]=useState(false); const [cartOpen,setCartOpen]=useState(false); const [shareOpen,setShareOpen]=useState(false);
 const [toast,setToast]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
 const [catalogError,setCatalogError]=useState(initialCatalogError); const [ready,setReady]=useState(false); const [qr,setQr]=useState('');
 const [sending,setSending]=useState(false); const [whatsappUrl,setWhatsappUrl]=useState('');const [tracking,setTracking]=useState(false);const [orderReference,setOrderReference]=useState('');const [orderFor,setOrderFor]=useState('');
 const fileInput=useRef<HTMLInputElement>(null); const heading=useRef<HTMLHeadingElement>(null);
 const catalogRequest=useRef(0);
 const orderRequest=useRef<{requestId:string;accessToken:string}|null>(null);
 const [customProduct,setCustomProduct]=useState<Product|null>(null);const [selectedExtras,setSelectedExtras]=useState<string[]>([]);
 const categories=['Todos',...new Set(products.map(p=>p.category))];
 const list=cartItems(products,cart);
 const count=list.reduce((sum,p)=>sum+cart[p.id],0);
 const subtotal=list.reduce((sum,p)=>sum+p.price*cart[p.id],0);
 const deliveryFee=count && fulfillment==='delivery'?(restaurant?.deliveryFee || 0):0;
 const total=subtotal+deliveryFee;
 const cities=getCitiesForState(state);
 const filteredRestaurants=restaurants.filter(r=>r.state===state&&(!city||r.city===city)&&r.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
 const filteredProducts=products.filter(p=>(category==='Todos'||p.category===category)&&`${p.name} ${p.description}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
 const fullAddress=[customer.address,customer.complement,customer.neighborhood,restaurant?.city,restaurant?.state].filter(Boolean).join(', ');

 async function handleShare(){
  if(!restaurant)return;
  const shareUrl=typeof window!=='undefined'?`${window.location.origin}${restaurantPath(restaurant.slug)}`:`https://fooddf.vercel.app${restaurantPath(restaurant.slug)}`;
  const title=`Cardápio de ${restaurant.name} | FOODDF`;
  const text=`Confira o cardápio de ${restaurant.name} no FOODDF e peça direto pelo WhatsApp:`;
  if(typeof navigator!=='undefined'&&typeof navigator.share==='function'){
   try{await navigator.share({title,text,url:shareUrl});return;}catch(err:unknown){if((err as {name?:string})?.name==='AbortError')return;}
  }
  try{await navigator.clipboard.writeText(shareUrl);setToast('Link do cardápio copiado!');}catch{}
  setShareOpen(true);
 }

 useEffect(()=>{
  try {const saved=JSON.parse(localStorage.getItem('fooddf-cart-v1')||'null'); if(saved && typeof saved.restaurant==='string' && saved.items && typeof saved.items==='object'){const safe:Cart={};for(const [id,q] of Object.entries(saved.items))if(typeof q==='number'&&Number.isInteger(q)&&q>0&&q<=20)safe[id]=q;if(initialCatalog){const matching:Cart={};if(saved.restaurant===initialCatalog.restaurant.slug)for(const p of cartItems(initialCatalog.products,safe))matching[p.id]=safe[p.id];setCart(matching);}else setCart(safe);}}
  catch { /* A new cart is safe if storage is unavailable. */ }
  setReady(true);
  const requested=new URLSearchParams(window.location.search).get('pedido');if(requested&&/^FD\d{1,15}$/i.test(requested)){setOrderReference(requested.toUpperCase());setTracking(true)}else{try{const previous=localStorage.getItem('fooddf-last-order-ref');if(previous&&/^FD\d{1,15}$/.test(previous))setOrderReference(previous)}catch{}}
  let active=true;
  fetch('/api/restaurants').then(async r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{if(active&&Array.isArray(data.restaurants)){setRestaurants(data.restaurants);setCatalogError(false)}}).catch(()=>{if(active)setCatalogError(true)});
  const currentSlug=()=>window.location.pathname.match(/^\/restaurantes\/([a-z0-9-]{1,100})\/?$/)?.[1]||new URLSearchParams(window.location.search).get('restaurante');
  const slug=currentSlug();if(slug&&initialCatalog?.restaurant.slug===slug)trackCatalog(slug,'visit');else if(slug)void openRestaurant(slug,true);
  const onBack=()=>{const slug=currentSlug();if(slug)void openRestaurant(slug,true);else{catalogRequest.current++;setLoading(false);setRestaurant(null);setStep('menu');setSearch('');}};
  window.addEventListener('popstate',onBack);return()=>{active=false;catalogRequest.current++;window.removeEventListener('popstate',onBack)};
 // Initial URL and cached cart are read only after mounting.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 useEffect(()=>{if(!ready||!restaurant)return;try{localStorage.setItem('fooddf-cart-v1',JSON.stringify({restaurant:restaurant.slug,items:cart}));}catch{}},[cart,restaurant,ready]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),4000);return()=>clearTimeout(t)},[toast]);
 useEffect(()=>{let active=true;setQr('');if(!restaurant?.pixKey||restaurant.isDemo)return;QRCode.toDataURL(pixPayload(restaurant.pixKey,restaurant.pixName||restaurant.name,restaurant.pixCity||restaurant.city,total),{width:320,margin:2,color:{dark:'#35102fff',light:'#ffffffff'}}).then(value=>{if(active)setQr(value)}).catch(()=>{if(active)setQr('')});return()=>{active=false};},[restaurant,total]);
 useEffect(()=>{setWhatsappUrl('');setOrderFor('');orderRequest.current=null;},[cart,customer,fulfillment,payment,receipt,change]);
 useEffect(()=>{if(!help&&!location&&!cartOpen)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape'){setHelp(false);setLocation(false);setCartOpen(false)}};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[help,location,cartOpen]);

 async function openRestaurant(slug:string,fromUrl=false){
  const requestVersion=++catalogRequest.current;
  setLoading(true);setError('');setSearch('');setCategory('Todos');setStep('menu');setCartOpen(false);
  try{
   const response=await fetch(`/api/catalog?restaurant=${encodeURIComponent(slug)}`); if(!response.ok)throw Error('Não foi possível abrir este restaurante. Tente novamente.');
   const data=await response.json();if(requestVersion!==catalogRequest.current)return;if(!data.restaurant||!Array.isArray(data.products))throw Error('Cardápio indisponível.');
   const next=data.restaurant as Restaurant;setRestaurant(next);setProducts(data.products);setState(next.state);setCity(next.city);setFulfillment(next.deliveryEnabled===false?'pickup':'delivery');setPayment(next.paymentMethods?.[0]||'pix');setReceipt(null);trackCatalog(next.slug,'visit');
   let saved:{restaurant:string;items:Cart}|null=null;try{saved=JSON.parse(localStorage.getItem('fooddf-cart-v1')||'null')}catch{}
   const safe:Cart={};if(saved?.restaurant===next.slug)for(const p of cartItems(data.products,saved.items||{}))safe[p.id]=saved.items[p.id];setCart(safe);
   if(!fromUrl)window.history.pushState({},'',restaurantPath(next.slug));
   window.scrollTo({top:0,behavior:'smooth'});
  }catch(e){if(requestVersion===catalogRequest.current)setError(e instanceof Error?e.message:'Erro ao carregar cardápio.');}
  finally{if(requestVersion===catalogRequest.current)setLoading(false)}
 }
 function goHome(){catalogRequest.current++;setLoading(false);setRestaurant(null);setSearch('');setStep('menu');setError('');window.history.pushState({},'','/');window.scrollTo({top:0,behavior:'smooth'})}
 function go(next:Step){if(next==='details'&&restaurant?.isOpen===false){setError('O restaurante está fechado no momento.');setCartOpen(false);return;}if(next==='details'&&subtotal<(restaurant?.minOrder||0)){setError(`O pedido mínimo é ${money(restaurant?.minOrder||0)}, sem a entrega.`);setCartOpen(false);return;}if(next==='review'&&payment==='pix'&&restaurant?.receiptRequired&&!restaurant.isDemo&&!receipt){setError('Selecione o comprovante do Pix para continuar.');return;}setStep(next);setError('');setCartOpen(false);window.scrollTo({top:0,behavior:'smooth'});setTimeout(()=>heading.current?.focus(),50)}
 function quantity(id:string,delta:number){setCart(old=>{const next={...old};const q=(old[id]||0)+delta;if(q<=0)delete next[id];else next[id]=Math.min(q,20);return next});}
 function updateCustomer(key:keyof Customer,value:string){setCustomer(old=>({...old,[key]:value}));}
 function nextDetails(e:React.FormEvent){e.preventDefault();if(!count){go('menu');return;}if(customer.name.trim().length<2)return setError('Informe seu nome.');if(!/^\d{10,11}$/.test(customer.phone.replace(/\D/g,'')))return setError('Informe um WhatsApp com DDD válido.');if(fulfillment==='delivery'&&customer.address.trim().length<5)return setError('Informe o endereço de entrega com número.');if(fulfillment==='delivery'&&restaurant?.neighborhoods?.length&&!restaurant.neighborhoods.some(n=>n.trim().toLocaleLowerCase('pt-BR')===customer.neighborhood.trim().toLocaleLowerCase('pt-BR')))return setError(`Entregamos nos bairros: ${restaurant.neighborhoods.join(', ')}.`);go('payment');}
 function nextPayment(){if(payment==='cash'&&change&&(!Number.isFinite(Number(change.replace(',','.')))||Number(change.replace(',','.'))*100<total))return setError('O valor para troco precisa ser igual ou maior que o total.');go(payment==='pix'?'pix':'review');}
 function chooseReceipt(file?:File){if(!file)return;if(!['image/jpeg','image/png','application/pdf'].includes(file.type)||file.size>4*1024*1024){setError('Escolha uma imagem JPG, PNG ou PDF de até 4 MB.');return;}setReceipt(file);setError('');setToast('Comprovante selecionado. O pagamento será conferido pelo restaurante.');}
 async function copyPix(){if(!restaurant?.pixKey||restaurant.isDemo)return;try{await navigator.clipboard.writeText(pixPayload(restaurant.pixKey,restaurant.pixName||restaurant.name,restaurant.pixCity||restaurant.city,total));setToast('Código Pix copiado!');}catch{setError('Não foi possível copiar. Selecione e copie a chave exibida.')}}
 function message(reference?:string,receiptUrl?:string){return [restaurant?.isDemo?'🧪 PEDIDO FICTÍCIO — DEMONSTRAÇÃO FOODDF':'🍔 NOVO PEDIDO — FOODDF',`${restaurant?.name}${reference?` • Pedido ${reference}`:''}`,'',...list.map(p=>`${cart[p.id]}× ${p.name}${p.selectedExtras.length?` (+ ${p.selectedExtras.map(e=>e.name).join(", ")})`:""} — ${money(p.price*cart[p.id])}`),'',`Subtotal: ${money(subtotal)}`,`${fulfillment==='delivery' ? (deliveryFee > 0 ? `Entrega: ${money(deliveryFee)}` : 'Entrega: Frete Grátis') : 'Retirada: Grátis'}`,`Total: ${money(total)}`,'',reference?`Acompanhe seu pedido: ${window.location.origin}/?pedido=${encodeURIComponent(reference)}`:'',`Cliente: ${customer.name}`,`WhatsApp: ${customer.phone}`,fulfillment==='delivery'?`Endereço: ${fullAddress}`:`Retirada no restaurante: ${restaurant?.address}`,`Pagamento: ${payment==='pix'?'Pix — aguardando conferência':payment==='card'?'Cartão na entrega/retirada':`Dinheiro${change?` • Troco para ${money(Math.round(Number(change.replace(',','.'))*100))}`:' • Sem troco'}`}`,customer.notes?`Observações: ${customer.notes}`:'',receipt?receiptUrl?`Comprovante (link temporário): ${receiptUrl}`:`Comprovante: ${receipt.name} — anexar manualmente nesta conversa.`:'',restaurant?.isDemo?'Este é um teste. Não preparar, entregar ou cobrar este pedido.':'Aguardo a confirmação do restaurante.'].filter(Boolean).join('\n');}
 async function prepareWhatsapp(){
  if(!restaurant||!count)return;setError('');setSending(true);
  try{const availability=await fetch(`/api/catalog?restaurant=${encodeURIComponent(restaurant.slug)}`,{cache:'no-store'});if(!availability.ok)throw Error('Este restaurante não está disponível no momento.');const phone=(restaurant.whatsapp||'').replace(/\D/g,'');if(!/^55\d{10,11}$/.test(phone))throw Error('Este restaurante ainda não configurou o WhatsApp de pedidos.');
   let reference:string|undefined;let receiptUrl:string|undefined;
   if(!restaurant.isDemo&&restaurant.acceptingOrders){orderRequest.current??={requestId:crypto.randomUUID(),accessToken:crypto.randomUUID()};const response=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...orderRequest.current,restaurantId:restaurant.id,items:list.map(p=>({productId:p.baseId,extraIds:p.selectedExtras.map(e=>e.id),quantity:cart[p.id]})),customer:{name:customer.name,phone:customer.phone},fulfillment,address:fullAddress,notes:customer.notes,paymentMethod:payment,changeFor:payment==='cash'&&change?Math.round(Number(change.replace(',','.'))*100):null})});const order=await response.json();if(!response.ok)throw Error(order.error||'Não foi possível registrar o pedido.');reference=order.reference;if(reference){setOrderReference(reference);setOrderFor(restaurant.id);try{localStorage.setItem('fooddf-last-order-ref',reference)}catch{}}if(receipt){const form=new FormData();form.append('orderId',order.orderId);form.append('accessToken',order.accessToken);form.append('file',receipt);const upload=await fetch('/api/receipts',{method:'POST',body:form});const result=await upload.json();if(!upload.ok)throw Error(result.error||'Não foi possível anexar o comprovante.');receiptUrl=result.url;}}
   const url=`https://wa.me/${phone}?text=${encodeURIComponent(message(reference,receiptUrl))}`;setWhatsappUrl(url);trackCatalog(restaurant.slug,'whatsapp');window.open(url,'_blank','noopener,noreferrer');
  }catch(e){setError(e instanceof Error?e.message:'Não foi possível preparar o pedido.');}finally{setSending(false)}
 }

 function Quantity({product,compact=false}:{product:Product;compact?:boolean}){if(!compact&&product.extras?.length)return <button className="add-button" aria-label={`Personalizar ${product.name}`} onClick={()=>{setCustomProduct(product);setSelectedExtras([])}}><Plus size={20}/><span>Escolher</span></button>;const q=cart[product.id]||0;return q?<div className={`quantity ${compact?'compact':''}`}><button aria-label={`Diminuir ${product.name}`} onClick={()=>quantity(product.id,-1)}><Minus size={16}/></button><span aria-live="polite">{q}</span><button disabled={q>=20} aria-label={`Aumentar ${product.name}`} onClick={()=>quantity(product.id,1)}><Plus size={17}/></button></div>:<button className="add-button" aria-label={`Adicionar ${product.name}`} onClick={()=>quantity(product.id,1)}><Plus size={20}/><span>Adicionar</span></button>}
 function Totals(){return <div className="totals"><div><span>Subtotal</span><span>{money(subtotal)}</span></div><div><span>{fulfillment==='delivery'?'Taxa de entrega':'Retirada no local'}</span><span style={fulfillment==='delivery'&&!deliveryFee?{color:'#16a34a',fontWeight:800}:{}}>{fulfillment==='delivery'?(deliveryFee>0?money(deliveryFee):'Frete Grátis'):'Grátis'}</span></div><div className="total"><strong>Total</strong><strong>{money(total)}</strong></div></div>}
 function Items({editable=false}:{editable?:boolean}){return <div className="order-items">{list.map(p=><div className="order-item" key={p.id}><FoodImage kind={p.image} label={p.name}/><div className="order-item-info"><strong>{p.name}</strong>{p.selectedExtras.length>0&&<small>+ {p.selectedExtras.map(e=>e.name).join(', ')}</small>}<small>{editable?p.description:`${cart[p.id]} ${cart[p.id]===1?'unidade':'unidades'}`}</small>{editable&&Quantity({product:p,compact:true})}</div><div className="order-item-price"><strong>{money(p.price*cart[p.id])}</strong>{editable&&<button className="icon-button muted" aria-label={`Remover ${p.name}`} onClick={()=>setCart(old=>{const n={...old};delete n[p.id];return n})}><Trash2 size={18}/></button>}</div></div>)}</div>}
 function CustomerSummary(){return <div className="customer-summary"><div><UserRound size={19}/><span>{customer.name || 'Seus dados na próxima etapa'}{customer.phone&&<small>{customer.phone}</small>}</span></div><div><MapPin size={19}/><span>{fulfillment==='pickup'?`Retirada: ${restaurant?.address}`:customer.address?fullAddress:'Informe o endereço ao finalizar'}</span></div></div>}
 function CartPanel(){return <aside className="cart-panel panel"><div className="section-title"><h2>Seu pedido</h2><span className="count-pill">{count} {count===1?'item':'itens'}</span></div>{count?<>{Items({editable:true})}{Totals()}<button className="button primary wide" onClick={()=>go('details')}><ShoppingBag size={21}/>Finalizar pedido<ArrowRight size={20}/></button><p className="cart-caption"><ShieldCheck size={14}/> Feito com carinho, do seu jeito.</p></>:<div className="empty-cart"><span><ShoppingBag size={35}/></span><h3>Sua sacola está esperando</h3><p>Escolha algo gostoso no cardápio<br/>e deixe o resto com a gente.</p></div>}</aside>}
 function Steps(){const index=step==='details'?1:step==='review'?3:2;return <nav className="steps" aria-label="Etapas do pedido">{['Pedido','Pagamento','Revisão'].map((label,i)=><div key={label} className={`step ${index===i+1?'active':''} ${index>i+1?'complete':''}`} aria-current={index===i+1?'step':undefined}><span>{index>i+1?<Check size={18}/>:i+1}</span><b>{label}</b>{i<2&&<i/>}</div>)}</nav>}
 function Back({to,label}:{to:Step;label:string}){return <button className="text-button back-button" onClick={()=>go(to)}><ArrowLeft size={18}/>{label}</button>}

 const isDefaultRegion = state === 'DF' && (!city || city === 'Brasília');
 const exploreHref = isDefaultRegion ? '/buscas' : `/buscas?uf=${encodeURIComponent(state)}${city ? `&cidade=${encodeURIComponent(city)}` : ''}`;
 const categoryHref = (q: string) => isDefaultRegion ? `/buscas?q=${encodeURIComponent(q)}` : `/buscas?uf=${encodeURIComponent(state)}${city ? `&cidade=${encodeURIComponent(city)}` : ''}&q=${encodeURIComponent(q)}`;

 return <div className={!restaurant ? 'home-landing-shell' : undefined}>
  <a href="#main" className="skip-link">Pular para o conteúdo</a>
  <header className="header home-topbar">
   <div className="header-inner home-topbar-inner">
    <button className="brand home-brand-btn" aria-label="FOODDF, início" onClick={goHome}>
     <Image src="/images/home/fooddf-logo-hd.webp" alt="FOODDF" width={176} height={47} quality={95} preload className="brand-logo-img" />
    </button>
    <span className="home-topbar-divider" aria-hidden="true" />
    <nav className="header-nav home-topbar-nav" aria-label="Navegação principal">
     <a className="home-nav-link" href={exploreHref}>Explorar cardápios</a>
     <a className="home-nav-link" href="/como-funciona">Como funciona</a>
     <a className="home-nav-link" href="/para-restaurantes">Para restaurantes</a>
    </nav>
    <div className="home-topbar-actions">
     <button className="home-location-pill" type="button" onClick={()=>setLocation(true)} aria-label={`Localização atual: ${city||'Brasília'}, ${state}. Clique para alterar`}>
      <MapPin size={17} strokeWidth={2.4} />
      <span>{city||'Brasília'} · {state}</span>
      <ChevronDown size={15} strokeWidth={2.5} />
     </button>
     {restaurant&&<button className="bag-button" aria-label={`Abrir sacola com ${count} itens`} onClick={()=>{if(step!=='menu')go('menu');setCartOpen(true)}}><ShoppingBag size={23}/>{count>0&&<b>{count}</b>}</button>}
    </div>
   </div>
  </header>
  <main id="main" className={restaurant ? 'main store-main' : 'home-main'}>
   {loading&&<div className="loading-bar" role="status">Preparando seu cardápio…</div>}
   {error&&<div className="error-banner" role="alert"><Info size={19}/>{error}<button onClick={()=>setError('')} aria-label="Fechar aviso"><X size={16}/></button></div>}
   {!restaurant?<div key="marketplace" className="step-transition home-landing">
    <section className="home-hero" aria-label="Destaque principal">
     <div className="home-hero-photo">
      <Image
       src="/images/home/hero-couple-brasilia.webp"
       alt="Casal saboreando hambúrguer artesanal e pizza ao ar livre em Brasília com a Catedral ao fundo"
       fill
       sizes="(max-width: 920px) 100vw, 65vw"
       quality={90}
       preload
       className="home-hero-img"
      />
      <svg className="home-hero-curve" viewBox="0 0 180 540" preserveAspectRatio="none" aria-hidden="true">
       <path d="M0 0L132 0Q172 195 48 540L0 540Z" fill="#4f0b27" />
      </svg>
     </div>
     <div className="home-hero-container">
      <div className="home-hero-copy">
       <h1 className="home-hero-title">
        Hoje a fome
        <span>pede o quê?</span>
       </h1>
       <p className="home-hero-subtitle">
        Explore os cardápios da sua região<br />
        e peça direto pelo WhatsApp.
       </p>
       <a className="home-hero-cta" href={exploreHref}>
        <span>Ver restaurantes disponíveis</span>
        <ArrowRight size={20} strokeWidth={2.4} />
       </a>
      </div>
     </div>
    </section>

    <section className="home-cravings-section" aria-labelledby="cravings-heading">
     <div className="home-section-inner">
      <h2 id="cravings-heading" className="home-section-heading">
       <span>Escolha pelo que deu vontade</span>
       <SparkBurst />
      </h2>
      <div className="home-categories-grid">
       {HOME_CATEGORIES.map(cat => (
        <a key={cat.id} href={categoryHref(cat.query)} className="home-category-card">
         <Image
          src={cat.image}
          alt={cat.alt}
          width={540}
          height={540}
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 240px"
          quality={90}
          className="home-category-img"
         />
         <span className="home-category-shade" aria-hidden="true" />
         <strong className="home-category-label">{cat.label}</strong>
        </a>
       ))}
      </div>
     </div>
    </section>

    <section className="home-steps-section" aria-labelledby="steps-heading">
     <div className="home-section-inner">
      <h2 id="steps-heading" className="home-section-heading">
       <span>Como pedir pelo FOODDF</span>
       <SparkBurst />
      </h2>
      <ol className="home-steps-list">
       {HOME_STEPS.map((item, idx) => (
        <li key={item.id} className="home-step-entry">
         <div className="home-step-card">
          <div className="home-step-circle">
           <item.Icon />
          </div>
          <p className="home-step-text">
           {item.lines.map((line, i) => (
            <span key={line}>
             {line}
             {i < item.lines.length - 1 && <br />}
            </span>
           ))}
          </p>
         </div>
         {idx < HOME_STEPS.length - 1 && (
          <span className="home-step-chevron" aria-hidden="true">
           <ChevronRight size={26} strokeWidth={2.6} />
          </span>
         )}
        </li>
       ))}
      </ol>
     </div>
    </section>
   </div>:step==='menu'?<div key={`menu-${restaurant.id}`} className="step-transition">
    <button className="text-button breadcrumb" onClick={goHome}><ArrowLeft size={16}/>Restaurantes em {restaurant.city}<span>/</span><b>{restaurant.name}</b></button>
    <div className="store-layout"><div className="store-content"><div className="store-heading"><FoodImage kind={restaurant.logo||"logo"} label={restaurant.name}/><div><div className="store-name-row"><h1 ref={heading} tabIndex={-1}>{restaurant.name}</h1>{restaurant.isDemo&&<span className="demo-small">Modelo</span>}<button type="button" className="store-share-btn" onClick={handleShare} aria-label={`Compartilhar cardápio de ${restaurant.name}`} title="Compartilhar cardápio"><Share2 size={16}/><span>Compartilhar</span></button></div><div className="store-meta"><span><Star size={15} fill="currentColor"/> {restaurant.isDemo?'4,9 · ilustrativo':'Restaurante local'}</span><i/><span><Clock3 size={15}/> {restaurant.estimatedTime||'Consulte o prazo'}</span><i/><span><Bike size={16}/>{restaurant.deliveryFee > 0 ? `Entrega ${money(restaurant.deliveryFee)}` : 'Frete Grátis'}</span></div><div className="store-open"><span className="open-dot"/>{restaurant.isOpen===false?'Fechado':restaurant.isDemo?'Aberto para testar':'Aberto agora'}<span>•</span><span>{restaurant.city} / {restaurant.state}</span></div></div></div>
    <section className="store-hero"><div><span>FOME DE COISA BOA?</span><h2>{restaurant.isDemo?<>Feito na brasa.<br/><em>Do seu jeito.</em></>:<>Seu próximo<br/><em>favorito.</em></>}</h2><p>{restaurant.description||'Ingredientes de verdade. Sabor de sobra.'}</p></div><FoodImage kind={restaurant.cover||"hero"} label={restaurant.name}/></section>
    <div className="menu-tools"><label className="search-field"><Search size={19}/><input aria-label="Buscar no cardápio" placeholder="Buscar no cardápio" value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button onClick={()=>setSearch('')} aria-label="Limpar busca"><X size={15}/></button>}</label><div className="category-tabs" aria-label="Categorias do cardápio">{categories.map(c=><button key={c} aria-pressed={category===c} className={category===c?'selected':''} onClick={()=>setCategory(c)}>{c}</button>)}</div></div>
    <div className="menu-title"><h2>{category==='Todos'?'Escolha seu favorito':category}</h2><span>{filteredProducts.length} opções pra você</span></div>
    <div className="product-grid">{filteredProducts.map(p=><article className="product-card" key={p.id}><div className="product-photo"><FoodImage kind={p.image} label={p.name}/>{p.featured&&<span className="popular-label"><Flame size={12}/>Queridinho da casa</span>}</div><div className="product-info"><h3>{p.name}</h3><p>{p.description}{p.serves&&p.serves>1&&` · Serve ${p.serves} pessoas`}</p><div className="product-bottom"><strong>{p.originalPrice&&<del className="old-price">{money(p.originalPrice)}</del>}{money(p.price)}</strong>{Quantity({product:p})}</div></div></article>)}</div>{!filteredProducts.length&&<div className="empty-results"><Search size={30}/><h3>Nenhum prato encontrado</h3><p>Tente outro termo ou categoria.</p><button className="text-button" onClick={()=>{setSearch('');setCategory('Todos')}}>Ver todo o cardápio</button></div>}
    <div className="store-note"><Info size={16}/>{restaurant.isDemo?'Restaurante fictício para você conhecer o FOODDF. Os valores e prazos são exemplos.':'Preços e disponibilidade sujeitos à confirmação do restaurante.'}</div></div>
    <div className="store-aside">{CartPanel()}<div className="delivery-card"><MapPin size={22}/><div><strong>Da cozinha até você</strong><p>Entrega em {restaurant.city} / {restaurant.state}</p><small>O endereço é informado ao finalizar.</small></div></div><div className="store-address"><Store size={17}/><span>{restaurant.address}</span></div>{!!restaurant.minOrder&&<p className="field-hint">Pedido mínimo: {money(restaurant.minOrder)}</p>}{!!restaurant.neighborhoods?.length&&<p className="field-hint">Entregamos em: {restaurant.neighborhoods.join(", ")}</p>}{!!restaurant.openingHours?.length&&<details className="store-hours"><summary>Horários de funcionamento</summary>{restaurant.openingHours.map(h=><p key={h.day}><b>{h.day}</b><span>{h.enabled?`${h.open} – ${h.close}`:"Fechado"}</span></p>)}</details>}</div></div>
   </div>:<div key={step} className="step-transition">
    <div className="checkout-heading"><div><div className="eyebrow">{restaurant.name} {restaurant.isDemo&&'• PEDIDO DE DEMONSTRAÇÃO'}</div><h1 ref={heading} tabIndex={-1}>{step==='details'?'Finalize seu pedido':step==='payment'?'Como prefere pagar?':step==='pix'?'Pague com Pix':'Tudo certo com seu pedido?'}</h1>{step==='details'?Back({to:"menu",label:"Voltar ao cardápio"}):step==='review'?<p>Confira antes de enviar ao restaurante.</p>:step==='pix'?<p>Rápido, fácil e direto para o restaurante.</p>:<p>Mais um passo para matar essa fome.</p>}</div>{Steps()}</div>
    {!count?<div className="panel empty-results"><ShoppingBag size={40}/><h2>Sua sacola está vazia</h2><button className="button primary" onClick={()=>go('menu')}>Escolher meu pedido</button></div>:step==='details'?<form onSubmit={nextDetails} className="checkout-grid"><section className="panel details-panel"><h2>Como deseja receber?</h2><div className="delivery-tabs"><button disabled={restaurant.deliveryEnabled===false} type="button" className={fulfillment==='delivery'?'selected':''} onClick={()=>setFulfillment('delivery')}><Bike/>Entrega</button><button disabled={restaurant.pickupEnabled===false} type="button" className={fulfillment==='pickup'?'selected':''} onClick={()=>setFulfillment('pickup')}><ShoppingBag/>Retirada</button></div><h2>Seus dados</h2><div className="field-grid"><label className="field"><span>Nome</span><div><UserRound size={19}/><input required minLength={2} maxLength={100} name="name" autoComplete="name" placeholder="Como podemos te chamar?" value={customer.name} onChange={e=>updateCustomer('name',e.target.value)}/></div></label><label className="field"><span>WhatsApp</span><div><MessageCircle size={19}/><input required type="tel" name="phone" autoComplete="tel" placeholder="(61) 99999-0000" value={customer.phone} onChange={e=>updateCustomer('phone',formatPhone(e.target.value))}/></div></label></div>
    {fulfillment==='delivery'?<><h2>Endereço de entrega</h2><label className="field"><span>Rua, quadra e número</span><div><MapPin size={19}/><input required minLength={5} maxLength={200} name="address" autoComplete="street-address" placeholder="Ex.: SQS 308, Bloco B, nº 12" value={customer.address} onChange={e=>updateCustomer('address',e.target.value)}/></div></label><div className="field-grid"><label className="field"><span>Bairro</span><input required maxLength={80} name="neighborhood" placeholder="Ex.: Asa Sul" value={customer.neighborhood} onChange={e=>updateCustomer('neighborhood',e.target.value)}/></label><label className="field"><span>Complemento <small>(opcional)</small></span><input maxLength={100} name="complement" placeholder="Apartamento, bloco, referência" value={customer.complement} onChange={e=>updateCustomer('complement',e.target.value)}/></label></div><p className="field-hint"><MapPin size={14}/>{restaurant.city} / {restaurant.state} · A disponibilidade de entrega será confirmada.</p></>:<div className="pickup-address"><Store/><div><strong>Retire no {restaurant.name}</strong><p>{restaurant.address}<br/>{restaurant.city} / {restaurant.state}</p></div></div>}
    <h2>Algum pedido especial?</h2><label className="field"><span className="sr-only">Observações</span><textarea maxLength={500} placeholder="Ex.: Sem cebola, por favor. (opcional)" value={customer.notes} onChange={e=>updateCustomer('notes',e.target.value)}/></label></section><aside className="panel lavender checkout-summary"><div className="section-title"><h2>Seu pedido</h2><button type="button" className="text-button" onClick={()=>go('menu')}><Pencil size={15}/>Editar</button></div>{Items({})}{Totals()}<button type="submit" className="button primary wide">Continuar para pagamento<ArrowRight size={20}/></button><p className="safe-note"><ShieldCheck size={14}/> Seus dados são usados para este pedido.</p></aside></form>:step==='payment'?<div className="checkout-grid"><section className="panel payment-panel"><h2>Escolha a forma de pagamento</h2><div className="payment-options">{([{id:'pix',title:'Pix',desc:'Pague pelo aplicativo do seu banco',Icon:QrCode},{id:'cash',title:'Dinheiro',desc:'Pague na entrega ou na retirada',Icon:Banknote},{id:'card',title:'Cartão',desc:'Crédito ou débito na entrega',Icon:CreditCard}] as const).filter(({id})=>!restaurant.paymentMethods||restaurant.paymentMethods.includes(id)).map(({id,title,desc,Icon})=><button key={id} className={`payment-option ${payment===id?'selected':''}`} role="radio" aria-checked={payment===id} onClick={()=>setPayment(id)}><Icon size={32}/><span><strong>{title}</strong><small>{desc}</small></span><i>{payment===id&&<b/>}</i></button>)}</div><div className="payment-info lavender"><h3>{payment==='pix'?'Pagamento via Pix':payment==='cash'?'Dinheiro na entrega':'Cartão na entrega'}</h3><p>{payment==='pix'?'Confira os dados, pague no banco e selecione o comprovante na próxima etapa.':payment==='cash'?'Precisa de troco? Avise o restaurante para deixar tudo pronto.':'O restaurante levará a maquininha. Confirme as bandeiras aceitas pelo WhatsApp.'}</p>{payment==='cash'&&<label className="field"><span>Troco para <small>(deixe vazio se não precisar)</small></span><input inputMode="decimal" placeholder="Ex.: 50,00" value={change} onChange={e=>setChange(e.target.value.replace(/[^\d,.]/g,''))}/></label>}<div className="notice"><Info size={17}/>{restaurant.isDemo?'Demonstração: não realize nenhum pagamento.':'A confirmação será feita pelo restaurante.'}</div></div>{Back({to:"details",label:"Voltar aos dados"})}</section><aside className="panel checkout-summary"><div className="summary-restaurant"><Store size={27}/><div><h2>{restaurant.name}</h2><small>{restaurant.isDemo?'Pedido de demonstração':'Resumo do seu pedido'}</small></div></div>{Items({})}{Totals()}{CustomerSummary()}<button className="button primary wide" onClick={nextPayment}>{payment==='pix'?'Continuar com Pix':'Revisar pedido'}<ArrowRight size={20}/></button></aside></div>:step==='pix'?<><div className="pix-grid"><section className="panel qr-panel"><h2>{restaurant.isDemo?'Experimente o fluxo Pix':'Escaneie o QR Code'}</h2><div className={`qr-area ${restaurant.isDemo?'demo-qr':''}`}>{qr&&!restaurant.isDemo?<img src={qr} alt={`QR Code Pix para pagar ${money(total)}`}/>:<><QrCode size={150} strokeWidth={1.2}/><span><ShieldCheck size={16}/> {restaurant.isDemo?'Demonstração • sem cobrança':'Pix ainda não configurado'}</span></>}</div><p className="qr-caption">{restaurant.isDemo?'Nenhum pagamento será realizado.':'Confira o destinatário no aplicativo do banco.'}</p><div className="pix-amount lavender"><span>Valor {restaurant.isDemo?'de exemplo':'a pagar'}</span><strong>{money(total)}</strong></div></section><section className="panel pix-instructions"><h2>Ou use o Pix copia e cola</h2><div className="pix-key">{restaurant.pixKey&&!restaurant.isDemo?restaurant.pixKey:'Chave Pix não configurada'}</div><p className="field-hint">{restaurant.isDemo?'Este restaurante é fictício. Você pode testar a próxima etapa.':'Use o código completo no aplicativo do seu banco.'}</p><button className="button outline wide" disabled={!restaurant.pixKey||restaurant.isDemo} onClick={()=>void copyPix()}><Copy size={19}/>Copiar código Pix</button><ol className="pix-steps"><li><span>1</span>Abra o aplicativo do seu banco</li><li><span>2</span>Confira o destinatário e o valor</li><li><span>3</span>Selecione o comprovante abaixo</li></ol><input ref={fileInput} className="sr-only" tabIndex={-1} type="file" accept="image/png,image/jpeg,application/pdf" onChange={e=>chooseReceipt(e.target.files?.[0])}/><button className={`receipt-upload ${receipt?'has-file':''}`} onClick={()=>fileInput.current?.click()}><Paperclip size={28}/><span><strong>{receipt?receipt.name:'Anexar comprovante'}</strong><small>{receipt?'Clique para trocar o arquivo':'Imagem ou PDF · até 4 MB'}</small></span>{receipt&&<CheckCircle2 size={20}/>}</button>{receipt&&<button className="text-button remove-receipt" onClick={()=>{setReceipt(null);if(fileInput.current)fileInput.current.value=''}}><Trash2 size={14}/>Remover arquivo</button>}<p className="upload-note">No WhatsApp, anexe o arquivo à conversa. Selecioná-lo aqui não o envia automaticamente.</p>{Back({to:"payment",label:"Alterar pagamento"})}</section><aside className="panel lavender checkout-summary"><h2>Resumo do pedido</h2>{Items({})}{Totals()}<div className="pending-note"><Clock3 size={22}/><div><strong>{restaurant.isDemo?'Pagamento de exemplo':'Aguardando conferência'}</strong><p>{restaurant.isDemo?'Não há cobrança neste teste.':'O restaurante confirma o pagamento.'}</p></div></div><button className="button primary wide" onClick={()=>go('review')}>Revisar pedido<ArrowRight size={20}/></button></aside></div>{CustomerSummary()}</>:<div className="checkout-grid review-grid"><div className="review-content"><section className="panel"><div className="section-title"><h2><UtensilsCrossed size={22}/>{restaurant.name}</h2><button className="text-button" onClick={()=>go('menu')}><Pencil size={15}/>Editar</button></div>{Items({})}{customer.notes&&<div className="review-notes"><MessageCircle size={18}/>{customer.notes}</div>}</section><div className="review-contact-grid"><section className="panel review-detail"><UserRound size={25}/><div><div className="section-title"><h3>Contato</h3><button className="icon-button" aria-label="Editar contato" onClick={()=>go('details')}><Pencil size={17}/></button></div><strong>{customer.name}</strong><p>{customer.phone}</p></div></section><section className="panel review-detail"><MapPin size={25}/><div><div className="section-title"><h3>{fulfillment==='delivery'?'Endereço de entrega':'Retirada no local'}</h3><button className="icon-button" aria-label="Editar endereço" onClick={()=>go('details')}><Pencil size={17}/></button></div><p>{fulfillment==='delivery'?fullAddress:restaurant.address}</p></div></section></div><section className="panel lavender review-payment"><div className="review-detail">{payment==='pix'?<QrCode size={32}/>:payment==='cash'?<Banknote size={32}/>:<CreditCard size={32}/>}<div><h3>{payment==='pix'?'Pagamento via Pix':payment==='cash'?'Pagamento em dinheiro':'Cartão na entrega'}</h3><p>{payment==='pix'?(receipt?'Comprovante selecionado':'Comprovante não selecionado'):payment==='cash'?(change?`Troco para ${money(Math.round(Number(change.replace(',','.'))*100))}`:'Sem troco'):'Confirme a bandeira com o restaurante'}</p>{receipt&&payment==='pix'&&<span className="file-chip"><Paperclip size={15}/>{receipt.name}<CheckCircle2 size={15}/></span>}</div></div><button className="text-button" onClick={()=>go('payment')}><Pencil size={15}/>Alterar</button><div className="notice"><Clock3 size={17}/>{restaurant.isDemo?'Pedido fictício, sem cobrança':'Aguardando confirmação do restaurante'}</div></section>{Back({to:"payment",label:"Voltar ao pagamento"})}</div><aside className="panel checkout-summary review-summary"><h2>Resumo do pedido</h2>{Totals()}{restaurant.isDemo&&<div className="demo-send-note"><Sparkles size={19}/><p>Você está testando o FOODDF. A mensagem será identificada como <strong>pedido fictício</strong>.</p></div>}{!restaurant.isDemo&&!restaurant.acceptingOrders&&<div className="demo-send-note"><Info size={19}/><p>Este restaurante recebe pedidos diretamente pelo WhatsApp. Este envio não terá número nem acompanhamento no FOODDF.</p></div>}{orderReference&&orderFor===restaurant.id&&!restaurant.isDemo&&<div className="order-reference-note" role="status"><strong>Número do pedido: {orderReference}</strong><button type="button" className="text-button" onClick={()=>setTracking(true)}>Acompanhar pedido</button></div>}<button className="button whatsapp wide" disabled={sending} onClick={()=>void prepareWhatsapp()}><MessageCircle size={26}/>{sending?'Preparando pedido…':'Enviar pedido pelo WhatsApp'}</button><p className="safe-note">Confira a mensagem no WhatsApp e toque em enviar.{receipt&&' Anexe também o comprovante selecionado.'}</p>{whatsappUrl&&<a className="text-button whatsapp-reopen" href={whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp não abriu? Toque aqui<ArrowRight size={16}/></a>}<div className="whatsapp-destination"><Store size={25}/><div><small>Destino do pedido</small><strong>{restaurant.name}</strong><span>{restaurant.whatsapp?formatPhone(restaurant.whatsapp.replace(/^55/,'')):'WhatsApp não configurado'}</span></div></div></aside></div>}
   </div>}
  </main>
  <SiteFooter />
  {restaurant&&step==='menu'&&<button className="mobile-cart button primary" onClick={()=>setCartOpen(true)}><ShoppingBag size={20}/><span>Ver sacola <b>({count})</b></span><strong>{money(total)}</strong></button>}
  {cartOpen&&restaurant&&<div className="modal-backdrop" onClick={()=>setCartOpen(false)}><section className="modal cart-modal" role="dialog" aria-modal="true" aria-label="Sua sacola" onClick={e=>e.stopPropagation()}><button autoFocus className="modal-close icon-button" onClick={()=>setCartOpen(false)} aria-label="Fechar sacola"><X/></button>{CartPanel()}</section></div>}
  {help&&<div className="modal-backdrop" onClick={()=>setHelp(false)}><section className="modal help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={e=>e.stopPropagation()}><button autoFocus className="modal-close icon-button" onClick={()=>setHelp(false)} aria-label="Fechar ajuda"><X/></button><span className="icon-tile"><CircleHelp size={28}/></span><h2 id="help-title">Como funciona o FOODDF?</h2><p>Escolha seu estado e cidade, encontre um restaurante e monte sua sacola.</p><div className="help-step"><ShoppingBag/><div><strong>Seu pedido, do seu jeito</strong><p>Informe entrega ou retirada, seus dados e a forma de pagamento.</p></div></div><div className="help-step"><MessageCircle/><div><strong>Confirme pelo WhatsApp</strong><p>Revise o resumo e envie ao restaurante. A confirmação do pedido, prazo e pagamento é feita por ele.</p></div></div><div className="notice"><Info size={20}/>O Brasa Burger é fictício. Use-o para testar e não efetue pagamentos.</div><button className="button primary wide" onClick={()=>setHelp(false)}>Entendi, vamos pedir<ArrowRight size={18}/></button></section></div>}
  {location&&<div className="modal-backdrop modal-backdrop-top" onClick={()=>setLocation(false)}><section className="modal location-modal" role="dialog" aria-modal="true" aria-labelledby="location-title" onClick={e=>e.stopPropagation()}><button autoFocus className="modal-close icon-button" onClick={()=>setLocation(false)} aria-label="Fechar localização"><X/></button><span className="icon-tile"><MapPin size={28}/></span><h2 id="location-title">Por onde vamos começar?</h2><p>Encontre os restaurantes da sua região.</p><label className="field"><span>Estado</span><select value={state} onChange={e=>{const nextUf=e.target.value;setState(nextUf);setCity(nextUf==='DF'?'Brasília':'')}}>{states.map(([uf,name])=><option key={uf} value={uf}>{name} ({uf})</option>)}</select></label><label className="field"><span>Cidade</span><select value={city} onChange={e=>setCity(e.target.value)}><option value="">{cities.length?'Todas as cidades':'Nenhuma cidade disponível'}</option>{cities.map(c=><option key={c} value={c}>{c}</option>)}</select></label><button className="button primary wide" onClick={()=>{setLocation(false);window.location.href=`/buscas?uf=${state}&cidade=${encodeURIComponent(city||'')}`}}>Ver restaurantes<ArrowRight size={18}/></button></section></div>}
  {customProduct&&<div className="modal-backdrop" onClick={()=>setCustomProduct(null)}><section className="modal extras-modal" role="dialog" aria-modal="true" aria-label={customProduct.name} onClick={e=>e.stopPropagation()}><button className="modal-close icon-button" autoFocus aria-label="Fechar adicionais" onClick={()=>setCustomProduct(null)}><X/></button><FoodImage kind={customProduct.image} label={customProduct.name}/><h2>{customProduct.name}</h2><p>{customProduct.description}</p><h3>Deixe do seu jeito</h3>{customProduct.extras?.map(extra=><label className="extra-choice" key={extra.id}><input type="checkbox" checked={selectedExtras.includes(extra.id)} onChange={e=>setSelectedExtras(old=>e.target.checked?[...old,extra.id]:old.filter(id=>id!==extra.id))}/><span>{extra.name}</span><strong>+ {money(extra.price)}</strong></label>)}<button className="button primary wide" onClick={()=>{quantity([customProduct.id,...selectedExtras.sort()].join('::'),1);setCustomProduct(null);setToast('Produto adicionado à sacola.')}}>Adicionar ao pedido · {money(customProduct.price+(customProduct.extras||[]).filter(e=>selectedExtras.includes(e.id)).reduce((s,e)=>s+e.price,0))}</button></section></div>}
  {tracking&&<TrackOrder initialReference={orderReference} onClose={()=>setTracking(false)}/>}
  {shareOpen&&restaurant&&<div className="modal-backdrop" onClick={()=>setShareOpen(false)}><section className="modal share-modal" role="dialog" aria-modal="true" aria-labelledby="share-title" onClick={e=>e.stopPropagation()}><button autoFocus className="modal-close icon-button" onClick={()=>setShareOpen(false)} aria-label="Fechar compartilhamento"><X/></button><div className="share-preview-card"><div className="share-logo-1x1-wrapper"><FoodImage kind={restaurant.logo||"logo"} label={restaurant.name}/></div><span className="share-badge-1x1">Imagem de divulgação (1:1)</span><h2 id="share-title">Compartilhar {restaurant.name}</h2><p>Envie o cardápio para amigos ou divulgue nas suas redes sociais.</p></div><div className="share-link-box"><input readOnly value={typeof window!=='undefined'?`${window.location.origin}${restaurantPath(restaurant.slug)}`:`https://fooddf.vercel.app${restaurantPath(restaurant.slug)}`}/><button type="button" className="button outline small" onClick={async()=>{const u=typeof window!=='undefined'?`${window.location.origin}${restaurantPath(restaurant.slug)}`:`https://fooddf.vercel.app${restaurantPath(restaurant.slug)}`;try{await navigator.clipboard.writeText(u);setToast('Link copiado!');}catch{}}}><Copy size={15}/>Copiar</button></div><div className="share-actions-grid"><a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Confira o cardápio de ${restaurant.name} no FOODDF:\n${typeof window!=='undefined'?window.location.origin:'https://fooddf.vercel.app'}${restaurantPath(restaurant.slug)}`)}`} target="_blank" rel="noopener noreferrer" className="button whatsapp wide"><MessageCircle size={20}/>Compartilhar no WhatsApp</a><a href={`/api/og/restaurant?slug=${encodeURIComponent(restaurant.slug)}`} target="_blank" rel="noopener noreferrer" className="button outline wide"><Share2 size={16}/>Ver imagem 1:1 de divulgação</a></div></section></div>}
  {toast&&<div className="toast" role="status"><CheckCircle2 size={19}/>{toast}</div>}
 </div>;
}
