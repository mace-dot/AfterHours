# AfterHours — Build Brief for Implementing Agent

> **You are being handed an existing product demo to improve.** Read this whole brief before writing code. Start by auditing the current repository, then propose a plan before making large changes.

---

## 0. Context you need

**What AfterHours is:** An adults-only (18+) private social game for existing friend groups. Friends go out on weekend nights, post selected moments (romantic and otherwise), score them under rules the group agreed to, and wake up to a shared recap. The game already exists informally in college group chats; AfterHours gives it structure, suspense, and memory.

**Current state of the code:**
- Interactive demo, source on GitHub, hosted on Vercel.
- Has: fictional players, "Post a moment," privacy choices (private vs. post to circle, scoring as a separate choice), scoring, standings, player cards, night controls, review/recap, temporary media previews.
- Structure: **League → Season → Night**. Night lifecycle: **Draft → Live → Review (12h) → Finalized**.
- Default scoring: 1 pt contact exchange & later date; 2 pts each physical category (kiss, makeout, hookup, sex). Physical categories **do not stack within one anonymous encounter** (highest counts). Max **3 eligible encounters per player per night**. Rules are **locked as a snapshot when a night goes Live**.
- **All data is local to each browser.** No auth, no shared accounts, no server, no real-time sync.

**Product thesis (why people will leave the group chat for this):** The group chat is great for banter but bad at five things. AfterHours owns only these:

| Group chat is bad at | AfterHours provides |
|---|---|
| Suspense | Sealed moments + morning reveal |
| Memory | Lore, awards, season archive, Wrapped |
| Fairness | Agreed rules, automatic scoring |
| Ritual | A night that opens, closes, and gets recapped |
| Private-but-counted | Scoring without revealing details |

**Core design principle:** The night is for *capture* (one tap, drunk-proof). The morning is for *storytelling* (the main event).

---

## 1. Your tasks, in priority order

1. **Audit** the repo. Summarize architecture, state management, scoring code, and data model. Identify what can be reused.
2. **Feature A — Custom Rulebook (IKEA effect).** Highest priority. Can be built on the existing local-only architecture first.
3. **Feature B — The Circle (private Discord-style chat with invite codes).** Requires a real backend; see §4.
4. **Feature C — Night ritual upgrades** (sealed moments, home-safe check-ins, morning reveal, awards, recap card).
5. **Feature D — Memory layer** (Lore, Wrapped).

Ship each feature behind clean module boundaries. Do not break existing scoring guarantees (§2.6).

---

## 2. Feature A — The Custom Rulebook

### 2.1 Why (the IKEA effect)
People value what they build. A group that writes its own rules, names its own points, and invents its own awards feels ownership — and that rulebook becomes part of the group's identity and a reason it can't switch to a group chat. **Customization must feel like authorship, not settings.** Frame it as the group's "Rulebook" (or "Constitution"), not a config screen.

### 2.2 Starter templates (never start from blank)
Blank canvases intimidate. On league creation, offer templates the group then edits:

| Template | Contents |
|---|---|
| **Classic** | Current default romantic categories + scoring |
| **Wholesome** | No sexual categories; side quests, social wins, assists |
| **Chaos** | Heavy on Fumbles and side quests, light romantic |
| **Roast** | Fantasy-league style: stat lines, Fumbles, last-place punishment |
| **Build from scratch** | Empty, with suggestions |

Sexual categories (makeout, hookup, sex) must be **off by default in every template except Classic**, and must be explicitly enabled by the group.

### 2.3 What groups can customize

**League identity**
- League name, emoji/icon, accent color
- **Point currency name + emoji** (e.g., "Clout 💅", "Aura ✨", "Rizz Points") — used everywhere instead of "points"
- Custom titles for 1st place and last place (e.g., "Main Character", "The Fumbler")

**Categories** — each category is a fully editable object:

```ts
type Category = {
  id: string;
  name: string;               // "Got her number", "Danced on a table"
  emoji: string;
  description?: string;
  kind: 'moment' | 'side_quest' | 'fumble' | 'assist';
  points: number;             // integer, range -10..+10 (fumbles may be negative OR positive — group decides)
  stackGroup?: string;        // categories sharing a stackGroup don't stack within one encounter; highest wins
  perNightLimit?: number;     // max times this category counts per player per night
  sensitive: boolean;         // sensitive => defaults to private, extra confirmation, excluded from recap cards unless explicitly shared
  requiresConfirmation?: boolean; // e.g. assists must be confirmed by the friend credited
  enabled: boolean;
  createdBy: playerId;        // credit the author — ownership matters
  createdAt: timestamp;
};
```

