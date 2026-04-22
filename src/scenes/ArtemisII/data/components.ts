import * as THREE from 'three'
import type { StageId } from '../lib/stateAt'

export type LabelSide = 'left' | 'right'

export type ComponentInfo = {
  purpose: string
  notes?: string
  [key: string]: string | undefined
}

export type RocketComponent = {
  id: string
  label: string
  kicker: string
  short: string
  info: ComponentInfo
  anchor: THREE.Vector3
  focus: THREE.Vector3
  focusRadius: number
  side: LabelSide
  offset: { x: number; y: number }
  stage: StageId
}

// Hardware facts are drawn from the NASA Artemis II Reference Guide (2026) and
// SLS Reference Guide where noted. Source pages appear in a comment above
// each entry. Numbers are quoted from the source documents; speculative or
// unsourced figures are omitted rather than estimated.

export const components: RocketComponent[] = [
  // Source: Reference Guide pp.97–98 (LAS description + motors); Quick Facts p.127
  {
    id: 'launch-abort',
    label: 'LAUNCH ABORT SYSTEM',
    kicker: 'LOCKHEED MARTIN',
    short: 'LAS',
    info: {
      purpose:
        "Tower-mounted escape rocket on top of Orion, built to pull the crew module clear of a failing SLS in milliseconds. During a nominal flight it jettisons once SLS has successfully cleared most of the atmosphere and the system is no longer needed.",
      height: '50 ft (15.2 m)',
      diameter: '3 ft (1 m) tower',
      mass: '17,000 lb (7.7 t)',
      thrust: '400,000 lb peak',
      jettison: 'T+00:03:28',
    },
    anchor: new THREE.Vector3(0, 66, 0),
    focus: new THREE.Vector3(0, 62, 0),
    focusRadius: 30,
    side: 'right',
    offset: { x: 0, y: -20 },
    stage: 'las',
  },
  // Source: Reference Guide p.98 (Abort Motor); Quick Facts p.127
  {
    id: 'abort-motor',
    label: 'ABORT MOTOR',
    kicker: 'NORTHROP GRUMMAN',
    short: 'AM',
    info: {
      purpose:
        'High-impulse solid motor inside the launch abort tower with a manifold of four exhaust nozzles. Burns most of its propellant within the first three seconds and, if needed, can accelerate Orion from zero to 400–500 mph in just two seconds.',
      thrust: '400,000 lb (1,779 kN)',
      burn: '~3 s',
      nozzles: '4',
      propellant: '4,700 lb (2,131 kg)',
      mass: '7,600 lb (3.4 t)',
    },
    anchor: new THREE.Vector3(0.55, 60, 0),
    focus: new THREE.Vector3(0, 59, 0),
    focusRadius: 20,
    side: 'right',
    offset: { x: 0, y: -5 },
    stage: 'las',
  },
  // Source: Reference Guide p.78 (Crew Module); Quick Facts p.128
  {
    id: 'crew-module',
    label: 'CREW MODULE',
    kicker: 'LOCKHEED MARTIN',
    short: 'CM',
    info: {
      purpose:
        'Pressurized Orion capsule where four astronauts live and work on the journey to the Moon and back. It is the only portion of Orion that returns to Earth, with a habitable volume about the size of two minivans.',
      crew: '4',
      height: '11 ft (3.4 m)',
      diameter: '16.5 ft (5.0 m)',
      habitable: '330 ft³ (9.3 m³)',
      mass: '22,900 lb (10.4 t)',
    },
    anchor: new THREE.Vector3(0, 54.5, 2.3),
    focus: new THREE.Vector3(0, 54, 0),
    focusRadius: 25,
    side: 'left',
    offset: { x: 0, y: -15 },
    stage: 'crew',
  },
  // Source: Reference Guide p.80 (Heat Shield) and p.79 (re-entry temperatures)
  {
    id: 'heat-shield',
    label: 'HEAT SHIELD',
    kicker: 'LOCKHEED MARTIN',
    short: 'HS',
    info: {
      purpose:
        "World's largest ablative heat shield, 16.5 feet across and built from 186 machined blocks of Avcoat. During re-entry it sheds temperatures near 5,000 °F — about half as hot as the surface of the Sun.",
      material: 'AVCOAT',
      diameter: '16.5 ft (5.0 m)',
      blocks: '186',
      peakTemp: '~5,000 °F (2,760 °C)',
      reentry: '~25,000 mph',
    },
    anchor: new THREE.Vector3(0, 52.2, -2.3),
    focus: new THREE.Vector3(0, 52, 0),
    focusRadius: 22,
    side: 'left',
    offset: { x: 0, y: 10 },
    stage: 'crew',
  },
  // Source: Reference Guide p.96 (service module power) and Quick Facts p.128
  {
    id: 'solar-array',
    label: 'SOLAR ARRAY',
    kicker: 'ESA · AIRBUS',
    short: 'SOLAR',
    info: {
      purpose:
        'Four deployable solar wings on the European service module. Each wing has three 6.5-foot panels, and the four together hold 15,000 gallium arsenide cells, generating about 11 kilowatts of regenerable power for the spacecraft.',
      wings: '4',
      cells: '15,000 GaAs',
      length: '62 ft (18.9 m) deployed',
      power: '11 kW',
      panels: '3 per wing',
    },
    // Anchor sits on the service-module body edge at the +x/+z wing-root
    // quadrant (radius ~2.3), so the leader lands on solid SM geometry
    // regardless of solarDeploy state (wing panels scale in/out, the SM
    // barrel does not).
    anchor: new THREE.Vector3(1.6, 50.3, 1.6),
    focus: new THREE.Vector3(0, 50, 0),
    focusRadius: 28,
    side: 'right',
    offset: { x: 0, y: -15 },
    stage: 'sm',
  },
  // Source: Reference Guide pp.94–95 (European Service Module); Quick Facts p.128
  {
    id: 'service-module',
    label: 'SERVICE MODULE',
    kicker: 'ESA · AIRBUS',
    short: 'SM',
    info: {
      purpose:
        'European-built propulsion and utility bay mounted below the crew module. Supplies Orion with propellant, water, oxygen, and nitrogen, and provides the main engine used for orbital maneuvers and the trans-lunar injection burn.',
      height: '15.7 ft (4.8 m)',
      diameter: '16.5 ft (5.0 m)',
      engines: '1 main + 8 aux + 24 RCS',
      mainThrust: '6,000 lb (26.7 kN)',
      mass: '34,300 lb (15.6 t)',
    },
    anchor: new THREE.Vector3(2.3, 50.3, 0),
    focus: new THREE.Vector3(0, 50, 0),
    focusRadius: 25,
    side: 'right',
    offset: { x: 0, y: 15 },
    stage: 'sm',
  },
  // Source: Reference Guide p.51 (ICPS) and SLS Block 1 by the Numbers p.70
  {
    id: 'icps',
    label: 'ICPS',
    kicker: 'BOEING · ULA',
    short: 'ICPS',
    info: {
      purpose:
        'Interim Cryogenic Propulsion Stage — a modified Delta cryogenic second stage from ULA with a single RL10 engine. Performs the perigee and apogee raise burns that lift Orion into high Earth orbit, then serves as a passive target for the proximity-operations demonstration.',
      engine: 'RL10C-2 (L3Harris)',
      height: '45 ft (13.7 m)',
      diameter: '16.7 ft (5.09 m)',
      thrust: '24,750 lb (110.1 kN)',
      propellant: 'LH2 / LOX',
    },
    anchor: new THREE.Vector3(2.55, 44, 0),
    focus: new THREE.Vector3(0, 44, 0),
    focusRadius: 28,
    side: 'right',
    offset: { x: 0, y: 0 },
    stage: 'icps',
  },
  // Source: Reference Guide p.41 (Core Stage) and SLS Block 1 by the Numbers p.69
  {
    id: 'core-stage',
    label: 'CORE STAGE',
    kicker: 'BOEING · MICHOUD',
    short: 'CORE',
    info: {
      purpose:
        'The tallest single rocket stage NASA has ever flown, at 212 feet. Holds 733,000 gallons of cryogenic LH2 and LOX, feeds four RS-25 engines through roughly 480 seconds of ascent, and carries the structural attach points for both solid rocket boosters.',
      height: '212 ft (64.6 m)',
      diameter: '27.6 ft (8.4 m)',
      massFueled: '2.4M lb (1,089 t)',
      propellant: '733,000 gal LH2+LOX',
      burn: '~480 s',
    },
    anchor: new THREE.Vector3(-2.7, 32, 0),
    focus: new THREE.Vector3(0, 21, 0),
    focusRadius: 55,
    side: 'left',
    offset: { x: 0, y: -5 },
    stage: 'core',
  },
  // Source: Reference Guide p.43 (Intertank)
  {
    id: 'intertank',
    label: 'INTERTANK',
    kicker: 'BOEING · MICHOUD',
    short: 'INTER',
    info: {
      purpose:
        'Aluminum barrel between the LOX and LH2 tanks. It carries the forward attach points for the two solid rocket boosters and contains several avionics components. It is the only core-stage section that is bolted together instead of welded.',
      height: '21.8 ft (6.64 m)',
      diameter: '27.6 ft (8.41 m)',
      construction: 'BOLTED (NOT WELDED)',
      function: 'SRB FORWARD ATTACH',
    },
    anchor: new THREE.Vector3(2.7, 24, 0),
    focus: new THREE.Vector3(0, 24, 0),
    focusRadius: 30,
    side: 'right',
    offset: { x: 0, y: 5 },
    stage: 'core',
  },
  // Source: Reference Guide p.43 (Liquid Hydrogen Fuel Tank) and p.46 (LH2 temperature)
  {
    id: 'lh2-tank',
    label: 'LH2 TANK',
    kicker: 'BOEING · MICHOUD',
    short: 'LH2',
    info: {
      purpose:
        'Core-stage liquid hydrogen tank, 130 feet tall and built from five friction-stir-welded barrel sections. Holds 537,000 gallons (2 million liters) of −423 °F LH2 that feeds the four RS-25 engines during the first-stage ascent.',
      height: '130 ft (39.6 m)',
      diameter: '27.6 ft (8.41 m)',
      volume: '537,000 gal (2M L)',
      temperature: '−423 °F (−253 °C)',
      feeds: '4 × RS-25',
    },
    anchor: new THREE.Vector3(-2.7, 12, 0),
    focus: new THREE.Vector3(0, 12, 0),
    focusRadius: 45,
    side: 'left',
    offset: { x: 0, y: 10 },
    stage: 'core',
  },
  // Source: Reference Guide p.48 (Solid Rocket Boosters) and SLS Block 1 by the Numbers p.70
  {
    id: 'solid-booster',
    label: 'SOLID BOOSTER',
    kicker: 'NORTHROP GRUMMAN',
    short: 'SRB-R',
    info: {
      purpose:
        'Five-segment solid rocket booster derived from shuttle hardware. Each booster weighs 1.6 million pounds when filled and burns more than 11,000 pounds of solid propellant per second for about 126 seconds, providing roughly 75 percent of SLS liftoff thrust.',
      height: '177 ft (53.9 m)',
      diameter: '12 ft (3.7 m)',
      massLoaded: '1.6M lb (726 t)',
      thrust: '3.3M lb (14,679 kN)',
      burn: '~126 s',
    },
    anchor: new THREE.Vector3(7.9, 22, 0),
    focus: new THREE.Vector3(6, 22, 0),
    focusRadius: 45,
    side: 'right',
    offset: { x: 0, y: 0 },
    stage: 'srbR',
  },
  // Source: Reference Guide p.50 (Motor Assembly) and p.57 (booster manufacturing)
  {
    id: 'segment-joint',
    label: 'SEGMENT JOINT',
    kicker: 'NORTHROP GRUMMAN',
    short: 'SJ',
    info: {
      purpose:
        "Interface where two of the booster's five propellant segments join. After factory checkout at Northrop Grumman's Utah site, the steel-cased segments ship by rail to Kennedy and are stacked vertically onto the aft assembly.",
      segments: '5 per booster',
      case: 'STEEL (REUSED STS)',
      propellant: 'PBAN',
      stackSite: 'KSC VAB',
    },
    anchor: new THREE.Vector3(-7.9, 12, 0),
    focus: new THREE.Vector3(-6, 12, 0),
    focusRadius: 25,
    side: 'left',
    offset: { x: 0, y: 15 },
    stage: 'srbL',
  },
  // Source: Reference Guide pp.45–47 (RS-25 Engine) and SLS Block 1 by the Numbers p.69
  {
    id: 'rs-25',
    label: 'RS-25 ENGINES',
    kicker: 'L3HARRIS · AEROJET',
    short: 'RS-25',
    info: {
      purpose:
        'Four upgraded Space Shuttle Main Engines burn liquid hydrogen and oxygen through a staged-combustion cycle. The RS-25 fleet has accumulated more than 3,000 starts and 1 million seconds of ground and flight hot-fire experience, and each engine runs at up to 109 percent of rated thrust during ascent.',
      count: '4',
      thrustVac: '512,300 lb (2,279 kN)',
      thrustLaunch: '418,000 lb (1,859 kN)',
      propellant: 'LH2 / LOX',
      burn: '~480 s',
    },
    anchor: new THREE.Vector3(1.15, -5, 1.15),
    focus: new THREE.Vector3(0, -4, 0),
    focusRadius: 20,
    side: 'right',
    offset: { x: 0, y: 0 },
    stage: 'core',
  },
  // Source: Reference Guide p.50 (Aft Assembly) and Quick Facts p.35 (vehicle support posts)
  {
    id: 'aft-skirt',
    label: 'AFT SKIRT',
    kicker: 'NORTHROP GRUMMAN',
    short: 'AFT',
    info: {
      purpose:
        'Base of each solid rocket booster, housing the thrust vector control system that gimbals the exhaust nozzle to steer SLS. The two aft skirts rest on eight vehicle support posts that carry the full weight of the stack on the mobile launcher.',
      tvc: 'GIMBALS NOZZLE',
      steering: '~75% OF SLS',
      bsm: '4 PER SKIRT',
      supportPosts: '4 PER BOOSTER',
    },
    anchor: new THREE.Vector3(-6, 0.5, 0),
    focus: new THREE.Vector3(-6, 0, 0),
    focusRadius: 15,
    side: 'left',
    offset: { x: 0, y: 20 },
    stage: 'srbL',
  },
]
