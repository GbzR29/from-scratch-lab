// app/not-found.tsx
// Any address that is not a track, a lesson or a reference page (the track
// routes sit at the root, so a typo lands here). Same look as the home page.
"use client";

import "@/styles/home.css";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import HomeNav from "@/components/home/HomeNav";
import HomeFooter from "@/components/home/HomeFooter";
import { useUrlLang } from "@/lib/i18n/useUrlLang";
import { homeHref } from "@/lib/tracks/urls";

type Strings = Record<string, string | undefined>;

export default function NotFound() {
  const { t } = useLanguage();
  const ui = t as unknown as Strings;
  const urlLang = useUrlLang();

  return (
    <div className="home">
      <header className="hm-hero-wrap">
        <div className="hm-in">
          <HomeNav />
          <div className="hm-hero">
            <div className="hm-eyebrow">{ui.notFoundEyebrow ?? "404 · page not found"}</div>
            <h1>{ui.notFoundTitle ?? "Nothing here"}</h1>
            <p className="hm-lead">{ui.notFoundBody}</p>
            <div className="hm-resume">
              <Link href={homeHref(urlLang)}>{ui.notFoundBack ?? "See every track →"}</Link>
            </div>
          </div>
        </div>
      </header>
      <main className="hm-in">
        <HomeFooter />
      </main>
    </div>
  );
}
