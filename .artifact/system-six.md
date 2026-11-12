---
title: System Six
date: 2026-10
category: system
tags: [web, design]
url: https://arfct.github.io/system-six/
links:
  source: https://github.com/arfct/system-six
media:
  - src: components.png
    caption: The head of the preview page on a 2× screen, with the five type styles, the ten fill patterns and the push buttons in each state
    alt: A menu bar and four pixel-art windows titled System Six, Type, Patterns and Push buttons, showing sample sentences, ten small patterned swatches and a row of rounded buttons, one inverted and one dimmed
  - src: windows.png
    caption: The foot of the same page, with an active and an inactive window, a save dialog and an alert on the grey desktop
    alt: Black-and-white pixel-art windows on a grey dithered background, one with a striped title bar reading Untitled, one plain titled Inactive, a dialog with Cancel and a ringed Save button, and an alert with Cancel and a ringed Revert button
  - src: smooth-dark.png
    caption: The smooth variant in dark mode, where the strokes are vectors and the bitmaps are inverted
    alt: The same page in white on black, with smooth sans-serif type, rounded window corners and the pattern swatches in inverted tones
unconfirmed: [date]
---

One CSS file holds all of System Six, a set of 1-bit desktop components modelled on the black-and-white desktops and paint programs of the 1980s. Each part keeps the pixel dimensions of its original, so a push button is 20 pixels tall. An original screen pixel was 1/72 of an inch, and the stylesheet sets one art pixel to the nearest whole number of device pixels for the display's density. On a 2× screen, as in the images, that is three device pixels, which puts the button at 112% of its original size and keeps every edge sharp.

The stylesheet uses no JavaScript. Native controls inside an element with the class `s6` take the look, and classes supply what HTML has no element for, including menu bars, menus, tabs, windows, dialogs and ten 8×8 fill patterns. A checked checkbox takes an X, the default button carries a ring three pixels thick, a title bar has six stripes, and a disabled control is dimmed with a checkerboard.

The bundled typeface is Pixel Operator by Jayvee Enaguas. A smooth variant draws the same strokes and offset shadows as vectors with squircle corners, and a dark mode exchanges ink and paper, bitmaps included. The preview page shows every component and state. Version 0.1.0 installs from the GitHub repository.

CSS. 2026.
