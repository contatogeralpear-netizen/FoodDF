'use client';

import { money } from '@/lib/domain';
import { FoodImage } from './food-image';

export interface PromoBannerProps {
  title: string;
  info?: string;
  priceFrom?: number | null;
  priceTo?: number | null;
  image?: string | null;
  fallbackCover?: string | null;
  link?: string;
  onActivateLink?: (link: string) => void;
  preview?: boolean;
}

function PromoSparks() {
  return (
    <svg
      className="promo-banner-sparks"
      width="26"
      height="24"
      viewBox="0 0 28 26"
      fill="none"
      aria-hidden="true"
    >
      <line x1="5" y1="14" x2="9" y2="3" stroke="#ff6b1a" strokeWidth="3.2" strokeLinecap="round" />
      <line x1="12" y1="18" x2="21" y2="9" stroke="#ff6b1a" strokeWidth="3.2" strokeLinecap="round" />
      <line x1="15" y1="23" x2="25" y2="20" stroke="#ff6b1a" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

export function PromoHeroBanner({
  title,
  info,
  priceFrom,
  priceTo,
  image,
  fallbackCover,
  link,
  onActivateLink,
  preview = false,
}: PromoBannerProps) {
  const cleanLink = (link || '').trim();
  const clickable = Boolean(cleanLink && !preview);

  const content = (
    <>
      <div className="store-promo-photo">
        <FoodImage
          kind={image || fallbackCover || '/images/store/banner-prato-da-casa.webp'}
          label={title || 'Promoção em destaque'}
        />
      </div>

      <svg
        className="store-promo-curve"
        viewBox="0 0 520 340"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 0 L415 0 Q518 168 392 340 L0 340 Z" fill="#490b27" />
      </svg>

      <div className="store-promo-copy">
        <div className="store-promo-kicker">
          <em>Promoção</em>
          <PromoSparks />
        </div>

        <h2 className="store-promo-title">{title || 'Título da promoção'}</h2>

        {info && <p className="store-promo-info">{info.slice(0, 45)}</p>}

        {typeof priceFrom === 'number' && priceFrom > 0 && (
          <div className="store-promo-from">
            <span>De</span>
            <del>{money(priceFrom)}</del>
          </div>
        )}

        {typeof priceTo === 'number' && priceTo > 0 && (
          <div className="store-promo-to-pill">
            <span>Por</span>
            <strong>{money(priceTo)}</strong>
          </div>
        )}
      </div>
    </>
  );

  if (clickable) {
    return (
      <a
        href={cleanLink}
        className="store-promo-banner is-clickable"
        aria-label={`Ver refeição em promoção: ${title}`}
        onClick={e => {
          if (onActivateLink) {
            const handled = onActivateLink(cleanLink);
            if (handled !== undefined) e.preventDefault();
          }
        }}
      >
        {content}
      </a>
    );
  }

  return (
    <section className="store-promo-banner" aria-label={`Destaque: ${title || 'Promoção'}`}>
      {content}
    </section>
  );
}
