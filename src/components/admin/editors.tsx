'use client';
import { useState } from 'react';
import {
  Check,
  Clock3,
  Copy,
  CreditCard,
  Flame,
  Info,
  Link2,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Plus,
  QrCode,
  Smartphone,
  Sparkles,
  Store,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { formatContactPhone, type AdminProduct, type AdminRestaurant, type Category, type Hours } from '@/lib/admin';
import { hasEnabledHours, isOpenNowByHours, money, states } from '@/lib/domain';
import { getCitiesForState } from '@/lib/locations';
import { FoodImage } from '../food-image';
import { PromoHeroBanner } from '../promo-banner';
import { Field, ImageUpload, MoneyField, Toggle } from './controls';

export function BannerEditor({
  value: r,
  products,
  onChange,
  save,
  busy,
  isNew = false,
}: {
  value: AdminRestaurant;
  products: AdminProduct[];
  onChange: React.Dispatch<React.SetStateAction<AdminRestaurant | null>>;
  save: () => void;
  busy: boolean;
  isNew?: boolean;
}) {
  const [selectedMealId, setSelectedMealId] = useState('');
  const [copied, setCopied] = useState(false);

  const update = (key: keyof AdminRestaurant, value: unknown) =>
    onChange(current => (current?.id === r.id ? { ...current, [key]: value } : current));

  function handleSelectMealForBanner(productId: string) {
    setSelectedMealId(productId);
    const meal = products.find(p => p.id === productId);
    if (!meal) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fooddf.vercel.app';
    const mealUrl = `${origin}/restaurantes/${encodeURIComponent(r.slug || 'restaurante')}#refeicao-${meal.id}`;
    onChange(current =>
      current?.id === r.id
        ? {
            ...current,
            banner_enabled: true,
            banner_title: meal.name.slice(0, 80),
            banner_info: (meal.description || '').slice(0, 45),
            banner_price_from: meal.promo_price ? meal.price : current.banner_price_from ?? meal.price,
            banner_price_to: meal.promo_price ?? meal.price,
            banner_image_url: current.banner_image_url || meal.image_url || null,
            banner_link: mealUrl,
          }
        : current
    );
  }

  const infoLen = (r.banner_info || '').length;

  return (
    <form
      id="banner-form"
      onSubmit={e => {
        e.preventDefault();
        save();
      }}
      className="admin-banner-editor-stack"
    >
      <section className="admin-card">
        <div className="admin-toggle-title bordered">
          <Sparkles size={23} color="#ff5900" />
          <div>
            <h3>Exibir Banner Promocional no topo do cardápio</h3>
            <small className="admin-muted">
              Destaque um prato ou oferta especial no topo da página do seu restaurante igual ao layout oficial.
            </small>
          </div>
          <Toggle
            label="Ativar banner promocional"
            checked={Boolean(r.banner_enabled)}
            onChange={v => update('banner_enabled', v)}
          />
        </div>

        {/* INSTRUÇÕES TÉCNICAS DO BANNER EM WEBP E HD */}
        <div className="admin-banner-specs-box">
          <h4>Especificações recomendadas para melhor visualização</h4>
          <ul>
            <li>
              <strong>Tamanho recomendado:</strong> <code>1600 × 520 px</code> (ou <code>1920 × 624 px</code> em Full HD)
            </li>
            <li>
              <strong>Escala / Proporção:</strong> <code>25:8</code> panorâmica horizontal (aprox. <code>3:1</code> — posicione a refeição no lado direito da foto para harmonizar com a curva de texto à esquerda)
            </li>
            <li>
              <strong>Formato recomendado:</strong> <strong>WebP (<code>.webp</code>)</strong> para carregamento ultrarrápido (arquivos PNG/JPG enviados aqui são convertidos automaticamente para WebP em HD)
            </li>
            <li>
              <strong>Qualidade de imagem:</strong> <strong>HD (Alta Definição)</strong> bem iluminada e nítida, até 5 MB
            </li>
          </ul>
        </div>

        <fieldset disabled={isNew} style={{ border: 0, padding: 0, margin: '16px 0' }}>
          <ImageUpload
            value={r.banner_image_url || null}
            onChange={v => update('banner_image_url', v)}
            label="Enviar imagem do banner (WebP HD)"
            kind="banner"
            restaurantId={r.id}
          />
        </fieldset>
        {isNew && <p className="admin-tip">Salve o cadastro inicial da loja primeiro para enviar a imagem do banner.</p>}

        {products.length > 0 && (
          <Field
            label="Preencher a partir de uma refeição cadastrada (opcional)"
            hint="Selecionar uma refeição preenche automaticamente Título, Informações, valores e o Link direto da refeição."
          >
            <select value={selectedMealId} onChange={e => handleSelectMealForBanner(e.target.value)}>
              <option value="">Escolher refeição do cardápio…</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {money(p.promo_price ?? p.price)}
                </option>
              ))}
            </select>
          </Field>
        )}

        <div className="admin-fields two">
          <Field label="Título">
            <input
              maxLength={80}
              placeholder="Ex.: Prato da casa"
              value={r.banner_title || ''}
              onChange={e => update('banner_title', e.target.value)}
            />
          </Field>

          <Field
            label={`Informações (${infoLen}/45 caracteres)`}
            hint="Resumo curto dos ingredientes ou acompanhamento (máximo de 45 caracteres)."
          >
            <input
              maxLength={45}
              placeholder="Ex.: Bife na brasa, arroz, feijão e salada."
              value={r.banner_info || ''}
              onChange={e => update('banner_info', e.target.value.slice(0, 45))}
            />
          </Field>
        </div>

        <div className="admin-fields two">
          <MoneyField
            label="De (R$)"
            optional
            value={r.banner_price_from ?? null}
            onChange={v => update('banner_price_from', v)}
          />
          <MoneyField
            label="Por (R$)"
            optional
            value={r.banner_price_to ?? null}
            onChange={v => update('banner_price_to', v)}
          />
        </div>

        <Field
          label="Link da refeição"
          hint="Ao clicar no banner, o cliente será levado diretamente para esta refeição no cardápio."
        >
          <div className="admin-banner-link-row">
            <input
              type="text"
              maxLength={500}
              placeholder={`https://fooddf.vercel.app/restaurantes/${r.slug || 'seu-restaurante'}#refeicao-id`}
              value={r.banner_link || ''}
              onChange={e => update('banner_link', e.target.value)}
            />
            {r.banner_link && (
              <button
                type="button"
                className="button outline small"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(r.banner_link || '');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  } catch {}
                }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            )}
          </div>
        </Field>

        <button disabled={busy} className="button primary admin-mobile-save" type="submit">
          {busy ? 'Salvando…' : 'Salvar banner promocional'}
        </button>
      </section>

      {/* PRÉVIA EM TEMPO REAL EXATAMENTE IGUAL AO LAYOUT DA PÁGINA DO RESTAURANTE */}
      <section className="admin-card">
        <div className="admin-section-title">
          <h2>
            <Smartphone size={20} /> Prévia ao vivo do Banner no Cardápio
          </h2>
          <span className="admin-tag">{r.banner_enabled ? 'Visível no cardápio' : 'Desativado'}</span>
        </div>
        <PromoHeroBanner
          title={r.banner_title || 'Prato da casa'}
          info={r.banner_info || 'Bife na brasa, arroz, feijão e salada.'}
          priceFrom={r.banner_price_from ?? 2990}
          priceTo={r.banner_price_to ?? 2490}
          image={r.banner_image_url}
          fallbackCover={r.cover_url}
          link={r.banner_link}
          preview
        />
        <p className="admin-tip" style={{ marginTop: '14px' }}>
          <Info size={17} /> Após preencher Título, Informações, De e Por, clique em <strong>Salvar</strong> para exibir exatamente assim na página pública do restaurante.
        </p>
      </section>
    </form>
  );
}

