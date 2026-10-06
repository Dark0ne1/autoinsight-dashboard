# AutoInsight Dashboard

[Русский](#ru) · [English](#en) · [Проверки / Checks](https://github.com/Dark0ne1/autoinsight-dashboard/actions/workflows/ci.yml?query=branch%3Amain)

<a id="ru"></a>

## Русский

**Загрузите CSV или Excel и получите интерактивный аналитический дашборд без заранее заданной структуры таблицы.**

AutoInsight определяет роли колонок по значениям, проверяет качество данных, подбирает графики и формирует статистические наблюдения с числовыми доказательствами. Для анализа не нужны фиксированные названия метрик, LLM или API-ключи.

Это учебный open-source проект для портфолио маркетолога и аналитика. Репозиторий служит витриной: здесь есть исходники, реальные скриншоты, документация и тестовый датасет. Публичного приложения нет. GitHub Actions запускает только проверки и сборку; попробовать интерфейс можно локально.

[Возможности](#ru-features) · [Скриншоты](#screenshots) · [Документация](#ru-docs) · [Архитектура](#ru-architecture) · [Локальный запуск](#ru-start) · [Датасеты](#ru-datasets) · [Ограничения](#ru-limits) · [Лицензия](#ru-license)

<a id="ru-features"></a>

### Возможности

- Импорт CSV в UTF-8 / Windows-1251 с разделителями запятая, точка с запятой, табуляция или `|`; загрузка XLSX с выбором листа.
- Определение числовых колонок, дат, категорий, идентификаторов, процентов, денежных значений, логических флагов и текста. Отдельные признаки для постоянных и преимущественно пустых колонок.
- Профилирование данных: распределения, квантили, частоты категорий, пропуски и дубликаты.
- Оценка качества от 0 до 100 с объяснением штрафов и замечаниями по колонкам.
- До восьми рекомендованных графиков: динамика, сегменты, распределения и взаимосвязи.
- Календарная агрегация, скользящее среднее, поиск кандидатов в аномалии и сравнение равных периодов.
- Сравнение категорий, доли и межгрупповая вариация; корреляции Pearson и Spearman.
- До десяти статистических наблюдений с доказательствами и оценкой важности.
- Общие фильтры по категориям, числам и датам для KPI, графиков, таблицы, наблюдений и экспорта.
- Ручное построение графиков с выбором агрегации; поиск, сортировка и постраничный просмотр исходных данных.
- Русский и английский интерфейс, светлая и тёмная темы, адаптивная компоновка. Исходные названия колонок и значения категорий сохраняются.
- Стартовый hero с крупным заголовком, мятными иллюстрациями, примером графиков и широкой областью загрузки. Компактное боковое меню и аналитические разделы сохраняют графитовую и кобальтовую палитру.
- Экспорт наблюдений в JSON и Markdown, а также очищенного CSV с нормализацией типов, удалением точных дубликатов и защитой от формул электронных таблиц.
- Встроенный синтетический маркетинговый пример и отдельный тестовый CSV в репозитории.

Скриншоты работающего приложения обновлены 6 октября 2026 года: [загрузка](#screenshots), [обзор](docs/screenshots/dashboard.png), [динамика](docs/screenshots/trends.png), [тёмная тема](docs/screenshots/dark.png), [русский интерфейс](docs/screenshots/onboarding-ru.png). Значения +32% и 98% в hero иллюстративные; скриншоты анализа используют встроенный маркетинговый датасет.

<a id="ru-docs"></a>

### Документация

- [Документация по коду](docs/CODE_GUIDE.md): модули, аналитический pipeline, API-контракты, локализация и расширение проекта.
- [Инструкция по запуску и развёртыванию](docs/DEPLOYMENT.md): Windows/Linux, Docker Compose, настройки и диагностика. Это инструкция для самостоятельного использования, а не размещённый сервис.
- [Описание для GitHub и портфолио](docs/GITHUB_DESCRIPTION.md): краткое описание, темы и текст о проекте.
- [Результаты проверки](docs/VALIDATION.md): тесты, сценарии интерфейса, измерения и ограничения.
- [Описание тестового датасета](datasets/README.md): структура, происхождение и результаты анализа.

<a id="ru-architecture"></a>

### Архитектура и методы

**Python / FastAPI → pandas / NumPy / SciPy → Next.js / React / TypeScript / Recharts.** Импорт и нормализация выполняются на backend; затем единая отфильтрованная таблица используется для профилей, качества, графиков, наблюдений и экспорта. Frontend обращается к FastAPI через перенаправление `/api` в Next.js.

Основные каталоги: `backend/app/analytics` — статистические методы; `backend/app/services` — импорт, сессии и orchestration; `backend/tests` — проверки аналитики и API; `frontend/components` — интерфейс; `frontend/lib` — контракты, API-клиент и локализация.

Наблюдения рассчитываются детерминированно. `LocalNarrativeProvider` формирует текст из готовых доказательств. Внешний ИИ не используется; корреляция не выдаётся за причинность. Типы колонок определяются эвристически, поэтому выбор метрик и агрегаций нужно соотносить с бизнес-смыслом данных.

Даты требуют не менее 80% успешного распознавания, числовые строки — 85%. Проценты преобразуются в доли и по умолчанию усредняются. Автоматические сегменты строятся для категорий с числом значений до 50. Корреляции требуют не менее десяти парных наблюдений и непостоянных колонок; ранжирование основано на абсолютной корреляции Spearman.

Оценка качества учитывает пропуски, дубликаты, постоянные колонки, ошибки преобразования и числовые выбросы. Она описывает состояние таблицы, а не достоверность фактов или репрезентативность выборки. Подробные методы: [документация по коду](docs/CODE_GUIDE.md) и [статистические правила](#statistical-choices).

<a id="ru-start"></a>

### Локальный запуск

```sh
git clone https://github.com/Dark0ne1/autoinsight-dashboard.git
cd autoinsight-dashboard
```

С Docker:

```sh
docker compose up --build
```

Откройте [localhost:3000](http://localhost:3000). Документация API: [localhost:8000/docs](http://localhost:8000/docs). Порты Compose привязаны к localhost. Docker на машине автора не проверялся; результаты локальных и автоматических проверок приведены в [VALIDATION](docs/VALIDATION.md).

Без Docker нужны Python 3.12+ и Node.js 22+. Из корня репозитория:

```sh
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r backend/requirements.txt
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

В другом терминале, из корня репозитория:

```sh
cd frontend
npm ci
npm run dev
```

В PowerShell используйте `npm.cmd`, если выполнение npm-скрипта заблокировано. Файл `.env` необязателен; пример настроек — [.env.example](.env.example). Адрес backend по умолчанию — `http://127.0.0.1:8000`. Для изменения адреса задайте `API_INTERNAL_URL` до запуска или сборки frontend.

Проверки:

```sh
cd backend
python -m unittest discover -s tests -v
cd ../frontend
npm run lint
npm run typecheck
npm run test:locale
npm run build
```

Эти же проверки выполняются в [GitHub Actions](https://github.com/Dark0ne1/autoinsight-dashboard/actions/workflows/ci.yml?query=branch%3Amain). Workflow не публикует сайт.

<a id="ru-datasets"></a>

### Датасеты и пример анализа

Кнопка **«Открыть демоданные»** загружает встроенный синтетический пример: 728 строк, десять колонок, январь–июнь 2026 года. В нём есть восемь повторяющихся записей, пропуски региона и искусственный всплеск выручки. Можно отфильтровать `channel = Organic`, сравнить сегменты, построить среднюю выручку по регионам и экспортировать отчёт. Генератор: `python scripts/generate_demo.py`.

Отдельный [autoinsight_demo_marketing_dataset.csv](datasets/autoinsight_demo_marketing_dataset.csv) добавлен без изменений: **1 101 строка, 17 полей, январь–сентябрь 2026 года**. Скачайте файл и загрузите его в интерфейсе. Он содержит маркетинговые измерения, шесть числовых метрик, промофлаг, идентификаторы креативов, заметки, пропуски и дубликаты. [Описание и проверенный результат анализа](datasets/README.md).

API поддерживает загрузку, анализ, ручные графики, просмотр строк, экспорт и удаление сессии. [Таблица endpoint-ов](#api); после локального запуска полные схемы доступны в Swagger на `/docs`.

<a id="ru-limits"></a>

### Приватность и ограничения

- Локальный MVP без авторизации, постоянных проектов и совместного доступа. Данные живут в памяти одного процесса не более часа, исчезают при перезапуске и удаляются при сбросе активной сессии. Файлы не отправляются в LLM.
- До восьми сессий и 512 MiB сохранённых данных; лимит загрузки — 100 MiB, до 1 000 000 строк и 200 колонок. Распаковка XLSX ограничена 300 MiB. Эти лимиты не гарантируют, что любая таблица такого размера поместится в оперативной памяти.
- Корреляции используют до 20 000 детерминированно выбранных строк и 12 метрик; scatter показывает до 1 000 точек. Число графиков и наблюдений ограничено, результаты не дополняются ради количества.
- Определение типов использует первые 2 000 непустых значений и эвристики. Смешанные форматы дат, разделители тысяч, разные валюты, накопительные показатели и взвешенные проценты требуют подготовки данных и предметных решений.
- Аномалии — кандидаты для проверки, а не доказательства причин событий. Неполные периоды, разрывы и сезонность могут влиять на сравнения.
- XLSX использует сохранённые результаты формул и не вычисляет их. Не поддерживаются `.xls`, защищённые книги, макросы и PDF-экспорт.
- Очищенный CSV не восстанавливает пропуски и не исправляет бизнес-данные; удаление дубликатов может затронуть допустимые повторяющиеся события. Сохраняйте оригинал.

Измерения на синтетических CSV размером 50 и 95 MiB и полные ограничения приведены в [VALIDATION](docs/VALIDATION.md) и [английском разделе](#limitations). Возможные направления развития: ручной выбор типов, потоковый импорт, сезонные сравнения и сохранение рабочих пространств при появлении реального сценария использования.

<a id="ru-license"></a>

### Лицензия

[MIT](LICENSE). Для предложений и исправлений полезны воспроизводимый датасет и проверка, демонстрирующая проблему.

[Наверх / выбор языка](#autoinsight-dashboard) · [English ↓](#en)

---

<a id="en"></a>

## English

[Русский ↑](#ru) · [Features](#features) · [Screenshots](#screenshots) · [Documentation](#documentation) · [Architecture](#architecture) · [Local development](#local-development) · [Test dataset](#additional-test-dataset) · [Limitations](#limitations) · [License](#license)

**Upload any CSV or Excel file and automatically turn it into an interactive analytical dashboard.**

Business exports rarely arrive with the same schema. AutoInsight profiles their values, infers column roles, ranks useful charts and generates evidence-backed statistical findings—without predefined metric names or an AI API key.

Built as an open-source portfolio project for marketing analytics and technical marketing: Python statistics, data quality, API design, automated analysis and a working Next.js interface in one inspectable pipeline.

This repository is a portfolio showcase with screenshots, source code and a test dataset. There is no hosted application; GitHub Actions only runs tests and builds. Run it locally to try the dashboard.

### Features

- CSV upload (UTF-8 / Windows-1251; comma, semicolon, tab or pipe) and XLSX worksheet selection.
- Value-based schema inference: numeric, datetime, boolean, identifier, percentage, currency-like, categorical, high-cardinality category and text. Separate constant and mostly-null flags.
- Data overview, numeric quantiles, category frequencies, long tail, missingness and duplicate detection.
- Documented 0–100 quality score with per-column observations and penalty breakdown.
- Ranked recommendations: at most eight time-series, segment, distribution and relationship charts.
- Adaptive calendar aggregation, rolling average, conservative anomaly markers and equal-period comparison.
- Category–metric aggregates and between-group variance; Pearson and Spearman correlations.
- Up to ten deterministic insights with structured evidence and importance scores.
- Global categorical, numeric and date filters; manual charts with aggregation and scatter grouping.
- Searchable, sortable, paginated data explorer; light/dark mode and responsive layout.
- English / Russian interface switch, including analytical findings; original field names and category values remain intact.
- Spreadsheet-to-insights hero with serif typography, mint illustrations, an explicitly labeled illustrative dashboard, a wide file drop zone and feature cards. The compact navigation and analytical workspace keep their graphite / cobalt palette; Manrope / IBM Plex Mono fonts are bundled locally.
- JSON insights, Markdown analysis and normalized, deduplicated, formula-safe CSV export.
- Seeded marketing demo with intentional quality issues and a spike.

### Screenshots

![Upload onboarding](docs/screenshots/onboarding.png)

![Demo dashboard](docs/screenshots/dashboard.png)

![Time-series analysis](docs/screenshots/trends.png)

![Dark appearance](docs/screenshots/dark.png)

![Russian interface](docs/screenshots/onboarding-ru.png)

Screenshots were refreshed on 2026-10-06 and show the running application. The hero’s +32% / 98% figures are illustrative, while the analysis screenshots use the built-in marketing dataset. See [validation results](docs/VALIDATION.md) for the tested scenarios and reproducible commands.

### Documentation

- [Code guide / документация по коду](docs/CODE_GUIDE.md): pipeline, modules, contracts, localization and extension points.
- [Deployment / развёртывание](docs/DEPLOYMENT.md): Windows/Linux, native production, Docker Compose, VPS and troubleshooting.
- [GitHub description / описание проекта](docs/GITHUB_DESCRIPTION.md): About, topics and portfolio copy.
- [Validation](docs/VALIDATION.md): completed checks, browser scenarios and measured limitations.

### Architecture

```mermaid
flowchart LR
    U[CSV / XLSX] --> API[FastAPI ingestion]
    API --> S[Bounded in-memory sessions]
    S --> P[Schema inference + profiling]
    P --> F[Global filters]
    F --> Q[Data quality]
    F --> A[Trends / segments / correlations]
    A --> C[Ranked chart recommendations]
    Q --> I[Deterministic Insight Engine]
    A --> I
    I --> N[LocalNarrativeProvider]
    N --> UI[Next.js + Recharts]
    C --> UI
    UI --> E[JSON / Markdown / cleaned CSV]
```

```text
backend/
  app/
    analytics/     # inference, profiles, quality, anomalies, charts, insights
    services/      # ingestion, sessions, orchestration, narrative provider
    api.py         # upload, analyze, rows, charts, exports
    models.py      # validated request schemas
    main.py        # app, request byte limits, error handling
  tests/           # statistical checks and complete API workflows
  demo/marketing.csv
frontend/
  app/             # Next.js app and design tokens
  components/      # upload, filters, charts, explore, raw data
  lib/             # typed response contracts and API client
scripts/generate_demo.py
```

One FastAPI process keeps datasets in memory for one hour, with at most eight sessions and a combined 512 MiB retained-data budget. There is no database, queue, persistent upload directory or external analytics service. The frontend forwards `/api` to FastAPI through Next.js rewrites. `NarrativeProvider` is a narrow extension point; `LocalNarrativeProvider` is the only implementation. Future LLM providers should consume findings, never invent evidence.

### How it works

1. Validate extension, byte size and workbook expansion before reading a table.
2. Inspect values, missingness, cardinality and formats. Names provide supporting identifier hints only; metric names are not hard-coded.
3. Normalize inferred numeric values and dates. Keep identifier strings, including leading zeros from CSV.
4. Apply dashboard filters to the same normalized frame used by charts, insights, KPIs, the table and exports.
5. Compute quality, distributions, group aggregates and paired correlations. Rank useful candidates instead of plotting every combination.
6. Generate structured findings with `type`, `importance`, `title`, `description` and `evidence`. Render a local summary and interactive chart configs.

#### Statistical choices

- Dates: recognize calendar-like strings, require at least 80% parse success, normalize to UTC. Date-only upper bounds include the full day. Ambiguous dates follow pandas parsing conventions; ISO dates are preferable.
- Numeric strings: require 85% conversion success. Currency symbols and percent signs are removed; percentages become fractions and default to **mean**, not sum. A comma without a dot is treated as a decimal separator. Failed conversions become missing values.
- IDs: explicit ID/code name hints, UUID values and unique consecutive integer sequences are excluded from metrics. This is a heuristic; unique measurements can resemble keys. High-cardinality text does not automatically become an ID.
- Category roles: at most 50 distinct values for automatic segment charts. Wider dimensions remain available in manual exploration and profiles.
- Time: daily buckets up to 90 days, weekly up to 730 days, monthly beyond that. Empty sum buckets are missing, not invented zeros. Compare up to 12 consecutive completed buckets against an equally sized preceding period; exclude the newest, possibly partial bucket and suppress comparisons containing gaps. Completeness is approximate because collection schedules are unknown.
- Anomalies: a point must cross both a preceding seven-bucket rolling baseline (absolute z-score > 3, or departure from a flat baseline) and global 3 × IQR fences. At least eight buckets are needed for fences. These are review candidates, not proof of fraud or a causal explanation.
- Segments: count, sum, mean, median and share of the entire filtered metric total (including records without a category). Rank by eta squared (between-group variance / paired-observation variance), an effect size rather than a p-value. Shares are shown only for a positive, non-negative total.
- Relationships: Pearson and Spearman with at least ten paired values and non-constant columns, ranked by absolute Spearman effect size. No multiple-testing significance claim. **Correlation does not imply causation.**
- KPI aggregation is a generic default, not business semantics. Spend, rates, balances and prices may need different aggregations; choose one in Explore mode. Currency-like values do not establish a common currency.

#### Data Quality Score

```text
score = max(0, 100 − 40M − 25D − 10C − 15T − 10O)
M = normalized missing cells / all cells
D = duplicate normalized rows / all rows
C = constant non-null columns / all columns
T = newly missing cells caused by failed conversion / all cells
O = extreme numeric outlier cells / non-null numeric cells
```

Round to one decimal. Empty datasets score zero. Failed conversions affect both missingness and the conversion penalty intentionally. Inferred dates are informational and do not lower the score. Original missingness is retained per field, while normalized missingness drives the score. The score describes tabular hygiene, not factual accuracy, representativeness or business correctness.

### Tech stack

Next.js App Router, TypeScript, React, Tailwind CSS and Recharts; Python 3.12+, FastAPI, pandas, NumPy, SciPy and openpyxl. Tests use the Python standard library plus FastAPI's HTTP test client. No ML model, mandatory LLM or new infrastructure service.

### Local development

```sh
git clone https://github.com/Dark0ne1/autoinsight-dashboard.git
cd autoinsight-dashboard
```

#### Docker

```sh
docker compose up --build
```

Open [localhost:3000](http://localhost:3000). API documentation: [localhost:8000/docs](http://localhost:8000/docs). Ports bind to localhost. A `.env` file is optional; copy `.env.example` if you want to change the upload limit or allowed origins. The browser upload ceiling is 100 MiB. A backend limit below this is respected by the API.

#### Without Docker

Use Python 3.12+ and Node.js 22+. From the repository root:

```sh
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r backend/requirements.txt
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

In another terminal:

```sh
cd frontend
npm ci
npm run dev
```

On Windows use `npm.cmd` if PowerShell blocks the npm script shim. The default rewrite destination is `http://127.0.0.1:8000`. Set `API_INTERNAL_URL` before starting/building Next.js when changing the API address; rewrites are embedded in production builds. To access FastAPI directly from the browser instead, set `NEXT_PUBLIC_API_URL` before the frontend build and add the frontend origin to `CORS_ORIGINS`.

#### Checks and production build

```sh
cd backend
python -m unittest discover -s tests -v
cd ../frontend
npm run lint
npm run typecheck
npm run test:locale
npm run build
npm start
```

GitHub Actions runs backend tests, frontend lint, type checking, localization checks and the production build. The analytics tests exercise marketing/time-series, sales/categories, no-date, mostly-null, numeric-only, text/high-cardinality, single-column, empty and non-finite datasets. API checks cover CSV → filters → chart/table → exports and multi-sheet XLSX.

### Example analysis

Click **Use demo dataset**. The seed-42 sample has 728 rows, ten columns, six numeric metrics, three categorical dimensions and one date dimension covering January–June 2026. It contains eight repeated records, missing region values and an injected revenue spike.

Try filtering `channel` to `Organic`, viewing segment evidence, creating a mean-revenue bar by region, and exporting Markdown. Regenerate the synthetic file with `python scripts/generate_demo.py`. None of these column names appear in the schema-agnostic engine.

#### Additional test dataset

[autoinsight_demo_marketing_dataset.csv](datasets/autoinsight_demo_marketing_dataset.csv) is included unchanged as an additional upload fixture: 1,101 rows, 17 fields, January–September 2026. Download it and choose it in the upload screen. It exercises marketing dimensions, six numeric metrics, a Boolean promo flag, creative identifiers, notes, missing values and duplicate records. See [dataset notes and verified analysis](datasets/README.md).

### API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/upload` | Multipart `file`; returns session ID and sheet names |
| POST | `/api/demo` | Load the synthetic marketing data |
| POST | `/api/datasets/{id}/analyze` | `{sheet?, date_column?, filters: []}` |
| POST | `/api/datasets/{id}/chart` | Analysis request plus `{type, x, y?, aggregation, group_by?}` |
| POST | `/api/datasets/{id}/rows` | Analysis request plus search, sort and pagination |
| POST | `/api/datasets/{id}/export` | Analysis request plus `format`: json/csv/markdown |
| DELETE | `/api/datasets/{id}` | Remove a session |
| GET | `/api/health` | Health check |

Filters: `{column, kind: "categorical", values: ["A"]}`, `{column, kind: "numeric", min: 0, max: 100}` or `{column, kind: "date", min: "2026-01-01", max: "2026-02-01"}`. Constraints and schemas are available in Swagger. Manual bars group by X; scatter supports a separate `group_by` field.

### Privacy and safety

Uploads stay in the backend process and expire after one hour or disappear on restart. Reset removes the active dataset. Files are not transmitted to an LLM. XLSX uses cached formula values (`data_only`), never evaluates formulas, and rejects excessive decompressed size. CSV export prefixes spreadsheet-formula-like strings with an apostrophe. Cleaned CSV trims strings, normalizes inferred types and removes exact normalized duplicate rows; it does not impute missing values, remove outliers or repair business data. Legitimate repeated events may be deduplicated, so keep your original file.

### Limitations

- Local, single-worker MVP. No authentication, sharing or persistent projects. Do not expose to untrusted public traffic without authentication, rate limits and shared session storage. The random session ID is a bearer capability, not an account permission system.
- Uploads up to 100 MiB are accepted, but highly expanded or wide files can hit memory/row/column limits. At most 1,000,000 rows, 200 fields, 300 MiB decompressed XLSX and 512 MiB retained session data. Parsing and concurrent analytics need additional transient memory; a 100 MiB input is not guaranteed to fit. Synthetic 50 and 95 MiB CSV uploads were verified locally; [benchmark details](docs/VALIDATION.md) are shape-specific, not a general throughput guarantee.
- Profiling and filtering currently scan the full selected sheet. Correlations use at most 20,000 deterministic sampled rows and twelve ranked metrics; segments consider eight dimensions and six metrics. Scatter displays at most 1,000 points. Limits and sampling are visible in the interface and exports.
- Type inference uses bounded evidence (first 2,000 non-null values) and heuristics; no semantic certainty for arbitrary business fields. Currency thousands separators and locale-specific mixed date conventions need explicit preprocessing. No user type override yet.
- Numeric charts assume reasonable float64 magnitudes. Multi-currency summation, cumulative counters, balances, weighted percentages and nested data require domain decisions. The default KPI sum is not universally meaningful.
- Charts are capped at eight recommendations; degenerate/text-only datasets may produce fewer. Insights are capped at ten but never padded to five when evidence is insufficient.
- Grouped scatter plots show at most ten groups. Manual bar charts show the top twelve groups; the underlying dataset is retained.
- The newest time bucket is excluded from period comparisons but still plotted. Calendar gaps and seasonality can reduce anomaly reliability.
- XLSX formula results may be missing if the source application did not cache them. No support for macros, password-protected workbooks, PDF export or `.xls`.
- The optional LLM provider is an extension point only; `.env.example` placeholders do not activate an integration.

### Roadmap

- Manual semantic-role and locale overrides with aggregation suggestions.
- Streaming ingestion and measured 50–100 MiB benchmarks.
- Schema-level caches for faster repeated filtering.
- Seasonality-aware comparisons and segment minimum-sample controls.
- Optional grounded narrative provider with explicit user consent.
- Saved workspaces and secure sharing when a real persistence use case exists.

### License

[MIT](LICENSE). Contributions with reproducible datasets and a failing regression check are welcome.


[Back to top / language selection](#autoinsight-dashboard) · [Русский](#ru)
