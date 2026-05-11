# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A Conductor starter project: a single-page React 19 + TypeScript + Vite app where clicking (or pressing Space/Enter) dispatches an animated emoji train across the screen. It exists to give new Conductor workspaces something quick to install, run, edit, review, and ship.

Conductor runs each workspace as an isolated git worktree. `conductor.json` defines the two scripts Conductor invokes: `setup` (`npm install`) on workspace creation and `run` (`npm run dev`) when the user clicks Run.

## Commands

- `npm run dev` — Vite dev server (Conductor's Run button calls this)
- `npm run build` — type-check (`tsc -b`) then production build
- `npm run lint` — ESLint over the repo
- `npm run preview` — preview the built output

There is no test runner configured.

## Architecture

The entire app lives in `src/App.tsx`. Key things to know before editing it:

- **State model**: `trains` and `puffs` are arrays of independent animated entities, each with a unique id from a single `nextIdRef` counter. They are removed from state via their CSS `onAnimationEnd` handler — animation duration is the source of truth for lifetime, so changing CSS timings without updating `MIN_DURATION_MS`/`MAX_DURATION_MS` will desync the steam puffs that are scheduled with `setTimeout`.
- **Dispatch throttling**: rapid clicks are gated by `DISPATCH_THROTTLE_MS` against `performance.now()` in `lastDispatchRef`. Lane and direction also alternate via refs so consecutive trains don't overlap.
- **Audio**: a single `<audio>` element is created once in a ref and `cloneNode`'d per dispatch so overlapping plays don't cut each other off. Mute state persists in `localStorage` under `wtc:muted`, and `mutedRef` mirrors it so the keyboard/click handlers stay stable.
- **Styling**: positions use `vw`/`vh` and lanes are computed as `10 + lane * 16` (vh). The hero overlay hides itself via the `dispatched` class once `hasDispatched` flips.

## Conductor-specific conventions

- `.context/` is gitignored and intended for handoff notes between agents in the same workspace.
- `.claude/skills/` and `.agents/skills/` hold per-workspace skills bundles managed via `skills-lock.json` — don't hand-edit those.
- The PR template (`.github/pull_request_template.md`) is intentionally a one-line celebration message for the tutorial flow; keep PRs in this repo lightweight.
