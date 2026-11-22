/**
 * Configuração canônica de origem e SEO para o FOODDF.
 * Enquanto o domínio definitivo (fooddf.com.br) não tiver DNS configurado e respondendo,
 * utilizamos o host em produção funcional (fooddf.vercel.app) para evitar canonicals quebrados.
 */
const defaultFunctionalOrigin = 'https://fooddf.vercel.app';

export const siteOrigin = (() => {
  try {
    const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.FOODDF_SITE_URL || defaultFunctionalOrigin;
    const url = new URL(configured);
    return url.origin;
  } catch {
    return defaultFunctionalOrigin;
  }
})();

/** Imagem padrão Open Graph (1200×630). */
export const defaultOgImage = `${siteOrigin}/og-image.png`;

/** Configuração padrão de indexação para páginas públicas. */
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

/** Nome da plataforma. */
export const siteName = 'FOODDF';

/** Padrões compartilhados de Open Graph. */
export function ogDefaults(path: string, title: string, description: string) {
  const absoluteUrl = path.startsWith('http') ? path : `${siteOrigin}${path.startsWith('/') ? path : `/${path}`}`;
  return {
    title,
    description,
    url: absoluteUrl,
    siteName,
    locale: 'pt_BR',
    type: 'website' as const,
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'FOODDF — Cardápios e restaurantes por cidade' }],
  };
}

/** Configuração compartilhada do Twitter Card. */
export const twitterDefaults = {
  card: 'summary_large_image' as const,
  images: [defaultOgImage],
};
