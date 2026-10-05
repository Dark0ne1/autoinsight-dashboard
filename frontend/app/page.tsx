"use client";
import { LanguageSwitch, useLocale } from "@/components/LocaleProvider";
import Sidebar from "@/components/Sidebar";
import {
  ArrowUpRight,
  FileSpreadsheet,
  Upload as UploadIcon,
  ScanLine,
} from "lucide-react";
import { insightText, qualityText, reportSummary } from "@/lib/i18n";

import { useRef, useState } from "react";
import ChartCard from "@/components/ChartCard";
import Explore from "@/components/Explore";
import Filters from "@/components/Filters";
import RawData from "@/components/RawData";
import UploadScreen from "@/components/UploadScreen";
import { api, deleteDataset, download } from "@/lib/api";
import type { Chart, Filter, Query, Report, Upload } from "@/lib/types";

function Charts({ charts, empty }: { charts: Chart[]; empty: string }) {
  return charts.length ? (
    <div className="chart-grid">
      {charts.map((c, i) => (
        <ChartCard key={`${c.title}-${i}`} chart={c} />
      ))}
    </div>
  ) : (
    <div className="panel empty-inline">{empty}</div>
  );
}

export default function Home() {
  const { t, locale, number } = useLocale();
  const [dataset, setDataset] = useState<Upload | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [query, setQuery] = useState<Query>({ filters: [] });
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);
  const [active, setActive] = useState("overview");
  const requestVersion = useRef(0);

  async function run(upload: Upload, nextQuery: Query) {
    const version = ++requestVersion.current;
    setBusy(true);
    setError("");
    try {
      const result = await api<Report>(
        `/datasets/${upload.id}/analyze`,
        nextQuery,
      );
      if (version !== requestVersion.current) return;
      setReport(result);
      setQuery(nextQuery);
    } catch (e) {
      if (version === requestVersion.current) setError((e as Error).message);
    } finally {
      if (version === requestVersion.current) setBusy(false);
    }
  }

  async function load(file?: File) {
    setBusy(true);
    setError("");
    if (
      file &&
      (!/\.(csv|xlsx)$/i.test(file.name) || file.size > 100 * 1024 * 1024)
    ) {
      setError("Choose a CSV or XLSX file smaller than 100 MB.");
      setBusy(false);
      return;
    }
    try {
      const form = new FormData();
      if (file) form.append("file", file);
      const uploaded = await api<Upload>(
        file ? "/upload" : "/demo",
        file ? form : {},
      );
      if (dataset) await deleteDataset(dataset.id);
      setDataset(uploaded);
      setReport(null);
      setQuery({ filters: [] });
      if (uploaded.sheets.length > 1) {
        setBusy(false);
        return;
      }
      await run(uploaded, { filters: [], sheet: uploaded.sheets[0] });
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  async function reset() {
    ++requestVersion.current;
    if (dataset) await deleteDataset(dataset.id).catch(() => {});
    setDataset(null);
    setReport(null);
    setQuery({ filters: [] });
    setError("");
    setBusy(false);
  }

  async function exportFile(format: string) {
    if (!dataset) return;
    setExporting(true);
    setError("");
    try {
      await download(dataset.id, query, format);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setExporting(false);
    }
  }

  function changeFilters(filters: Filter[]) {
    if (dataset) void run(dataset, { ...query, filters });
  }

  return (
    <div className={`app ${dark ? "dark" : ""}`}>
      <Sidebar
        hasData={Boolean(report)}
        count={report?.insights.length || 0}
        active={active}
        onNavigate={setActive}
        dark={dark}
        onThemeToggle={() => setDark(!dark)}
        onReset={() => void reset()}
        busy={busy}
        filename={report?.filename}
      />
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            {t("Workspace")}
            <span>/</span>{" "}
            <strong>{t(report ? "Dashboard" : "Getting started")}</strong>
          </div>
          <div className="topbar-right">
            <span className="offline-badge">
              <span className="status-dot" />
              {t("Deterministic analytics")}
            </span>
            <LanguageSwitch />
            <span className="session-badge">
              <span className="status-dot" />
              {t("Local session")}
            </span>
          </div>
        </header>
        <main>
          {error && (
            <div className="error-banner" role="alert">
              <span>{t(error)}</span>
              <button
                aria-label={t("Dismiss error")}
                onClick={() => setError("")}
              >
                ×
              </button>
            </div>
          )}
          {!dataset ? (
            <UploadScreen
              onFile={(file) => void load(file)}
              onDemo={() => void load()}
              busy={busy}
            />
          ) : !report ? (
            <div className="sheet-screen panel">
              <span className="eyebrow">{t("EXCEL WORKBOOK")}</span>
              <h1>{dataset.filename}</h1>
              <p>
                {t(
                  busy
                    ? "Profiling your data and ranking the findings…"
                    : "Choose a worksheet to analyze.",
                )}
              </p>
              <div className="sheet-buttons">
                {dataset.sheets.map((sheet) => (
                  <button
                    disabled={busy}
                    className="button"
                    key={sheet}
                    onClick={() => void run(dataset, { filters: [], sheet })}
                  >
                    ▦ {sheet} →
                  </button>
                ))}
              </div>
              <button
                className="text-button"
                disabled={busy}
                onClick={() => void reset()}
              >
                {t("Choose another file")}
              </button>
            </div>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">{t("DATA / CONTEXT")}</div>
                  <h1>{t("Your data, understood.")}</h1>
                  <p className="file-meta">
                    <span>
                      <FileSpreadsheet size={13} />
                      {report.filename}
                    </span>
                    <span>{number(report.file_size / 1024)} KB</span>
                    {report.sheet && <span>{report.sheet}</span>}
                    <span>
                      {t(busy ? "Updating analysis…" : "Analysis complete")}
                    </span>
                  </p>
                </div>
                <div className="heading-actions">
                  <button
                    className="button"
                    disabled={busy}
                    onClick={() => void reset()}
                  >
                    <UploadIcon size={14} />
                    {t("New dataset")}
                  </button>
                  <select
                    className="export-select"
                    aria-label={t("Export analysis")}
                    disabled={exporting || busy}
                    value=""
                    onChange={(e) => void exportFile(e.target.value)}
                  >
                    <option value="">
                      {t(exporting ? "Exporting…" : "↓ Export")}
                    </option>
                    <option value="json">{t("Insights JSON")}</option>
                    <option value="markdown">{t("Summary Markdown")}</option>
                    <option value="csv">{t("Cleaned CSV")}</option>
                  </select>
                </div>
              </div>
              <div className="overview-strip">
                <div>
                  <span>{t("Records")}</span>
                  <strong>{number(report.overview.rows)}</strong>
                </div>
                <div>
                  <span>{t("Fields")}</span>
                  <strong>{report.overview.columns}</strong>
                </div>
                <div>
                  <span>{t("Metrics / dimensions / dates")}</span>
                  <strong>
                    {report.overview.numeric} <small>/</small>{" "}
                    {report.overview.categorical} <small>/</small>{" "}
                    {report.overview.datetime}
                  </strong>
                </div>
                <div className="quality-mini">
                  <span>{t("Data quality")}</span>
                  <strong>
                    {number(report.quality.score)}
                    <small>/100</small>{" "}
                    <span className="quality-pill">
                      {t(
                        report.quality.score >= 90
                          ? "Healthy"
                          : report.quality.score >= 70
                            ? "Review"
                            : "Needs attention",
                      )}
                    </span>
                  </strong>
                </div>
              </div>
              <div className="summary-box">
                <span className="summary-icon">
                  <ScanLine size={21} />
                </span>
                <div>
                  <span className="eyebrow">{t("DATA SUMMARY")}</span>
                  <p>{reportSummary(report, locale)}</p>
                </div>
              </div>
              <Filters
                columns={report.columns}
                filters={query.filters}
                onChange={changeFilters}
                busy={busy}
              />
              <p className="scope-note">
                {locale === "ru"
                  ? "Корреляции: до 12 метрик и 20 000 строк. Сегменты: до 8 измерений × 6 метрик. Точечные графики: до 1 000 точек. Профили и KPI рассчитаны по всем отфильтрованным строкам."
                  : report.analysis_scope.notes}
                {report.analysis_scope.correlation_sampled && (
                  <strong>
                    {" "}
                    {locale === "ru"
                      ? "Корреляции рассчитаны по фиксированной выборке из "
                      : "Correlations use a deterministic sample of "}
                    {number(report.analysis_scope.correlation_rows)} {t("rows")}
                    .
                  </strong>
                )}
              </p>
              <section id="insights" className="section">
                <div className="section-title">
                  <div>
                    <span className="eyebrow">
                      {t("THE SIGNAL IN THE SPREADSHEET")}
                    </span>
                    <h2>
                      {t("Key insights")}{" "}
                      <span className="section-count">
                        {report.insights.length}
                      </span>
                    </h2>
                  </div>
                  <span className="muted">
                    {t("Ranked by importance · Evidence included")}
                  </span>
                </div>
                <div className="insight-grid">
                  {report.insights.map((insight, i) => (
                    <article className="panel insight-card" key={i}>
                      <div className="insight-meta">
                        <span className={`insight-type ${insight.type}`}>
                          {t(insight.type.replaceAll("_", " "))}
                        </span>
                        <span>{number(insight.importance)}/100</span>
                      </div>
                      <h3>{insightText(insight, locale).title}</h3>
                      <p>{insightText(insight, locale).description}</p>
                      <details>
                        <summary>
                          {t("View evidence")} <ArrowUpRight size={12} />
                        </summary>
                        <pre>{JSON.stringify(insight.evidence, null, 2)}</pre>
                      </details>
                    </article>
                  ))}
                </div>
                {!report.insights.length && (
                  <div className="panel empty-inline">
                    {t(
                      "No supported findings for these records. Try clearing filters or exploring the fields below.",
                    )}
                  </div>
                )}
              </section>
              <section id="overview" className="section">
                <div className="section-title">
                  <div>
                    <span className="eyebrow">{t("AT A GLANCE")}</span>
                    <h2>{t("Overview")}</h2>
                  </div>
                  <span className="muted">
                    {t("Automatic KPIs · Review aggregation for your domain")}
                  </span>
                </div>
                <div className="kpi-grid">
                  {report.kpis.map((kpi) => (
                    <article className="panel kpi-card" key={kpi.column}>
                      <span>{kpi.column}</span>
                      <strong>
                        {kpi.semantic_type === "percentage" && kpi.value != null
                          ? `${number(kpi.value * 100)}%`
                          : number(kpi.value)}
                      </strong>
                      <div>
                        <span className="status-dot" /> {t(kpi.aggregation)}{" "}
                        {t("of filtered observations")}
                      </div>
                    </article>
                  ))}
                </div>
                {!report.kpis.length && (
                  <div className="panel empty-inline">
                    {t(
                      "No varying numeric metrics detected. Category counts and profiles remain available.",
                    )}
                  </div>
                )}
                <div className="chart-grid distributions">
                  {report.charts
                    .filter((c) => c.type === "histogram")
                    .map((c) => (
                      <ChartCard key={c.title} chart={c} />
                    ))}
                </div>
              </section>
              <section id="trends" className="section">
                <div className="section-title">
                  <div>
                    <span className="eyebrow">{t("HOW THINGS CHANGE")}</span>
                    <h2>{t("Trends")}</h2>
                  </div>
                  {report.overview.datetime > 0 && (
                    <label className="date-switch">
                      {t("Primary date")}
                      <select
                        aria-label={t("Primary date column")}
                        value={report.primary_date || ""}
                        disabled={busy}
                        onChange={(e) =>
                          void run(dataset, {
                            ...query,
                            date_column: e.target.value,
                          })
                        }
                      >
                        {report.columns
                          .filter((c) => c.semantic_type === "datetime")
                          .map((c) => (
                            <option key={c.name}>{c.name}</option>
                          ))}
                      </select>
                    </label>
                  )}
                </div>
                <Charts
                  charts={report.charts.filter((c) => c.type === "line")}
                  empty={t(
                    "No time dimension detected. Explore categories and numeric distributions instead.",
                  )}
                />
              </section>
              <section id="segments" className="section">
                <div className="section-title">
                  <div>
                    <span className="eyebrow">
                      {t("WHERE THE DIFFERENCES ARE")}
                    </span>
                    <h2>{t("Segments")}</h2>
                  </div>
                  <span className="muted">
                    {t("Ranked by between-group variance")}
                  </span>
                </div>
                <Charts
                  charts={report.charts.filter((c) =>
                    ["bar", "category"].includes(c.type),
                  )}
                  empty={t(
                    "No suitable low-cardinality dimensions detected. High-cardinality fields are available in Explore mode.",
                  )}
                />
              </section>
              <section id="relationships" className="section">
                <div className="section-title">
                  <div>
                    <span className="eyebrow">{t("WHAT MOVES TOGETHER")}</span>
                    <h2>{t("Relationships")}</h2>
                  </div>
                  <span className="muted">
                    {t("Pearson + Spearman · Correlation ≠ causation")}
                  </span>
                </div>
                <Charts
                  charts={report.charts.filter((c) => c.type === "scatter")}
                  empty={t(
                    "Not enough paired numeric observations to recommend relationships.",
                  )}
                />
                {!!report.correlations.length && (
                  <div className="panel correlation-list">
                    {report.correlations.map((p) => (
                      <div key={`${p.x}-${p.y}`}>
                        <strong>
                          {p.x} ↔ {p.y}
                        </strong>
                        <span>
                          {t("Pearson")} {number(p.pearson)} · {t("Spearman")}{" "}
                          {number(p.spearman)} · n = {number(p.count)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              <section id="quality" className="section">
                <div className="section-title">
                  <div>
                    <span className="eyebrow">{t("TRUST, WITH CONTEXT")}</span>
                    <h2>{t("Data quality")}</h2>
                  </div>
                  <span className="muted">
                    {number(report.overview.memory_bytes / 1024 / 1024)}{" "}
                    {t("MB in memory")}
                  </span>
                </div>
                <div className="quality-layout">
                  <article className="panel quality-score">
                    <div
                      className="score-ring"
                      style={{
                        background: `conic-gradient(var(--accent) ${report.quality.score * 3.6}deg, var(--border) 0)`,
                      }}
                    >
                      <div>
                        <strong>{number(report.quality.score)}</strong>
                        <span>{t("out of 100")}</span>
                      </div>
                    </div>
                    <h3>
                      {t(
                        report.quality.score >= 90
                          ? "A solid foundation"
                          : "A few things to review",
                      )}
                    </h3>
                    <p>
                      {number(report.quality.missing_cells)}{" "}
                      {t("missing cells")} · {number(report.quality.duplicates)}{" "}
                      {t("repeated rows")}
                    </p>
                    <details>
                      <summary>{t("How the score works")}</summary>
                      <p>
                        {t(
                          "100 minus weighted rates: missing 40, duplicates 25, constants 10, failed conversions 15, extreme outliers 10. Empty datasets score 0. This measures tabular hygiene, not business validity.",
                        )}
                      </p>
                      <pre>
                        {JSON.stringify(report.quality.penalties, null, 2)}
                      </pre>
                    </details>
                  </article>
                  <article className="panel quality-issues">
                    <h3>
                      {t("Quality observations")}{" "}
                      <span className="section-count">
                        {report.quality.issues.length}
                      </span>
                    </h3>
                    {report.quality.issues.length ? (
                      report.quality.issues.map((issue, i) => (
                        <div className="quality-issue" key={i}>
                          <span className={`issue-dot ${issue.kind}`} />
                          <p>{qualityText(issue.message, locale)}</p>
                          <span className="chip">{t(issue.kind)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="empty-inline">
                        {t("No tabular quality issues detected.")}
                      </div>
                    )}
                  </article>
                </div>
                <details className="panel profile-panel">
                  <summary>
                    {t("Column profiles")}{" "}
                    <span>
                      {report.columns.length} {t("inferred fields")}
                    </span>
                  </summary>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>{t("Field")}</th>
                          <th>{t("Imported type")}</th>
                          <th>{t("Semantic type")}</th>
                          <th>{t("Unique")}</th>
                          <th>{t("Missing")}</th>
                          <th>{t("Profile")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.columns.map((c) => (
                          <tr key={c.name}>
                            <td>
                              <strong>{c.name}</strong>
                            </td>
                            <td>{c.dtype}</td>
                            <td>
                              <span className="chip">{t(c.semantic_type)}</span>
                              {c.flags.map((f) => (
                                <span className="chip" key={t(f)}>
                                  {t(f)}
                                </span>
                              ))}
                            </td>
                            <td>{number(c.unique)}</td>
                            <td>{number(c.missing_rate * 100)}%</td>
                            <td>
                              <details>
                                <summary>{t("Statistics & values")}</summary>
                                <pre>
                                  {JSON.stringify(
                                    {
                                      statistics: c.stats,
                                      top_values: c.top_values,
                                      long_tail_share: c.long_tail_share,
                                    },
                                    null,
                                    2,
                                  )}
                                </pre>
                              </details>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </section>
              <Explore
                key={dataset.id}
                id={dataset.id}
                columns={report.columns}
                query={query}
              />
              <RawData
                key={`${dataset.id}-${JSON.stringify(query)}`}
                id={dataset.id}
                query={query}
              />
              <footer className="footer">
                <span>
                  autoinsight. <span>{t("Clarity, backed by data.")}</span>
                </span>
                <span>
                  {t("Rule-based analysis · Session expires in 1 hour")}
                </span>
              </footer>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
