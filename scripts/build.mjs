// Builds system-six.css: the bitmaps in art/art.mjs as data-URI SVG custom
// properties (a normal set on .s6, a dark set on .s6-dark and on
// .s6-auto in dark mode), then the stylesheets in src/, in order.
//
//   node scripts/build.mjs          write system-six.css
//   node scripts/build.mjs --check  exit 1 if system-six.css is stale
//   node scripts/build.mjs --show   print every bitmap as text
import { readFileSync, writeFileSync } from "node:fs";
import * as art from "../art/art.mjs";

const SOURCES = [
  "tokens.css",
  "type.css",
  "buttons.css",
  "choices.css",
  "fields.css",
  "menus.css",
  "lists.css",
  "tabs.css",
  "windows.css",
  "misc.css",
  "smooth.css",
];

// The smooth variant's glyphs: the same shapes as the bitmaps, as vectors.
// Each is [width, height, draw(ink, paper)] in art pixels; "-pressed"
// copies draw in paper, for an inverted highlight.
/** @type {Record<string, [number, number, (ink: string, paper: string) => string]>} */
const VECTORS = {
  "popup-arrow": [11, 6, (ink) => `<path fill='${ink}' d='M0 0h11L5.5 6z'/>`],
  check: [9, 8, (ink) => `<path fill='none' stroke='${ink}' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' d='M1 4.5l2.5 2.5L8 1.5'/>`],
  "arrow-up": [11, 9, (ink, paper) => `<path fill='${paper}' stroke='${ink}' stroke-linejoin='round' d='M5.5.5l5 5h-3v3h-4v-3h-3z'/>`],
  "arrow-down": [11, 9, (ink, paper) => `<path fill='${paper}' stroke='${ink}' stroke-linejoin='round' d='M5.5 8.5l5-5h-3v-3h-4v3h-3z'/>`],
  "arrow-left": [9, 11, (ink, paper) => `<path fill='${paper}' stroke='${ink}' stroke-linejoin='round' d='M.5 5.5l5-5v3h3v4h-3v3z'/>`],
  "arrow-right": [9, 11, (ink, paper) => `<path fill='${paper}' stroke='${ink}' stroke-linejoin='round' d='M8.5 5.5l-5-5v3h-3v4h3v3z'/>`],
  zoom: [9, 9, (ink) => `<rect x='1.5' y='1.5' width='5' height='5' fill='none' stroke='${ink}'/>`],
};
const PRESSED_VECTORS = ["popup-arrow", "check"];

const INK = "#000";
const PAPER = "#fff";

// One path per colour, a closed sub-path per horizontal run; "." stays clear.
/** @param {string[]} bitmap @param {{ink: string, paper: string}} colors */
export function svg(bitmap, { ink, paper }) {
  const w = bitmap[0].length;
  const h = bitmap.length;
  /** @type {Record<string, string>} */
  const d = { "#": "", o: "" };
  bitmap.forEach((row, y) => {
    if (row.length !== w) throw new Error(`ragged bitmap: row ${y} is ${row.length} wide, expected ${w}`);
    let x = 0;
    while (x < w) {
      const c = row[x];
      let end = x;
      while (end < w && row[end] === c) end++;
      if (c === "#" || c === "o") d[c] += `M${x} ${y}h${end - x}v1H${x}z`;
      else if (c !== ".") throw new Error(`unknown pixel ${JSON.stringify(c)} at ${x},${y}`);
      x = end;
    }
  });
  const paths = [d.o && `<path fill='${paper}' d='${d.o}'/>`, d["#"] && `<path fill='${ink}' d='${d["#"]}'/>`].join("");
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' shape-rendering='crispEdges'>${paths}</svg>`;
}

// Physical size. One original screen pixel was 1/72 inch: 4/3 of a CSS
// pixel. At each display density an art pixel is the whole number of device
// pixels nearest that, so every edge stays crisp and parts come out as close
// to their real size as the screen allows. Densities between these get the
// rule for the one below them.
export const DENSITIES = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.625, 2.75, 3, 3.5, 4];

