import { getOwner } from '@/lib/owner-auth';
import { ownerId } from '@/app/api/owner/route';
import { database, json, sameOrigin } from '@/lib/delivery';

export async function GET(request: Request) {
  try {
    const before = new URL(request.url).searchParams.get('before');
    if (before && (!/^[1-9]\d{0,15}$/.test(before) || !Number.isSafeInteger(Number(before))))
      return json({ error: 'Invalid page.' }, 400);
    const rows = await database().prepare('SELECT id,text,created FROM website_stories WHERE deleted=0 AND id<? ORDER BY id DESC LIMIT 101')
      .bind(before ? Number(before) : Number.MAX_SAFE_INTEGER)
      .all<{ id: number; text: string; created: number }>();
    const page = rows.results.slice(0, 100);
    return json({
      stories: page.map(row => ({ id: String(row.id), title: `My Story · Web #${row.id}`, text: row.text, created: new Date(row.created).toISOString() })),
      next: rows.results.length > 100 ? String(page.at(-1)!.id) : null,
      ready: true,
    });
  } catch { return json({ error: 'Stories are temporarily unavailable.' }, 503); }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'Use the owner page.' }, 403);
  try {
    const user = await getOwner();
    if (!user || user.userId !== await ownerId()) return json({ error: 'Only the owner can delete stories.' }, 403);
    const id = new URL(request.url).searchParams.get('id');
    if (!id || !/^[1-9]\d{0,15}$/.test(id) || !Number.isSafeInteger(Number(id))) return json({ error: 'Invalid story.' }, 400);
    // Retain the receipt so replaying an old request cannot restore deleted text.
    await database().prepare("UPDATE website_stories SET deleted=1,text='' WHERE id=?").bind(Number(id)).run();
    return json({ deleted: true });
  } catch { return json({ error: 'Deletion could not be confirmed. Refresh before trying again.' }, 503); }
}
