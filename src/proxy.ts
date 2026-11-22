import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  const host = request.headers.get('host') || '';

  // 1. Redirecionamento 301 de rotas antigas/duplicadas
  // Redireciona /paineladministativo -> /painel preservando query params
  if (pathname === '/paineladministativo') {
    url.pathname = '/painel';
    return NextResponse.redirect(url, 301);
  }

  // Redireciona /restaurantes -> /buscas preservando query params (consolidação canônica)
  if (pathname === '/restaurantes') {
    url.pathname = '/buscas';
    return NextResponse.redirect(url, 301);
  }

  const response = NextResponse.next();

  // 2. Cabeçalhos de segurança e privacidade essenciais
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // 3. Controle rigoroso de indexação em rotas privadas e de demonstração
  const isPrivateRoute =
    pathname.startsWith('/painel') ||
    pathname.startsWith('/adminmaster') ||
    pathname.startsWith('/api/');

  const isDemoRoute = pathname === '/restaurantes/brasa-burger';

  if (isPrivateRoute) {
    // Impedir qualquer cache e indexação em áreas administrativas e APIs
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  } else if (isDemoRoute) {
    // Restaurante fictício de demonstração não deve ser indexado nos mecanismos de busca
    response.headers.set('X-Robots-Tag', 'noindex, follow');
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
