# Room for Your Stories — edit and publish from VS Code

This is the independent Cloudflare Workers edition of your website. It includes the public submission form, public stories page, bot connection page, and owner-only deletion. No ChatGPT or GitHub account is required to publish updates once Cloudflare is set up.

Your currently published website is not changed by downloading or editing this folder. The new site starts at a Cloudflare workers.dev address. Move your custom domain only after testing it.

## 1. Install and open

Install Node.js 24 LTS from https://nodejs.org/ and restart VS Code after installation.
Extract this ZIP. In VS Code choose File > Open Folder and select the inner `roomforyourstories-local` folder containing `package.json`.
Choose Terminal > New Terminal. Run each command separately in that folder:

```powershell
npm install -g pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm exec wrangler login
```

The last command opens a browser. Sign into the Cloudflare account that owns roomforyourstories.com and allow Wrangler access. If you have multiple accounts, select the intended account. Later deployments use that saved login; rerun login if it expires.

## 2. Create the website database

```powershell
pnpm exec wrangler d1 create roomforyourstories-db
```

Cloudflare prints a database ID. Open `wrangler.jsonc` and replace ONLY the placeholder `database_id` value `00000000-0000-4000-8000-000000000000` with that ID. Keep the binding `DB` and the `migrations_dir` value `drizzle`. Save the file.

This database belongs to your own account. Bot settings from the old hosting service are not automatically copied.

## 3. Generate private credentials

```powershell
pnpm run secrets:generate
```

Open the new `.dev.vars` file in VS Code. It contains three new random credentials:

- `OWNER_PASSWORD`: sign into `/owner-login` with this password. Store it in your password manager.
- `SETUP_SECRET`: the key used in `/setup#key=YOUR_KEY` to connect the bot.
- `CONFIG_KEY`: encrypts the stored Discord bot token. Keep it unchanged and backed up.

Keep this file private. It is ignored by Git and is never included in public assets. The publish command uploads its values as Cloudflare secrets. The downloaded ZIP contains no real credentials. You can change OWNER_PASSWORD or SETUP_SECRET in this file and publish again; changing OWNER_PASSWORD also invalidates existing owner sessions. Do not regenerate CONFIG_KEY after connecting the bot, because it is needed to decrypt the saved settings.

Owner login replaces ChatGPT sign-in in this independent edition. Only someone with your owner password can delete stories through the website. Discord server permissions still control who can delete posts directly within Discord.

## 4. Optional local preview

```powershell
pnpm run db:local
pnpm run dev
```

Open the localhost URL printed in the terminal, usually http://localhost:5173. Save a page or stylesheet to see your changes. Press Ctrl+C in the terminal to stop the preview.

Local preview uses a separate local database. Submissions remain closed until you configure a bot in that local database. If you connect a real bot during preview, submissions and owner deletions affect the real Discord channel. You do not need to connect a bot locally just to change the design.

## 5. First publication

```powershell
pnpm run deploy
```

This builds the website, applies database migrations to your account, and deploys code and secrets. Review any Cloudflare confirmation prompts in the terminal. The resulting workers.dev address is your new website. This command does not move your domain yet.

Open the new site at `/setup#key=YOUR_SETUP_SECRET`, replacing YOUR_SETUP_SECRET with the SETUP_SECRET value from `.dev.vars`. Enter your Discord bot token and destination channel ID. The bot needs View Channel, Send Messages, Embed Links, and Read Message History.

Open `/owner-login` on the new site and enter OWNER_PASSWORD from `.dev.vars`. You can then use `/manage` to delete story posts. Your setup link and password must remain private. The public stories page has no owner sign-in link.

Test one submission at the new address and check that it appears in Discord and on `/stories`. Stories are read directly from the connected channel, including older matching story/reply posts from that bot. No copy of story text is stored in D1. New website receipt numbering starts from a fresh database; existing Discord messages remain intact.

## 6. Move roomforyourstories.com after testing

In Cloudflare open Workers & Pages > roomforyourstories > Settings > Domains & Routes > Add > Custom Domain and enter `roomforyourstories.com`.

The apex currently has two A records pointing to the existing hosting service (162.159.143.30 and 172.66.3.26). Review Cloudflare's replacement prompt. If the domain cannot be added because those records conflict, remove ONLY those two apex A records and immediately add the Worker Custom Domain. This is the cutover; a brief interruption is possible. Cloudflare manages the new domain record and certificate. Do not change your nameservers or unrelated email records.

Once the new domain works, keep its route in your local configuration by adding this top-level property in `wrangler.jsonc` (with the appropriate comma between properties):

```json
"routes": [
  { "pattern": "roomforyourstories.com", "custom_domain": true }
]
```

Do not add this before you are ready to switch. Publish again after saving it. After the switch, local deployments update roomforyourstories.com; the older Sites publication is a separate copy and should no longer be used to publish this domain.

## Every later update

Edit and save your files, then run:

```powershell
pnpm run deploy
```

Or in VS Code select Terminal > Run Task > Publish website. It runs the same command. GitHub is optional; no chat or assistant is required.

Main files:
- `app/page.tsx` — submission page.
- `app/globals.css` — colours and layout.
- `app/stories/page.tsx` and `app/stories/feed.tsx` — public stories.
- `app/api/share/route.ts` — sends submissions to Discord.
- `app/api/stories/route.ts` — reads and deletes bot stories.
- `app/manage/page.tsx` — owner management page.
- `app/owner-login/page.tsx` — password sign-in.
- `wrangler.jsonc` — your Cloudflare Worker and database configuration.

If you edit the database schema, run `pnpm run db:generate` before publishing. Deployment applies new migrations; normal text, colour and layout edits need no manual database changes.

## Checks and limitations

`pnpm run check` checks TypeScript and `pnpm test` checks signed owner sessions. The package was built and its local public/owner routes checked. Deployment in your own account and live Discord delivery require the setup above and have not been tested on your account. Keep your private credentials backed up and use normal Cloudflare account security.

Official references:
- https://developers.cloudflare.com/workers/vite-plugin/get-started/
- https://developers.cloudflare.com/d1/get-started/
- https://developers.cloudflare.com/workers/configuration/secrets/
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
