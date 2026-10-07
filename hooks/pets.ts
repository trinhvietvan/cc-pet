import type { PetSpecies } from '../types'

// One pet: its rows at rest, and the rows that change while a tool runs
// (null where the row stays as it is). Every row is `width` wide.
export type Pet = {
  species: PetSpecies
  label: string
  width: number
  rows: string[]
  action: (string | null)[]
}

// Each art line is `rest#action#`: the pet at rest, then the same row while a
// tool runs on odd frames (left blank when it doesn't move). `E` marks an eye,
// filled left to right, top to bottom; a pet seen from the side has one.
function pet(species: PetSpecies, label: string, art: string): Pet {
  const lines = art.split('\n').filter(line => line.trim() !== '')
  const rows: string[] = []
  const action: (string | null)[] = []
  for (const line of lines) {
    const [rest = '', moving = ''] = line.split('#')
    rows.push(rest)
    action.push(moving.trim() === '' ? null : moving)
  }
  return { species, label, width: rows[0]?.length ?? 0, rows, action }
}

export const PETS: Record<PetSpecies, Pet> = {
  owl: pet('owl', 'Owl', String.raw`
  \   / #   \   /#
  {E,E} #   {E,E}#
  /)_)  #        #
——" "—— #        #
`),
  cat: pet('cat', 'Cat', String.raw`
 /\_/\   #         #
( E.E )  #         #
 > ^ <   #         #
(_____)~ #(_____)~~#
`),
  dog: pet('dog', 'Dog', String.raw`
 /^ ^\ #       #
/ E E \#       #
V\ Y /V#       #
 / - \ # / U \ #
`),
  rabbit: pet('rabbit', 'Rabbit', String.raw`
 (\(\  # /)/)  #
 (E.E) #       #
o(")(")#       #
`),
  bear: pet('bear', 'Bear', String.raw`
 c  .-.  C #           #
( E  .  E )#           #
(   ww    )#(d  ww    )#
  d|   |b  #   |   |b  #
`),
  frog: pet('frog', 'Frog', String.raw`
  _   _  #         #
 (E)-(E) #         #
(  ___  )#( \___/ )#
 \_____/ #         #
`),
  penguin: pet('penguin', 'Penguin', String.raw`
  ___  #       #
 (E>E) #       #
 ( : ) #_( : )_#
  ^ ^  #       #
`),
  pig: pet('pig', 'Pig', String.raw`
 ^    ^ #        #
( E  E )#        #
( (oo) )#        #
 "    " # "    "@#
`),
  mouse: pet('mouse', 'Mouse', String.raw`
(_)  (_)#        #
 (E  E) #        #
= \__/ =#=-\__/-=#
`),
  fox: pet('fox', 'Fox', String.raw`
 /\  /\ #        #
( E.E  )#        #
 > ^ <  #        #
  /_\~~~#  /_\~~>#
`),
  chick: pet('chick', 'Chick', String.raw`
  ,,,  #       #
 (EvE) #       #
 (   ) #\(   )/#
  ^ ^  #       #
`),
  duck: pet('duck', 'Duck', String.raw`
   __    #         #
 <(E )___#         #
  ( ._> /#         #
   '---' #  ~'---'~#
`),
  turtle: pet('turtle', 'Turtle', String.raw`
   ____    #           #
 _/____\(E)#           #
  "    "   #   "  "    #
`),
  snail: pet('snail', 'Snail', String.raw`
 E E  .--. #           #
 \ /_( @ ) #           #
 (________)#~(________)#
`),
  crab: pet('crab', 'Crab', String.raw`
(\/)   (\/)#(||)   (||)#
 \_E___E_/ #           #
 /(_____)\ #           #
 / /   \ \ #           #
`),
  octopus: pet('octopus', 'Octopus', String.raw`
  .---.  #         #
 ( E E ) #         #
 ~/~|~\~ # ~\~|~/~ #
`),
  fish: pet('fish', 'Fish', String.raw`
   ____  #   ____ o#
\ /  E \ #         #
/ \____/ #         #
`),
  bat: pet('bat', 'Bat', String.raw`
 /\ ^ ^ /\ #    ^ ^    #
/  (E E)  \#  |(E E)|  #
\/\/ v \/\/#  \/ v \/  #
`),
  ghost: pet('ghost', 'Ghost', String.raw`
 .---. #       #
( E E )#       #
|  o  |#       #
'^'^'^'#^'^'^'^#
`),
  robot: pet('robot', 'Robot', String.raw`
   _|_   #   _*_   #
 [ E E ] #         #
 [_===_] #         #
  /|_|\  #         #
`),
  raven: pet('raven', 'Raven', String.raw`
<(E)    #        #
 (\ \_  # (\\ \_ #
  \\//  #        #
--" "---#        #
`),
  wolf: pet('wolf', 'Wolf', String.raw`
 _Λ/ᐠ      #           #
(E   |__  )#           #
 \\  /   - #           #
 |  |  ||  #  | |  ||  #
`),
  deer: pet('deer', 'Deer', String.raw`
\Y/  \Y/#        #
 (E v E)#        #
 /| |\  # /|_|\  #
_/   \_ #        #
`),
  labrador: pet('labrador', 'Labrador', String.raw`
   __/\  #         #
 __/E )  #         #
O     \  #         #
 U \___\-#UU \___\~#
`),
  dolphin: pet('dolphin', 'Dolphin', String.raw`
 _.-~E) #        #
<(   ^ /#        #
 \_.  / #        #
        #    \   #
`),
  beaver: pet('beaver', 'Beaver', String.raw`
 n____n #        #
(E    E)#        #
( >TT< )#(=>TT<=)#
 ${'`'}----' #        #
`),
  elephant: pet('elephant', 'Elephant', String.raw`
 __  ___ #         #
( E  |  )#         #
 \ |_  | #         #
 _) |__| # _) |_ | #
`),
  lion: pet('lion', 'Lion', String.raw`
{*|_W_|*}#         #
( E   E )#         #
{ = ^ = }#{ = V = }#
 * *~~* *#         #
`),
  golden: pet('golden', 'Golden', String.raw`
  . " .  #         #
 /|E  E|\#         #
{/(_0_)\}#         #
  " " "  #  " " "~~#
`),
  panda: pet('panda', 'Panda', String.raw`
  n __ n  #          #
 / E  E \ #          #
 (  ww  ) # (  ====) #
( --  -- )#( ||  || )#
`),
  cheetah: pet('cheetah', 'Cheetah', String.raw`
 /\_/\  ~ # /\_/\~~~~#
(E . E)   #          #
 >.v.<    #          #
/|'.|\    #_/' .\_   #
`),
  parrot: pet('parrot', 'Parrot', String.raw`
   ,__  #        #
 >(E  ) #~>(E  )~#
  \\__/ #        #
   |||  #        #
`),
}

export const SPECIES = Object.keys(PETS) as PetSpecies[]

export function isSpecies(value: unknown): value is PetSpecies {
  return typeof value === 'string' && Object.hasOwn(PETS, value)
}
