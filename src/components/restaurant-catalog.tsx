'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Bike, ChefHat, CheckCircle2, ChevronDown, MapPin, Search, Star, Store, X, ArrowLeft, Filter } from 'lucide-react';
import { FoodImage } from './food-image';
import TrackOrder from './track-order';
import { states, money, restaurantPath, type Restaurant } from '@/lib/domain';
import { allMunicipalities } from '@/lib/locations';

export default function RestaurantCatalog({
  initialRestaurants = [],
  initialUf = 'DF',
  initialCity = 'Brasília',
}: {
  initialRestaurants: Restaurant[];
  initialUf?: string;
  initialCity?: string;
}) {
  const [selectedUf, setSelectedUf] = useState<string>(initialUf);
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'relevance' | 'rating'>('rating');
  const [tracking, setTracking] = useState<boolean>(false);

  // Lista dinâmica de cidades do estado selecionado
  const citiesForState = useMemo(() => {
    if (!selectedUf) {
      // Se nenhum estado específico selecionado, reúne cidades com restaurantes
      return [...new Set(initialRestaurants.map(r => r.city))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    }
    return allMunicipalities
      .filter(m => m.state.toUpperCase() === selectedUf.toUpperCase())
      .map(m => m.name)
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [selectedUf, initialRestaurants]);

  // Filtragem e Ordenação
  const filteredAndSortedRestaurants = useMemo(() => {
    let list = [...initialRestaurants];

    // 1. Filtragem por Estado (UF)
    if (selectedUf) {
      list = list.filter(r => r.state.toUpperCase() === selectedUf.toUpperCase());
    }

    // 2. Filtragem por Cidade
    if (selectedCity) {
      list = list.filter(r => r.city.toLocaleLowerCase('pt-BR') === selectedCity.toLocaleLowerCase('pt-BR'));
    }

    // 3. Filtragem por Busca de Texto
    if (search.trim()) {
      const q = search.trim().toLocaleLowerCase('pt-BR');
      list = list.filter(r =>
        r.name.toLocaleLowerCase('pt-BR').includes(q) ||
        (r.cuisine && r.cuisine.toLocaleLowerCase('pt-BR').includes(q)) ||
        (r.description && r.description.toLocaleLowerCase('pt-BR').includes(q))
      );
    }

    // 4. Ordenação
    if (sortBy === 'rating') {
      // Filtragem por Maior Avaliação (do maior para o menor)
      list.sort((a, b) => {
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
      });
    } else {
      // Filtragem por Relevância (Abertos primeiro, depois mais avaliados, depois nome)
      list.sort((a, b) => {
        if (a.isOpen && !b.isOpen) return -1;
        if (!a.isOpen && b.isOpen) return 1;
        if ((b.reviewCount ?? 0) !== (a.reviewCount ?? 0)) {
          return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
        }
        return a.name.localeCompare(b.name, 'pt-BR');
      });
    }

    return list;
  }, [initialRestaurants, selectedUf, selectedCity, search, sortBy]);

  function handleUfChange(newUf: string) {
    setSelectedUf(newUf);
    setSelectedCity(''); // Reseta a cidade para permitir ver todas as cidades do estado
  }

  return (
    <div className="catalog-wrapper">
      <header className="header">
        <div className="header-inner">
          <a className="brand" href="/" aria-label="FOODDF, início">
            <span className="brand-icon"><ChefHat /></span>
            FOOD<span>DF.</span>
          </a>
          <nav className="header-nav">
            <a className="header-nav-link" href="/">Início</a>
            <a className="header-nav-link" href="/como-funciona">Como funciona</a>
            <a className="header-nav-link" href="/para-restaurantes">Para restaurantes</a>
            <button className="header-cta-button" onClick={() => setTracking(true)}>
              Acompanhar Pedido
            </button>
          </nav>
        </div>
      </header>

      <main className="catalog-main">
        {/* Cabeçalho do Catálogo */}
        <section className="catalog-hero">
          <div className="catalog-hero-content">
            <span className="catalog-eyebrow">RESTAURANTES E CARDÁPIOS</span>
            <h1 className="catalog-title">Escolha seu restaurante e peça direto pelo WhatsApp</h1>
            <p className="catalog-subtitle">
              Filtre por estado, cidades e ordene por maior avaliação para saborear o melhor da gastronomia sem taxas abusivas.
            </p>
          </div>
        </section>

        {/* Barra de Filtros e Controles */}
        <section className="catalog-filters-card" aria-label="Filtros de restaurantes">
          <div className="filters-grid">
            {/* Filtro de Estado (UF) */}
            <div className="filter-group">
              <label htmlFor="filter-uf"><span>Estado (UF)</span></label>
              <div className="select-container">
                <select
                  id="filter-uf"
                  value={selectedUf}
                  onChange={e => handleUfChange(e.target.value)}
                  aria-label="Filtrar por Estado"
                >
                  <option value="">Todos os Estados</option>
                  {states.map(([uf, name]) => (
                    <option key={uf} value={uf}>{name} ({uf})</option>
                  ))}
                </select>
                <ChevronDown size={16} className="select-arrow" />
              </div>
            </div>

            {/* Filtro de Cidade */}
            <div className="filter-group">
              <label htmlFor="filter-city"><span>Cidade</span></label>
              <div className="select-container">
                <select
                  id="filter-city"
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  aria-label="Filtrar por Cidade"
                >
                  <option value="">{selectedUf ? 'Todas as cidades de ' + selectedUf : 'Todas as cidades'}</option>
                  {citiesForState.map(cityName => (
                    <option key={cityName} value={cityName}>{cityName}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="select-arrow" />
              </div>
            </div>

            {/* Busca por Nome ou Culinária */}
            <div className="filter-group search-group">
              <label htmlFor="filter-search"><span>Buscar restaurante</span></label>
              <div className="catalog-search-input">
                <Search size={18} className="search-icon" />
                <input
                  id="filter-search"
                  placeholder="Nome, hambúrguer, pizza..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Buscar restaurante ou tipo de culinária"
                />
                {search && (
                  <button className="clear-search" onClick={() => setSearch('')} aria-label="Limpar busca">
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Abas de Ordenação: Relevância vs Maior Avaliação */}
          <div className="catalog-sort-bar">
            <div className="sort-label">
              <Filter size={16} />
              <span>Ordenar por:</span>
            </div>
            <div className="sort-buttons" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={sortBy === 'rating'}
                className={`sort-pill ${sortBy === 'rating' ? 'selected' : ''}`}
                onClick={() => setSortBy('rating')}
              >
                <Star size={16} fill={sortBy === 'rating' ? '#ffb800' : 'none'} color={sortBy === 'rating' ? '#ffb800' : 'currentColor'} />
                <span>Maior Avaliação</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={sortBy === 'relevance'}
                className={`sort-pill ${sortBy === 'relevance' ? 'selected' : ''}`}
                onClick={() => setSortBy('relevance')}
              >
                <span>Relevância</span>
              </button>
            </div>

            <div className="results-count">
              <span>{filteredAndSortedRestaurants.length} {filteredAndSortedRestaurants.length === 1 ? 'restaurante encontrado' : 'restaurantes encontrados'}</span>
            </div>
          </div>
        </section>

        {/* Grid de Restaurantes */}
        <section className="catalog-list-section" aria-label="Lista de restaurantes">
          {filteredAndSortedRestaurants.length > 0 ? (
            <div className="restaurant-grid">
              {filteredAndSortedRestaurants.map(r => (
                <a className="restaurant-card" key={r.id} href={restaurantPath(r.slug)}>
                  <div className="restaurant-photo">
                    <FoodImage kind={r.cover || 'hero'} label={`Cardápio de ${r.name}`} />
                    {r.isDemo && <span className="demo-label">Restaurante modelo</span>}
                    <span className="restaurant-photo-arrow"><ArrowRight size={21} /></span>
                  </div>

                  <div className="restaurant-info">
                    <div className="restaurant-card-logo">
                      <FoodImage kind={r.logo || 'logo'} label={r.name} />
                    </div>
                    <div>
                      <div className="restaurant-title-row">
                        <h3>{r.name}</h3>
                      </div>
                      <p>{r.description || r.cuisine || 'Conheça o cardápio e faça seu pedido direto pelo WhatsApp.'}</p>
                    </div>
                  </div>

                  {/* Avaliação e Localização */}
                  <div className="restaurant-meta">
                    <span><MapPin size={14} />{r.city} / {r.state}</span>
                    <span><Bike size={16} />Entrega {r.deliveryFee ? money(r.deliveryFee) : 'Grátis'}</span>
                  </div>

                  <div className="restaurant-bottom">
                    <div className="restaurant-rating-badge" aria-label={`Avaliação ${r.rating ?? 4.9} estrelas`}>
                      <Star size={15} fill="#ffb800" color="#ffb800" />
                      <strong>{(r.rating ?? 4.9).toFixed(1)}</strong>
                      <small>({r.reviewCount ?? 1})</small>
                    </div>
                    <span className="open-status">
                      <span className="open-dot" />
                      {r.isOpen !== false ? 'Aberto agora' : 'Fechado'}
                    </span>
                    <span className="view-menu-link">
                      Ver cardápio <ArrowRight size={14} />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="empty-catalog-card">
              <Store size={44} color="#a08394" />
              <h3>Ainda não há restaurantes nesta região</h3>
              <p>
                {selectedCity
                  ? `Não encontramos estabelecimentos cadastrados em ${selectedCity} (${selectedUf}).`
                  : `Não encontramos estabelecimentos cadastrados no estado ${selectedUf}.`}
              </p>
              <div className="empty-actions">
                <button
                  className="button primary"
                  onClick={() => { setSelectedUf('DF'); setSelectedCity('Brasília'); setSearch(''); }}
                >
                  Ver Restaurantes no Distrito Federal (DF)
                </button>
                <a className="button outline" href="/para-restaurantes">
                  Cadastrar Meu Restaurante Grátis
                </a>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <a className="brand" href="/">FOOD<span>DF</span><i /></a>
        <p>Sabores que aproximam. Pedidos que simplificam.</p>
        <a href="/para-restaurantes">Para restaurantes</a>
        <a href="/como-funciona">Como funciona</a>
        <a href="/cidades">Cidades e estados</a>
        <a href="/cidades/df/brasilia">Restaurantes em Brasília</a>
        <span>Feito para quem ama comer bem.</span>
      </footer>

      {tracking && <TrackOrder onClose={() => setTracking(false)} />}
    </div>
  );
}
