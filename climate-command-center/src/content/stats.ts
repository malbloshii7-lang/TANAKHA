/**
 * Campaign-wide headline stats and data provenance.
 * Edit this file to update figures shown across Home, Footer, and the
 * Data Intelligence hero — do not hardcode these numbers elsewhere.
 */

export const DATA_VINTAGE = 'World Bank Open Data, retrieved July 2026'
export const DATA_VINTAGE_SHORT = 'July 2026'
export const CAMPAIGN_CYCLE = '2027–2031'
export const FRAMEWORK_VERSION = 'SMART 2.0'

export interface HeadlineMetric {
  label: string
  value: number
  unit: string
  sublabel?: string
  delta: string
  tone: 'amber' | 'rose' | 'lime' | 'muted'
}

export const HEADLINE_METRICS: HeadlineMetric[] = [
  {
    label: 'GLOBAL CO2 EMISSIONS',
    value: 4.69,
    unit: 't / capita',
    delta: '0.8% from 2023',
    tone: 'amber',
  },
  {
    label: 'REGIONAL EMISSIONS GAP',
    value: 19.5,
    unit: 'x disparity',
    delta: 'Critical inequity indicator',
    tone: 'rose',
  },
  {
    label: 'TOP RENEWABLE ENERGY SHARE',
    value: 75.8,
    unit: '% of consumption',
    sublabel: 'Western Africa',
    delta: 'Leading region',
    tone: 'lime',
  },
  {
    label: 'ENERGY USE PER CAPITA GAP',
    value: 11.9,
    unit: 'x disparity',
    delta: 'North America: 6,448 kg | Kenya: 539 kg',
    tone: 'muted',
  },
]

export interface RegionalRisk {
  region: string
  cri: number
  tier: 'Low' | 'Moderate' | 'High'
  category: string
}

export const REGIONAL_RISK: RegionalRisk[] = [
  { region: 'SIDS', cri: 49, tier: 'Moderate', category: 'Early Warnings & Adaptation' },
  { region: 'Sub-Saharan Africa (RA I)', cri: 52, tier: 'Moderate', category: 'Climate Finance Access' },
  { region: 'Asia (RA II)', cri: 44, tier: 'Low', category: 'Technology & AI Integration' },
  { region: 'Europe (RA VI)', cri: 60, tier: 'High', category: 'Scientific Neutrality' },
  { region: 'Americas (RA III/IV)', cri: 49, tier: 'Moderate', category: 'Resilience Infrastructure' },
]

export interface SapmAlignment {
  region: string
  initiative: string
  probability: number
}

export const SAPM_ALIGNMENT: SapmAlignment[] = [
  { region: 'SIDS (Small Islands)', initiative: 'EW4ALL Delivery', probability: 95 },
  { region: 'Sub-Saharan Africa', initiative: 'Climate Finance Platform', probability: 90 },
  { region: 'Asia', initiative: 'AI/Digital Transformation', probability: 85 },
  { region: 'Americas', initiative: 'Disaster Risk Reduction', probability: 70 },
  { region: 'Europe', initiative: 'Governance Transparency', probability: 55 },
]
