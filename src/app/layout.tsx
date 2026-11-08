import type { Metadata } from 'next';
import { Nunito_Sans } from 'next/font/google';
import './globals.css';
const nunito = Nunito_Sans({subsets:['latin'],display:'swap',variable:'--font-nunito'});
export const metadata: Metadata = {title:'FOODDF — Seu próximo favorito está aqui',description:'Encontre restaurantes na sua cidade, escolha seu prato favorito e faça seu pedido. Simples, perto e do seu jeito.', icons:{icon:'/icon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="pt-BR" className={nunito.variable}>
      <head>
        <meta name="view-transition" content="same-origin" />
      </head>
      <body>
        <div className="page-transition">
          {children}
        </div>
      </body>
    </html>
  );
}
