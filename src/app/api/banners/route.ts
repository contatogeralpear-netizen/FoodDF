import { database, hasDatabase } from '@/lib/server/supabase';
export const dynamic='force-dynamic';
export async function GET(){
 if(!hasDatabase())return Response.json({banners:[]},{headers:{'Cache-Control':'no-store'}});
 const {data,error}=await database().from('platform_banners').select('id,title,image_url,link_url').eq('active',true).order('sort_order').order('created_at').limit(12);
 return Response.json({banners:error?[]:data},{headers:{'Cache-Control':'no-store'}});
}
