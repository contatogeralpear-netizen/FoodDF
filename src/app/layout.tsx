import type { Metadata } from 'next';
import { Fraunces, Nunito_Sans } from 'next/font/google';
import { siteOrigin, indexableRobots, defaultOgImage, siteName, twitterDefaults } from '@/lib/seo';
import CookieConsent from '@/components/cookie-consent';
import './globals.css';
import './discovery.css';
import './support.css';

const nunito = Nunito_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-nunito' });
const fraunces = Fraunces({ subsets: ['latin'], display: 'swap', variable: '--font-fraunces', axes: ['SOFT', 'WONK', 'opsz'] });

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: 'FOODDF — Restaurantes e cardápios por cidade | Peça pelo WhatsApp',
    template: '%s | FOODDF',
  },
  description: 'Encontre restaurantes por estado e cidade, conheça os cardápios digitais e combine seu pedido direto pelo WhatsApp.',
  keywords: ['restaurantes', 'cardápio digital', 'pedir pelo WhatsApp', 'delivery', 'comida', 'Brasília', 'cardápio online', 'FOODDF'],
  authors: [{ name: 'FOODDF' }],
  creator: 'FOODDF',
  publisher: 'FOODDF',
  robots: indexableRobots,
  verification: { google: 'urSSZ7JM-JM-ZAsmDHupPKg-GzVshUXztsi2qNH3LJg' },
  icons: { icon: '/icon.svg' },
  openGraph: {
    title: 'FOODDF — Restaurantes e cardápios por cidade',
    description: 'Encontre restaurantes por estado e cidade, conheça os cardápios digitais e combine seu pedido direto pelo WhatsApp.',
    url: '/',
    siteName,
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'FOODDF — Cardápios e restaurantes por cidade' }],
  },
  twitter: twitterDefaults,
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FOODDF',
    url: siteOrigin,
    logo: `${siteOrigin}/icon.svg`,
    description: 'Plataforma brasileira de cardápios digitais para restaurantes locais com pedidos pelo WhatsApp.',
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FOODDF',
    url: siteOrigin,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteOrigin}/buscas?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="pt-BR" className={`${nunito.variable} ${fraunces.variable}`}>
      <head>
        <meta name="view-transition" content="same-origin" />
        <style>{'@view-transition { navigation: auto; }'}</style>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationSchema, webSiteSchema]).replace(/</g, '\\u003c') }}
        />
      </head>
      <body>
        <div className="page-transition">
          {children}
        </div>
        <CookieConsent />
      </body>
    </html>
  );
}
