import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const host = request.headers.get('host') || '';

  // Cabeçalhos de privacidade e segurança rigorosos
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Proteção do domínio .vercel.app: impedir indexação para evitar conteúdo duplicado
  if (host.endsWith('.vercel.app')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  // Proteção de privacidade no Painel Administrativo e rotas privadas
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/paineladministativo') || pathname.startsWith('/adminmaster') || pathname.startsWith('/api/')) {
    // Impedir cache local/intermediário para proteger a privacidade dos dados do restaurante
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    // Impedir qualquer indexação por buscadores
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Aplica em todas as rotas exceto arquivos estáticos (_next/static, _next/image, favicon.ico, icon.svg)
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg).*)',
  ],
};
