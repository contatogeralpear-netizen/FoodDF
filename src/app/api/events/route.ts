import { database, hasDatabase } from '@/lib/server/supabase';
import { checkOrigin } from '@/lib/server/http';
import { z } from 'zod';
const event = z.object({restaurant_slug:z.string().regex(/^[a-z0-9-]{1,100}$/),visitor:z.string().uuid(),kind:z.enum(['visit','whatsapp'])}).strict();
export async function POST(request:Request){
 if(!checkOrigin(request))return new Response(null,{status:403});
 if(!hasDatabase())return new Response(null,{status:204});
 try{const raw=await request.text();if(raw.length>1024)return new Response(null,{status:413});const parsed=event.safeParse(JSON.parse(raw));if(!parsed.success)return new Response(null,{status:400});const {error}=await database().rpc('fooddf_track_event',parsed.data);return new Response(null,{status:error?503:204});}catch{return new Response(null,{status:400});}
}
