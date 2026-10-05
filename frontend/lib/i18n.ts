import type { Chart, Insight, Report } from "./types";
export type Locale = "en" | "ru";
export const messages: Record<string, string> = {
  "Upload exceeds size limit.": "Файл превышает ограничение размера.",
  "Group by is supported on scatter plots; use X as the grouping field for bars.":
    "Группировка доступна для точечного графика. Для столбцов используйте поле X.",
  "Unknown sort column.": "Неизвестная колонка сортировки.",
  "Primary date must be a detected datetime column.":
    "Основная дата должна быть распознанным полем даты.",
  "Date filters require a datetime column.":
    "Для фильтра дат выберите поле даты.",
  "Numeric filters require a numeric column.":
    "Для числового фильтра выберите числовое поле.",
  "Numeric bounds must be finite.":
    "Числовые границы должны быть конечными числами.",
  "Workbook expands beyond the 300 MB safety limit.":
    "Распакованная книга превышает ограничение 300 МБ.",
  "CSV encoding must be UTF-8 or Windows-1251.":
    "CSV должен использовать кодировку UTF-8 или Windows-1251.",
  "Choose a valid workbook sheet.": "Выберите существующий лист книги.",
  "Only .csv and .xlsx files are supported.":
    "Поддерживаются только CSV и XLSX.",
  "Dataset exceeds 1,000,000 rows or 200 columns. Split the file before uploading.":
    "В таблице больше 1 000 000 строк или 200 колонок. Разделите файл перед загрузкой.",
  "No header columns found.": "Заголовки колонок не найдены.",
  "Session memory is full. Remove a dataset or wait for expiry.":
    "Память сессий заполнена. Удалите ненужные данные или дождитесь окончания сессии.",
  "Parsed dataset exceeds the 512 MB session memory budget.":
    "Прочитанная таблица превышает бюджет памяти сессий 512 МБ.",
  "Dashboard sections": "Разделы анализа",
  Pearson: "Пирсон",
  Spearman: "Спирмен",
  Workspace: "Рабочая область",
  Overview: "Обзор",
  "Key insights": "Наблюдения",
  Trends: "Динамика",
  Segments: "Сегменты",
  Relationships: "Взаимосвязи",
  "Data quality": "Качество данных",
  Explore: "Исследование",
  "Raw data": "Исходные данные",
  ANALYSIS: "АНАЛИЗ",
  DATA: "ДАННЫЕ",
  "New analysis": "Новый анализ",
  "No dataset connected": "Данные не загружены",
  "Local engine": "Локальный движок",
  "Ready to analyze": "Готов к анализу",
  "No API keys. No external AI.": "Без API-ключей и внешнего ИИ.",
  "Light appearance": "Светлая тема",
  "Dark appearance": "Тёмная тема",
  "Switch to light mode": "Включить светлую тему",
  "Switch to dark mode": "Включить тёмную тему",
  "OPEN SOURCE": "ОТКРЫТЫЙ КОД",
  "Getting started": "Начало работы",
  Dashboard: "Анализ",
  "Deterministic analytics": "Статистический анализ",
  "Local session": "Локальная сессия",
  "ANALYSIS / 001": "АНАЛИЗ / 001",
  "Start with the data.": "Начните с данных.",
  "Bring a table. We’ll find the structure, the patterns, and the questions worth asking.":
    "Загрузите таблицу. Найдём структуру, закономерности и вопросы, которые стоит проверить.",
  "New workspace": "Новая рабочая область",
  "01 / INPUT": "01 / ИСТОЧНИК",
  "Connect a dataset": "Загрузите данные",
  "Drop a spreadsheet here": "Перетащите таблицу сюда",
  "or choose a file from your computer": "или выберите файл на компьютере",
  "Choose a file": "Выбрать файл",
  "Reading your data…": "Читаем данные…",
  "Profiling columns and looking for signal.":
    "Определяем типы колонок и ищем закономерности.",
  "CSV / XLSX": "CSV / XLSX",
  "Up to 100 MB": "До 100 МБ",
  "Any schema": "Любая структура",
  "Your next step": "Что произойдёт дальше",
  "Infer structure": "Определим структуру",
  "Check quality": "Проверим качество",
  "Surface findings": "Покажем наблюдения",
  "No prescribed columns. No setup required.":
    "Без заданных названий колонок и настройки схемы.",
  "Want to see it in action?": "Посмотреть на примере?",
  "Use demo dataset": "Открыть демоданные",
  "marketing.csv · 728 records · synthetic data":
    "marketing.csv · 728 строк · синтетические данные",
  "Uploads stay in this local session and expire after one hour.":
    "Файлы остаются в локальной сессии. Срок доступа — один час.",
  "Upload spreadsheet": "Загрузить таблицу",
  "02 / OUTPUT PREVIEW": "02 / ПРЕВЬЮ АНАЛИЗА",
  "A first look at the signal": "Так выглядят результаты",
  "DEMO PREVIEW": "ДЕМОПРИМЕР",
  "Preview only · your analysis will use your uploaded data.":
    "Это демопример. Ваш анализ будет построен по загруженному файлу.",
  Records: "Строки",
  rows: "строк",
  Revenue: "Выручка",
  "Quality score": "Качество",
  "6 metrics / 3 dimensions": "6 метрик / 3 измерения",
  "Total across the demo": "Сумма в демоданных",
  "8 duplicate rows detected": "Найдено 8 повторных строк",
  "Revenue over time": "Динамика выручки",
  "Jan — Jun 2026": "Янв — июн 2026",
  "Weekly aggregation": "По неделям",
  "Potential anomaly": "Возможная аномалия",
  "An observation, not a guess": "Наблюдение, не предположение",
  "An unusual revenue spike": "Необычный всплеск выручки",
  "One week crosses the rolling baseline and the 3 × IQR threshold. Worth a closer look.":
    "Одна неделя выходит за скользящую базовую линию и порог 3 × IQR. Стоит проверить подробнее.",
  "Grounded in evidence": "Подтверждено числами",
  "Leads by channel": "Лиды по каналам",
  "Share of the demo total": "Доля в общей сумме демоданных",
  "Detected structure": "Определённая структура",
  datetime: "дата и время",
  categorical: "категория",
  numeric: "число",
  boolean: "логический",
  identifier: "идентификатор",
  percentage: "процент",
  "currency-like": "денежный",
  text: "текст",
  "high-cardinality category": "много категорий",
  constant: "константа",
  "mostly-null": "почти пустая",
  "inferred-date": "дата из текста",
  "mixed-values": "смешанные значения",
  missing: "пропуски",
  outlier: "выброс",
  duplicate: "повторы",
  trend: "динамика",
  anomaly: "аномалия",
  correlation: "корреляция",
  segment: "сегмент",
  distribution: "распределение",
  "data quality": "качество данных",
  sum: "сумма",
  mean: "среднее",
  median: "медиана",
  count: "количество",
  min: "минимум",
  max: "максимум",
  none: "без агрегации",
  day: "день",
  week: "неделя",
  month: "месяц",
  bar: "столбцы",
  line: "линия",
  scatter: "точки",
  histogram: "гистограмма",
  category: "частоты",
  "TIME SERIES": "ВРЕМЕННОЙ РЯД",
  RELATIONSHIP: "ВЗАИМОСВЯЗЬ",
  DISTRIBUTION: "РАСПРЕДЕЛЕНИЕ",
  "SEGMENT BREAKDOWN": "РАЗРЕЗ ПО СЕГМЕНТАМ",
  "No observations match the current filters.":
    "Нет данных, соответствующих фильтрам.",
  "7-bucket average": "Среднее за 7 периодов",
  All: "Все",
  Value: "Значение",
  "Dashed line: 7-bucket average · Coral points: potential anomalies":
    "Пунктир — среднее за 7 периодов. Коралловые точки — возможные аномалии.",
  "Correlation does not imply causation.":
    "Корреляция не доказывает причинную связь.",
  "Display limited to 1,000 sampled points.":
    "Показано до 1 000 точек из выборки.",
  "Top 12 groups · Null categories excluded":
    "12 ведущих групп. Пустые категории исключены.",
  "Adaptive bins · Missing values excluded":
    "Адаптивные интервалы. Пропуски исключены.",
  "View chart data": "Данные графика",
  "Global filters": "Общие фильтры",
  "Filter column": "Поле фильтра",
  "Choose field": "Выберите поле",
  "Category filter value": "Значение категории",
  "Exact category value": "Точное значение категории",
  "Filter minimum": "Нижняя граница",
  "Filter maximum": "Верхняя граница",
  Min: "От",
  Max: "До",
  to: "—",
  Apply: "Применить",
  "Fraction bounds: 0.1 = 10%": "Границы в долях: 0,1 = 10%",
  "Clear all": "Сбросить всё",
  "Remove {column} filter": "Убрать фильтр {column}",
  "YOUR QUESTIONS, YOUR CHARTS": "ВАШИ ВОПРОСЫ — ВАШИ ГРАФИКИ",
  "Explore mode": "Режим исследования",
  "Uses the global filters above": "С учётом общих фильтров",
  "Chart type": "Тип графика",
  "X axis": "Ось X",
  "Y metric": "Метрика Y",
  "Choose metric": "Выберите метрику",
  Aggregation: "Агрегация",
  "Group by": "Группировка",
  None: "Нет",
  "Building…": "Строим…",
  "Create chart +": "Добавить график +",
  "Bars group by X. Lines require a date X; scatter plots require numeric X and Y. Up to 8 custom charts.":
    "Столбцы группируются по X. Для линии нужна дата по X, для точек — числовые X и Y. До 8 своих графиков.",
  "Remove last chart request": "Убрать последний запрос",
  "Remove ×": "Убрать ×",
  "LOOK CLOSER": "ПОСМОТРЕТЬ ПОДРОБНЕЕ",
  "Raw data explorer": "Просмотр исходных данных",
  "Search records": "Поиск по строкам",
  "Search all fields…": "Поиск по всем полям…",
  null: "пусто",
  "No matching records.": "Совпадений нет.",
  "Loading…": "Загрузка…",
  "{total} records · Page {page} of {pages}":
    "Строк: {total} · Страница {page} из {pages}",
  "← Previous": "← Назад",
  "Next →": "Далее →",
  "Export analysis": "Экспорт анализа",
  "Exporting…": "Экспорт…",
  "↓ Export": "Экспорт",
  "Insights JSON": "Наблюдения JSON",
  "Summary Markdown": "Отчёт Markdown",
  "Cleaned CSV": "Очищенный CSV",
  "Dismiss error": "Закрыть сообщение",
  "EXCEL WORKBOOK": "КНИГА EXCEL",
  "Choose a worksheet to analyze.": "Выберите лист для анализа.",
  "Profiling your data and ranking the findings…":
    "Профилируем данные и ранжируем наблюдения…",
  "Choose another file": "Выбрать другой файл",
  "Your data, understood.": "Данные обрели контекст.",
  "DATA / CONTEXT": "ДАННЫЕ / КОНТЕКСТ",
  "New dataset": "Новый файл",
  "Updating analysis…": "Обновляем анализ…",
  "Analysis complete": "Анализ завершён",
  Fields: "Колонки",
  "Metrics / dimensions / dates": "Метрики / измерения / даты",
  Healthy: "Хорошо",
  Review: "Проверить",
  "Needs attention": "Есть проблемы",
  "DATA SUMMARY": "СТРУКТУРА ДАННЫХ",
  "THE SIGNAL IN THE SPREADSHEET": "ГЛАВНОЕ В ДАННЫХ",
  "Ranked by importance · Evidence included":
    "По важности · С числовыми доказательствами",
  "View evidence": "Доказательства",
  "No supported findings for these records. Try clearing filters or exploring the fields below.":
    "Для этих строк нет подтверждённых наблюдений. Сбросьте фильтры или исследуйте поля ниже.",
  "AT A GLANCE": "ОСНОВНЫЕ ПОКАЗАТЕЛИ",
  "Automatic KPIs · Review aggregation for your domain":
    "Авто-KPI · Проверьте агрегацию для своей задачи",
  "of filtered observations": "по отфильтрованным строкам",
  "No varying numeric metrics detected. Category counts and profiles remain available.":
    "Числовых метрик с изменяющимися значениями нет. Доступны категории и профили колонок.",
  "HOW THINGS CHANGE": "ИЗМЕНЕНИЯ ВО ВРЕМЕНИ",
  "Primary date": "Основная дата",
  "Primary date column": "Основное поле даты",
  "No time dimension detected. Explore categories and numeric distributions instead.":
    "Поле даты не найдено. Исследуйте категории и распределения чисел.",
  "WHERE THE DIFFERENCES ARE": "РАЗЛИЧИЯ МЕЖДУ ГРУППАМИ",
  "Ranked by between-group variance": "По межгрупповой вариативности",
  "No suitable low-cardinality dimensions detected. High-cardinality fields are available in Explore mode.":
    "Подходящих измерений с небольшим числом категорий нет. Остальные поля доступны в режиме исследования.",
  "WHAT MOVES TOGETHER": "ЧТО ИЗМЕНЯЕТСЯ ВМЕСТЕ",
  "Pearson + Spearman · Correlation ≠ causation":
    "Пирсон + Спирмен · Корреляция ≠ причина",
  "Not enough paired numeric observations to recommend relationships.":
    "Недостаточно парных числовых наблюдений для поиска связей.",
  "TRUST, WITH CONTEXT": "ПРОВЕРКА НАДЁЖНОСТИ",
  "MB in memory": "МБ в памяти",
  "out of 100": "из 100",
  "A solid foundation": "Надёжная основа",
  "A few things to review": "Есть что проверить",
  "missing cells": "пустых ячеек",
  "repeated rows": "повторных строк",
  "How the score works": "Как считается оценка",
  "100 minus weighted rates: missing 40, duplicates 25, constants 10, failed conversions 15, extreme outliers 10. Empty datasets score 0. This measures tabular hygiene, not business validity.":
    "Из 100 вычитаются взвешенные доли: пропуски — 40, повторы — 25, константы — 10, ошибки преобразования — 15, выбросы — 10. Пустая таблица получает 0. Оценка отражает качество таблицы, а не достоверность бизнеса.",
  "Quality observations": "Проблемы и замечания",
  "No tabular quality issues detected.": "Проблем качества таблицы не найдено.",
  "Column profiles": "Профили колонок",
  "inferred fields": "распознанных полей",
  Field: "Поле",
  "Imported type": "Исходный тип",
  "Semantic type": "Смысловой тип",
  Unique: "Уникальных",
  Missing: "Пропуски",
  Profile: "Профиль",
  "Statistics & values": "Статистика и значения",
  "Clarity, backed by data.": "Выводы, подтверждённые данными.",
  "Rule-based analysis · Session expires in 1 hour":
    "Статистический анализ · Сессия доступна 1 час",
  "Choose a CSV or XLSX file smaller than 100 MB.":
    "Выберите CSV или XLSX размером до 100 МБ.",
  "Export failed. The session may have expired.":
    "Экспорт не удался. Возможно, сессия истекла.",
  "Dataset expired or was removed. Upload it again.":
    "Сессия истекла или была удалена. Загрузите файл заново.",
  "File is empty.": "Файл пуст.",
  "Only CSV and XLSX files are supported.": "Поддерживаются только CSV и XLSX.",
  "File exceeds the upload size limit.": "Файл превышает ограничение размера.",
  "Invalid XLSX workbook.": "Повреждённая книга XLSX.",
  "Y must be a numeric metric.": "Для Y выберите числовую метрику.",
  "Line charts require a datetime X.": "Для линии выберите дату по X.",
  "Bar charts require a categorical X.":
    "Для столбцов выберите категорию по X.",
  "Histograms require a numeric X.": "Для гистограммы выберите число по X.",
  "Scatter plots require a numeric X.":
    "Для точечного графика выберите число по X.",
  "Choose existing columns.": "Выберите существующие колонки.",
  "Could not read or analyze this file. Check its format and try a smaller dataset.":
    "Не удалось прочитать или проанализировать файл. Проверьте формат или загрузите меньшую таблицу.",
};

