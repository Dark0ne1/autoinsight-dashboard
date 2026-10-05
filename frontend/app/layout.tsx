import type { Metadata } from "next";
import "./globals.css";
import "@fontsource-variable/manrope";
import "@fontsource/ibm-plex-mono/400.css";
import { LocaleProvider } from "@/components/LocaleProvider";

export const metadata: Metadata = {
  title: "AutoInsight — from spreadsheet to clarity",
  description:
    "Schema-agnostic analytics. Explore trends, segments and evidence-based insights from any CSV or Excel file.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
