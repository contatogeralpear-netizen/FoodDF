import type { Metadata } from 'next';
import MasterPanel from '@/components/master/master-panel';
import '../paineladministativo/admin.css';
import './master.css';
export const metadata: Metadata={title:'FOODDF Master — Gestão',robots:{index:false,follow:false}};
export default function Page(){return <MasterPanel/>}
