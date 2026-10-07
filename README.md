# cc-pet

A tiny ASCII pet that lives in the band above the Claude Code prompt. It blinks while you type, thinks while Claude thinks, moves while tools run, and cheers when the turn is done. The owl moves in first; 31 more are a `/pet` away.

```
   {O,O}   working
  /)_)     Bash
——" "——
```

| Mood | When | Looks like |
| --- | --- | --- |
| idle | waiting for you | `{O,O}`, blinks every few seconds, sometimes winks `{O,-}` |
| thinking | a turn is running | `{o,O}` glancing sideways, `thinking...` dots cycling |
| working | a tool is running | sways side to side, the tool's name beside it |
| done | the turn answered | `{^,^}` in green for 3 s |
| oops | a tool or the turn failed | `{x,x}` with a red body |

## Pets

| Pet | While a tool runs | Pet | While a tool runs |
| --- | --- | --- | --- |
| owl | sways side to side | robot | blinks its antenna |
| cat | swishes its tail | raven | ruffles its wing |
| dog | pants | wolf | walks |
| rabbit | perks its ears | deer | grazes |
| bear | waves a paw | labrador | pants |
| frog | croaks | dolphin | splashes its tail |
| penguin | flaps its flippers | beaver | gnaws |
| pig | curls its tail | elephant | stomps |
| mouse | twitches its whiskers | lion | roars |
| fox | flicks its tail | golden | wags its tail |
| chick | flaps its wings | panda | eats bamboo |
| duck | paddles | cheetah | sprints |
| turtle | walks | parrot | flaps its wings |
| snail | leaves a trail | crab | snaps its claws |
| octopus | wiggles its arms | fish | blows bubbles |
| bat | folds its wings | ghost | wobbles |

The owl, cat, bear and fox, and the twelve pets from raven on, are drawn after [petsonality](https://github.com/nanami-he/petsonality) (MIT).

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
| `hooks/pets.ts` | the 32 pets: each one's art at rest and while a tool runs, `E` marking its eyes |
| `hooks/sprite.ts` | turns a pet into rows for a mood, eyes and frame, plus the caption |
| `types/index.d.ts` | the plugin's state contract (`species`, `mood`, `eyes`, `tool`, `frame`) |

To add a pet: name it in `PetSpecies` in `types/index.d.ts`, draw it in `hooks/pets.ts` (each line `rest#action#`, every row the same width), and run the tests; they check every pose of every pet.
