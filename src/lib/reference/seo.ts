// src/lib/reference/seo.ts
// Titles and descriptions of the API reference pages
// (/<track>/reference and /<track>/reference/<function>), built
// on the server from the same entries the pages show. English only: the
// reference has no /pt copy.

import type { Metadata } from "next";
import { displayName, getReference, referenceHref, referenceIndex } from "./index";

const SITE_NAME = "From Scratch Lab";

function meta(title: string, description: string, url: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME, type: "article" },
  };
}

/** "glDrawArrays — …" is about as long as a result title gets, so keep the tail short. */
export function referenceMetadata(trackPath: string): Metadata {
  const ref = getReference(trackPath);
  if (!ref) return {};
  // "OpenGL 4.6 · GLFW 3.4" → "OpenGL 4.6 and GLFW 3.4"
  const name = ref.title.replace(" · ", " and ");
  return meta(
    `${ref.title} Function Reference: all ${ref.entries.length} functions explained`,
    `Every ${name} function used in the course, explained for beginners: parameters, accepted values, common errors and a short C++ example.`,
    referenceHref(ref),
  );
}

/** The library a function belongs to, by its prefix (GLFW pages live in the OpenGL reference). */
function libraryOf(name: string, trackPath: string): string {
  if (name.startsWith("glfw")) return "GLFW";
  if (name.startsWith("SDL_")) return "SDL3";
  return trackPath;
}

/** "glGetShaderiv: parameters, errors and example | OpenGL reference": the name first,
 *  then what the page offers, since people search for the bare function name. */
export function functionMetadata(trackPath: string, fn: string): Metadata {
  const ref = getReference(trackPath);
  const entry = ref && referenceIndex(ref).get(fn);
  if (!ref || !entry) return {};
  const name = displayName(entry);
  const lib = libraryOf(entry.name, trackPath);
  const offers = entry.family
    ? "every variant explained"
    : entry.errors?.length ? "parameters, errors and example" : "parameters and example";
  const since = entry.since ? ` Available since ${entry.since}.` : "";
  const contents = entry.family
    ? "How to read the suffixes, every variant and a C++ example."
    : `Parameters${entry.params.some((p) => p.values?.length) ? ", accepted values" : ""}${entry.errors?.length ? ", errors" : ""}${entry.notes?.length ? ", pitfalls" : ""} and a C++ example.`;
  return meta(
    `${name}: ${offers} | ${lib} reference`,
    `${name}: ${entry.summary.en.replace(/\.?$/, ".")}${since} ${contents}`,
    referenceHref(ref, entry.name),
  );
}
