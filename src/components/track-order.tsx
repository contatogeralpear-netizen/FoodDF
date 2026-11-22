'use client';

import { useCallback, useEffect, useState } from 'react';
import { Clock3, Search, X, Star, CheckCircle2, MessageSquare } from 'lucide-react';
import { adminClient, formatContactPhone } from '@/lib/admin';
import { elapsedSince, statusLabel, type Fulfillment, type OrderStatus, type StatusEvent } from '@/lib/order-status';

type Tracked = {
  reference: string;
  restaurant: string;
  status: OrderStatus;
  fulfillment: Fulfillment;
  created_at: string;
  history: StatusEvent[];
};

interface ExistingReview {
  rating: number;
  comment?: string;
  createdAt?: string;
}

export default function TrackOrder({ onClose, initialReference = '' }: { onClose: () => void; initialReference?: string }) {
  const [reference, setReference] = useState(initialReference);
  const [phone, setPhone] = useState('');
  const [query, setQuery] = useState<{ reference: string; phone: string } | null>(null);
  const [order, setOrder] = useState<Tracked | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Estado da avaliação
  const [existingReview, setExistingReview] = useState<ExistingReview | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Checar avaliação existente quando um pedido for carregado
  const checkReview = useCallback(async (orderRef: string) => {
    try {
      const res = await fetch(`/api/reviews?order=${encodeURIComponent(orderRef)}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.hasReviewed && data.review) {
          setExistingReview({
            rating: data.review.rating,
            comment: data.review.comment,
            createdAt: data.review.createdAt,
          });
        } else {
          setExistingReview(null);
        }
      }
    } catch {
      // Falha silenciosa
    }
  }, []);

  const lookup = useCallback(async (q: { reference: string; phone: string }, showLoading: boolean) => {
    if (showLoading) setBusy(true);
    try {
      const { data, error } = await adminClient().rpc('fooddf_track_order', { order_number: q.reference, phone: q.phone });
      if (error) throw error;
      if (data) {
        const tracked = data as Tracked;
        setOrder(tracked);
        setError('');
        void checkReview(tracked.reference);
      } else {
        setOrder(null);
        setError('Pedido não encontrado. Confira o número e o WhatsApp informado na compra.');
      }
    } catch {
      setError('Não foi possível consultar agora. Tente novamente em instantes.');
    } finally {
      if (showLoading) setBusy(false);
      setNow(Date.now());
    }
  }, [checkReview]);

  useEffect(() => {
    if (!query) return;
    const id = setInterval(() => void lookup(query, false), 15000);
    return () => clearInterval(id);
  }, [lookup, query]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = { reference: reference.trim().toUpperCase(), phone: phone.replace(/\D/g, '') };
    if (!/^FD\d{1,15}$/.test(q.reference) || !/^\d{10,11}$/.test(q.phone)) {
      setError('Informe o número do pedido (ex.: FD1001) e o WhatsApp com DDD.');
      return;
    }
    setQuery(q);
    void lookup(q, true);
  }

  async function handleSendReview(e: React.FormEvent) {
    e.preventDefault();
    if (!order) return;
    if (rating < 1 || rating > 5) {
      setReviewError('Selecione de 1 a 5 estrelas para avaliar.');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderReference: order.reference,
          rating,
          comment,
          phone: query?.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível registrar sua avaliação.');
      }

      setReviewSuccess('Obrigado pela sua avaliação!');
      setExistingReview({
        rating,
        comment,
        createdAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : 'Erro ao enviar avaliação.');
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className="tracking-backdrop" onClick={onClose}>
      <section className="tracking-modal" role="dialog" aria-modal="true" aria-labelledby="tracking-title" onClick={e => e.stopPropagation()}>
        <button className="tracking-close" aria-label="Fechar acompanhamento" onClick={onClose}><X /></button>
        <div className="eyebrow">SEU PEDIDO NO FOODDF</div>
        <h2 id="tracking-title">Acompanhar pedido</h2>
        <p>Informe o número e o WhatsApp usados na compra.</p>

        <form onSubmit={submit}>
          <label className="field">
            <span>Número do pedido</span>
            <input required placeholder="Ex.: FD1001" value={reference} onChange={e => setReference(e.target.value.toUpperCase())} />
          </label>
          <label className="field">
            <span>WhatsApp da compra</span>
            <input required type="tel" placeholder="(61) 99999-0000" value={phone} onChange={e => setPhone(formatContactPhone(e.target.value))} />
          </label>
          <button className="button primary wide" disabled={busy}>
            <Search size={18} />{busy ? 'Consultando…' : 'Consultar pedido'}
          </button>
        </form>

        {error && <p className="tracking-error" role="alert">{error}</p>}

        {order && (
          <div className="tracking-result" aria-live="polite">
            <span>{order.reference} · {order.restaurant}</span>
            <h3>{statusLabel(order.status, order.fulfillment)}</h3>
            <p><Clock3 size={16} /> Tempo desde o pedido: {elapsedSince(order.created_at, now)}</p>

            <ol>
              {order.history.map((event, i) => (
                <li key={i}>
                  <span>{statusLabel(event.status, order.fulfillment)}</span>
                  <time>{new Date(event.at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</time>
                </li>
              ))}
            </ol>
            <small>Atualização automática a cada 15 segundos enquanto esta tela estiver aberta.</small>

            {/* SEÇÃO DE AVALIAÇÃO DE 1 A 5 ESTRELAS (1 POR PEDIDO) */}
            <div className="order-rating-card">
              <div className="order-rating-header">
                <Star size={20} fill="#ffb800" color="#ffb800" />
                <h4>Avaliação do Pedido</h4>
              </div>

              {existingReview ? (
                <div className="order-rating-done">
                  <div className="rating-stars-display" aria-label={`Avaliado com ${existingReview.rating} estrelas`}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={22}
                        fill={star <= existingReview.rating ? '#ffb800' : 'none'}
                        color={star <= existingReview.rating ? '#ffb800' : '#d2c1cb'}
                      />
                    ))}
                    <span className="rating-badge-score">{existingReview.rating}.0</span>
                  </div>
                  {existingReview.comment && (
                    <p className="rating-comment-bubble">"{existingReview.comment}"</p>
                  )}
                  <p className="rating-locked-note">
                    <CheckCircle2 size={15} color="#2e7d32" /> Você já avaliou este pedido (limite de 1 avaliação por pedido).
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendReview} className="order-rating-form">
                  <p className="order-rating-prompt">Como foi sua experiência com este pedido? (1 a 5 estrelas)</p>

                  <div className="rating-stars-picker" role="radiogroup" aria-label="Avalie de 1 a 5 estrelas">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        className={`star-button ${star <= (hoverRating || rating) ? 'active' : ''}`}
                        onClick={() => { setRating(star); setReviewError(''); }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          size={28}
                          fill={star <= (hoverRating || rating) ? '#ffb800' : 'none'}
                          color={star <= (hoverRating || rating) ? '#ffb800' : '#bca5b3'}
                        />
                      </button>
                    ))}
                    {rating > 0 && <span className="rating-text-label">{rating} de 5 estrelas</span>}
                  </div>

                  <label className="rating-comment-label">
                    <span><MessageSquare size={14} /> Comentário (opcional)</span>
                    <textarea
                      maxLength={500}
                      rows={2}
                      placeholder="Conte o que achou do sabor, embalagem e rapidez..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                    />
                  </label>

                  {reviewError && <p className="tracking-error" role="alert">{reviewError}</p>}
                  {reviewSuccess && <p className="review-success" role="status"><CheckCircle2 size={16} /> {reviewSuccess}</p>}

                  <button
                    type="submit"
                    className="button primary wide"
                    disabled={submittingReview || rating === 0}
                  >
                    {submittingReview ? 'Enviando avaliação…' : 'Enviar Avaliação do Pedido'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
