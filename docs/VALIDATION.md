# Validation

Checked locally on **2026-10-05**, Windows, Python 3.13.7, Node.js 24.13.0, Next.js 16.3.8. CI targets Python 3.12 and Node.js 22; those alternate versions have not been executed locally.

## Backend

`python -m unittest discover -s tests -v` from `backend/`: **19 tests passed**.

Covered semantic roles, numeric normalization and quantiles, documented quality-score arithmetic, flat-series spike detection, segment ranking and share denominators, equal-period comparison, filtered statistics and validation of date/numeric bounds.

Dataset cases: marketing with time series, sales/categories, no date, mostly missing values, numeric-only, text/high-cardinality, one column, empty, all null and NaN/Inf. API cases: CSV upload → filter → rows/sort → manual chart → all three exports → deletion; multi-sheet XLSX; invalid extension, broken files, size rejection, expiry, formula-safe CSV and large UTF-8 semicolon-delimited CSV.

## Frontend

- `npm run lint`: passed, no warnings.
- `npm run typecheck`: passed.
- `npm run test:locale`: passed (dictionary, evidence, original values and EN/RU).
- `npm run build`: passed (Next.js production build, including TypeScript).
- `npm start`: local production server works with the FastAPI backend.

Initial end-to-end validation before the visual redesign used Playwright CLI in Chrome. No JavaScript page errors. The smoke check exercised:

1. Demo upload and detected row count.
2. Global channel filter (728 → 182 records).
3. Manual mean-revenue bar chart and recomputation when the global filter changed from Organic to Email.
4. Clearing filters, pagination and full-table search.
5. JSON download.
6. Light/dark toggle.
7. Seven CSV fixtures: marketing, sales, no date, missing, numeric, text and empty.
8. XLSX worksheet selection.
9. A 390 px viewport, with no document-width overflow.

Reproduce with both servers running, from the repository root:

```sh
python scripts/generate_test_data.py
npx --yes --package @playwright/cli playwright-cli open http://localhost:3000 --browser chrome
npx --yes --package @playwright/cli playwright-cli run-code --filename=scripts/browser_smoke.js
```

On Windows, use `npx.cmd`. Requires Chrome and npm registry access on first execution. Outputs go to gitignored `output/playwright/`; the screenshot copies under `docs/screenshots/` are deliberately included for the portfolio. Browser smoke checks are opt-in and not a CI browser dependency.

## Workspace redesign and EN/RU

The redesigned production build was checked in the Codex in-app browser after rebuilding and restarting Next.js. Lint, TypeScript, localization check and build all passed without warnings. Browser console error list was empty.

- Product-first empty state in English and Russian, light and dark themes; demo previews explicitly labeled.
- RU demo analysis: 728 records, ten fields, localized summaries, evidence-based findings and chart headings; source field names/category values unchanged.
- Filter `channel = Organic`: 182 records after switching RU → EN, filter retained.
- Manual `mean` revenue by campaign chart created in RU, retained with its English title after switching languages.
- Raw-data search `Campaign 1` within Organic: 37 records, page 2 of 2 retained after switching to RU.
- File chooser → synthetic `sales.csv`: 60 records, two fields. XLSX chooser → Sales worksheet: same 60 records. These exercised the rebuilt upload component.
- Sidebar logo and engine explanation removed. At desktop 1440 × 600 and 1440 × 480, sidebar `scrollHeight` equals `clientHeight`: no sidebar scrolling.
- At 390 × 844, both the empty workspace and demo dashboard fit the document width (375 px content plus native scrollbar). Mobile KPI layout uses one column to accommodate localized numeric strings.
- Updated actual screenshots: onboarding EN/RU, dashboard, trends and dark appearance under `docs/screenshots/`.

Language/theme are session UI state and reset on page reload. JSON evidence and backend-generated exports retain their canonical field names and English narrative; this is documented in [CODE_GUIDE.md](CODE_GUIDE.md).

## Large CSV checks

The additional [user-provided marketing fixture](../datasets/README.md) was checked through Next.js `/api` rewrites → FastAPI: 132,560 bytes, 1,101 rows, 17 fields, eight charts and ten insights. The returned duplicate count was 18. The temporary test session was deleted after verification; the CSV is included byte-for-byte under `datasets/`.

Files were sent through **Next.js `/api` rewrites → FastAPI**, not only analyzed as in-process DataFrames. Seed-free deterministic fixtures have six fields: an ID, a date, a low-cardinality category, two numeric metrics and a long text field. Requests are serial; server processes were already warm. Times include HTTP transport and processing. Reported memory is pandas' normalized-frame estimate, **not peak process RSS**.

| Input | Records | Upload + CSV parsing | Analysis | Normalized frame | Result |
| --- | ---: | ---: | ---: | ---: | --- |
| 50 MiB | 47,390 | 1.25 s | 6.39 s | 56.39 MiB | 8 charts, sampled correlations |
| 95 MiB | 90,032 | 2.67 s | 12.07 s | 107.14 MiB | 8 charts, sampled correlations |

Both checked the returned row count and removed the benchmark session afterward. These results establish that moderately tall, text-heavy files near the requested upload range can complete locally. They do not establish performance for one million rows, 200 columns, expanded Excel files or concurrent users.

```sh
python scripts/benchmark_upload.py --mb 50
python scripts/benchmark_upload.py --mb 95
```

Generated CSVs and machine-readable results stay under gitignored `output/benchmark/`.

## Docker and CI scope

`docker-compose.yml` parses successfully and references the included Dockerfiles. Backend has a health check and one worker; frontend uses a standalone build and an internal backend rewrite address. **Docker is not installed on this host, so container builds and `docker compose up --build` were not executed.** Hosted test/build results are available separately in the repository's [Checks workflow](https://github.com/Dark0ne1/autoinsight-dashboard/actions/workflows/ci.yml); it does not build Docker images.

No application was deployed publicly during local validation. Publishing the source repository does not deploy the web application.
