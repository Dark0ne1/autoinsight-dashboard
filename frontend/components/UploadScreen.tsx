"use client";
import { useRef, useState } from "react";
import {
  ArrowRight,
  FileSpreadsheet,
  Upload,
  ShieldCheck,
  Columns3,
  ScanLine,
  Activity,
  LoaderCircle,
} from "lucide-react";
import { useLocale } from "./LocaleProvider";
import WorkspacePreview from "./WorkspacePreview";
const steps = [
  { icon: Columns3, label: "Infer structure" },
  { icon: ScanLine, label: "Check quality" },
  { icon: Activity, label: "Surface findings" },
];
export default function UploadScreen({
  onFile,
  onDemo,
  busy,
}: {
  onFile: (file: File) => void;
  onDemo: () => void;
  busy: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { t } = useLocale();
  return (
    <div className="onboarding workspace-empty">
      <header className="workspace-intro">
        <div>
          <span className="eyebrow">{t("ANALYSIS / 001")}</span>
          <h1>{t("Start with the data.")}</h1>
          <p>
            {t(
              "Bring a table. We’ll find the structure, the patterns, and the questions worth asking.",
            )}
          </p>
        </div>
        <span className="workspace-state">
          <span className="status-dot" />
          {t("New workspace")}
        </span>
      </header>
      <div className="workspace-composition">
        <section
          className="input-panel panel"
          aria-label={t("Connect a dataset")}
        >
          <div className="input-heading">
            <span className="eyebrow">{t("01 / INPUT")}</span>
            <span className="input-index">
              <FileSpreadsheet size={15} />
              {t("Any schema")}
            </span>
          </div>
          <h2>{t("Connect a dataset")}</h2>
          <div
            className={`upload-zone ${dragging ? "dragging" : ""} ${busy ? "processing" : ""}`}
            aria-busy={busy}
            onDragOver={(e) => {
              e.preventDefault();
              if (!busy) setDragging(true);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null))
                setDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (!busy && e.dataTransfer.files[0])
                onFile(e.dataTransfer.files[0]);
            }}
          >
            <div className="upload-icon">
              {busy ? (
                <LoaderCircle className="spin" size={27} />
              ) : (
                <Upload size={27} strokeWidth={1.5} />
              )}
            </div>
            <h3 aria-live="polite">
              {t(busy ? "Reading your data…" : "Drop a spreadsheet here")}
            </h3>
            <p>
              {t(
                busy
                  ? "Profiling columns and looking for signal."
                  : "or choose a file from your computer",
              )}
            </p>
            <button
              className="button primary"
              disabled={busy}
              onClick={() => input.current?.click()}
            >
              {t(busy ? "Reading your data…" : "Choose a file")}
              <ArrowRight size={15} />
            </button>
            <input
              ref={input}
              className="sr-only"
              aria-label={t("Upload spreadsheet")}
              type="file"
              accept=".csv,.xlsx"
              disabled={busy}
              onChange={(e) => {
                if (e.target.files?.[0]) onFile(e.target.files[0]);
                e.target.value = "";
              }}
            />
            <div className="upload-constraints">
              <span>{t("CSV / XLSX")}</span>
              <span>{t("Up to 100 MB")}</span>
            </div>
          </div>
          <div className="analysis-steps">
            <span className="eyebrow">{t("Your next step")}</span>
            {steps.map((step, index) => (
              <div key={step.label}>
                <step.icon size={15} />
                <span>{t(step.label)}</span>
                <span className="step-index">0{index + 1}</span>
              </div>
            ))}
            <p>{t("No prescribed columns. No setup required.")}</p>
          </div>
          <div className="demo-prompt">
            <div>
              <span>{t("Want to see it in action?")}</span>
              <small>{t("marketing.csv · 728 records · synthetic data")}</small>
            </div>
            <button
              className="button demo-button"
              disabled={busy}
              onClick={onDemo}
            >
              {t("Use demo dataset")}
              <ArrowRight size={15} />
            </button>
          </div>
          <div className="privacy-note">
            <ShieldCheck size={14} />
            <span>
              {t(
                "Uploads stay in this local session and expire after one hour.",
              )}
            </span>
          </div>
        </section>
        <WorkspacePreview />
      </div>
    </div>
  );
}
