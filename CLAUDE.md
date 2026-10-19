# CLAUDE.md

This repo follows the Artifact Primer: https://github.com/arfct/ops/tree/main/primer

- Standards (style, commits, branches): https://github.com/arfct/ops/blob/main/primer/standards.md
- Work tracking: GitHub Issues in this repo — https://github.com/arfct/ops/blob/main/primer/issues.md
- Agent conventions and boundaries: https://github.com/arfct/ops/blob/main/primer/agents.md

## This repo

`@arfct/system-six`: black-and-white 1-bit desktop components in plain CSS. `art/art.mjs` draws every bitmap as text (`#` ink, `o` paper, `.` clear); `src/*.css` are the component stylesheets; `scripts/build.mjs` turns the bitmaps into data-URI custom properties (a normal set, a reverse set) and concatenates everything into `system-six.css`, which is committed. Edit `art/` and `src/`, then `npm run build`; `npm test` fails while `system-six.css` is stale. `index.html` is the style preview (`npm run preview`). Sizes are the originals' pixel dimensions in `--s6-px` units; keep them whole. Never name the platform the look comes from — in code, docs, or the preview (a test checks).
