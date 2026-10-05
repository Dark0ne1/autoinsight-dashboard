# Развёртывание AutoInsight

Приложение состоит из Next.js (:3000) и FastAPI (:8000). Browser обращается к Next.js `/api`; Next.js перенаправляет запросы в backend. База данных и API-ключи не нужны. Используйте **один worker backend**: сессии хранятся в памяти процесса.

## Требования

- Без Docker: Python 3.12+ и Node.js 22 с npm.
- С Docker: Docker Engine/Desktop с Compose v2. Образы используют Python 3.12 и Node.js 22.
- Для разработки достаточно умеренного объёма памяти; Compose ограничивает backend двумя GiB. Крупные/широкие таблицы создают дополнительные временные копии, поэтому лимит файла не является гарантией потребления RAM.

## Локальная разработка: Windows / PowerShell

В корне репозитория:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
Set-Location backend
..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Откройте второй терминал из корня:

```powershell
Set-Location frontend
npm.cmd ci
npm.cmd run dev
```

Откройте `http://localhost:3000`. Swagger — `http://localhost:8000/docs`.

Активация venv не обязательна: команды явно используют его Python, поэтому менять PowerShell ExecutionPolicy не требуется.

## Локальная разработка: macOS / Linux

Из корня, первый терминал:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements.txt
cd backend
../.venv/bin/python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Второй терминал:

```sh
cd frontend
npm ci
npm run dev
```

## Production без Docker

Установите зависимости как выше. Backend запускайте без `--reload`, одним процессом:

```powershell
# Windows, из backend
..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 1
```

```sh
# macOS/Linux, из backend
../.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 1
```

Frontend, из `frontend`:

```powershell
$env:API_INTERNAL_URL = 'http://127.0.0.1:8000'
npm.cmd ci
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:locale
npm.cmd run build
npm.cmd start
```

Для macOS/Linux задайте `export API_INTERNAL_URL=http://127.0.0.1:8000` и используйте `npm` вместо `npm.cmd`.

`API_INTERNAL_URL` и `NEXT_PUBLIC_API_URL` фиксируются при production build. Если адрес API изменился, пересоберите frontend. `npm start` запускает обычную `.next` сборку; Docker использует отдельный standalone runtime с `node server.js`.

Backend без Docker не подхватывает корневой `.env` автоматически. Перед запуском задавайте переменные в окружении терминала/менеджера процессов. Next.js автоматически читает свои `.env*` только из `frontend`; обычно достаточно адреса API по умолчанию.

## Docker Compose

Из корня:

```powershell
# Windows
Copy-Item .env.example .env
docker compose config
docker compose up --build -d
docker compose ps
```

```sh
# macOS/Linux
cp .env.example .env
docker compose config
docker compose up --build -d
docker compose ps
```

Compose задаёт frontend build argument `API_INTERNAL_URL=http://backend:8000`. Backend healthcheck должен пройти до запуска frontend. Оба опубликованных порта привязаны к loopback хоста (`127.0.0.1`), контейнеры запускаются от непривилегированного пользователя.

