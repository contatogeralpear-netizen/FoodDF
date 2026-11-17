const productionOrigin = 'https://fooddf.vercel.app';

/** Canonical URLs always use the configured public origin, never a request Host header. */
export const siteOrigin = (() => {
  try {
    const url = new URL(process.env.FOODDF_SITE_URL || productionOrigin);
    return url.protocol === 'https:' ? url.origin : productionOrigin;
  } catch {
    return productionOrigin;
  }
})();
