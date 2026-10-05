"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceDot,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  ArrowUpRight,
  Braces,
  CircleCheck,
  Database,
  ScanLine,
  TrendingUp,
} from "lucide-react";
import { useLocale } from "./LocaleProvider";
// Static weekly observations from the repository demo, explicitly distinguished from uploaded data.
const trend = [
  { x: "01-05", y: 38419 },
  { x: "01-26", y: 41916 },
  { x: "02-16", y: 42135 },
  { x: "03-09", y: 45923 },
  { x: "03-30", y: 43465 },
  { x: "04-20", y: 56674 },
  { x: "05-11", y: 56057 },
  { x: "05-25", y: 175867 },
  { x: "06-08", y: 51518 },
  { x: "06-29", y: 59925 },
];
const segments = [
  { label: "Organic", share: 34.3 },
  { label: "Email", share: 28.1 },
  { label: "Paid search", share: 23.9 },
  { label: "Social", share: 13.8 },
];
export default function WorkspacePreview() {
  const { t, number, locale } = useLocale();
  return (
    <section
      className="workspace-preview"
      aria-label={t("A first look at the signal")}
    >
      <div className="preview-header">
        <div>
          <span className="eyebrow">{t("02 / OUTPUT PREVIEW")}</span>
          <h2>{t("A first look at the signal")}</h2>
        </div>
        <span className="preview-label">{t("DEMO PREVIEW")}</span>
      </div>
      <div className="preview-kpis">
        <article className="panel">
          <span className="preview-kpi-label">
            <Database size={13} />
            {t("Records")}
          </span>
          <strong>
            728<span className="kpi-unit">{t("rows")}</span>
          </strong>
          <small>{t("6 metrics / 3 dimensions")}</small>
        </article>
        <article className="panel">
          <span className="preview-kpi-label">
            <TrendingUp size={13} />
            {t("Revenue")}
          </span>
          <strong>{number(1370830.75)}</strong>
          <small>{t("Total across the demo")}</small>
        </article>
        <article className="panel">
          <span className="preview-kpi-label">
            <CircleCheck size={13} />
            {t("Quality score")}
          </span>
          <strong>
            {number(99.5)}
            <span className="kpi-unit">/100</span>
          </strong>
          <small>{t("8 duplicate rows detected")}</small>
        </article>
      </div>
      <article className="panel preview-trend">
        <div className="preview-card-heading">
          <div>
            <span className="eyebrow">{t("TIME SERIES")}</span>
            <h3>{t("Revenue over time")}</h3>
          </div>
          <span className="muted">{t("Jan — Jun 2026")}</span>
        </div>
        <div
          className="preview-chart"
          role="img"
          aria-label={t("Revenue over time")}
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart
              data={trend}
              margin={{ top: 12, left: -5, right: 12, bottom: 0 }}
            >
              <defs>
                <linearGradient id="preview-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--accent)"
                    stopOpacity={0.17}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--accent)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 5" vertical={false} />
              <XAxis
                dataKey="x"
                axisLine={false}
                tickLine={false}
                minTickGap={22}
              />
              <YAxis
                width={70}
                tickFormatter={(v) =>
                  `${number(Math.round(v / 1000))}${locale === "ru" ? " тыс." : "k"}`
                }
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(v) => number(Number(v))} />
              <Area
                name={t("Revenue")}
                dataKey="y"
                type="linear"
                stroke="var(--accent)"
                strokeWidth={2}
                fill="url(#preview-fill)"
                isAnimationActive={false}
              />
              <ReferenceDot
                x="05-25"
                y={175867}
                r={4}
                fill="#dc735b"
                stroke="var(--panel)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="preview-chart-footer">
          <span>{t("Weekly aggregation")}</span>
          <span>
            <i />
            {t("Potential anomaly")}
          </span>
        </div>
      </article>
      <div className="preview-findings">
        <article className="panel preview-insight">
          <span className="eyebrow">
            <ScanLine size={13} />
            {t("An observation, not a guess")}
          </span>
          <h3>{t("An unusual revenue spike")}</h3>
          <p>
            {t(
              "One week crosses the rolling baseline and the 3 × IQR threshold. Worth a closer look.",
            )}
          </p>
          <span className="evidence-label">
            <Braces size={13} />
            {t("Grounded in evidence")}
            <ArrowUpRight size={13} />
          </span>
        </article>
        <article className="panel preview-segment">
          <span className="eyebrow">{t("SEGMENT BREAKDOWN")}</span>
          <h3>{t("Leads by channel")}</h3>
          {segments.map((s) => (
            <div className="segment-row" key={s.label}>
              <span>{s.label}</span>
              <div>
                <i style={{ width: `${(s.share / 34.3) * 100}%` }} />
              </div>
              <strong>{number(s.share)}%</strong>
            </div>
          ))}
          <small>{t("Share of the demo total")}</small>
        </article>
      </div>
      <article className="panel preview-table">
        <div className="preview-card-heading">
          <h3>{t("Detected structure")}</h3>
          <span className="chip">marketing.csv</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>{t("Field")}</th>
              <th>{t("Semantic type")}</th>
              <th>{t("Missing")}</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["date", "datetime", "0%"],
              ["channel", "categorical", "0%"],
              ["revenue", "numeric", "0%"],
            ].map(([field, type, missing]) => (
              <tr key={field}>
                <td>{field}</td>
                <td>
                  <span className="type-dot" />
                  {t(type)}
                </td>
                <td>{missing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
      <p className="preview-disclaimer">
        {t("Preview only · your analysis will use your uploaded data.")}
      </p>
    </section>
  );
}
