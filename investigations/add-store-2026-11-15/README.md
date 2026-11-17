# Reproduction harness (no production services)

Read REPORT.md for findings, limitations and source references. `results.json` captures 18 browser scenarios. Normal and validation cases exercise the actual localhost API handler against stubbed storage; injected insert HTTP/network/hang cases deliberately replace it. Screenshots show hidden errors and visible hanging spinner. No live secrets required.

From repository root, with Node dependencies installed and `/usr/bin/chromium` available:

```sh
mkdir -p work
cp investigations/add-store-2026-11-15/reproduce.mjs investigations/add-store-2026-11-15/server.ts investigations/add-store-2026-11-15/schema-check.ts investigations/add-store-2026-11-15/duplicate-check.ts work/
npm run dev:client -- --host 127.0.0.1
# Separate terminal:
npx tsx work/server.ts
# Separate terminal:
node work/reproduce.mjs
npx tsx work/schema-check.ts
npx tsx work/duplicate-check.ts
```

Use fresh processes for reruns (in-memory API rate limits persist per server process). Harness uses synthetic forwarded IPs on loopback to isolate rate limits between scenarios. Keep ports 3000/5173 for this harness only. Server sets dummy loopback DB configuration and replaces storage methods before serving requests. It must never be pointed at production. The browser blocks every non-local request except controlled Photon interception. Tests open the existing modal via its real custom event, then fill and click real form controls. `rapid-double` sends a second `requestSubmit()` event; it does not assert that two physical taps bypass a disabled button. Hanging routes are observed for three seconds; code inspection establishes absence of a deadline.

`schema-check.ts` runs the real shared insert schema. `duplicate-check.ts` runs the real duplicate helper with sentinel coordinates. `rls-readonly.sql` is an unexecuted read-only inspection query set for an authorized operator; see report for the live verification gap.
