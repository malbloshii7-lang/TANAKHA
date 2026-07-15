/**
 * Global partners & endorsements shown on the Partnerships page.
 * Add or edit entries here — the page derives display color from `focus`.
 */

export type PartnerFocus = 'POLICY' | 'CLIMATE' | 'RESILIENCE' | 'TECHNOLOGY' | 'ENVIRONMENT' | 'ENERGY' | 'DATA'

export interface Partner {
  initial: string
  name: string
  focus: PartnerFocus
  description: string
}

export const PARTNERS: Partner[] = [
  {
    initial: 'C',
    name: 'ClimateWorks Foundation',
    focus: 'POLICY',
    description: 'Global climate policy research and implementation support across 40+ countries.',
  },
  {
    initial: 'B',
    name: 'Bill & Melinda Gates Foundation',
    focus: 'CLIMATE',
    description: 'Agricultural adaptation and climate-resilient food systems in developing regions.',
  },
  {
    initial: 'R',
    name: 'Rockefeller Foundation',
    focus: 'RESILIENCE',
    description: 'Climate resilience programmes targeting vulnerable urban and coastal communities worldwide.',
  },
  {
    initial: 'B',
    name: 'Bezos Earth Fund',
    focus: 'CLIMATE',
    description: 'Nature-based solutions and carbon sequestration technology development and deployment.',
  },
  {
    initial: 'G',
    name: 'Google.org',
    focus: 'TECHNOLOGY',
    description: 'AI-powered environmental monitoring and open data platform infrastructure.',
  },
  {
    initial: 'M',
    name: 'Microsoft Philanthropies',
    focus: 'TECHNOLOGY',
    description: 'Cloud infrastructure for climate data processing and accessibility in developing nations.',
  },
  {
    initial: 'A',
    name: 'Amazon Climate Pledge Fund',
    focus: 'CLIMATE',
    description: 'Sustainable logistics and supply chain decarbonisation investments.',
  },
  {
    initial: 'P',
    name: 'Packard Foundation',
    focus: 'ENVIRONMENT',
    description: 'Ocean conservation and marine ecosystem protection in climate-vulnerable coastal zones.',
  },
  {
    initial: 'H',
    name: 'Hewlett Foundation',
    focus: 'ENERGY',
    description: 'Clean energy transition policy and equitable energy access programme funding.',
  },
  {
    initial: 'B',
    name: 'Bloomberg Philanthropies',
    focus: 'DATA',
    description: 'City-level climate data platforms and mayor-led climate action networks.',
  },
]
