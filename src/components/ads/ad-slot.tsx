'use client';

import React from 'react';

/**
 * Componente seguro para exibição de anúncios Google AdSense.
 * Permanece 100% DESLIGADO por padrão (retorna null) enquanto a flag
 * NEXT_PUBLIC_ADSENSE_ENABLED não for explicitamente "true" e um publisher ID real
 * não estiver configurado via NEXT_PUBLIC_ADSENSE_CLIENT.
 */
export function AdSlot({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
}: {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: boolean;
  className?: string;
}) {
  const isEnabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true';
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '';

  // Validação rigorosa: nunca renderizar sem credencial real configurada
  if (!isEnabled || !client || !client.startsWith('ca-pub-') || !slot) {
    return null;
  }

  return (
    <aside
      className={`ad-slot-wrapper ${className}`}
      aria-label="Publicidade patrocinada"
      style={{
        margin: '32px auto',
        textAlign: 'center',
        minHeight: '100px',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          display: 'block',
          fontSize: '10px',
          color: '#9c8094',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '6px',
        }}
      >
        Publicidade
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </aside>
  );
}

export default AdSlot;
