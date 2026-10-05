"use client";
import { useLocale } from "@/components/LocaleProvider";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Chart, Column, Query } from "@/lib/types";
import ChartCard from "./ChartCard";

export default function Explore({
  id,
  columns,
  query,
}: {
  id: string;
  columns: Column[];
  query: Query;
}) {
  const { t } = useLocale();
  const [type, setType] = useState("bar");
  const [x, setX] = useState(columns[0]?.name || "");
  const [y, setY] = useState("");
  const [aggregation, setAggregation] = useState("sum");
  const [group, setGroup] = useState("");
  const [charts, setCharts] = useState<Chart[]>([]);
  const [specs, setSpecs] = useState<
    {
      type: string;
      x: string;
      y: string | null;
      aggregation: string;
      group_by: string | null;
    }[]
  >([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all(
      specs.map((spec) =>
        api<Chart>(
          `/datasets/${id}/chart`,
          { ...query, ...spec },
          controller.signal,
        ),
      ),
    )
      .then((results) => {
        setCharts(results);
        setError("");
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setError(e.message);
          setCharts([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [id, query, specs]);
  function create() {
    setBusy(true);
    setError("");
    setSpecs((previous) => [
      ...previous,
      {
        type,
        x,
        y: y || null,
        aggregation,
        group_by: type === "scatter" ? group || null : null,
      },
    ]);
  }
  const options = columns.map((c) => <option key={c.name}>{c.name}</option>);
  return (
    <section id="explore" className="section">
      <div className="section-title">
        <div>
          <span className="eyebrow">{t("YOUR QUESTIONS, YOUR CHARTS")}</span>
          <h2>{t("Explore mode")}</h2>
        </div>
        <span className="muted">{t("Uses the global filters above")}</span>
      </div>
      <div className="panel explore-controls">
        <label>
          {t("Chart type")}
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {["bar", "line", "scatter", "histogram", "category"].map(
              (value) => (
                <option value={value} key={value}>
                  {t(value)}
                </option>
              ),
            )}
          </select>
        </label>
        <label>
          {t("X axis")}
          <select value={x} onChange={(e) => setX(e.target.value)}>
            {options}
          </select>
        </label>
        <label>
          {t("Y metric")}
          <select
            value={y}
            disabled={["category", "histogram"].includes(type)}
            onChange={(e) => setY(e.target.value)}
          >
            <option value="">{t("Choose metric")}</option>
            {options}
          </select>
        </label>
        <label>
          {t("Aggregation")}
          <select
            value={aggregation}
            disabled={["scatter", "category", "histogram"].includes(type)}
            onChange={(e) => setAggregation(e.target.value)}
          >
            {["sum", "mean", "median", "count", "min", "max"].map((value) => (
              <option value={value} key={value}>
                {t(value)}
              </option>
            ))}
          </select>
        </label>
        {type === "scatter" && (
          <label>
            {t("Group by")}
            <select value={group} onChange={(e) => setGroup(e.target.value)}>
              <option value="">{t("None")}</option>
              {options}
            </select>
          </label>
        )}
        <button
          className="button primary"
          disabled={busy || specs.length >= 8}
          onClick={create}
        >
          {t(busy ? "Building…" : "Create chart +")}
        </button>
      </div>
      <p className="chart-note">
        {t(
          "Bars group by X. Lines require a date X; scatter plots require numeric X and Y. Up to 8 custom charts.",
        )}
      </p>
      {error && (
        <p className="error" role="alert">
          {t(error)}{" "}
          <button
            className="text-button"
            onClick={() => setSpecs(specs.slice(0, -1))}
          >
            {t("Remove last chart request")}
          </button>
        </p>
      )}
      <div className="chart-grid">
        {charts.map((c, i) => (
          <div key={i}>
            <button
              className="text-button remove-chart"
              onClick={() => setSpecs(specs.filter((_, index) => i !== index))}
            >
              {t("Remove ×")}
            </button>
            <ChartCard chart={c} />
          </div>
        ))}
      </div>
    </section>
  );
}
