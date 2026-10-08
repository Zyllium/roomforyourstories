import {json,limited,sameOrigin,setting} from '@/lib/delivery';
import {COOKIE_NAME,sessionSecret} from '@/lib/owner-auth';
import {createSession,equalSecret} from '@/lib/session';
export async function POST(request:Request){
  if(!sameOrigin(request))return json({error:'Use the owner sign-in page.'},403);
  try{const password=setting('OWNER_PASSWORD');if(!password||password.length<20||!sessionSecret())return json({error:'Owner sign-in is not configured.'},503);
    if(Number(request.headers.get('content-length'))>2048)return json({error:'Invalid password.'},400);
    if(await limited(request))return json({error:'Please wait a minute before trying again.'},429);
    const body=await request.json() as {password?:string};if(typeof body.password!=='string'||body.password.length>500||!await equalSecret(body.password,password))return json({error:'Incorrect password.'},403);
    const session=await createSession(sessionSecret());const response=json({signedIn:true});
    response.headers.set('Set-Cookie',`${COOKIE_NAME}=${session}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`);return response;
  }catch{return json({error:'Sign-in is temporarily unavailable.'},503);}
}
