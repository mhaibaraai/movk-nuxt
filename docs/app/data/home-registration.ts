import type { homeCopy } from './home'

export type RegistrationCopy = (typeof homeCopy)['en']['demo']

export const attendanceModes = ['online', 'inPerson'] as const
export const workshopTracks = ['foundations', 'handsOn'] as const
export const workshopSessions = ['morning', 'afternoon'] as const

export interface RegistrationDetails {
  name: string
  email: string
  attendance: typeof attendanceModes[number]
  track: typeof workshopTracks[number]
  seats: number
  session?: typeof workshopSessions[number]
  organization?: string
}

export interface Registration extends RegistrationDetails {
  id: number
}

export const exampleRegistrations: Registration[] = [
  { id: 1, name: 'Lin Chen', email: 'lin@example.com', attendance: 'online', track: 'foundations', seats: 1 },
  { id: 2, name: 'Sam Park', email: 'sam@example.com', attendance: 'inPerson', track: 'handsOn', session: 'morning', seats: 3, organization: 'Studio North' },
  { id: 3, name: 'Alex Lee', email: 'alex@example.com', attendance: 'inPerson', track: 'foundations', session: 'afternoon', seats: 1 },
  { id: 4, name: 'Robin Huang', email: 'robin@example.com', attendance: 'online', track: 'handsOn', seats: 2, organization: 'Fieldwork' },
  { id: 5, name: 'Noah Kim', email: 'noah@example.com', attendance: 'inPerson', track: 'handsOn', session: 'afternoon', seats: 1 },
  { id: 6, name: 'Avery Wu', email: 'avery@example.com', attendance: 'online', track: 'foundations', seats: 1 }
]
