# AfterHours: final Codex implementation plan

Status: build specification, not an implemented app. Working name is provisional. Audience: college students aged 18 or older. Initial users: existing private friend groups, particularly women who already keep a party-night points game in their group chat.

## 1. Product goal and confirmed preferences

Build a phone-first platform for college parties where an adult friend group records romantic and sexual experiences, earns points under agreed rules, follows nightly standings, and sees sports-style player stat lines. Every recorded completion offers an optional image or short-video attachment. A nightly winner and semester history make the game repeatable.

The user wants: a college-party setting; sexual activities prominently represented; Snapchat/contact exchanges, kisses, makeouts, hookups, and sex categories; points and nightly winners; individual stats; media on each completion; private social energy inspired by Tea; and an eventual monetizable platform. Do not quietly replace this with a generic habit tracker, dating app, or photo album.

Product recommendations in this document—name, color palette, caps, media limits, default privacy, and commercial model—are proposed defaults, not preferences explicitly selected by the user. Sexual categories remain central to the product, but only adult participants log their own experiences. The app does not maintain profiles or reputations of their partners.

## 2. Scope and delivery strategy

Build in two implementation milestones and a later commercial phase.

1. Local demo: complete interactive product with fictional adult players, local persistence for small structured records, and temporary local media previews. No real accounts, uploaded media, synchronization, or payments. Clearly label those limits.
2. Private beta: accounts, server-enforced membership, durable records, synchronized standings, private media processing, reporting, and deletion. This is the first version real groups should use.
3. Commercial expansion: paid league customization after repeat usage is demonstrated.

Do not mistake a polished local demo for a secure multi-user service. Finish one usable vertical slice before expanding. For a plan-only task, stop at the specification; when implementation is requested, inspect the repository and its AGENTS.md before changing anything. Preserve an existing stack unless it blocks the required behavior.

## 3. Main loop

Create/join league → join season → review tonight's rules → opt into tonight → record own activity → optionally attach media → choose sharing → see eligible standings → review next morning → finalize winner → accumulate season stats.

Logging should take two or three taps before optional media. Never interrupt a completion with an upsell. Never require a photo, video, or another person's identity for points.

## 4. League, season, and night rules

- League: private friend group with owner, optional cohosts, members, nickname-based profiles, and revocable expiring invitations.
- Season: a named period such as Fall Semester, containing independent party nights.
- Night: title, optional generic theme, league timezone, start/end times, review deadline, immutable scoring snapshot, and opted-in participants.
- State machine: draft → live → review → finalized. Drafts may be canceled. Review accepts corrections to existing entries; new entries are blocked by default. Finalized nights accept no new scoring entries.
- Default review window: 12 hours after the night ends. Use the league's explicit IANA timezone; handle midnight and daylight-saving changes through timestamps, not calendar-date guesses.
- Finalization calculates the current eligible standings atomically and awards shared wins for ties. No random tiebreakers and no ranking by speed of sexual activity.
- Corrections, withdrawn sharing, or deletions after finalization trigger a revision and recalculation. Show a simple “Results updated” marker. Do not retain deleted intimate details in an audit log.
- Hosts can manage rules before a night and remove members; they cannot read private entries, alter a member's entries, or share another person's activity.

## 5. Categories, encounter handling, and scoring

Ship neutral, non-graphic categories: contact exchange, kissing, makeout, hookup, sex, and later date. “Snapchat” is a recognizable example in onboarding; record only the count, never actual handles.

Treat an encounter as an anonymous local grouping, not a partner profile. It may contain multiple activity completions. For the physical-intimacy track, use the highest applicable completion for scoring within that encounter, rather than adding kiss + makeout + hookup + sex together. Contact exchange can score separately if the locked rules permit it. An encounter cannot be linked to a real person's identity or cross-night partner history.

Recommended default scoring:

| Category | Default score | Default visibility |
| --- | ---: | --- |
| Contact exchange | 1 | Private until deliberately shared |
| Kissing | 2 | Private until deliberately shared |
| Makeout | 2 | Private until deliberately shared |
| Hookup | 2 | Private; optional scoring participation |
| Sex | 2 | Private; scoring disabled until individual opt-in |
| Later date | 1 | Private until deliberately shared |

These are editable proposed defaults. Keep physical categories equally valued in the initial preset so more explicit acts do not automatically win more points. Do not introduce bonuses for intoxication, risky behavior, partner traits, escalating explicitness, or uploading proof. Start with a configurable scoring cap of three eligible encounters per participant per night; freeze the cap and values at night start. No streaks or notifications pressuring sexual activity.

