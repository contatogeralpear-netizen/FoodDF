/**
 * Rota oficial do arquivo ads.txt.
 * Em estrita conformidade com as diretrizes do Google AdSense, este endpoint
 * retorna HTTP 404 enquanto o proprietário do site não fornecer o Publisher ID oficial
 * (ex.: ca-pub-XXXXXXXXXXXXXXXX).
 * NUNCA gera publishers fictícios ou dados placeholder.
 */
export function GET() {
  const publisherId = process.env.ADSENSE_CLIENT || process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '';

  if (!publisherId || !/^ca-pub-\d{16}$/.test(publisherId)) {
    return new Response('ads.txt não configurado: aguardando Publisher ID oficial do AdSense.', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }

  // Formato oficial do IAB / Google AdSense: google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
  const pubNumber = publisherId.replace('ca-', '');
  const body = `google.com, ${pubNumber}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
