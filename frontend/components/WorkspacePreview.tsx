"use client";
import Image from "next/image";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import { ShieldCheck, TrendingUp } from "lucide-react";
import { useLocale } from "./LocaleProvider";

// Illustrative onboarding values, not analysis of an uploaded dataset.
const trend = [18, 30, 23, 43, 31, 51, 44, 58, 61].map((value, index) => ({
  week: index + 1,
  value,
}));
const segments = [
  { name: "Product", value: 42, color: "#007c70" },
  { name: "Marketing", value: 28, color: "#22a58f" },
  { name: "Operations", value: 18, color: "#7bcebd" },
  { name: "Other", value: 12, color: "#d6e9e4" },
];

export default function WorkspacePreview() {
  const { t, number } = useLocale();
  return (
    <figure
      className="hero-preview"
      aria-label={t("Illustrative analytics preview")}
    >
      <Image
        className="hero-backdrop"
        src="/hero/analytics-backdrop.png"
        width={900}
        height={450}
        alt=""
        aria-hidden="true"
        preload
      />
      <div className="hero-chart-card" aria-hidden="true">
        <div className="hero-chart-heading">
          {t("Trends")}
          <span>+32%</span>
        </div>
        <div className="hero-line-chart">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart
              data={trend}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#d9eae5"
                strokeDasharray="3 5"
              />
              <XAxis
                dataKey="week"
                tick={false}
                axisLine={false}
                tickLine={false}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#008d79"
                strokeWidth={2.5}
                fill="#c8ebe2"
                fillOpacity={0.55}
                dot={{ r: 3.5, fill: "var(--hero-panel)", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="hero-floating-trend hero-floating-card">
        <span className="hero-stat-icon">
          <TrendingUp size={25} />
        </span>
        <div>
          <h3>{t("Trends")}</h3>
          <strong>+32%</strong>
          <small>{t("vs. previous period")}</small>
        </div>
      </div>
      <div className="hero-floating-quality hero-floating-card">
        <ShieldCheck size={27} />
        <div>
          <h3>{t("Data quality")}</h3>
          <strong>98%</strong>
          <small>{t("Valid rows")}</small>
          <progress value={98} max={100} aria-label={t("Valid rows")} />
        </div>
      </div>
      <div className="hero-floating-segments hero-floating-card">
        <h3>{t("Segments")}</h3>
        <div className="hero-segment-content">
          <div className="hero-donut" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={segments}
                  dataKey="value"
                  innerRadius="58%"
                  outerRadius="92%"
                  stroke="none"
                  isAnimationActive={false}
                >
                  {segments.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul>
            {segments.map((s) => (
              <li key={s.name}>
                <span
                  className="hero-legend-dot"
                  style={{ backgroundColor: s.color }}
                />
                {t(s.name)}
                <b>{number(s.value)}%</b>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <figcaption>
        {t("Illustrative preview · upload a file for your own results.")}
      </figcaption>
    </figure>
  );
}
