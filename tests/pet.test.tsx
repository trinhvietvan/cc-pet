import { expect, mock, test } from 'claude-code/testing'

import { PETS, SPECIES } from '../hooks/pets'
import { caption, eyeGlyphs, petRows } from '../hooks/sprite'

const rowText = (row: { text: string }[]) => row.map(span => span.text).join('')
const eyesOf = (rows: { role: string }[][]) => rows.flat().filter(span => span.role === 'eye').length

const MOODS = ['idle', 'thinking', 'tool', 'done', 'error'] as const
const EYES = ['open', 'half', 'closed', 'wink'] as const

const BAND = {
  hasSurvey: false,
  isWorking: false,
  maxRows: 10,
  bodyColumns: 80,
  scroll: { offset: 0, bodyRows: 9 },
  view: {},
}

test('there are twenty pets', async () => {
  expect(SPECIES.length).toBe(20)
})

test('every pet keeps its width and its eyes in every pose', async () => {
  for (const name of SPECIES) {
    const pet = PETS[name]
    expect(pet.rows.length).toBe(pet.action.length)
    const restEyes = eyesOf(petRows(pet, 'idle', 'open', 0))
    expect(restEyes === 1 || restEyes === 2).toBe(true)
    for (const mood of MOODS) {
      for (const eyes of EYES) {
        for (const frame of [0, 1]) {
          const rows = petRows(pet, mood, eyes, frame)
          for (const row of rows) expect(`${name}: ${rowText(row).length}`).toBe(`${name}: ${pet.width}`)
          expect(`${name}: ${eyesOf(rows)}`).toBe(`${name}: ${restEyes}`)
        }
      }
    }
  }
})

test('every pet moves while a tool runs', async () => {
  for (const name of SPECIES) {
    const rest = petRows(PETS[name], 'tool', 'open', 0).map(rowText)
    const moving = petRows(PETS[name], 'tool', 'open', 1).map(rowText)
    expect(`${name}: ${rest.join('|') !== moving.join('|')}`).toBe(`${name}: true`)
  }
})

test('blink cycle shows through the eyes', async () => {
  expect(eyeGlyphs('idle', 'open')).toEqual(['O', 'O'])
  expect(eyeGlyphs('idle', 'half')).toEqual(['o', 'o'])
  expect(eyeGlyphs('idle', 'closed')).toEqual(['-', '-'])
  expect(eyeGlyphs('idle', 'wink')).toEqual(['O', '-'])
})

test('done and error keep their eyes while blinking', async () => {
  expect(eyeGlyphs('done', 'closed')).toEqual(['^', '^'])
  expect(eyeGlyphs('error', 'half')).toEqual(['x', 'x'])
})

test('a pet in profile winks with its one eye', async () => {
  expect(rowText(petRows(PETS.duck, 'idle', 'open', 0)[1]!)).toBe(' <(O )___')
  expect(rowText(petRows(PETS.duck, 'idle', 'wink', 0)[1]!)).toBe(' <(- )___')
})

test('owl wings flap on odd frames only while a tool runs', async () => {
  expect(rowText(petRows(PETS.owl, 'tool', 'open', 1)[2]!)).toBe('/(   )\\')
  expect(rowText(petRows(PETS.owl, 'tool', 'open', 0)[2]!)).toBe(' (   ) ')
  expect(rowText(petRows(PETS.owl, 'thinking', 'open', 1)[2]!)).toBe(' (   ) ')
})

test('caption names the running tool and cycles thinking dots', async () => {
  expect(caption('tool', 'Bash', 0)).toEqual({ label: 'working', detail: 'Bash' })
  expect(caption('thinking', null, 0).label).toBe('thinking.')
  expect(caption('thinking', null, 2).label).toBe('thinking...')
  expect(caption('idle', null, 0).label).toBe('')
})

test('draws the idle owl above the prompt', async $ => {
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'cc-pet', surface, component: 'AbovePrompt', props: BAND })
    expect(await ui.find({ type: 'Text', text: /,_,/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /\(O,O\)/ })).toBeDefined()
    await ui.unmount()
  }
})

test('/pet lists the pets, swaps one in and picks at random', async ($, on) => {
  mock.store(on)

  const listed = await $.command.run({ command: 'pet', args: '' })
  expect(listed.text).toContain('owl (current)')

  const swapped = await $.command.run({ command: 'pet', args: 'Cat' })
  expect(swapped.text).toBe('Cat moved in.')

  const ui = await $.ui.mount({ plugin: 'cc-pet', surface: 'terminal', component: 'AbovePrompt', props: BAND })
  expect(await ui.find({ type: 'Text', text: /\( O\.O \)/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /,_,/ })).toBeUndefined()
  await ui.unmount()

  const unknown = await $.command.run({ command: 'pet', args: 'dragon' })
  expect(unknown.text).toContain('No pet named "dragon"')

  const random = await $.command.run({ command: 'pet', args: 'random' })
  expect(random.text).toContain('moved in.')
  expect(random.text).not.toContain('Cat')
})

test('the pet picked last session moves back in', async ($, on) => {
  mock.store(on, { species: 'fox' })
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/work', surface: 'terminal', isInteractive: true })
  const ui = await $.ui.mount({ plugin: 'cc-pet', surface: 'terminal', component: 'AbovePrompt', props: BAND })
  expect(await ui.find({ type: 'Text', text: /\\ v \// })).toBeDefined()
  await ui.unmount()
})

test('yields the band to a survey', async ($, on) => {
  // Stands in for the engine drawing its survey beneath the plugins.
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>survey</Text>
  })
  const ui = await $.ui.mount({
    plugin: 'cc-pet',
    surface: 'terminal',
    component: 'AbovePrompt',
    props: { ...BAND, hasSurvey: true },
  })
  expect(await ui.find({ type: 'Text', text: 'survey' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /,_,/ })).toBeUndefined()
  await ui.unmount()
})
