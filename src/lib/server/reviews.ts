import 'server-only';
import { database, hasDatabase } from './supabase';

export interface OrderReview {
  id?: string;
  orderReference: string;
  restaurantId: string;
  rating: number;
  comment?: string;
  customerName?: string;
  createdAt: string;
}

// Em memória para fallback/resiliência caso a tabela do Supabase ainda não tenha sido migrada
const localReviewsStore = new Map<string, OrderReview>();

// Avaliações de exemplo para o restaurante demo
localReviewsStore.set('FD1000-DEMO', {
  orderReference: 'FD1000-DEMO',
  restaurantId: 'brasa-burger',
  rating: 5,
  comment: 'Melhor hambúrguer artesanal de Brasília! Entrega super rápida pelo WhatsApp.',
  customerName: 'Mariana S.',
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
});

export async function getOrderReview(orderReference: string): Promise<{ hasReviewed: boolean; review?: OrderReview }> {
  const cleanRef = orderReference.trim().toUpperCase();
  if (!cleanRef) return { hasReviewed: false };

  // 1. Verificar no banco de dados Supabase se disponível
  if (hasDatabase()) {
    try {
      const db = database(true);
      const { data, error } = await db
        .from('order_reviews')
        .select('id,order_reference,restaurant_id,rating,comment,customer_name,created_at')
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
            createdAt: data.created_at,
          },
        };
      }
    } catch {
      // Ignora erro e recorre ao fallback local
    }
  }

  // 2. Verificar no store local
  const local = localReviewsStore.get(cleanRef);
  if (local) {
    return { hasReviewed: true, review: local };
  }

  return { hasReviewed: false };
}

export async function submitOrderReview(params: {
  orderReference: string;
  rating: number;
  comment?: string;
  customerName?: string;
  phone?: string;
  restaurantId?: string;
}): Promise<{ success: boolean; message: string; review: OrderReview }> {
  const cleanRef = params.orderReference.trim().toUpperCase();
  if (!cleanRef || !/^[A-Z0-9-]{1,30}$/.test(cleanRef)) {
    throw new Error('Número de pedido inválido.');
  }

  const rating = Math.round(Number(params.rating));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('A avaliação deve ser de 1 a 5 estrelas.');
  }

  const comment = (params.comment || '').trim().slice(0, 500);
  const customerName = (params.customerName || 'Cliente').trim().slice(0, 100);

  // REGRA DE OURO: Verificar se o pedido JÁ foi avaliado
  const existing = await getOrderReview(cleanRef);
  if (existing.hasReviewed) {
    throw new Error('Este pedido já foi avaliado. É permitida apenas 1 avaliação por pedido.');
  }

  // Descobrir restaurantId se não informado
  let restaurantId = params.restaurantId || 'brasa-burger';
  let orderId: string | undefined;

  if (hasDatabase()) {
    try {
      const db = database(true);
      // Tentar localizar o pedido real para amarrar orderId e restaurant_id
      const numPart = cleanRef.replace(/^FD/, '');
      if (/^\d+$/.test(numPart)) {
        const { data: orderData } = await db
          .from('orders')
          .select('id,restaurant_id,customer_name')
          .eq('reference', parseInt(numPart, 10))
          .maybeSingle();

        if (orderData) {
          orderId = orderData.id;
          restaurantId = orderData.restaurant_id;
        }
      }

      // Inserir no Supabase
      const { data, error } = await db
        .from('order_reviews')
        .insert({
          order_reference: cleanRef,
          order_id: orderId || null,
          restaurant_id: restaurantId,
          rating,
          comment: comment || null,
          customer_name: customerName,
          customer_phone: params.phone || '',
        })
        .select()
        .maybeSingle();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este pedido já foi avaliado anteriormente.');
        }
        // Se a tabela ainda não existir, persiste no localReviewsStore
      } else if (data) {
        const rev: OrderReview = {
          id: data.id,
          orderReference: cleanRef,
          restaurantId,
          rating,
          comment: comment || undefined,
          customerName,
          createdAt: data.created_at || new Date().toISOString(),
        };
        localReviewsStore.set(cleanRef, rev);
        return { success: true, message: 'Avaliação enviada com sucesso!', review: rev };
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('já foi avaliado')) throw e;
    }
  }

  // Fallback seguro em memória
  const newRev: OrderReview = {
    orderReference: cleanRef,
    restaurantId,
    rating,
    comment: comment || undefined,
    customerName,
    createdAt: new Date().toISOString(),
  };
  localReviewsStore.set(cleanRef, newRev);

  return { success: true, message: 'Avaliação enviada com sucesso!', review: newRev };
}

export async function getRestaurantRatings(restaurantId: string): Promise<{ rating: number; reviewCount: number }> {
  if (restaurantId === 'brasa-burger') {
    // Computar médias extras somando às avaliações base
    const extraReviews = Array.from(localReviewsStore.values()).filter(r => r.restaurantId === 'brasa-burger');
    if (extraReviews.length <= 1) {
      return { rating: 4.9, reviewCount: 28 };
    }
    const sum = 28 * 4.9 + extraReviews.slice(1).reduce((acc, r) => acc + r.rating, 0);
    const total = 28 + (extraReviews.length - 1);
    return { rating: Math.round((sum / total) * 10) / 10, reviewCount: total };
  }

  if (hasDatabase()) {
    try {
      const db = database(true);
      const { data, error } = await db
        .from('order_reviews')
        .select('rating')
        .eq('restaurant_id', restaurantId);

      if (!error && data && data.length > 0) {
        const sum = data.reduce((acc, r) => acc + r.rating, 0);
        return {
          rating: Math.round((sum / data.length) * 10) / 10,
          reviewCount: data.length,
        };
      }
    } catch {
      // Fallback
    }
  }

  const localList = Array.from(localReviewsStore.values()).filter(r => r.restaurantId === restaurantId);
  if (localList.length > 0) {
    const sum = localList.reduce((acc, r) => acc + r.rating, 0);
    return {
      rating: Math.round((sum / localList.length) * 10) / 10,
      reviewCount: localList.length,
    };
  }

  return { rating: 5.0, reviewCount: 0 };
}
