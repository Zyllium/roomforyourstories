// Run from the project root: node scripts/switch-website-only.mjs
import {readFileSync,writeFileSync,mkdirSync,copyFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const root=process.cwd();
if (!existsSync(join(root,'app/api/share/route.ts'))) throw new Error('Run this from your roomforyourstories-local folder.');
const files={
  "app/api/share/route.ts": "import { database, hash, json, limited, sameOrigin } from '@/lib/delivery';\n\nexport async function GET() {\n  try {\n    await database().prepare('SELECT id FROM website_stories LIMIT 1').first();\n    return json({ ready: true });\n  } catch { return json({ ready: false }, 503); }\n}\n\nexport async function POST(request: Request) {\n  if (!sameOrigin(request)) return json({ error: 'Please submit using this page.' }, 403);\n  try {\n    const raw = await request.text();\n    if (new TextEncoder().encode(raw).length > 14000) return json({ error: 'Your story is too long.' }, 400);\n    let body: { story?: string; requestId?: string; website?: string };\n    try { body = JSON.parse(raw); } catch { return json({ error: 'Invalid submission.' }, 400); }\n    if (!body || typeof body !== 'object') return json({ error: 'Invalid submission.' }, 400);\n    const story = typeof body.story === 'string' ? body.story.trim() : '';\n    if (!story || story.length > 2000 || typeof body.requestId !== 'string' || !/^[-a-zA-Z0-9]{36}$/.test(body.requestId))\n      return json({ error: 'Enter a story up to 2,000 characters.' }, 400);\n    if (body.website) return json({ error: 'Unable to submit.' }, 400);\n    const digest = await hash(story);\n    const existing = await database().prepare('SELECT id,digest,deleted FROM website_stories WHERE request=?')\n      .bind(body.requestId).first<{ id: number; digest: string; deleted: number }>();\n    if (existing) {\n      if (existing.digest !== digest) return json({ error: 'Start a new submission for changed text.' }, 409);\n      if (existing.deleted) return json({ error: 'This story was removed.' }, 409);\n      return json({ posted: true, number: existing.id });\n    }\n    if (await limited(request)) return json({ error: 'Please wait a minute before sharing again.' }, 429);\n    const row = await database().prepare('INSERT INTO website_stories(request,digest,text,created) VALUES(?,?,?,?) ON CONFLICT(request) DO NOTHING RETURNING id')\n      .bind(body.requestId, digest, story, Date.now()).first<{ id: number }>();\n    if (!row) return json({ error: 'This submission is already being processed. Try again shortly.' }, 409);\n    return json({ posted: true, number: row.id });\n  } catch { return json({ error: 'Submission could not be confirmed. Retry without changing your text.' }, 503); }\n}\n",
  "app/api/stories/route.ts": "import { getOwner } from '@/lib/owner-auth';\nimport { ownerId } from '@/app/api/owner/route';\nimport { database, json, sameOrigin } from '@/lib/delivery';\n\nexport async function GET(request: Request) {\n  try {\n    const before = new URL(request.url).searchParams.get('before');\n    if (before && (!/^[1-9]\\d{0,15}$/.test(before) || !Number.isSafeInteger(Number(before))))\n      return json({ error: 'Invalid page.' }, 400);\n    const rows = await database().prepare('SELECT id,text,created FROM website_stories WHERE deleted=0 AND id<? ORDER BY id DESC LIMIT 101')\n      .bind(before ? Number(before) : Number.MAX_SAFE_INTEGER)\n      .all<{ id: number; text: string; created: number }>();\n    const page = rows.results.slice(0, 100);\n    return json({\n      stories: page.map(row => ({ id: String(row.id), title: `My Story · Web #${row.id}`, text: row.text, created: new Date(row.created).toISOString() })),\n      next: rows.results.length > 100 ? String(page.at(-1)!.id) : null,\n      ready: true,\n    });\n  } catch { return json({ error: 'Stories are temporarily unavailable.' }, 503); }\n}\n\nexport async function DELETE(request: Request) {\n  if (!sameOrigin(request)) return json({ error: 'Use the owner page.' }, 403);\n  try {\n    const user = await getOwner();\n    if (!user || user.userId !== await ownerId()) return json({ error: 'Only the owner can delete stories.' }, 403);\n    const id = new URL(request.url).searchParams.get('id');\n    if (!id || !/^[1-9]\\d{0,15}$/.test(id) || !Number.isSafeInteger(Number(id))) return json({ error: 'Invalid story.' }, 400);\n    // Retain the receipt so replaying an old request cannot restore deleted text.\n    await database().prepare(\"UPDATE website_stories SET deleted=1,text='' WHERE id=?\").bind(Number(id)).run();\n    return json({ deleted: true });\n  } catch { return json({ error: 'Deletion could not be confirmed. Refresh before trying again.' }, 503); }\n}\n",
  "drizzle/0002_website_stories.sql": "CREATE TABLE IF NOT EXISTS website_stories (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  request TEXT NOT NULL UNIQUE,\n  digest TEXT NOT NULL,\n  text TEXT NOT NULL,\n  created INTEGER NOT NULL,\n  deleted INTEGER NOT NULL DEFAULT 0\n);\nCREATE INDEX IF NOT EXISTS website_stories_visible ON website_stories(deleted, id);\n"
};
const targets=[...Object.keys(files),'app/page.tsx','app/stories/feed.tsx'];
const backup=join(root,'website-only-backup-'+Date.now());
mkdirSync(backup,{recursive:true});
for(const target of targets) {
  const source=join(root,target);
  if(existsSync(source)) {
    const destination=join(backup,target);
    mkdirSync(join(destination,'..'),{recursive:true});
    copyFileSync(source,destination);
  }
}
for(const [target,content] of Object.entries(files)) writeFileSync(join(root,target),content);
for(const target of ['app/page.tsx','app/stories/feed.tsx']) {
  let content=readFileSync(join(root,target),'utf8');
  content=content.replace(/Your story will be publicly readable on this website and in the Discord\s+server\./g,"Your story will be publicly readable on this website.");
  content=content.replace(/Share with the You Are Heard community without joining the Discord server\./g,"Share with the You Are Heard community here on the website.");
  content=content.replace(/It is now posted in the community’s Discord channel and available on the public stories page\./g,"It is now available on the public stories page.");
  content=content.replace(/<p className=["']fine["']>\s*The stories page reads posts from Discord\.[\s\S]*?<\/p>/g,"<p className=\"fine\">Stories are stored in our website database. Hosting providers may process technical connection data.</p>");
  content=content.replace(/<label className=["']check["']>[\s\S]*?<\/label>/g,"");
  content=content.replace(/(\[\s*consent\s*,\s*setConsent\s*\]\s*=\s*useState\()\s*false\s*(\))/g,"$1true$2");
  content=content.replace(/setConsent\(\s*false\s*\)/g,"setConsent(true)");
  content=content.replace(/from the website and Discord/g,"from the website");
  content=content.replace(/Deletion also removes the Discord post\./g,"Deletion removes the story from this website.");
  writeFileSync(join(root,target),content);
}
console.log('Website-only storage installed. Your previous files are backed up in '+backup);
console.log('Save any open editor tabs carefully: reload the modified files from disk.');
console.log('Next: pnpm run deploy (creates the database table and publishes the change).');
