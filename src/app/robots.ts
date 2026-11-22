import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/paineladministativo', '/adminmaster', '/api/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Applebot-Extended', 'CCBot', 'PerplexityBot', 'Amazonbot', 'Google-Extended', 'Meta-ExternalAgent', 'Bytespider', 'cohere-ai'],
        allow: '/',
        disallow: ['/paineladministativo', '/adminmaster', '/api/'],
      },
    ],
    sitemap: `${siteOrigin}/sitemap.xml`,
    host: siteOrigin,
  };
}
