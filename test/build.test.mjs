import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import * as art from "../art/art.mjs";
import { build, svg } from "../scripts/build.mjs";

/** @param {string[]} bitmap */
const size = (bitmap) => [bitmap[0].length, bitmap.length];

describe("system-six.css", () => {
  it("is the build of art/ and src/ (run node scripts/build.mjs)", () => {
    assert.equal(readFileSync(new URL("../system-six.css", import.meta.url), "utf8"), build());
  });

  it("names no platform it was inspired by", () => {
    const text = [
      build(),
      readFileSync(new URL("../index.html", import.meta.url), "utf8"),
      readFileSync(new URL("../README.md", import.meta.url), "utf8"),
    ].join("\n");
    assert.doesNotMatch(text, /macintosh|\bmac\b|apple|chicago|geneva|monaco|quickdraw/i);
  });
});

describe("bitmaps", () => {
  it("are rectangular and use only ink, paper, and clear", () => {
    for (const [name, value] of Object.entries(art)) {
      if (!Array.isArray(value)) continue;
      assert.doesNotThrow(() => svg(value, { ink: "#000", paper: "#fff" }), name);
    }
  });

  it("match the sizes the stylesheet slices them at", () => {
    assert.deepEqual(size(art.button), [11, 11]); // slice 5
    assert.deepEqual(size(art.buttonDefault), [19, 19]); // slice 9: 4 of ring and gap, then the face
    assert.deepEqual(size(art.checkbox), [12, 12]);
    assert.deepEqual(size(art.radioOn), [12, 12]);
    assert.deepEqual(size(art.tab), [7, 7]); // slice 3 3 1 3
    assert.deepEqual(size(art.close), [11, 11]);
    assert.deepEqual(size(art.popupArrow), [11, 6]);
    for (const [name, p] of Object.entries(art.patterns)) assert.deepEqual(size(p), [8, 8], name);
  });

  it("draw the default ring 3px thick with a 1px gap before the face", () => {
    const mid = art.buttonDefault[9];
    assert.equal(mid.slice(0, 5), "###.#");
  });

  it("dim by a checkerboard, so a dimmed frame is half its ink", () => {
    const ink = (b) => b.join("").split("#").length - 1;
    const dimmed = art.dim(art.checkbox);
    assert.ok(Math.abs(ink(dimmed) - ink(art.checkbox) / 2) <= 1);
  });
});