export function RestaurantEditor({
  value: r,
  products = [],
  onChange,
  save,
  busy,
  isNew,
}: {
  value: AdminRestaurant;
  products?: AdminProduct[];
  onChange: React.Dispatch<React.SetStateAction<AdminRestaurant | null>>;
  save: () => void;
  busy: boolean;
  isNew: boolean;
}) {
  const [tab, setTab] = useState('Dados da loja');
  const [cepBusy, setCepBusy] = useState(false);
  const update = (key: keyof AdminRestaurant, value: unknown) =>
    onChange(current => (current?.id === r.id ? { ...current, [key]: value } : current));
  const editorCities = getCitiesForState(r.state);
  const scheduleEnabled = hasEnabledHours(r.opening_hours);
  const previewIsOpen = isOpenNowByHours(r.opening_hours, r.is_open);

  function updateOpeningHours(nextHours: Hours[]) {
    const autoOpen = isOpenNowByHours(nextHours, r.is_open);
    onChange(current =>
      current?.id === r.id ? { ...current, opening_hours: nextHours, is_open: autoOpen } : current
    );
  }

  async function handleEditorCep(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    update('postal_code', formatted);
    if (digits.length === 8) {
      setCepBusy(true);
      try {
        const res = await fetch(`/api/cep?cep=${digits}`);
        if (!res.ok) return;
        const data = await res.json();
        const streetAndNeighborhood = [data.street, data.neighborhood].filter(Boolean).join(', ');
        onChange(current =>
          current?.id === r.id
            ? {
                ...current,
                postal_code: formatted,
                state: data.uf || current.state,
                city: data.city || current.city,
                neighborhood: '',
                address: streetAndNeighborhood || current.address,
                complement: current.complement || data.complement || '',
              }
            : current
        );
      } catch {
      } finally {
        setCepBusy(false);
      }
    }
  }

  return (
    <>
      <div className="admin-tabs">
        {['Dados da loja', 'Banner promocional', 'Endereço', 'Horários'].map(t => (
          <button key={t} type="button" className={t === tab ? 'active' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Banner promocional' ? (
        <BannerEditor
          value={r}
          products={products}
          onChange={onChange}
          save={save}
          busy={busy}
          isNew={isNew}
        />
      ) : (
        <form
          id="restaurant-form"
          onSubmit={e => {
            e.preventDefault();
            save();
          }}
          className="admin-editor-grid"
        >
          <section className="admin-card">
            <h2>
              {tab === 'Dados da loja'
                ? 'Informações da loja'
                : tab === 'Endereço'
                  ? 'Onde seu restaurante fica?'
                  : 'Horários de funcionamento'}
            </h2>
            {tab === 'Dados da loja' ? (
              <>
                <fieldset disabled={isNew} className="admin-brand-uploads" style={{ border: 0, padding: 0 }}>
                  <ImageUpload
                    value={r.logo_url}
                    onChange={v => update('logo_url', v)}
                    label="Alterar logo"
                    kind="logo"
                    restaurantId={r.id}
                  />
                  <ImageUpload
                    value={r.cover_url}
                    onChange={v => update('cover_url', v)}
                    label="Alterar capa"
                    kind="hero"
                    restaurantId={r.id}
                  />
                </fieldset>
                {isNew && <p className="admin-tip">Salve o cadastro para enviar logo e capa.</p>}
                <div className="admin-fields two">
                  <Field label="Nome do restaurante">
                    <input
                      required
                      minLength={2}
                      maxLength={120}
                      value={r.name}
                      onChange={e => update('name', e.target.value)}
                      placeholder="Ex.: Brasa Burger"
                    />
                  </Field>
                  <Field label="Categoria">
                    <select value={r.cuisine} onChange={e => update('cuisine', e.target.value)}>
                      {[
                        'Restaurante',
                        'Lanchonete',
                        'Pizzaria',
                        'Cafeteria',
                        'Hamburgueria',
                        'Comida brasileira',
                        'Japonesa',
                        'Saudável',
                        'Doces e sobremesas',
                        'Outros',
                      ].map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="WhatsApp para pedidos">
                    <input
                      required
                      type="tel"
                      placeholder="(61) 99999-0000"
                      value={formatContactPhone(r.whatsapp || '')}
                      onChange={e => update('whatsapp', formatContactPhone(e.target.value))}
                    />
                  </Field>
                  <Field label="Telefone de contato">
                    <input
                      type="tel"
                      value={formatContactPhone(r.contact_phone)}
                      onChange={e => update('contact_phone', formatContactPhone(e.target.value))}
                    />
                  </Field>
                </div>
                <Field label="Descrição do restaurante">
                  <textarea
                    maxLength={1000}
                    rows={3}
                    value={r.description}
                    onChange={e => update('description', e.target.value)}
                    placeholder="Conte o que torna seu restaurante especial."
                  />
                </Field>
                <Field
                  label="Endereço do seu cardápio"
                  hint="Use letras minúsculas, números e hífens. Compartilhe o link após publicar."
                >
                  <div className="admin-slug">
                    <span>fooddf.vercel.app/restaurantes/</span>
                    <input
                      required
                      pattern="[a-z0-9-]+"
                      value={r.slug}
                      onChange={e => update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    />
                  </div>
                </Field>
                <div className="admin-fields two">
                  <Field label="Visibilidade">
                    <select value={r.status} onChange={e => update('status', e.target.value)}>
                      <option value="draft">Rascunho — apenas no painel</option>
                      <option value="published">Publicado no FOODDF</option>
                    </select>
                  </Field>
                  <Field label="Tipo de estabelecimento">
                    <select
                      value={r.is_demo ? 'demo' : 'real'}
                      onChange={e => update('is_demo', e.target.value === 'demo')}
                    >
                      <option value="demo">Demonstração (pedido fictício)</option>
                      <option value="real">Restaurante real</option>
                    </select>
                  </Field>
                </div>
                <p className="admin-tip">
                  <Info size={16} />
                  Novos restaurantes começam como rascunho. Para publicar, complete também endereço e WhatsApp.
                </p>
              </>
            ) : tab === 'Endereço' ? (
              <>
                <div className="admin-fields three">
                  <Field label="CEP">
                    <div className="auth-cep-box">
                      <input
                        value={r.postal_code}
                        maxLength={9}
                        inputMode="numeric"
                        placeholder="70300-000"
                        onChange={e => void handleEditorCep(e.target.value)}
                      />
                      {cepBusy && (
                        <LoaderCircle
                          size={15}
                          className="admin-spin auth-cep-spinner"
                          aria-label="Consultando CEP"
                        />
                      )}
                    </div>
                  </Field>
                  <Field label="Estado">
                    <select
                      value={r.state}
                      onChange={e => {
                        const uf = e.target.value;
                        const list = getCitiesForState(uf);
                        onChange(current =>
                          current?.id === r.id
                            ? { ...current, state: uf, city: uf === 'DF' ? 'Brasília' : list[0] || '' }
                            : current
                        );
                      }}
                    >
                      {states.map(([uf, n]) => (
                        <option key={uf} value={uf}>
                          {n} ({uf})
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Cidade">
                    <select
                      required
                      value={editorCities.includes(r.city) ? r.city : r.city || editorCities[0] || ''}
                      onChange={e => update('city', e.target.value)}
                    >
                      {r.city && !editorCities.includes(r.city) && <option value={r.city}>{r.city}</option>}
                      {editorCities.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Endereço completo">
                  <input
                    value={r.address}
                    maxLength={300}
                    placeholder="Rua, quadra, bloco e número"
                    onChange={e => update('address', e.target.value)}
                  />
                </Field>
                <Field label="Complemento">
                  <input
                    maxLength={100}
                    value={r.complement}
                    placeholder="Loja, sala ou referência"
                    onChange={e => update('complement', e.target.value)}
                  />
                </Field>
                <div className="admin-tip">
                  <MapPin size={20} />
                  Ao digitar o CEP, o estado, a cidade e o logradouro são preenchidos automaticamente.
                </div>
              </>
            ) : (
              <>
                <p className="admin-muted">
                  Quando um ou mais dias estão habilitados abaixo, o perfil do restaurante muda automaticamente entre{' '}
                  <strong>Aberto</strong> e <strong>Fechado</strong> de acordo com o horário atual.
                </p>
                {scheduleEnabled && (
                  <div className={`admin-schedule-live-pill ${previewIsOpen ? 'is-open' : 'is-closed'}`}>
                    <Clock3 size={17} />
                    <span>
                      Status automático pelo horário atual:{' '}
                      <strong>{previewIsOpen ? 'Aberto agora' : 'Fechado no momento'}</strong>
                    </span>
                  </div>
                )}
                <div className="admin-hours">
                  {r.opening_hours.map((h, i) => (
                    <div key={h.day}>
                      <Toggle
                        label={`Abre ${h.day}`}
                        checked={h.enabled}
                        onChange={v =>
                          updateOpeningHours(
                            r.opening_hours.map((day, j) => (j === i ? { ...day, enabled: v } : day))
                          )
                        }
                      />
                      <strong>{h.day}</strong>
                      <input
                        aria-label={`Abertura ${h.day}`}
                        type="time"
                        disabled={!h.enabled}
                        value={h.open}
                        onChange={e =>
                          updateOpeningHours(
                            r.opening_hours.map((day, j) => (j === i ? { ...day, open: e.target.value } : day))
                          )
                        }
                      />
                      <span>até</span>
                      <input
                        aria-label={`Fechamento ${h.day}`}
                        type="time"
                        disabled={!h.enabled}
                        value={h.close}
                        onChange={e =>
                          updateOpeningHours(
                            r.opening_hours.map((day, j) => (j === i ? { ...day, close: e.target.value } : day))
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="admin-tip">
                  <Info size={18} />
                  Quando o fechamento for antes da abertura, o período termina no dia seguinte.
                </div>
              </>
            )}
            <button disabled={busy} className="button primary admin-mobile-save" type="submit">
              {busy ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </section>
          <aside className="admin-card admin-preview">
            <h2>
              <Smartphone size={21} />
              Prévia no aplicativo
            </h2>
            <div className="admin-phone">
              <FoodImage kind={r.cover_url || 'hero'} label="Capa do restaurante" />
              <div className="admin-phone-body">
                <FoodImage kind={r.logo_url || 'logo'} label="Logo do restaurante" />
                <h3>{r.name || 'Seu restaurante'}</h3>
                <p>{r.description || 'Sua descrição aparecerá aqui.'}</p>
                <span className={`admin-status ${previewIsOpen ? 'green' : ''}`}>
                  <i />
                  {previewIsOpen ? 'Aberto' : 'Fechado'}
                </span>
                <a
                  className="button primary wide"
                  href={isNew ? '#' : `/restaurantes/${encodeURIComponent(r.slug)}`}
                  target={isNew ? undefined : '_blank'}
                  onClick={e => {
                    if (isNew) e.preventDefault();
                  }}
                  rel="noreferrer"
                >
                  <Store size={18} />
                  Ver cardápio
                </a>
              </div>
            </div>
            <p className="admin-tip">
              <Info size={17} />
              As alterações aparecem para os clientes depois de salvar.
            </p>
          </aside>
        </form>
      )}
    </>
  );
}

export function ProductEditor({
  value: p,
  restaurantSlug = '',
  onChange,
  categories,
  save,
  busy,
}: {
  value: AdminProduct;
  restaurantSlug?: string;
  onChange: React.Dispatch<React.SetStateAction<AdminProduct | null>>;
  categories: Category[];
  save: () => void;
  busy: boolean;
}) {
  const [linkCopied, setLinkCopied] = useState(false);
  const update = (key: keyof AdminProduct, value: unknown) =>
    onChange(current => (current?.id === p.id ? { ...current, [key]: value } : current));

  const mealDirectLink =
    restaurantSlug && p.id
      ? `${typeof window !== 'undefined' ? window.location.origin : 'https://fooddf.vercel.app'}/restaurantes/${encodeURIComponent(restaurantSlug)}#refeicao-${p.id}`
      : '';

  const isPromoActive = Boolean(p.is_promo || p.promo_price);

  return (
    <form
      id="product-form"
      className="admin-editor-grid"
      onSubmit={e => {
        e.preventDefault();
        save();
      }}
    >
      <section className="admin-card">
        <div className="admin-product-upload">
          <ImageUpload
            value={p.image_url}
            label="Trocar imagem"
            onChange={v => update('image_url', v)}
            restaurantId={p.restaurant_id}
            kind={p.image}
          />
          <div>
            <h3>Foto do produto</h3>
            <p className="admin-muted">
              Prefira imagens em WebP ou PNG/JPG em HD (1200 × 900 px · 4:3) para exibir os alimentos alinhados e nítidos.
            </p>
            <Field label="Imagem de exemplo">
              <select value={p.image} onChange={e => update('image', e.target.value)}>
                <option value="burger">Hambúrguer</option>
                <option value="meal">Refeição</option>
                <option value="fries">Batatas</option>
                <option value="combo">Combo</option>
                <option value="drink">Bebida</option>
              </select>
            </Field>
          </div>
        </div>
        <div className="admin-fields two">
          <Field label="Nome do produto">
            <input
              required
              minLength={2}
              maxLength={120}
              value={p.name}
              onChange={e => update('name', e.target.value)}
              placeholder="Ex.: Brasa Bacon"
            />
          </Field>
          <Field label="Categoria">
            <select required value={p.category} onChange={e => update('category', e.target.value)}>
              <option value="">Selecione</option>
              {categories.map(c => (
                <option key={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Descrição e ingredientes">
          <textarea
            rows={3}
            maxLength={1000}
            value={p.description}
            onChange={e => update('description', e.target.value)}
            placeholder="Conte o que vem no prato."
          />
        </Field>
        <div className="admin-fields three">
          <MoneyField label="Preço (R$)" value={p.price} onChange={v => update('price', v || 0)} />
          <MoneyField
            label="Preço promocional (R$)"
            optional
            value={p.promo_price}
            onChange={v => {
              onChange(current =>
                current?.id === p.id
                  ? { ...current, promo_price: v, is_promo: v !== null ? true : current.is_promo }
                  : current
              );
            }}
          />
          <Field label="Serve">
            <select value={p.serves} onChange={e => update('serves', Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'pessoa' : 'pessoas'}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="admin-switch-row">
          <label>
            <Toggle label="Disponível no cardápio" checked={p.active} onChange={v => update('active', v)} />
            Disponível no cardápio
          </label>
          <label>
            <Toggle
              label="Exibir com card Promoção"
              checked={Boolean(p.is_promo)}
              onChange={v => update('is_promo', v)}
            />
            <Flame size={15} color="#ff5900" /> Exibir card Promoção
          </label>
          <label>
            <Toggle label="Destacar produto" checked={p.featured} onChange={v => update('featured', v)} />
            Destacar produto
          </label>
        </div>

        {mealDirectLink && (
          <div className="admin-meal-link-box">
            <span>
              <Link2 size={15} /> <strong>Link direto desta refeição</strong> (para usar no Banner ou WhatsApp):
            </span>
            <div>
              <input readOnly value={mealDirectLink} />
              <button
                type="button"
                className="button outline small"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(mealDirectLink);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2500);
                  } catch {}
                }}
              >
                {linkCopied ? <Check size={14} /> : <Copy size={14} />}
                {linkCopied ? 'Copiado!' : 'Copiar link'}
              </button>
            </div>
          </div>
        )}

        <div className="admin-divider" />
        <div className="admin-section-title">
          <h2>Adicionais</h2>
          <button
            type="button"
            className="button outline small"
            disabled={p.extras.length >= 20}
            onClick={() => update('extras', [...p.extras, { id: crypto.randomUUID(), name: '', price: 0 }])}
          >
            <Plus size={16} />
            Adicionar opção
          </button>
        </div>
        <div className="admin-extras">
          {p.extras.map((x, i) => (
            <div key={x.id}>
              <input
                aria-label={`Nome adicional ${i + 1}`}
                value={x.name}
                maxLength={80}
                placeholder="Ex.: Bacon extra"
                onChange={e =>
                  update(
                    'extras',
                    p.extras.map((v, j) => (i === j ? { ...v, name: e.target.value } : v))
                  )
                }
              />
              <MoneyField
                label={`Valor adicional ${i + 1}`}
                value={x.price}
                onChange={v =>
                  update(
                    'extras',
                    p.extras.map((item, j) => (i === j ? { ...item, price: v || 0 } : item))
                  )
                }
              />
              <button
                type="button"
                className="icon-button"
                aria-label={`Remover adicional ${i + 1}`}
                onClick={() => update('extras', p.extras.filter((_, j) => i !== j))}
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
        {!p.extras.length && (
          <p className="admin-empty-small">Nenhum adicional. Você pode incluir acompanhamentos e extras aqui.</p>
        )}
        <button className="button primary admin-mobile-save" disabled={busy} type="submit">
          Salvar produto
        </button>
      </section>
      <aside className="admin-card admin-preview">
        <h2>
          <Smartphone size={21} />
          Prévia no aplicativo
        </h2>
        <div className="admin-product-preview" style={{ position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <FoodImage kind={p.image_url || p.image} label={p.name || 'Produto'} />
            {isPromoActive && <span className="promo-corner-badge">Promoção</span>}
          </div>
          <h3>{p.name || 'Nome do produto'}</h3>
          <p>{p.description || 'A descrição aparece aqui.'}</p>
          {p.promo_price && <del>De {money(p.price)}</del>}
          <strong>{p.promo_price ? `Por ${money(p.promo_price)}` : money(p.price)}</strong>
          {p.extras.length > 0 && (
            <div className="admin-preview-extras">
              {p.extras.map(x => (
                <label key={x.id}>
                  <input type="checkbox" disabled />
                  {x.name || 'Adicional'}
                  <span>{money(x.price)}</span>
                </label>
              ))}
            </div>
          )}
          <div className="button primary wide" aria-hidden="true">
            Adicionar ao pedido
          </div>
        </div>
        <p className="admin-preview-caption">
          <Info size={16} />
          Prévia das informações exibidas ao cliente
        </p>
      </aside>
    </form>
  );
}

export function PaymentsEditor({
  value: r,
  onChange,
  save,
  busy,
}: {
  value: AdminRestaurant;
  onChange: (r: AdminRestaurant) => void;
  save: () => void;
  busy: boolean;
}) {
  const [area, setArea] = useState('');
  const update = (key: keyof AdminRestaurant, value: unknown) => onChange({ ...r, [key]: value });
  const payment = (id: string, on: boolean) =>
    update('payment_methods', on ? [...new Set([...r.payment_methods, id])] : r.payment_methods.filter(p => p !== id));
  return (
    <form
      id="payments-form"
      onSubmit={e => {
        e.preventDefault();
        save();
      }}
    >
      <div className="admin-two-cards">
        <section className="admin-card">
          <h2>
            <CreditCard />
            Formas de pagamento
          </h2>
          <div className="admin-payment-block">
            <div className="admin-toggle-title">
              <QrCode size={23} />
              <h3>Pix</h3>
              <Toggle
                label="Aceitar Pix"
                checked={r.payment_methods.includes('pix')}
                onChange={v => payment('pix', v)}
              />
            </div>
            {r.payment_methods.includes('pix') && (
              <div className="admin-payment-body">
                <div className="admin-fields two">
                  <Field label="Tipo de chave">
                    <select value={r.pix_key_type} onChange={e => update('pix_key_type', e.target.value)}>
                      <option value="email">E-mail</option>
                      <option value="phone">Telefone</option>
                      <option value="cpf">CPF</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="random">Aleatória</option>
                    </select>
                  </Field>
                  <Field label="Chave Pix">
                    <input
                      maxLength={77}
                      value={r.pix_key || ''}
                      onChange={e => update('pix_key', e.target.value)}
                      placeholder="Informe a chave do restaurante"
                    />
                  </Field>
                </div>
                <Field label="Nome do recebedor">
                  <input
                    maxLength={25}
                    value={r.pix_name || ''}
                    onChange={e => update('pix_name', e.target.value)}
                  />
                </Field>
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={r.receipt_required}
                    onChange={e => update('receipt_required', e.target.checked)}
                  />
                  Solicitar comprovante do Pix
                </label>
                <p className="admin-tip">
                  <Info size={17} />O restaurante confere o pagamento recebido.
                  {r.is_demo && ' Nesta loja fictícia, não haverá cobrança.'}
                </p>
              </div>
            )}
          </div>
          {[
            { id: 'cash', name: 'Dinheiro' },
            { id: 'card', name: 'Cartão na entrega' },
          ].map(p => (
            <div className="admin-toggle-title bordered" key={p.id}>
              <CreditCard size={23} />
              <h3>{p.name}</h3>
              <Toggle
                label={`Aceitar ${p.name}`}
                checked={r.payment_methods.includes(p.id)}
                onChange={v => payment(p.id, v)}
              />
            </div>
          ))}
        </section>
        <section className="admin-card">
          <h2>
            <Truck />
            Entrega e retirada
          </h2>
          <div className="admin-toggle-title bordered">
            <Truck size={23} />
            <h3>Entrega no endereço</h3>
            <Toggle
              label="Permitir entrega"
              checked={r.delivery_enabled}
              onChange={v => update('delivery_enabled', v)}
            />
          </div>
          <div className="admin-toggle-title bordered">
            <Store size={23} />
            <h3>Retirada no local</h3>
            <Toggle
              label="Permitir retirada"
              checked={r.pickup_enabled}
              onChange={v => update('pickup_enabled', v)}
            />
          </div>
          <div className="admin-divider" />
          <div className="admin-fields three">
            <div>
              <MoneyField
                label="Taxa de entrega (R$)"
                value={r.delivery_fee}
                onChange={v => update('delivery_fee', v || 0)}
              />
              {!r.delivery_fee || r.delivery_fee === 0 ? (
                <div
                  className="admin-delivery-free-notice"
                  style={{
                    color: '#16a34a',
                    fontSize: '11px',
                    fontWeight: 800,
                    marginTop: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>✓ Frete Grátis</span>
                  <span style={{ fontWeight: 600, color: '#65a30d', fontSize: '10px' }}>
                    (zerado = Frete Grátis para o cliente)
                  </span>
                </div>
              ) : (
                <small style={{ color: '#8f7294', fontSize: '10px', marginTop: '4px', display: 'block' }}>
                  R$ 0,00 ativa Frete Grátis
                </small>
              )}
            </div>
            <MoneyField
              label="Pedido mínimo (R$)"
              value={r.min_order}
              onChange={v => update('min_order', v || 0)}
            />
            <Field label="Tempo estimado">
              <select value={r.estimated_time} onChange={e => update('estimated_time', e.target.value)}>
                {['15–30 min', '30–45 min', '45–60 min', '60–90 min', '90–120 min'].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="admin-divider" />
          <h3>Bairros atendidos</h3>
          <div className="admin-area-tags">
            {r.neighborhoods.map(n => (
              <span key={n}>
                {n}
                <button
                  type="button"
                  aria-label={`Remover bairro ${n}`}
                  onClick={() => update('neighborhoods', r.neighborhoods.filter(v => v !== n))}
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
          <div className="admin-inline-add">
            <input
              aria-label="Novo bairro"
              placeholder="Nome do bairro"
              maxLength={80}
              value={area}
              onChange={e => setArea(e.target.value)}
            />
            <button
              type="button"
              className="button outline small"
              onClick={() => {
                if (area.trim()) update('neighborhoods', [...new Set([...r.neighborhoods, area.trim()])]);
                setArea('');
              }}
            >
              <Plus size={16} />
              Adicionar
            </button>
          </div>
          <small className="admin-muted">
            Sem bairros cadastrados, a disponibilidade é confirmada pelo restaurante.
          </small>
        </section>
      </div>
      <section className="admin-card admin-whatsapp-config">
        <MessageCircle size={32} />
        <h3>Destino dos pedidos</h3>
        <Field label="WhatsApp do restaurante">
          <input
            type="tel"
            required
            placeholder="(61) 99999-0000"
            value={r.whatsapp || ''}
            onChange={e => update('whatsapp', e.target.value)}
          />
        </Field>
        <p>O resumo, contato e endereço do cliente vão para este número.</p>
      </section>
      <button type="submit" disabled={busy} className="button primary admin-mobile-save">
        Salvar configurações
      </button>
    </form>
  );
}
