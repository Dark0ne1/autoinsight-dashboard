"use client";
import { useLocale } from "@/components/LocaleProvider";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartTitle } from "@/lib/i18n";
import type { Chart } from "@/lib/types";

const palette = ["#4567df", "#7885aa", "#b28c58", "#dc735b", "#5e8f92"];

export default function ChartCard({ chart }: { chart: Chart }) {
  const { t, locale, number } = useLocale();
  const horizontal = chart.type === "category" || chart.type === "bar";
  const groups = [...new Set(chart.data.map((p) => p.group || "All"))].slice(
    0,
    10,
  );
  return (
    <article className="panel chart-card">
      <div className="chart-heading">
        <div>
          <span className="eyebrow">
            {t(
              chart.type === "line"
                ? "TIME SERIES"
                : chart.type === "scatter"
                  ? "RELATIONSHIP"
                  : chart.type === "histogram"
                    ? "DISTRIBUTION"
                    : "SEGMENT BREAKDOWN",
            )}
          </span>
          <h3>{chartTitle(chart, locale)}</h3>
        </div>
        <span className="chip">
          {t(chart.aggregation)}
          {chart.frequency ? ` / ${t(chart.frequency)}` : ""}
        </span>
      </div>
      <div
        className="chart-area"
        role="img"
        aria-label={chartTitle(chart, locale)}
      >
        {!chart.data.length ? (
          <div className="empty-inline">
            {t("No observations match the current filters.")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            {chart.type === "line" ? (
              <ComposedChart
                data={chart.data}
                margin={{ top: 10, right: 15, bottom: 5, left: 0 }}
              >
                <defs>
                  <linearGradient
                    id={`gradient-${chart.x}-${chart.y}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--accent)"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--accent)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 5" vertical={false} />
                <XAxis
                  dataKey="x"
                  tickFormatter={(x) => String(x).slice(5, 10)}
                  minTickGap={35}
                />
                <YAxis tickFormatter={number} width={55} />
                <Tooltip labelFormatter={(x) => String(x).slice(0, 10)} />
                <Area
                  dataKey="y"
                  name={chart.y || t("Value")}
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fill={`url(#gradient-${chart.x}-${chart.y})`}
                  isAnimationActive={false}
                />
                <Line
                  dataKey="rolling"
                  name={t("7-bucket average")}
                  stroke="#929bbb"
                  strokeDasharray="4 4"
                  dot={false}
                  strokeWidth={1.5}
                  isAnimationActive={false}
                />
                {chart.data
                  .filter((p) => p.anomaly)
                  .map((p, i) => (
                    <ReferenceDot
                      key={i}
                      x={p.x}
                      y={p.y ?? 0}
                      r={5}
                      fill="#dc675b"
                      stroke="var(--panel)"
                    />
                  ))}
              </ComposedChart>
            ) : chart.type === "scatter" ? (
              <ScatterChart
                margin={{ top: 10, right: 15, bottom: 10, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 5" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name={chart.x}
                  tickFormatter={number}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name={chart.y || t("Value")}
                  tickFormatter={number}
                  width={55}
                />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                {groups.map((group, i) => (
                  <Scatter
                    key={group}
                    name={
                      chart.data.some((p) => p.group === group)
                        ? group
                        : t("All")
                    }
                    data={chart.data.filter(
                      (p) => (p.group || "All") === group,
                    )}
                    fill={palette[i % palette.length]}
                    fillOpacity={0.55}
                    isAnimationActive={false}
                  />
                ))}
              </ScatterChart>
            ) : (
              <BarChart
                data={chart.data}
                layout={horizontal ? "vertical" : "horizontal"}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 5"
                  horizontal={!horizontal}
                  vertical={horizontal}
                />
                <XAxis
                  type={horizontal ? "number" : "category"}
                  dataKey={horizontal ? undefined : "x"}
                  tickFormatter={horizontal ? number : undefined}
                  tick={horizontal ? undefined : false}
                />
                <YAxis
                  type={horizontal ? "category" : "number"}
                  dataKey={horizontal ? "x" : undefined}
                  width={horizontal ? 100 : 55}
                  tickFormatter={
                    horizontal ? (v) => String(v).slice(0, 16) : number
                  }
                />
                <Tooltip />
                <Bar
                  dataKey="y"
                  name={chart.y || t("Records")}
                  fill="var(--accent)"
                  radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                  maxBarSize={28}
                  isAnimationActive={false}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
      <p className="chart-note">
        {chart.type === "line"
          ? t(
              "Dashed line: 7-bucket average · Coral points: potential anomalies",
            )
          : chart.type === "scatter"
            ? `${t("Correlation does not imply causation.")} ${chart.sampled ? t("Display limited to 1,000 sampled points.") : ""}`
            : horizontal
              ? t("Top 12 groups · Null categories excluded")
              : t("Adaptive bins · Missing values excluded")}
      </p>
      <details className="chart-data">
        <summary>{t("View chart data")}</summary>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{chart.x}</th>
                <th>{chart.y || t("Records")}</th>
              </tr>
            </thead>
            <tbody>
              {chart.data.map((p, i) => (
                <tr key={i}>
                  <td>{String(p.x)}</td>
                  <td>{number(p.y)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </article>
  );
}
