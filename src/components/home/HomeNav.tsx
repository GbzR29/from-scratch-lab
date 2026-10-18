"use client";

// ── Home navigation ─────────────────────────────────────────────────────────
// The bar on top of the home page (the track list) and the 404: the mark and
// name, the main links, the language switch, the theme toggle and the Ko-fi
// link. On phones the links and tools move into the ☰ sheet
// (components/nav/SiteMenu). Styles: .hm-nav in home.css.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { SiteMenu } from "@/components/nav/SiteMenu";
import { BRAND, LANGUAGES, useSiteLinks } from "@/components/nav/siteLinks";
import { LINKS } from "@/components/nav/links";
import { Mark } from "@/components/brand/Mark";
import { ThemeIcon, themeLabel as plain } from "@/components/brand/ThemeIcon";
import { useUrlLang } from "@/lib/i18n/useUrlLang";
import { homeHref } from "@/lib/tracks/urls";

type Strings = Record<string, string | undefined>;

export default function HomeNav() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const ui = t as unknown as Strings;
  const pathname = usePathname();
  const links = useSiteLinks();
  const urlLang = useUrlLang();
  const themeLabel = plain(theme === "dark" ? t.navLight : t.navDark);

  return (
    <header className="hm-navbar">
      <nav className="hm-nav hm-in" aria-label="Primary">
        <Link className="hm-brand" href={homeHref(urlLang)} aria-label={BRAND}>
          <Mark size={40} />
          <span className="hm-brand-name" aria-hidden="true">
            From Scratch
            <br />
            Lab
          </span>
        </Link>
        <div className="hm-links">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined}>
              {l.label.charAt(0).toUpperCase() + l.label.slice(1)}
            </Link>
          ))}
        </div>
        <div className="hm-tools">
          <div className="hm-langs" role="group" aria-label={t.navLanguage}>
            {LANGUAGES.map((code) => (
              <button key={code} type="button" lang={code} aria-pressed={language === code} onClick={() => setLanguage(code)}>
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          <button type="button" className="hm-iconbtn" onClick={toggleTheme} aria-label={themeLabel} title={themeLabel}>
            <ThemeIcon dark={theme === "dark"} />
          </button>
          <a className="hm-support" href={LINKS.kofi} target="_blank" rel="noopener noreferrer">
            {ui.homeSupport ?? "Support"}
          </a>
        </div>
        <SiteMenu className="hm-menu" />
      </nav>
    </header>
  );
}
