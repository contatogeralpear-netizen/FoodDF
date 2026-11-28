'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Award,
  Ban,
  Calendar,
  Check,
  CheckCircle2,
  Clock3,
  DollarSign,
  Edit3,
  ExternalLink,
  MessageCircle,
  PackageCheck,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Share2,
  ShoppingBag,
  Star,
  Store,
  Trash2,
  Truck,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { adminClient, formatContactPhone } from '@/lib/admin';
import { money } from '@/lib/domain';
import {
  elapsedSince,
  nextLabel,
  statusLabel,
  type Fulfillment,
  type OrderStatus,
  type StatusEvent,
} from '@/lib/order-status';
import { FoodImage } from '../food-image';

export type OrderItemRow = {
  productId?: string;
  name: string;
  quantity: number;
  unitPrice?: number;
  total?: number;
  extras?: { id: string; name: string; price: number }[];
};

export type Order = {
  id: string;
  reference: number;
  status: OrderStatus;
  fulfillment: Fulfillment;
  customer_name: string;
  customer_phone: string;
  address: string | null;
  notes: string;
  items: OrderItemRow[];
  subtotal?: number;
  delivery_fee?: number;
  total: number;
  change_for?: number | null;
  payment_method: string;
  payment_status: string;
  created_at: string;
  history: StatusEvent[];
};

export type OrderReviewSummary = {
  id: string;
  order_reference: string;
  rating: number;
  comment?: string | null;
  created_at: string;
};

type PeriodPreset = 'all' | 'today' | '7d' | '30d' | 'month' | 'custom';
type StatusFilter = 'all' | 'pending' | 'completed' | 'cancelled';

type ShareContext = {
  order: Order;
  restaurantName: string;
  restaurantSlug: string;
  restaurantAddress: string;
  origin: string;
};

type ShareStatusOption = {
  id: string;
  title: string;
  subtitle: string;
  orderStatus: OrderStatus;
  paymentStatus?: 'pending' | 'confirmed' | 'rejected';
  Icon: typeof Clock3;
  buildMessage: (ctx: ShareContext) => string;
};

function buildWhatsappFooter(ctx: ShareContext): string[] {
  const slugPath = `/restaurantes/${encodeURIComponent(ctx.restaurantSlug || 'brasa-burger')}`;
  const orderLink = `${ctx.origin}${slugPath}?pedido=FD${ctx.order.reference}`;
  const menuShareLink = `${ctx.origin}${slugPath}`;
  return [
    `🔗 *Dados do pedido e acompanhamento (com nossa logo):*`,
    orderLink,
    '',
    `⭐ *Avalie seu pedido:* Ao acessar os dados do seu pedido pelo link acima, aproveite para realizar a sua avaliação do nosso *Atendimento* e da *Refeição escolhida*!`,
    '',
    `💛 *Muito obrigado pela preferência!* É uma alegria preparar o seu pedido no *${ctx.restaurantName}*.`,
    `📲 *Compartilhe com seus amigos:* Indique nosso cardápio para quem você gosta: ${menuShareLink}`,
  ];
}

const SHARE_STATUS_OPTIONS: ShareStatusOption[] = [
  {
    id: 'pix_pending',
    title: 'Aguardando Confirmação do Pagamento Via Pix',
    subtitle: 'Solicita ou confirma o envio do comprovante Pix ao cliente',
    orderStatus: 'awaiting_confirmation',
    paymentStatus: 'pending',
    Icon: QrCode,
    buildMessage: ctx =>
      [
        `Olá, *${ctx.order.customer_name}*! 👋`,
        `Recebemos o seu pedido *FD${ctx.order.reference}* em *${ctx.restaurantName}* no valor de *${money(ctx.order.total)}*.`,
        '',
        `📌 *Status atual:* Aguardando Confirmação do Pagamento Via Pix`,
        'Assim que confirmarmos o comprovante Pix, iniciaremos o preparo imediatamente!',
        '',
        ...buildWhatsappFooter(ctx),
      ].join('\n'),
  },
  {
    id: 'preparing',
    title: 'Pedido em Preparo',
    subtitle: 'Informa que o pedido foi confirmado e já está na cozinha',
    orderStatus: 'preparing',
    paymentStatus: 'confirmed',
    Icon: UtensilsCrossed,
    buildMessage: ctx =>
      [
        `Olá, *${ctx.order.customer_name}*! 👨‍🍳🔥`,
        `O seu pedido *FD${ctx.order.reference}* em *${ctx.restaurantName}* já está *Em Preparo* com todo capricho!`,
        '',
        `📌 *Status atual:* Pedido em Preparo`,
        ...ctx.order.items.map(i => `• ${i.quantity}× ${i.name}`),
        `Total: *${money(ctx.order.total)}*`,
        '',
        ...buildWhatsappFooter(ctx),
      ].join('\n'),
  },
  {
    id: 'delivering',
    title: 'Pedido Enviado',
    subtitle: 'Informa ao cliente que o pedido saiu para entrega',
    orderStatus: 'delivering',
    Icon: Truck,
    buildMessage: ctx =>
      [
        `Olá, *${ctx.order.customer_name}*! 🛵💨`,
        `Boa notícia! O seu pedido *FD${ctx.order.reference}* do *${ctx.restaurantName}* acabou de sair para entrega!`,
        '',
        `📌 *Status atual:* Pedido Enviado`,
        ctx.order.address ? `📍 *Endereço:* ${ctx.order.address}` : '',
        '',
        ...buildWhatsappFooter(ctx),
      ]
        .filter(Boolean)
        .join('\n'),
  },
  {
    id: 'pickup_ready',
    title: 'Aguardando Retirada',
    subtitle: 'Avise que o pedido está pronto para retirada no balcão',
    orderStatus: 'ready',
    Icon: Store,
    buildMessage: ctx =>
      [
        `Olá, *${ctx.order.customer_name}*! 🛍️✨`,
        `O seu pedido *FD${ctx.order.reference}* em *${ctx.restaurantName}* já está pronto e *Aguardando Retirada*!`,
        '',
        `📌 *Status atual:* Aguardando Retirada`,
        ctx.restaurantAddress ? `🏪 *Local de retirada:* ${ctx.restaurantAddress}` : '',
        '',
        ...buildWhatsappFooter(ctx),
      ]
        .filter(Boolean)
        .join('\n'),
  },
  {
    id: 'completed',
    title: 'Pedido Concluído / Entregue',
    subtitle: 'Agradece o cliente, convida a avaliar e compartilhar com amigos',
    orderStatus: 'completed',
    paymentStatus: 'confirmed',
    Icon: PackageCheck,
    buildMessage: ctx =>
      [
        `Olá, *${ctx.order.customer_name}*! ✅`,
        `O seu pedido *FD${ctx.order.reference}* em *${ctx.restaurantName}* foi concluído. Bom apetite!`,
        '',
        ...buildWhatsappFooter(ctx),
      ].join('\n'),
  },
  {
    id: 'cancelled',
    title: 'Pedido Cancelado',
    subtitle: 'Comunica o cancelamento do pedido ao cliente',
    orderStatus: 'cancelled',
    Icon: Ban,
    buildMessage: ctx =>
      [
        `Olá, *${ctx.order.customer_name}*.`,
        `Informamos que o pedido *FD${ctx.order.reference}* em *${ctx.restaurantName}* foi *Cancelado*.`,
        'Caso tenha dúvidas ou deseje fazer um novo pedido, estamos à disposição por aqui!',
        `Cardápio: ${ctx.origin}/restaurantes/${encodeURIComponent(ctx.restaurantSlug || 'brasa-burger')}`,
      ].join('\n'),
  },
];

