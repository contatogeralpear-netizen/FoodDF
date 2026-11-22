'use client';

import React from 'react';

export function Skeleton({
  className = '',
  width,
  height,
  borderRadius,
  style,
}: {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`skeleton-box ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="restaurant-card skeleton-restaurant-card" aria-hidden="true">
      {/* Capa com shimmer */}
      <div className="skeleton-photo-box">
        <Skeleton width="100%" height="100%" borderRadius="0" />
      </div>

      <div className="restaurant-info skeleton-info">
        <div className="skeleton-logo-circle">
          <Skeleton width={44} height={44} borderRadius={11} />
        </div>
        <div style={{ flex: 1 }}>
          <Skeleton width="70%" height={20} borderRadius={6} style={{ marginBottom: 8 }} />
          <Skeleton width="90%" height={12} borderRadius={4} />
        </div>
      </div>

      <div className="restaurant-meta skeleton-meta">
        <Skeleton width="35%" height={12} borderRadius={4} />
        <Skeleton width="30%" height={12} borderRadius={4} />
      </div>

      <div className="restaurant-bottom skeleton-bottom">
        <Skeleton width={75} height={24} borderRadius={8} />
        <Skeleton width={80} height={14} borderRadius={4} style={{ marginLeft: 'auto' }} />
      </div>
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <div className="catalog-wrapper skeleton-wrapper" role="status" aria-label="Carregando restaurantes...">
      <div className="catalog-main">
        {/* Skeleton do Título */}
        <div className="catalog-hero" style={{ marginBottom: 28 }}>
          <Skeleton width={180} height={14} borderRadius={4} style={{ marginBottom: 12 }} />
          <Skeleton width="65%" height={38} borderRadius={8} style={{ marginBottom: 12 }} />
          <Skeleton width="45%" height={18} borderRadius={6} />
        </div>

        {/* Skeleton dos Filtros */}
        <div className="catalog-filters-card skeleton-filters-card">
          <div className="filters-grid">
            <div>
              <Skeleton width={80} height={14} borderRadius={4} style={{ marginBottom: 8 }} />
              <Skeleton width="100%" height={46} borderRadius={12} />
            </div>
            <div>
              <Skeleton width={60} height={14} borderRadius={4} style={{ marginBottom: 8 }} />
              <Skeleton width="100%" height={46} borderRadius={12} />
            </div>
            <div>
              <Skeleton width={120} height={14} borderRadius={4} style={{ marginBottom: 8 }} />
              <Skeleton width="100%" height={46} borderRadius={12} />
            </div>
          </div>

          <div className="catalog-sort-bar" style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <Skeleton width={140} height={36} borderRadius={20} />
              <Skeleton width={110} height={36} borderRadius={20} />
            </div>
            <Skeleton width={160} height={16} borderRadius={4} />
          </div>
        </div>

        {/* Grid de Cards Skeleton */}
        <div className="restaurant-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function MenuSkeleton() {
  return (
    <div className="store-layout skeleton-menu-layout" role="status" aria-label="Carregando cardápio...">
      <div className="store-content">
        <div className="store-heading" style={{ display: 'flex', gap: 17, marginBottom: 23 }}>
          <Skeleton width={72} height={72} borderRadius={16} />
          <div style={{ flex: 1 }}>
            <Skeleton width="50%" height={32} borderRadius={6} style={{ marginBottom: 10 }} />
            <Skeleton width="30%" height={14} borderRadius={4} />
          </div>
        </div>

        <div style={{ height: 212, borderRadius: 20, overflow: 'hidden', marginBottom: 24 }}>
          <Skeleton width="100%" height="100%" borderRadius={20} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} width={90} height={38} borderRadius={9} />
          ))}
        </div>

        <div className="product-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="product-card skeleton-product-card" style={{ padding: 12 }}>
              <Skeleton width="100%" height={120} borderRadius={10} style={{ marginBottom: 12 }} />
              <Skeleton width="80%" height={18} borderRadius={4} style={{ marginBottom: 8 }} />
              <Skeleton width="100%" height={12} borderRadius={4} style={{ marginBottom: 6 }} />
              <Skeleton width="40%" height={12} borderRadius={4} style={{ marginBottom: 16 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton width={70} height={22} borderRadius={6} />
                <Skeleton width={34} height={32} borderRadius={8} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
