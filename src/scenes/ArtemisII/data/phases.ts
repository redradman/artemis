export type PhaseTier = 'major' | 'minor'

export type Phase = {
  id: string
  label: string
  tier: PhaseTier
  tplus: string
  t: number
  desc: string
  significance: string
  sources: string[]
}

// Mission timing is drawn from the NASA Artemis II Reference Guide (2026) and
// the Artemis II Overview Timeline (FINAL, 1/8/2026). Ascent events to
// ICPS/Orion separation carry second-precision T+ values; later events use the
// timeline document's MET day/hour/minute notation rendered as elapsed T+ time.

export const phases: Phase[] = [
  // Source: Reference Guide p.40 (ascent graphic — "At Ignition, Time 00:00:00, Speed 0 Mph, Altitude 0 ft") and p.48, p.97
  {
    id: 'liftoff',
    label: 'LIFTOFF',
    tier: 'major',
    tplus: '00:00:00',
    t: 0,
    desc: 'At T-0 the four RS-25 engines, already running at 109% rated thrust, are joined by the twin five-segment solid rocket boosters to lift SLS off Launch Pad 39B. Together the stack generates 8.8 million pounds of thrust, with the boosters contributing roughly 75% for the first two minutes of flight. Orion and its four-person crew begin a roughly 10-day mission around the Moon.',
    significance: 'First crewed launch of SLS and Orion, opening Artemis deep-space human spaceflight.',
    sources: ['artemis-ii-reference-guide p.40', 'artemis-ii-reference-guide p.48', 'artemis-ii-reference-guide p.50', 'artemis-ii-reference-guide p.97'],
  },
  // Source: Reference Guide p.40 (ascent graphic — "Max Q, Time: 00:01:11, Speed 1,041 Mph, Altitude 43,795 ft") and p.47 (throttle bucket)
  {
    id: 'max-q',
    label: 'MAX-Q',
    tier: 'minor',
    tplus: '00:01:11',
    t: 0.03,
    desc: 'SLS passes through maximum dynamic pressure at 43,795 feet and 1,041 mph. The RS-25 engines are commanded into a throttle profile around this region to ease aerodynamic loads on the vehicle before returning to full thrust. The solid boosters, which cannot be throttled, continue burning at full output throughout.',
    significance: 'Peak aerodynamic stress on the stack; a structural test of the integrated vehicle.',
    sources: ['artemis-ii-reference-guide p.40', 'artemis-ii-reference-guide p.47'],
  },
  // Source: Reference Guide p.40 (ascent graphic — "SRB Separation 00:02:08, Speed 3,006 Mph, Altitude 148,384 ft") and p.50
  {
    id: 'srb-sep',
    label: 'SRB SEP',
    tier: 'major',
    tplus: '00:02:08',
    t: 0.08,
    desc: 'The twin boosters burn through 11,023 pounds of propellant per second, then are jettisoned at 148,384 feet and roughly 3,006 mph (Mach 4.3) about two minutes after liftoff. Sixteen booster separation motors push the spent cases clear of the core stage, and the empty boosters fall to an Atlantic splashdown about 5.5 minutes after launch. The core stage continues powered ascent on its four RS-25 engines.',
    significance: 'Sheds nearly three-quarters of the launch thrust hardware and most of the ascent mass.',
    sources: ['artemis-ii-reference-guide p.40', 'artemis-ii-reference-guide p.48', 'artemis-ii-reference-guide p.50'],
  },
  // Source: Reference Guide p.40 (ascent graphic — "LAS Jettison 00:03:28, Speed 4,487 Mph, Altitude 286,146 ft") and p.97–98
  {
    id: 'las-jett',
    label: 'LAS JETT',
    tier: 'minor',
    tplus: '00:03:28',
    t: 0.14,
    desc: 'With the vehicle above 286,146 feet and traveling 4,487 mph, the atmosphere is too thin for the launch abort system to be useful. The jettison motor — the only LAS motor that fires on every mission — pulls the abort tower and its ogive fairing panels away from Orion, shedding thousands of pounds of mass that would otherwise be carried into deep space.',
    significance: 'Commits the mission to orbit by discarding the crew escape tower.',
    sources: ['artemis-ii-reference-guide p.40', 'artemis-ii-reference-guide p.97', 'artemis-ii-reference-guide p.98'],
  },
  // Source: Reference Guide p.40 (ascent graphic — "Core Stage MECO 00:08:06, Speed 17,599 Mph, Altitude 511,884 ft") and p.41, p.47
  {
    id: 'meco',
    label: 'MECO',
    tier: 'major',
    tplus: '00:08:06',
    t: 0.22,
    desc: 'After about 480 seconds of powered flight the four RS-25 engines cut off at 511,884 feet and 17,599 mph — nearly Mach 23. The core stage has emptied its 537,000-gallon liquid hydrogen tank and 196,000-gallon liquid oxygen tank to deliver Orion and the ICPS to their insertion trajectory. Its role in the ascent is complete.',
    significance: 'End of SLS core-stage burn; Orion is effectively on an orbital trajectory.',
    sources: ['artemis-ii-reference-guide p.40', 'artemis-ii-reference-guide p.41', 'artemis-ii-reference-guide p.47'],
  },
  // Source: Reference Guide p.40 (ascent graphic — "Core Stage/ICPS Separation 00:08:18, Speed 17,627 Mph, Altitude 534,564 ft") and "Core Stage Pacific Splashdown Time: 02:08:23"
  {
    id: 'icps-sep',
    label: 'ICPS SEP',
    tier: 'minor',
    tplus: '00:08:18',
    t: 0.24,
    desc: 'Twelve seconds after MECO, the core stage and launch vehicle stage adapter separate from the ICPS and Orion at 534,564 feet and 17,627 mph. The spent core stage follows a ballistic trajectory and splashes into the Pacific Ocean about two hours after launch, while the ICPS assumes responsibility for pushing the spacecraft through the rest of the ascent.',
    significance: 'Hand-off from SLS core stage to the upper stage that will raise orbit and send Orion to the Moon.',
    sources: ['artemis-ii-reference-guide p.40', 'artemis-ii-reference-guide p.41'],
  },
  // Source: Reference Guide p.40 (ascent graphic — "ICPS Perigee Raise Maneuver, Time: 00:49:52") and p.51
  {
    id: 'icps-prm',
    label: 'ICPS PRM',
    tier: 'minor',
    tplus: '00:49:52',
    t: 0.3,
    desc: "The ICPS fires its single L3Harris RL10C-2 engine — 24,750 pounds of thrust, burning liquid hydrogen and liquid oxygen — for the perigee raise maneuver. The burn lifts the low point of Orion's orbit clear of atmospheric drag and sets up the larger apogee raise burn about an hour later. The ICPS will orbit Earth three times in support of the Artemis II profile.",
    significance: "First in-space burn of the mission; stabilizes Orion's orbit for the checkout coast.",
    sources: ['artemis-ii-reference-guide p.40', 'artemis-ii-reference-guide p.51'],
  },
  // Source: Reference Guide p.40 (ascent graphic — "ICPS Apogee Raise Burn, Time: 01:48:48") and p.4 (24-hour HEO, 23.5-hour checkout)
  {
    id: 'icps-arb',
    label: 'ICPS ARB',
    tier: 'minor',
    tplus: '01:48:48',
    t: 0.36,
    desc: "The ICPS RL10 fires a second time to raise apogee, placing Orion in a 24-hour highly elliptical high Earth orbit. At the start of this orbit the crew takes manual control of Orion for about two hours, executing targeting maneuvers to gather performance data. The remainder of the orbit is dedicated to a roughly 23.5-hour checkout of spacecraft systems, including the environmental control and life support system.",
    significance: 'Places Orion on its checkout orbit, the go/no-go test bed before committing to the Moon.',
    sources: ['artemis-ii-reference-guide p.40', 'artemis-ii-reference-guide p.4'],
  },
  // Source: Reference Guide p.40 (ascent graphic — "Start ICPS/Orion Prox Ops Demo, Time: 03:25:41, End ICPS/Orion Prox Ops Demo, Time: 04:53:36") and p.51–53
  {
    id: 'prox-ops',
    label: 'PROX OPS',
    tier: 'minor',
    tplus: '03:25:41',
    t: 0.42,
    desc: 'Orion separates from the ICPS and, with the upper stage as a passive target, performs a proximity operations demonstration that begins at T+03:25:41 and ends at T+04:53:36. The crew uses optical target assemblies on the ICPS and a centerline docking target on the Orion stage adapter diaphragm to assess handling qualities — a stand-in for the rendezvous and docking Artemis missions will need in the future.',
    significance: "Flight-tests Orion's handling qualities for future docking with a human landing system.",
    sources: ['artemis-ii-reference-guide p.40', 'artemis-ii-reference-guide p.51', 'artemis-ii-reference-guide p.53'],
  },
  // Source: Timeline PDF FD02 (annotation "^Orion TLI - ~01/01:37") and Reference Guide p.4, p.95
  {
    id: 'tli',
    label: 'TLI BURN',
    tier: 'major',
    tplus: '25:37:00',
    t: 0.52,
    desc: "On flight day two, Orion's European Service Module main engine — an orbital maneuvering system engine with six space shuttle flights in its history — fires for trans-lunar injection. The burn places Orion on a lunar free-return trajectory, committing the spacecraft to an outbound transit of roughly four days toward the Moon.",
    significance: 'Sends Orion beyond Earth orbit; the first crewed departure for deep space in over 50 years.',
    sources: ['artemis-ii-timeline FD02', 'artemis-ii-reference-guide p.4', 'artemis-ii-reference-guide p.95'],
  },
  // Source: Timeline PDF FD06 (annotations "^Lunar Close Approach - 5/01:23:20", "Apollo 13 Max Distance - 04/21:02", "^ Max Earth Distance- 5/01:26:57") and Reference Guide p.4
  {
    id: 'lunar-flyby',
    label: 'LUNAR FLYBY',
    tier: 'major',
    tplus: '121:23:20',
    t: 0.78,
    desc: 'On flight day five Orion reaches lunar close approach, passing roughly 4,700 miles (7,600 km) beyond the far side of the Moon. Roughly three minutes later the spacecraft records its maximum distance from Earth, having already surpassed the Apollo 13 distance record earlier in the transit. Gravity does the work — no engine burn is required — and the spacecraft is slung onto a return trajectory.',
    significance: 'First crewed lunar flyby since Apollo 17; peak science observation of the far side.',
    sources: ['artemis-ii-timeline FD06', 'artemis-ii-reference-guide p.4'],
  },
  // Source: Timeline PDF FD10 (annotation "^CM/SM Sep - 09/01:13") and Reference Guide p.94, p.95
  {
    id: 'cm-sm-sep',
    label: 'CM/SM SEP',
    tier: 'minor',
    tplus: '217:13:00',
    t: 0.92,
    desc: 'About twenty minutes before entry interface, the Airbus-built European Service Module separates from the crew module and is discarded, taking with it the four solar array wings, the main engine, and the propellant tanks. Only the 16.5-foot-diameter crew module, shielded by its Avcoat heat shield, continues toward Earth.',
    significance: 'Lightens Orion for entry and commits the capsule to atmospheric return.',
    sources: ['artemis-ii-timeline FD10', 'artemis-ii-reference-guide p.94', 'artemis-ii-reference-guide p.95'],
  },
  // Source: Timeline PDF FD10 (annotation "^Entry Interface - 09/01:33") and Reference Guide p.79, p.80
  {
    id: 'entry',
    label: 'ENTRY',
    tier: 'major',
    tplus: '217:33:00',
    t: 0.96,
    desc: "The crew module strikes the upper atmosphere at roughly 25,000 mph. Its 16.5-foot ablative Avcoat heat shield — composed of 186 machined blocks bonded to a titanium skeleton — chars and peels away in a controlled fashion against temperatures near 5,000 °F, about half the surface temperature of the Sun. The Avcoat is a reformulated version of the material flown on Apollo capsules.",
    significance: 'Hardest test of the heat shield; the capsule faces lunar-return velocities no LEO spacecraft endures.',
    sources: ['artemis-ii-timeline FD10', 'artemis-ii-reference-guide p.79', 'artemis-ii-reference-guide p.80'],
  },
  // Source: Timeline PDF FD10 (annotation "^Splashdown - 09/01:46") and Reference Guide p.80, p.92, p.93, p.94
  {
    id: 'splashdown',
    label: 'SPLASHDOWN',
    tier: 'major',
    tplus: '217:46:00',
    t: 1,
    desc: 'At about 23,000 feet the forward bay cover is jettisoned, and an 11-parachute sequence — three forward bay parachutes, two drogues, three pilots, and three mains of 36,000 square feet of canopy — slows Orion from about 325 mph to 20 mph or less. Within roughly 10 minutes the capsule splashes down in the Pacific Ocean off the coast of San Diego, where NASA and Department of War recovery teams retrieve the crew.',
    significance: 'Mission ends safely in the Pacific; recovery returns crew, capsule, and data to Kennedy.',
    sources: ['artemis-ii-timeline FD10', 'artemis-ii-reference-guide p.80', 'artemis-ii-reference-guide p.92', 'artemis-ii-reference-guide p.93', 'artemis-ii-reference-guide p.94'],
  },
]
