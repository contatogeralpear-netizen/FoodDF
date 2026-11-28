import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowRight, ChevronRight, Menu, Plus, Search, ShoppingBag } from 'lucide-react';
import SiteFooter from '@/components/footer';
import { isFreePromotionActive } from '@/lib/promotion';
import { siteOrigin, ogDefaults, twitterDefaults, indexableRobots } from '@/lib/seo';
import './restaurant-landing.css';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  const free = isFreePromotionActive();
  const title = free ? 'Cardápio digital grátis para restaurantes' : 'Cardápio digital para restaurantes';
  const description =
    'Tenha um cardápio digital 100% grátis para o seu restaurante e receba pedidos direto pelo WhatsApp no FOODDF.';
  return {
    title,
    description,
    keywords: ['cardápio digital grátis', 'cadastrar restaurante', 'pedidos pelo WhatsApp', 'FOODDF para restaurantes'],
    alternates: { canonical: '/para-restaurantes' },
    robots: indexableRobots,
    openGraph: ogDefaults('/para-restaurantes', title, description),
    twitter: twitterDefaults,
  };
}

const PHONE_ITEMS = [
  {
    name: 'Hambúrguer Artesanal',
    desc: 'Pão brioche, burger, queijo, bacon e salada.',
    price: 'R$ 34,90',
    image: '/images/para-restaurantes/menu-hamburguer-artesanal.webp',
    alt: 'Hambúrguer artesanal com bacon e cheddar',
  },
  {
    name: 'Pizza Marguerita',
    desc: 'Molho de tomate, mussarela e manjericão.',
    price: 'R$ 49,90',
    image: '/images/para-restaurantes/menu-pizza-marguerita.webp',
    alt: 'Pizza Marguerita assada no forno a lenha',
  },
  {
    name: 'Prato Brasileiro',
    desc: 'Arroz, feijão, farofa, salada e sua proteína.',
    price: 'R$ 29,90',
    image: '/images/para-restaurantes/menu-prato-brasileiro.webp',
    alt: 'Prato brasileiro completo com arroz, feijão e acompanhamentos',
  },
] as const;

const FAQ_LIST = [
  {
    question: 'O FOODDF é gratuito para restaurantes?',
    answer: 'Sim. O cadastro e o uso da plataforma são 100% grátis.',
  },
  {
    question: 'Quem pode se cadastrar?',
    answer: 'Restaurantes, lanchonetes, pizzarias, cafeterias, hamburguerias e outros estabelecimentos de alimentação.',
  },
  {
    question: 'Como recebo os pedidos?',
    answer: 'O cliente revisa o pedido e envia pelo WhatsApp da sua loja. Você confirma diretamente com ele.',
  },
  {
    question: 'Como os clientes encontram meu restaurante?',
    answer: 'Depois da publicação, os clientes selecionam o estado e a cidade para encontrar sua loja e acessar o cardápio.',
  },
] as const;

function SparkBurst({ className = 'rest-sparks' }: { className?: string }) {
  return (
    <svg className={className} width="26" height="24" viewBox="0 0 28 26" fill="none" aria-hidden="true">
      <line x1="5" y1="14" x2="9" y2="3" stroke="#f26716" strokeWidth="3.1" strokeLinecap="round" />
      <line x1="12" y1="18" x2="21" y2="9" stroke="#f26716" strokeWidth="3.1" strokeLinecap="round" />
      <line x1="15" y1="23" x2="25" y2="20" stroke="#f26716" strokeWidth="3.1" strokeLinecap="round" />
    </svg>
  );
}

function FeaturePhotoIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="21" height="17" rx="3.2" stroke="#ef5a0c" strokeWidth="2" />
      <circle cx="9.5" cy="11" r="2" stroke="#ef5a0c" strokeWidth="1.8" />
      <path d="M5 20L11.5 14L16 18L19.5 15L23.5 19.5" stroke="#ef5a0c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FeatureRegionIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M5 20.5L9.5 17.5L14 19.2L18.5 17.5L23 20.5L18.2 24L14 22.4L9.8 24L5 20.5Z" stroke="#ef5a0c" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M14 19C14 19 19.5 13.7 19.5 9.5C19.5 6.46 17.04 4 14 4C10.96 4 8.5 6.46 8.5 9.5C8.5 13.7 14 19 14 19Z" stroke="#ef5a0c" strokeWidth="2" fill="#fff6ef" />
      <circle cx="14" cy="9.5" r="2" fill="#ef5a0c" />
    </svg>
  );
}

function FeatureWhatsappIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14.1 4.2C8.74 4.2 4.4 8.52 4.4 13.85C4.4 15.65 4.9 17.34 5.76 18.78L4.3 23.8L9.46 22.38C10.86 23.14 12.43 23.5 14.1 23.5C19.46 23.5 23.8 19.18 23.8 13.85C23.8 8.52 19.46 4.2 14.1 4.2Z" stroke="#ef5a0c" strokeWidth="2" strokeLinejoin="round" />
      <path d="M11.2 10.1C10.95 9.55 10.68 9.54 10.42 9.53C10.22 9.52 9.98 9.52 9.75 9.52C9.5 9.52 9.13 9.6 8.82 9.94C8.5 10.28 7.62 11.1 7.62 12.78C7.62 14.46 8.85 16.08 9.02 16.32C9.2 16.55 11.4 20.12 14.88 21.48C17.78 22.62 18.38 22.4 19 22.34C19.62 22.28 21.02 21.52 21.3 20.72C21.58 19.92 21.58 19.22 21.5 19.08C21.42 18.94 21.18 18.85 20.84 18.68C20.5 18.5 18.82 17.68 18.5 17.56C18.18 17.44 17.96 17.39 17.73 17.73C17.5 18.08 16.84 18.85 16.64 19.08C16.44 19.3 16.24 19.34 15.9 19.16C15.55 18.99 14.45 18.63 13.14 17.46C12.12 16.55 11.43 15.43 11.23 15.08C11.03 14.74 11.21 14.55 11.38 14.38C11.54 14.23 11.73 13.98 11.9 13.78C12.08 13.58 12.13 13.44 12.25 13.21C12.36 12.98 12.3 12.78 12.22 12.61C12.13 12.44 11.52 10.75 11.2 10.1Z" fill="#ef5a0c" transform="scale(0.82) translate(2.8 2.4)" />
    </svg>
  );
}

function StepStoreIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M11 22V38C11 39.1 11.9 40 13 40H35C36.1 40 37 39.1 37 38V22" stroke="#4a0e27" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#fffaf6" />
      <path d="M20 40V29H28V40" stroke="#4a0e27" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 18L11.5 10H36.5L40 18" fill="#ef5a0c" stroke="#ef5a0c" strokeWidth="2.1" strokeLinejoin="round" />
      <path d="M8 18C8 20.5 9.8 22.5 12 22.5C14.2 22.5 16 20.5 16 18C16 20.5 17.8 22.5 20 22.5C22.2 22.5 24 20.5 24 18C24 20.5 25.8 22.5 28 22.5C30.2 22.5 32 20.5 32 18C32 20.5 33.8 22.5 36 22.5C38.2 22.5 40 20.5 40 18H8Z" fill="#ef5a0c" />
      <line x1="16.5" y1="10" x2="15.5" y2="19" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="24" y1="10" x2="24" y2="19" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="31.5" y1="10" x2="32.5" y2="19" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function StepMenuBoardIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 48 48" fill="none" aria-hidden="true">
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

function StepPublishRegionIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M9 33L16 28L24 31L32 28L39 33L31 39L24 36.5L17 39L9 33Z" stroke="#ef5a0c" strokeWidth="2.4" strokeLinejoin="round" fill="#fff3eb" />
      <path d="M24 31C24 31 33 22.2 33 15.5C33 10.53 28.97 6.5 24 6.5C19.03 6.5 15 10.53 15 15.5C15 22.2 24 31 24 31Z" fill="#ef5a0c" />
      <circle cx="24" cy="15.5" r="3.6" fill="#ffffff" />
    </svg>
  );
}

function LaptopStoreIllustration() {
  return (
    <svg className="rest-laptop-svg" width="168" height="112" viewBox="0 0 180 120" fill="none" aria-hidden="true">
      {/* Raios laranjas no canto superior direito */}
      <line x1="150" y1="18" x2="155" y2="5" stroke="#ef5a0c" strokeWidth="3.4" strokeLinecap="round" />
      <line x1="158" y1="24" x2="169" y2="14" stroke="#ef5a0c" strokeWidth="3.4" strokeLinecap="round" />
      <line x1="161" y1="32" x2="174" y2="29" stroke="#ef5a0c" strokeWidth="3.4" strokeLinecap="round" />
      {/* Corpo da tela do notebook */}
      <rect x="26" y="22" width="122" height="78" rx="7" fill="#430b23" />
      <rect x="32" y="28" width="110" height="66" rx="3.5" fill="#fff8f2" />
      {/* Ícone da loja dentro da tela */}
      <path d="M68 58V80C68 81.1 68.9 82 70 82H104C105.1 82 106 81.1 106 80V58" stroke="#430b23" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="#ffffff" />
      <path d="M81 82V67H93V82" stroke="#430b23" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M63 53L68 41H106L111 53" fill="#ef5a0c" stroke="#ef5a0c" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M63 53C63 56.5 65.7 59.2 69 59.2C72.3 59.2 75 56.5 75 53C75 56.5 77.7 59.2 81 59.2C84.3 59.2 87 56.5 87 53C87 56.5 89.7 59.2 93 59.2C96.3 59.2 99 56.5 99 53C99 56.5 101.7 59.2 105 59.2C108.3 59.2 111 56.5 111 53H63Z" fill="#ef5a0c" />
      <line x1="75.5" y1="41" x2="74.5" y2="54" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <line x1="87" y1="41" x2="87" y2="54" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <line x1="98.5" y1="41" x2="99.5" y2="54" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      {/* Base do notebook */}
      <path d="M12 100H162C162 104.4 158.4 107 154 107H20C15.6 107 12 104.4 12 100Z" fill="#430b23" />
      <rect x="74" y="100" width="26" height="3" rx="1.5" fill="#7d3a57" />
    </svg>
  );
}

