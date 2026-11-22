import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'FOODDF — Cardápios e restaurantes por cidade';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #fffaf5, #f2e8f7)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <span style={{ fontSize: 80, fontWeight: 950, color: '#ff5900', letterSpacing: -3 }}>FOOD</span>
          <span style={{ fontSize: 80, fontWeight: 950, color: '#ff5900', letterSpacing: -3 }}>DF</span>
        </div>
        <span style={{ fontSize: 28, color: '#38102f', fontWeight: 800, textAlign: 'center', maxWidth: 800 }}>
          Cardápios e restaurantes por cidade
        </span>
        <span style={{ fontSize: 20, color: '#856b80', marginTop: 16, textAlign: 'center', maxWidth: 700 }}>
          Encontre restaurantes, veja o cardápio e peça pelo WhatsApp
        </span>
      </div>
    ),
    { ...size }
  );
}
