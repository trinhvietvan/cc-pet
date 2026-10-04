import type { PetEyes, PetMood } from '../types'
import type { Pet } from './pets'

// A run of text in one role; the renderer maps roles to colors.
export type Span = { text: string; role: 'body' | 'eye' }

export type Caption = { label: string; detail: string | null }

// Eyes while open, per mood: thinking glances sideways. done and error
// hold their eyes through the blink cycle.
const OPEN_EYES: Record<PetMood, [string, string]> = {
  idle: ['O', 'O'],
  thinking: ['o', 'O'],
  tool: ['O', 'O'],
  done: ['^', '^'],
  error: ['x', 'x'],
}

const BLINK_EYES: Record<Exclude<PetEyes, 'open'>, [string, string]> = {
  half: ['o', 'o'],
  closed: ['-', '-'],
  wink: ['O', '-'],
}

export function eyeGlyphs(mood: PetMood, eyes: PetEyes): [string, string] {
  if (eyes === 'open' || mood === 'done' || mood === 'error') return OPEN_EYES[mood]
  return BLINK_EYES[eyes]
}

// The pet's rows for this moment, eyes split out as their own spans. While a
// tool runs, odd frames swap in the pet's action rows (wings, tail, claws...).
export function petRows(pet: Pet, mood: PetMood, eyes: PetEyes, frame: number): Span[][] {
  const glyphs = eyeGlyphs(mood, eyes)
  const moving = mood === 'tool' && frame % 2 === 1
  const lines = pet.rows.map((row, i) => (moving ? (pet.action[i] ?? row) : row))
  // A pet in profile shows its one eye as the right one, so a wink still blinks it.
  const oneEyed = lines.join('').split('E').length === 2
  let seen = 0

  return lines.map(line => {
    const spans: Span[] = []
    for (const [i, part] of line.split('E').entries()) {
      if (i > 0) spans.push({ text: glyphs[oneEyed ? 1 : seen++ % 2]!, role: 'eye' })
      if (part !== '') spans.push({ text: part, role: 'body' })
    }
    return spans
  })
}

export function caption(mood: PetMood, tool: string | null, frame: number): Caption {
  switch (mood) {
    case 'thinking':
      return { label: 'thinking' + '.'.repeat((frame % 3) + 1), detail: null }
    case 'tool':
      return { label: 'working', detail: tool }
    case 'done':
      return { label: 'done!', detail: null }
    case 'error':
      return { label: 'oops', detail: null }
    default:
      return { label: '', detail: null }
  }
}
