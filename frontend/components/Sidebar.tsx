"use client";
import {
  ArrowUpRight,
  ChartNoAxesCombined,
  ChartColumn,
  CircleDot,
  Columns3,
  FileSpreadsheet,
  FlaskConical,
  LayoutDashboard,
  Moon,
  Plus,
  ScanLine,
  ShieldCheck,
  Sun,
  Waves,
} from "lucide-react";
import { useLocale } from "./LocaleProvider";
const sections = [
  { id: "overview", icon: LayoutDashboard, label: "Overview" },
  { id: "insights", icon: ScanLine, label: "Key insights" },
  { id: "trends", icon: Waves, label: "Trends" },
  { id: "segments", icon: ChartColumn, label: "Segments" },
  { id: "relationships", icon: ChartNoAxesCombined, label: "Relationships" },
  { id: "quality", icon: ShieldCheck, label: "Data quality" },
  { id: "explore", icon: FlaskConical, label: "Explore" },
  { id: "raw-data", icon: Columns3, label: "Raw data" },
];
export default function Sidebar({
  hasData,
  count,
  active,
  onNavigate,
  dark,
  onThemeToggle,
  onReset,
  busy,
  filename,
}: {
  hasData: boolean;
  count: number;
  active: string;
  onNavigate: (id: string) => void;
  dark: boolean;
  onThemeToggle: () => void;
  onReset: () => void;
  busy: boolean;
  filename?: string;
}) {
  const { t } = useLocale();
  return (
    <aside className="sidebar">
      <button
        className="sidebar-new"
        aria-label={t("New analysis")}
        disabled={busy}
        onClick={onReset}
      >
        <Plus size={16} />
        <span>{t("New analysis")}</span>
        <ArrowUpRight size={13} />
      </button>
      <div className="dataset-status">
        <FileSpreadsheet size={14} />
        <span title={filename}>{filename || t("No dataset connected")}</span>
        <CircleDot size={10} />
      </div>
      <div className="workspace-label">{t("ANALYSIS")}</div>
      <nav aria-label={t("Dashboard sections")}>
        {sections.map((section, index) => (
          <div className="nav-item" key={section.id}>
            {index === 6 && (
              <div className="workspace-label secondary">{t("DATA")}</div>
            )}
            <a
              href={hasData ? `#${section.id}` : "#"}
              aria-label={t(section.label)}
              aria-disabled={!hasData}
              aria-current={
                hasData && active === section.id ? "location" : undefined
              }
              title={t(section.label)}
              onClick={(e) => {
                if (!hasData) e.preventDefault();
                else onNavigate(section.id);
              }}
              className={`${hasData && active === section.id ? "active" : ""} ${!hasData ? "inactive" : ""}`}
            >
              <section.icon size={17} />
              <span>{t(section.label)}</span>
              {section.id === "insights" && hasData && (
                <span className="nav-count">{count}</span>
              )}
            </a>
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button
          className="theme-toggle"
          aria-label={t(dark ? "Switch to light mode" : "Switch to dark mode")}
          title={t(dark ? "Switch to light mode" : "Switch to dark mode")}
          onClick={onThemeToggle}
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
          <span>{t(dark ? "Light appearance" : "Dark appearance")}</span>
          <span className={`theme-switch ${dark ? "on" : ""}`} />
        </button>
        <div className="sidebar-credit">
          {t("OPEN SOURCE")}
          <span>v1.0</span>
        </div>
      </div>
    </aside>
  );
}