Category kinds:
- **Moment** — things a player does (existing categories live here).
- **Side quest** — host-defined for a specific night ("Get the DJ to play our song", "Get a free drink"). Can be one-time or recurring.
- **Fumble** — funny disasters ("Lost my phone", "Texted my ex", "Fell on the dance floor"). The group chooses whether fumbles cost points or earn them. Fumbles are a core feature: the best stories are the disasters, and they shift the game away from body count.
- **Assist** — credit a friend ("Wingwoman", "Got us into the club", "Got everyone home"). The credited friend must confirm. Makes the game cooperative.

**Scoring rules (league-level)**
- Encounter cap per night (default 3, range 1–10)
- Stack groups (default: all physical categories in one stack group)
- Optional **night modifiers** the host can set per night: "Double side quests", "Fumbles count double", "Assists only"
- Tiebreak rule: shared win (default) / most assists / most side quests
- **Last-place punishment** (free text, e.g., "Buys brunch", "Wears the hat") — shown in recap

**Awards (voted, not scored)**
- Group defines award names (defaults: MVP, Plot Twist of the Night, Most Unhinged, Best Fumble, Mom of the Group)
- Each award: name, emoji, voting rule (one vote per member, can't vote for self)

**Personal customization (per player)**
- Nickname, avatar/emoji, earned titles displayed on profile
- **Personal opt-outs**: a player can turn off any category for themselves (e.g., opt out of all sensitive categories) without leaving the game. Opted-out categories never appear as options for them and never imply anything to others.

### 2.4 Democratic rule changes (amendments)
To deepen ownership and avoid one person controlling the fun:
- Any member can **propose an amendment** (add/edit/remove a category, change a point value, change the cap).
- Members vote (default: simple majority of active members, 48h window; owner can configure).
- Passed amendments apply **starting with the next night** — never to a Live or Review night.
- The Rulebook keeps a visible **history log**: "Amendment 4: 'Fell asleep at the party' added as a Fumble, proposed by Jess, passed 5–1." This history is part of the group's lore.

### 2.5 Rulebook UX requirements
- Rulebook screen reads like a document: sections for Moments, Side Quests, Fumbles, Assists, Awards, Rules — each item showing emoji, name, points, and author.
- Inline edit for owner/hosts; "Propose change" button for members.
- Live **preview**: "Here's how a sample night would score under these rules."
- At the start of each night, members see a short **"Tonight's rules"** card (what changed since last night is highlighted) and must tap "I'm in" to participate.

### 2.6 Scoring guarantees — DO NOT BREAK
- Scores are always **derived** from entries + the night's locked rule snapshot. Never stored as user-submitted numbers.
- A night snapshots the full rulebook when it goes Live. Later edits never alter that night.
- Private entries contribute **nothing** to visible totals, awards, or shared stats.
- Scoring eligibility, activity visibility, and media visibility remain **three independent choices**. Media never earns points.
- Deleting/withdrawing an entry recalculates results and shows a "Results updated" marker.
- Guardrails: points integer −10..+10; max 40 enabled categories per league; per-player per-night total must be computable deterministically. Write unit tests for the scoring engine covering stack groups, caps, negative points, assists requiring confirmation, modifiers, and withdrawals.

---

## 3. Feature B — The Circle (private Discord-style chat)

### 3.1 Purpose
A private group space that lives alongside the game. It doesn't need to beat iMessage at general chat — it needs to be **the home of the game**: where nights are announced, moments are discussed, recaps land, and lore lives. Think a small private Discord server per league.

### 3.2 Access via invite code
- A league is private. **The only way in is an invite code** (plus an account and 18+ attestation).
- Code format: 8 characters, uppercase, unambiguous alphabet (no 0/O/1/I/L), e.g. `K7QX-MP4R`. Also shareable as a link/QR.
- Owner/admins can create codes with: **expiry** (1h / 24h / 7d / never), **max uses** (1 / 5 / 10 / unlimited), and **require approval** toggle (new joiner waits in a pending queue until an admin approves).
- Codes are revocable instantly; owner can "rotate" (revoke all and issue a new one) if a code leaks.
- Server-side: rate-limit join attempts per IP/account (e.g., 10/hour), store only hashed codes, log who used which code.
- New members **cannot see history from before they joined** by default (owner can change this). Protects past disclosures from people who weren't there.

### 3.3 Server structure
- **Channels**, customizable by owner/admins: create, rename, reorder, set emoji, archive.
- Default channels on creation:
  - `#general` — everyday chat
  - `#tonight` — auto-created/reset per night; the live hub during a night
  - `#the-debrief` — where the morning recap posts and discussion happens
  - `#lore` — pinned best moments and inside jokes
  - `#rulebook` — amendment proposals and votes post here automatically
- **Threads**: any message, moment, or recap card can spawn a thread.
- **System messages from the game** post into channels as rich cards: "Night opened", "Maya posted 2 moments 🔒", "Everyone's home 🌙", recap card, award results, amendment passed.

### 3.4 Roles & permissions
| Role | Can |
|---|---|
| Owner | Everything; transfer ownership; delete league |
| Admin | Manage codes, members, channels, rulebook edits |
| Host | Create/run nights, set side quests and modifiers |
| Member | Chat, post moments, propose amendments, vote |

Roles are assignable; a member can hold multiple. Owner can create custom role names (e.g., "Den Mom") with a color — another IKEA touch.

### 3.5 Customization (IKEA effect, again)
- League icon, banner, accent color
- **Custom reaction emoji** set per league (upload or pick), plus custom reaction labels
- Custom channel names/emoji
- Pinned messages per channel
- Member nicknames and role colors

### 3.6 Chat features (MVP)
- Text messages, replies, reactions, @mentions, pins
- Image attachments (subject to media rules in §6)
- Voice notes (short, ≤60s) — important for morning storytelling
- Typing indicators, unread counts, notifications per channel (mutable)
- Message edit/delete by author; admin can delete any message
- **Ephemeral mode** per channel (optional): messages in `#tonight` auto-delete after N days unless "saved to Lore"

### 3.7 Honest privacy disclosure
Screenshots cannot be prevented. Show a clear, friendly notice on join and in channel settings: *"Your circle can screenshot anything you share. Only post what you'd be okay with them keeping."* Do not imply technical protection that doesn't exist.

---

## 4. Required backend (the demo is currently local-only)

Feature B (and real multi-user use of A, C, D) needs a backend. Recommended stack — **confirm with the user before committing**:

- **Supabase**: Postgres, Auth, Realtime (for chat + live night pulse), Storage (media), Row Level Security.
- **Vercel**: keep the existing hosting for the frontend.

Requirements:
- **Row Level Security on every table.** A user can only read rows for leagues they are an active member of. Private moments readable only by their author. Test RLS policies explicitly.
- Auth: email/magic link or phone OTP. 18+ self-attestation at signup (stored with timestamp); note in code that verified age assurance is a future requirement.
- Store no partner names, handles, or identifiers anywhere. No free-text field attached to a sexual category may be shared to the circle by default.
- No live location storage, ever.
- Media: private storage bucket, signed URLs with short expiry, strip EXIF/GPS metadata on upload.
- Account deletion and "leave league" flows that actually delete or detach data (see the existing withdrawal/deletion semantics).

Suggested core tables (adapt to existing model): `profiles`, `leagues`, `league_members` (role, joined_at, status), `invite_codes` (hash, expires_at, max_uses, uses, requires_approval, revoked), `join_requests`, `rulebooks`, `categories`, `amendments`, `amendment_votes`, `seasons`, `nights` (status, rule_snapshot jsonb), `night_participants`, `entries` (category_id, encounter_id, visibility, scoring_eligible, sealed), `assist_confirmations`, `awards`, `award_votes`, `channels`, `messages`, `reactions`, `custom_emoji`, `media`, `checkins`, `lore_items`.

---

## 5. Feature C — Night ritual upgrades

Build in this order:

1. **Pregame "ready check."** Host opens the night; members get "Tonight's rules" + "I'm in" button. Optional group photo becomes the night's cover image.
2. **Sealed moments.** During Live, shared moments are **sealed**: others see only "Maya posted 2 moments 🔒". Standings are hidden until the reveal. This creates suspense and removes live pressure to post.
3. **Drunk-proof capture.** Posting a moment must be ≤2 taps from the home screen: big tap targets, emoji category grid, defaults to the player's usual privacy choice. Optional 5-second voice note. (Later: lock-screen widget / iOS Live Activity.)
4. **Firefly pulse.** A live screen where each participating friend is a soft glowing dot that flickers when they post. No details, no location — just presence.
5. **Home-safe check-ins.** Each participant taps "🏠 Home safe." The night closes with "Everyone's home 🌙" once all check in. If someone hasn't checked in by a host-set time (default 4am), their circle gets a gentle nudge to reach out. Check-ins never earn points and never include location.
6. **Morning reveal (~11am, configurable).** Night moves into Review and the recap is "ready." Reveal plays card-by-card like an awards show: side quests completed, fumbles, assists, then standings, ending on the group's top moment (peak-end rule — end on a high). Each player can unseal their own moments and add a voice-note story.
7. **Award voting** opens during Review; results post at Finalize.
8. **Recap card.** Auto-generated, attractive share image (night name, cover, winner, best fumble, awards — **no sensitive categories unless the player explicitly shared them**). Posts to `#the-debrief` and can be shared to an external group chat. This is a growth loop.

**Cadence rule:** No daily streaks, no "you haven't posted today" notifications. The app is quiet Monday–Wednesday. Notifications cluster around nights and the morning reveal.

---

## 6. Safety & privacy — non-negotiable

- 18+ only. Self-attestation now; architecture should allow verified age assurance later.
- No partner identity fields anywhere. No searchable people, no partner profiles, no ratings of people.
- No public leaderboards, no cross-league visibility, no discovery of leagues. Everything is inside one invite-only circle.
- No live location.
- Media rules enforced in UI copy and report flows: no minors, no explicit content, no covert recording, identifiable people must have consented. Report button on every message and media item; admins can remove; reports logged.
- Block and kick/ban members; banned users' codes invalidated.
- Sensitive categories: default private, extra confirmation before sharing, excluded from recap cards and Wrapped unless explicitly shared.
- Clear data controls: withdraw an entry, leave a league, delete account.

---

## 7. Feature D — Memory layer (after A–C)

- **Lore:** any message, moment, or recap item can be nominated "Make it Lore" — a quick group vote. Lore items pin to `#lore` and to the season archive. Non-Lore content in ephemeral channels fades.
- **Shelf:** each player's profile shows earned titles, awards, best nights.
- **Season Wrapped:** end-of-season story (Spotify-Wrapped style): group stats, everyone's titles, most-used fumble, best night, amendment history highlights. Shareable. Likely future premium feature.

---

## 8. Acceptance criteria (definition of done for A + B MVP)

- [ ] A new user can create a league from a template, rename the point currency, and add a custom Fumble, Side Quest, and Assist category.
- [ ] A member can propose an amendment; the group votes; it applies only from the next night; it appears in Rulebook history with the proposer credited.
- [ ] Scoring engine passes unit tests for stack groups, caps, negative points, modifiers, confirmed vs. unconfirmed assists, private entries, and withdrawals.
- [ ] Owner can generate an invite code with expiry/max-uses/approval; a second account can join only with a valid code; revoked/expired codes fail; brute-force attempts are rate-limited.
- [ ] Members see only leagues they belong to (verified with RLS tests using two separate accounts).
- [ ] Channels can be created/renamed; messages, reactions, replies, and pins sync in real time between two browsers.
- [ ] Game events (night opened, recap) post as system cards into the right channels.
- [ ] Private moments are never visible to anyone but the author, in any view, card, or API response.

---

## 9. Working instructions for you (the agent)

1. **Audit first.** Report the current architecture and a proposed plan before writing major code.
2. **Ask before** choosing/changing the backend, adding paid services, or restructuring the data model.
3. Build Feature A on the current local architecture first so it can be demoed quickly; design its data model so it migrates cleanly to the backend.
4. Keep the scoring engine a pure, well-tested module.
5. Match the existing code style and component patterns.
6. Don't build: public profiles, discovery, partner fields, location features, streaks, or monetization.
7. Commit in small, reviewable steps with clear messages.
