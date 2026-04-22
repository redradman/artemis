export type PhaseTier = 'major' | 'minor'

export type Phase = {
  id: string
  label: string
  tier: PhaseTier
  tplus: string
  t: number
  desc: string
}

export const phases: Phase[] = [
  {
    id: 'liftoff',
    label: 'LIFTOFF',
    tier: 'major',
    tplus: '00:00:00',
    t: 0,
    desc: 'SLS ignites all four RS-25 engines and both solid rocket boosters at Launch Complex 39B, generating 39.1 MN of thrust.',
  },
  {
    id: 'srb-sep',
    label: 'SRB SEP',
    tier: 'major',
    tplus: '00:02:12',
    t: 0.14,
    desc: 'Solid rocket boosters burn out and are jettisoned into the Atlantic Ocean. Core stage continues powered ascent.',
  },
  {
    id: 'las-jett',
    label: 'LAS JETT',
    tier: 'minor',
    tplus: '00:03:15',
    t: 0.21,
    desc: 'With the crew safely through the dense atmosphere, the Launch Abort System is jettisoned from atop Orion.',
  },
  {
    id: 'meco',
    label: 'CORE SEP',
    tier: 'major',
    tplus: '00:08:18',
    t: 0.36,
    desc: 'Main engine cutoff. The orange core stage separates and falls back to Earth. Orion and ICPS continue on.',
  },
  {
    id: 'tli',
    label: 'TLI BURN',
    tier: 'major',
    tplus: '01:30:00',
    t: 0.56,
    desc: 'Trans-lunar injection. The ICPS fires for 18 minutes to accelerate Orion onto a free-return trajectory to the Moon.',
  },
  {
    id: 'icps-sep',
    label: 'ICPS SEP',
    tier: 'minor',
    tplus: '01:48:00',
    t: 0.72,
    desc: 'ICPS separates. Solar arrays deploy from the service module and Orion begins its 4-day coast to the Moon.',
  },
  {
    id: 'coast',
    label: 'LUNAR COAST',
    tier: 'major',
    tplus: '144:00:00',
    t: 0.88,
    desc: 'Orion flies past the Moon on April 6 at a distance of 8,900 km, setting a distance record for a crewed spacecraft.',
  },
  {
    id: 'reentry',
    label: 'REENTRY',
    tier: 'major',
    tplus: '240:34:00',
    t: 1,
    desc: 'Service module jettisoned. Crew module reenters at 40,000 km/h, heat shield peaks at 2,800°C. Splashdown in the Pacific April 10.',
  },
]
