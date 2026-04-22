import * as THREE from 'three'

export type LabelSide = 'left' | 'right'

export type RocketComponent = {
  id: string
  label: string
  anchor: THREE.Vector3
  focus: THREE.Vector3
  focusRadius: number
  side: LabelSide
  offset: { x: number; y: number }
}

export const components: RocketComponent[] = [
  {
    id: 'launch-abort',
    label: 'LAUNCH ABORT SYSTEM',
    anchor: new THREE.Vector3(0, 66, 0),
    focus: new THREE.Vector3(0, 62, 0),
    focusRadius: 30,
    side: 'right',
    offset: { x: 0, y: -100 },
  },
  {
    id: 'abort-motor',
    label: 'ABORT MOTOR',
    anchor: new THREE.Vector3(0.55, 60, 0),
    focus: new THREE.Vector3(0, 59, 0),
    focusRadius: 20,
    side: 'right',
    offset: { x: 140, y: -20 },
  },
  {
    id: 'crew-module',
    label: 'CREW MODULE',
    anchor: new THREE.Vector3(0, 54.5, 2.3),
    focus: new THREE.Vector3(0, 54, 0),
    focusRadius: 25,
    side: 'left',
    offset: { x: -180, y: -40 },
  },
  {
    id: 'heat-shield',
    label: 'HEAT SHIELD',
    anchor: new THREE.Vector3(0, 52.2, -2.3),
    focus: new THREE.Vector3(0, 52, 0),
    focusRadius: 22,
    side: 'left',
    offset: { x: -180, y: 20 },
  },
  {
    id: 'solar-array',
    label: 'SOLAR ARRAY',
    anchor: new THREE.Vector3(6.5, 50.3, 6.5),
    focus: new THREE.Vector3(4, 50, 4),
    focusRadius: 30,
    side: 'right',
    offset: { x: 160, y: -30 },
  },
  {
    id: 'service-module',
    label: 'SERVICE MODULE',
    anchor: new THREE.Vector3(2.3, 50.3, 0),
    focus: new THREE.Vector3(0, 50, 0),
    focusRadius: 25,
    side: 'right',
    offset: { x: 170, y: 30 },
  },
  {
    id: 'icps',
    label: 'ICPS',
    anchor: new THREE.Vector3(2.55, 44, 0),
    focus: new THREE.Vector3(0, 44, 0),
    focusRadius: 28,
    side: 'right',
    offset: { x: 170, y: 0 },
  },
  {
    id: 'core-stage',
    label: 'CORE STAGE',
    anchor: new THREE.Vector3(-2.7, 32, 0),
    focus: new THREE.Vector3(0, 21, 0),
    focusRadius: 55,
    side: 'left',
    offset: { x: -180, y: -10 },
  },
  {
    id: 'intertank',
    label: 'INTERTANK',
    anchor: new THREE.Vector3(2.7, 24, 0),
    focus: new THREE.Vector3(0, 24, 0),
    focusRadius: 30,
    side: 'right',
    offset: { x: 170, y: 10 },
  },
  {
    id: 'lh2-tank',
    label: 'LH2 TANK',
    anchor: new THREE.Vector3(-2.7, 12, 0),
    focus: new THREE.Vector3(0, 12, 0),
    focusRadius: 45,
    side: 'left',
    offset: { x: -170, y: 20 },
  },
  {
    id: 'solid-booster',
    label: 'SOLID BOOSTER',
    anchor: new THREE.Vector3(7.9, 22, 0),
    focus: new THREE.Vector3(6, 22, 0),
    focusRadius: 45,
    side: 'right',
    offset: { x: 150, y: 0 },
  },
  {
    id: 'segment-joint',
    label: 'SEGMENT JOINT',
    anchor: new THREE.Vector3(-7.9, 12, 0),
    focus: new THREE.Vector3(-6, 12, 0),
    focusRadius: 25,
    side: 'left',
    offset: { x: -160, y: 30 },
  },
  {
    id: 'rs-25',
    label: 'RS-25 ENGINES',
    anchor: new THREE.Vector3(1.15, -5, 1.15),
    focus: new THREE.Vector3(0, -4, 0),
    focusRadius: 20,
    side: 'right',
    offset: { x: 180, y: 50 },
  },
  {
    id: 'aft-skirt',
    label: 'AFT SKIRT',
    anchor: new THREE.Vector3(-6, 0.5, 0),
    focus: new THREE.Vector3(-6, 0, 0),
    focusRadius: 15,
    side: 'left',
    offset: { x: -170, y: 40 },
  },
]
