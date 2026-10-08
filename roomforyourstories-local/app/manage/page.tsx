import {requireOwner} from '@/lib/owner-auth';
import Feed from '@/app/stories/feed';
export const dynamic='force-dynamic';
export const metadata={title:'Manage stories | My Voice'};
export default async function Manage(){await requireOwner('/manage');return <main className="shell"><header><a className="brand" href="/">MY VOICE<span>OWNER ACCESS</span></a><nav><a href="/stories">View stories</a><form action="/api/logout" method="post"><button className="small-button">Sign out</button></form></nav></header><section className="stories-workspace"><h1>Manage stories</h1><Feed manage/></section></main>}
