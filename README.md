# system-six

Black-and-white 1-bit desktop components in plain CSS, in the spirit of 1980s paint programs and desktops: rounded push buttons with a ring around the default, checkboxes that take an X, striped title bars, menus with 1px shadows, a gray dither desktop, and 8×8 fill patterns. Every part is drawn at the pixel dimensions of the originals, at their physical size, and stays crisp on any screen.

One stylesheet, no JavaScript, no build step to use it. The preview, `index.html`, shows every component and state (`npm run preview`, then open the address it prints).

## Use

```html
<link rel="stylesheet" href="fonts/fonts.css">   <!-- the bundled pixel faces -->
<link rel="stylesheet" href="system-six.css">

<div class="s6">
  <label class="s6-field">Name: <input type="text"></label>
  <label class="s6-check"><input type="checkbox" checked> Keep a backup</label>
  <div class="s6-buttons">
    <button>Cancel</button>
    <button class="s6-default">Save</button>
  </div>
</div>
```

Everything is scoped to `.s6`: native controls inside it (`button`, checkboxes, radios, text inputs, `textarea`, `select`, `progress`, range inputs, `fieldset`, `hr`) take the look, and the classes below build the rest. Outside `.s6` nothing changes.

From git: `npm install github:arfct/system-six`, then import `@arfct/system-six` (the CSS) and `@arfct/system-six/fonts.css`. Or copy `system-six.css` and `fonts/`.

## Components

| Part | Markup | Size (in art pixels) |
|---|---|---|
| Push button | `<button>`; `.s6-default` for the one Return triggers; `.s6-bare` opts a `<button>` out | 20 tall, 58 minimum wide; the default ring is 3 thick, 1 gap, drawn 4 outside |
| Checkbox, radio | `<label class="s6-check"><input type="checkbox"> Label</label>` | 12 × 12 |
| Edit field | `<input type="text">`, `<label class="s6-field">` for label and field on one row | 22 tall: 1 frame, 2 air, 16 line, 2 air, 1 frame |
| Text area | `<textarea>` | 16px lines, 3 padding |
| Pop-up menu | `<select>` | 19 tall plus a 1px shadow; arrow 11 × 6 |
| List box | `<ul class="s6-list">` with `aria-selected="true"` on the chosen row, or `<select multiple>` | 16px rows |
| Menu bar | `<nav class="s6-menubar">` of `<button class="s6-bare">`; `aria-expanded="true"` on the open title | 20 tall |
| Menu | `<div class="s6-menu" role="menu">` of `role="menuitem"` buttons; `aria-checked`, `aria-disabled`, `<kbd>` for the shortcut, `role="separator"` | 16px rows, 1px shadow |
| Tabs | `<div class="s6-tabs" role="tablist">` of `role="tab"` buttons over a `.s6-tabpanel` | 18 tall; the open tab 20, joined to the panel |
| Window | `.s6-window` > `.s6-titlebar` (`.s6-close`, `.s6-title`, `.s6-zoom`) + `.s6-window-body`; `.s6-inactive` | title bar 19 with 6 stripes; boxes 11 × 11, 8 in |
| Size box | `.s6-grow` | 16 × 16 |
| Dialog | `.s6-dialog`; `.s6-alert` adds a 32px icon column; `.s6-buttons` ends it | frame 1 ink, 1 paper, 2 ink; 13 inside |
| Scroll bars | on `.s6-scroll`, `.s6-list`, `textarea`, list `select`s | 16 |
| Progress | `<progress>`; no value runs stripes | 12 tall |
| Slider | `<input type="range">` | 16 |
| Group box | `<fieldset>` + `<legend>`, or `.s6-group` | 1px frame |
| Rule | `<hr>` (dotted), `.s6-rule-solid` | 1 |
| Desktop | `.s6-desktop` | 50% gray dither |
| Patterns | `.s6-fill-gray`, `-light`, `-dark`, `-dots`, `-diagonal`, `-bricks`, `-grid`, `-zigzag`, `-weave`, `-scales`; or `var(--s6-pattern-…)` | 8 × 8 tiles |

States: `:active` presses (inverts a button, doubles a checkbox frame); `:disabled` or `aria-disabled="true"` dims to a checkerboard gray. `.s6-pressed` and `.s6-chosen` show those states without the pointer, for previews.

## Type

| Token | Face | Size |
|---|---|---|
| `--s6-font-system` | Pixel Operator Bold: buttons, menus, labels, titles | 16 on a 16 line |
| `--s6-font-app` | Pixel Operator: body text, lists, text areas | 16 on 16 |
| `--s6-font-small` | Pixel Operator 8: captions | 8 on 10 |
| `--s6-font-mono`, `--s6-font-mono-small` | Pixel Operator Mono, Mono 8 | 16 on 16, 8 on 10 |

Each face draws one font pixel per CSS pixel at its design size, so text is as crisp as the frames. Classes `.s6-system`, `.s6-app`, `.s6-small`, `.s6-mono`, `.s6-mono-small` apply them.

## Size and colour

- Parts draw at the originals' physical size, automatically. One original screen pixel was 1/72 inch, which is 4/3 of a CSS pixel; the stylesheet sets `--s6-px` (one art pixel) to the nearest whole number of device pixels for the display's density, so every edge stays crisp:

  | Display | Art pixel | Device pixels | Of the real size |
  |---|---|---|---|
  | 1× | 1 CSS px | 1 | 75% |
  | 1.5× | 1.333 CSS px | 2 | 100% |
  | 2× | 1.5 CSS px | 3 | 112% |
  | 3× | 1.333 CSS px | 4 | 100% |

  Sizes in this README are in art pixels: a push button is 20 of them, 30 CSS px tall on a 2× screen.
- Ink and paper are black and white. `.s6-reverse` swaps them, bitmaps included; `.s6-auto` swaps them when the system is in dark mode.
- `--s6-dim` is the gray of a dimmed label (text can't take a dither pattern, so it's the mix of ink and paper).

## Browsers

Chromium, Safari, and Firefox. Scroll bars take the 16px gray-track look in Chromium and Safari; Firefox gets black and white. Arrow boxes at the ends of a scroll bar appear where the platform draws scroll buttons at all (Windows and Linux), and the thumb is sized to the content, as browsers draw it.

## Develop

```
npm install
npm run build     # art/ and src/ → system-six.css
npm test          # fails while system-six.css is stale
npm run lint
npm run preview   # the style preview over http
```

Every bitmap is text in `art/art.mjs`: `#` is ink, `o` is paper, `.` is clear. `node scripts/build.mjs --show` prints them all.

## Credits

The bundled fonts are Pixel Operator by Jayvee Enaguas (HarvettFox96), released under CC0 1.0 (`fonts/LICENSE-pixel-operator.txt`).

A project of [Artifact](https://github.com/arfct). MIT.
