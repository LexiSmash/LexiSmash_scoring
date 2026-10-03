# Contributing

Thanks for helping keep LexiSmash's letter values right! Here's how to propose a correction.

## Before you start

- Every proposal is reviewed **by hand** by a human maintainer before it's accepted — don't expect an automatic or instant merge.
- Letters are always **UPPERCASE**, exactly as they already appear in the file you're editing.
- Values are whole numbers. Fixed scoring systems use values from **1** upward (in practice 1–10).
- One reason per proposal is better than one huge change mixing unrelated things: easier to review, more likely to be accepted quickly.
- A **source** (an official tile set, a rulebook, a federation page…) makes a correction much easier to accept.

## The easy way: the Explorer

1. Open the [Explorer](https://lexismash.github.io/LexiSmash_scoring/) and pick the language and scoring system.
2. Switch on **✏️ Propose changes**, select a letter and pick its new value (repeat for every letter you want to change).
3. Explain why in the text box.
4. Click **Open an Issue with these changes**: GitHub opens a new Issue already filled in. Check it and submit.

## Pull Request: change a value

1. Open the right file in `docs/data/scoring/` (for example `docs/data/scoring/es.json` for Spanish).
2. Change the value of the letter inside the right system (`scrabble` or, for Italian only, `frizzy`):
   ```json
   "Ñ": 8,
   ```
3. In the Pull Request description, explain **why** (and link a source if you have one).

The Explorer's **Copy the updated JSON** button gives you the whole file with your changes already applied, ready to paste.

## Pull Request: change which letters can be drawn

The letters the game can draw are in `docs/data/alphabets/{lang}.json`, split into `vocals` and `consonants`. Adding or removing a letter there changes the game itself (which letters can appear on the board), so please explain the reason carefully — these changes are discussed more slowly than a simple value fix.

## What will NOT be accepted

- Values invented "for fun" or to make a word easier to score.
- Pull Requests changing several languages at once without a reason shared by all of them.
- Changes to the file format (structure, system names). If you think the format itself should change, open an Issue first to discuss it.
- New scoring systems added directly as a Pull Request: propose them in an Issue first.

## Issue instead of a Pull Request

Not sure how to format the change, or you just want to point out a problem? Opening an Issue is perfectly fine — use the **Score correction** form, it will be handled by hand anyway.

## Code of conduct

By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
