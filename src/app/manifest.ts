import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FOODDF — Cardápios e restaurantes por cidade',
    short_name: 'FOODDF',
    description: 'Encontre restaurantes por estado e cidade, veja cardápios e peça pelo WhatsApp.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fffaf5',
    theme_color: '#ff5900',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
