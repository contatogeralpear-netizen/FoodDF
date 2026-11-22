'use client';

import { useEffect, useState } from 'react';
import { FREE_PROMOTION_END } from '@/lib/promotion';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

function calculateTimeLeft(): TimeLeft {
  const target = new Date(FREE_PROMOTION_END).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    totalMs: diff,
  };
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) {
    return (
      <div className="countdown-widget" aria-label="Cadastro gratuito até 31 de dezembro de 2026">
        <span style={{ fontSize: '13px', fontWeight: 800, color: '#fef3c7', padding: '6px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', display: 'inline-block' }}>
          Até 31 de dezembro de 2026
        </span>
      </div>
    );
  }

  if (timeLeft.totalMs <= 0) {
    return (
      <div className="countdown-widget countdown-ended">
        <span className="unit-number">Período promocional encerrado</span>
      </div>
    );
  }

  return (
    <div className="countdown-widget" aria-live="polite">
      <div className="countdown-grid">
        <div className="countdown-unit">
          <span className="unit-number">{timeLeft.days}</span>
          <span className="unit-label">dias</span>
        </div>
        <span className="unit-separator">:</span>
        <div className="countdown-unit">
          <span className="unit-number">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="unit-label">horas</span>
        </div>
        <span className="unit-separator">:</span>
        <div className="countdown-unit">
          <span className="unit-number">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="unit-label">min</span>
        </div>
        <span className="unit-separator">:</span>
        <div className="countdown-unit">
          <span className="unit-number">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="unit-label">seg</span>
        </div>
      </div>
    </div>
  );
}
