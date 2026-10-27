"use client";

import { useState } from "react";
import { tx } from "@/lib/tracks/tx";
import type { TrackTranslations } from "@/lib/tracks/types";
import { Figure, Btn, C } from "@/components/lesson/kit/figure";

// ── What this figure shows ────────────────────────────────────────────────────
// SDL_GetBasePath and SDL_GetPrefPath on four platforms, for a game run from
// its build folder or installed, with org and app strings the reader types.
// The pref path follows SDL 3.4.18's code (filesystem/windows, cocoa, unix,
// emscripten): Windows appends to %APPDATA% and stops on a name that Windows
// refuses, the others build one string and create each folder in it, so a "/"
// makes an extra folder. Then "write best.txt" in either folder, with the
// error SDL_IOFromFile really sets. The user is called "player".

type Os = "windows" | "macos" | "linux" | "web";
type Where = "build" | "installed";

const BASE: Record<Os, Record<Where, string>> = {
  windows: { build: "C:\\Users\\player\\sdl3-lab\\build\\Debug\\", installed: "C:\\Program Files\\SDL3 Lab\\" },
  macos:   { build: "/Users/player/sdl3-lab/build/", installed: "/Applications/SDL3 Lab.app/Contents/Resources/" },
  linux:   { build: "/home/player/sdl3-lab/build/", installed: "/opt/sdl3-lab/" },
  web:     { build: "/", installed: "/" },
};

