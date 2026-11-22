'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

const STORAGE_KEY = 'fooddf_cookie_consent_v1';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        setVisible(true);
      }
    } catch {
      // Ignora erro caso localStorage esteja restrito
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ necessary: true, analytics: true, ads: false, date: new Date().toISOString() }));
    } catch {}
    setVisible(false);
  };

  const handleAcceptNecessary = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ necessary: true, analytics: false, ads: false, date: new Date().toISOString() }));
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      className="cookie-consent-banner"
      role="region"
      aria-label="Aviso de Privacidade e Cookies"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        maxWidth: '560px',
        margin: '0 auto',
        background: '#ffffff',
        border: '1px solid #ebdcd5',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 12px 36px rgba(44, 18, 35, 0.16)',
        zIndex: 9999,
        fontFamily: 'inherit',
        color: '#2c1223',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{ color: '#ff5900', flexShrink: 0, marginTop: '2px' }}>
          <ShieldCheck size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 6px', color: '#2c1223' }}>
            Sua privacidade é nossa prioridade
          </h2>
          <p style={{ fontSize: '12px', lineHeight: 1.5, color: '#553549', margin: '0 0 14px' }}>
            Utilizamos cookies estritamente necessários para o funcionamento do cardápio e sacola de pedidos. Não compartilhamos dados sem sua autorização. Consulte nossa{' '}
            <a href="/privacidade" style={{ color: '#ff5900', fontWeight: 700, textDecoration: 'underline' }}>
              Política de Privacidade (LGPD)
            </a>{' '}
            e{' '}
            <a href="/cookies" style={{ color: '#ff5900', fontWeight: 700, textDecoration: 'underline' }}>
              Preferências de Cookies
            </a>.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleAcceptAll}
              style={{
                background: '#ff5900',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Aceitar e Continuar
            </button>
            <button
              type="button"
              onClick={handleAcceptNecessary}
              style={{
                background: '#f8f2eb',
                color: '#553549',
                border: '1px solid #ebdcd5',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Apenas Necessários
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAcceptNecessary}
          aria-label="Fechar aviso"
          style={{ background: 'none', border: 'none', color: '#9c8094', cursor: 'pointer', padding: '4px' }}
        >
          <X size={18} />
        </button>
      </div>
    </aside>
  );
}

export default CookieConsent;
