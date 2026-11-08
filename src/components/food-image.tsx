import { CupSoda } from 'lucide-react';
const regions: Record<string,string> = { burger:'34 598 366 164', meal:'416 598 355 164', fries:'786 598 360 164', combo:'620 224 520 210', hero:'516 224 628 211', logo:'49 100 121 109' };
export function FoodImage({kind='burger',className='',label=''}:{kind?:string;className?:string;label?:string}) {
 if(kind.startsWith('https://')) return <img className={`food-image ${className}`} src={kind} alt={label} loading="lazy" style={{objectFit:'cover'}}/>;
 if(kind==='drink') return <div className={`drink-image ${className}`} role="img" aria-label={label || 'Refrigerante em lata'}><CupSoda strokeWidth={1.2}/><span>GELADINHO</span></div>;
 return <svg className={`food-image ${className}`} viewBox={regions[kind] || regions.burger} preserveAspectRatio="xMidYMid slice" role="img" aria-label={label || kind}><image href="/images/fooddf-reference-menu.png" width="1672" height="941" /></svg>;
}