At night join, each participant decides which intimate categories may contribute to group scoring and sees what the league can infer. Private entries contribute nothing to visible totals, rankings, awards, counts, or shared stats. Scoring a sexual-category entry requires a deliberate disclosure choice; label that choice plainly. Media sharing alone never enables activity sharing or scoring.

Implement scoring as a pure function over valid, explicitly eligible entries, the night's snapshot, encounter grouping, and caps. Never accept a client-submitted score as authoritative in beta. Display points on individual completions and a brief reason for zero or capped points. Server and client must use one shared scoring implementation or one authoritative server result.

## 6. Main screens

### Tonight
Current session, own eligible score, personal-only count, time remaining, top standings, and a prominent Log Activity button. Recent own entries include edit, delete, and attachment status. Make visibility understandable without opening settings.

### Log Activity
Choose category → existing anonymous encounter or new encounter → save. Show optional Add Photo / Add Video / Skip after the completion is safely recorded. Permit delayed entry while live without using precise location. No partner-name field and no freeform sexual descriptions.

### Scoreboard
Rank, nickname, points, and intentionally shared activity breakdown. Show provisional standings until finalization. A member with private-only entries appears without revealing those entries. Distinguish zero score from not participating without disclosing why someone opted out.

### Player Card / My Stats
Large numbers and compact sports-style layout. Own dashboard: nights entered, wins, eligible points, average points per entered finalized night, personal-best night, and activity counts. Shared card: only explicitly shared records. Avoid “conversion” metrics that imply a contact should lead to sex. No body counts or partner databases.

### League
Members, current season, upcoming/current night, previous results, and host controls. Generic party themes are enough; no dorm-room locations, live maps, public university directory, or campus-wide discoverability.

### Morning Review / Recap
Review own records and visibility, correct mistakes, preview the group recap, and see final standings. Recap media is independently opt-in. Sharing outside the app requires a preview and deliberate export; omit other members' names, faces, and details unless their export permission is recorded.

### Settings / Privacy
League and scoring settings; account controls; private/shared explanations; invitation controls; leave league; delete entries/media/account; report content; and mute notifications.

## 7. Photo and video requirements

Every completion supports zero or more optional attachments, starting with a maximum of three total attachments per entry. Proposed limits: JPEG/PNG/WebP images up to 10 MB each; video input up to 50 MB and 15 seconds. Adjust these limits only for a concrete infrastructure constraint.

Attachments are non-explicit party memories: selfies, group clips, or the venue atmosphere. No nudity, sexual acts, minors, covert recordings, or nonconsensual content. Adult age controls apply to the service; uncertain-age or prohibited uploads must not become viewable. Uploaders confirm permission from identifiable people pictured. This confirmation is not a substitute for reporting and moderation.

- Separate activity visibility from media visibility. Start both private. Sharing an image never exposes its activity category, timestamp precision, entry ID, or sexual score through captions, URLs, accessibility labels, or API payloads.
- Never award attachment points, require evidence, or infer an activity from the media.
- Preview, replace, remove, upload progress, cancel, retry, and clear failure states.
- Save the activity independently; failed uploads cannot erase or duplicate the completion.
- No video autoplay. Accessible viewer, labeled controls, generated thumbnails after approval.
- Beta: direct-to-private-storage uploads authorized by the server. Random object keys; validated type by file contents; size/duration limits; metadata stripping; and safe derivative generation.
- Media state: selected → uploading → quarantined/processing → approved or rejected; failures and deletion are separate terminal states. Only approved media is eligible to be served.
- Required content checks must fail closed. Do not ship a fake moderation pass or serve originals while a scan is pending. If moderation is unavailable, disable beta uploads and explain the limitation.
- Authorize each viewing request and issue short-lived signed links. Choose a short expiry such as 60 seconds. A previously issued URL may remain accessible until it expires; do not promise instant revocation or screenshot prevention.
- Delete originals, thumbnails, processed versions, and queued work when removed; purge caches where supported. Track cleanup jobs without retaining sensitive captions/content. Clearly disclose any backup retention before beta.
- On membership removal or leaving, stop new access immediately and remove that member's content from league views. Their remaining private copy follows their account settings.
- Local demo: use object URLs for user-selected previews, revoke them on replacement/unmount, and do not persist raw files in localStorage. Refresh persistence applies to structured demo records only; explain that temporary attachments reset.

## 8. Visual and interaction direction

Phone-first college nightlife: midnight navy, electric pink, off-white text, subtle gradients, oversized point totals, compact stat cards, and restrained trophy graphics. Sports-broadcast energy, not an explicit-content aesthetic. Bottom tabs: Tonight, League, My Stats. Reach Recap from Tonight and league history.

