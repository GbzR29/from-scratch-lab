"use client";

// ── Footer ──────────────────────────────────────────────────────────────────
// Drawn as the title block of a technical drawing: mark, project, author,
// links and revision. Styles: .hm-foot in home.css.

import { useLanguage } from "@/components/providers/LanguageProvider";
import { CoffeeCup } from "@/components/nav/CoffeeCup";
import { LINKS } from "@/components/nav/links";
import { BRAND } from "@/components/nav/siteLinks";
import { Mark } from "@/components/brand/Mark";

type Strings = Record<string, string | undefined>;

export default function HomeFooter() {
  const { t } = useLanguage();
  const ui = t as unknown as Strings;

  return (
    <footer className="hm-foot hm-in">
      <div className="hm-foot-block">
        <div><Mark size={44} /></div>
        <div>
          <small>{ui.footProject ?? "project"}</small>
          <span>{BRAND}</span>
        </div>
        <div>
          <small>{ui.footAuthor ?? "author"}</small>
          <a href={LINKS.author}>Gabriel Carvalho</a>
        </div>
        <div>
          <small>{ui.footSources ?? "links"}</small>
          <span>
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            {" · "}
            <a href={LINKS.kofi} target="_blank" rel="noopener noreferrer" className="hm-kofi">
              <CoffeeCup size={13} />
              {t.footCoffee}
            </a>
          </span>
        </div>
        <div>
          <small>{ui.footRevision ?? "revision"}</small>
          <span>fromscratchlab.com · {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
