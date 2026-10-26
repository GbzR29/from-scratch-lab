"use client";

// ── Learn top bar ────────────────────────────────────────────────────────────
// The sticky bar over lessons and reference pages: the mark, the page's path
// (breadcrumbs), the search box, the language switch and the theme toggle. Its height is
// --nav-h (src/styles/learn.css); the rails and pinned figures sit below it.
// On phones only the mark, the page title, search and ☰ remain; the sheet
// (components/nav/SiteMenu) holds the way back up the path, the site links,
// theme and languages. Styles: .lc-bar in src/styles/lessonChrome.css.

import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { SiteMenu } from "@/components/nav/SiteMenu";
import { SiteSearch } from "@/components/nav/SiteSearch";
import { BRAND, LANGUAGES } from "@/components/nav/siteLinks";
import { Mark } from "@/components/brand/Mark";
import { ThemeIcon, themeLabel as plain } from "@/components/brand/ThemeIcon";
import { useUrlLang } from "@/lib/i18n/useUrlLang";
import { homeHref } from "@/lib/tracks/urls";

export interface Crumb {
  label: string;
  href?: string;
}

export function LearnTopBar({ crumbs = [] }: { crumbs?: Crumb[] }) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const urlLang = useUrlLang();
  const themeLabel = plain(theme === "dark" ? t.navLight : t.navDark);

  return (
    <header className="lc-bar">
      <div className="lc-bar-in">
        <Link href={homeHref(urlLang)} className="lc-brand" aria-label={BRAND}>
          <Mark size={34} />
          <span className="lc-brand-name" aria-hidden="true">From Scratch<br />Lab</span>
        </Link>

        <nav aria-label="Breadcrumb" className="lc-crumbs">
          <ol>
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              return (
                <li key={i}>
                  {c.href && !last
                    ? <Link href={c.href}>{c.label}</Link>
                    : <span aria-current={last ? "page" : undefined}>{c.label}</span>}
                  {!last && <span aria-hidden="true" style={{ opacity: 0.5 }}>/</span>}
                </li>
              );
            })}
          </ol>
        </nav>

        <SiteSearch className="flex-shrink-0" wide />
        <SiteMenu crumbs={crumbs} className="md:!hidden flex-shrink-0" />

        <div className="lc-tools">
          <div className="lc-langs" role="group" aria-label={t.navLanguage}>
            {LANGUAGES.map((code) => (
              <button key={code} type="button" lang={code} aria-pressed={language === code} onClick={() => setLanguage(code)}>
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          <button type="button" className="lc-iconbtn" onClick={toggleTheme} aria-label={themeLabel} title={themeLabel}>
            <ThemeIcon dark={theme === "dark"} size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
