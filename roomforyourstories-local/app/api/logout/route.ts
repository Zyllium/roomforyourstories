import {json,sameOrigin} from '@/lib/delivery';
import {COOKIE_NAME} from '@/lib/owner-auth';
export async function POST(request:Request){if(!sameOrigin(request))return json({error:'Use the owner page.'},403);return new Response(null,{status:303,headers:{Location:'/stories','Cache-Control':'no-store','Set-Cookie':`${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`}});}
