# cc-pet

A tiny ASCII pet that lives in the band above the Claude Code prompt. It blinks while you type, thinks while Claude thinks, moves while tools run, and cheers when the turn is done. The owl moves in first; 19 more are a `/pet` away.

```
  ,_,
 (O,O)    working
/(   )\   Bash
 -"-"-
```

| Mood | When | Looks like |
| --- | --- | --- |
| idle | waiting for you | `(O,O)`, blinks every few seconds, sometimes winks `(O,-)` |
| thinking | a turn is running | `(o,O)` glancing sideways, `thinking...` dots cycling |
| working | a tool is running | wings flap `/(   )\`, the tool's name beside it |
| done | the turn answered | `(^,^)` in green for 3 s |
| oops | a tool or the turn failed | `(x,x)` with a red body |

## Pets

| Pet | While a tool runs | Pet | While a tool runs |
| --- | --- | --- | --- |
| owl | flaps its wings | duck | paddles |
| cat | swishes its tail | turtle | walks |
| dog | pants | snail | leaves a trail |
| rabbit | perks its ears | crab | snaps its claws |
| bear | raises its paws | octopus | wiggles its arms |
| frog | croaks | fish | blows bubbles |
| penguin | flaps its flippers | bat | folds its wings |
| pig | curls its tail | ghost | wobbles |
| mouse | twitches its whiskers | robot | blinks its antenna |
| fox | swishes its tail | chick | flaps its wings |

```
/pet            list the pets
/pet cat        swap the cat in
/pet random     any pet but the one you have
```

The pick is kept across sessions.

Colors follow [Catppuccin Mocha](https://github.com/catppuccin/catppuccin), the same palette as [cc-hud](https://github.com/trinhvietvan/cc-hud). Collapse the band any time with `ctrl+x ctrl+a` or its `[-]` mark.

## Install

cc-pet is a plugin of **function hooks**, an early-access Claude Code API (built and tested on Claude Code 2.1.289). The API can change between releases.

From GitHub:

```
/plugin marketplace add trinhvietvan/cc-pet
/plugin install cc-pet@cc-pet
```

From a local clone (read straight from the folder, so an edit plus `/reload-plugins` picks it up):

```
claude plugin marketplace add /path/to/cc-pet
claude plugin install cc-pet@cc-pet
```

## Develop

```
claude --plugin-dir /path/to/cc-pet     # load for one session; saving a file hot-reloads it
claude plugin validate /path/to/cc-pet  # what the module hooks and calls, and anything the engine would refuse
claude plugin test /path/to/cc-pet      # runs tests/*.test.tsx against the engine
```

| File | What it is |
| --- | --- |
| `hooks/register.tsx` | the hooks: mood from `turn.start` / `tool.call` / `turn.complete`, the blink loop, the `/pet` command, and the `AbovePrompt` drawing |
| `hooks/pets.ts` | the 20 pets: each one's art at rest and while a tool runs, `E` marking its eyes |
| `hooks/sprite.ts` | turns a pet into rows for a mood, eyes and frame, plus the caption |
| `types/index.d.ts` | the plugin's state contract (`species`, `mood`, `eyes`, `tool`, `frame`) |

To add a pet: name it in `PetSpecies` in `types/index.d.ts`, draw it in `hooks/pets.ts` (each line `rest#action#`, every row the same width), and run the tests; they check every pose of every pet.
