import type { Metadata } from 'next';
import AdminPanel from '@/components/admin/admin-panel';
import '../paineladministativo/admin.css';

export const metadata: Metadata = {
  title: 'FOODDF Admin — Painel administrativo',
  robots: { index: false, follow: false },
};

export default function PainelPage() {
  return <AdminPanel />;
}
