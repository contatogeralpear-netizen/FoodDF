import type { Metadata } from 'next';
import { Nunito_Sans } from 'next/font/google';
import { siteOrigin, indexableRobots, defaultOgImage, siteName, twitterDefaults } from '@/lib/seo';
import './globals.css';
import './discovery.css';
import './support.css';
const nunito = Nunito_Sans({subsets:['latin'],display:'swap',variable:'--font-nunito'});
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: { default: 'FOODDF — Restaurantes e cardápios por cidade | Peça pelo WhatsApp', template: '%s | FOODDF' },
  description: 'Encontre restaurantes por estado e cidade, conheça os cardápios e peça pelo WhatsApp. Cardápio digital grátis para restaurantes.',
  keywords: ['restaurantes', 'cardápio digital', 'pedir pelo WhatsApp', 'delivery', 'comida', 'Brasília', 'cardápio online', 'FOODDF'],
  authors: [{ name: 'FOODDF' }],
  creator: 'FOODDF',
  publisher: 'FOODDF',
  robots: indexableRobots,
  verification: { google: 'urSSZ7JM-JM-ZAsmDHupPKg-GzVshUXztsi2qNH3LJg' },
  icons: { icon: '/icon.svg' },
  openGraph: {
    title: 'FOODDF — Restaurantes e cardápios por cidade',
    description: 'Encontre restaurantes por estado e cidade, conheça os cardápios e peça pelo WhatsApp.',
    url: '/',
    siteName,
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'FOODDF — Cardápios e restaurantes por cidade' }],
  },
  twitter: twitterDefaults,
  alternates: { canonical: '/' },
};
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
