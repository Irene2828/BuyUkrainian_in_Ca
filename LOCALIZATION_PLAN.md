# Localization Plan

## Objective

Ship polished, natural-language support for the full public experience and admin workflow in:

- English
- Ukrainian
- French

The goal is not word-for-word translation. The goal is product-quality localization that feels native, modern, and consistent across every page, form, modal, overlay, tooltip, empty state, toast, and admin touchpoint.

## Current State

The app already has an i18n foundation in [client/src/lib/i18n.tsx](/Volumes/Transcend/DevSandbox/BuyUkrainian.ca/client/src/lib/i18n.tsx:1) with English and Ukrainian locale files:

- [client/src/locales/en.json](/Volumes/Transcend/DevSandbox/BuyUkrainian.ca/client/src/locales/en.json:1)
- [client/src/locales/uk.json](/Volumes/Transcend/DevSandbox/BuyUkrainian.ca/client/src/locales/uk.json:1)

But the translation coverage is still partial. Key UI surfaces still contain hardcoded product copy outside the locale files, especially in:

- [client/src/components/map-explorer.tsx](/Volumes/Transcend/DevSandbox/BuyUkrainian.ca/client/src/components/map-explorer.tsx:1)
- [client/src/components/interactive-map.tsx](/Volumes/Transcend/DevSandbox/BuyUkrainian.ca/client/src/components/interactive-map.tsx:1)
- [client/src/components/home-add-form.tsx](/Volumes/Transcend/DevSandbox/BuyUkrainian.ca/client/src/components/home-add-form.tsx:1)
- [client/src/components/store-card.tsx](/Volumes/Transcend/DevSandbox/BuyUkrainian.ca/client/src/components/store-card.tsx:1)
- [client/src/components/map-section.tsx](/Volumes/Transcend/DevSandbox/BuyUkrainian.ca/client/src/components/map-section.tsx:1)
- [client/src/pages/map.tsx](/Volumes/Transcend/DevSandbox/BuyUkrainian.ca/client/src/pages/map.tsx:1)
- [client/src/pages/about.tsx](/Volumes/Transcend/DevSandbox/BuyUkrainian.ca/client/src/pages/about.tsx:1)
- [client/src/components/AdminDashboard.tsx](/Volumes/Transcend/DevSandbox/BuyUkrainian.ca/client/src/components/AdminDashboard.tsx:1)
- [client/src/pages/admin/login.tsx](/Volumes/Transcend/DevSandbox/BuyUkrainian.ca/client/src/pages/admin/login.tsx:1)

## Recommended Rollout

### Phase 1: Foundation Cleanup

1. Standardize locale codes to `en`, `uk`, and `fr-CA` or `fr`.
2. Retire the legacy `ua` alias in component logic and keep a compatibility shim only during migration.
3. Split locale content by feature instead of one large JSON per language:
   - `common`
   - `header`
   - `hero`
   - `map`
   - `forms`
   - `modals`
   - `faq`
   - `about`
   - `admin`
   - `errors`
   - `share`
4. Add one source-of-truth language registry with:
   - label
   - locale code
   - enabled state
   - text direction
   - QA status

### Phase 2: Hardcoded Copy Extraction

Move all remaining user-facing strings into locale resources, including:

- map toolbar labels and dropdowns
- map loading, blocked, and error overlays
- list view labels
- latest additions section controls
- add-store form labels, hints, validation, and success states
- share dialogs and clipboard confirmations
- FAQs and supporting marketing sections
- about page content
- 404 and fallback states
- admin login and admin dashboard labels, actions, empty states, and confirmations

This phase should also include non-obvious copy:

- ARIA labels
- button titles
- tooltip text
- placeholder text
- toast titles and descriptions
- confirmation dialog copy
- helper pills and onboarding microcopy

### Phase 3: Ukrainian Product-Language Pass

Rewrite Ukrainian copy to sound natural and current, not literal. Standards:

- modern product voice
- concise, human UI language
- clear verbs for actions
- consistent terminology for store, map, listing, location, category, and submission
- no mixed English unless it is a deliberate brand or product term

Review should be done by a native Ukrainian editor with product-writing experience.

### Phase 4: French Product-Language Pass

Use Canadian French, not generic international French, for the public site. Standards:

- natural wording for Canadian users
- clear, polished UI terminology
- consistent vocabulary across public and admin experiences
- no machine-translated phrasing left unedited

Priority pass should cover:

- homepage
- map page
- add-store flow
- FAQ
- about page
- share and modal flows

Then extend to admin and edge-case states.

### Phase 5: Functional Localization QA

Verify each locale across:

- desktop and mobile
- all routes
- all modals and dialogs
- map error and loading states
- form validation and success messages
- admin flows
- long-text overflow
- button widths
- line breaks in headlines
- copy/paste and share text generation

Also validate:

- `document.documentElement.lang`
- locale persistence in local storage
- analytics events with locale context
- sitemap, metadata, and social text behavior

## Implementation Notes

1. Keep English as the source language during migration.
2. Add a French locale file only when reviewed copy is ready.
3. Treat Ukrainian and French as full product locales, not cosmetic overlays.
4. Localize structured content too:
   - category labels
   - province labels where appropriate
   - CTA text
   - admin status labels
5. Add regression checks for missing translation keys in CI.

## Suggested Delivery Sequence

1. Extract every remaining hardcoded string into locale namespaces.
2. Clean the locale model and language switcher API.
3. Finish and review Ukrainian copy.
4. Add reviewed French copy.
5. Run UI QA on every route and modal.
6. Release French only after the full public flow reads naturally end to end.

## Definition of Done

Localization is complete only when a user can switch languages and get a coherent experience across:

- homepage
- map
- list view
- add-store form
- store cards
- modals
- overlays
- toasts
- FAQ
- about page
- 404 page
- admin login
- admin dashboard

without falling back to English fragments or awkward literal translations.
