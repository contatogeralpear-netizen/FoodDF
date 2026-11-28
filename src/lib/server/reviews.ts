import 'server-only';
import { createHmac } from 'node:crypto';
import { database, hasDatabase } from './supabase';

export interface MealRatingInput {
  productId: string;
  productName: string;
  rating: number;
}

export interface OrderReview {
  id?: string;
  orderReference: string;
  restaurantId: string;
  rating: number;
  comment?: string;
  customerName?: string;
  mealRatings?: MealRatingInput[];
  createdAt: string;
}

// Exemplos base de avaliações por refeição para o restaurante modelo (Brasa Burger)
export const DEMO_PRODUCT_RATINGS: Record<string, { rating: number; reviewCount: number }> = {
  'brasa-bacon': { rating: 4.9, reviewCount: 38 },
  'prato-da-casa': { rating: 4.8, reviewCount: 27 },
  'batata-crocante': { rating: 4.7, reviewCount: 19 },
  'combo-brasa': { rating: 5.0, reviewCount: 42 },
  'refrigerante-lata': { rating: 4.9, reviewCount: 15 },
};

const localReviewsStore = new Map<string, OrderReview>();

export async function getOrderReview(orderReference: string): Promise<{ hasReviewed: boolean; review?: OrderReview }> {
  const cleanRef = orderReference.trim().toUpperCase();
  if (!cleanRef) return { hasReviewed: false };

  if (hasDatabase()) {
    try {
      const db = database();
      const { data, error } = await db
        .from('order_reviews')
        .select('id,order_reference,restaurant_id,rating,comment,customer_name,meal_ratings,created_at')
        .eq('order_reference', cleanRef)
        .maybeSingle();

      if (!error && data) {
        return {
          hasReviewed: true,
          review: {
            id: data.id,
            orderReference: data.order_reference,
            restaurantId: data.restaurant_id,
            rating: data.rating,
            comment: data.comment || undefined,
            customerName: data.customer_name,
            mealRatings: Array.isArray(data.meal_ratings) ? (data.meal_ratings as MealRatingInput[]) : [],
            createdAt: data.created_at,
          },
        };
      }
    } catch {
      // Fallback
    }
  }

  const local = localReviewsStore.get(cleanRef);
  if (local) return { hasReviewed: true, review: local };
  return { hasReviewed: false };
}

export async function submitOrderReview(params: {
  orderReference: string;
  rating: number;
  comment?: string;
  customerName?: string;
  phone?: string;
  restaurantId?: string;
  mealRatings?: MealRatingInput[];
  ip?: string;
}): Promise<{ success: boolean; message: string; review: OrderReview }> {
  const cleanRef = params.orderReference.trim().toUpperCase();
  if (!cleanRef || !/^FD\d{1,15}$/.test(cleanRef)) {
    throw new Error('Número de pedido inválido.');
  }

  const rating = Math.round(Number(params.rating));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('A avaliação do atendimento deve ser de 1 a 5 estrelas.');
  }

  const comment = (params.comment || '').trim().slice(0, 500);
  const mealRatings = (params.mealRatings || [])
    .filter(m => m && typeof m.productId === 'string' && m.productId.trim() && Number(m.rating) >= 1 && Number(m.rating) <= 5)
    .map(m => ({
      productId: m.productId.trim().slice(0, 120),
      productName: (m.productName || '').trim().slice(0, 120),
      rating: Math.round(Number(m.rating)),
    }));

  // Regra: somente 1 avaliação por pedido gerado
  const existing = await getOrderReview(cleanRef);
  if (existing.hasReviewed) {
    throw new Error('Este pedido já foi avaliado. É permitida somente 1 avaliação por pedido gerado.');
  }

  if (hasDatabase()) {
    const bucketKey = createHmac('sha256', process.env.SUPABASE_SECRET_KEY || 'fooddf-reviews-rate')
      .update(`reviews:${params.ip || 'local'}`)
      .digest('hex');

    const { data, error } = await database().rpc('fooddf_submit_review', {
      p_bucket_key: bucketKey,
      p_order_reference: cleanRef,
      p_phone: (params.phone || '').replace(/\D/g, ''),
      p_service_rating: rating,
      p_comment: comment,
      p_meal_ratings: mealRatings,
    });

    if (error) {
      throw new Error('Não foi possível salvar sua avaliação agora. Tente novamente.');
    }

    const res = data as {
      error?: string;
      id?: string;
      orderReference?: string;
      restaurantId?: string;
      rating?: number;
      comment?: string | null;
      customerName?: string;
      mealRatings?: MealRatingInput[];
      createdAt?: string;
    } | null;

    if (!res) {
      throw new Error('Erro ao processar avaliação.');
    }
    if (res.error) {
      throw new Error(res.error);
    }

    const rev: OrderReview = {
      id: res.id,
      orderReference: res.orderReference || cleanRef,
      restaurantId: res.restaurantId || params.restaurantId || 'brasa-burger',
      rating: res.rating || rating,
      comment: res.comment || undefined,
      customerName: res.customerName || params.customerName || 'Cliente',
      mealRatings: Array.isArray(res.mealRatings) ? res.mealRatings : mealRatings,
      createdAt: res.createdAt || new Date().toISOString(),
    };
    localReviewsStore.set(cleanRef, rev);
    return {
      success: true,
      message: 'Sua avaliação foi contabilizada com sucesso! Muito obrigado!',
      review: rev,
    };
  }

  const fallbackRev: OrderReview = {
    orderReference: cleanRef,
    restaurantId: params.restaurantId || 'brasa-burger',
    rating,
    comment: comment || undefined,
    customerName: params.customerName || 'Cliente',
    mealRatings,
    createdAt: new Date().toISOString(),
  };
  localReviewsStore.set(cleanRef, fallbackRev);
  return {
    success: true,
    message: 'Sua avaliação foi contabilizada com sucesso! Muito obrigado!',
    review: fallbackRev,
  };
}

