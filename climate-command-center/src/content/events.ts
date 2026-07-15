/**
 * Governance calendar — single source for Home's upcoming-events strip
 * and the full Governance timeline. Add/edit events here; both pages
 * pick up the change automatically.
 */

export interface TimelineEvent {
  code: string
  name: string
  date: string
  type: 'WMO' | 'Global'
  opportunity: string
  description: string
  priority: 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'DECISIVE'
  priorityVariant: 'amber' | 'rose' | 'gradient'
  status: 'past' | 'present' | 'future'
  side: 'left' | 'right'
  highlight?: boolean
}

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    code: 'PAC-2',
    name: 'Programme Advisory Committee, 2nd Session',
    date: 'April 30, 2026',
    type: 'WMO',
    opportunity: 'BILATERAL ENGAGEMENT',
    description:
      'High-level bilateral meetings with key member state representatives. Opportunity to advance the SMART 2.0 framework in informal settings.',
    priority: 'MEDIUM',
    priorityVariant: 'amber',
    status: 'past',
    side: 'left',
  },
  {
    code: 'FINAC-46',
    name: 'Finance Advisory Committee, 46th Session',
    date: 'June 18, 2026',
    type: 'WMO',
    opportunity: 'FINANCE NEGOTIATIONS',
    description:
      'Climate finance platform negotiations and bilateral coordination on the $2Bn multilateral mechanism structure.',
    priority: 'HIGH',
    priorityVariant: 'rose',
    status: 'past',
    side: 'right',
  },
  {
    code: 'EC-80',
    name: 'Executive Council, 80th Session',
    date: 'June 22, 2026',
    type: 'WMO',
    opportunity: 'CAMPAIGN LAUNCH',
    description:
      'Launch the coordination agenda. Announce second-term strategic priorities and the SMART 2.0 implementation roadmap.',
    priority: 'CRITICAL',
    priorityVariant: 'rose',
    status: 'present',
    side: 'left',
    highlight: true,
  },
  {
    code: 'COP-31',
    name: 'UN Climate Change Conference',
    date: 'November 9, 2026',
    type: 'Global',
    opportunity: 'GLOBAL PLATFORM',
    description:
      'High-level segment address. Bilateral engagements with key state delegations. Maximum visibility opportunity.',
    priority: 'CRITICAL',
    priorityVariant: 'rose',
    status: 'future',
    side: 'right',
  },
  {
    code: 'Cg-20',
    name: 'World Climate Congress, 20th Session',
    date: 'May 3, 2027',
    type: 'WMO',
    opportunity: 'MANDATE DECISION',
    description:
      'Mobilize voting blocs. Final coordination push for the 2027–2031 mandate. The culmination of the governance timeline.',
    priority: 'DECISIVE',
    priorityVariant: 'gradient',
    status: 'future',
    side: 'left',
  },
]
