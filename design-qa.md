# Hero restoration QA

Date: 2026-10-06. Scope: restore the supplied spreadsheet hero while preserving the current compact navigation and analytics screens.

## Comparison evidence

- Source: user-supplied `codex-clipboard-888dffb5-337f-4500-ac4a-fce79c9851f5.png`, 1672 × 941. Local reference copy: `output/hero-reference.png` (gitignored).
- Implementation: production Next.js build in the Codex in-app browser; target viewport 1672 × 887, device pixel ratio 1. Browser captures are 1657 × 879.
- Full-view comparison: `output/hero-comparison.png`. Source browser chrome (54 px) and old sidebar (240 px) were excluded; implementation sidebar (224 px) was excluded. The implementation content was normalized to the source content dimensions for comparison.
- Focused typography comparison: `output/hero-focus.png`, rendered source and implementation headings side by side. Both comparison images were reviewed together after the final changes.
- Published, uncropped product captures: [EN](docs/screenshots/onboarding.png), [RU](docs/screenshots/onboarding-ru.png), [dark](docs/screenshots/dark.png), [overview](docs/screenshots/dashboard.png), [trends](docs/screenshots/trends.png).

## Findings and repairs

Initial comparison found a wider serif heading and insufficient left inset. Using Times New Roman with the reference's two-line treatment and a desktop inset corrected these. Russian typography was reduced to retain two lines. A mobile preview-card collision was corrected by narrowing the quality card; segment labels were increased for readability.

The final full-view and focused comparisons retain the reference's composition: mint eyebrow, large dark/green serif heading, floating analytics cards, spreadsheet illustration, dashed upload panel, green primary action and four feature cards. Generated decorative assets reproduce the visual direction rather than the exact source raster. The backdrop is subtler, the button uses a flat fill, and feature cards omit arrows because they are informational. These are minor visual differences (P3).

The current sidebar, language controls, illustrative-preview caption and working demo entry remain intentionally present. Sidebar component source is unchanged; a PostCSS comparison against the preceding commit confirmed that sidebar, navigation, dataset-status and theme-control declarations are unchanged.

No unresolved P0, P1 or P2 findings remain in the requested scope.

## Behavior and responsive checks

- Production EN/RU and light/dark hero checked visually; production console error list empty.
- 390 × 844 EN/RU: document scroll width 375 px within the 390 px viewport; sidebar scroll height equals client height (844 px). Hero, preview and upload panel stack without horizontal overflow. Local mobile evidence: `output/hero-mobile.png`.
- New upload button exercised with the supplied marketing CSV: 1,101 records and 17 fields analyzed successfully.
- Demo button exercised: 728 records and ten fields. Overview and Trends navigation checked and captured from the production build.
- File input, drag/drop handlers and busy/disabled behavior retained. Decorative images have empty alt text; chart preview has an accessible description; upload action remains a native button and file input.
- Lint, type checking, localization check and production build passed after the final code changes. No dependency or lockfile changes.

final result: passed
