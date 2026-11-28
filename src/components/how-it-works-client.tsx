'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronRight, ChevronUp, MapPin, X } from 'lucide-react';
import SiteFooter from '@/components/footer';
import { states } from '@/lib/domain';
import { getCitiesForState } from '@/lib/locations';

export type FaqItem = {
  question: string;
  answer: string;
};

function SparkBurst() {
  return (
    <svg className="home-heading-sparks" width="28" height="26" viewBox="0 0 28 26" fill="none" aria-hidden="true">
      <line x1="5" y1="14" x2="9" y2="3" stroke="#f26716" strokeWidth="3.2" strokeLinecap="round" />
      <line x1="12" y1="18" x2="21" y2="9" stroke="#f26716" strokeWidth="3.2" strokeLinecap="round" />
      <line x1="15" y1="23" x2="25" y2="20" stroke="#f26716" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

function StepRegionIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M9 33L16 28L24 31L32 28L39 33L31 39L24 36.5L17 39L9 33Z" stroke="#ef5a0c" strokeWidth="2.4" strokeLinejoin="round" fill="#fff3eb" />
      <path d="M24 31C24 31 33 22.2 33 15.5C33 10.5294 28.9706 6.5 24 6.5C19.0294 6.5 15 10.5294 15 15.5C15 22.2 24 31 24 31Z" fill="#ef5a0c" />
      <circle cx="24" cy="15.5" r="3.6" fill="#ffffff" />
    </svg>
  );
}

function StepRestaurantIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M11 22V38C11 39.1 11.9 40 13 40H35C36.1 40 37 39.1 37 38V22" stroke="#4a0e27" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="#fffaf6" />
      <path d="M20 40V29H28V40" stroke="#4a0e27" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 18L11.5 10H36.5L40 18" fill="#ef5a0c" stroke="#ef5a0c" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M8 18C8 20.5 9.8 22.5 12 22.5C14.2 22.5 16 20.5 16 18C16 20.5 17.8 22.5 20 22.5C22.2 22.5 24 20.5 24 18C24 20.5 25.8 22.5 28 22.5C30.2 22.5 32 20.5 32 18C32 20.5 33.8 22.5 36 22.5C38.2 22.5 40 20.5 40 18H8Z" fill="#ef5a0c" />
      <line x1="16.5" y1="10" x2="15.5" y2="19" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="24" y1="10" x2="24" y2="19" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="31.5" y1="10" x2="32.5" y2="19" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function StepMenuIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden="true">
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

function StepWhatsappIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24.2 8C15.36 8 8.2 15.12 8.2 23.9C8.2 26.82 9 29.55 10.38 31.9L8 40L16.35 37.68C18.64 38.94 21.33 39.8 24.2 39.8C33.04 39.8 40.2 32.68 40.2 23.9C40.2 15.12 33.04 8 24.2 8Z" stroke="#25d366" strokeWidth="3.1" strokeLinejoin="round" fill="#f3fdf6" />
      <path d="M19.3 16.8C18.9 15.9 18.45 15.88 18.05 15.86C17.72 15.84 17.35 15.84 16.98 15.84C16.6 15.84 16 15.98 15.5 16.52C14.98 17.08 13.55 18.42 13.55 21.15C13.55 23.88 15.55 26.52 15.82 26.9C16.1 27.26 19.68 33.08 25.35 35.3C30.06 37.15 31.02 36.78 32.04 36.68C33.06 36.58 35.34 35.34 35.8 34.04C36.26 32.74 36.26 31.62 36.12 31.38C35.98 31.15 35.61 31.01 35.05 30.73C34.5 30.45 31.76 29.1 31.25 28.92C30.74 28.73 30.37 28.64 30 29.2C29.63 29.75 28.56 31.01 28.24 31.38C27.91 31.75 27.59 31.8 27.03 31.52C26.47 31.24 24.68 30.65 22.55 28.76C20.9 27.28 19.78 25.46 19.45 24.9C19.13 24.34 19.42 24.04 19.7 23.76C19.95 23.51 20.26 23.11 20.54 22.79C20.82 22.46 20.91 22.23 21.1 21.86C21.28 21.48 21.19 21.16 21.05 20.88C20.91 20.6 19.83 17.85 19.3 16.8Z" fill="#25d366" transform="scale(0.84) translate(4.5 4.2)" />
    </svg>
  );
}

function StepReceiveIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M8 22.5L24 9.5L40 22.5" stroke="#4a0e27" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 19.5V37.5C12.5 38.6 13.4 39.5 14.5 39.5H33.5C34.6 39.5 35.5 38.6 35.5 37.5V19.5" stroke="#4a0e27" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 25H31L32.2 38.5H19.8L21 25Z" fill="#ef5a0c" stroke="#ef5a0c" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M23.5 25V23C23.5 21.5 24.6 20.3 26 20.3C27.4 20.3 28.5 21.5 28.5 23V25" stroke="#4a0e27" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

const HOW_STEPS = [
  { id: 'regiao', lines: ['Escolha', 'sua região'], Icon: StepRegionIcon },
  { id: 'restaurante', lines: ['Escolha o melhor', 'restaurante', 'para você'], Icon: StepRestaurantIcon },
  { id: 'cardapio', lines: ['Monte seu pedido', 'pelo cardápio', 'digital'], Icon: StepMenuIcon },
  { id: 'whatsapp', lines: ['Envie o pedido', 'pelo', 'WhatsApp'], Icon: StepWhatsappIcon },
  { id: 'receba', lines: ['Receba em casa', 'ou retire no', 'restaurante'], Icon: StepReceiveIcon },
] as const;

export default function HowItWorksClient({ faqs }: { faqs: readonly FaqItem[] }) {
  const [uf, setUf] = useState('DF');
  const [city, setCity] = useState('Brasília');
  const [locationOpen, setLocationOpen] = useState(false);
  const [openMap, setOpenMap] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(faqs.map((_, idx) => [idx, true]))
  );

  const cities = getCitiesForState(uf);

  const isDefaultRegion = uf === 'DF' && (!city || city === 'Brasília');
  const exploreHref = isDefaultRegion
    ? '/buscas'
    : `/buscas?uf=${encodeURIComponent(uf)}${city ? `&cidade=${encodeURIComponent(city)}` : ''}`;

  function toggleFaq(idx: number) {
    setOpenMap(prev => ({ ...prev, [idx]: !prev[idx] }));
  }

  return (
    <div className="home-landing-shell how-page-shell">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>

      {/* Cabeçalho Padrão Idêntico à Página Inicial */}
      <header className="header home-topbar">
        <div className="header-inner home-topbar-inner">
          <a className="brand home-brand-btn" href="/" aria-label="FOODDF, início">
            <Image
              src="/images/home/fooddf-logo-hd.webp"
              alt="FOODDF"
              width={176}
              height={47}
              quality={95}
              preload
              className="brand-logo-img"
            />
          </a>
          <span className="home-topbar-divider" aria-hidden="true" />
          <nav className="header-nav home-topbar-nav" aria-label="Navegação principal">
            <a className="home-nav-link" href={exploreHref}>
              Explorar cardápios
            </a>
            <a className="home-nav-link is-active" href="/como-funciona" aria-current="page">
              Como funciona
            </a>
            <a className="home-nav-link" href="/para-restaurantes">
              Para restaurantes
            </a>
          </nav>
          <div className="home-topbar-actions">
            <button
              className="home-location-pill"
              type="button"
              onClick={() => setLocationOpen(true)}
              aria-label={`Localização atual: ${city || 'Brasília'}, ${uf}. Clique para alterar`}
            >
              <MapPin size={17} strokeWidth={2.4} />
              <span>
                {city || 'Brasília'} · {uf}
              </span>
              <ChevronDown size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      <main id="conteudo" className="home-main">
        {/* Hero Banner Full-Bleed */}
        <section className="home-hero how-hero" aria-label="Como funciona o FOODDF">
          <div className="home-hero-photo how-hero-photo">
            <Image
              src="/images/como-funciona/hero-como-funciona.webp"
              alt="Cliente recebendo sacola de pedido em Brasília com a Catedral ao fundo"
              fill
              sizes="(max-width: 920px) 100vw, 64vw"
              quality={90}
              preload
              className="home-hero-img how-hero-img"
            />
            <svg className="home-hero-curve" viewBox="0 0 180 540" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 0L128 0C168 150 116 355 44 540L0 540Z" fill="#4f0b27" />
            </svg>
          </div>

          <div className="home-hero-container">
            <div className="home-hero-copy how-hero-copy">
              <h1 className="home-hero-title">
                Da sua cidade
                <span>para a sua mesa.</span>
              </h1>
              <p className="home-hero-subtitle">
                Escolha o que deseja e confirme o<br />
                pedido com o restaurante.
              </p>
              <a className="home-hero-cta" href={exploreHref}>
                <span>Explorar cardápios</span>
                <ArrowRight size={20} strokeWidth={2.4} />
              </a>
            </div>
          </div>
        </section>

        {/* Faixa Pêssego: Como pedir pelo FOODDF */}
        <section className="home-steps-section" aria-labelledby="how-steps-heading">
          <div className="home-section-inner">
            <h2 id="how-steps-heading" className="home-section-heading">
              <span>Como pedir pelo FOODDF</span>
              <SparkBurst />
            </h2>
            <ol className="home-steps-list">
              {HOW_STEPS.map((item, idx) => (
                <li key={item.id} className="home-step-entry">
                  <div className="home-step-card">
                    <div className="home-step-circle">
                      <item.Icon />
                    </div>
                    <p className="home-step-text">
                      {item.lines.map((line, i) => (
                        <span key={line}>
                          {line}
                          {i < item.lines.length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                  {idx < HOW_STEPS.length - 1 && (
                    <span className="home-step-chevron" aria-hidden="true">
                      <ChevronRight size={26} strokeWidth={2.6} />
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Seção: Dúvidas frequentes */}
        <section className="how-faq-section" aria-labelledby="duvidas-heading">
          <div className="how-faq-inner">
            <div className="how-faq-title-wrap">
              <h2 id="duvidas-heading" className="home-section-heading">
                <span>Dúvidas frequentes</span>
                <SparkBurst />
              </h2>
            </div>

            <div className="how-faq-stack">
              {faqs.map((item, idx) => {
                const isOpen = Boolean(openMap[idx]);
                return (
                  <article key={item.question} className={`how-faq-item ${isOpen ? 'is-open' : ''}`}>
                    <button
                      type="button"
                      className="how-faq-trigger"
                      aria-expanded={isOpen}
                      onClick={() => toggleFaq(idx)}
                    >
                      <div className="how-faq-text">
                        <h3>{item.question}</h3>
                        {isOpen && <p>{item.answer}</p>}
                      </div>
                      <span className="how-faq-chevron" aria-hidden="true">
                        {isOpen ? <ChevronUp size={24} strokeWidth={2.5} /> : <ChevronDown size={24} strokeWidth={2.5} />}
                      </span>
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />

      {locationOpen && (
        <div className="modal-backdrop modal-backdrop-top" onClick={() => setLocationOpen(false)}>
          <section
            className="modal location-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="how-location-title"
            onClick={e => e.stopPropagation()}
          >
            <button
              autoFocus
              className="modal-close icon-button"
              onClick={() => setLocationOpen(false)}
              aria-label="Fechar localização"
            >
              <X />
            </button>
            <span className="icon-tile">
              <MapPin size={28} />
            </span>
            <h2 id="how-location-title">Por onde vamos começar?</h2>
            <p>Encontre os restaurantes da sua região.</p>
            <label className="field">
              <span>Estado</span>
              <select
                value={uf}
                onChange={e => {
                  const nextUf = e.target.value;
                  setUf(nextUf);
                  setCity(nextUf === 'DF' ? 'Brasília' : '');
                }}
              >
                {states.map(([code, name]) => (
                  <option key={code} value={code}>
                    {name} ({code})
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Cidade</span>
              <select value={city} onChange={e => setCity(e.target.value)}>
                <option value="">Todas as cidades</option>
                {cities.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <a
              className="button primary wide"
              href={`/buscas?uf=${encodeURIComponent(uf)}&cidade=${encodeURIComponent(city || '')}`}
              onClick={() => setLocationOpen(false)}
            >
              Ver restaurantes
              <ArrowRight size={18} />
            </a>
          </section>
        </div>
      )}
    </div>
  );
}
