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
  short: string
  info: ComponentInfo
  anchor: THREE.Vector3
  focus: THREE.Vector3
  focusRadius: number
  side: LabelSide
  offset: { x: number; y: number }
  stage: StageId
}

export const components: RocketComponent[] = [
  {
    id: 'launch-abort',
    label: 'LAUNCH ABORT SYSTEM',
    short: 'LAS',
    info: {
      purpose:
        'Tower-mounted escape rocket that pulls the crew module clear of a failing booster during ascent. Jettisoned after the high-risk window.',
      height: '14 m',
      mass: '7.2 t',
      jettison: 'T+00:03:24',
    },
    anchor: new THREE.Vector3(0, 66, 0),
    focus: new THREE.Vector3(0, 62, 0),
    focusRadius: 30,
    side: 'right',
    offset: { x: 0, y: -100 },
    stage: 'las',
  },
  {
    id: 'abort-motor',
    label: 'ABORT MOTOR',
    short: 'AM',
    info: {
      purpose:
        'Solid-propellant motor inside the launch abort tower. Four reverse-flow nozzles generate lateral thrust to separate the capsule from the stack.',
      thrust: '400 klb',
      burn: '5 s',
    },
    anchor: new THREE.Vector3(0.55, 60, 0),
    focus: new THREE.Vector3(0, 59, 0),
    focusRadius: 20,
    side: 'right',
    offset: { x: 140, y: -20 },
    stage: 'las',
  },
  {
    id: 'crew-module',
    label: 'CREW MODULE',
    short: 'CM',
    info: {
      purpose:
        'Pressurised Orion capsule carrying four astronauts. Provides life support, avionics, and a return-home heat shield for the lunar flyby mission.',
      crew: '4',
      diameter: '5.0 m',
      volume: '20 m³',
    },
    anchor: new THREE.Vector3(0, 54.5, 2.3),
    focus: new THREE.Vector3(0, 54, 0),
    focusRadius: 25,
    side: 'left',
    offset: { x: -180, y: -40 },
    stage: 'crew',
  },
  {
    id: 'heat-shield',
    label: 'HEAT SHIELD',
    short: 'HS',
    info: {
      purpose:
        'Ablative shield on the base of the crew module. Absorbs and sheds re-entry heat above 2,700 °C during the 11 km/s return from lunar distance.',
      material: 'AVCOAT',
      diameter: '5.0 m',
    },
    anchor: new THREE.Vector3(0, 52.2, -2.3),
    focus: new THREE.Vector3(0, 52, 0),
    focusRadius: 22,
    side: 'left',
    offset: { x: -180, y: 20 },
    stage: 'crew',
  },
  {
    id: 'solar-array',
    label: 'SOLAR ARRAY',
    short: 'SOLAR',
    info: {
      purpose:
        'Four deployable wings on the service module. Each wing tracks the Sun and generates the electrical power Orion needs during the translunar cruise.',
      wings: '4',
      power: '11 kW',
    },
    anchor: new THREE.Vector3(6.5, 50.3, 6.5),
    focus: new THREE.Vector3(4, 50, 4),
    focusRadius: 30,
    side: 'right',
    offset: { x: 160, y: -30 },
    stage: 'sm',
  },
  {
    id: 'service-module',
    label: 'SERVICE MODULE',
    short: 'SM',
    info: {
      purpose:
        'European-built propulsion and utility bus that mates below Orion. Carries consumables and the main engine used for course corrections and lunar injection burns.',
      diameter: '4.1 m',
      propellant: '8.6 t',
    },
    anchor: new THREE.Vector3(2.3, 50.3, 0),
    focus: new THREE.Vector3(0, 50, 0),
    focusRadius: 25,
    side: 'right',
    offset: { x: 170, y: 30 },
    stage: 'sm',
  },
  {
    id: 'icps',
    label: 'ICPS',
    short: 'ICPS',
    info: {
      purpose:
        'Interim Cryogenic Propulsion Stage. A single RL10 engine on a hydrogen-oxygen upper stage pushes Orion out of Earth orbit onto a translunar trajectory.',
      engine: 'RL10B-2',
      thrust: '24.8 klb',
      burn: '18 min',
    },
    anchor: new THREE.Vector3(2.55, 44, 0),
    focus: new THREE.Vector3(0, 44, 0),
    focusRadius: 28,
    side: 'right',
    offset: { x: 170, y: 0 },
    stage: 'icps',
  },
  {
    id: 'core-stage',
    label: 'CORE STAGE',
    short: 'CORE',
    info: {
      purpose:
        'The SLS core: a 65 m aluminum-lithium cylinder housing liquid hydrogen and liquid oxygen tanks. Feeds four RS-25 engines for 8 minutes of ascent burn.',
      height: '64.6 m',
      diameter: '8.4 m',
      propellant: '979 t',
    },
    anchor: new THREE.Vector3(-2.7, 32, 0),
    focus: new THREE.Vector3(0, 21, 0),
    focusRadius: 55,
    side: 'left',
    offset: { x: -180, y: -10 },
    stage: 'core',
  },
  {
    id: 'intertank',
    label: 'INTERTANK',
    short: 'INTER',
    info: {
      purpose:
        'Stiffened barrel between the LOX and LH2 tanks. Carries the structural attachments for the two solid rocket boosters and houses flight avionics.',
      height: '6.7 m',
    },
    anchor: new THREE.Vector3(2.7, 24, 0),
    focus: new THREE.Vector3(0, 24, 0),
    focusRadius: 30,
    side: 'right',
    offset: { x: 170, y: 10 },
    stage: 'core',
  },
  {
    id: 'lh2-tank',
    label: 'LH2 TANK',
    short: 'LH2',
    info: {
      purpose:
        'Holds 2,032,000 L of liquid hydrogen at –253 °C. Feeds the core stage RS-25 engines alongside the LOX tank above it during first-stage flight.',
      volume: '2,032,000 L',
      temperature: '–253 °C',
    },
    anchor: new THREE.Vector3(-2.7, 12, 0),
    focus: new THREE.Vector3(0, 12, 0),
    focusRadius: 45,
    side: 'left',
    offset: { x: -170, y: 20 },
    stage: 'core',
  },
  {
    id: 'solid-booster',
    label: 'SOLID BOOSTER',
    short: 'SRB-R',
    info: {
      purpose:
        'Five-segment solid rocket booster derived from Shuttle hardware. Provides 75% of liftoff thrust then jettisons two minutes into ascent.',
      thrust: '3.6 Mlb',
      burn: '126 s',
    },
    anchor: new THREE.Vector3(7.9, 22, 0),
    focus: new THREE.Vector3(6, 22, 0),
    focusRadius: 45,
    side: 'right',
    offset: { x: 150, y: 0 },
    stage: 'srbR',
  },
  {
    id: 'segment-joint',
    label: 'SEGMENT JOINT',
    short: 'SJ',
    info: {
      purpose:
        'Field joint between two booster propellant segments. Redesigned after STS-51L with triple O-rings and a capture feature for positive sealing at ignition.',
      seals: '3 O-rings',
    },
    anchor: new THREE.Vector3(-7.9, 12, 0),
    focus: new THREE.Vector3(-6, 12, 0),
    focusRadius: 25,
    side: 'left',
    offset: { x: -160, y: 30 },
    stage: 'srbL',
  },
  {
    id: 'rs-25',
    label: 'RS-25 ENGINES',
    short: 'RS-25',
    info: {
      purpose:
        'Four refurbished Shuttle main engines clustered on the core-stage base. Burn LOX/LH2 at 109% rated thrust for full first-stage duration.',
      count: '4',
      thrust: '512 klb vac',
    },
    anchor: new THREE.Vector3(1.15, -5, 1.15),
    focus: new THREE.Vector3(0, -4, 0),
    focusRadius: 20,
    side: 'right',
    offset: { x: 180, y: 50 },
    stage: 'core',
  },
  {
    id: 'aft-skirt',
    label: 'AFT SKIRT',
    short: 'AFT',
    info: {
      purpose:
        'Structural base of each solid rocket booster. Houses the thrust-vector control actuators and the booster separation motors used at jettison.',
      tvc: '2 actuators',
    },
    anchor: new THREE.Vector3(-6, 0.5, 0),
    focus: new THREE.Vector3(-6, 0, 0),
    focusRadius: 15,
    side: 'left',
    offset: { x: -170, y: 40 },
    stage: 'srbL',
  },
]
