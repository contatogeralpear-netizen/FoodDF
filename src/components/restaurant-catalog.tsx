'use client';

import Image from 'next/image';
import SiteFooter from './footer';

import { useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, MapPin, Search, Star, X } from 'lucide-react';
import { states, money, restaurantPath, type Restaurant } from '@/lib/domain';
import { getCitiesForState } from '@/lib/locations';

const BROWSE_CATEGORIES = [
  {
    id: 'hamburgueres',
    label: 'Hambúrgueres',
    query: 'Hambúrguer',
    image: '/images/home/cat-hamburgueres.webp',
    alt: 'Hambúrguer artesanal com queijo cheddar derretido e bacon crocante',
  },
  {
    id: 'pizzas',
    label: 'Pizzas',
    query: 'Pizza',
    image: '/images/home/cat-pizzas.webp',
    alt: 'Pizza artesanal assada no forno a lenha com queijo puxando',
  },
  {
    id: 'comida-brasileira',
    label: 'Comida brasileira',
    query: 'Brasileira',
    image: '/images/home/cat-comida-brasileira.webp',
    alt: 'Prato típico de comida brasileira com arroz, feijão, couve, farofa e laranja',
  },
  {
    id: 'acai',
    label: 'Açaí',
    query: 'Açaí',
    image: '/images/home/cat-acai.webp',
    alt: 'Tigela de açaí cremoso com banana, granola e morangos frescos',
  },
  {
    id: 'doces',
    label: 'Doces',
    query: 'Doces',
    image: '/images/home/cat-doces.webp',
    alt: 'Fatia de bolo de chocolate com recheio cremoso e granulado de brigadeiro',
  },
] as const;

const SHOWCASE_EXAMPLES = [
  {
    id: 'example-ipe',
    name: 'Restaurante Ipê',
    image: '/images/buscas/card-restaurante-ipe.webp',
    alt: 'Prato executivo do Restaurante Ipê com picanha grelhada, arroz, batata frita e salada',
    href: '/restaurantes/brasa-burger',
    keywords: 'restaurante ipê ipe comida brasileira prato executivo carne picanha almoço refeição',
  },
  {
    id: 'example-praca',
    name: 'Pizzaria da Praça',
    image: '/images/buscas/card-pizzaria-praca.webp',
    alt: 'Pizza artesanal assada no forno a lenha da Pizzaria da Praça',
    href: '/restaurantes/brasa-burger',
    keywords: 'pizzaria da praça praca pizza pizzas marguerita massa forno a lenha',
  },
  {
    id: 'example-vila',
    name: 'Lanches da Vila',
    image: '/images/buscas/card-lanches-vila.webp',
    alt: 'Hambúrguer artesanal com bacon, cheddar e batata frita do Lanches da Vila',
    href: '/restaurantes/brasa-burger',
    keywords: 'lanches da vila hambúrguer hamburguer hamburgueres burger lanche batata bacon',
  },
] as const;

