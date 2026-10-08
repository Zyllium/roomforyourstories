import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {setting} from './delivery';
import {validSession} from './session';
export const COOKIE_NAME='myvoice_owner';
export function sessionSecret(){const password=setting('OWNER_PASSWORD'),key=setting('CONFIG_KEY');return password&&key?`${key}:${password}`:'';}
export async function getOwner(){const secret=sessionSecret();if(!secret)return null;const requestHeaders=await headers();const value=requestHeaders.get('cookie')?.split(';').map(p=>p.trim()).find(p=>p.startsWith(COOKIE_NAME+'='))?.slice(COOKIE_NAME.length+1)||'';return await validSession(value,secret)?{userId:'site-owner'}:null;}
export async function requireOwner(_returnTo:string){const owner=await getOwner();if(!owner)redirect('/owner-login');return owner;}
