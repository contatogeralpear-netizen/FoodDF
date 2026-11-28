import { NextResponse } from 'next/server';
import { resolveCityFromCepData } from '@/lib/locations';

type CepPayload = {
  cep: string;
  uf: string;
  city: string;
  neighborhood: string;
  street: string;
  complement: string;
};

async function fetchViaCep(cep: string): Promise<CepPayload | null> {
  const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    signal: AbortSignal.timeout(4500),
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    erro?: boolean;
    cep?: string;
    uf?: string;
    localidade?: string;
    bairro?: string;
    logradouro?: string;
    complemento?: string;
  };
  if (data.erro || !data.uf) return null;
  const uf = data.uf.toUpperCase();
  const neighborhood = (data.bairro || '').trim();
  const street = (data.logradouro || '').trim();
  const city = resolveCityFromCepData(uf, data.localidade || '', neighborhood, street);
  return {
    cep: data.cep || `${cep.slice(0, 5)}-${cep.slice(5)}`,
    uf,
    city,
    neighborhood,
    street,
    complement: (data.complemento || '').trim(),
  };
}

async function fetchBrasilApi(cep: string): Promise<CepPayload | null> {
  const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`, {
    signal: AbortSignal.timeout(4500),
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    cep?: string;
    state?: string;
    city?: string;
    neighborhood?: string;
    street?: string;
  };
  if (!data.state) return null;
  const uf = data.state.toUpperCase();
  const neighborhood = (data.neighborhood || '').trim();
  const street = (data.street || '').trim();
  const city = resolveCityFromCepData(uf, data.city || '', neighborhood, street);
  return {
    cep: `${cep.slice(0, 5)}-${cep.slice(5)}`,
    uf,
    city,
    neighborhood,
    street,
    complement: '',
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = (searchParams.get('cep') || '').replace(/\D/g, '');

  if (!/^\d{8}$/.test(raw)) {
    return NextResponse.json({ error: 'CEP inválido.' }, { status: 400 });
  }

  try {
    const result = (await fetchViaCep(raw).catch(() => null)) || (await fetchBrasilApi(raw).catch(() => null));
    if (!result) {
      return NextResponse.json({ error: 'CEP não encontrado.' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Não foi possível consultar o CEP no momento.' }, { status: 502 });
  }
}
