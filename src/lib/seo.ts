const productionOrigin = 'https://fooddf.com.br';

/** Canonical URLs always use the configured public origin, never a request Host header. */
export const siteOrigin = (() => {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.FOODDF_SITE_URL || productionOrigin);
    return url.protocol === 'https:' ? url.origin : productionOrigin;
  } catch {
    return productionOrigin;
  }
})();

/** Default Open Graph / SEO image (1200×630). */
export const defaultOgImage = `${siteOrigin}/og-image.png`;

/** Shared robots config for indexable pages. */
export const indexableRobots = {
  index: true as const,
  follow: true as const,
  googleBot: {
    index: true as const,
    follow: true as const,
    'max-image-preview': 'large' as const,
    'max-snippet': -1,
    'max-video-preview': -1,
  },
};

/** Site name used in OG metadata. */
export const siteName = 'FOODDF';

/** Shared OG defaults. */
export function ogDefaults(path: string, title: string, description: string) {
  return {
    title,
    description,
    url: path,
    siteName,
    locale: 'pt_BR',
    type: 'website' as const,
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'FOODDF — Cardápios e restaurantes por cidade' }],
  };
}

/** Shared Twitter card defaults. */
export const twitterDefaults = {
  card: 'summary_large_image' as const,
  site: '@fooddf',
  images: [defaultOgImage],
};
