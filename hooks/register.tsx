import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, Timer } from 'claude-code'

import type { PetEyes, PetMood, PetSpecies } from '../types'
import { isSpecies, PETS, SPECIES } from './pets'
import { caption, petRows } from './sprite'

const species = atom({ plugin: 'cc-pet', key: 'species' } as const, 'owl')
const mood = atom({ plugin: 'cc-pet', key: 'mood' } as const, 'idle')
const eyes = atom({ plugin: 'cc-pet', key: 'eyes' } as const, 'open')
const tool = atom({ plugin: 'cc-pet', key: 'tool' } as const, null)
const frame = atom({ plugin: 'cc-pet', key: 'frame' } as const, 0)

// Catppuccin Mocha — same palette as cc-hud.
const COLOR = {
  body: '#fab387',  // peach
  error: '#f38ba8', // red
  eye: '#f9e2af',   // amber
  happy: '#a6e3a1', // green
  label: '#6c7086', // overlay
  detail: '#89b4fa', // blue
}

const FRAME_MS = 300       // wing flap / dots cadence while working
const DONE_MS = 3000       // how long the happy face stays after a turn
const ERROR_MS = 1500      // flash after a failed tool call, mid-turn
const TURN_ERROR_MS = 5000 // after a turn that died on an error

const SPECIES_KEY = 'species' // $.store key: the pet picked last, across sessions

// Mirrors of the state the timers act on; a reload starts them over.
const pet: { current: PetMood; running: number; revert: Timer | undefined } = {
  current: 'idle',
  running: 0,
  revert: undefined,
}

async function setMood($: EngineInterface, next: PetMood, holdMs?: number, then: PetMood = 'idle') {
  pet.revert?.cancel()
  pet.revert = undefined
  pet.current = next
  await update($, mood, () => next)
  if (holdMs !== undefined) {
    pet.revert = $.clock.after(holdMs, () => {
      if (pet.current === next) void setMood($, then)
    })
  }
}

function later($: EngineInterface, ms: number): Promise<void> {
  return new Promise(resolve => $.clock.after(ms, resolve))
}

async function setEyes($: EngineInterface, value: PetEyes) {
  await update($, eyes, () => value)
}

async function blink($: EngineInterface) {
  await setEyes($, 'half')
  await later($, 60)
  await setEyes($, 'closed')
  await later($, 110)
  await setEyes($, 'half')
  await later($, 60)
  await setEyes($, 'open')
}

// Open for 2.5–5.5s, then a blink; now and then a double blink or a wink.
async function blinkLoop($: EngineInterface) {
  for (;;) {
    await later($, 2500 + Math.random() * 3000)
    const roll = Math.random()
    if (roll < 0.12) {
      await setEyes($, 'wink')
      await later($, 350)
      await setEyes($, 'open')
    } else {
      await blink($)
      if (roll < 0.32) {
        await later($, 140)
        await blink($)
      }
    }
  }
}

function tickFrame($: EngineInterface) {
  if (pet.current === 'thinking' || pet.current === 'tool') void update($, frame, n => (n + 1) % 600)
}

async function adopt($: EngineInterface, next: PetSpecies) {
  await update($, species, () => next)
  await $.store.set(SPECIES_KEY, next)
}

// `/pet` lists the pets, `/pet <name>` swaps one in, `/pet random` picks another.
async function petCommand($: EngineInterface, args: string): Promise<string> {
  const current = await read($, species)
  const wanted = args.trim().toLowerCase()
  if (wanted === '') {
    const names = SPECIES.map(name => (name === current ? `${name} (current)` : name))
    return `Pets: ${names.join(', ')}\nSwap with /pet <name>, or /pet random.`
  }

  const others = SPECIES.filter(name => name !== current)
  const picked = wanted === 'random' ? others[Math.floor(Math.random() * others.length)] : wanted
  if (!isSpecies(picked)) return `No pet named "${wanted}". Pick one of: ${SPECIES.join(', ')}.`
  if (picked === current) return `${PETS[picked].label} is already here.`

  await adopt($, picked)
  return `${PETS[picked].label} moved in.`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const stored = await $.store.get(SPECIES_KEY)
    if (isSpecies(stored)) await update($, species, () => stored)
    await $.command.register({
      name: 'pet',
      description: 'Pick the pet that lives above the prompt',
      argumentHint: '[name|random]',
      immediate: true,
    })
    void blinkLoop($)
    $.clock.every(FRAME_MS, () => tickFrame($))
    return next(e)
  })

  on('command.run', { command: 'pet' }, async ($, e) => ({ text: await petCommand($, e.args) }))

  on('turn.start', async ($, e, next) => {
    pet.running = 0
    await setMood($, 'thinking')
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    pet.running += 1
    await update($, tool, () => String(e.tool))
    await setMood($, 'tool')
    try {
      const result = await next(e)
      if (result.isError) await setMood($, 'error', ERROR_MS, 'thinking')
      return result
    } finally {
      pet.running = Math.max(0, pet.running - 1)
      if (pet.running === 0 && pet.current === 'tool') void setMood($, 'thinking')
    }
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) {
      pet.running = 0
      if (e.reason === 'answer') await setMood($, 'done', DONE_MS)
      else if (e.reason === 'aborted') await setMood($, 'idle')
      else await setMood($, 'error', TURN_ERROR_MS)
    }
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    let state = await read($, mood)
    // A turn can end without turn.complete reaching us (a reload mid-turn):
    // never keep looking busy once the engine says nothing is running.
    if (!e.props.isWorking && (state === 'thinking' || state === 'tool')) state = 'idle'

    const look = PETS[await read($, species)] ?? PETS.owl
    const tick = await read($, frame)
    const rows = petRows(look, state, await read($, eyes), tick)
    const text = caption(state, await read($, tool), tick)
    const bodyColor = state === 'error' ? COLOR.error : COLOR.body
    const eyeColor = state === 'done' ? COLOR.happy : COLOR.eye
    const roomForCaption = e.props.bodyColumns >= look.width + 16

    return (
      <Box flexDirection="row">
        <Box flexDirection="column" width={look.width}>
          {rows.map(row => (
            <Text color={bodyColor}>
              {row.map(span =>
                span.role === 'eye' ? <Text color={eyeColor}>{span.text}</Text> : span.text,
              )}
            </Text>
          ))}
        </Box>
        {roomForCaption && (
          <Box flexDirection="column" marginLeft={2} justifyContent="center">
            <Text color={COLOR.label}>{text.label}</Text>
            {text.detail !== null && (
              <Text color={COLOR.detail} wrap="truncate-end">
                {text.detail}
              </Text>
            )}
          </Box>
        )}
      </Box>
    )
  })
}
