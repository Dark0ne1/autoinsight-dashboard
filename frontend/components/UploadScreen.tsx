"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ChartNoAxesColumnIncreasing,
  CloudUpload,
  Database,
  LoaderCircle,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { useLocale } from "./LocaleProvider";
import WorkspacePreview from "./WorkspacePreview";

const features = [
  {
    icon: ChartNoAxesColumnIncreasing,
    title: "Key insights",
    text: "Find what’s important in your data, automatically.",
  },
  {
    icon: TrendingUp,
    title: "Trends",
    text: "Spot patterns and changes over time.",
  },
  {
    icon: Users,
    title: "Segments",
    text: "Understand what drives different groups.",
  },
  {
    icon: Database,
    title: "Data quality",
    text: "Catch issues before they impact your analysis.",
  },
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
    <div className="hero-onboarding">
      <section className="hero-intro" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="hero-eyebrow">
            <span className="status-dot" />
            {t("YOUR NEXT INSIGHT STARTS HERE")}
          </span>
          <h1 id="hero-title">
            <span>{t("From spreadsheet")}</span>
            <span>
              {t("to ")}
              <em>{t("deeper insights.")}</em>
            </span>
          </h1>
          <p>
            {t("Turn any spreadsheet into an analytical dashboard.")}
            <br />
            {t(
              "Get instant insights on metrics, dimensions, trends and data quality — automatically.",
            )}
          </p>
        </div>
        <WorkspacePreview />
      </section>
      <section
        className={`hero-upload-zone ${dragging ? "dragging" : ""}`}
        aria-label={t("Connect a dataset")}
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
          if (!busy && e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]);
        }}
      >
        <Image
          className="hero-files"
          src="/hero/spreadsheet-files.png"
          width={250}
          height={250}
          alt=""
          aria-hidden="true"
        />
        <div className="hero-upload-content">
          <div className="hero-upload-icon">
            {busy ? (
              <LoaderCircle className="spin" size={34} />
            ) : (
              <CloudUpload size={34} strokeWidth={1.6} />
            )}
          </div>
          <h2 aria-live="polite">
            {t(busy ? "Reading your data…" : "Drop your spreadsheet here")}
          </h2>
          <p>
            {t(
              busy
                ? "Profiling columns and looking for signal."
                : "CSV or Excel · up to 100 MB · choose any worksheet",
            )}
          </p>
          <button
            className="button hero-primary"
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            {busy ? (
              <LoaderCircle className="spin" size={18} />
            ) : (
              <CloudUpload size={18} />
            )}
            {t(busy ? "Reading your data…" : "Choose a file")}
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
        </div>
      </section>
      <div className="hero-feature-label">{t("HERE’S WHAT YOU’LL GET")}</div>
      <div className="hero-features">
        {features.map((feature) => (
          <article key={feature.title} className="hero-feature">
            <span className="hero-feature-icon">
              <feature.icon size={26} strokeWidth={1.7} />
            </span>
            <div>
              <h3>{t(feature.title)}</h3>
              <p>{t(feature.text)}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="hero-bottom">
        <span>
          <ShieldCheck size={14} />
          {t("Uploads stay in this local session and expire after one hour.")}
        </span>
        <button className="hero-demo" disabled={busy} onClick={onDemo}>
          {t("Use demo dataset")}
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