Проверка Windows:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/health
Invoke-RestMethod http://localhost:3000/api/health
```

Проверка Linux:

```sh
curl --fail http://127.0.0.1:8000/api/health
curl --fail http://localhost:3000/api/health
```

Оба адреса должны вернуть `{"status":"ok"}`. Затем в браузере откройте демоданные: 728 строк, десять колонок. Проверьте EN/RU, фильтр и экспорт.

Логи и обновление:

```sh
docker compose logs --tail=100 backend frontend
# После получения новой версии кода:
docker compose up --build -d
# Приостановить приложение:
docker compose stop
# Запустить остановленные контейнеры:
docker compose start
```

Volumes не используются. Пересоздание/перезапуск backend теряет загруженные сессии. `stop/start` тоже завершает старый процесс: исходные CSV/XLSX следует хранить отдельно. Compose пока не задаёт restart policy; после перезагрузки сервера выполните `docker compose up -d`.

**Статус проверки:** native production build и приложение проверены локально. Docker на машине разработки не установлен; Dockerfile/Compose проверены по конфигурации, реальная сборка контейнеров не выполнялась. Это также отмечено в [VALIDATION.md](VALIDATION.md).

## VPS: рабочий приватный доступ

1. Установите Docker Engine и Compose v2 на сервер.
2. Скопируйте репозиторий или клонируйте его после публикации на GitHub.
3. Создайте `.env` и запустите Compose командами выше.
4. На своём компьютере откройте SSH tunnel:

```sh
ssh -N -L 3001:127.0.0.1:3000 USER@SERVER
```

Откройте `http://localhost:3001`. API проходит через тот же туннель и Next.js; открывать :8000 в firewall не требуется. Порт :3001 выбран, чтобы не конфликтовать с локальным экземпляром на :3000. SSH-сессия должна оставаться запущенной.

Для публичного домена поставьте HTTPS reverse proxy перед `127.0.0.1:3000` и авторизацию на gateway: встроенных аккаунтов у приложения нет. Proxy должен разрешать тело не меньше 101 MiB и длительные запросы анализа; Next.js сейчас настроен на `101mb`. Не открывайте backend напрямую. Публичный многопользовательский сервис потребует общего хранилища сессий и контроля доступа; увеличение количества workers не решает это в текущем коде.

## Настройки

| Переменная | Значение по умолчанию / где используется |
| --- | --- |
| `MAX_UPLOAD_MB` | 100; backend считает лимит в MiB (`× 1024²`) |
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000`; список origin через запятую без пробелов, нужен для прямого cross-origin API |
| `API_INTERNAL_URL` | Native: `http://127.0.0.1:8000`; Docker build: `http://backend:8000` |
| `NEXT_PUBLIC_API_URL` | Пусто: same-origin rewrites. Для прямого API задаётся при build; адрес будет виден браузеру |
| `STANDALONE` | `1` только при Docker build |
| `NARRATIVE_PROVIDER`, `OPENAI_API_KEY` | Резервные placeholders из `.env.example`; текущий код не включает внешний provider |

Если уменьшаете лимит upload через окружение backend, UI по-прежнему показывает 100 MB. Для изменения пользовательского лимита согласованно обновите проверку в `page.tsx`, подписи в `i18n.ts` и `proxyClientMaxBodySize` в `next.config.ts`. Поднимать только backend limit недостаточно.

## Типовые проблемы

| Симптом | Проверка / действие |
| --- | --- |
| `502` или `ECONNREFUSED` при загрузке | Healthcheck :8000, адрес rewrite; в Docker адрес должен быть `backend:8000`, а не localhost |
| :8000 работает, :3000 `/api/health` нет | `API_INTERNAL_URL` при сборке; пересоберите Next.js после смены адреса |
| `404 Dataset expired…` | TTL час или перезапуск backend. Загрузите исходный файл заново |
| `Session memory is full…` | Удалите ненужную сессию кнопкой нового анализа / DELETE API или дождитесь TTL |
| `413` | Ограничение backend, Next proxy либо внешнего reverse proxy; файл должен укладываться во все три |
| `422` | Прочитайте `detail`: формат, лист, пределы таблицы, несовместимые оси графика или фильтр |
| PowerShell блокирует npm | Используйте `npm.cmd` |
| Несколько workers дают случайные 404 | Верните `--workers 1`; каждый процесс сейчас имеет отдельное хранилище |
| XLSX формулы пустые | Откройте и сохраните книгу в табличном редакторе, чтобы сохранить вычисленные результаты |

Статистические и UI проверки — [CODE_GUIDE.md](CODE_GUIDE.md#изменения-и-проверки). Фактические замеры крупных CSV — [VALIDATION.md](VALIDATION.md).