Support narrow 360 px screens, safe-area insets, keyboard navigation, readable contrast, reduced motion, and generous tap targets. Use brief neutral copy: “Log activity,” “Keep private,” “Share with league,” “Add a memory.” No shaming empty states or pressure notifications. Use fictional avatars and non-explicit placeholders. Do not spend the first milestone on branding assets.

## 9. Implementation architecture

For a new standalone repository, use a small TypeScript application with React, one routing approach, one styling system, and a shared domain module. For an existing repository or Sites implementation, follow its supported stack and hosting workflow rather than creating a second app. Do not pin package versions from memory; inspect existing dependencies and current official documentation when implementation requires a choice.

Keep domain types, scoring, state transitions, visibility rules, and validation independent of UI and persistence. Introduce a narrow repository/service interface so the local demo adapter can be replaced by real API calls without rewriting screens. Do not build an elaborate generic framework.

Suggested layout:

```text
src/
  app/                 navigation and application shell
  features/
    tonight/
    entries/
    scoreboard/
    stats/
    leagues/
    recaps/
    settings/
  domain/              types, scoring, visibility, night transitions
  services/            auth/data/media interfaces and adapters
  components/          shared controls and stat cards
  demo/                deterministic fictional fixtures
tests/                 domain and critical integration checks
docs/                  decisions, setup, implementation status
```

Backend selection belongs to beta preparation. Select one authenticated API, relational database, private object store, and asynchronous media processor compatible with the actual hosting environment. Do not provision unrelated services or mix multiple backends prematurely. Sensitive activity data must not appear in ordinary logs, error tracking, analytics properties, notification bodies, or payment metadata.

## 10. Data model

| Entity | Essential fields |
| --- | --- |
| User/Profile | id, nickname, avatar reference, adult-access state, created_at |
| League | id, name, owner_id, timezone, settings |
| Membership | league_id, user_id, role, status, joined_at |
| Invitation | id, league_id, hashed token, expiry, max uses, revoked_at |
| Season | id, league_id, title, starts_at, ends_at |
| Night | id, season_id, title, state, start/end/review timestamps, rules snapshot, revision |
| NightParticipant | night_id, user_id, joined_at, opted scoring categories |
| Encounter | id, night_id, user_id; no third-party identity |
| ActivityEntry | id, encounter_id, category key, owner_id, activity visibility, scoring opt-in, timestamps, revision |
| Attachment | id, owner_id, entry_id, storage key, safe metadata, processing state, independent visibility |
| RecapSelection | night_id, user_id, selected approved media, export permissions |
| Report | id, reporter_id, target reference, reason code, handling state |
| CleanupJob | opaque target reference, state, retry timing; no intimate content |

Use stable category keys and immutable night rule versions. Entries reference the locked night rules. Scores are derived; cached standings must be rebuildable and keyed to a revision. Add uniqueness/idempotency constraints for duplicate requests and one membership/participant per scope. Apply server-side ownership and active-membership checks to all reads and writes, including thumbnails, exports, and realtime subscriptions.

## 11. API behavior and consistency

Provide narrow operations for create/join/leave league; create/revoke invite; create/start/end/finalize night; opt into night; create/update/delete own entry; fetch permitted standings/stats; initiate/complete/delete attachment; and report content.

Use idempotency keys for entry creation and upload initiation. A dropped connection followed by Retry must not award points twice. Use transactional rule locking and finalization. Recompute after edits, deletion, visibility changes, category opt-out, and membership changes. Optimistic UI must roll back rejected writes and say when a record is unsaved. Do not silently queue real intimate records offline in beta v1; offer retry with clear status.

Realtime may use the selected backend's supported subscription mechanism or short polling for a small beta. Broadcast only already-authorized public-to-league projections; do not broadcast full private rows and filter them in the browser. Keep media private through the API, not merely hidden in components.

## 12. Adult access, consent, moderation, and deletion

Use an adults-only onboarding flow, affirmative participation, and withdrawal controls. University email does not establish adulthood. Demo self-attestation is not verified age assurance; document the difference. Before public access, select and implement an appropriate adult-access process and actual moderation operations. Do not collect identity documents into this application's own storage by default.

Records must represent the adult participant's own consensual experiences. Do not create challenges involving coercion, incapacitation, or people who cannot consent. No anonymous accusations, partner lookup, public ratings, messaging strangers, or searchable partner histories.

Offer report/remove flows for media and misuse, scoped moderator access with accountability, and clearly defined moderation response ownership. A user's withdrawal must remove their contributions from visible competition data. In-app controls cannot retract copies someone has already exported; say so plainly. Account deletion must cover records, media derivatives, caches, and downstream cleanup, with a clear policy for backups.

## 13. Phased Codex implementation tickets

