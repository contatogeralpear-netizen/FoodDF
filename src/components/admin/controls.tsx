'use client';
import { Children, cloneElement, isValidElement, useEffect, useId, useRef, useState, type ReactElement } from 'react';
import { Upload, X } from 'lucide-react';
import { adminClient } from '@/lib/admin';
import { FoodImage } from '../food-image';

export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`admin-switch ${checked ? 'on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  const id = useId();
  return (
    <label className="admin-field">
      <span id={id}>{label}</span>
      {Children.map(children, child =>
        isValidElement(child) &&
        typeof child.type === 'string' &&
        ['input', 'select', 'textarea'].includes(child.type)
          ? cloneElement(child as ReactElement<{ 'aria-labelledby'?: string }>, { 'aria-labelledby': id })
          : child
      )}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function MoneyField({
  label,
  value,
  onChange,
  optional = false,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  optional?: boolean;
}) {
  return (
    <Field label={label}>
      <input
        inputMode="decimal"
        placeholder={optional ? 'Opcional' : '0,00'}
        aria-label={label}
        value={value === null ? '' : (value / 100).toFixed(2).replace('.', ',')}
        onChange={e => {
          const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
          onChange(digits ? Number(digits) : optional ? null : 0);
        }}
      />
    </Field>
  );
}

async function optimizeBannerToWebpHd(file: File): Promise<File> {
  if (file.type === 'image/webp') return file;
  if (typeof window === 'undefined' || typeof document === 'undefined') return file;
  return new Promise(resolve => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        const maxWidth = 1920;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          blob => {
            if (blob && blob.size > 0 && blob.size <= 5 * 1024 * 1024) {
              const baseName = file.name.replace(/\.[^.]+$/, '') || 'banner-hd';
              resolve(new File([blob], `${baseName}.webp`, { type: 'image/webp' }));
            } else {
              resolve(file);
            }
          },
          'image/webp',
          0.92
        );
      } catch {
        resolve(file);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
    img.src = objectUrl;
  });
}

export function ImageUpload({
  value,
  onChange,
  label,
  kind = 'burger',
  restaurantId,
}: {
  value: string | null;
  onChange: (value: string |null) => void;
  label: string;
  kind?: string;
  restaurantId: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function upload(rawFile?: File) {
    if (!rawFile) return;
    setError('');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(rawFile.type) || rawFile.size > 5 * 1024 * 1024) {
      setError('Use WebP, PNG ou JPG de até 5 MB.');
      return;
    }
    setBusy(true);
    try {
      const file = kind === 'banner' ? await optimizeBannerToWebpHd(rawFile) : rawFile;
      const extension = file.type.split('/')[1] || 'webp';
      const path = `${restaurantId}/${crypto.randomUUID()}.${extension}`;
      const db = adminClient();
      const { error: upErr } = await db.storage
        .from('restaurant-images')
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw Error('Não foi possível enviar a imagem. Confira seu acesso e tente novamente.');
      if (!alive.current) return;
      onChange(db.storage.from('restaurant-images').getPublicUrl(path).data.publicUrl);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = '';
    }
  }

  const dimensions =
    kind === 'logo'
      ? '512 × 512 px · quadrada (1:1)'
      : kind === 'banner'
        ? '1600 × 520 px · escala panorâmica (25:8 / 3:1)'
        : kind === 'hero'
          ? '1600 × 600 px · horizontal (8:3)'
          : '1200 × 900 px · horizontal (4:3)';

  return (
    <div className={`admin-upload ${kind === 'logo' ? 'logo-upload' : kind === 'banner' ? 'banner-upload' : ''}`}>
      <div className="admin-upload-image">
        <FoodImage kind={value || (kind === 'banner' ? '/images/store/banner-prato-da-casa.webp' : kind)} label={label} />
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/webp,image/jpeg,image/png"
        className="sr-only"
        aria-label={label}
        onChange={e => void upload(e.target.files?.[0])}
      />
      <button type="button" className="button outline" disabled={busy} onClick={() => ref.current?.click()}>
        <Upload size={15} />
        {busy ? 'Enviando em HD…' : label}
      </button>
      <small className="admin-image-guide">
        <strong>Tamanho recomendado:</strong> {dimensions}
        <br />
        {kind === 'banner'
          ? 'Formato recomendado: WebP (.webp) em qualidade HD · até 5 MB'
          : 'JPG, PNG ou WebP · até 5 MB'}
      </small>
      {value && (
        <button type="button" className="admin-mini" onClick={() => onChange(null)}>
          <X size={12} />
          Remover imagem
        </button>
      )}
      {error && (
        <p role="alert" className="admin-inline-error">
          {error}
        </p>
      )}
    </div>
  );
}
