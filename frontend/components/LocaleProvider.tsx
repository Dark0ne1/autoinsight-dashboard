"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { formatNumber, translate, type Locale } from "@/lib/i18n";
const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
}>({ locale: "en", setLocale: () => {} });
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}
export function useLocale() {
  const c = useContext(LocaleContext);
  return {
    ...c,
    t: (text: string, params?: Record<string, string | number>) =>
      translate(text, c.locale, params),
    number: (value: number | null | undefined) => formatNumber(value, c.locale),
  };
}
export function LanguageSwitch() {
  const { locale, setLocale } = useLocale();
  return (
    <div
      className="language-switch"
      role="group"
      aria-label={locale === "ru" ? "Язык интерфейса" : "Interface language"}
    >
      {(["en", "ru"] as const).map((language) => (
        <button
          key={language}
          type="button"
          aria-pressed={locale === language}
          aria-label={language === "en" ? "English" : "Русский"}
          onClick={() => setLocale(language)}
        >
          {language.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
