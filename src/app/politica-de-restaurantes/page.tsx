import type { Metadata } from 'next';
import { ChefHat, ShieldCheck, Store, AlertTriangle, ArrowRight } from 'lucide-react';
import SiteFooter from '@/components/footer';
import { siteOrigin, ogDefaults, twitterDefaults, indexableRobots } from '@/lib/seo';
import '@/app/institutional.css';

const title = 'Diretrizes e Política para Restaurantes Parceiros';
const description = 'Regras de conduta, padrões de qualidade, veracidade de cardápio e conformidade sanitária para restaurantes cadastrados no FOODDF.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['política de restaurantes', 'regras cadastro restaurantes', 'diretrizes parceiros FOODDF', 'FOODDF'],
  alternates: { canonical: '/politica-de-restaurantes' },
  robots: indexableRobots,
  openGraph: ogDefaults('/politica-de-restaurantes', title, description),
  twitter: twitterDefaults,
};

export default function PoliticaRestaurantesPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FOODDF', item: siteOrigin },
      { '@type': 'ListItem', position: 2, name: 'Para restaurantes', item: `${siteOrigin}/para-restaurantes` },
      { '@type': 'ListItem', position: 3, name: 'Política de Restaurantes' },
    ],
  };

  return (
    <div className="institutional-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <header className="institutional-header">
        <div className="institutional-header-inner">
          <a href="/" className="institutional-brand"><img src="/images/fooddf-logo-hd.png" alt="FOODDF" style={{ height: "36px", width: "auto", display: "inline-block", verticalAlign: "middle" }} /></a>
          <nav className="institutional-nav">
            <a href="/para-restaurantes">Para Restaurantes</a>
            <a href="/painel">Entrar no Painel</a>
            <a href="/painel?cadastro=1" className="institutional-cta">Cadastrar Grátis</a>
          </nav>
        </div>
      </header>

      <main className="institutional-main">
        <nav className="institutional-breadcrumbs" aria-label="Navegação estrutural">
          <a href="/">Início</a>
          <span>›</span>
          <a href="/para-restaurantes">Para Restaurantes</a>
          <span>›</span>
          <span>Diretrizes para Restaurantes</span>
        </nav>

        <p className="institutional-kicker">QUALIDADE E CONFORMIDADE</p>
        <h1 className="institutional-title">Diretrizes para Restaurantes Parceiros</h1>
        <p className="institutional-lead">
          Padrões de transparência, veracidade de informações e compromisso sanitário exigidos para publicação de estabelecimentos no FOODDF.
        </p>

        <div className="institutional-content">
          <h2>1. Requisitos para Cadastro e Publicação</h2>
          <p>
            O FOODDF é destinado exclusivamente a estabelecimentos comerciais que atuam no segmento de alimentação e bebidas: restaurantes, lanchonetes, hamburguerias, pizzarias, pastelarias, marmitarias, cafeterias, confeitarias e similares.
          </p>
          <p>
            Para publicar seu cardápio, o responsável deve fornecer dados válidos de localização física, número de WhatsApp operacional e informações claras de contato.
          </p>

          <h2>2. Veracidade de Cardápios e Preços</h2>
          <ul>
            <li><strong>Preços Claros:</strong> Os preços cadastrados devem corresponder aos valores efetivamente praticados. É vedada a cobrança de taxas extras não discriminadas no cardápio.</li>
            <li><strong>Fotos Reais:</strong> Incentivamos o uso de fotografias que representem de forma fidedigna as porções e ingredientes servidos.</li>
            <li><strong>Disponibilidade:</strong> Itens esgotados devem ser desativados temporariamente no painel para evitar cancelamentos após o envio do pedido.</li>
          </ul>

          <h2>3. Produtos Estritamente Proibidos</h2>
          <div className="institutional-highlight-box" style={{ borderLeftColor: '#dc2626', background: '#fef2f2' }}>
            <strong style={{ color: '#991b1b' }}>Atenção:</strong> É expressamente proibido o cadastramento de produtos alheios ao setor alimentício, medicamentos, produtos controlados, substâncias ilícitas, animais ou qualquer item em desacordo com a legislação brasileira. Estabelecimentos que violarem esta regra serão excluídos sumariamente.
          </div>

          <h2>4. Conformidade Sanitária e Regulatória</h2>
          <p>
            Todo restaurante cadastrado declara estar em dia com as normas sanitárias vigentes em seu município e com as regulamentações da Agência Nacional de Vigilância Sanitária (Anvisa). A conservação e o manuseio adequado dos alimentos são premissas inegociáveis para a permanência na plataforma.
          </p>

          <h2>5. Atendimento ao Cliente</h2>
          <p>
            Ao receber um pedido originado pelo FOODDF no WhatsApp, o restaurante compromete-se a responder ao cliente com cortesia, informando de maneira clara o recebimento, o tempo estimado de entrega e a confirmação do pagamento.
          </p>

          <div className="institutional-cta-banner">
            <h2>Pronto para começar?</h2>
            <p>Junte-se a estabelecimentos que estão transformando o delivery em sua cidade com autonomia e sem comissão.</p>
            <a href="/painel?cadastro=1" className="button primary" style={{ background: '#ff5900', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 800, textDecoration: 'none' }}>
              Cadastrar Meu Estabelecimento Grátis <ArrowRight size={18} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
