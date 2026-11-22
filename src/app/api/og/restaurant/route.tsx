import { ImageResponse } from 'next/og';
import { getCatalog, RestaurantNotFoundError } from '@/lib/server/catalog';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || 'brasa-burger';

  let restaurantName = 'Restaurante';
  let location = 'Brasília / DF';
  let logoUrl: string | null = null;
  let cuisine = 'Cardápio Digital';

  try {
    const catalog = await getCatalog(slug);
    restaurantName = catalog.restaurant.name;
    location = `${catalog.restaurant.city} / ${catalog.restaurant.state}`;
    cuisine = catalog.restaurant.cuisine || 'Cardápio Digital';
    if (catalog.restaurant.logo && catalog.restaurant.logo.startsWith('http')) {
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
          background: 'linear-gradient(145deg, #250f1f 0%, #3d1434 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          padding: '40px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Marca d'água FOODDF no topo */}
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 24, fontWeight: 900, color: '#ff5900', letterSpacing: -1 }}>
            FOOD<span style={{ color: '#ffffff' }}>DF</span>
          </span>
        </div>

        {/* Logo 1:1 Quadrada Centralizada */}
        <div
          style={{
            width: 210,
            height: 210,
            borderRadius: 38,
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
            border: '4px solid rgba(255, 255, 255, 0.25)',
            marginBottom: 24,
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
                background: '#ff5900',
                color: '#ffffff',
                fontSize: 72,
                fontWeight: 900,
              }}
            >
              {restaurantName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Nome do Restaurante */}
        <div
          style={{
            fontSize: 38,
            fontWeight: 900,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.15,
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
            color: '#d6b8cf',
            textAlign: 'center',
            marginBottom: 26,
            fontWeight: 600,
          }}
        >
          {cuisine} • {location}
        </div>

        {/* Tag de Pedido WhatsApp */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#25d366',
            color: '#ffffff',
            padding: '12px 26px',
            borderRadius: 999,
            fontSize: 18,
            fontWeight: 800,
            boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
          }}
        >
          <span>Peça direto pelo WhatsApp</span>
        </div>
      </div>
    ),
    {
      width: 600,
      height: 600,
    }
  );
}
