import {getOwner} from '@/lib/owner-auth';
import {json} from '@/lib/delivery';
export async function ownerId(){return 'site-owner';}
export async function GET(){const user=await getOwner();return json({signedIn:!!user,claimed:true,isOwner:!!user});}