function SparkBurst() {
  return (
    <svg className="home-heading-sparks" width="28" height="26" viewBox="0 0 28 26" fill="none" aria-hidden="true">
      <line x1="5" y1="14" x2="9" y2="3" stroke="#f26716" strokeWidth="3.2" strokeLinecap="round" />
      <line x1="12" y1="18" x2="21" y2="9" stroke="#f26716" strokeWidth="3.2" strokeLinecap="round" />
      <line x1="15" y1="23" x2="25" y2="20" stroke="#f26716" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

function fallbackCoverForCuisine(cuisine?: string | null): string {
  const c = (cuisine || '').toLocaleLowerCase('pt-BR');
  if (c.includes('pizza')) return '/images/buscas/card-pizzaria-praca.webp';
  if (c.includes('hamb') || c.includes('burger') || c.includes('lanche')) return '/images/buscas/card-lanches-vila.webp';
  if (c.includes('açaí') || c.includes('acai')) return '/images/home/cat-acai.webp';
  if (c.includes('doce') || c.includes('confeitaria') || c.includes('bolo')) return '/images/home/cat-doces.webp';
  return '/images/buscas/card-restaurante-ipe.webp';
}

export default function RestaurantCatalog({
  initialRestaurants = [],
  initialUf = 'DF',
  initialCity = 'Brasília',
  initialQuery = '',
}: {
  initialRestaurants: Restaurant[];
  initialUf?: string;
  initialCity?: string;
  initialQuery?: string;
}) {
  const [selectedUf, setSelectedUf] = useState<string>(initialUf);
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [search, setSearch] = useState<string>(initialQuery);
  const filterSectionRef = useRef<HTMLElement>(null);
  const resultsSectionRef = useRef<HTMLElement>(null);
  const ufSelectRef = useRef<HTMLSelectElement>(null);

  const citiesForState = useMemo(() => {
    if (!selectedUf) {
      return [...new Set(initialRestaurants.map(r => r.city))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    }
    return getCitiesForState(selectedUf);
  }, [selectedUf, initialRestaurants]);

  // Restaurantes reais publicados (não-demo)
  const realFilteredRestaurants = useMemo(() => {
    let list = initialRestaurants.filter(r => !r.isDemo);

    if (selectedUf) {
      list = list.filter(r => r.state.toUpperCase() === selectedUf.toUpperCase());
    }
    if (selectedCity) {
      list = list.filter(r => r.city.toLocaleLowerCase('pt-BR') === selectedCity.toLocaleLowerCase('pt-BR'));
    }
    if (search.trim()) {
      const q = search.trim().toLocaleLowerCase('pt-BR');
      list = list.filter(
        r =>
          r.name.toLocaleLowerCase('pt-BR').includes(q) ||
          (r.cuisine && r.cuisine.toLocaleLowerCase('pt-BR').includes(q)) ||
          (r.description && r.description.toLocaleLowerCase('pt-BR').includes(q))
      );
    }

    list.sort((a, b) => {
      if (a.isOpen !== false && b.isOpen === false) return -1;
      if (a.isOpen === false && b.isOpen !== false) return 1;
      const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
      if (ratingDiff !== 0) return ratingDiff;
      return a.name.localeCompare(b.name, 'pt-BR');
    });

    return list;
  }, [initialRestaurants, selectedUf, selectedCity, search]);

  const filteredExamples = useMemo(() => {
    if (!search.trim()) return SHOWCASE_EXAMPLES;
    const q = search.trim().toLocaleLowerCase('pt-BR');
    const matched = SHOWCASE_EXAMPLES.filter(
      ex => ex.name.toLocaleLowerCase('pt-BR').includes(q) || ex.keywords.includes(q)
    );
    return matched.length > 0 ? matched : SHOWCASE_EXAMPLES;
  }, [search]);

  function handleUfChange(newUf: string) {
    setSelectedUf(newUf);
    const nextCities = getCitiesForState(newUf);
    if (newUf === 'DF' && nextCities.includes('Brasília')) {
      setSelectedCity('Brasília');
    } else {
      setSelectedCity('');
    }
  }

  function scrollToResults(e?: React.FormEvent) {
    if (e) e.preventDefault();
    resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleCategoryPick(query: string) {
    setSearch(prev => (prev.toLocaleLowerCase('pt-BR') === query.toLocaleLowerCase('pt-BR') ? '' : query));
    resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function focusLocationFilter() {
    filterSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => ufSelectRef.current?.focus(), 260);
  }

  const regionHeadingLabel = selectedCity
    ? selectedCity
    : selectedUf
      ? states.find(([code]) => code === selectedUf)?.[1] || selectedUf
      : 'destaque';

  const showingReal = realFilteredRestaurants.length > 0;

  return (
    <div className="home-landing-shell buscas-page-shell">
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
            <a className="home-nav-link is-active" href="/buscas" aria-current="page">
              Explorar cardápios
            </a>
            <a className="home-nav-link" href="/como-funciona">
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
              onClick={focusLocationFilter}
              aria-label={`Localização selecionada: ${selectedCity || 'Todas'}, ${selectedUf || 'BR'}. Clique para filtrar`}
            >
              <MapPin size={17} strokeWidth={2.4} />
              <span>
                {selectedCity || 'Todas'} {selectedUf ? `· ${selectedUf}` : ''}
              </span>
              <ChevronDown size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      <main id="conteudo" className="home-main">
        {/* Seção 1: Hero Banner Full-Bleed */}
        <section className="home-hero buscas-hero" aria-label="Explorar cardápios da sua região">
          <div className="home-hero-photo buscas-hero-photo">
            <Image
              src="/images/buscas/hero-buscas-brasilia.webp"
              alt="Pessoas saboreando pizza artesanal e hambúrguer ao ar livre em Brasília com a Catedral ao fundo"
              fill
              sizes="(max-width: 920px) 100vw, 64vw"
              quality={90}
              preload
              className="home-hero-img buscas-hero-img"
            />
            <svg className="home-hero-curve" viewBox="0 0 180 540" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 0L128 0Q168 190 48 540L0 540Z" fill="#4f0b27" />
            </svg>
          </div>

          <div className="home-hero-container">
            <div className="home-hero-copy buscas-hero-copy">
              <h1 className="home-hero-title buscas-hero-title">
                Explore os
                <br />
                cardápios
                <span>da sua região</span>
              </h1>
              <p className="home-hero-subtitle">
                Encontre restaurantes perto de você,
                <br />
                veja os cardápios completos e faça
                <br />
                seu pedido pelo WhatsApp.
              </p>
              <a className="home-hero-cta" href="#resultados-restaurantes" onClick={e => { e.preventDefault(); scrollToResults(); }}>
                <span>Explorar restaurantes agora</span>
                <ArrowRight size={20} strokeWidth={2.4} />
              </a>
            </div>
          </div>
        </section>

        {/* Seção 2: Barra de Busca e Filtros */}
        <section ref={filterSectionRef} className="buscas-filter-wrap" aria-label="Filtros de busca de restaurantes">
          <form className="buscas-filter-bar" onSubmit={scrollToResults}>
            <div className="buscas-filter-field">
              <label htmlFor="filter-uf">Estado</label>
              <div className="buscas-select-box">
                <select
                  ref={ufSelectRef}
                  id="filter-uf"
                  value={selectedUf}
                  onChange={e => handleUfChange(e.target.value)}
                  aria-label="Estado"
                >
                  <option value="">Todos os Estados</option>
                  {states.map(([uf, name]) => (
                    <option key={uf} value={uf}>
                      {name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={17} strokeWidth={2.3} aria-hidden="true" />
              </div>
            </div>

            <div className="buscas-filter-field">
              <label htmlFor="filter-city">Cidade</label>
              <div className="buscas-select-box">
                <select
                  id="filter-city"
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  aria-label="Cidade"
                >
                  <option value="">{selectedUf ? `Todas de ${selectedUf}` : 'Todas as cidades'}</option>
                  {citiesForState.map(cityName => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </select>
                <ChevronDown size={17} strokeWidth={2.3} aria-hidden="true" />
              </div>
            </div>

            <div className="buscas-filter-field buscas-search-field">
              <label htmlFor="filter-search">Nome do restaurante</label>
              <div className="buscas-input-box">
                <Search size={17} strokeWidth={2.3} className="buscas-input-icon" aria-hidden="true" />
                <input
                  id="filter-search"
                  type="text"
                  placeholder="Buscar por nome"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Nome do restaurante"
                />
                {search && (
                  <button
                    type="button"
                    className="buscas-clear-btn"
                    onClick={() => setSearch('')}
                    aria-label="Limpar busca"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            <button type="submit" className="buscas-submit-pill">
              Buscar restaurantes
            </button>
          </form>
        </section>

        {/* Seção 3: Escolha pelo que deu vontade */}
        <section className="home-cravings-section buscas-cravings-section" aria-labelledby="buscas-cravings-heading">
          <div className="home-section-inner">
            <h2 id="buscas-cravings-heading" className="home-section-heading">
              <span>Escolha pelo que deu vontade</span>
              <SparkBurst />
            </h2>
            <div className="home-categories-grid">
              {BROWSE_CATEGORIES.map(cat => {
                const isSelected = search.trim().toLocaleLowerCase('pt-BR') === cat.query.toLocaleLowerCase('pt-BR');
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryPick(cat.query)}
                    aria-pressed={isSelected}
                    className={`home-category-card buscas-category-btn ${isSelected ? 'is-selected' : ''}`}
                  >
                    <Image
                      src={cat.image}
                      alt={cat.alt}
                      width={540}
                      height={540}
                      sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 240px"
                      quality={90}
                      className="home-category-img"
                    />
                    <span className="home-category-shade" aria-hidden="true" />
                    <strong className="home-category-label">{cat.label}</strong>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Seção 4: Restaurantes na Região */}
        <section
          id="resultados-restaurantes"
          ref={resultsSectionRef}
          className="buscas-results-band"
          aria-labelledby="buscas-results-heading"
        >
          <div className="home-section-inner">
            <h2 id="buscas-results-heading" className="home-section-heading">
              <span>Restaurantes em {regionHeadingLabel}</span>
              <SparkBurst />
            </h2>
            <p className="buscas-results-subtitle">
              {showingReal
                ? `${realFilteredRestaurants.length} ${
                    realFilteredRestaurants.length === 1 ? 'restaurante disponível' : 'restaurantes disponíveis'
                  }`
                : 'Exemplo de resultados'}
            </p>

            {showingReal ? (
              <div className="buscas-cards-grid">
                {realFilteredRestaurants.map(r => {
                  const hasRemoteCover = Boolean(r.cover && r.cover.startsWith('https://'));
                  const fallbackSrc = fallbackCoverForCuisine(r.cuisine);
                  return (
                    <article key={r.id} className="buscas-store-card">
                      <a href={restaurantPath(r.slug)} className="buscas-store-photo-link" aria-label={`Abrir cardápio de ${r.name}`}>
                        {hasRemoteCover ? (
                          <img src={r.cover!} alt={`Pratos de ${r.name}`} className="buscas-store-img" loading="lazy" />
                        ) : (
                          <Image
                            src={fallbackSrc}
                            alt={`Pratos de ${r.name}`}
                            width={640}
                            height={380}
                            sizes="(max-width: 760px) 100vw, 380px"
                            quality={90}
                            className="buscas-store-img"
                          />
                        )}
                      </a>
                      <div className="buscas-store-body">
                        <div className="buscas-store-title-row">
                          <h3>{r.name}</h3>
                          {r.reviewCount && r.reviewCount > 0 ? (
                            <span className="buscas-store-rating" aria-label={`Nota ${r.rating?.toFixed(1)}`}>
                              <Star size={14} fill="#ffb800" color="#ffb800" />
                              {r.rating?.toFixed(1)}
                            </span>
                          ) : null}
                        </div>
                        {(r.cuisine || r.deliveryFee >= 0) && (
                          <p className="buscas-store-meta">
                            {r.cuisine || 'Cardápio digital'} ·{' '}
                            {r.deliveryFee > 0 ? `Entrega ${money(r.deliveryFee)}` : 'Frete Grátis'}
                          </p>
                        )}
                        <a href={restaurantPath(r.slug)} className="buscas-store-cta">
                          <span>Ver cardápio</span>
                          <ArrowRight size={17} strokeWidth={2.5} />
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="buscas-cards-grid">
                {filteredExamples.map(ex => (
                  <article key={ex.id} className="buscas-store-card">
                    <a href={ex.href} className="buscas-store-photo-link" aria-label={`Ver cardápio de ${ex.name}`}>
                      <Image
                        src={ex.image}
                        alt={ex.alt}
                        width={640}
                        height={380}
                        sizes="(max-width: 760px) 100vw, 380px"
                        quality={90}
                        className="buscas-store-img"
                      />
                    </a>
                    <div className="buscas-store-body">
                      <h3>{ex.name}</h3>
                      <a href={ex.href} className="buscas-store-cta">
                        <span>Ver cardápio</span>
                        <ArrowRight size={17} strokeWidth={2.5} />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
