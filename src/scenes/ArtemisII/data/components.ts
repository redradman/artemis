export type ComponentInfo = {
  purpose: string
  notes?: string
  [key: string]: string | undefined
}

export type RocketComponent = {
  id: string
  short: string
  name: string
  info: ComponentInfo
}

export const components: RocketComponent[] = [
  {
    id: 'launch-abort-system',
    short: 'LAS',
    name: 'LAUNCH ABORT SYSTEM',
    info: {
      purpose: 'Pulls the crew module clear of the stack during an ascent abort.',
      thrust: '400 kN',
      jettison: 'T+00:03:20',
    },
  },
  {
    id: 'crew-module',
    short: 'CM',
    name: 'CREW MODULE',
    info: {
      purpose: 'Pressurized habitat for the four-person crew through the mission.',
      crew: '4',
      diameter: '5.02 m',
    },
  },
  {
    id: 'service-module',
    short: 'SM',
    name: 'SERVICE MODULE',
    info: {
      purpose: 'Propulsion, power, and life-support consumables for Orion.',
      provider: 'ESA',
      deltaV: '1,340 m/s',
    },
  },
  {
    id: 'orion-stage-adapter',
    short: 'OSA',
    name: 'ORION STAGE ADAPTER',
    info: {
      purpose: 'Structural adapter between Orion and the ICPS upper stage.',
      diameter: '5.0 / 5.5 m',
    },
  },
  {
    id: 'icps',
    short: 'ICPS',
    name: 'INTERIM CRYOGENIC PROPULSION STAGE',
    info: {
      purpose: 'Single-engine upper stage that performs the trans-lunar injection burn.',
      engine: '1 × RL10',
      propellant: 'LH2 / LOX',
    },
  },
  {
    id: 'lvsa',
    short: 'LVSA',
    name: 'LAUNCH VEHICLE STAGE ADAPTER',
    info: {
      purpose: 'Conical adapter joining the Core Stage to the ICPS.',
      height: '8.4 m',
    },
  },
  {
    id: 'core-lox',
    short: 'LOX',
    name: 'CORE · LOX TANK',
    info: {
      purpose: 'Liquid oxygen tank — forward section of the Core Stage.',
      capacity: '742,000 LITERS LOX',
    },
  },
  {
    id: 'intertank',
    short: 'INT',
    name: 'INTERTANK',
    info: {
      purpose: 'Structural ring between the LOX and LH2 tanks; SRB attach points.',
    },
  },
  {
    id: 'core-lh2',
    short: 'LH2',
    name: 'CORE · LH2 TANK',
    info: {
      purpose: 'Liquid hydrogen tank feeding the four RS-25 core engines.',
      capacity: '2,000,000 LITERS LH2',
    },
  },
  {
    id: 'core-engines',
    short: 'RS-25',
    name: 'CORE ENGINES',
    info: {
      purpose: 'Four RS-25 engines provide main-stage thrust through MECO.',
      thrust: '7.2 MN (cluster)',
    },
  },
  {
    id: 'left-srb',
    short: 'SRB-L',
    name: 'LEFT SRB',
    info: {
      purpose: 'Five-segment solid rocket booster on the port side.',
      thrust: '16.0 MN',
      jettison: 'T+00:02:12',
    },
  },
  {
    id: 'right-srb',
    short: 'SRB-R',
    name: 'RIGHT SRB',
    info: {
      purpose: 'Five-segment solid rocket booster on the starboard side.',
      thrust: '16.0 MN',
      jettison: 'T+00:02:12',
    },
  },
]
