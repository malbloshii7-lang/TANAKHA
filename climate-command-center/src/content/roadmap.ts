/**
 * Implementation roadmap shown on Governance. Edit phases/milestones here
 * as the campaign progresses — mark milestones `done: true` as they land.
 */

export interface Milestone {
  text: string
  done: boolean
}

export type PhaseVariant = 'teal' | 'cyan' | 'lime' | 'amber'

export interface Phase {
  number: string
  variant: PhaseVariant
  status: 'IN PROGRESS' | 'UPCOMING' | 'PLANNED' | 'FUTURE'
  title: string
  period: string
  description: string
  milestones: Milestone[]
}

export const PHASES: Phase[] = [
  {
    number: '01',
    variant: 'teal',
    status: 'IN PROGRESS',
    title: 'Foundation',
    period: 'Q2 2026',
    description: 'Stakeholder mapping, bilateral meetings, and data platform launch. Establish the governance foundation at PAC-2 and FINAC-46.',
    milestones: [
      { text: 'Stakeholder mapping complete', done: true },
      { text: 'Bilateral meetings scheduled', done: true },
      { text: 'Data platform launched', done: true },
      { text: 'Finance framework agreed', done: false },
    ],
  },
  {
    number: '02',
    variant: 'cyan',
    status: 'UPCOMING',
    title: 'Campaign Launch',
    period: 'Q3 2026',
    description: 'Public announcement, partnership mobilization, and media strategy. Launch the coordination agenda at EC-80.',
    milestones: [
      { text: 'Public campaign announcement', done: false },
      { text: 'Partnership network mobilized', done: false },
      { text: 'Media strategy deployed', done: false },
      { text: 'SMART 2.0 roadmap published', done: false },
    ],
  },
  {
    number: '03',
    variant: 'lime',
    status: 'PLANNED',
    title: 'COP31 Momentum',
    period: 'Q4 2026',
    description: 'High-level advocacy, side events, and ministerial engagements. Maximize visibility at COP31.',
    milestones: [
      { text: 'High-level segment address', done: false },
      { text: 'Side events organized', done: false },
      { text: 'Ministerial engagements', done: false },
      { text: 'Bilateral agreements signed', done: false },
    ],
  },
  {
    number: '04',
    variant: 'amber',
    status: 'FUTURE',
    title: 'Election',
    period: 'Q2 2027',
    description: 'Regional consultations, voting bloc coordination, and Cg-20 preparation. Secure the mandate.',
    milestones: [
      { text: 'Regional consultations complete', done: false },
      { text: 'Voting blocs coordinated', done: false },
      { text: 'Cg-20 preparation finalized', done: false },
      { text: 'Mandate secured', done: false },
    ],
  },
]
