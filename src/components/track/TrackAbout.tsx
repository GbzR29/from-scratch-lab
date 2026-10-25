// ── About this track (track page, under the map) ────────────────────────────
// A sheet of prose for readers and search engines: what the track is, what
// the reader builds and what they need. Text in src/lib/tracks/<track>/about.ts;
// tracks without one show nothing. Styles: src/styles/trackPage.css (.tp-about).

import type { AboutText } from "@/lib/tracks/about";

type Strings = Record<string, string | undefined>;

export default function TrackAbout({ about, ui, sheet }: { about: AboutText; ui: Strings; sheet: string }) {
  return (
    <section className="tp-about">
      <div className="tp-kicker">{sheet} 03 · {ui.tvAbout ?? "about this track"}</div>
      <h2>{about.title}</h2>
      <div className="tp-about-grid">
        <div className="tp-about-text">
          {about.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <div className="tp-side">
          <section className="tp-box">
            <h2>{ui.tvBuild ?? "What you will build"}</h2>
            <ul className="tp-facts">{about.build.map((b, i) => <li key={i}>{b}</li>)}</ul>
          </section>
          <section className="tp-box">
            <h2>{ui.tvNeed ?? "What you need"}</h2>
            <ul className="tp-facts">{about.need.map((n, i) => <li key={i}>{n}</li>)}</ul>
          </section>
        </div>
      </div>
    </section>
  );
}
