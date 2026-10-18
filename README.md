# From Scratch Lab

Free, interactive courses that build things up from the first principle:
OpenGL, GLSL, Vulkan, C/C++, x86-64 Assembly, SDL3, game development,
algorithms, AI, math, physics and music theory. Every formula is explained
term by term, and the figures run live in the browser.

**[fromscratchlab.com](https://fromscratchlab.com)** · English and Portuguese (`/pt`)

## What is inside

- **Tracks** of hand-written lessons, each with live figures you can drag,
  rotate and play with (SVG, WebGL2 and Web Audio), step-by-step derivations
  and practice rounds.
- **Function reference** for OpenGL (`/OpenGL/reference`), linked from the lessons.
- Reading progress stays in the browser: no account, no sign-up.

## Running locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>. `npm run build` makes the production build;
`npx tsc --noEmit -p .` type-checks.

Built with Next.js (App Router), React, TypeScript, Tailwind CSS and KaTeX.
How the code is organised is described in [CLAUDE.md](CLAUDE.md); the dated
history of every change is in [CHANGELOG.md](CHANGELOG.md) (Portuguese).

## Author

Made by [Gabriel Carvalho](https://www.gabrielfrc.dev). If a lesson helped you,
you can [buy me a coffee](https://ko-fi.com/gabrielfrc).

MIT License.
