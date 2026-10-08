import { database, hash, json, limited, sameOrigin } from '@/lib/delivery';

export async function GET() {
  try {
    await database().prepare('SELECT id FROM website_stories LIMIT 1').first();
    return json({ ready: true });
  } catch { return json({ ready: false }, 503); }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'Please submit using this page.' }, 403);
  try {
    const raw = await request.text();
    let body: { story?: string; requestId?: string; website?: string };
    try { body = JSON.parse(raw); } catch { return json({ error: 'Invalid submission.' }, 400); }
    if (!body || typeof body !== 'object') return json({ error: 'Invalid submission.' }, 400);
    const story = typeof body.story === 'string' ? body.story.trim() : '';
    if (!story || typeof body.requestId !== 'string' || !/^[-a-zA-Z0-9]{36}$/.test(body.requestId))
      return json({ error: 'Please enter your story.' }, 400);
    if (body.website) return json({ error: 'Unable to submit.' }, 400);
    const digest = await hash(story);
    const existing = await database().prepare('SELECT id,digest,deleted FROM website_stories WHERE request=?')
      .bind(body.requestId).first<{ id: number; digest: string; deleted: number }>();
    if (existing) {
      if (existing.digest !== digest) return json({ error: 'Start a new submission for changed text.' }, 409);
      if (existing.deleted) return json({ error: 'This story was removed.' }, 409);
      return json({ posted: true, number: existing.id });
    }
    if (await limited(request)) return json({ error: 'Please wait a minute before sharing again.' }, 429);
    const row = await database().prepare('INSERT INTO website_stories(request,digest,text,created) VALUES(?,?,?,?) ON CONFLICT(request) DO NOTHING RETURNING id')
      .bind(body.requestId, digest, story, Date.now()).first<{ id: number }>();
    if (!row) return json({ error: 'This submission is already being processed. Try again shortly.' }, 409);
    return json({ posted: true, number: row.id });
  } catch { return json({ error: 'Submission could not be confirmed. Retry without changing your text.' }, 503); }
}