type EditableItem = {
  name: string;
  quantity: number;
  unitReais: string;
};

type EditDraft = {
  id: string;
  reference: number;
  customer_name: string;
  customer_phone: string;
  fulfillment: Fulfillment;
  address: string;
  notes: string;
  payment_method: 'pix' | 'cash' | 'card';
  payment_status: 'pending' | 'confirmed' | 'rejected';
  status: OrderStatus;
  deliveryReais: string;
  items: EditableItem[];
};

function toSaoPauloDateStr(isoOrDate: string | Date): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(
      typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
    );
  } catch {
    return '';
  }
}

function centsToInput(cents: number): string {
  return (Math.max(0, Math.round(cents)) / 100).toFixed(2).replace('.', ',');
}

function inputToCents(raw: string): number {
  const normalized = raw.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

function toWhatsappPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

function defaultShareOptionForOrder(order: Order): ShareStatusOption {
  if (order.status === 'awaiting_confirmation' && order.payment_method === 'pix') return SHARE_STATUS_OPTIONS[0];
  if (order.status === 'preparing' || order.status === 'accepted') return SHARE_STATUS_OPTIONS[1];
  if (order.status === 'delivering') return SHARE_STATUS_OPTIONS[2];
  if (order.status === 'ready') return SHARE_STATUS_OPTIONS[3];
  if (order.status === 'completed') return SHARE_STATUS_OPTIONS[4];
  if (order.status === 'cancelled') return SHARE_STATUS_OPTIONS[5];
  return SHARE_STATUS_OPTIONS[1];
}

export default function OrdersPanel({
  restaurantId,
  restaurantName = 'Restaurante',
  restaurantSlug = 'brasa-burger',
  restaurantLogo = null,
  restaurantAddress = '',
  onOrdersChange,
  onReviewsChange,
}: {
  restaurantId: string;
  restaurantName?: string;
  restaurantSlug?: string;
  restaurantLogo?: string | null;
  restaurantAddress?: string;
  onOrdersChange?: (orders: Order[]) => void;
  onReviewsChange?: (reviews: OrderReviewSummary[]) => void;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<OrderReviewSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [working, setWorking] = useState('');
  const [now, setNow] = useState(() => Date.now());

  // Filtros
  const [period, setPeriod] = useState<PeriodPreset>('all');
  const [dateFrom, setDateFrom] = useState(() => toSaoPauloDateStr(new Date()));
  const [dateTo, setDateTo] = useState(() => toSaoPauloDateStr(new Date()));
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Compartilhar Andamento
  const [shareOrder, setShareOrder] = useState<Order | null>(null);
  const [selectedShareId, setSelectedShareId] = useState<string>('pix_pending');
  const [shareMessage, setShareMessage] = useState('');

  // Modal Editar Pedido
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);

  const load = useCallback(async () => {
    const db = adminClient();
    const [ordRes, revRes] = await Promise.all([
      db.rpc('fooddf_restaurant_orders', { rid: restaurantId }),
      db
        .from('order_reviews')
        .select('id,order_reference,rating,comment,created_at')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false }),
    ]);
    if (ordRes.error) {
      setError('Não foi possível carregar os pedidos. Tente novamente.');
    } else {
      const list = (ordRes.data as Order[]) || [];
      setOrders(list);
      onOrdersChange?.(list);
      setError('');
    }
    if (!revRes.error && Array.isArray(revRes.data)) {
      const revList = revRes.data as OrderReviewSummary[];
      setReviews(revList);
      onReviewsChange?.(revList);
    }
    setLoading(false);
  }, [restaurantId, onOrdersChange, onReviewsChange]);

  useEffect(() => {
    void load();
    const t = setInterval(() => {
      void load();
      setNow(Date.now());
    }, 15000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const inSelectedPeriod = useCallback(
    (createdAt: string) => {
      if (period === 'all') return true;
      const todayStr = toSaoPauloDateStr(new Date());
      const itemDay = toSaoPauloDateStr(createdAt);
      if (!itemDay) return true;
      if (period === 'today') return itemDay === todayStr;
      if (period === '7d') {
        const d = new Date();
        d.setDate(d.getDate() - 6);
        return itemDay >= toSaoPauloDateStr(d) && itemDay <= todayStr;
      }
      if (period === '30d') {
        const d = new Date();
        d.setDate(d.getDate() - 29);
        return itemDay >= toSaoPauloDateStr(d) && itemDay <= todayStr;
      }
      if (period === 'month') return itemDay.slice(0, 7) === todayStr.slice(0, 7);
      if (period === 'custom') {
        if (dateFrom && itemDay < dateFrom) return false;
        if (dateTo && itemDay > dateTo) return false;
        return true;
      }
      return true;
    },
    [period, dateFrom, dateTo]
  );

  const periodOrders = useMemo(() => orders.filter(o => inSelectedPeriod(o.created_at)), [orders, inSelectedPeriod]);
  const periodReviews = useMemo(() => reviews.filter(r => inSelectedPeriod(r.created_at)), [reviews, inSelectedPeriod]);

  const reviewsByRef = useMemo(() => {
    const map = new Map<string, OrderReviewSummary>();
    for (const r of reviews) map.set(r.order_reference.toUpperCase(), r);
    return map;
  }, [reviews]);

  const kpis = useMemo(() => {
    const valid = periodOrders.filter(o => o.status !== 'cancelled');
    const pending = periodOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
    const awaiting = pending.filter(o => o.status === 'awaiting_confirmation');
    const completed = periodOrders.filter(o => o.status === 'completed');
    const cancelled = periodOrders.filter(o => o.status === 'cancelled');

    const revenue = valid.reduce((sum, o) => sum + (o.total || 0), 0);
    const completedRevenue = completed.reduce((sum, o) => sum + (o.total || 0), 0);
    const cancelledTotal = cancelled.reduce((sum, o) => sum + (o.total || 0), 0);
    const avgTicket = valid.length > 0 ? Math.round(revenue / valid.length) : 0;

    const reviewsCount = periodReviews.length;
    const avgRating =
      reviewsCount > 0
        ? Math.round((periodReviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviewsCount) * 10) / 10
        : 0;

    return {
      revenue,
      validCount: valid.length,
      avgTicket,
      pendingCount: pending.length,
      awaitingCount: awaiting.length,
      completedCount: completed.length,
      completedRevenue,
      cancelledCount: cancelled.length,
      cancelledTotal,
      reviewsCount,
      avgRating,
    };
  }, [periodOrders, periodReviews]);

  const visibleOrders = useMemo(() => {
    const q = searchTerm.trim().toLocaleLowerCase('pt-BR');
    return periodOrders.filter(o => {
      if (statusFilter === 'pending' && (o.status === 'completed' || o.status === 'cancelled')) return false;
      if (statusFilter === 'completed' && o.status !== 'completed') return false;
      if (statusFilter === 'cancelled' && o.status !== 'cancelled') return false;
      if (!q) return true;
      const refStr = `fd${o.reference}`;
      return (
        refStr.includes(q) ||
        o.customer_name.toLocaleLowerCase('pt-BR').includes(q) ||
        o.customer_phone.includes(q.replace(/\D/g, '') || q)
      );
    });
  }, [periodOrders, statusFilter, searchTerm]);

  function makeShareCtx(order: Order): ShareContext {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fooddf.vercel.app';
    return {
      order,
      restaurantName,
      restaurantSlug,
      restaurantAddress,
      origin,
    };
  }

  async function advance(order: Order) {
    setWorking(order.id);
    setError('');
    const { error: rpcErr } = await adminClient().rpc('fooddf_advance_order', {
      rid: restaurantId,
      order_id: order.id,
      expected_status: order.status,
    });
    if (rpcErr) setError(rpcErr.message);
    await load();
    if (rpcErr) setError(rpcErr.message);
    setWorking('');
  }

  function openShareModal(order: Order) {
    const opt = defaultShareOptionForOrder(order);
    setShareOrder(order);
    setSelectedShareId(opt.id);
    setShareMessage(opt.buildMessage(makeShareCtx(order)));
  }

  function selectShareOption(opt: ShareStatusOption, order: Order) {
    setSelectedShareId(opt.id);
    setShareMessage(opt.buildMessage(makeShareCtx(order)));
  }

  async function applyShareStatus(sendWhatsapp: boolean, overrideOpt?: ShareStatusOption) {
    if (!shareOrder) return;
    const opt = overrideOpt || SHARE_STATUS_OPTIONS.find(o => o.id === selectedShareId) || SHARE_STATUS_OPTIONS[0];
    const textToSend = overrideOpt ? overrideOpt.buildMessage(makeShareCtx(shareOrder)) : shareMessage;

    if (sendWhatsapp) {
      const phone = toWhatsappPhone(shareOrder.customer_phone);
      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(textToSend)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }

    setWorking(shareOrder.id);
    setError('');
    const { error: rpcErr } = await adminClient().rpc('fooddf_set_order_status', {
      rid: restaurantId,
      p_order_id: shareOrder.id,
      p_status: opt.orderStatus,
      p_payment_status: opt.paymentStatus ?? null,
    });
    if (rpcErr) {
      setError(rpcErr.message);
    } else {
      setToast(sendWhatsapp ? 'Status atualizado e enviado no WhatsApp com a logo!' : 'Status do pedido atualizado!');
      setShareOrder(null);
      await load();
    }
    setWorking('');
  }

  async function cancelOrderQuick(order: Order) {
    if (!window.confirm(`Cancelar o pedido FD${order.reference}? Ele deixará de somar no indicador de faturamento.`))
      return;
    setWorking(order.id);
    setError('');
    const { error: rpcErr } = await adminClient().rpc('fooddf_set_order_status', {
      rid: restaurantId,
      p_order_id: order.id,
      p_status: 'cancelled',
      p_payment_status: null,
    });
    if (rpcErr) setError(rpcErr.message);
    else {
      setToast(`Pedido FD${order.reference} marcado como cancelado.`);
      await load();
    }
    setWorking('');
  }

  async function removeOrder(order: Order) {
    if (
      !window.confirm(
        `Remover permanentemente o pedido FD${order.reference} de ${order.customer_name}? Os indicadores de faturamento serão recalculados imediatamente.`
      )
    ) {
      return;
    }
    setWorking(order.id);
    setError('');
    const { error: rpcErr } = await adminClient().rpc('fooddf_remove_order', {
      rid: restaurantId,
      p_order_id: order.id,
    });
    if (rpcErr) setError(rpcErr.message);
    else {
      setToast(`Pedido FD${order.reference} removido.`);
      await load();
    }
    setWorking('');
  }

  function openEditModal(order: Order) {
    const inferredFee =
      order.fulfillment === 'pickup' ? 0 : typeof order.delivery_fee === 'number' ? order.delivery_fee : 0;
    const inferredSubtotal =
      typeof order.subtotal === 'number' && order.subtotal > 0
        ? order.subtotal
        : Math.max(100, order.total - inferredFee);
    const totalQty = Math.max(1, order.items.reduce((s, i) => s + (i.quantity || 1), 0));
    const fallbackUnit = Math.max(100, Math.round(inferredSubtotal / totalQty));

    setEditDraft({
      id: order.id,
      reference: order.reference,
      customer_name: order.customer_name,
      customer_phone: formatContactPhone(order.customer_phone),
      fulfillment: order.fulfillment,
      address: order.address || '',
      notes: order.notes || '',
      payment_method:
        order.payment_method === 'pix' || order.payment_method === 'card' ? order.payment_method : 'cash',
      payment_status:
        order.payment_status === 'confirmed' || order.payment_status === 'rejected'
          ? order.payment_status
          : 'pending',
      status: order.status,
      deliveryReais: centsToInput(inferredFee),
      items: order.items.length
        ? order.items.map(item => {
            const unit =
              typeof item.unitPrice === 'number' && item.unitPrice > 0
                ? item.unitPrice
                : typeof item.total === 'number' && item.quantity > 0
                  ? Math.round(item.total / item.quantity)
                  : fallbackUnit;
            return {
              name: item.name,
              quantity: Math.max(1, item.quantity || 1),
              unitReais: centsToInput(unit),
            };
          })
        : [{ name: 'Item do pedido', quantity: 1, unitReais: centsToInput(inferredSubtotal) }],
    });
  }

  const editTotals = useMemo(() => {
    if (!editDraft) return { subtotal: 0, deliveryFee: 0, total: 0 };
    const subtotal = editDraft.items.reduce((sum, item) => {
      return sum + inputToCents(item.unitReais) * Math.max(1, Number(item.quantity) || 1);
    }, 0);
    const deliveryFee = editDraft.fulfillment === 'pickup' ? 0 : inputToCents(editDraft.deliveryReais);
    return { subtotal, deliveryFee, total: subtotal + deliveryFee };
  }, [editDraft]);

  async function saveEditedOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!editDraft) return;
    if (editDraft.customer_name.trim().length < 2) {
      setError('Informe o nome do cliente.');
      return;
    }
    const digits = editDraft.customer_phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) {
      setError('Informe um WhatsApp válido com DDD.');
      return;
    }
    const preparedItems = editDraft.items
      .filter(i => i.name.trim().length > 0)
      .map(i => {
        const qty = Math.max(1, Math.min(50, Math.round(Number(i.quantity) || 1)));
        const unitPrice = Math.max(1, inputToCents(i.unitReais));
        return {
          name: i.name.trim(),
          quantity: qty,
          unitPrice,
          total: unitPrice * qty,
        };
      });
    if (!preparedItems.length) {
      setError('Adicione pelo menos 1 item válido ao pedido.');
      return;
    }
    const subtotal = preparedItems.reduce((s, i) => s + i.total, 0);
    const deliveryFee = editDraft.fulfillment === 'pickup' ? 0 : inputToCents(editDraft.deliveryReais);
    const total = subtotal + deliveryFee;

    setWorking(editDraft.id);
    setError('');
    const { error: rpcErr } = await adminClient().rpc('fooddf_update_order', {
      rid: restaurantId,
      p_order_id: editDraft.id,
      p_customer_name: editDraft.customer_name.trim(),
      p_customer_phone: digits,
      p_fulfillment: editDraft.fulfillment,
      p_address: editDraft.fulfillment === 'delivery' ? editDraft.address.trim() : '',
      p_notes: editDraft.notes.trim(),
      p_payment_method: editDraft.payment_method,
      p_payment_status: editDraft.payment_status,
      p_status: editDraft.status,
      p_items: preparedItems,
      p_subtotal: subtotal,
      p_delivery_fee: deliveryFee,
      p_total: total,
    });
    if (rpcErr) {
      setError(rpcErr.message);
    } else {
      setToast(`Pedido FD${editDraft.reference} atualizado! Indicadores recalculados.`);
      setEditDraft(null);
      await load();
    }
    setWorking('');
  }

  return (
    <div className="order-management">
      <div className="admin-tip">
        <Clock3 size={18} />
        Todos os pedidos enviados pelo WhatsApp aparecem aqui automaticamente. Use &ldquo;Compartilhar Andamento&rdquo; para enviar o status com a logo, agradecimento e link de avaliação ao cliente.
      </div>

      {/* FILTRO POR PERÍODO E BUSCA */}
      <section className="admin-card orders-toolbar" aria-label="Filtros de período e pedidos">
        <div className="orders-toolbar-top">
          <div className="orders-period-group">
            <span className="orders-filter-label">
              <Calendar size={15} /> Período:
            </span>
            <div className="orders-period-pills" role="group" aria-label="Filtrar por período">
              {(
                [
                  ['all', 'Todo o período'],
                  ['today', 'Hoje'],
                  ['7d', 'Últimos 7 dias'],
                  ['30d', 'Últimos 30 dias'],
                  ['month', 'Este mês'],
                  ['custom', 'Personalizado'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={period === id ? 'active' : ''}
                  onClick={() => setPeriod(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="button outline small" onClick={() => void load()}>
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>

        {period === 'custom' && (
          <div className="orders-custom-dates">
            <label>
              <span>Data inicial</span>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </label>
            <label>
              <span>Data final</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </label>
          </div>
        )}

        <div className="orders-filter-row">
          <label className="orders-search-input">
            <Search size={17} />
            <input
              placeholder="Buscar por nº FD, cliente ou WhatsApp"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button type="button" aria-label="Limpar busca" onClick={() => setSearchTerm('')}>
                <X size={15} />
              </button>
            )}
          </label>

          <div className="orders-status-pills" role="group" aria-label="Filtrar por status">
            {(
              [
                ['all', `Todos (${periodOrders.length})`],
                ['pending', `Pendentes (${kpis.pendingCount})`],
                ['completed', `Concluídos (${kpis.completedCount})`],
                ['cancelled', `Cancelados (${kpis.cancelledCount})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={statusFilter === id ? 'active' : ''}
                onClick={() => setStatusFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* INDICADORES DE FATURAMENTO, PENDENTES, CONCLUÍDOS, CANCELADOS E AVALIAÇÕES */}
      <div className="orders-kpi-grid six">
        <section className="orders-kpi-card is-revenue">
          <span className="orders-kpi-icon">
            <DollarSign size={23} />
          </span>
          <div>
            <p>Faturamento</p>
            <strong>{money(kpis.revenue)}</strong>
            <small>
              {kpis.validCount} {kpis.validCount === 1 ? 'pedido válido' : 'pedidos válidos'} · Ticket{' '}
              {money(kpis.avgTicket)}
            </small>
          </div>
        </section>

        <section className={`orders-kpi-card ${kpis.pendingCount > 0 ? 'is-pending' : ''}`}>
          <span className="orders-kpi-icon">
            <Clock3 size={23} />
          </span>
          <div>
            <p>Pedidos pendentes</p>
            <strong>{kpis.pendingCount}</strong>
            <small>
              {kpis.awaitingCount > 0 ? `${kpis.awaitingCount} aguardando confirmação` : 'Em preparo ou entrega'}
            </small>
          </div>
        </section>

        <section className="orders-kpi-card is-completed">
          <span className="orders-kpi-icon">
            <CheckCircle2 size={23} />
          </span>
          <div>
            <p>Pedidos concluídos</p>
            <strong>{kpis.completedCount}</strong>
            <small>{money(kpis.completedRevenue)} entregues/retirados</small>
          </div>
        </section>

        <section className={`orders-kpi-card ${kpis.cancelledCount > 0 ? 'is-cancelled' : ''}`}>
          <span className="orders-kpi-icon">
            <Ban size={23} />
          </span>
          <div>
            <p>Pedidos cancelados</p>
            <strong>{kpis.cancelledCount}</strong>
            <small>{money(kpis.cancelledTotal)} fora do faturamento</small>
          </div>
        </section>

        <section className="orders-kpi-card is-rating">
          <span className="orders-kpi-icon">
            <Award size={23} />
          </span>
          <div>
            <p>Avaliações recebidas</p>
            <strong>{kpis.reviewsCount}</strong>
            <small>Contabilizadas (1 por pedido)</small>
          </div>
        </section>

        <section className="orders-kpi-card is-rating">
          <span className="orders-kpi-icon">
            <Star size={23} />
          </span>
          <div>
            <p>Média da nota</p>
            <strong>{kpis.reviewsCount > 0 ? `${kpis.avgRating.toFixed(1).replace('.', ',')} ★` : '—'}</strong>
            <small>{kpis.reviewsCount > 0 ? 'Nota média do atendimento' : 'Aguardando 1ª avaliação'}</small>
          </div>
        </section>
      </div>

      <div className="admin-section-title">
        <h2>Pedidos recebidos ({visibleOrders.length})</h2>
      </div>

      {error && (
        <div className="admin-alert" role="alert">
          <span>{error}</span>
          <button type="button" aria-label="Fechar erro" onClick={() => setError('')}>
            <X size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <p>Carregando pedidos…</p>
      ) : !visibleOrders.length ? (
        <div className="admin-card order-empty">
          <ShoppingBag size={30} />
          <h3>{orders.length ? 'Nenhum pedido neste filtro' : 'Nenhum pedido registrado ainda'}</h3>
          <p>
            {orders.length
              ? 'Altere o período ou o filtro de status acima para visualizar outros pedidos.'
              : 'Assim que um cliente enviar um pedido pelo WhatsApp no seu cardápio, ele aparecerá automaticamente aqui.'}
          </p>
        </div>
      ) : (
        <div className="order-grid">
          {visibleOrders.map(o => {
            const isPixPending =
              o.status === 'awaiting_confirmation' &&
              o.payment_method === 'pix' &&
              o.payment_status === 'pending';
            const orderRev = reviewsByRef.get(`FD${o.reference}`);
            return (
              <article
                className={`admin-card order-card ${o.status === 'cancelled' ? 'is-cancelled' : ''}`}
                key={o.id}
              >
                <div className="order-card-head">
                  <div>
                    <span className="order-overline">
                      {o.fulfillment === 'delivery' ? 'ENTREGA' : 'RETIRADA'}
                    </span>
                    <h3>Pedido FD{o.reference}</h3>
                    <small>{new Date(o.created_at).toLocaleString('pt-BR')}</small>
                  </div>
                  <div className="order-head-badges">
                    <strong className={`order-status-pill status-${o.status}`}>
                      {isPixPending ? 'Aguardando Pix' : statusLabel(o.status, o.fulfillment)}
                    </strong>
                    {orderRev && (
                      <span className="order-evaluated-badge" title={orderRev.comment || 'Pedido avaliado'}>
                        <Star size={12} fill="#ffb800" color="#ffb800" /> {orderRev.rating.toFixed(1).replace('.', ',')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="order-timers">
                  <span>
                    <Clock3 size={15} /> Tempo total: <b>{elapsedSince(o.created_at, now)}</b>
                  </span>
                  <span>
                    Etapa atual: <b>{elapsedSince(o.history.at(-1)?.at || o.created_at, now)}</b>
                  </span>
                </div>

                <div className="order-customer">
                  <strong>{o.customer_name}</strong>
                  <span>WhatsApp: {formatContactPhone(o.customer_phone)}</span>
                  {o.address && <span>{o.address}</span>}
                </div>

                <ul>
                  {o.items.map((item, i) => (
                    <li key={i}>
                      <span>
                        {item.quantity}× {item.name}
                      </span>
                      {typeof item.total === 'number' && <b>{money(item.total)}</b>}
                    </li>
                  ))}
                </ul>

                {o.notes && (
                  <p className="order-notes-line">
                    <strong>Observação:</strong> {o.notes}
                  </p>
                )}

                {orderRev?.comment && (
                  <p className="order-review-quote">
                    <Star size={13} fill="#ffb800" color="#ffb800" /> &ldquo;{orderRev.comment}&rdquo;
                  </p>
                )}

                <div className="order-card-footer">
                  <strong>{money(o.total)}</strong>
                  <span>
                    Pagamento:{' '}
                    {o.payment_method === 'pix' ? 'Pix' : o.payment_method === 'cash' ? 'Dinheiro' : 'Cartão'} ·{' '}
                    {o.payment_status === 'confirmed'
                      ? 'confirmado'
                      : o.payment_status === 'rejected'
                        ? 'recusado'
                        : 'a conferir'}
                  </span>
                </div>

                <ol className="order-history">
                  {o.history.map((h, i) => (
                    <li key={i}>
                      <span>{statusLabel(h.status, o.fulfillment)}</span>
                      <time>
                        {new Date(h.at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </li>
                  ))}
                </ol>

                <div className="order-card-actions">
                  {nextLabel(o.status, o.fulfillment) && (
                    <button
                      type="button"
                      className="button primary wide"
                      disabled={Boolean(working)}
                      onClick={() => void advance(o)}
                    >
                      {working === o.id ? 'Atualizando…' : nextLabel(o.status, o.fulfillment)}
                    </button>
                  )}

                  <button
                    type="button"
                    className="button whatsapp-share wide"
                    disabled={Boolean(working)}
                    onClick={() => openShareModal(o)}
                  >
                    <Share2 size={17} />
                    Compartilhar Andamento
                  </button>

                  <div className="order-secondary-actions">
                    <button
                      type="button"
                      className="button outline small"
                      disabled={Boolean(working)}
                      onClick={() => openEditModal(o)}
                    >
                      <Edit3 size={15} />
                      Editar
                    </button>

                    {o.status !== 'cancelled' && (
                      <button
                        type="button"
                        className="button outline small order-cancel-btn"
                        disabled={Boolean(working)}
                        onClick={() => void cancelOrderQuick(o)}
                      >
                        <Ban size={15} />
                        Cancelar
                      </button>
                    )}

                    <button
                      type="button"
                      className="button outline small order-delete-btn"
                      disabled={Boolean(working)}
                      aria-label={`Remover pedido FD${o.reference}`}
                      onClick={() => void removeOrder(o)}
                    >
                      <Trash2 size={15} />
                      Remover
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* MODAL: COMPARTILHAR ANDAMENTO PELO WHATSAPP COM LOGO, AGRADECIMENTO E AVALIAÇÃO */}
      {shareOrder && (
        <div className="admin-modal-backdrop" onClick={() => setShareOrder(null)}>
          <section
            className="admin-modal order-modal-wide"
            role="dialog"
            aria-modal="true"
            aria-label={`Compartilhar andamento do pedido FD${shareOrder.reference}`}
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="admin-modal-close"
              aria-label="Fechar janela"
              onClick={() => setShareOrder(null)}
            >
              <X size={21} />
            </button>

            <div className="share-modal-head">
              <span className="share-modal-badge">
                <MessageCircle size={18} /> Pedido FD{shareOrder.reference}
              </span>
              <h2>Compartilhar Andamento</h2>
              <p>
                Escolha o status para enviar pelo WhatsApp para <strong>{shareOrder.customer_name}</strong> (
                {formatContactPhone(shareOrder.customer_phone)}) com sua logo de compartilhamento, mensagem de agradecimento, convite para amigos e link de avaliação.
              </p>
            </div>

            {/* PRÉVIA DA LOGO DE COMPARTILHAMENTO 1:1 INCLUÍDA NO TEMPLATE */}
            <div className="share-logo-banner">
              <div className="share-logo-thumb">
                <FoodImage kind={restaurantLogo || 'logo'} label={restaurantName} />
              </div>
              <div className="share-logo-copy">
                <strong>Logo de compartilhamento ativa ({restaurantName})</strong>
                <small>
                  O link do pedido carrega automaticamente sua logo 1:1 na prévia do WhatsApp do cliente.
                </small>
              </div>
              <a
                className="button outline small"
                href={`/api/og/restaurant?slug=${encodeURIComponent(restaurantSlug)}&pedido=FD${shareOrder.reference}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={14} />
                Ver logo
              </a>
            </div>

            <div className="share-status-list" role="radiogroup" aria-label="Status do andamento do pedido">
              {SHARE_STATUS_OPTIONS.map(opt => {
                const selected = selectedShareId === opt.id;
                const Icon = opt.Icon;
                return (
                  <div
                    key={opt.id}
                    className={`share-status-option ${selected ? 'selected' : ''}`}
                    onClick={() => selectShareOption(opt, shareOrder)}
                    role="radio"
                    aria-checked={selected}
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectShareOption(opt, shareOrder);
                      }
                    }}
                  >
                    <span className="share-status-icon">
                      <Icon size={20} />
                    </span>
                    <div className="share-status-info">
                      <strong>{opt.title}</strong>
                      <small>{opt.subtitle}</small>
                    </div>
                    <button
                      type="button"
                      className="share-quick-wa-btn"
                      onClick={e => {
                        e.stopPropagation();
                        selectShareOption(opt, shareOrder);
                        void applyShareStatus(true, opt);
                      }}
                    >
                      <MessageCircle size={15} />
                      Enviar WhatsApp
                    </button>
                  </div>
                );
              })}
            </div>

            <label className="share-message-preview">
              <span>Template da mensagem para o WhatsApp do cliente (com logo, agradecimento e avaliação):</span>
              <textarea
                rows={8}
                value={shareMessage}
                onChange={e => setShareMessage(e.target.value)}
              />
            </label>

            <div className="share-modal-actions">
              <button
                type="button"
                className="button outline"
                disabled={Boolean(working)}
                onClick={() => void applyShareStatus(false)}
              >
                <Check size={17} />
                Apenas salvar status
              </button>
              <button
                type="button"
                className="button whatsapp-share"
                disabled={Boolean(working)}
                onClick={() => void applyShareStatus(true)}
              >
                <MessageCircle size={19} />
                Enviar Status pelo WhatsApp
              </button>
            </div>
          </section>
        </div>
      )}

      {/* MODAL: EDITAR PEDIDO */}
      {editDraft && (
        <div className="admin-modal-backdrop" onClick={() => setEditDraft(null)}>
          <section
            className="admin-modal order-modal-wide"
            role="dialog"
            aria-modal="true"
            aria-label={`Editar pedido FD${editDraft.reference}`}
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="admin-modal-close"
              aria-label="Fechar edição"
              onClick={() => setEditDraft(null)}
            >
              <X size={21} />
            </button>

            <h2>Editar Pedido FD{editDraft.reference}</h2>
            <p>Altere itens, valores, entrega ou status. O indicador de faturamento será atualizado automaticamente.</p>

            <form onSubmit={saveEditedOrder} className="edit-order-form">
              <div className="admin-fields two">
                <label className="admin-field">
                  <span>Nome do cliente</span>
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    value={editDraft.customer_name}
                    onChange={e => setEditDraft({ ...editDraft, customer_name: e.target.value })}
                  />
                </label>
                <label className="admin-field">
                  <span>WhatsApp do cliente</span>
                  <input
                    required
                    type="tel"
                    value={editDraft.customer_phone}
                    onChange={e =>
                      setEditDraft({ ...editDraft, customer_phone: formatContactPhone(e.target.value) })
                    }
                  />
                </label>
              </div>

              <div className="admin-fields three">
                <label className="admin-field">
                  <span>Status do pedido</span>
                  <select
                    value={editDraft.status}
                    onChange={e => setEditDraft({ ...editDraft, status: e.target.value as OrderStatus })}
                  >
                    <option value="awaiting_confirmation">Aguardando confirmação</option>
                    <option value="preparing">Pedido em preparo</option>
                    <option value="ready">Aguardando retirada / Embalado</option>
                    <option value="delivering">Pedido enviado</option>
                    <option value="completed">Concluído / Entregue</option>
                    <option value="cancelled">Cancelado (não soma faturamento)</option>
                  </select>
                </label>

                <label className="admin-field">
                  <span>Forma de pagamento</span>
                  <select
                    value={editDraft.payment_method}
                    onChange={e =>
                      setEditDraft({
                        ...editDraft,
                        payment_method: e.target.value as 'pix' | 'cash' | 'card',
                      })
                    }
                  >
                    <option value="pix">Pix</option>
                    <option value="cash">Dinheiro</option>
                    <option value="card">Cartão</option>
                  </select>
                </label>

                <label className="admin-field">
                  <span>Status do pagamento</span>
                  <select
                    value={editDraft.payment_status}
                    onChange={e =>
                      setEditDraft({
                        ...editDraft,
                        payment_status: e.target.value as 'pending' | 'confirmed' | 'rejected',
                      })
                    }
                  >
                    <option value="pending">A conferir</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="rejected">Recusado</option>
                  </select>
                </label>
              </div>

              <div className="admin-fields two">
                <label className="admin-field">
                  <span>Recebimento</span>
                  <select
                    value={editDraft.fulfillment}
                    onChange={e => setEditDraft({ ...editDraft, fulfillment: e.target.value as Fulfillment })}
                  >
                    <option value="delivery">Entrega</option>
                    <option value="pickup">Retirada no local</option>
                  </select>
                </label>

                {editDraft.fulfillment === 'delivery' && (
                  <label className="admin-field">
                    <span>Taxa de entrega (R$)</span>
                    <input
                      inputMode="decimal"
                      value={editDraft.deliveryReais}
                      onChange={e => setEditDraft({ ...editDraft, deliveryReais: e.target.value })}
                    />
                  </label>
                )}
              </div>

              {editDraft.fulfillment === 'delivery' && (
                <label className="admin-field">
                  <span>Endereço de entrega</span>
                  <input
                    required
                    value={editDraft.address}
                    onChange={e => setEditDraft({ ...editDraft, address: e.target.value })}
                  />
                </label>
              )}

              <div className="edit-order-items">
                <div className="edit-order-items-head">
                  <strong>Itens do pedido</strong>
                  <button
                    type="button"
                    className="button outline small"
                    onClick={() =>
                      setEditDraft({
                        ...editDraft,
                        items: [...editDraft.items, { name: '', quantity: 1, unitReais: '0,00' }],
                      })
                    }
                  >
                    <Plus size={15} />
                    Adicionar item
                  </button>
                </div>

                {editDraft.items.map((item, idx) => (
                  <div className="edit-order-item-row" key={idx}>
                    <input
                      required
                      placeholder="Nome do produto"
                      aria-label={`Produto ${idx + 1}`}
                      value={item.name}
                      onChange={e =>
                        setEditDraft({
                          ...editDraft,
                          items: editDraft.items.map((row, j) =>
                            j === idx ? { ...row, name: e.target.value } : row
                          ),
                        })
                      }
                    />
                    <input
                      type="number"
                      min={1}
                      max={50}
                      aria-label={`Quantidade ${idx + 1}`}
                      value={item.quantity}
                      onChange={e =>
                        setEditDraft({
                          ...editDraft,
                          items: editDraft.items.map((row, j) =>
                            j === idx ? { ...row, quantity: Math.max(1, Number(e.target.value) || 1) } : row
                          ),
                        })
                      }
                    />
                    <input
                      inputMode="decimal"
                      placeholder="0,00"
                      aria-label={`Valor unitário ${idx + 1}`}
                      value={item.unitReais}
                      onChange={e =>
                        setEditDraft({
                          ...editDraft,
                          items: editDraft.items.map((row, j) =>
                            j === idx ? { ...row, unitReais: e.target.value } : row
                          ),
                        })
                      }
                    />
                    {editDraft.items.length > 1 && (
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Remover item ${idx + 1}`}
                        onClick={() =>
                          setEditDraft({
                            ...editDraft,
                            items: editDraft.items.filter((_, j) => j !== idx),
                          })
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <label className="admin-field">
                <span>Observações</span>
                <textarea
                  rows={2}
                  value={editDraft.notes}
                  onChange={e => setEditDraft({ ...editDraft, notes: e.target.value })}
                />
              </label>

              <div className="edit-order-totals">
                <div>
                  <span>Subtotal: {money(editTotals.subtotal)}</span>
                  <span>Entrega: {money(editTotals.deliveryFee)}</span>
                </div>
                <strong>Novo Total: {money(editTotals.total)}</strong>
                {editDraft.status === 'cancelled' && (
                  <small className="cancelled-revenue-warn">
                    Pedido marcado como cancelado — este valor não será somado ao faturamento.
                  </small>
                )}
              </div>

              <div className="share-modal-actions">
                <button type="button" className="button outline" onClick={() => setEditDraft(null)}>
                  Cancelar
                </button>
                <button type="submit" className="button primary" disabled={Boolean(working)}>
                  {working === editDraft.id ? 'Salvando…' : 'Salvar alterações do pedido'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          {toast}
        </div>
      )}
    </div>
  );
}
