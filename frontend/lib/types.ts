export type Point = {
  x: string | number;
  y: number | null;
  rolling?: number | null;
  anomaly?: boolean;
  group?: string;
  count?: number;
  share?: number | null;
};
export type Chart = {
  type: "line" | "bar" | "scatter" | "histogram" | "category";
  x: string;
  y: string | null;
  title: string;
  aggregation: string;
  importance?: number;
  frequency?: string;
  data: Point[];
  sampled?: boolean;
};
export type Column = {
  name: string;
  dtype: string;
  semantic_type: string;
  flags: string[];
  missing_rate: number;
  unique: number;
  cardinality_ratio: number;
  long_tail_share?: number;
  stats?: Record<string, number | null>;
  top_values?: { value: string; count: number; share: number }[];
};
export type Insight = {
  type: string;
  importance: number;
  title: string;
  description: string;
  evidence: Record<string, unknown>;
};
export type Filter = {
  column: string;
  kind: "categorical" | "numeric" | "date";
  values?: string[];
  min?: string;
  max?: string;
};
export type Query = { sheet?: string; date_column?: string; filters: Filter[] };
export type Upload = {
  id: string;
  filename: string;
  size: number;
  sheets: string[];
};
export type Report = {
  filename: string;
  file_size: number;
  sheet: string | null;
  summary: string;
  primary_date: string | null;
  overview: {
    rows: number;
    columns: number;
    numeric: number;
    categorical: number;
    datetime: number;
    memory_bytes: number;
    date_range: string[] | null;
  };
  columns: Column[];
  charts: Chart[];
  insights: Insight[];
  kpis: {
    column: string;
    value: number | null;
    aggregation: string;
    semantic_type: string;
  }[];
  quality: {
    score: number;
    missing_cells: number;
    missing_rate: number;
    duplicates: number;
    issues: { column: string | null; kind: string; message: string }[];
    penalties: Record<string, number>;
  };
  correlations: {
    x: string;
    y: string;
    pearson: number;
    spearman: number;
    count: number;
  }[];
  analysis_scope: {
    correlation_sampled: boolean;
    correlation_rows: number;
    notes: string;
  };
};
export const isMetric = (c: Column) =>
  ["numeric", "percentage", "currency-like"].includes(c.semantic_type);
