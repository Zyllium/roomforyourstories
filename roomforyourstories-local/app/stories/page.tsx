import Feed from './feed';
export const metadata={title:'Community stories | My Voice',description:'Read stories shared with the You Are Heard community.'};
export default function Stories(){return <main className="shell"><header><a className="brand" href="/">MY VOICE<span>YOU ARE HEARD</span></a><nav><a href="/">Share a story</a></nav></header><section className="stories-workspace"><h1>Our stories</h1><p className="intro">Personal experiences shared anonymously. Some stories discuss sexual trauma and may be difficult to read. Take a break whenever you need.</p><Feed/></section></main>}
