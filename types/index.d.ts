// What the pet is doing: drives its eyes, moving parts and caption.
export type PetMood = 'idle' | 'thinking' | 'tool' | 'done' | 'error'

// Blink cycle position; only shown while the mood allows blinking.
export type PetEyes = 'open' | 'half' | 'closed' | 'wink'

// Which pet lives in the band; picked with /pet, kept across sessions.
export type PetSpecies =
  | 'owl'
  | 'cat'
  | 'dog'
  | 'rabbit'
  | 'bear'
  | 'frog'
  | 'penguin'
  | 'pig'
  | 'mouse'
  | 'fox'
  | 'chick'
  | 'duck'
  | 'turtle'
  | 'snail'
  | 'crab'
  | 'octopus'
  | 'fish'
  | 'bat'
  | 'ghost'
  | 'robot'

declare module 'claude-code' {
  interface PluginState {
    'cc-pet': {
      species: PetSpecies
      mood: PetMood
      eyes: PetEyes
      // Name of the tool running right now (latest one when several run).
      tool: string | null
      // Animation tick while working — moving parts and "thinking..." dots.
      frame: number
    }
  }
}
