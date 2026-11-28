import type { Metadata } from 'next';
import HowItWorksClient, { type FaqItem } from '@/components/how-it-works-client';
import { siteOrigin, ogDefaults, twitterDefaults, indexableRobots } from '@/lib/seo';
import './how-it-works.css';

const title = 'Como pedir comida pelo WhatsApp — Passo a passo';
const description =
  'Entenda como encontrar restaurantes por região, consultar cardápios digitais e confirmar seu pedido direto pelo WhatsApp no FOODDF.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['como funciona', 'pedir comida pelo WhatsApp', 'cardápio digital', 'pedido online', 'FOODDF'],
  alternates: { canonical: '/como-funciona' },
  robots: indexableRobots,
  openGraph: ogDefaults('/como-funciona', title, description),
  twitter: twitterDefaults,
};

const HOW_FAQS: readonly FaqItem[] = [
  {
    question: 'Quem confirma o pagamento?',
    answer: 'O restaurante confere o pagamento. No Pix, confira os dados do recebedor.',
  },
  {
    question: 'Como acompanho meu pedido?',
    answer: 'Quando disponível, use Acompanhar com o número do pedido e o WhatsApp da compra.',
  },
  {
    question: 'O Brasa Burger é real?',
    answer: 'É um cardápio fictício de demonstração. Não faça pagamentos no teste.',
  },
  {
    question: 'Como cadastro meu estabelecimento?',
    answer: 'Acesse Para restaurantes e crie sua conta grátis.',
  },
];

export default function HowItWorksPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOW_FAQS.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FOODDF', item: siteOrigin },
      { '@type': 'ListItem', position: 2, name: 'Como funciona', item: `${siteOrigin}/como-funciona` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([faqSchema, breadcrumbSchema]).replace(/</g, '\\u003c') }}
      />
      <HowItWorksClient faqs={HOW_FAQS} />
    </>
  );
}
