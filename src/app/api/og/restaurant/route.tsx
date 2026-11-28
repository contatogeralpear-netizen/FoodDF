import { ImageResponse } from 'next/og';
import { getCatalog, RestaurantNotFoundError } from '@/lib/server/catalog';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || 'brasa-burger';
  const pedido = searchParams.get('pedido')?.toUpperCase() || null;

  let restaurantName = 'FOODDF';
  let location = 'Brasília / DF';
  let logoUrl: string | null = null;
  let cuisine = 'Cardápio Digital Oficial';

  try {
    const catalog = await getCatalog(slug);
    restaurantName = catalog.restaurant.name;
    location = `${catalog.restaurant.city} / ${catalog.restaurant.state}`;
    cuisine = catalog.restaurant.cuisine || 'Cardápio Digital';
    if (catalog.restaurant.logo && (catalog.restaurant.logo.startsWith('http://') || catalog.restaurant.logo.startsWith('https://'))) {
      logoUrl = catalog.restaurant.logo;
    }
  } catch (err) {
    if (!(err instanceof RestaurantNotFoundError)) {
      // fallback gracioso
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #4b0b26 0%, #2a0716 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          padding: '38px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Selo superior FOODDF com chapéu de chef */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '8px 20px',
            borderRadius: 999,
            marginBottom: 24,
            border: '1px solid rgba(255, 255, 255, 0.18)',
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 900, color: '#ff6a1a', letterSpacing: -0.5 }}>
            FOOD<span style={{ color: '#ffffff' }}>DF</span>
          </span>
          <span style={{ fontSize: 15, color: '#f5d5e3', fontWeight: 700 }}>
            • Cardápio Oficial
          </span>
        </div>

        {/* Logo 1:1 Quadrada Centralizada */}
        <div
          style={{
            width: 204,
            height: 204,
            borderRadius: 42,
            background: '#fffaf5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 18px 44px rgba(0,0,0,0.45)',
            border: '5px solid #ff6a1a',
            marginBottom: 22,
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={restaurantName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(145deg, #ff6a1a 0%, #e04800 100%)',
                color: '#ffffff',
              }}
            >
              <span style={{ fontSize: 82, fontWeight: 900, lineHeight: 1 }}>
                {restaurantName.charAt(0).toUpperCase()}
              </span>
              <span style={{ fontSize: 16, fontWeight: 800, marginTop: 6, letterSpacing: 1.5 }}>
                FOODDF
              </span>
            </div>
          )}
        </div>

        {/* Nome do Restaurante */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 900,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.12,
            marginBottom: 8,
            maxWidth: 520,
          }}
        >
          {restaurantName}
        </div>

        {/* Categoria e Localização */}
        <div
          style={{
            fontSize: 20,
            color: '#f2cadb',
            textAlign: 'center',
            marginBottom: 24,
            fontWeight: 600,
          }}
        >
          {pedido ? `Pedido ${pedido} • ${location}` : `${cuisine} • ${location}`}
        </div>

        {/* Tag inferior de ação */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#25d366',
            color: '#ffffff',
            padding: '12px 28px',
            borderRadius: 999,
            fontSize: 18,
            fontWeight: 800,
          }}
        >
          <span>{pedido ? 'Acompanhe e avalie seu pedido' : 'Peça direto pelo WhatsApp'}</span>
        </div>
      </div>
    ),
    {
      width: 600,
      height: 600,
    }
  );
}
