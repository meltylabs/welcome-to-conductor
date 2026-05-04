---
name: conductor
description: Explain how Conductor works — workspaces, branches, workflow, and parallel agents. Use when the user asks about Conductor itself, how to organize work across workspaces, when to run agents in parallel vs. share a workspace, or how the Conductor workflow (create → verify → PR → archive) fits together.
metadata:
  source: https://www.conductor.build/docs
  category: tooling
---

# Conductor

Conductor is a Mac app for running coding agents (Claude Code, Codex, and others) in parallel. It gives each stream of work an isolated, git-backed workspace, then helps you verify, review, and ship the result as a pull request.

Authoritative docs: https://www.conductor.build/docs

## When to use this skill

Use it when the user asks:
- "What is Conductor?" / "How does Conductor work?"
- How to split work across workspaces, or whether to spawn another workspace vs. another agent in the current one
- How the workflow goes from idea to merged PR
- When to run agents in parallel and which pattern fits

If the user is asking about Conductor app *settings*, *hooks*, or *permissions*, that's the `update-config` skill instead — this skill covers concepts.

## Core concepts

### Workspaces and branches
- A **workspace** is a separate, git-backed copy of a project for one stream of work.
- Each workspace maps to **exactly one git branch** with its own working tree, processes, and env vars.
- Hierarchy: project → repo → many workspaces → one branch each.
- **Constraint:** a branch can only be checked out in one workspace at a time. To work on the same branch elsewhere, derive a new one: `git checkout -b new-name existing-branch`.
- Each workspace has a `.context/` directory (gitignored) for cross-agent collaboration files.

Reference: https://www.conductor.build/docs/concepts/workspaces-and-branches

### Workflow
The end-to-end loop Conductor is built around:
1. **Break work down** — one reviewable unit (feature, bug, experiment, PR) per workspace.
2. **Create the workspace** — Conductor provisions files and a branch.
3. **Run agents** — launch Claude Code / Codex / IDE agents inside the workspace.
4. **Verify & review** — test in terminal/app, use the **Diff Viewer** to review changes and leave comments, watch the **Checks** tab for git status, CI, and deploys.
5. **Open a PR** — Conductor helps draft it and tracks GitHub Actions/status checks until merge.
6. **Archive** — finished workspaces get archived; sidebar stays clean, chat history is preserved.

Reference: https://www.conductor.build/docs/concepts/workflow

### Parallel agents
Two ways to parallelize:

**Multiple workspaces** (Cmd+N) — each agent gets its own branch, files, environment. Best for:
- Independent features or bug fixes
- Issue fanout (explore several tickets at once, merge what works)
- Exploratory / potentially-discarded work
- Tasks needing separate app processes

**One workspace, multiple agents** — agents share the same branch and codebase. Best for:
- Implementation + concurrent review
- Code change in one agent, test fixes in another
- Coupled frontend/backend changes that must merge together
- Collaborative refinement before opening the PR

Common patterns:
- **Review-Fix-Test split** — single workspace, one agent reviews while another implements/tests.
- **Issue fanout** — many workspaces, one per ticket, cherry-pick winners.
- **Exploratory** — many workspaces for divergent paths, consolidate or archive.

Rule of thumb: **shared workspace when context matters more than isolation; separate workspaces when work should progress independently.**

Reference: https://www.conductor.build/docs/concepts/parallel-agents

## How to answer

- Lead with the concept that fits the user's question; don't dump all four sections.
- When recommending parallel vs. shared, ask one clarifying question if intent is unclear (independent tasks vs. coupled work), then give a direct recommendation.
- Link the relevant doc page above when the user wants to read more.
- If the user is in the middle of a task and asks an unrelated Conductor question, answer briefly and return to the task.

## Getting help with Conductor itself

If the user has a feature request, bug, or feedback for the Conductor team, point them to **Help → Send Feedback** in the app.