export async function getRestaurantRatings(
  restaurantId: string,
  isDemo = false
): Promise<{ rating: number; reviewCount: number }> {
  let dbRatings: number[] = [];
  if (hasDatabase()) {
    try {
      const { data, error } = await database()
        .from('order_reviews')
        .select('rating')
        .eq('restaurant_id', restaurantId);
      if (!error && Array.isArray(data)) {
        dbRatings = data.map(r => Number(r.rating)).filter(n => n >= 1 && n <= 5);
      }
    } catch {
      // Fallback
    }
  }

  if (isDemo || restaurantId === 'brasa-burger') {
    const baseCount = 28;
    const baseSum = baseCount * 4.9;
    const realSum = dbRatings.reduce((a, b) => a + b, 0);
    const totalCount = baseCount + dbRatings.length;
    return {
      rating: Math.round(((baseSum + realSum) / totalCount) * 10) / 10,
      reviewCount: totalCount,
    };
  }

  if (dbRatings.length > 0) {
    const sum = dbRatings.reduce((a, b) => a + b, 0);
    return {
      rating: Math.round((sum / dbRatings.length) * 10) / 10,
      reviewCount: dbRatings.length,
    };
  }

  return { rating: 0, reviewCount: 0 };
}

export async function getProductRatings(
  restaurantId: string,
  isDemo = false
): Promise<Record<string, { rating: number; reviewCount: number }>> {
  const grouped = new Map<string, number[]>();

  if (hasDatabase()) {
    try {
      const { data, error } = await database()
        .from('product_reviews')
        .select('product_id,rating')
        .eq('restaurant_id', restaurantId);
      if (!error && Array.isArray(data)) {
        for (const row of data) {
          const pid = String(row.product_id || '');
          const r = Number(row.rating);
          if (!pid || r < 1 || r > 5) continue;
          const list = grouped.get(pid) || [];
          list.push(r);
          grouped.set(pid, list);
        }
      }
    } catch {
      // Fallback
    }
  }

  const out: Record<string, { rating: number; reviewCount: number }> = {};

  if (isDemo || restaurantId === 'brasa-burger') {
    for (const [pid, base] of Object.entries(DEMO_PRODUCT_RATINGS)) {
      const extra = grouped.get(pid) || [];
      const totalCount = base.reviewCount + extra.length;
      const sum = base.reviewCount * base.rating + extra.reduce((a, b) => a + b, 0);
      out[pid] = {
        rating: Math.round((sum / totalCount) * 10) / 10,
        reviewCount: totalCount,
      };
    }
  }

  for (const [pid, list] of grouped.entries()) {
    if (out[pid]) continue;
    const sum = list.reduce((a, b) => a + b, 0);
    out[pid] = {
      rating: Math.round((sum / list.length) * 10) / 10,
      reviewCount: list.length,
    };
  }

  return out;
}
