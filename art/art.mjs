// Every bitmap in system-six, drawn as text: "#" is ink, "o" is paper, "."
// is clear. scripts/build.mjs turns each into a data-URI SVG (one rect per
// run, crisp edges) in a normal set and a reverse set, plus a dimmed copy of
// the controls that have a disabled state. One character is one pixel.

/** @param {string} s */
const rows = (s) =>
  s
    .trim()
    .split("\n")
    .map((r) => r.trim());

// Paper-coloured copies of a glyph, for when it sits on an inverted
// (ink) highlight: a pressed pop-up, a chosen menu item.
/** @param {string[]} art */
const knockout = (art) => art.map((r) => r.replace(/#/g, "o"));

// Mirror a top-left quadrant (including its centre row and column) into a
// whole tile, so the four corners of a frame always match.
/** @param {string} quarter */
function quad(quarter) {
  const top = rows(quarter).map((r) => r + [...r.slice(0, -1)].reverse().join(""));
  return [...top, ...top.slice(0, -1).reverse()];
}

// ---- push buttons: 9-slice frames ----

// The face: a 1px rounded frame with three-step corners. Slice 5.
export const button = quad(`
...###
.##ooo
.#oooo
#ooooo
#ooooo
#ooooo
`);

// Pressed: the same shape filled with ink (the label inverts to paper).
export const buttonPressed = button.map((r) => r.replace(/o/g, "#"));

// Rasterise a rounded rectangle by pixel centre: inside the box inset by
// `inset` with corner radius `r`.
/** @param {number} n @param {number} x @param {number} y @param {number} inset @param {number} r */
function inside(n, x, y, inset, r) {
  const lo = inset;
  const hi = n - inset;
  const px = x + 0.5;
  const py = y + 0.5;
  if (px < lo || px > hi || py < lo || py > hi) return false;
  const cx = Math.min(Math.max(px, lo + r), hi - r);
  const cy = Math.min(Math.max(py, lo + r), hi - r);
  return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
}

// The default ring: 3px thick, a 1px gap, then the face. It is drawn 4px
// outside the button's box (border-image-outset), as the ring always was.
// 19px square, slice 9 (4px of ring and gap, then the face's 5).
/** @param {string[]} face */
function ringed(face) {
  const n = 19;
  const out = [];
  for (let y = 0; y < n; y++) {
    let row = "";
    for (let x = 0; x < n; x++) {
      const ring = inside(n, x, y, 0, 8) && !inside(n, x, y, 3, 5);
      const f = face[y - 4]?.[x - 4];
      row += f && f !== "." ? f : ring ? "#" : ".";
    }
    out.push(row);
  }
  return out;
}
export const buttonDefault = ringed(button);
export const buttonDefaultPressed = ringed(buttonPressed);

// ---- checkbox and radio: 12px ----

export const checkbox = rows(`
############
#oooooooooo#
#oooooooooo#
#oooooooooo#
#oooooooooo#
#oooooooooo#
#oooooooooo#
#oooooooooo#
#oooooooooo#
#oooooooooo#
#oooooooooo#
############
`);

// Checked is an X from corner to corner.
export const checkboxOn = checkbox.map((r, y) => [...r].map((c, x) => (c === "o" && (x === y || x === 11 - y) ? "#" : c)).join(""));

// While the pointer is down: a second frame inside the first.
/** @param {string[]} art */
const thicken = (art) =>
  art.map((r, y) =>
    [...r]
      .map((c, x) => {
        if (c !== "o") return c;
        const near = (dx, dy) => art[y + dy]?.[x + dx] === "#" && (y + dy === 0 || y + dy === 11 || x + dx === 0 || x + dx === 11);
        return near(-1, 0) || near(1, 0) || near(0, -1) || near(0, 1) ? "#" : c;
      })
      .join(""),
  );
export const checkboxPressed = thicken(checkbox);
export const checkboxOnPressed = thicken(checkboxOn);

export const radio = rows(`
....####....
..##oooo##..
.#oooooooo#.
.#oooooooo#.
#oooooooooo#
#oooooooooo#
#oooooooooo#
#oooooooooo#
.#oooooooo#.
.#oooooooo#.
..##oooo##..
....####....
`);

export const radioOn = rows(`
....####....
..##oooo##..
.#oooooooo#.
.#oo####oo#.
#oo######oo#
#oo######oo#
#oo######oo#
#oo######oo#
.#oo####oo#.
.#oooooooo#.
..##oooo##..
....####....
`);

export const radioPressed = rows(`
....####....
..########..
.##oooooo##.
.#oooooooo#.
##oooooooo##
#oooooooooo#
#oooooooooo#
##oooooooo##
.#oooooooo#.
.##oooooo##.
..########..
....####....
`);

export const radioOnPressed = rows(`
....####....
..########..
.##oooooo##.
.#oo####oo#.
##o######o##
#oo######oo#
#oo######oo#
##o######o##
.#oo####oo#.
.##oooooo##.
..########..
....####....
`);

// ---- tabs: 9-slice, rounded on top only. Slice 3 3 1 3. ----

export const tab = rows(`
..###..
.#ooo#.
#ooooo#
#ooooo#
#ooooo#
#ooooo#
#######
`);

// The open tab has no bottom edge: it runs into the panel below it.
export const tabSelected = [...tab.slice(0, -1), "#ooooo#"];

// ---- glyphs ----

// The pop-up menu's arrow.
export const popupArrow = rows(`
###########
.#########.
..#######..
...#####...
....###....
.....#.....
`);
export const popupArrowPressed = knockout(popupArrow);

// A check mark for menu items and list rows.
export const check = rows(`
.......#
......##
.....##.
#...##..
##.##...
.###....
..#.....
`);
export const checkPressed = knockout(check);

// Title-bar boxes: close (a plain square) and zoom (a square in a square).
export const close = rows(`
###########
#ooooooooo#
#ooooooooo#
#ooooooooo#
#ooooooooo#
#ooooooooo#
#ooooooooo#
#ooooooooo#
#ooooooooo#
#ooooooooo#
###########
`);

export const zoom = rows(`
###########
#ooooooooo#
#o######oo#
#o#oooo#oo#
#o#oooo#oo#
#o#oooo#oo#
#o#oooo#oo#
#o######oo#
#ooooooooo#
#ooooooooo#
###########
`);

// Hollow scroll arrows, centred in a 16px box by the stylesheet.
export const arrowUp = rows(`
.....#.....
....#o#....
...#ooo#...
..#ooooo#..
.#ooooooo#.
####ooo####
...#ooo#...
...#ooo#...
...#####...
`);
export const arrowDown = [...arrowUp].reverse();
/** @param {string[]} art */
const transpose = (art) => [...art[0]].map((_, x) => art.map((r) => r[x]).join(""));
export const arrowLeft = transpose(arrowUp);
export const arrowRight = arrowLeft.map((r) => [...r].reverse().join(""));

// The size box in a window's corner: two overlapping squares.
export const grow = rows(`
###########....
#ooooooooo#....
#oooooooooo....
#ooo########...
#ooo#oooooo#...
#ooo#oooooo#...
#ooo#oooooo#...
#ooo#oooooo#...
###o#oooooo#...
....#oooooo#...
....########...
...............
...............
...............
...............
`);

// ---- fill patterns: 8x8 tiles ----

/** @param {string} line @param {number} [times] */
const tile = (line, times = 1) => rows(line.repeat(times));

export const patterns = {
  gray: tile("#o#o#o#o\no#o#o#o#\n", 4),
  light: tile("#ooo#ooo\noooooooo\noo#ooo#o\noooooooo\n", 2),
  dark: tile("o###o###\n########\n##o###o#\n########\n", 2),
  dots: tile("#ooooooo\noooooooo\noooooooo\noooooooo\noooo#ooo\noooooooo\noooooooo\noooooooo\n"),
  diagonal: rows(["ooooooo#", "oooooo#o", "ooooo#oo", "oooo#ooo", "ooo#oooo", "oo#ooooo", "o#oooooo", "#ooooooo"].join("\n")),
  bricks: rows(["########", "#ooooooo", "#ooooooo", "#ooooooo", "########", "oooo#ooo", "oooo#ooo", "oooo#ooo"].join("\n")),
  grid: rows(["########", "#ooooooo", "#ooooooo", "#ooooooo", "#ooooooo", "#ooooooo", "#ooooooo", "#ooooooo"].join("\n")),
  zigzag: rows(["#ooooooo", "o#ooooo#", "oo#ooo#o", "ooo#o#oo", "oooo#ooo", "oooooooo", "oooooooo", "oooooooo"].join("\n")),
  weave: rows(["###o#ooo", "##ooo#oo", "#ooooo#o", "oooooooo", "#ooo###o", "o#o###oo", "oo###ooo", "ooo#oooo"].join("\n")),
  scales: rows(["o###oooo", "#ooo#ooo", "ooooo###", "oooo#ooo", "###oo#oo", "ooo#ooo#", "oooo###o", "ooooo#oo"].join("\n")),
};

// Controls with a disabled state get a dimmed copy: every other ink pixel
// in a checkerboard turns to paper, the gray a dimmed control was drawn in.
export const dimmable = { button, checkbox, checkboxOn, radio, radioOn, tab, tabSelected, popupArrow, arrowUp, arrowDown, arrowLeft, arrowRight };

/** @param {string[]} art */
export function dim(art) {
  return art.map((r, y) => [...r].map((c, x) => (c === "#" && (x + y) % 2 === 1 ? "o" : c)).join(""));
}
