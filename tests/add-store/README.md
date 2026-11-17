# Add-store regression checks

These checks run the real SPA and API routes with in-memory persistence. No production environment file, database, Google/Photon call, or deployment is needed. The browser blocks all external requests; Photon and Places are controlled fixtures. `server.ts` binds only to loopback and replaces storage before accepting requests. Every created record is `TEST-memory-only` and disappears on reset/exit.

From the repository root, install the locked dependencies with `npm ci`, then use separate terminals:

```sh
npm run dev:client -- --host 127.0.0.1
npx tsx tests/add-store/server.ts
node tests/add-store/matrix.mjs
npx tsx tests/add-store/storage-check.ts
```

Chromium must be available at `/usr/bin/chromium`. Browser checks use a 390×844 touch/mobile viewport. Keep ports 3000 and 5173 local. Run one matrix at a time. Start a fresh stub server for reruns, or set a different `TEST_RUN` integer to isolate the route's in-memory rate-limit buckets. To run selected cases: `SCENARIOS=insert-500,no-products TEST_RUN=2 node tests/add-store/matrix.mjs`.

`matrix.mjs` includes all 18 investigation scenarios plus validation boundaries, body-only hangs, fallback duplicates, controlled autocomplete, honeypot, persistence failure and preparation exceptions. Each attempt must finish with thanks or an in-modal `role=alert`; errors must be unobscured in the viewport and preserve every input. It checks the actual POST, API validation and duplicate handling, memory record, and success panel. Browser network/HTTP fault cases deliberately replace the response. Body stalls replace a fetched response with a never-ending stream to verify the deadline remains active after headers. Places fixtures invoke the real form's `place_changed` listener; they do not verify Google's live service.

`storage-check.ts` exercises real storage insert and REST-fallback code with stubbed query/fetch boundaries, plus five duplicate matching cases. The geocoding status must survive both persistence paths. The SQL migration is deliberately **not executed** by these tests.

Results and screenshots are written under `work/add-store/`. The reviewed run is in `verification-results.json`. Existing project checks are documented with results in the draft PR.
