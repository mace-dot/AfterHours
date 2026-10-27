# Rulebook implementation audit and plan

The existing React 19/Vite 8 app uses one App component with React state and a browser-local Repository adapter. Domain functions in src/domain/game.ts own the six fixed category keys, derived scoring, non-stacking physical encounters, caps, transitions and privacy projection. Store version 1 persists structured state. There is no auth, API, backend, synchronization or moderation connection. Temporary media uses object URLs.

Reuse the app shell, themes, media lifecycle, entry ownership checks, snapshot semantics, and tests. Introduce an independent Rulebook feature module with templates, validated category definitions, scoring and amendment voting before modifying the persisted store. Preserve previous-night snapshots and local records when integrating after model approval. Supabase selection and data model restructuring require confirmation under the supplied build brief. No configured Supabase project or credentials were found.

Order: A pure Rulebook/domain + tests; A document-style editor and local adapter integration after model approval; B Supabase auth/RLS/invites/chat only after backend confirmation and project access; C rituals; D memory layer. Backend acceptance requires separate-account tests and cannot be established with mocked local chat.

Specification conflict: the thesis mentions “private-but-counted,” but section 2.6 explicitly prohibits private entries affecting totals, awards or shared stats. Preserve the explicit scoring guarantee: private entries never score in the visible game. Sealed posts must also avoid leaking private entries through counts or pulse events.
