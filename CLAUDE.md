# Instructions for Claude

## Project
Browser-based **Käärmeet ja tikapuut** (Snakes and Ladders) in Finnish, for the owner's kids to play locally. Visuals modelled on the family's physical board (see `docs/physical-board.jpg`).

- Stack: Vite + TypeScript + plain DOM/CSS/SVG. No framework.
- Run: `npm install && npm run dev`.
- Build check: `npm run build` (does `tsc` then `vite build`).

## Git & PR workflow

This repo is hosted under the personal GitHub account `mrojala` (remote: `git@personal:mrojala/snakes-and-ladders.git`, which uses a dedicated SSH key configured in `~/.ssh/config`).

Work is delivered via feature branches → PRs against `main`. Name branches `feat/<slug>`.

### gh CLI: switch account before creating PRs

On this machine `gh` is typically active on a different GitHub account that has no access to `mrojala/...` repos. To create PRs or use any other `gh` command for this repo, switch the active account first:

```bash
# One-time setup (additive; does NOT touch any other account):
gh auth login --hostname github.com --git-protocol ssh   # pick "Login with a web browser", authenticate as mrojala

# Per-use:
gh auth switch --user mrojala         # activate the personal account
gh pr create ...                      # or any other gh command against this repo
gh auth switch --user <other-user>    # restore the previous active account when done
```

`gh auth status` lists all logged-in accounts with a `✓ Active account` marker on the current one.

Do **not** run `gh auth logout` — that would remove the account's stored token. Switching is enough.

### Commit / push rules
- Plain `git push` / `git pull` work fine — they use SSH via the `personal` host alias, independent of `gh`.
- Commit messages: imperative subject, short body when the "why" is non-obvious.
- Only create commits when asked.

## Board data
Snake and ladder positions live in `src/board/config.ts` (`SNAKES`, `LADDERS`). They are a best read of the physical board photo — expect corrections. Row band colours are in `ROW_COLOURS` in the same file.

## Finnish copy
All player-facing text must be Finnish. Canonical title is **Käärmeet ja tikapuut** (see [fi.wikipedia.org/wiki/Käärmeet_ja_tikapuut](https://fi.wikipedia.org/wiki/K%C3%A4%C3%A4rmeet_ja_tikapuut)). When translating, verify uncommon terms against Finnish Wikipedia rather than guessing.
