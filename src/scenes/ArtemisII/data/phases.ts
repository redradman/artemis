export type PhaseTier = 'major' | 'minor'

export type Phase = {
  id: string
  label: string
  tier: PhaseTier
  tplus: string
  t: number
}

export const phases: Phase[] = [
  { id: 'liftoff', label: 'LIFTOFF', tier: 'major', tplus: 'T+00:00:00', t: 0 },
  { id: 'max-q', label: 'MAX-Q', tier: 'major', tplus: 'T+00:01:12', t: 0.1 },
  { id: 'srb-sep', label: 'SRB SEP', tier: 'major', tplus: 'T+00:02:12', t: 0.17 },
  { id: 'las-jett', label: 'LAS JETT', tier: 'minor', tplus: 'T+00:03:20', t: 0.25 },
  { id: 'meco-core-sep', label: 'MECO / CORE SEP', tier: 'major', tplus: 'T+00:08:20', t: 0.38 },
  { id: 'icps-shut', label: 'ICPS SHUT', tier: 'minor', tplus: 'T+00:18:00', t: 0.48 },
  { id: 'tli-burn', label: 'TLI BURN', tier: 'major', tplus: 'T+01:30:00', t: 0.58 },
  { id: 'icps-sep', label: 'ICPS SEP', tier: 'minor', tplus: 'T+01:42:00', t: 0.68 },
  { id: 'lunar-flyby', label: 'LUNAR FLYBY', tier: 'major', tplus: 'T+04:05:00', t: 0.85 },
  { id: 'orion-return', label: 'ORION RETURN', tier: 'major', tplus: 'T+10:00:00', t: 1 },
]
