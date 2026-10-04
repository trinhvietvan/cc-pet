# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

cc-pet is a Claude Code plugin built on **function hooks**, an early-access API (built and tested on Claude Code 2.1.289; it can change between releases). It draws an animated ASCII pet in the `AbovePrompt` band and lets the user swap among 20 pets with `/pet`.

## Commands

```
claude plugin validate .        # manifest + hooks module as the engine reads them; lists hooked events, $ calls, state reads/writes
claude plugin test .            # runs tests/*.test.tsx against the engine
claude --plugin-dir .           # load for one session; saving a file hot-reloads the module
```

There is no package.json or build step: the engine loads `hooks/register.tsx` directly. Type-checking is `tsc -p .`. `tsconfig.json` extends `.claude-plugin/types/tsconfig.json`, which the engine generates when it loads the plugin from a folder (gitignored, never edit it).

## Architecture

- `hooks/hooks.json` names the one module, `hooks/register.tsx`, which exports `register: Register`. Every hook is `($, e, next)`: `$` is the engine interface, and `next(e)` passes on to the engine's own behaviour.
- **State lives in `$.state` atoms, not module variables.** `species`, `mood`, `eyes`, `tool` and `frame` are `atom(...)`s read with `read($, atom)` while drawing and written with `update(...)` from event hooks. A hot reload re-runs `register` and `session.start` and wipes module variables (`pet.current` and `pet.running` are only timer mirrors), while atoms survive. A render hook may never write state.
- **State contract:** every atom key must be declared under `'cc-pet'` in `interface PluginState` in `types/index.d.ts` (named by `"types"` in `plugin.json`). `claude plugin validate` holds the module's state keys to that contract. `PetSpecies` there is the source of truth for which pets exist.
- **Persistence:** the chosen species is also written to `$.store` under the key `species`. `session.start` reads it back and registers the `/pet` command.
- **Mood flow:** `turn.start` sets thinking, `tool.call` sets tool (with error flashes), and `turn.complete` sets done, idle or error, with timed reverts through `$.clock.after`. The `ui.render` hook falls back to idle when `e.props.isWorking` is false, and yields to `next(e)` when `e.props.hasSurvey` is set.
- `hooks/pets.ts` is the catalog. Each pet is a `String.raw` block, one line per row, written `rest#action#`:
  - `rest` is the row at rest. `action` is the row shown on odd frames while a tool runs; leave it blank for rows that don't move.
  - `E` marks an eye, so `E` must not appear anywhere else in the art.
  - Every row of a pet must be the same width.
- `hooks/sprite.ts` is pure rendering. It turns a `Pet`, mood, eye state and frame into `Span[][]` (body and eye spans that the renderer colors) and builds the caption. A pet with exactly one `E` (profile view) gets the right-hand eye glyph, so winks still show.

## Adding a pet

1. Add the name to `PetSpecies` in `types/index.d.ts`.
2. Draw the pet in `PETS` in `hooks/pets.ts`.
3. Update the count in the `there are twenty pets` test.

The tests check width, eye count and that every pet moves while a tool runs, across every mood, eye state and frame.

## Test harness quirks

- Hooks a test registers with `on` sit beneath the plugin and stand in for the engine. Anything with no answer throws `no implementation for <event>`.
- Use `mock.store(on, entries?)` (from `claude-code/testing`) whenever the code under test touches `$.store`. The test's own `$` has no `$.store`.
- `session.start` does not fire on its own. To exercise it, answer it with `on('session.start', ($, e) => ({ cwd: e.cwd }))`, then call `await $.session.start({ cwd, surface: 'terminal', isInteractive: true })`.
- UI tests mount `AbovePrompt` through `$.ui.mount` and loop over `['terminal', 'desktop']`.
- Engine API reference: the engine generates `.claude-plugin/types/claude-code/index.d.ts` (about 14k lines). Grep it for an event or noun name.
