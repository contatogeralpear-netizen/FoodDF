import 'server-only';
import { createHash, createHmac } from 'node:crypto';
import { database } from './supabase';

export function tokenHash(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export function checkOrigin(request: Request) {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin || origin === process.env.FOODDF_SITE_URL;
}

export async function rateLimit(request: Request, scope: string, limit = 10) {
  const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const key = createHmac('sha256', process.env.SUPABASE_SECRET_KEY || '').update(`${scope}:${ip}`).digest('hex');
  const { data, error } = await database(true).rpc('fooddf_allow_request', { bucket_key: key, max_requests: limit });
  if (error) throw new Error('Rate limiter unavailable');
  return data === true;
}