### Phase A — domain and fixtures
Inspect repository instructions, record assumptions, define types and state transitions, implement scoring and visibility, and create two fictional nights with several adult player profiles. Include ties, capped entries, private entries, and revised results. Write focused tests for the domain risks below.

Exit: deterministic scoring and permission projections work independently of UI.

### Phase B — complete local experience
Implement navigation and Tonight → Log → Optional Media → Scoreboard → Review → Recap. Add My Stats, rule configuration, error/empty states, and responsive design. Persist only structured demo data with a schema version and reset button. Provide temporary media previews.

Exit: a user can complete the full local loop, refresh structured history, undo an entry, and understand why a private entry does not affect standings.

### Phase C — real shared beta
Choose the minimal compatible backend; add auth, adult-access controls, membership permissions, invitations, migrations, authoritative writes, private-media processing, moderation operations, and cleanup. Replace the demo adapter. Test with synthetic data and two separate accounts before inviting real participants.

Exit: two authorized devices see consistent standings; an outsider and removed member cannot retrieve activity/media; the upload pipeline blocks unapproved content; cleanup and revisions work.

### Phase D — private pilot and product learning
Use one existing adult friend group. Measure onboarding completion, active leagues, repeat weekend participation, and recap usage using coarse aggregate metrics only. Collect direct usability feedback. Fix logging friction and confusing disclosure controls before growth.

Exit: the group can run a night without developer help and chooses to return. No invented usage targets presented as validated evidence.

### Phase E — monetization
Keep a useful free league. Test a paid league plan for themes, custom seasons, historical summaries, and recap designs. Bill one group organizer rather than every participant initially. Decide price through pilot feedback. Do not charge for privacy, deletion, reporting, or opting out. Do not sell intimate data or run ads targeted to sexual activity. Add payments only after the core beta is reliable.

## 14. Essential verification

1. The same request retried twice creates one entry and one score contribution.
2. Kiss → makeout → hookup in one encounter follows the locked non-stacking rule.
3. Encounter caps apply consistently after edits and deletion.
4. Private-only entries do not change visible totals, awards, stats, realtime events, or API payloads.
5. Shared media never reveals a private activity label through metadata or accessibility text.
6. Hosts and other members cannot read or modify private records.
7. Draft rules freeze at start; late entry attempts fail after live state ends.
8. Review corrections and finalization race safely; ties award shared wins.
9. Deletion/withdrawal revises finalized standings and removes visible media.
10. Failed uploads preserve entries; only approved attachments become viewable.
11. Revoked invitations, removed membership, and expired media links fail authorization.
12. Night boundaries work across midnight and daylight-saving changes.
13. The complete mobile flow works with keyboard access and reduced motion.

Use domain unit tests for calculations and visibility, integration tests for authorization and transactional behavior, and one focused end-to-end journey. Avoid snapshot-heavy tests that merely mirror component markup. Run the repository's relevant checks and build; report actual verification limits.

## 15. Efficiency and scope controls for Codex

- Treat this specification as the source of truth. Read the relevant repository instructions once and inspect related files in batches.
- Work milestone by milestone; do not start billing, native apps, AI features, or public discovery while the core loop is incomplete.
- Reuse existing components, tooling, auth, and infrastructure. Add a dependency only for a concrete requirement.
- Keep the scoring/visibility core centralized. Do not duplicate business rules across UI components.
- Use deterministic fixtures and a local adapter first. Avoid implementing the same feature twice under separate demo and production screens.
- Keep updates brief: completed behavior, evidence, and next blocker. Ask only questions that materially block work; make reversible design choices using these defaults.
- Never invent credentials, connected services, production readiness, successful tests, age verification, or moderation coverage.
- Store actual secrets in the platform's secret mechanism. Never place credentials in browser bundles or committed files.
- After relevant checks pass, advance the milestone rather than repeatedly rerunning unchanged tests.
- Maintain a short implementation-status document: shipped, mocked, unverified, and remaining. Do not bury missing backend behavior in a footnote.
- Deploy only through the repository/platform's supported workflow and the scope authorized for that implementation task.

## 16. First implementation instruction to paste into Codex

Read this specification and the repository's AGENTS.md. Implement Phase A and Phase B as one complete local-demo milestone. Keep the sexual/romantic activity focus, college-party flow, configurable point system, nightly winners, sports-style player stats, and optional non-explicit photo/video previews. Use the proposed defaults where choices are unspecified. Do not implement payments or pretend local data synchronizes. Keep activity sharing, media sharing, and scoring eligibility distinct. Show the first usable vertical slice, then complete the milestone, run focused tests and the appropriate build, and provide setup instructions plus a clear list of mocked and production-only capabilities. Continue into Phase C only when the implementation task includes a real multi-user beta and the required services are available.
