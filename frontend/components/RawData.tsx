"use client";
import { useLocale } from "@/components/LocaleProvider";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Query } from "@/lib/types";

type Rows = {
  total: number;
  columns: string[];
  rows: Record<string, unknown>[];
};

export default function RawData({ id, query }: { id: string; query: Query }) {
  const { t, number } = useLocale();
  const [data, setData] = useState<Rows | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [descending, setDescending] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      api<Rows>(
        `/datasets/${id}/rows`,
        { ...query, page, search, sort: sort || null, descending },
        controller.signal,
      )
        .then((result) => {
          setData(result);
          setError("");
        })
        .catch((e) => {
          if (e.name !== "AbortError") setError(e.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [id, query, page, search, sort, descending]);
  return (
    <section id="raw-data" className="section">
      <div className="section-title">
        <div>
          <span className="eyebrow">{t("LOOK CLOSER")}</span>
          <h2>{t("Raw data explorer")}</h2>
        </div>
        <input
          aria-label={t("Search records")}
          type="search"
          placeholder={t("Search all fields…")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>
      <div className="panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {data?.columns.map((c) => (
                  <th key={c}>
                    <button
                      onClick={() => {
                        setSort(c);
                        setDescending(sort === c ? !descending : false);
                        setPage(1);
                      }}
                    >
                      {c} {sort === c ? (descending ? "↓" : "↑") : "↕"}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.rows.map((row, i) => (
                <tr key={i}>
                  {data.columns.map((c) => (
                    <td key={c} title={String(row[c] ?? "")}>
                      <span className="cell">
                        {row[c] == null ? (
                          <span className="null-value">{t("null")}</span>
                        ) : (
                          String(row[c])
                        )}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && (
          <p className="error" role="alert">
            {t(error)}
          </p>
        )}
        {!loading && !data?.rows.length && (
          <p className="empty-inline">{t("No matching records.")}</p>
        )}
        <div className="pagination">
          <span>
            {loading
              ? t("Loading…")
              : t("{total} records · Page {page} of {pages}", {
                  total: number(data?.total || 0),
                  page,
                  pages: Math.max(1, Math.ceil((data?.total || 0) / 20)),
                })}
          </span>
          <div>
            <button
              className="button small"
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
            >
              {t("← Previous")}
            </button>
            <button
              className="button small"
              disabled={page * 20 >= (data?.total || 0) || loading}
              onClick={() => setPage(page + 1)}
            >
              {t("Next →")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
