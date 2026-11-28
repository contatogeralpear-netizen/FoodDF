'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  HeartHandshake,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { adminClient, formatContactPhone } from '@/lib/admin';
import { elapsedSince, statusLabel, type Fulfillment, type OrderStatus, type StatusEvent } from '@/lib/order-status';

type TrackedItem = {
  productId?: string;
  name: string;
  quantity: number;
};

type MealRatingEntry = {
  productId: string;
  productName: string;
  rating: number;
};

interface ExistingReview {
  rating: number;
  comment?: string;
  mealRatings?: MealRatingEntry[];
  createdAt?: string;
}

type Tracked = {
  reference: string;
  restaurant: string;
  restaurant_id?: string;
  restaurant_slug?: string;
  status: OrderStatus;
  fulfillment: Fulfillment;
  created_at: string;
  items?: TrackedItem[];
  history: StatusEvent[];
  review?: ExistingReview | null;
};

function slugifyMealId(name: string): string {
  return (
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'prato'
  );
}

export default function TrackOrder({
  onClose,
  initialReference = '',
  onReviewed,
}: {
  onClose: () => void;
  initialReference?: string;
  onReviewed?: () => void;
}) {
  const [reference, setReference] = useState(initialReference);
  const [phone, setPhone] = useState('');
  const [query, setQuery] = useState<{ reference: string; phone: string } | null>(null);
  const [order, setOrder] = useState<Tracked | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState('');
  const [now, setNow] = useState(() => Date.now());

  // Estado da Avaliação do Atendimento + Avaliação por Refeição (regra: 1 por pedido)
  const [existingReview, setExistingReview] = useState<ExistingReview | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [mealRatings, setMealRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  const uniqueMeals = useMemo(() => {
    if (!order?.items?.length) return [];
    const seen = new Map<string, { productId: string; productName: string; quantity: number }>();
    for (const item of order.items) {
      const pid = (item.productId || slugifyMealId(item.name)).trim();
      const prev = seen.get(pid);
      if (prev) {
        prev.quantity += item.quantity || 1;
      } else {
        seen.set(pid, {
          productId: pid,
          productName: item.name,
          quantity: item.quantity || 1,
        });
      }
    }
    return Array.from(seen.values());
  }, [order]);

  const checkReview = useCallback(async (orderRef: string) => {
    try {
      const res = await fetch(`/api/reviews?order=${encodeURIComponent(orderRef)}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.hasReviewed && data.review) {
          setExistingReview({
            rating: data.review.rating,
            comment: data.review.comment,
            mealRatings: Array.isArray(data.review.mealRatings) ? data.review.mealRatings : [],
            createdAt: data.review.createdAt,
          });
        }
      }
    } catch {
      // Silencioso
    }
  }, []);

  const lookup = useCallback(
    async (q: { reference: string; phone: string }, mode: 'initial' | 'manual' | 'silent') => {
      if (mode === 'initial') setBusy(true);
      if (mode === 'manual') {
        setRefreshing(true);
        setRefreshNotice('');
      }
      try {
        const { data, error: rpcErr } = await adminClient().rpc('fooddf_track_order', {
          order_number: q.reference,
          phone: q.phone,
        });
        if (rpcErr) throw rpcErr;
        if (data) {
          const tracked = data as Tracked;
          setOrder(tracked);
          setError('');
          if (tracked.review && tracked.review.rating) {
            setExistingReview({
              rating: tracked.review.rating,
              comment: tracked.review.comment || undefined,
              mealRatings: Array.isArray(tracked.review.mealRatings) ? tracked.review.mealRatings : [],
              createdAt: tracked.review.createdAt,
            });
          } else {
            void checkReview(tracked.reference);
          }
          if (mode === 'manual') {
            setRefreshNotice(
              `Atualizado às ${new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}`
            );
          }
        } else {
          setOrder(null);
          setError('Pedido não encontrado. Confira o número e o WhatsApp informado na compra.');
        }
      } catch {
        setError('Não foi possível consultar agora. Tente novamente em instantes.');
      } finally {
        if (mode === 'initial') setBusy(false);
        if (mode === 'manual') setRefreshing(false);
        setNow(Date.now());
      }
    },
    [checkReview]
  );

  // Se o cliente abriu o link ?pedido=FD... no mesmo aparelho, preenche e consulta automaticamente
  useEffect(() => {
    try {
      const savedPhone = localStorage.getItem('fooddf-last-order-phone') || '';
      const digits = savedPhone.replace(/\D/g, '');
      if (digits.length >= 10 && digits.length <= 11) {
        setPhone(formatContactPhone(digits));
        if (initialReference && /^FD\d{1,15}$/i.test(initialReference.trim())) {
          const q = { reference: initialReference.trim().toUpperCase(), phone: digits };
          setQuery(q);
          void lookup(q, 'initial');
        }
      }
    } catch {
      // Ignorar se storage estiver indisponível
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialReference]);

  useEffect(() => {
    if (!query) return;
    const id = setInterval(() => void lookup(query, 'silent'), 15000);
    return () => clearInterval(id);
  }, [lookup, query]);

  useEffect(() => {
    if (!refreshNotice) return;
    const id = setTimeout(() => setRefreshNotice(''), 4000);
    return () => clearTimeout(id);
  }, [refreshNotice]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = { reference: reference.trim().toUpperCase(), phone: phone.replace(/\D/g, '') };
    if (!/^FD\d{1,15}$/.test(q.reference) || !/^\d{10,11}$/.test(q.phone)) {
      setError('Informe o número do pedido (ex.: FD1001) e o WhatsApp com DDD.');
      return;
    }
    try {
      localStorage.setItem('fooddf-last-order-phone', q.phone);
    } catch {}
    setQuery(q);
    void lookup(q, 'initial');
  }

  async function handleSendReview(e: React.FormEvent) {
    e.preventDefault();
    if (!order) return;
    if (rating < 1 || rating > 5) {
      setReviewError('Selecione de 1 a 5 estrelas na Avaliação do Atendimento.');
      return;
    }

    const preparedMeals: MealRatingEntry[] = uniqueMeals
      .filter(m => (mealRatings[m.productId] || 0) >= 1)
      .map(m => ({
        productId: m.productId,
        productName: m.productName,
        rating: mealRatings[m.productId],
      }));

    if (uniqueMeals.length > 0 && preparedMeals.length < uniqueMeals.length) {
      setReviewError('Por favor, selecione também a nota (1 a 5 estrelas) de cada refeição escolhida.');
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
          restaurantId: order.restaurant_id,
          mealRatings: preparedMeals,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível registrar sua avaliação.');
      }

      setReviewSuccess('Sua avaliação foi contabilizada! Muito obrigado pelo carinho!');
      setExistingReview({
        rating,
        comment: comment.trim() || undefined,
        mealRatings: preparedMeals,
        createdAt: new Date().toISOString(),
      });
      onReviewed?.();
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : 'Erro ao enviar avaliação.');
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className="tracking-backdrop" onClick={onClose}>
      <section
        className="tracking-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tracking-title"
        onClick={e => e.stopPropagation()}
      >
        <button className="tracking-close" aria-label="Fechar acompanhamento" onClick={onClose}>
          <X />
        </button>
        <div className="eyebrow">SEU PEDIDO NO FOODDF</div>
        <h2 id="tracking-title">Acompanhar e avaliar pedido</h2>

        <div className="tracking-invite-banner">
          <Sparkles size={18} />
          <p>
            Confira o andamento do seu pedido em tempo real e aproveite para realizar a sua{' '}
            <strong>Avaliação do Atendimento</strong> e da <strong>Refeição Escolhida</strong>!
          </p>
        </div>

        <form onSubmit={submit}>
          <label className="field">
            <span>Número do pedido</span>
            <input
              required
              placeholder="Ex.: FD1001"
              value={reference}
              onChange={e => setReference(e.target.value.toUpperCase())}
            />
          </label>
          <label className="field">
            <span>WhatsApp da compra</span>
            <input
              required
              type="tel"
              placeholder="(61) 99999-0000"
              value={phone}
              onChange={e => setPhone(formatContactPhone(e.target.value))}
            />
          </label>
          <button className="button primary wide" disabled={busy}>
            <Search size={18} />
            {busy ? 'Consultando…' : 'Consultar pedido'}
          </button>
        </form>

        {error && (
          <p className="tracking-error" role="alert">
            {error}
          </p>
        )}

        {order && (
          <div className="tracking-result" aria-live="polite">
            <div className="tracking-result-top">
              <div>
                <span>
                  {order.reference} · {order.restaurant}
                </span>
                <h3>{statusLabel(order.status, order.fulfillment)}</h3>
              </div>
              <button
                type="button"
                className="button outline small tracking-refresh-btn"
                disabled={refreshing || busy}
                onClick={() => query && void lookup(query, 'manual')}
              >
                <RefreshCw size={15} className={refreshing ? 'admin-spin' : ''} />
                {refreshing ? 'Atualizando…' : 'Atualizar'}
              </button>
            </div>

            {refreshNotice && (
              <p className="tracking-refresh-ok" role="status">
                <CheckCircle2 size={14} /> {refreshNotice}
              </p>
            )}

            <p>
              <Clock3 size={16} /> Tempo desde o pedido: {elapsedSince(order.created_at, now)}
            </p>

            <ol>
              {order.history.map((event, i) => (
                <li key={i}>
                  <span>{statusLabel(event.status, order.fulfillment)}</span>
                  <time>
                    {new Date(event.at).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </li>
              ))}
            </ol>
            <small>
              Use o botão <strong>Atualizar</strong> acima para ver o andamento sem sair desta janela (ou aguarde a atualização automática a cada 15s).
            </small>

            {/* AVALIAÇÃO DO ATENDIMENTO + AVALIAÇÃO POR REFEIÇÃO (1 POR PEDIDO GERADO) */}
            <div className="order-rating-card">
              <div className="order-rating-header">
                <HeartHandshake size={20} color="#ef5a0c" />
                <h4>Avaliação do Atendimento</h4>
              </div>

              {existingReview ? (
                <div className="order-rating-done">
                  {reviewSuccess && (
                    <p className="review-success" role="status">
                      <CheckCircle2 size={16} /> {reviewSuccess}
                    </p>
                  )}

                  <span className="rating-sub-overline">Atendimento do restaurante</span>
                  <div
                    className="rating-stars-display"
                    aria-label={`Atendimento avaliado com ${existingReview.rating} estrelas`}
                  >
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={21}
                        fill={star <= existingReview.rating ? '#ffb800' : 'none'}
                        color={star <= existingReview.rating ? '#ffb800' : '#d2c1cb'}
                      />
                    ))}
                    <span className="rating-badge-score">{existingReview.rating.toFixed(1)}</span>
                  </div>

                  {existingReview.comment && (
                    <p className="rating-comment-bubble">&ldquo;{existingReview.comment}&rdquo;</p>
                  )}

                  {existingReview.mealRatings && existingReview.mealRatings.length > 0 && (
                    <div className="meal-ratings-done-list">
                      <span className="rating-sub-overline">Refeições avaliadas</span>
                      {existingReview.mealRatings.map(mr => (
                        <div key={mr.productId} className="meal-rating-done-row">
                          <strong>{mr.productName}</strong>
                          <span className="meal-rating-done-stars">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star
                                key={s}
                                size={15}
                                fill={s <= mr.rating ? '#ffb800' : 'none'}
                                color={s <= mr.rating ? '#ffb800' : '#d2c1cb'}
                              />
                            ))}
                            <b>{mr.rating}.0</b>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="rating-locked-note">
                    <CheckCircle2 size={15} color="#2e7d32" /> Avaliação contabilizada! Regra ativa: é permitida somente 1 avaliação por pedido gerado.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendReview} className="order-rating-form">
                  <div className="persuasive-review-box">
                    <p>
                      <strong>Sua nota faz toda a diferença! 💛</strong> Conte como foi o nosso{' '}
                      <strong>atendimento</strong> (cuidado, atenção e agilidade) e avalie cada{' '}
                      <strong>refeição escolhida</strong>. Sua avaliação valoriza nossa cozinha e ajuda outros clientes a escolherem os melhores pratos!
                    </p>
                  </div>

                  <div className="rating-block">
                    <span className="rating-block-title">1. Como foi o nosso atendimento?</span>
                    <div className="rating-stars-picker" role="radiogroup" aria-label="Avalie o atendimento de 1 a 5 estrelas">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          type="button"
                          key={star}
                          className={`star-button ${star <= (hoverRating || rating) ? 'active' : ''}`}
                          onClick={() => {
                            setRating(star);
                            setReviewError('');
                          }}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          aria-label={`${star} estrela${star > 1 ? 's' : ''} para o atendimento`}
                        >
                          <Star
                            size={28}
                            fill={star <= (hoverRating || rating) ? '#ffb800' : 'none'}
                            color={star <= (hoverRating || rating) ? '#ffb800' : '#bca5b3'}
                          />
                        </button>
                      ))}
                      {rating > 0 && <span className="rating-text-label">{rating} de 5 ★</span>}
                    </div>
                  </div>

                  {uniqueMeals.length > 0 && (
                    <div className="meal-ratings-section">
                      <span className="rating-block-title">
                        <UtensilsCrossed size={15} /> 2. Avalie a refeição escolhida:
                      </span>
                      <div className="meal-ratings-list">
                        {uniqueMeals.map(meal => {
                          const currentMealScore = mealRatings[meal.productId] || 0;
                          return (
                            <div key={meal.productId} className="meal-rating-item">
                              <div className="meal-rating-name">
                                <strong>{meal.productName}</strong>
                                <small>{meal.quantity}× no pedido</small>
                              </div>
                              <div
                                className="meal-stars-row"
                                role="radiogroup"
                                aria-label={`Avaliar ${meal.productName} de 1 a 5 estrelas`}
                              >
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button
                                    type="button"
                                    key={star}
                                    className={`star-button small ${star <= currentMealScore ? 'active' : ''}`}
                                    onClick={() => {
                                      setMealRatings(prev => ({ ...prev, [meal.productId]: star }));
                                      setReviewError('');
                                    }}
                                    aria-label={`${star} estrela${star > 1 ? 's' : ''} para ${meal.productName}`}
                                  >
                                    <Star
                                      size={22}
                                      fill={star <= currentMealScore ? '#ffb800' : 'none'}
                                      color={star <= currentMealScore ? '#ffb800' : '#bca5b3'}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <label className="rating-comment-label">
                    <span>
                      <MessageSquare size={14} /> Comentário sobre o atendimento e o prato (opcional)
                    </span>
                    <textarea
                      maxLength={500}
                      rows={2}
                      placeholder="Conte o que achou do atendimento, sabor, temperatura e embalagem..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                    />
                  </label>

                  {reviewError && (
                    <p className="tracking-error" role="alert">
                      {reviewError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="button primary wide"
                    disabled={submittingReview || rating === 0}
                  >
                    {submittingReview ? 'Contabilizando avaliação…' : 'Enviar Avaliação (1 por pedido)'}
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
