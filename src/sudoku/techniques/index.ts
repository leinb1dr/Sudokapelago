import { DIFFICULTIES } from '../types'
import type { Difficulty, HumanTechnique } from '../types'
import {
  applyCrossHatching,
  applyHiddenSingles,
  applyNakedSingles,
} from './easy'
import { applySwordfish } from './expert'
import { applyXWing, applyYWing } from './hard'
import {
  applyHiddenPairs,
  applyHiddenTriples,
  applyLockedCandidates,
  applyNakedPairs,
  applyNakedTriples,
  applyPointingPairsAndTriples,
} from './medium'

export {
  applyCrossHatching,
  applyHiddenPairs,
  applyHiddenSingles,
  applyHiddenTriples,
  applyLockedCandidates,
  applyNakedPairs,
  applyNakedSingles,
  applyNakedTriples,
  applyPointingPairsAndTriples,
  applySwordfish,
  applyXWing,
  applyYWing,
}

export const TECHNIQUE_TIERS: Readonly<
  Record<Difficulty, readonly HumanTechnique[]>
> = {
  easy: [
    { name: 'cross-hatching', apply: applyCrossHatching },
    { name: 'hidden-single', apply: applyHiddenSingles },
    { name: 'naked-single', apply: applyNakedSingles },
  ],
  medium: [
    { name: 'hidden-triple', apply: applyHiddenTriples },
    { name: 'hidden-pair', apply: applyHiddenPairs },
    { name: 'naked-triple', apply: applyNakedTriples },
    { name: 'naked-pair', apply: applyNakedPairs },
    { name: 'locked-candidates', apply: applyLockedCandidates },
    {
      name: 'pointing-pairs-triples',
      apply: applyPointingPairsAndTriples,
    },
  ],
  hard: [
    { name: 'y-wing', apply: applyYWing },
    { name: 'x-wing', apply: applyXWing },
  ],
  expert: [{ name: 'swordfish', apply: applySwordfish }],
}

export function getTechniquesForDifficulty(
  difficulty: Difficulty,
): HumanTechnique[] {
  const selectedTier = DIFFICULTIES.indexOf(difficulty)
  const techniques: HumanTechnique[] = []

  for (let tier = selectedTier; tier >= 0; tier -= 1) {
    techniques.push(...TECHNIQUE_TIERS[DIFFICULTIES[tier]])
  }

  return techniques
}
