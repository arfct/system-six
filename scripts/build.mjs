// Builds system-six.css: the bitmaps in art/art.mjs as data-URI SVG custom
// properties (a normal set on .s6, a reverse set on .s6-reverse and on
// .s6-auto in dark mode), then the stylesheets in src/, in order.
//
//   node scripts/build.mjs          write system-six.css
//   node scripts/build.mjs --check  exit 1 if system-six.css is stale
//   node scripts/build.mjs --show   print every bitmap as text
import { readFileSync, writeFileSync } from "node:fs";
import * as art from "../art/art.mjs";

const SOURCES = ["tokens.css", "type.css", "buttons.css", "choices.css", "fields.css", "menus.css", "lists.css", "tabs.css", "windows.css", "misc.css"];

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

/** @param {{ink: string, paper: string}} colors */
function declarations(colors) {
  return Object.entries(bitmaps())
    .map(([prop, bitmap]) => `  ${prop}: ${dataUri(svg(bitmap, colors))};`)
    .join("\n");
}

export function build() {
  const normal = declarations({ ink: INK, paper: PAPER });
  const reverse = declarations({ ink: PAPER, paper: INK });
  const generated = `/* ---- bitmaps (generated from art/art.mjs by scripts/build.mjs) ---- */
.s6 {
  --s6-ink: ${INK};
  --s6-paper: ${PAPER};
${normal}
}
.s6.s6-reverse,
.s6-reverse .s6 {
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
