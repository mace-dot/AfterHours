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
