import type { Metadata } from 'next';
import { ChefHat, ArrowRight, ShieldCheck, HeartHandshake, MapPin } from 'lucide-react';
import SiteFooter from '@/components/footer';
import { siteOrigin, ogDefaults, twitterDefaults, indexableRobots } from '@/lib/seo';
import '@/app/institutional.css';

const title = 'Sobre o FOODDF — Nossa Missão e Propósito';
const description = 'Conheça o FOODDF, plataforma brasileira de cardápios digitais criada para aproximar clientes de restaurantes locais sem intermediários abusivos.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['sobre o FOODDF', 'cardápio digital Brasília', 'marketplace restaurantes locais', 'quem somos', 'FOODDF'],
  alternates: { canonical: '/sobre' },
  robots: indexableRobots,
  openGraph: ogDefaults('/sobre', title, description),
  twitter: twitterDefaults,
};

export default function SobrePage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FOODDF', item: siteOrigin },
      { '@type': 'ListItem', position: 2, name: 'Sobre' },
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
            <a href="/buscas">Restaurantes</a>
            <a href="/como-funciona">Como Funciona</a>
            <a href="/buscas" className="institutional-cta">Pedir Agora</a>
          </nav>
        </div>
      </header>

      <main className="institutional-main">
        <nav className="institutional-breadcrumbs" aria-label="Navegação estrutural">
          <a href="/">Início</a>
          <span>›</span>
          <span>Sobre nós</span>
        </nav>

        <p className="institutional-kicker">QUEM SOMOS</p>
        <h1 className="institutional-title">Sobre o FOODDF</h1>
        <p className="institutional-lead">
          Nascemos com a convicção de que a tecnologia de delivery deve conectar pessoas e valorizar a gastronomia local, em vez de sufocar pequenos negócios com comissões exorbitantes.
        </p>

        <div className="institutional-content">
          <h2>Nossa Missão</h2>
          <p>
            O <strong>FOODDF</strong> é uma plataforma brasileira de cardápios digitais e conexão direta entre consumidores e estabelecimentos de alimentação. Nossa missão é oferecer ferramentas tecnológicas modernas, rápidas e acessíveis para que restaurantes, hamburguerias, pizzarias, confeitarias e marmitarias independentes possam expor seus produtos na internet e receber pedidos diretamente pelo WhatsApp.
          </p>

          <h2>O Problema que Resolvemos</h2>
          <p>
            Nos grandes aplicativos de delivery tradicionais, o comerciante chega a repassar até 30% do valor de cada refeição em comissões, além de pagar mensalidades e taxas de antecipação financeira. Esse custo acaba encarecendo os pratos para o consumidor final e precarizando a margem de quem passa horas na cozinha preparando a comida.
          </p>
          <p>
            No FOODDF, a relação é direta: o cliente visualiza o cardápio interativo, escolhe os pratos com suas personalizações e envia a mensagem pronta para a conversa do restaurante. O pagamento, o preparo e a entrega são combinados ponto a ponto, com total transparência.
          </p>

          <h2>Nossos Valores</h2>
          <ul>
            <li><strong>Apoio ao Comércio Local:</strong> Priorizamos pequenos e médios estabelecimentos das cidades brasileiras.</li>
            <li><strong>Transparência Absoluta:</strong> Sem taxas escondidas, sem retenção de dinheiro do Pix e sem letras miúdas.</li>
            <li><strong>Privacidade em Primeiro Lugar:</strong> Respeitamos rigorosamente a LGPD; os dados do pedido destinam-se exclusivamente à entrega e comunicação direta com o restaurante.</li>
            <li><strong>Simplicidade e Performance:</strong> Plataforma leve, ultrarrápida no celular e que não consome a memória do aparelho.</li>
          </ul>

          <h2>Operação e Transparência Institucional</h2>
          <div className="institutional-card-box">
            <p><strong>Identificação do Operador da Plataforma:</strong></p>
            <p>
              Operado por:{' '}
              <a
                href="https://www.instagram.com/capital_informatica"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#ff5900', fontWeight: 700, textDecoration: 'underline' }}
              >
                Capital Informática
              </a>
            </p>
            <p>
              Instagram Oficial do FOODDF:{' '}
              <a
                href="https://www.instagram.com/fooddfoficial"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#ff5900', fontWeight: 700, textDecoration: 'underline' }}
              >
                @fooddfoficial
              </a>
            </p>
            <p>CNPJ: [PREENCHER: Número do CNPJ]</p>
            <p>Endereço: [PREENCHER: Endereço completo da sede]</p>
            <p>Canal Oficial de Atendimento: [PREENCHER: e-mail de contato oficial]</p>
          </div>

          <div className="institutional-cta-banner">
            <h2>Quer fazer parte do FOODDF?</h2>
            <p>Cadastre seu restaurante gratuitamente até 31/12/2026 e comece a receber pedidos diretamente pelo WhatsApp.</p>
            <a href="/para-restaurantes" className="button primary" style={{ background: '#ff5900', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 800, textDecoration: 'none' }}>
              Conhecer FOODDF para Restaurantes <ArrowRight size={18} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
