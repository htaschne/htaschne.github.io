---
title: "Making MTG Deck Diffs Easier to Read"
date: "2026-08-07"
description: "A small project for comparing Magic: The Gathering decklists with visual, card-aware diffs."
tags: ["Magic: The Gathering", "React", "Deckbuilding", "Tools"]
readingTime: "2 min read"
tldr: "mtg-deck-diff compares two Magic decklists and turns the result into grouped, visual changes: added cards, removed cards, quantity changes, and card previews instead of a wall of plain text."
takeaways:
  - "Deck diffs are easier to scan when changes are grouped by meaning."
  - "Card art and previews make the result feel much closer to deckbuilding than text comparison."
  - "The project is intentionally small: paste two lists, compare, and understand what moved."
featured: false
---

> **Source code:** [github.com/htaschne/mtg-deck-diff](https://github.com/htaschne/mtg-deck-diff)

I made a small tool for comparing two **Magic: The Gathering** decklists.

The original problem was boring in the way deckbuilding chores often are: I would change a list, then try to figure out what actually changed later. A plain text diff can technically answer that, but Magic cards are not really plain text. Names matter, quantities matter, and card art makes the whole thing much easier to recognize at a glance.

So **mtg-deck-diff** takes two decklists and turns the comparison into something more card-aware.

![The mtg-deck-diff desktop interface showing two decklists and summary counts.](/blog/mtg-deck-diff/desktop-comparison.png)

The main flow is intentionally simple. Paste or load Deck A, paste or load Deck B, and the app shows what moved from A to B.

It groups the result into:

- cards that were added;
- cards that were removed;
- cards whose quantities changed;
- cards that stayed the same.

That is already nicer than reading line changes, but the part I care about most is the scanability. The rows use card data and artwork, so the diff feels closer to looking through a deck than reviewing a patch file.

![Grouped diff rows with added, removed, and quantity-changed cards.](/blog/mtg-deck-diff/diff-rows.png)

The little example in the app is enough to show the shape of it. `Sol Ring` is new in Deck B, `Lightning Bolt` disappeared, and a couple cards changed quantities. The result is obvious without mentally subtracting two lists.

There is also card preview behavior behind the rows, plus Scryfall-backed card lookup for the visual details. That matters because a deck diff gets much easier to trust when I can recognize the actual cards instead of staring at normalized names.

![The mobile layout keeps the same deck comparison workflow in a narrower view.](/blog/mtg-deck-diff/mobile-comparison.png)

This is not trying to become a full deckbuilder. It is just a focused utility for one annoying moment in the Commander tinkering loop:

```text
old list -> new list -> what changed?
```

Small tool, very specific job. Those are usually my favorite kind.
