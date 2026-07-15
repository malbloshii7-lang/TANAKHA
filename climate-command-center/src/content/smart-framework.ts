/**
 * SMART 2.0 strategic framework — pillars, initiatives, and roadmap.
 * This is the single source of truth for the framework shown on Home
 * and Strategic Framework. When the campaign updates the framework
 * (new version, new initiatives, revised KPIs), edit here only.
 *
 * `iconKey` maps to a lucide-react icon chosen by each page locally —
 * see ICON_MAP in StrategicFramework.tsx / Home.tsx.
 */

export const FRAMEWORK_VERSION = 'SMART 2.0'
export const FRAMEWORK_CYCLE = '2027–2031'

export type PillarIconKey = 'leaf' | 'network' | 'cpu' | 'users' | 'refresh'

export interface Initiative {
  title: string
  description: string
}

export interface Kpi {
  value: string
  label: string
}

export interface Pillar {
  letter: 'S' | 'M' | 'A' | 'R' | 'T'
  name: string
  tagline: string
  description: string
  initiatives: Initiative[]
  kpis: Kpi[]
  iconKey: PillarIconKey
  anchor: string
  progress: number
}

export const PILLARS: Pillar[] = [
  {
    letter: 'S',
    name: 'Sustain',
    tagline: 'Climate sustainability & disaster risk reduction',
    description:
      'Building resilient systems for the most vulnerable communities through evidence-based adaptation strategies. The Sustain pillar addresses the fundamental inequity that regions contributing least to emissions — such as Sub-Saharan Africa at 0.70t CO2/capita — face the greatest climate risks.',
    initiatives: [
      {
        title: 'Early Warning for All (EW4ALL)',
        description: 'Expand early warning system coverage to 100% of SIDS and LDCs by 2030.',
      },
      {
        title: 'Climate-Resilient Infrastructure',
        description: 'Data-driven infrastructure investment prioritizing regions with CRI scores above 50.',
      },
      {
        title: 'Disaster Risk Reduction Protocols',
        description: 'Standardized risk assessment frameworks using World Bank climate vulnerability indices.',
      },
    ],
    kpis: [
      { value: '100%', label: 'EW4ALL Coverage' },
      { value: '0.70t', label: 'Africa Emissions' },
      { value: '49', label: 'SIDS CRI Score' },
    ],
    iconKey: 'leaf',
    anchor: 'sustain',
    progress: 45,
  },
  {
    letter: 'M',
    name: 'Mobilize',
    tagline: 'Partnerships & climate finance',
    description:
      'Mobilizing development financing for climate-vulnerable communities through multilateral coordination platforms. The 19.5x emissions disparity demands a proportionate finance response — directing resources to regions with the lowest historical responsibility and highest adaptation needs.',
    initiatives: [
      {
        title: 'Global Climate Finance Platform',
        description: 'A $2Bn multilateral financing mechanism governed by transparent technical standards, not bilateral interests.',
      },
      {
        title: 'Private Sector Engagement Protocol',
        description: 'Framework for corporate climate investment with data-verified impact reporting.',
      },
      {
        title: 'South-South Cooperation Network',
        description: 'Knowledge and resource sharing between climate-vulnerable regions.',
      },
    ],
    kpis: [
      { value: '$2Bn', label: 'Finance Platform' },
      { value: '90%', label: 'Africa SAPM' },
      { value: '52', label: 'Africa CRI Score' },
    ],
    iconKey: 'network',
    anchor: 'mobilize',
    progress: 30,
  },
  {
    letter: 'A',
    name: 'Advance',
    tagline: 'Digital transformation & AI forecasting',
    description:
      'Leveraging machine learning and open data platforms to enhance early warning systems, climate prediction models, and real-time emissions monitoring. The Advance pillar transforms raw World Bank data into actionable intelligence for decision-makers.',
    initiatives: [
      {
        title: 'AI-Powered Climate Prediction',
        description: 'Machine learning models trained on 30+ years of World Bank climate data for regional risk forecasting.',
      },
      {
        title: 'Open Data Integration Platform',
        description: 'Real-time API connecting World Bank, IPCC, and national meteorological datasets into unified dashboards.',
      },
      {
        title: 'Digital Early Warning Networks',
        description: 'Satellite + IoT sensor networks providing sub-hourly climate hazard alerts to vulnerable communities.',
      },
    ],
    kpis: [
      { value: '85%', label: 'Asia SAPM' },
      { value: '44', label: 'Asia CRI Score' },
      { value: 'Real-time', label: 'Data Updates' },
    ],
    iconKey: 'cpu',
    anchor: 'advance',
    progress: 55,
  },
  {
    letter: 'R',
    name: 'Reinforce',
    tagline: 'Stakeholder engagement & inclusivity',
    description:
      'Ensuring equitable representation across all regions, particularly Small Island Developing States and Least Developed Countries. The Reinforce pillar guarantees that climate governance reflects the voices of those most affected by climate change, not just those with the largest economies.',
    initiatives: [
      {
        title: 'Inclusive Governance Framework',
        description: 'Rotating representation system ensuring SIDS and LDCs hold 40% of decision-making seats.',
      },
      {
        title: 'Capacity Building Programme',
        description: 'Technical training and institutional support for climate-vulnerable region meteorological services.',
      },
      {
        title: 'Youth & Indigenous Voices Platform',
        description: 'Dedicated channels for intergenerational and indigenous climate knowledge integration.',
      },
    ],
    kpis: [
      { value: '95%', label: 'SIDS SAPM' },
      { value: '49', label: 'SIDS CRI Score' },
      { value: '40%', label: 'LDC Representation' },
    ],
    iconKey: 'users',
    anchor: 'reinforce',
    progress: 60,
  },
  {
    letter: 'T',
    name: 'Transform',
    tagline: 'Cross-sector collaboration & global impact',
    description:
      'Driving systemic transformation through coordinated action across government, private sector, and civil society. The Transform pillar targets the structural changes needed to close the 19.5x emissions gap and achieve equitable energy access for all regions.',
    initiatives: [
      {
        title: 'Cross-Sector Climate Alliance',
        description: 'Binding cooperation framework between government, industry, academia, and civil society.',
      },
      {
        title: 'Just Energy Transition Protocol',
        description: 'Phased transition plan ensuring energy-poor regions (539 kg/capita) gain clean access before high-consuming regions reduce.',
      },
      {
        title: 'Global Climate Accountability Mechanism',
        description: 'Data-verified reporting system with transparent metrics and independent verification.',
      },
    ],
    kpis: [
      { value: '19.5x→3x', label: 'Emissions Gap Target' },
      { value: '75.8%', label: 'Renewable Benchmark' },
      { value: '2031', label: 'Full Implementation' },
    ],
    iconKey: 'refresh',
    anchor: 'transform',
    progress: 15,
  },
]
