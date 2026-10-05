"use client";
import { useLocale } from "@/components/LocaleProvider";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { Column, Filter } from "@/lib/types";
import { isMetric } from "@/lib/types";

export default function Filters({
  columns,
  filters,
  onChange,
  busy,
}: {
  columns: Column[];
  filters: Filter[];
  onChange: (f: Filter[]) => void;
  busy: boolean;
}) {
  const { t } = useLocale();
  const [field, setField] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [value, setValue] = useState("");
  const column = columns.find((c) => c.name === field);
  const kind =
    column?.semantic_type === "datetime"
      ? "date"
      : column && isMetric(column)
        ? "numeric"
        : "categorical";
  function add() {
    if (!column) return;
    const item: Filter =
      kind === "categorical"
        ? { column: field, kind, values: [value] }
        : { column: field, kind, min, max };
    onChange([...filters.filter((f) => f.column !== field), item]);
  }
  return (
    <div className="filter-bar panel">
      <span className="filter-title">
        <SlidersHorizontal size={14} /> <strong>{t("Global filters")}</strong>
      </span>
      <select
        aria-label={t("Filter column")}
        value={field}
        disabled={busy}
        onChange={(e) => {
          setField(e.target.value);
          setValue("");
          setMin("");
          setMax("");
        }}
      >
        <option value="">{t("Choose field")}</option>
        {columns.map((c) => (
          <option key={c.name}>{c.name}</option>
        ))}
      </select>
      {column &&
        (kind === "categorical" ? (
          <>
            <input
              aria-label={t("Category filter value")}
              list="filter-values"
              placeholder={t("Exact category value")}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <datalist id="filter-values">
              {column.top_values?.map((v) => (
                <option key={v.value} value={v.value} />
              ))}
            </datalist>
          </>
        ) : (
          <>
            <input
              aria-label={t("Filter minimum")}
              type={kind === "date" ? "date" : "number"}
              placeholder={t("Min")}
              value={min}
              onChange={(e) => setMin(e.target.value)}
            />
            <span>{t("to")}</span>
            <input
              aria-label={t("Filter maximum")}
              type={kind === "date" ? "date" : "number"}
              placeholder={t("Max")}
              value={max}
              onChange={(e) => setMax(e.target.value)}
            />
          </>
        ))}
      {column && (
        <button
          className="button small"
          disabled={busy || (kind === "categorical" ? !value : !min && !max)}
          onClick={add}
        >
          {t("Apply")}
        </button>
      )}
      {column?.semantic_type === "percentage" && (
        <span className="muted">{t("Fraction bounds: 0.1 = 10%")}</span>
      )}
      {filters.map((f) => (
        <button
          className="filter-chip"
          key={f.column}
          disabled={busy}
          onClick={() => onChange(filters.filter((x) => x !== f))}
          aria-label={t("Remove {column} filter", { column: f.column })}
        >
          {f.column}:{" "}
          {f.values?.join(", ") || `${f.min || "…"} – ${f.max || "…"}`} ×
        </button>
      ))}
      {!!filters.length && (
        <button
          className="text-button"
          disabled={busy}
          onClick={() => onChange([])}
        >
          {t("Clear all")}
        </button>
      )}
    </div>
  );
}