// null = SDL_GetPrefPath returns NULL, with this error
function prefPath(os: Os, org: string, app: string, xdg: boolean): { path: string | null; err?: string } {
  if (os === "windows") {
    const bad = /[<>:"|?*]/;
    const root = "C:\\Users\\player\\AppData\\Roaming";
    for (const part of [org, app]) {
      if (bad.test(part)) return { path: null, err: "Couldn't create a prefpath.: The filename, directory name, or volume label syntax is incorrect." };
      if (/[\\/]/.test(part)) return { path: null, err: "Couldn't create a prefpath.: The system cannot find the path specified." };
    }
    return { path: `${root}${org ? `\\${org}` : ""}\\${app}\\` };
  }
  const root = os === "macos" ? "/Users/player/Library/Application Support"
    : os === "linux" ? (xdg ? "/home/player/data" : "/home/player/.local/share")
    : "/libsdl";
  return { path: org ? `${root}/${org}/${app}/` : `${root}/${app}/` };
}

// What writing best.txt into the base path does
function baseWrite(os: Os, where: Where): { ok: boolean; en: string; key: string } {
  if (where === "build" || os === "web") return { ok: true, key: os === "web" ? "bwWeb" : "bwBuild", en: os === "web"
    ? "Works, like every write on the web: Emscripten's files live in the tab's memory. The pref path is the folder a game mounts as persistent storage; anything else is gone when the page reloads."
    : "Works on your machine, which is why this mistake survives testing. The file is deleted with the build folder, and the moment the game is installed somewhere else, the write fails." };
  if (os === "windows") return { ok: false, key: "bwWin", en: "Couldn't open C:\\Program Files\\SDL3 Lab\\best.txt: Access is denied. Only an installer running as administrator may write in Program Files." };
  if (os === "linux") return { ok: false, key: "bwLinux", en: "Couldn't open /opt/sdl3-lab/best.txt: Permission denied. Folders outside the home folder belong to root." };
  return { ok: false, key: "bwMac", en: "It may even work, but it writes inside the signed app bundle: that breaks its code signature, and the next update replaces the whole bundle and the file with it." };
}

export function PrefPathFigure({ t }: { t?: TrackTranslations }) {
  const [os, setOs] = useState<Os>("windows");
  const [where, setWhere] = useState<Where>("installed");
  const [org, setOrg] = useState("Example");
  const [app, setApp] = useState("SDL3 Lab");
  const [xdg, setXdg] = useState(false);
  const [target, setTarget] = useState<"base" | "pref">("pref");

  const base = BASE[os][where];
  const pref = prefPath(os, org, app, xdg);
  const odd = /[^\p{L}\p{N} ]/u.test(org + app);
  const slash = os !== "windows" && /\//.test(org + app);
  const bw = baseWrite(os, where);

  const field = (label: string, value: string, set: (s: string) => void) => (
    <label className="flex items-center gap-1.5 text-[11.5px]">
      <span className="font-mono text-[var(--text-muted)]">{label}</span>
      <input value={value} onChange={e => set(e.target.value)} spellCheck={false}
        className="w-28 rounded-md border border-[var(--border)] bg-[var(--card)] px-1.5 py-0.5 font-mono text-[11.5px] text-[var(--text-main)]" />
    </label>
  );
  const row = (call: string, value: string, color: string = C.fg) => (
    <div>
      <p className="font-mono text-[10.5px]" style={{ color: C.axis }}>{call}</p>
      <p className="font-mono text-[11.5px] break-all" style={{ color }}>{value}</p>
    </div>
  );

  return (
    <Figure
      title={tx(t, "figSdlPref_title", "Where does the save go?")}
      head={<>
        {(["windows", "macos", "linux", "web"] as Os[]).map(o => (
          <Btn key={o} active={os === o} onClick={() => setOs(o)}>{{ windows: "Windows", macos: "macOS", linux: "Linux", web: "Web" }[o]}</Btn>
        ))}
      </>}
      controls={<>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {field("org", org, setOrg)}
          {field("app", app, setApp)}
          {os === "linux" && (
            <label className="flex items-center gap-1.5 text-[11.5px] text-[var(--text-muted)]">
              <input type="checkbox" checked={xdg} onChange={() => setXdg(x => !x)} className="accent-[var(--primary)]" />
              <span className="font-mono">XDG_DATA_HOME=/home/player/data</span>
            </label>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <span className="text-[var(--text-muted)]">{tx(t, "figSdlPref_runs", "The game runs from:")}</span>
          <Btn active={where === "build"} onClick={() => setWhere("build")}>{tx(t, "figSdlPref_build", "its build folder")}</Btn>
          <Btn active={where === "installed"} onClick={() => setWhere("installed")}>{tx(t, "figSdlPref_installed", "where it was installed")}</Btn>
        </div>
      </>}
      note={tx(t, "figSdlPref_note", "SDL_GetBasePath is where the game's files are: read them from there. SDL_GetPrefPath is the one folder the game may write to, per user, created on the first call. Change the platform, run the game from its build folder or from where it was installed, and edit org and app: a colon is fine on Linux but not on Windows, and a slash makes one folder more.")}
    >
      <div className="p-3 md:p-4 space-y-3">
        {row("SDL_GetBasePath()", base)}
        {row(`SDL_GetPrefPath("${org}", "${app}")`, pref.path ?? `NULL — SDL_GetError(): ${pref.err}`, pref.path ? C.fg : C.red)}
        {(odd || !org || slash) && pref.path && (
          <p className="text-[11px]" style={{ color: C.amber }}>
            {!org ? tx(t, "figSdlPref_noOrg", "An empty org skips the org folder, even on platforms whose app stores require it. New games should always give one.")
              : slash ? tx(t, "figSdlPref_slash", "The \"/\" became a folder separator: SDL created one folder more than you meant.")
              : tx(t, "figSdlPref_odd", "It works here, but SDL's advice is letters, numbers and spaces only: punctuation that one system accepts, another refuses. And never change these strings after release, or every player's save is left behind in the old folder.")}
          </p>
        )}

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <span className="text-[var(--text-muted)]">{tx(t, "figSdlPref_write", "Write best.txt in:")}</span>
            <Btn active={target === "base"} onClick={() => setTarget("base")}>{tx(t, "figSdlPref_inBase", "the base path")}</Btn>
            <Btn active={target === "pref"} onClick={() => setTarget("pref")}>{tx(t, "figSdlPref_inPref", "the pref path")}</Btn>
          </div>
          <p className="font-mono text-[11px] break-all text-[var(--text-main)]">
            SDL_SaveFile(&quot;{target === "base" ? base : pref.path ?? "?"}best.txt&quot;, …)
          </p>
          {target === "base" ? (
            <p className="text-[12px] leading-relaxed" style={{ color: bw.ok ? C.amber : C.red }}>
              <span className="font-semibold">{bw.ok ? "true" : "false"}: </span>{tx(t, `figSdlPref_${bw.key}`, bw.en)}
            </p>
          ) : pref.path ? (
            <p className="text-[12px] leading-relaxed" style={{ color: C.green }}>
              <span className="font-semibold">true: </span>
              {os === "web"
                ? tx(t, "figSdlPref_prefWeb", "Works. To survive a reload, the game mounts this folder with Emscripten's IndexedDB file system and syncs it after each save.")
                : tx(t, "figSdlPref_prefOk", "Works wherever the game is installed, for every user, without administrator rights. The file sits beside nothing else of the game, so an update or an uninstall does not touch it.")}
            </p>
          ) : (
            <p className="text-[12px] leading-relaxed" style={{ color: C.red }}>
              {tx(t, "figSdlPref_prefNull", "Nothing to write into: SDL_GetPrefPath returned NULL. The game must check for that, run without saving and say why in the log.")}
            </p>
          )}
        </div>
      </div>
    </Figure>
  );
}