export function translate(
  text: string,
  locale: Locale,
  params: Record<string, string | number> = {},
): string {
  let result = locale === "ru" ? messages[text] || text : text;
  for (const [key, value] of Object.entries(params))
    result = result.replaceAll(`{${key}}`, String(value));
  return result;
}
export function formatNumber(
  value: number | null | undefined,
  locale: Locale = "en",
): string {
  return value == null
    ? "—"
    : new Intl.NumberFormat(locale, {
        maximumFractionDigits: 2,
        notation: Math.abs(value) >= 100000 ? "compact" : "standard",
      }).format(value);
}
export function chartTitle(c: Chart, locale: Locale): string {
  if (locale === "en") return c.title;
  if (c.type === "line") return `Динамика ${c.y}`;
  if (c.type === "bar") return `${c.y || "Строки"} по ${c.x}`;
  if (c.type === "histogram") return `Распределение ${c.x}`;
  if (c.type === "category") return `Частоты ${c.x}`;
  return `${c.y} и ${c.x}`;
}
export function reportSummary(r: Report, locale: Locale): string {
  if (locale === "en") return r.summary;
  const o = r.overview;
  return `Строк: ${formatNumber(o.rows, locale)}. Колонок: ${o.columns}. Числовых метрик: ${o.numeric}; категориальных измерений: ${o.categorical}; полей даты: ${o.datetime}.${o.date_range ? ` Период: ${o.date_range[0].slice(0, 10)} — ${o.date_range[1].slice(0, 10)}.` : ""} Статистические правила, без внешнего ИИ и предположений о причинах.`;
}
export function insightText(
  i: Insight,
  locale: Locale,
): { title: string; description: string } {
  if (locale === "en") return i;
  const e = i.evidence;
  const n = (v: unknown) => formatNumber(Number(v), locale);
  switch (i.type) {
    case "trend":
      return {
        title: `${e.metric}: ${Number(e.change_percent) >= 0 ? "рост" : "снижение"} на ${n(Math.abs(Number(e.change_percent)))}%`,
        description: `Последние ${e.buckets} завершённых периодов сравниваются с предыдущим равным интервалом. Причину изменения по этим данным установить нельзя.`,
      };
    case "anomaly":
      return {
        title: `Необычная динамика ${e.metric}`,
        description: `Периодов с отклонением: ${Array.isArray(e.points) ? e.points.length : 0}. Превышены порог скользящей базовой линии и границы 3 × IQR. Проверьте эти наблюдения.`,
      };
    case "correlation":
      return {
        title: `${e.x} и ${e.y} изменяются вместе`,
        description: `Пирсон r = ${n(e.pearson)}; Спирмен ρ = ${n(e.spearman)}. Парных наблюдений: ${n(e.count)}. Корреляция не доказывает причинную связь.`,
      };
    case "data_quality":
      return e.duplicate_rows !== undefined
        ? {
            title: "Повторные строки",
            description: `Найдено ${n(e.duplicate_rows)} повторных строк. Перед удалением проверьте, не являются ли они самостоятельными событиями.`,
          }
        : {
            title: `Пропуски в ${e.column}`,
            description: `У ${n(Number(e.missing_rate) * 100)}% исходных строк нет значения в этом поле.`,
          };
    case "distribution":
      return {
        title: `Типичное значение ${e.column}`,
        description: `Медиана: ${n(e.median)}. Центральные 50% значений: от ${n(e.q25)} до ${n(e.q75)}.`,
      };
    case "segment": {
      if (e.top_group) {
        const g = e.top_group as Record<string, unknown>;
        return {
          title: `${e.metric} различается по ${e.dimension}`,
          description: `Группа «${g.x}»: значение ${n(g.y)}, наблюдений ${n(g.count)}.${g.share != null ? ` Доля в общей неотрицательной сумме: ${n(Number(g.share) * 100)}%.` : ""}`,
        };
      }
      return {
        title: `Концентрация в ${e.column}`,
        description: `На «${e.value}» приходится ${n(Number(e.share) * 100)}% строк.`,
      };
    }
    default:
      return i;
  }
}
export function qualityText(message: string, locale: Locale): string {
  if (locale === "en") return message;
  return message
    .replace(
      /^(.*): ([\d.]+)% missing values\.$/,
      "$1: $2% пропущенных значений.",
    )
    .replace(
      /^(.*) contains only one distinct non-null value\.$/,
      "$1 содержит одно непустое уникальное значение.",
    )
    .replace(
      /^(.*): ([\d.]+)% values could not be converted and became missing\.$/,
      "$1: $2% значений не удалось преобразовать; они стали пропусками.",
    )
    .replace(
      /^(.*) contains dates imported as text; normalized to UTC\.$/,
      "$1 содержит даты из текста; приведены к UTC.",
    )
    .replace(
      /^(.*) contains (\d+) extreme outliers \(3 × IQR\)\.$/,
      "$1: найдено $2 экстремальных выбросов (3 × IQR).",
    )
    .replace(/^Found (\d+) duplicate rows\.$/, "Найдено $1 повторных строк.");
}