/** Device pixels per art pixel at a density, and that in CSS pixels. @param {number} dppx */
export function artPixel(dppx) {
  const device = Math.max(1, Math.round((dppx * 4) / 3));
  return { device, css: device / dppx };
}

function densityRules() {
  return DENSITIES.filter((d) => d > 1)
    .map((d) => {
      const { device } = artPixel(d);
      const from = +(d - 0.01).toFixed(3);
      return `@media (min-resolution: ${from}dppx), (-webkit-min-device-pixel-ratio: ${from}) {\n  .s6 { --s6-px: calc(${device}px / ${d}); }\n}`;
    })
    .join("\n");
}

/** @param {string} s */
const dataUri = (s) => `url("data:image/svg+xml,${s.replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E")}")`;

/** @param {string} name */
const kebab = (name) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

// Every bitmap that becomes a custom property, by property name.
function bitmaps() {
  /** @type {Record<string, string[]>} */
  const out = {};
  for (const [name, value] of Object.entries(art)) {
    if (Array.isArray(value) && typeof value[0] === "string") out[`--s6-art-${kebab(name)}`] = value;
  }
  for (const [name, bitmap] of Object.entries(art.dimmable)) out[`--s6-art-${kebab(name)}-dim`] = art.dim(bitmap);
  for (const [name, bitmap] of Object.entries(art.patterns)) out[`--s6-pattern-${name}`] = bitmap;
  return out;
}

/** @param {number} w @param {number} h @param {string} body */
const vectorSvg = (w, h, body) => `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>${body}</svg>`;

/** @param {{ink: string, paper: string}} colors */
function declarations(colors) {
  const pixels = Object.entries(bitmaps()).map(([prop, bitmap]) => `  ${prop}: ${dataUri(svg(bitmap, colors))};`);
  const vectors = Object.entries(VECTORS).flatMap(([name, [w, h, draw]]) => {
    const out = [`  --s6-vector-${name}: ${dataUri(vectorSvg(w, h, draw(colors.ink, colors.paper)))};`];
    if (PRESSED_VECTORS.includes(name)) out.push(`  --s6-vector-${name}-pressed: ${dataUri(vectorSvg(w, h, draw(colors.paper, colors.ink)))};`);
    return out;
  });
  return [...pixels, ...vectors].join("\n");
}

export function build() {
  const normal = declarations({ ink: INK, paper: PAPER });
  const reverse = declarations({ ink: PAPER, paper: INK });
  const generated = `/* ---- physical size: --s6-px per display density (generated) ---- */
${densityRules()}

/* ---- bitmaps (generated from art/art.mjs by scripts/build.mjs) ---- */
.s6 {
  --s6-ink: ${INK};
  --s6-paper: ${PAPER};
${normal}
}
.s6.s6-dark,
.s6-dark .s6 {
  --s6-ink: ${PAPER};
  --s6-paper: ${INK};
${reverse}
}
@media (prefers-color-scheme: dark) {
  .s6.s6-auto,
  .s6-auto .s6 {
    --s6-ink: ${PAPER};
    --s6-paper: ${INK};
${reverse.replace(/^ {2}/gm, "    ")}
  }
}
`;
  const banner = `/*! system-six: black-and-white 1-bit desktop components in plain CSS.
 * https://github.com/arfct/system-six · MIT
 * Built by scripts/build.mjs from art/art.mjs and src/; edit those, not this file. */
`;
  const parts = SOURCES.map((f) => readFileSync(new URL(`../src/${f}`, import.meta.url), "utf8").trim());
  return `${banner}\n${parts[0]}\n\n${generated}\n${parts.slice(1).join("\n\n")}\n`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const target = new URL("../system-six.css", import.meta.url);
  if (process.argv.includes("--show")) {
    for (const [prop, bitmap] of Object.entries(bitmaps())) console.log(`${prop}\n${bitmap.join("\n")}\n`);
  } else if (process.argv.includes("--check")) {
    const current = readFileSync(target, "utf8");
    if (current !== build()) {
      console.error("system-six.css is stale: run node scripts/build.mjs");
      process.exit(1);
    }
  } else {
    writeFileSync(target, build());
    console.log("wrote system-six.css");
  }
}
