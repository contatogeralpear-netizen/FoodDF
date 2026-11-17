import type { Metadata } from 'next';
import { Nunito_Sans } from 'next/font/google';
import { siteOrigin } from '@/lib/seo';
import './globals.css';
import './discovery.css';
import './support.css';
const nunito = Nunito_Sans({subsets:['latin'],display:'swap',variable:'--font-nunito'});
export const metadata: Metadata = {metadataBase:new URL(siteOrigin),title:'FOODDF | Cardápios e restaurantes por cidade',description:'Encontre restaurantes por estado e cidade, conheça os cardápios e combine seu pedido diretamente com o estabelecimento.',verification:{google:'urSSZ7JM-JM-ZAsmDHupPKg-GzVshUXztsi2qNH3LJg'},icons:{icon:'/icon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="pt-BR" className={nunito.variable}>
      <head>
        <meta name="view-transition" content="same-origin" />
        <style>{'@view-transition { navigation: auto; }'}</style>
      </head>
      <body>
        <div className="page-transition">
          {children}
        </div>
      </body>
    </html>
  );
}
