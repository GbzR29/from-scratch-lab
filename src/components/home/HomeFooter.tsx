"use client";

// ── Footer ──────────────────────────────────────────────────────────────────

import { useLanguage } from "@/components/providers/LanguageProvider";
import { CoffeeCup } from "@/components/nav/CoffeeCup";
import { LINKS } from "@/components/nav/links";

export default function HomeFooter() {
  const { t } = useLanguage();

  return (
    <footer className="hm-foot">
      <span>
        fromscratchlab.com · {new Date().getFullYear()} · {t.footBy}{" "}
        <a href={LINKS.author}>Gabriel Carvalho</a>
      </span>
      <nav aria-label="Links">
        <a href={LINKS.github} target="_blank" rel="noopener noreferrer">github</a>
        <a href={LINKS.kofi} target="_blank" rel="noopener noreferrer" className="hm-kofi">
          <CoffeeCup size={13} />
          {t.footCoffee}
        </a>
      </nav>
    </footer>
  );
}
