export type PhaseTier = 'major' | 'minor'

export type Phase = {
  id: string
  label: string
  tier: PhaseTier
  tplus: string
  t: number
  desc: string
}

// Mission timing is drawn from the NASA Artemis II Reference Guide (2026) and
// the Artemis II Overview Timeline (FINAL, 1/8/2026). Ascent events to
// ICPS/Orion separation carry second-precision T+ values; later events use the
// timeline document's MET day/hour/minute notation rendered as elapsed T+ time.

export const phases: Phase[] = [
  // Source: Reference Guide p.40 (ascent graphic — "At Ignition, Time 00:00:00")
  {
    id: 'liftoff',
    label: 'LIFTOFF',
    tier: 'major',
    tplus: '00:00:00',
    t: 0,
    desc: 'Four RS-25 engines and two five-segment solid rocket boosters ignite at Launch Pad 39B, producing 8.8 million pounds of thrust to lift Orion and its crew off Earth.',
  },
  // Source: Reference Guide p.40 (ascent graphic — "Max Q, Time: 00:01:11, Speed 1,041 Mph, Altitude 43,795 ft")
  {
    id: 'max-q',
    label: 'MAX-Q',
    tier: 'minor',
    tplus: '00:01:11',
    t: 0.03,
    desc: 'SLS passes through maximum dynamic pressure at roughly 43,795 feet and 1,041 mph. The RS-25 engines throttle down briefly to ease aerodynamic loads on the vehicle structure.',
  },
  // Source: Reference Guide p.40 (ascent graphic — "SRB Separation 00:02:08") and p.50
  {
    id: 'srb-sep',
    label: 'SRB SEP',
    tier: 'major',
    tplus: '00:02:08',
    t: 0.08,
    desc: 'The twin solid rocket boosters burn out and are jettisoned at 148,384 feet. They splash into the Atlantic Ocean about 5.5 minutes after launch as the core stage continues ascending.',
  },
  // Source: Reference Guide p.40 (ascent graphic — "LAS Jettison 00:03:28") and p.98
  {
    id: 'las-jett',
    label: 'LAS JETT',
    tier: 'minor',
    tplus: '00:03:28',
    t: 0.14,
    desc: 'Once SLS successfully clears most of the atmosphere and the abort system is no longer needed, the jettison motor fires to pull the launch abort tower and ogive fairings away from Orion.',
  },
  // Source: Reference Guide p.40 (ascent graphic — "Core Stage MECO 00:08:06") and p.47
  {
    id: 'meco',
    label: 'MECO',
    tier: 'major',
    tplus: '00:08:06',
    t: 0.22,
    desc: 'The four RS-25 engines cut off at 511,884 feet and Mach 23. The core stage is now empty and its role in the ascent is complete.',
  },
  // Source: Reference Guide p.40 (ascent graphic — "Core Stage/ICPS Separation 00:08:18")
  {
    id: 'icps-sep',
    label: 'ICPS SEP',
    tier: 'minor',
    tplus: '00:08:18',
    t: 0.24,
    desc: 'Core stage and launch vehicle stage adapter separate from the ICPS and Orion. The core stage falls back and splashes into the Pacific Ocean about two hours later.',
  },
  // Source: Reference Guide p.40 (ascent graphic — "ICPS Perigee Raise Maneuver, Time: 00:49:52")
  {
    id: 'icps-prm',
    label: 'ICPS PRM',
    tier: 'minor',
    tplus: '00:49:52',
    t: 0.3,
    desc: "The ICPS RL10 engine fires for the perigee raise maneuver, lifting Orion's orbit clear of atmospheric drag. This sets up the larger apogee raise burn an hour later.",
  },
  // Source: Reference Guide p.40 (ascent graphic — "ICPS Apogee Raise Burn, Time: 01:48:48") and p.4 (24-hour orbit, 23.5-hour checkout)
  {
    id: 'icps-arb',
    label: 'ICPS ARB',
    tier: 'minor',
    tplus: '01:48:48',
    t: 0.36,
    desc: 'The ICPS fires a second time to raise apogee and place Orion in a 24-hour highly elliptical orbit. The crew begins a 23.5-hour checkout of spacecraft systems.',
  },
  // Source: Reference Guide p.40 (ascent graphic — "Start ICPS/Orion Prox Ops Demo, Time: 03:25:41") and p.51–53
  {
    id: 'prox-ops',
    label: 'PROX OPS',
    tier: 'minor',
    tplus: '03:25:41',
    t: 0.42,
    desc: 'Orion separates from the ICPS and performs a proximity operations demonstration, using optical targets on the upper stage and Orion stage adapter to simulate future rendezvous and docking operations.',
  },
  // Source: Timeline PDF FD02 (annotation "^Orion TLI - ~01/01:37") and Reference Guide p.4, p.51
  {
    id: 'tli',
    label: 'TLI BURN',
    tier: 'major',
    tplus: '25:37:00',
    t: 0.52,
    desc: "Orion's main engine fires for trans-lunar injection on flight day two, placing the spacecraft on a lunar free-return trajectory for the four-day outbound coast to the Moon.",
  },
  // Source: Timeline PDF FD06 (annotations "^Lunar Close Approach - 5/01:23:20", "Apollo 13 Max Distance - 04/21:02", "^ Max Earth Distance- 5/01:26:57") and Reference Guide p.4
  {
    id: 'lunar-flyby',
    label: 'LUNAR FLYBY',
    tier: 'major',
    tplus: '121:23:20',
    t: 0.78,
    desc: "Orion reaches closest approach on flight day five, flying about 4,047 miles past the lunar far side. Shortly after, the spacecraft passes Apollo 13's maximum distance and reaches its peak distance from Earth.",
  },
  // Source: Timeline PDF FD10 (annotation "^CM/SM Sep - 09/01:13") and Reference Guide p.4, p.104 (solar arrays jettisoned with SM)
  {
    id: 'cm-sm-sep',
    label: 'CM/SM SEP',
    tier: 'minor',
    tplus: '217:13:00',
    t: 0.92,
    desc: "About twenty minutes before entry interface the European service module separates and falls away with its solar arrays, leaving only the crew module to return through Earth's atmosphere.",
  },
  // Source: Timeline PDF FD10 (annotation "^Entry Interface - 09/01:33") and Reference Guide p.79
  {
    id: 'entry',
    label: 'ENTRY',
    tier: 'major',
    tplus: '217:33:00',
    t: 0.96,
    desc: 'The crew module enters the atmosphere at roughly 25,000 mph. The Avcoat heat shield ablates against temperatures near 5,000 °F as Orion decelerates toward its Pacific splashdown.',
  },
  // Source: Timeline PDF FD10 (annotation "^Splashdown - 09/01:46") and Reference Guide p.93
  {
    id: 'splashdown',
    label: 'SPLASHDOWN',
    tier: 'major',
    tplus: '217:46:00',
    t: 1,
    desc: 'Eleven parachutes deploy to slow the capsule from about 325 mph to under 20 mph. Orion splashes down in the Pacific Ocean off the coast of San Diego.',
  },
]
