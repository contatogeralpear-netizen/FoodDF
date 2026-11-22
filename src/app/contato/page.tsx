import type { Metadata } from 'next';
import { ChefHat, ArrowRight, Mail, Phone, Clock, MessageSquare, ShieldCheck } from 'lucide-react';
import SiteFooter from '@/components/footer';
import { siteOrigin, ogDefaults, twitterDefaults, indexableRobots } from '@/lib/seo';
import '@/app/institutional.css';

const title = 'Contato e Suporte Oficial';
const description = 'Fale com a equipe do FOODDF. Dúvidas sobre cadastro de restaurantes, suporte técnico, parcerias e canal de atendimento aos usuários.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['contato FOODDF', 'suporte FOODDF', 'atendimento restaurantes', 'e-mail suporte', 'FOODDF'],
  alternates: { canonical: '/contato' },
  robots: indexableRobots,
  openGraph: ogDefaults('/contato', title, description),
  twitter: twitterDefaults,
};

export default function ContatoPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FOODDF', item: siteOrigin },
      { '@type': 'ListItem', position: 2, name: 'Contato' },
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
          <a href="/" className="institutional-brand"><ChefHat size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6, color: '#ff5900' }} />FOOD<span>DF</span></a>
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
          <span>Contato</span>
        </nav>

        <p className="institutional-kicker">ATENDIMENTO E SUPORTE</p>
        <h1 className="institutional-title">Fale com o FOODDF</h1>
        <p className="institutional-lead">
          Estamos aqui para ajudar restaurantes e clientes. Veja abaixo qual canal melhor atende a sua necessidade.
        </p>

        <div className="institutional-content">
          <div className="institutional-card-box">
            <h2>Dúvidas sobre um pedido em andamento?</h2>
            <p>
              Como o FOODDF conecta você diretamente ao restaurante, qualquer dúvida sobre tempo de preparo, rota de entrega, alterações no prato ou conferência de pagamento via Pix deve ser tratada <strong>diretamente no WhatsApp do restaurante escolhido</strong>. Você encontra o contato do restaurante na página do cardápio e no histórico de conversa do seu WhatsApp.
            </p>
          </div>

          <h2>Canais Oficiais da Plataforma</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', margin: '24px 0' }}>
            <div className="institutional-card-box" style={{ margin: 0 }}>
              <div style={{ color: '#ff5900', marginBottom: '10px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </div>
              <h3>Instagram Oficial</h3>
              <p style={{ fontSize: '14px', color: '#553549' }}>Acompanhe novidades, restaurantes parceiros e promoções:</p>
              <p>
                <a
                  href="https://www.instagram.com/fooddfoficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#ff5900', fontWeight: 800, textDecoration: 'underline' }}
                >
                  @fooddfoficial ↗
                </a>
              </p>
            </div>

            <div className="institutional-card-box" style={{ margin: 0 }}>
              <div style={{ color: '#ff5900', marginBottom: '10px' }}><Mail size={28} /></div>
              <h3>E-mail de Suporte Geral</h3>
              <p style={{ fontSize: '14px', color: '#553549' }}>Para dúvidas sobre o funcionamento da plataforma, sugestões ou suporte:</p>
              <p><strong>[PREENCHER: suporte@fooddf.com.br ou e-mail de atendimento]</strong></p>
            </div>

            <div className="institutional-card-box" style={{ margin: 0 }}>
              <div style={{ color: '#ff5900', marginBottom: '10px' }}><Store size={28} /></div>
              <h3>Suporte a Restaurantes</h3>
              <p style={{ fontSize: '14px', color: '#553549' }}>Auxílio no cadastro do estabelecimento, inclusão de produtos e fotos:</p>
              <p><strong>[PREENCHER: restaurantes@fooddf.com.br ou WhatsApp de suporte comercial]</strong></p>
            </div>

            <div className="institutional-card-box" style={{ margin: 0 }}>
              <div style={{ color: '#ff5900', marginBottom: '10px' }}><ShieldCheck size={28} /></div>
              <h3>Privacidade e LGPD</h3>
              <p style={{ fontSize: '14px', color: '#553549' }}>Para exercer seus direitos como titular de dados pessoais:</p>
              <p><strong>[PREENCHER: dpo@fooddf.com.br ou e-mail do Encarregado]</strong></p>
            </div>
          </div>

          <h2>Horário de Atendimento da Equipe</h2>
          <p>
            Nossa equipe técnica e comercial atende de <strong>[PREENCHER: Segunda a Sexta-feira, das 09h às 18h]</strong>. Mensagens recebidas fora desse horário serão respondidas no próximo dia útil.
          </p>

          <h2>Endereço e Dados Cadastrais</h2>
          <p>
            FOODDF — Plataforma de Cardápios Digitais<br />
            Operado por:{' '}
            <a
              href="https://www.instagram.com/capital_informatica"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#ff5900', fontWeight: 700 }}
            >
              Capital Informática
            </a><br />
            CNPJ: [PREENCHER: Número do CNPJ]<br />
            [PREENCHER: Cidade / Estado / CEP]
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Store({ size }: { size: number }) {
  return <ChefHat size={size} />;
}
