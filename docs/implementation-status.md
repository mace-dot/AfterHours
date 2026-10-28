# Implementation status — Rulebook / Circle build brief

## Implemented and locally verified

**A — Custom Rulebook.** Separate model, templates, pure scoring, amendment voting and document-style authoring UI in `src/features/rulebook`. Classic, Wholesome, Chaos, Roast and blank starter templates. Identity/currency/titles/accent, category kinds and authorship, integer −1,000..1,000 values (expanded to support group-authored rules such as 30 points), stack groups, category limits, encounter caps 1..10, 40-enabled-category limit, tiebreak choices, voluntary last-place tradition, editable awards, sample-night preview and personal category opt-outs. Owner editing and member proposals are explicitly labeled local role previews, not authentication. Amendments use captured membership, unique per-member votes, 48-hour deadlines and a strict majority; passed changes affect only subsequent night snapshots. Assists score for the credited friend only after that friend confirms; the current local UI cannot confirm on behalf of real friends.

**Local integration.** New nights snapshot the full constitution at start. Existing night scoring snapshots and records remain intact. Schema v1 migrates additively to v2 using the existing browser storage key. Currency labels, category options and night scoring derive from the snapshot. Private entries never enter visible scores; sensitive posting needs confirmation. Media remains independent, temporary and unscored.

**C — Local ritual slice.** Ready-check rules card; sealed live-night count projections and hidden standings; direct home category quick-capture with remembered privacy and separate scoring opt-in; no location; home-safe checks automatically start review when every participant checks in; five-step morning reveal; own unsealing; per-award no-self-vote review ballots with finalized results; privacy-safe PNG recap export without other members or intimate details. Sensitive details require separate recap permission. No daily streaks or push notifications.

**D — Local memory slice.** Recap nominations, majority-vote Lore domain, source visibility validation, profile Shelf, and basic semester Wrapped excluding private/sealed/unpermitted sensitive records. Local UI records only the actual user's Lore/award vote; it does not invent votes from fictional friends.

## Implemented but NOT applied to the live Supabase project

**B — Circle client and migration.** Project `plpvygpgymfwwkflauaa` is configured using the owner-supplied public URL and publishable key. The real Auth health endpoint responded successfully. `supabase/migrations/202610270001_circle.sql` creates RLS-protected profiles, leagues, memberships, hashed expiring/max-use/approval invites, channels, messages/replies, reactions, reports, blocks and restricted future-game tables. Transactional RPCs cover adult profile creation, circle creation, code creation/rotation/revocation/redemption, approvals, channel creation/rename/archive, pins, member removal/ban, leaving and account deletion. Invite attempts are limited to ten per account per hour. Invite usage is recorded; past messages are hidden from new members by default. Anonymous access is limited to a schema-version probe. Circle creation posts a system card.

The browser client implements email magic-link login, adult profile, create/join, channels, text/replies/reactions/pins, author edit/delete, admin delete, code administration, approvals, reporting, blocks/removal and account/leave controls. Realtime notifications trigger authorized refetches, with five-second fallback polling. Signup/chat stays disabled until the schema probe confirms the migration. Auth transitions clear cached Circle state.

**External blocker:** SUPABASE_ACCESS_TOKEN has not been supplied to this runtime. The migration attempt stopped before making changes. A direct hosted RPC probe returned PGRST202 (circle_status missing), confirming the schema is not installed. A draft secret requirement for `api.supabase.com` and required network hosts is saved. Do not claim live Circle readiness, successful invites, or two-browser synchronization. `scripts/apply-supabase.py` applies the reviewed transactional migration once management access is supplied. The Supabase project's Auth Site URL and redirect allowlist must include the actual Vercel origin for magic links.

## Verification evidence

- 33 domain tests: legacy guarantees plus custom templates, validation, negative values, stacking, caps, modifiers, credited-friend confirmation, tiebreaks, immutable snapshots, amendment majority/expiry, sealed projections, home-safe, award voting, sensitive recap permissions, Lore, Wrapped and migration.
- 15 authorization integration checks on a real temporary PostgreSQL server using synthetic distinct auth identities. The migration executes; tests cover every table's RLS, outsiders, pre-join history, writes, spoofed system cards/ownership, reactions/replies/pins, expired/revoked/max-use/approval codes, account rate limits, author-only private entries (including versus admins), bans, blocks, leaving and full account deletion.
- 5 Chromium journeys at 360px: original post/media/persistence/delete flow; authoring custom Fumble/Side Quest/Assist and currency, new-night snapshots, private capture and morning review while retaining older history; member amendment voting and future-only application; Circle signup fails closed when the remote schema is missing; conversational posting persists without altering scores, and a custom 30-point rule can be tried in a fresh night.
- Production TypeScript/Vite build.

Local PostgreSQL simulates Supabase auth.uid()/roles. Hosted Supabase REST/Auth/Realtime behavior, email delivery, separate-device sync and production deployment are not established by these tests.

## Remaining work from the full brief

- Apply and validate the live schema, configure Auth redirects, and run two-account hosted end-to-end tests.
- Connect league Rulebooks, game nights, entries, authoritative scoring, amendments, ballots, check-ins and memory to server operations. These remain browser-local; their database tables intentionally have no client write access.
- Per-IP invitation abuse limits at a trusted edge; account rate limiting alone is not the complete requirement.
- Role assignment/ownership transfer UI and custom roles; channel reordering UI; structured mentions/notifications, typing/unread indicators, real threads beyond replies, reaction customization, channel pin lists and ephemeral cleanup.
- Private media/voice processing, metadata stripping, fail-closed moderation, short-lived authorized derivatives, professional reporting operations and cleanup/backup policies. Uploads stay disabled in the Circle rather than exposing unchecked files.
- Scheduled local-time morning reveals, home-safe nudges, configurable reminder times and realtime pulse. Current home-safe is a voluntary status, not an emergency or monitoring service.
- Shared game-event cards, Lore nominations from messages/moments, full Wrapped storytelling/sharing and group-export permissions. Current image export intentionally omits all other people.
- Verified age assurance remains future work. No partner fields, location, public discovery, payments or monetization were added.

## Conversation-first follow-up

Tonight now opens with a local conversation composer and a direct Rulebook shortcut. Plain updates do not create scored entries or reveal private/sealed activity metadata. Optional scoring remains a separate explicit action. The Rulebook foregrounds writing/editing rules; identity/templates/advanced controls are expandable. A new-night shortcut lets visitors try their authored rules without mutating existing snapshots. Quick capture is collapsed by default. Browser-local conversation messages are removed by the existing self-data deletion control. These messages are not synchronized Circle chat.
