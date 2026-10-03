<div align="center">

# 🔢 LexiSmash Scoring 🅰️

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/d12b0ad6e83b4a88b927ba3be4ed93c2)](https://app.codacy.com/gh/LexiSmash/LexiSmash_scoring/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![pages-build-deployment](https://github.com/LexiSmash/LexiSmash_scoring/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/LexiSmash/LexiSmash_scoring/actions/workflows/pages/pages-build-deployment)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/LexiSmash/LexiSmash_scoring) 
[![Open Source Love svg3](https://badges.frapsoft.com/os/v3/open-source.svg?v=103)](https://github.com/LexiSmash/LexiSmash_scoring) 
[![License](https://img.shields.io/badge/license-CC0%201.0-blue.svg?style=plastic)](LICENSE) 
[![Donate](https://img.shields.io/badge/PayPal-Donate%20to%20Author-blue.svg)](http://paypal.me/R0mb0)

The official letter values and letter sets powering [**LexiSmash**](https://lexismash.it), a multiplayer word party game — **6 languages**, every scoring system with fixed values, plus a standalone browser-based explorer to compare languages and prepare a correction in a few clicks. 🚀

  <a href="http://paypal.me/R0mb0">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/R0mb0/Support_the_dev_badge/blob/main/Badge/SVG/Support_the_dev_badge_Dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://github.com/R0mb0/Support_the_dev_badge/blob/main/Badge/SVG/Support_the_dev_badge_Light.svg">
      <img alt="Saved you time? Support the dev" src="https://github.com/R0mb0/Support_the_dev_badge/blob/main/Badge/SVG/Support_the_dev_badge_Default.svg">
    </picture>
  </a>


## [👉 Click here to open the Explorer! 👈](https://lexismash.github.io/LexiSmash_scoring/)

</div>

---

## 🚀 Features

- **6 languages, one format**: Italian, English, French, German, Spanish and Dutch, each with a small JSON file for its scoring systems and one for the letters that can be drawn.
- **Standalone Explorer**: a zero-dependency HTML/CSS/JS page (no build step, no game code) with its own look, so it's never confused with LexiSmash itself.
- **Light and dark theme**: follows your system automatically, or pick one yourself — the choice is remembered.
- **Available in 6 languages**: the Explorer speaks your browser's language (Italian, English, French, German, Spanish or Dutch), and you can switch at any time.
- **Compare at a glance**: select a letter to see what it's worth in every language, and which letters have a value but are never drawn.
- **Propose a fix without writing JSON**: switch on edit mode, change the values you think are wrong, explain why, and the Explorer opens a ready-made Issue for you — or gives you the updated JSON for a Pull Request.

## 🛠️ How it works

1. **Scoring data:** each `docs/data/scoring/{lang}.json` file lists the scoring systems of that language and, for each one, the value of every letter:
   ```json
   { "lang": "it", "systems": { "scrabble": { "values": { "A": 1, "B": 5, "C": 2 } } } }
   ```
2. **Systems:** `scrabble` (the official Scrabble values for that language) exists for every language; frizzy (Standard Scarabeo) follows Scarabeo, the crossword board game long sold in Italy as an alternative to Scrabble, whose letter values were set up differently from Scrabble's on purpose. The game's other two systems — *Random* (each drawn letter is worth 1–9 points) and *Custom* (the room's host sets every value) — have no fixed data, so they aren't here.
3. **Letter sets:** each `docs/data/alphabets/{lang}.json` file lists the `vocals` and `consonants` the game can draw in that language. A letter can have a value and still never be drawn (for example K, J, W, X, Y in Italian): the Explorer shows those with a dashed outline.
4. **GitHub Pages:** the whole `docs/` folder is served as-is — no build, no bundler, no dependency — so the Explorer and the raw JSON files are always one click away.

## 💡 Why this repository exists

- **Transparency**: the real LexiSmash game repository is private, but the numbers that decide how much a word is worth shouldn't be a black box — anyone can check every value, in every language.
- **Community corrections**: a value copied wrong, a letter missing from a language's set, a letter that should be drawn more or less often — this is where anyone can propose the fix, not just the author.
- **Reuse**: plain, documented JSON files, useful for other word games or simple experiments, independent of LexiSmash.

## ⚡ Getting Started

### Online

Just open the [Explorer](https://lexismash.github.io/LexiSmash_scoring/) — pick a language, select a letter, done.

### Local installation

The Explorer fetches JSON files, so opening `index.html` directly (double-click) won't work — browsers block local JSON loading over `file://`. Serve it with any static server instead:

```bash
cd docs
python3 -m http.server
# then open http://localhost:8000/ in your browser
```

## 📂 Repository structure

```
LexiSmash_scoring/
├── README.md, LICENSE, CONTRIBUTING.md, …   ← repo-only, never published
├── .github/                                  ← Issue form and Pull Request template
└── docs/                                     ← everything public, served by GitHub Pages
    ├── index.html, app.js, style.css         ← the standalone Explorer
    └── data/
        ├── LICENSES.md
        ├── scoring/    it.json, en.json, fr.json, de.json, es.json, nl.json
        └── alphabets/  it.json, en.json, fr.json, de.json, es.json, nl.json
```

Same convention used by the other LexiSmash repositories (`docs/` = public site, everything else stays in the repository).

## 🌍 Where the values come from

The `scrabble` values follow the official Scrabble letter distribution of each language; `frizzy` (Standard Scarabeo) is LexiSmash's own system, designed around how often each letter appears in Italian. Both were entered and checked by hand by [Francesco Rombaldoni](https://github.com/R0mb0) (LexiSmash's creator). This repository exists to keep checking them in the open, with anyone's help. See [docs/data/LICENSES.md](docs/data/LICENSES.md) for details and trademark notes.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide. Short version: use the Explorer's edit mode to open a ready-made Issue, or open a Pull Request that changes one language's JSON file, explaining why (a source is always welcome). Every proposal is reviewed by hand before being merged — don't expect an instant or automatic merge.

## 🔗 Relationship to the game

This repository is the **editorial source of truth** for the letter values and letter sets. The real game (a separate, private repository) periodically imports the corrections accepted here — the two aren't automatically linked, so an accepted correction here isn't live in-game until the next import.

## 📄 License

- **Code** (the standalone Explorer in `docs/`, this README and the other repository documents) is original work released into the public domain under [CC0 1.0 Universal](LICENSE) — use it, modify it, redistribute it, no permission needed.
- **Data** (the files inside `docs/data/`) are lists of letter values: plain facts, also offered under CC0. *Scrabble* is a trademark of its respective owners; this project is not affiliated with or endorsed by them — see [docs/data/LICENSES.md](docs/data/LICENSES.md).

<a href="https://github.com/R0mb0/Crafted_with_AI">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://github.com/R0mb0/Crafted_with_AI/blob/main/Badge/SVG/CraftedWithAIDark.svg">
<source media="(prefers-color-scheme: light)" srcset="https://github.com/R0mb0/Crafted_with_AI/blob/main/Badge/SVG/NotMadeByAILight.svg">
<img alt="Crafted with AI" src="https://github.com/R0mb0/Crafted_with_AI/blob/main/Badge/SVG/CraftedWithAIDefault.svg">
</picture>
</a>
