import type { Metadata } from 'next';
import AdminPanel from '@/components/admin/admin-panel';
import './admin.css';
export const metadata:Metadata={title:'FOODDF Admin — Painel administrativo',robots:{index:false,follow:false}};
export default function Page(){return <AdminPanel/>}
