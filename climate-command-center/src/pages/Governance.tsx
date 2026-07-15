import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Calendar,
  CheckCircle,
  Circle,
  AlertTriangle,
  AlertCircle,
  Download,
} from 'lucide-react'
import { TIMELINE_EVENTS as timelineEvents, type TimelineEvent } from '../content/events'
import { PHASES, type Phase } from '../content/roadmap'

/* ──────────────────────────────────────────────
   Animation helpers
   ────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, delay, ease: 'easeOut' as const },
  }),
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
}

const slideLeft = {
  hidden: { opacity: 0, x: 60 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
}

const slideRight = {
  hidden: { opacity: 0, x: -60 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
}

function useAnimateInView(threshold = 0.15, once = true) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { amount: threshold, once })
  return { ref, isInView }
}

/* ──────────────────────────────────────────────
   Pill Badge
   ────────────────────────────────────────────── */

function PillBadge({ children, variant = 'cyan', className = '' }: { children: React.ReactNode; variant?: 'cyan' | 'teal' | 'amber' | 'rose' | 'lime' | 'gradient'; className?: string }) {
  const variantClasses = {
    cyan: 'bg-[var(--accent-wash)] border-[var(--border-active)] text-accent-cyan',
    teal: 'bg-[rgba(0,184,169,0.1)] border-[rgba(0,184,169,0.25)] text-accent-teal',
    amber: 'bg-[rgba(150,105,13,0.1)] border-[rgba(150,105,13,0.25)] text-accent-amber',
    rose: 'bg-[rgba(160,59,59,0.1)] border-[rgba(160,59,59,0.25)] text-accent-rose',
    lime: 'bg-[rgba(85,122,50,0.1)] border-[rgba(85,122,50,0.25)] text-accent-lime',
    gradient: 'bg-gradient-to-r from-accent-teal/10 to-accent-cyan/10 border-[var(--border-active)] text-accent-cyan',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[0.8125rem] font-mono font-medium uppercase tracking-[0.05em] ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

/* ──────────────────────────────────────────────
   Section Header
   ────────────────────────────────────────────── */

function SectionHeader({
  badge,
  badgeVariant = 'cyan',
  title,
  subtitle,
}: {
  badge: string
  badgeVariant?: 'cyan' | 'teal' | 'amber' | 'rose' | 'lime'
  title: string
  subtitle: string
}) {
  const { ref, isInView } = useAnimateInView(0.2)
  return (
    <div ref={ref} className="text-center max-w-[720px] mx-auto">
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="mb-4">
        <PillBadge variant={badgeVariant}>{badge}</PillBadge>
      </motion.div>
      <motion.h2 custom={0.1} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="font-display text-[2.5rem] md:text-[2.5rem] font-semibold tracking-[-0.02em] leading-[1.15] text-text-primary mb-4">
        {title}
      </motion.h2>
      <motion.p custom={0.2} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="text-base text-text-secondary leading-relaxed">
        {subtitle}
      </motion.p>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Section 1 — Hero
   ────────────────────────────────────────────── */

function HeroSection() {
  const { ref, isInView } = useAnimateInView(0.1)

  return (
    <section
      ref={ref}
      className="band-dark relative min-h-[50vh] flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(16,32,47,0.75) 0%, rgba(20,40,56,0.95) 100%), url(/governance-timeline-bg.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Fallback solid background layer */}
      <div className="absolute inset-0 bg-bg-deep" style={{ zIndex: -1 }} />

      <div className="relative z-10 text-center px-6 pt-[128px] pb-[96px] max-w-[800px] mx-auto">
        <motion.div custom={0.3} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="mb-6">
          <PillBadge variant="cyan">Governance &amp; Timeline</PillBadge>
        </motion.div>

        <motion.h1
          custom={0.5}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="font-display text-[3.5rem] md:text-[3.5rem] font-semibold tracking-[-0.02em] leading-[1.1] mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          Strategic Command Center
        </motion.h1>

        <motion.p custom={0.7} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="text-lg text-text-secondary leading-relaxed max-w-[720px] mx-auto mb-8">
          The operational roadmap to the 2027 coordination cycle. Key decision points, governance events, risk assessments, and evidence-based counter-measures.
        </motion.p>

        <motion.div custom={1.0} variants={fadeIn} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="flex flex-wrap items-center justify-center gap-6">
          <span className="inline-flex items-center gap-2 text-[0.8125rem] font-mono font-medium text-accent-cyan">
            <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse-live" />
            OPERATIONAL
          </span>
          <span className="text-[0.8125rem] font-mono text-text-muted">Cycle: 2027-2031</span>
          <span className="text-[0.8125rem] font-mono text-text-muted">Framework: SMART 2.0</span>
        </motion.div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   Section 2 — Governance Events Timeline
   ────────────────────────────────────────────── */

/* Timeline events now live in ../content/events — single source shared with Home */

function TimelineNode({ event, index }: { event: TimelineEvent; index: number }) {
  const { ref, isInView } = useAnimateInView(0.15)
  const isLeft = event.side === 'left'
  const isPresent = event.status === 'present'

  const dotClass =
    event.status === 'past'
      ? 'bg-accent-teal'
      : event.status === 'present'
        ? 'bg-accent-cyan animate-pulse-live'
        : 'bg-transparent border-2 border-accent-lime'

  const cardBorderClass = isPresent
    ? 'border-[var(--border-active)]'
    : 'border-[var(--border-subtle)]'

  const animation = isLeft ? slideRight : slideLeft
  const staggerDelay = index * 0.2

  return (
    <div ref={ref} className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-0 md:gap-0 items-start">
      {/* Card - Desktop: alternating sides; Mobile: always right of line */}
      <motion.div
        custom={staggerDelay}
        variants={animation}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className={`${isLeft ? 'md:col-start-1 md:row-start-1 md:text-right' : 'md:col-start-3 md:row-start-1 md:text-left'} col-start-2 row-start-1 ml-8 md:ml-0 mb-12 md:mb-0`}
      >
        <div className={`relative bg-bg-surface ${cardBorderClass} rounded-2xl p-6 w-full max-w-[420px] ${isLeft ? 'md:ml-auto' : 'md:mr-auto'} transition-all duration-300 hover:-translate-y-0.5`}>
          {/* Connector line - desktop only */}
          <div className={`hidden md:block absolute top-8 ${isLeft ? 'right-[-48px]' : 'left-[-48px]'} w-12 h-px bg-[var(--border-subtle)]`} />

          {/* Top row */}
          <div className={`flex items-center justify-between mb-2 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
            <span className="text-[0.8125rem] font-mono font-medium text-accent-cyan uppercase tracking-[0.02em]">{event.code}</span>
            <PillBadge variant={event.type === 'WMO' ? 'teal' : 'cyan'}>{event.type}</PillBadge>
          </div>

          {/* Event name */}
          <h3 className="font-display text-[1.75rem] font-semibold tracking-[-0.01em] leading-[1.2] text-text-primary mb-2">
            {event.name}
          </h3>

          {/* Date */}
          <div className={`flex items-center gap-2 mb-3 ${isLeft ? 'md:justify-end' : ''}`}>
            <Calendar size={16} className="text-text-muted" />
            <span className="text-[0.875rem] font-mono text-text-muted">{event.date}</span>
          </div>

          <div className="h-px bg-[var(--border-subtle)] my-3" />

          {/* Opportunity */}
          <p className="text-[0.8125rem] font-mono text-accent-lime uppercase tracking-[0.02em] mb-2">{event.opportunity}</p>
          <p className="text-base text-text-secondary leading-relaxed mb-4">{event.description}</p>

          {/* Priority badge */}
          <div className={`flex ${isLeft ? 'md:justify-end' : ''}`}>
            <PillBadge variant={event.priorityVariant === 'gradient' ? 'gradient' : event.priorityVariant} className={isPresent ? 'animate-pulse-live' : ''}>
              {event.priority}
            </PillBadge>
          </div>
        </div>
      </motion.div>

      {/* Center dot column */}
      <div className="col-start-1 row-start-1 md:col-start-2 flex flex-col items-center">
        <motion.div
          custom={staggerDelay + 0.1}
          variants={scaleIn}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className={`w-5 h-5 rounded-full ${dotClass} ${isPresent ? 'ring-4 ring-[var(--border-active)]' : ''} flex-shrink-0 z-10`}
        />
      </div>

      {/* Spacer for opposite side */}
      <div className={`hidden md:block ${isLeft ? 'md:col-start-3' : 'md:col-start-1'}`} />
    </div>
  )
}

function TimelineSection() {
  const { ref, isInView } = useAnimateInView(0.1)

  return (
    <section className="bg-bg-base py-[128px] px-6">
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader
          badge="EVENT CALENDAR"
          badgeVariant="cyan"
          title="Key Governance Events"
          subtitle="Strategic milestones on the path to the 2027 coordination mandate. Each event represents a critical opportunity for engagement and coalition-building."
        />

        {/* Timeline */}
        <div ref={ref} className="relative mt-16 max-w-[900px] mx-auto">
          {/* Vertical gradient line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute left-[10px] md:left-1/2 top-0 bottom-0 w-[3px] origin-top"
            style={{
              background: "var(--accent-primary)",
              transform: 'translateX(-50%)',
            }}
          />

          {/* Nodes */}
          <div className="relative space-y-0">
            {timelineEvents.map((event, i) => (
              <TimelineNode key={event.code} event={event} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   Section 3 — Strategic Gap Analysis
   ────────────────────────────────────────────── */

function GapCardNeutrality() {
  const { ref, isInView } = useAnimateInView(0.2)

  return (
    <motion.div
      ref={ref}
      custom={0}
      variants={scaleIn}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="relative bg-bg-surface border border-[rgba(150,105,13,0.25)] rounded-2xl p-8 md:p-10 overflow-hidden"
      style={{ borderLeft: '4px solid var(--risk-high)' }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <AlertTriangle size={32} className="text-risk-high flex-shrink-0" />
        <h3 className="font-display text-[2rem] md:text-[2.5rem] font-semibold tracking-[-0.02em] leading-[1.15] text-text-primary">
          The Neutrality Gap
        </h3>
        <PillBadge variant="amber">CRI: 60 — EUROPE</PillBadge>
      </div>

      {/* Risk description */}
      <p className="text-base text-text-secondary leading-relaxed mb-5">
        European and Western missions prioritize scientific neutrality and regional diversity. Primary risk: perception of the Climate Command Center as a geopolitical instrument rather than a purely scientific coordination body.
      </p>

      {/* Data evidence */}
      <motion.div custom={0.3} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="bg-[rgba(150,105,13,0.05)] rounded-lg p-5 mb-6">
        <p className="text-[0.8125rem] font-mono font-medium text-accent-amber uppercase tracking-[0.02em] mb-2">QUANTITATIVE EVIDENCE</p>
        <p className="text-[0.875rem] text-text-secondary leading-relaxed">
          Europe SAPM alignment at 55% — lowest of all blocs. Governance/Transparency concerns dominate feedback. Historical preference for rotating leadership from Western candidates.
        </p>
      </motion.div>

      {/* Counter-measure */}
      <motion.div custom={0.5} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
        <p className="text-[0.8125rem] font-mono font-medium text-accent-lime uppercase tracking-[0.02em] mb-3">COUNTER-MEASURE</p>
        <div className="h-px bg-[rgba(85,122,50,0.2)] mb-4" />
        <p className="text-base text-text-primary leading-relaxed mb-5">
          Frame all partnerships as multilateral tools governed by independent technical standards and open data protocols — not bilateral initiatives. Establish transparent governance committees with rotating regional representation. Publish all partnership terms publicly before ratification.
        </p>

        {/* Action items */}
        <div className="space-y-3">
          {[
            'Publish partnership governance charter',
            'Form independent technical oversight board',
            'Establish 12-month rotating regional chair',
          ].map((item, i) => (
            <motion.div
              key={item}
              custom={0.6 + i * 0.08}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="flex items-center gap-3"
            >
              <CheckCircle size={16} className="text-accent-lime flex-shrink-0" />
              <span className="text-[0.875rem] text-text-secondary">{item}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function GapCardEquity() {
  const { ref, isInView } = useAnimateInView(0.2)

  return (
    <motion.div
      ref={ref}
      custom={0.2}
      variants={scaleIn}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="relative bg-bg-surface border border-[rgba(166,58,58,0.25)] rounded-2xl p-8 md:p-10 overflow-hidden"
      style={{ borderLeft: '4px solid var(--risk-critical)' }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <AlertCircle size={32} className="text-risk-critical flex-shrink-0" />
        <h3 className="font-display text-[2rem] md:text-[2.5rem] font-semibold tracking-[-0.02em] leading-[1.15] text-text-primary">
          The Equity Gap
        </h3>
        <PillBadge variant="rose" className="animate-pulse-live">BLACK SWAN RISK: HIGH</PillBadge>
      </div>

      {/* Risk description */}
      <p className="text-base text-text-secondary leading-relaxed mb-5">
        The 19.5x disparity in per-capita CO2 emissions between the highest and lowest emitting regions creates a fundamental structural inequity. Least developed regions face disproportionate adaptation costs with minimal historical responsibility — creating potential for diplomatic fracture during climate finance negotiations.
      </p>

      {/* Data evidence */}
      <motion.div custom={0.3} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="bg-[rgba(166,58,58,0.05)] rounded-lg p-5 mb-6">
        <p className="text-[0.8125rem] font-mono font-medium text-accent-rose uppercase tracking-[0.02em] mb-2">QUANTITATIVE EVIDENCE</p>
        <p className="text-[2rem] font-mono font-medium text-accent-rose mb-2">
          19.5x
        </p>
        <p className="text-[0.875rem] text-text-secondary leading-relaxed">
          North America 13.66t vs Sub-Saharan Africa 0.70t. Energy use gap: 11.9x (6,448 kg vs 539 kg). Climate finance access inversely correlated with emissions responsibility.
        </p>
      </motion.div>

      {/* Counter-measure */}
      <motion.div custom={0.5} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
        <p className="text-[0.8125rem] font-mono font-medium text-accent-lime uppercase tracking-[0.02em] mb-3">COUNTER-MEASURE</p>
        <div className="h-px bg-[rgba(85,122,50,0.2)] mb-4" />
        <p className="text-base text-text-primary leading-relaxed mb-5">
          Mandate differentiated responsibility frameworks in all climate finance mechanisms. Prioritise direct adaptation funding for SIDS and LDCs through transparent, data-verified allocation models. Base contribution requirements on historical emissions, not GDP.
        </p>

        {/* Action items */}
        <div className="space-y-3">
          {[
            'Implement historical-emissions-based contribution formula',
            'Direct 40% of climate finance to SIDS and LDCs',
            'Publish quarterly finance allocation transparency reports',
          ].map((item, i) => (
            <motion.div
              key={item}
              custom={0.6 + i * 0.08}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="flex items-center gap-3"
            >
              <CheckCircle size={16} className="text-accent-lime flex-shrink-0" />
              <span className="text-[0.875rem] text-text-secondary">{item}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function GapAnalysisSection() {
  return (
    <section
      className="py-[128px] px-6"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      <div className="max-w-[1440px] mx-auto">
        <SectionHeader
          badge="RISK ANALYSIS"
          badgeVariant="amber"
          title="Strategic Gap Analysis"
          subtitle="Key strategic challenges identified through quantitative risk assessment, with evidence-based counter-measures for each vulnerability."
        />

        <div className="mt-16 space-y-10">
          <GapCardNeutrality />
          <GapCardEquity />
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   Section 4 — Risk Assessment Matrix
   ────────────────────────────────────────────── */

interface RiskItem {
  category: string
  probability: 'Low' | 'Medium' | 'High'
  impact: 'Medium' | 'High' | 'Critical'
  status: 'Active' | 'Monitoring' | 'Watch'
  progress: number
}

const risks: RiskItem[] = [
  { category: 'Donor Fatigue', probability: 'High', impact: 'Critical', status: 'Active', progress: 70 },
  { category: 'Scientific Neutrality Challenge', probability: 'Medium', impact: 'High', status: 'Monitoring', progress: 45 },
  { category: 'Climate Finance Shortfall', probability: 'High', impact: 'High', status: 'Active', progress: 60 },
  { category: 'Geopolitical Tensions', probability: 'Medium', impact: 'Medium', status: 'Watch', progress: 30 },
  { category: 'Technology Access Divide', probability: 'Medium', impact: 'Medium', status: 'Watch', progress: 25 },
  { category: 'Small Island State Exodus', probability: 'Low', impact: 'Critical', status: 'Monitoring', progress: 40 },
]

function probabilityColor(p: string) {
  switch (p) {
    case 'Low': return 'text-accent-lime'
    case 'Medium': return 'text-accent-amber'
    case 'High': return 'text-accent-rose'
    default: return 'text-text-secondary'
  }
}

function impactColor(i: string) {
  switch (i) {
    case 'Medium': return 'text-accent-amber'
    case 'High': return 'text-accent-rose'
    case 'Critical': return 'text-accent-rose font-bold'
    default: return 'text-text-secondary'
  }
}

function statusDot(status: string) {
  switch (status) {
    case 'Active': return 'bg-accent-rose'
    case 'Monitoring': return 'bg-accent-amber'
    case 'Watch': return 'bg-accent-cyan'
    default: return 'bg-text-muted'
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'Active': return 'text-accent-rose'
    case 'Monitoring': return 'text-accent-amber'
    case 'Watch': return 'text-accent-cyan'
    default: return 'text-text-muted'
  }
}

function RiskMatrixSection() {
  const { ref, isInView } = useAnimateInView(0.1)

  return (
    <section className="bg-bg-base py-[128px] px-6">
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader
          badge="RISK MATRIX"
          badgeVariant="rose"
          title="Comprehensive Risk Assessment"
          subtitle="Multi-dimensional risk evaluation across probability, impact, and mitigation readiness dimensions."
        />

        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-16 bg-bg-surface rounded-xl overflow-hidden border border-[var(--border-subtle)]"
        >
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--accent-wash)]">
                  <th className="text-left px-6 py-4 text-[0.8125rem] font-mono font-medium text-accent-cyan uppercase tracking-[0.02em]">Risk Category</th>
                  <th className="text-left px-6 py-4 text-[0.8125rem] font-mono font-medium text-accent-cyan uppercase tracking-[0.02em]">Probability</th>
                  <th className="text-left px-6 py-4 text-[0.8125rem] font-mono font-medium text-accent-cyan uppercase tracking-[0.02em]">Impact</th>
                  <th className="text-left px-6 py-4 text-[0.8125rem] font-mono font-medium text-accent-cyan uppercase tracking-[0.02em]">Status</th>
                  <th className="text-left px-6 py-4 text-[0.8125rem] font-mono font-medium text-accent-cyan uppercase tracking-[0.02em]">Progress</th>
                </tr>
              </thead>
              <tbody>
                {risks.map((risk, i) => (
                  <motion.tr
                    key={risk.category}
                    custom={i * 0.06}
                    variants={fadeUp}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    className={`border-t border-[var(--border-subtle)] ${i % 2 === 1 ? 'bg-[var(--border-subtle)]' : ''} hover:bg-[var(--border-subtle)] transition-colors`}
                  >
                    <td className="px-6 py-4 text-[0.875rem] font-medium text-text-primary">{risk.category}</td>
                    <td className={`px-6 py-4 text-[0.875rem] font-mono ${probabilityColor(risk.probability)}`}>{risk.probability}</td>
                    <td className={`px-6 py-4 text-[0.875rem] font-mono ${impactColor(risk.impact)}`}>{risk.impact}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${statusDot(risk.status)}`} />
                        <span className={`text-[0.875rem] font-mono ${statusLabel(risk.status)}`}>{risk.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-1.5 bg-[var(--border-subtle)] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={isInView ? { width: `${risk.progress}%` } : { width: 0 }}
                            transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: "var(--accent-primary)" }}
                          />
                        </div>
                        <span className="text-[0.75rem] font-mono text-text-muted">{risk.progress}%</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4 p-4">
            {risks.map((risk, i) => (
              <motion.div
                key={risk.category}
                custom={i * 0.06}
                variants={fadeUp}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                className="bg-bg-base rounded-lg p-4 border border-[var(--border-subtle)]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[0.875rem] font-medium text-text-primary">{risk.category}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${statusDot(risk.status)}`} />
                    <span className={`text-[0.75rem] font-mono ${statusLabel(risk.status)}`}>{risk.status}</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div>
                    <p className="text-[0.6875rem] font-mono text-text-muted uppercase">Probability</p>
                    <p className={`text-[0.8125rem] font-mono ${probabilityColor(risk.probability)}`}>{risk.probability}</p>
                  </div>
                  <div>
                    <p className="text-[0.6875rem] font-mono text-text-muted uppercase">Impact</p>
                    <p className={`text-[0.8125rem] font-mono ${impactColor(risk.impact)}`}>{risk.impact}</p>
                  </div>
                  <div>
                    <p className="text-[0.6875rem] font-mono text-text-muted uppercase">Progress</p>
                    <p className="text-[0.8125rem] font-mono text-text-muted">{risk.progress}%</p>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-[var(--border-subtle)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${risk.progress}%` } : { width: 0 }}
                    transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: "var(--accent-primary)" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   Section 5 — Implementation Roadmap
   ────────────────────────────────────────────── */

const PHASE_VARIANT_STYLES: Record<Phase['variant'], { numberColor: string; stripColor: string }> = {
  teal: { numberColor: 'text-accent-teal', stripColor: 'bg-accent-teal' },
  cyan: { numberColor: 'text-accent-cyan', stripColor: 'bg-accent-cyan' },
  lime: { numberColor: 'text-accent-lime', stripColor: 'bg-accent-lime' },
  amber: { numberColor: 'text-accent-amber', stripColor: 'bg-accent-amber' },
}

const phases = PHASES

function PhaseCard({ phase, index }: { phase: Phase; index: number }) {
  const { numberColor, stripColor } = PHASE_VARIANT_STYLES[phase.variant]
  const { ref, isInView } = useAnimateInView(0.15)

  return (
    <motion.div
      ref={ref}
      custom={index * 0.12}
      variants={scaleIn}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="relative bg-bg-surface border border-[var(--border-subtle)] rounded-2xl p-6 md:p-8 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent-wash)]"
    >
      {/* Top strip */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${stripColor}`} />

      {/* Phase number + status */}
      <div className="flex items-center justify-between mb-4">
        <span className={`font-mono text-[3rem] font-medium ${numberColor} leading-none`}>{phase.number}</span>
        <PillBadge variant={phase.variant}>{phase.status}</PillBadge>
      </div>

      {/* Title + Period */}
      <h3 className="font-display text-[1.75rem] font-semibold tracking-[-0.01em] leading-[1.2] text-text-primary mb-1">
        {phase.title}
      </h3>
      <p className="text-[0.875rem] font-mono text-text-muted mb-4">{phase.period}</p>

      {/* Description */}
      <p className="text-base text-text-secondary leading-relaxed mb-6">{phase.description}</p>

      {/* Milestones */}
      <div className="space-y-3">
        {phase.milestones.map((milestone, i) => (
          <motion.div
            key={milestone.text}
            custom={0.4 + i * 0.06}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="flex items-center gap-3"
          >
            {milestone.done ? (
              <CheckCircle size={16} className="text-accent-lime flex-shrink-0" />
            ) : (
              <Circle size={16} className="text-text-muted flex-shrink-0" />
            )}
            <span className={`text-[0.875rem] ${milestone.done ? 'text-text-secondary' : 'text-text-muted'}`}>{milestone.text}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function RoadmapSection() {
  return (
    <section
      className="py-[128px] px-6"
      style={{ backgroundColor: 'var(--bg-deep)' }}
    >
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader
          badge="ROADMAP"
          badgeVariant="lime"
          title="Implementation Phases"
          subtitle="The phased approach to SMART 2.0 implementation, aligned with the governance event calendar."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {phases.map((phase, i) => (
            <PhaseCard key={phase.number} phase={phase} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   Section 6 — CTA Section
   ────────────────────────────────────────────── */

function CTASection() {
  const { ref, isInView } = useAnimateInView(0.2)

  return (
    <section className="bg-bg-base py-[96px] px-6">
      <motion.div
        ref={ref}
        className="max-w-[800px] mx-auto text-center"
      >
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="mb-4">
          <PillBadge variant="lime">Engage</PillBadge>
        </motion.div>

        <motion.h2
          custom={0.12}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="font-display text-[2rem] md:text-[2.5rem] font-semibold tracking-[-0.02em] leading-[1.15] mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Join the Governance Framework
        </motion.h2>

        <motion.p custom={0.24} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="text-lg text-text-secondary leading-relaxed mb-8">
          Member states, institutions, and observers are invited to participate in the transparent governance process. All engagement is data-informed and independently verified.
        </motion.p>

        <motion.div custom={0.36} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="flex flex-wrap items-center justify-center gap-4 mb-6">
          <button
            onClick={() => alert('Governance Charter download coming soon')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-base font-semibold text-bg-deep transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
            style={{ background: "var(--accent-primary)" }}
          >
            <Download size={18} />
            Download Governance Charter
          </button>
          <a
            href="#timeline"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-base font-medium text-text-primary border border-[rgba(26,43,60,0.25)] transition-all duration-200 hover:border-accent-cyan hover:text-accent-cyan"
          >
            View Full Timeline
          </a>
        </motion.div>

        <motion.p custom={0.48} variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="text-[0.875rem] font-mono text-accent-cyan">
          Next critical event: EC-80, June 22, 2026
        </motion.p>
      </motion.div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   Main Page Component
   ────────────────────────────────────────────── */

export default function Governance() {
  return (
    <main>
      <HeroSection />
      <div id="timeline">
        <TimelineSection />
      </div>
      <GapAnalysisSection />
      <RiskMatrixSection />
      <RoadmapSection />
      <CTASection />
    </main>
  )
}