export default function RestaurantsLanding() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_LIST.map(item => ({
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
      { '@type': 'ListItem', position: 2, name: 'Para restaurantes', item: `${siteOrigin}/para-restaurantes` },
    ],
  };

  return (
    <div className="rest-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([faqSchema, breadcrumbSchema]).replace(/</g, '\\u003c') }}
      />
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>

      {/* Cabeçalho Superior */}
      <header className="rest-topbar">
        <div className="rest-topbar-inner">
          <div className="rest-topbar-left">
            <a className="rest-brand-link" href="/" aria-label="FOODDF, início">
              <Image
                src="/images/home/fooddf-logo-hd.webp"
                alt="FOODDF"
                width={172}
                height={46}
                quality={95}
                preload
                className="rest-brand-logo"
              />
            </a>
            <span className="rest-topbar-divider" aria-hidden="true" />
            <nav className="rest-topbar-nav" aria-label="Seções da página">
              <a href="#vantagens">Vantagens</a>
              <a href="#como-funciona">Como funciona</a>
            </nav>
          </div>

          <div className="rest-topbar-right">
            <a className="rest-login-link" href="/painel">
              Entrar
            </a>
            <a className="rest-register-pill" href="/painel?cadastro=1">
              <span>Cadastrar restaurante</span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </header>

      <main id="conteudo" className="rest-main">
        {/* Seção 1: Hero Full-Bleed */}
        <section className="rest-hero" aria-label="Apresentação para restaurantes">
          <div className="rest-hero-photo">
            <Image
              src="/images/para-restaurantes/hero-chef-restaurante.webp"
              alt="Chef preparando hambúrguer artesanal na cozinha iluminada do seu restaurante"
              fill
              sizes="(max-width: 920px) 100vw, 62vw"
              quality={90}
              preload
              className="rest-hero-img"
            />
            <svg className="rest-hero-wave" viewBox="0 0 190 540" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 0L84 0C64 96 156 212 132 325C114 410 56 468 34 540L0 540Z" fill="#4a0b25" />
            </svg>
          </div>

          <div className="rest-hero-container">
            <div className="rest-hero-copy">
              <p className="rest-hero-kicker">FOODDF para restaurantes</p>
              <h1 className="rest-hero-title">
                Seu próximo
                <br />
                cliente pode estar
                <span>no seu bairro.</span>
              </h1>
              <p className="rest-hero-subtitle">
                Tenha um cardápio digital 100% grátis e<br />
                receba pedidos pelo WhatsApp.
              </p>
              <a className="rest-primary-pill" href="/painel?cadastro=1">
                <span>Cadastrar meu restaurante grátis</span>
                <ArrowRight size={19} strokeWidth={2.5} />
              </a>
            </div>
          </div>
        </section>

        {/* Seção 2: Um cardápio que abre o apetite + Mockup 3D do Smartphone */}
        <section id="vantagens" className="rest-appetite-section" aria-labelledby="apetite-heading">
          <div className="rest-appetite-inner">
            {/* Coluna Esquerda: Mockup 3D do Smartphone */}
            <div className="rest-phone-stage" aria-hidden="true">
              <div className="rest-phone-foliage" />
              <div className="rest-phone-chassis">
                <div className="rest-phone-bezel">
                  <div className="rest-phone-screen">
                    <div className="rest-phone-statusbar">
                      <span>17:20</span>
                      <div className="rest-phone-island" />
                      <div className="rest-phone-signals">
                        <i />
                        <i />
                        <b />
                      </div>
                    </div>

                    <div className="rest-phone-header">
                      <Menu size={17} strokeWidth={2.4} />
                      <strong>Cardápio</strong>
                      <div className="rest-phone-header-icons">
                        <Search size={16} strokeWidth={2.3} />
                        <span className="rest-phone-bag">
                          <ShoppingBag size={16} strokeWidth={2.3} />
                          <em>2</em>
                        </span>
                      </div>
                    </div>

                    <div className="rest-phone-tabs">
                      <span className="active">Destaques</span>
                      <span>Burgers</span>
                      <span>Pizzas</span>
                      <span>Pratos</span>
                    </div>

                    <div className="rest-phone-cards">
                      {PHONE_ITEMS.map(item => (
                        <div key={item.name} className="rest-phone-item">
                          <Image
                            src={item.image}
                            alt={item.alt}
                            width={180}
                            height={180}
                            sizes="110px"
                            quality={90}
                            className="rest-phone-item-img"
                          />
                          <div className="rest-phone-item-body">
                            <strong>{item.name}</strong>
                            <small>{item.desc}</small>
                            <div className="rest-phone-item-foot">
                              <span>{item.price}</span>
                              <i>
                                <Plus size={12} strokeWidth={3} />
                              </i>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Vantagens */}
            <div className="rest-appetite-copy">
              <h2 id="apetite-heading" className="rest-display-heading rest-appetite-heading">
                Um cardápio que
                <br />
                <span>
                  abre o apetite.
                  <SparkBurst />
                </span>
              </h2>

              <ul className="rest-feature-list">
                <li>
                  <span className="rest-feature-icon">
                    <FeaturePhotoIcon />
                  </span>
                  <div>
                    <h3>Valorize seus pratos</h3>
                    <p>
                      Organize fotos, preços e categorias
                      <br />
                      em um só lugar.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="rest-feature-icon">
                    <FeatureRegionIcon />
                  </span>
                  <div>
                    <h3>Seja encontrado na região</h3>
                    <p>
                      Quem procura onde comer pode
                      <br />
                      descobrir sua loja.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="rest-feature-icon">
                    <FeatureWhatsappIcon />
                  </span>
                  <div>
                    <h3>Receba pedidos pelo WhatsApp</h3>
                    <p>
                      Combine pagamento, <strong>entrega</strong> ou
                      <br />
                      retirada com o cliente.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Seção 3: Cadastro fácil, em três passos */}
        <section id="como-funciona" className="rest-steps-band" aria-labelledby="passos-heading">
          <div className="rest-container">
            <div className="rest-centered-title-wrap">
              <h2 id="passos-heading" className="rest-display-heading rest-steps-heading">
                <span>Cadastro fácil, em três passos</span>
                <SparkBurst />
              </h2>
            </div>

            <ol className="rest-three-steps">
              <li className="rest-step-item">
                <div className="rest-step-badge">
                  <StepStoreIcon />
                </div>
                <div className="rest-step-copy">
                  <h3>Cadastre sua loja</h3>
                  <p>Informe os dados do seu estabelecimento.</p>
                </div>
              </li>

              <li className="rest-step-arrow" aria-hidden="true">
                <ChevronRight size={24} strokeWidth={2.5} />
              </li>

              <li className="rest-step-item">
                <div className="rest-step-badge">
                  <StepMenuBoardIcon />
                </div>
                <div className="rest-step-copy">
                  <h3>Monte seu cardápio</h3>
                  <p>Adicione seus pratos, fotos, preços e categorias.</p>
                </div>
              </li>

              <li className="rest-step-arrow" aria-hidden="true">
                <ChevronRight size={24} strokeWidth={2.5} />
              </li>

              <li className="rest-step-item">
                <div className="rest-step-badge">
                  <StepPublishRegionIcon />
                </div>
                <div className="rest-step-copy">
                  <h3>Publique na sua região</h3>
                  <p>Deixe seu cardápio visível para novos clientes no bairro.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* Seção 4 + 5: Painel do Estabelecimento & Perguntas Frequentes */}
        <div className="rest-middle-zone">
          <div className="rest-container">
            <section className="rest-panel-card" aria-labelledby="acompanhe-heading">
              <div className="rest-panel-art">
                <LaptopStoreIllustration />
              </div>
              <div className="rest-panel-text">
                <h2 id="acompanhe-heading" className="rest-display-heading">
                  Você acompanha o seu estabelecimento
                </h2>
                <p>
                  No seu painel, gerencie produtos, fotos e preços. Sua equipe confirma a disponibilidade dos itens, o
                  pedido e o pagamento diretamente com o cliente.
                </p>
              </div>
            </section>

            <section className="rest-faq-section" aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="rest-display-heading rest-faq-heading">
                <span>Perguntas frequentes</span>
                <SparkBurst />
              </h2>

              <div className="rest-faq-grid">
                {FAQ_LIST.map(item => (
                  <article key={item.question} className="rest-faq-card">
                    <h3>{item.question}</h3>
                    <p>{item.answer}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Seção 6: CTA Final R$ 0 */}
        <section className="rest-bottom-cta" aria-labelledby="cta-zero-heading">
          <div className="rest-container">
            <h2 id="cta-zero-heading" className="rest-zero-title">
              Seu cardápio no ar por <span>R$ 0.</span>
            </h2>
            <a className="rest-primary-pill rest-bottom-pill" href="/painel?cadastro=1">
              <span>Criar meu cardápio grátis</span>
              <ArrowRight size={20} strokeWidth={2.5} />
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
