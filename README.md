# AfterHours

A phone-first, adults-only party-night game for private friend groups. **This is a local demo, not a real shared service. Use fictional data.**

## Run

Requires Node 24 and npm 11 (validated with Node 24.19.0).

```sh
npm ci
npm run dev
```

Open the Vite development server in your local development environment. `npm run build` typechecks and builds static output into `dist/`; `npm run preview` serves that build.

```sh
npm test
npm run test:e2e
```

The browser journey uses `/usr/bin/chromium` in this cloud environment. On another machine, update `playwright.config.ts` to your installed Chromium path or use Playwright's bundled browser.

## Try the complete loop

1. Confirm adult demo access. Choose **Opt into tonight** and review category opt-ins.
2. Choose **Post a moment**, pick a category, then **Keep private** or **Post to the circle**. Scoring is a separate opt-in. Choose **Add to this moment** on an existing entry to group another activity.
3. After posting, optionally choose **Add a memory** for a non-explicit local image/video. No files leave your device.
4. Deliberately share an activity and enable its scoring to see standings update. Media sharing remains independent.
5. Refresh: structured records persist; all temporary media resets.
6. Review, edit, withdraw or delete an entry. Visit My Stats, League history and Recap.
7. In League, create a draft, configure rules, start it, end it, and finalize after the 12-hour review deadline. The fictional previous night demonstrates tied wins and revised results.

Rules are centralized in `src/domain/game.ts`; `src/services/local.ts` is the replaceable persistence adapter. Personal counts include private records; shared standings only derive from deliberately eligible entries. Physical categories score once per encounter, with independent contact/date points and a locked encounter cap.

See [implementation status](docs/implementation-status.md) for limits and beta requirements.

## Deploy with Vercel

Import the GitHub repository `mace-dot/AfterHours` in Vercel. Use the repository root, the Vite framework preset, Node 24.x, build command `npm run build`, and output directory `dist` (recorded in `vercel.json`). No environment variables are needed for the local demo. Deployments serve the demo publicly unless Vercel deployment protection is enabled; the adult screen is self-attestation, not access security. Each visitor has independent browser-local data and temporary media. Future pushes to the connected production branch trigger redeployment.

## Custom Rulebook and night rituals

Open **League → Open the Rulebook**. Choose a template, name your currency, write Moments/Side Quests/Fumbles/Assists, and customize rules and awards. The local role preview lets you inspect member proposals without pretending to authenticate fictional players. New nights snapshot the Rulebook at start; existing nights retain their rules.

Create/start a new night, review **Tonight's rules**, and choose **I'm in**. Shared moments remain sealed during Live. Quick capture starts private; you can deliberately change its usual privacy and scoring preference. Home-safe records no location. Review opens after the host ends the night or everyone checks in. Recap has reveal cards, unsealing, awards and privacy-safe image export; **League → Lore & Season Wrapped** opens the local archive.

## Supabase Circle setup

The supplied public project configuration is included; Vite environment variables can override it. Public publishable keys are intended for browser use; the database enforces access through RLS. Never put database passwords, management tokens, or service-role keys in VITE variables or the repository.

1. Apply `supabase/migrations/202610270001_circle.sql` to the empty AfterHours project. With the management token securely injected as `SUPABASE_ACCESS_TOKEN` for api.supabase.com, run `python3 scripts/apply-supabase.py`. Alternatively the owner can run that file in Supabase's SQL editor. The file is a one-time transactional migration, not a repeated installer.
2. Configure Supabase Authentication Site URL and redirect URLs for the actual Vercel origin, including `https://afterhours-gamma-nine.vercel.app` and its `/?circle=1` callback. Authentication uses email magic links and explicit adult self-attestation.
3. Open **League → Enter the Circle**. A schema probe keeps sign-up/chat disabled until the migration exists. Use two adult synthetic accounts to verify create/invite/join and synchronized chat before real use.
4. The Circle is real-account infrastructure, but Rulebooks/game nights are still a separate local demo. Private-media uploads remain disabled pending moderation and processing.

Run `npm run test:rls` for the local real-PostgreSQL authorization suite; it starts and stops a temporary embedded server on port 55437. No Docker or live credentials are required. See `docs/implementation-status.md` for the complete feature/verification matrix and remaining requirements.
