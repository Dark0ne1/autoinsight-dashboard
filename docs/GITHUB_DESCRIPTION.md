# Описание для GitHub и портфолио

## Repository name

`autoinsight-dashboard`

## About / short description

```text
Schema-agnostic CSV/Excel analytics workspace with automatic charts, data quality checks and evidence-backed insights. FastAPI + Next.js, EN/RU, no AI API required.
```

Русский вариант:

```text
Аналитический workspace для CSV/Excel: распознавание структуры, графики, качество данных и наблюдения с числовыми доказательствами. FastAPI + Next.js, EN/RU.
```

## Topics

`data-analysis`, `data-visualization`, `marketing-analytics`, `csv`, `excel`, `fastapi`, `nextjs`, `pandas`, `recharts`, `portfolio-project`, `open-source`

## Развёрнутое описание

AutoInsight превращает таблицу произвольной структуры в интерактивный аналитический workspace. Пользователь загружает CSV или XLSX, выбирает лист, а система определяет роли колонок, проверяет пропуски и повторы, предлагает графики и формирует ранжированные статистические наблюдения.

Проект демонстрирует полный путь от бизнес-выгрузки до проверяемого результата: ingestion и нормализация в Python, FastAPI-контракты, профилирование pandas, Pearson/Spearman, робастный поиск аномалий и интерфейс Next.js с Recharts. Фильтры согласованно меняют KPI, графики, таблицу и экспорт. Наблюдения содержат evidence и не выдают корреляцию за причинность.

Интерфейс построен как рабочее аналитическое пространство: компактная навигация, превью результата до загрузки, светлая/тёмная темы и EN/RU. Анализ работает без LLM и внешних API-ключей. Синтетический marketing demo позволяет проверить продукт сразу после запуска.

Это локальный MVP с сессиями в памяти одного процесса. В репозитории есть тесты аналитики и API, CI-конфигурация, Docker Compose, документация по архитектуре и воспроизводимые результаты проверки. Авторизация и постоянные проекты пока не реализованы.

## Короткий текст для портфолио

**AutoInsight — анализ произвольных CSV/Excel для маркетолога и аналитика.** Разработал pipeline определения структуры, проверки качества, отбора графиков и генерации наблюдений с числовыми доказательствами. Связал Python/FastAPI и Next.js/Recharts; добавил фильтры, ручные графики, экспорт, EN/RU и две темы. Документировал ограничения методов и результаты локальной проверки.

## Подготовка к публикации

- Используйте корневой [README](../README.md): возможности, реальные скриншоты, схема и quick start уже включены.
- Добавьте About и Topics из этого файла. Website указывайте только после фактического развёртывания.
- Проверьте [LICENSE](../LICENSE) и при необходимости укажите своё имя в copyright перед публикацией.
- Не добавляйте `.env`, `.venv`, `node_modules`, `.next` и `output`: они исключены в `.gitignore`. Не включайте реальные клиентские выгрузки.
- Запустите проверки из [CODE_GUIDE](CODE_GUIDE.md). Docker локально не проверен. Актуальный результат hosted CI смотрите в [Checks](https://github.com/Dark0ne1/autoinsight-dashboard/actions/workflows/ci.yml).

Первый commit, если репозиторий ещё не инициализирован:

```sh
git init
git add .
git status
git commit -m "Build AutoInsight analytics workspace with EN/RU interface"
git branch -M main
```

После создания пустого репозитория на GitHub подставьте адрес своего repository:

```sh
git remote add origin https://github.com/Dark0ne1/autoinsight-dashboard.git
git push -u origin main
```

Репозиторий проекта: [Dark0ne1/autoinsight-dashboard](https://github.com/Dark0ne1/autoinsight-dashboard). Это витрина учебного проекта: исходники, скриншоты, документация и тестовый датасет. Публичного приложения нет; GitHub Actions только проверяет тесты и сборку. Для самостоятельного запуска есть [инструкция](DEPLOYMENT.md).
