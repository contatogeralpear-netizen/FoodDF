import { getCatalog } from '@/lib/server/catalog';

export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    const { restaurant, mode } = await getCatalog(new URL(request.url).searchParams.get('restaurant') || 'brasa-burger');
    return Response.json({ restaurant, mode, receiptMaxBytes: 4 * 1024 * 1024, receiptMimeTypes: ['image/png', 'image/jpeg', 'application/pdf'] }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Configuração temporariamente indisponível.' }, { status: 503 });
  }
}
