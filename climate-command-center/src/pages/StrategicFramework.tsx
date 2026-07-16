import { useRef, useState, useEffect, type ReactNode } from 'react'
import { Link } from 'react-router'
import { motion, useInView, type Transition, type TargetAndTransition } from 'framer-motion'
import {
  Leaf,
  Network,
  Cpu,
  Users,
  RefreshCw,
  Download,
  BarChart3,
  ChevronRight,
} from 'lucide-react'
import { PILLARS, type Pillar, type PillarIconKey } from '../content/smart-framework'

const ICON_MAP: Record<PillarIconKey, ReactNode> = {
  leaf: <Leaf size={28} />,
  network: <Network size={28} />,
  cpu: <Cpu size={28} />,
  users: <Users size={28} />,
  refresh: <RefreshCw size={28} />,
}

/* ──────────────────────── animation helpers ──────────────────────── */

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1]

interface AnimConfig {
  initial: TargetAndTransition
  whileInView: TargetAndTransition
  transition: Transition
}

const fadeUp = (delay = 0): AnimConfig => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: easeOutExpo, delay },
})

const scaleIn = (delay = 0): AnimConfig => ({
  initial: { opacity: 0, scale: 0.95 },
  whileInView: { opacity: 1, scale: 1 },
  transition: { duration: 0.6, ease: easeOutExpo, delay },
})

const slideRight = (delay = 0): AnimConfig => ({
  initial: { opacity: 0, x: -60 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 0.8, ease: easeOutExpo, delay },
})

const slideLeft = (delay = 0): AnimConfig => ({
  initial: { opacity: 0, x: 60 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 0.8, ease: easeOutExpo, delay },
})

const staggerContainer = (stagger = 0.08) => ({
  initial: {},
  whileInView: {},
  transition: { staggerChildren: stagger },
})

const staggerChild = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: easeOutExpo },
}

const viewportOnce = { once: true, amount: 0.15 }

/* pillars & progress data now live in ../content/smart-framework */

const progressData = PILLARS.map((p) => ({ name: p.name, value: p.progress }))

/* ──────────────────────── ProgressBar ──────────────────────── */

function ProgressBar({
  label,
  value,
  delay = 0,
}: {
  label: string
  value: number
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })

  return (
    <div ref={ref} className="flex items-center gap-4">
      <span className="text-[0.875rem] text-text-secondary w-24 shrink-0 text-right">
        {label}
      </span>
      <div className="flex-1 h-2 bg-[var(--border-subtle)] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background:
              "var(--accent-primary)",
          }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${value}%` } : { width: 0 }}
          transition={{
            duration: 1.2,
            ease: easeOutExpo,
            delay,
          }}
        />
      </div>
      <span className="text-[0.875rem] font-mono text-accent-cyan w-12 shrink-0">
        {value}%
      </span>
    </div>
  )
}

/* ──────────────────────── CountUp ──────────────────────── */

function CountUp({
  value,
  duration = 1500,
}: {
  value: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!inView) return

    const numericMatch = value.match(/[\d.]+/)
    if (!numericMatch) {
      setDisplay(value)
      return
    }

    const target = parseFloat(numericMatch[0])
    const prefix = value.slice(0, value.indexOf(numericMatch[0]))
    const suffix = value.slice(
      value.indexOf(numericMatch[0]) + numericMatch[0].length
    )
    const isFloat = numericMatch[0].includes('.')
    const decimals = isFloat
      ? numericMatch[0].split('.')[1]?.length || 1
      : 0

    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = target * eased
      setDisplay(
        prefix +
          current.toFixed(decimals) +
          suffix
      )
      if (progress < 1) requestAnimationFrame(animate)
      else setDisplay(value)
    }
    requestAnimationFrame(animate)
  }, [inView, value, duration])

  return <span ref={ref}>{display}</span>
}

/* ──────────────────────── Pillar Section ──────────────────────── */

function PillarSection({
  pillar,
  index,
}: {
  pillar: Pillar
  index: number
}) {
  const isReversed = index % 2 === 1 // M and R are reversed
  const bgClass = isReversed ? 'bg-bg-deep' : 'bg-bg-base'
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section
      ref={sectionRef}
      id={`pillar-${pillar.letter.toLowerCase()}`}
      className={`${bgClass} py-24 lg:py-32`}
    >
      <div className="max-w-[1440px] mx-auto px-6">
        <div
          className={`flex flex-col lg:flex-row gap-12 lg:gap-16 ${
            isReversed ? 'lg:flex-row-reverse' : ''
          }`}
        >
          {/* Visual Column */}
          <motion.div
            className="lg:w-[40%] relative"
            {...(isReversed ? slideLeft() : slideRight())}
            viewport={viewportOnce}
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[500px]">
              <div
                className="absolute inset-0 bg-gradient-to-br opacity-30"
                style={{
                  background: 'var(--bg-base)',
                }}
              />
              {/* Abstract pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern
                      id={`grid-${index}`}
                      width="30"
                      height="30"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 30 0 L 0 0 0 30"
                        fill="none"
                        stroke="var(--accent-primary)"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>
                  <rect
                    width="100%"
                    height="100%"
                    fill={`url(#grid-${index})`}
                  />
                </svg>
              </div>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, transparent 60%, rgba(20,40,56,0.8) 100%)',
                }}
              />
              {/* Badge */}
              <div className="absolute bottom-6 left-6">
                <span className="text-[0.8125rem] font-mono uppercase tracking-wider text-accent-cyan">
                  {`PILLAR ${index + 1}`}
                </span>
              </div>
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-accent-cyan opacity-20">
                  {ICON_MAP[pillar.iconKey]}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Column */}
          <motion.div
            className="lg:w-[60%] flex flex-col justify-center"
            {...(isReversed ? slideRight(0.15) : slideLeft(0.15))}
            viewport={viewportOnce}
          >
            {/* Pillar Header */}
            <div className="flex items-start gap-4 mb-2">
              <motion.span
                className="text-7xl lg:text-[80px] font-display font-bold text-accent-cyan leading-none"
                {...scaleIn()}
                viewport={viewportOnce}
              >
                {pillar.letter}
              </motion.span>
              <div>
                <h2 className="text-3xl lg:text-[3.5rem] font-display font-semibold text-text-primary leading-tight tracking-tight">
                  {pillar.name}
                </h2>
                <p className="text-xl lg:text-[1.75rem] font-semibold text-accent-teal mt-1">
                  {pillar.tagline}
                </p>
              </div>
            </div>

            {/* Description */}
            <motion.p
              className="text-lg text-text-secondary mt-6 leading-relaxed max-w-2xl"
              {...fadeUp(0.3)}
              viewport={viewportOnce}
            >
              {pillar.description}
            </motion.p>

            {/* Initiatives */}
            <motion.div
              className="mt-10 space-y-5"
              {...staggerContainer(0.12)}
              viewport={viewportOnce}
            >
              {pillar.initiatives.map((init, i) => (
                <motion.div key={i} {...staggerChild} className="group">
                  <div className="flex items-start gap-3">
                    <ChevronRight
                      size={18}
                      className="text-accent-cyan mt-1 shrink-0"
                    />
                    <div>
                      <h4 className="text-base font-medium text-text-primary group-hover:text-accent-cyan transition-colors duration-200">
                        {init.title}
                      </h4>
                      <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                        {init.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* KPIs */}
            <motion.div
              className="mt-10 flex flex-wrap gap-4"
              {...staggerContainer(0.1)}
              viewport={viewportOnce}
            >
              {pillar.kpis.map((kpi, i) => (
                <motion.div
                  key={i}
                  {...staggerChild}
                  className="bg-bg-surface border border-[var(--border-subtle)] rounded-xl px-6 py-4 min-w-[140px] hover:border-[var(--border-active)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="text-2xl lg:text-3xl font-mono font-medium text-text-primary">
                    <CountUp value={kpi.value} />
                  </div>
                  <div className="text-[0.8125rem] text-text-muted mt-1 uppercase tracking-wider">
                    {kpi.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────── Main Page ──────────────────────── */

export default function StrategicFramework() {
  const [activePillar, setActivePillar] = useState<string>('')

  // Track active pillar on scroll
  useEffect(() => {
    const handleScroll = () => {
      const pillarIds = ['s', 'm', 'a', 'r', 't']
      for (let i = pillarIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(`pillar-${pillarIds[i]}`)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top < window.innerHeight * 0.5) {
            setActivePillar(pillarIds[i].toUpperCase())
            break
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToPillar = (letter: string) => {
    const el = document.getElementById(`pillar-${letter.toLowerCase()}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="bg-bg-deep">
      {/* ────────────── Section 1: Hero ────────────── */}
      <section
        className="band-dark relative min-h-[60dvh] flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: '#10202F' }}
      >

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-16 pb-20">
          {/* Pill Badge */}
          <motion.span
            className="text-[0.8125rem] font-mono uppercase tracking-wider text-accent-cyan mb-8"
            {...fadeUp()}
            viewport={viewportOnce}
          >
            Strategic Framework 2027–2031
          </motion.span>

          {/* Title */}
          <motion.h1
            className="text-[2.5rem] sm:text-[3.5rem] lg:text-[4.5rem] font-display font-bold leading-[1.05] tracking-tight mb-6"
            style={{
              color: "var(--text-primary)",
              backgroundClip: 'text',
            }}
            {...fadeUp(0.2)}
            viewport={viewportOnce}
          >
            SMART 2.0
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg text-text-secondary max-w-[720px] mx-auto leading-relaxed mb-10"
            {...fadeUp(0.4)}
            viewport={viewportOnce}
          >
            Five interconnected pillars driving global climate coordination.
            Each pillar combines evidence-based policy, World Bank data
            integration, and measurable impact targets.
          </motion.p>

          {/* Quick Nav Pills */}
          <motion.div
            className="flex flex-wrap justify-center gap-3"
            {...staggerContainer(0.08)}
            viewport={viewportOnce}
          >
            {PILLARS.map((p) => (
              <motion.button
                key={p.letter}
                {...staggerChild}
                onClick={() => scrollToPillar(p.letter)}
                className={
                  'flex items-center gap-2 px-5 py-2.5 rounded-full text-[0.875rem] font-medium transition-all duration-200 border ' +
                  (activePillar === p.letter
                    ? 'bg-accent-cyan/15 border-accent-cyan text-accent-cyan'
                    : 'bg-[var(--border-subtle)] border-[rgba(26,43,60,0.18)] text-text-primary hover:border-[var(--accent-wash-strong)] hover:text-accent-cyan')
                }
              >
                <span className="font-mono font-bold text-sm">{p.letter}</span>
                <span>{p.name}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ────────────── Section 2–6: Pillars ────────────── */}
      {PILLARS.map((pillar, i) => (
        <PillarSection key={pillar.letter} pillar={pillar} index={i} />
      ))}

      {/* ────────────── Section 7: Framework Summary ────────────── */}
      <section
        className="py-24 lg:py-32"
        style={{ backgroundColor: 'var(--bg-deep)' }}
      >
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Section Header */}
          <motion.div className="text-center mb-16" {...fadeUp()} viewport={viewportOnce}>
            <span className="text-[0.8125rem] font-mono uppercase tracking-wider text-accent-cyan mb-6">
              Framework Overview
            </span>
            <h2 className="text-3xl lg:text-[3.5rem] font-display font-semibold text-text-primary leading-tight tracking-tight">
              SMART 2.0 at a Glance
            </h2>
          </motion.div>

          {/* Summary Table */}
          <motion.div
            className="bg-bg-surface rounded-xl overflow-hidden border border-[var(--border-subtle)]"
            {...scaleIn(0.2)}
            viewport={viewportOnce}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--accent-wash)]">
                    <th className="text-left px-6 py-4 text-[0.8125rem] font-mono uppercase tracking-wider text-accent-cyan">
                      Pillar
                    </th>
                    <th className="text-left px-6 py-4 text-[0.8125rem] font-mono uppercase tracking-wider text-accent-cyan">
                      Full Name
                    </th>
                    <th className="text-left px-6 py-4 text-[0.8125rem] font-mono uppercase tracking-wider text-accent-cyan">
                      Focus Area
                    </th>
                    <th className="text-left px-6 py-4 text-[0.8125rem] font-mono uppercase tracking-wider text-accent-cyan">
                      Key KPI
                    </th>
                    <th className="text-left px-6 py-4 text-[0.8125rem] font-mono uppercase tracking-wider text-accent-cyan">
                      Target
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PILLARS.map((p, i) => (
                    <motion.tr
                      key={p.letter}
                      className={
                        i % 2 === 1
                          ? 'bg-[var(--border-subtle)]'
                          : 'bg-bg-surface'
                      }
                      style={{
                        borderTop: '1px solid var(--border-subtle)',
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        ease: easeOutExpo,
                        delay: i * 0.08,
                      }}
                      viewport={viewportOnce}
                    >
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--accent-wash)] text-[0.8125rem] font-mono font-bold text-accent-cyan">
                          {p.letter}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-base font-medium text-text-primary">
                        {p.name}
                      </td>
                      <td className="px-6 py-5 text-sm text-text-secondary max-w-[280px]">
                        {p.tagline}
                      </td>
                      <td className="px-6 py-5 text-sm text-text-secondary">
                        {p.kpis[0].label}
                      </td>
                      <td className="px-6 py-5 text-sm text-accent-lime font-medium">
                        {p.kpis[0].value}
                        {p.letter === 'S' && ' by 2030'}
                        {p.letter === 'M' && ' mobilized'}
                        {p.letter === 'A' && ' alignment'}
                        {p.letter === 'R' && ' alignment'}
                        {p.letter === 'T' && ' \u2192 3x'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Progress Overview Bars */}
          <motion.div
            className="mt-16 space-y-4"
            {...fadeUp(0.3)}
            viewport={viewportOnce}
          >
            <h3 className="text-xl font-display font-semibold text-text-primary mb-6">
              Implementation Progress
            </h3>
            {progressData.map((p, i) => (
              <ProgressBar
                key={p.name}
                label={p.name}
                value={p.value}
                delay={i * 0.1}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ────────────── Section 8: CTA ────────────── */}
      <section className="bg-bg-base py-24">
        <motion.div
          className="max-w-[800px] mx-auto px-6 text-center"
          {...staggerContainer(0.12)}
          viewport={viewportOnce}
        >
          <motion.h2
            {...staggerChild}
            className="text-2xl lg:text-[2.5rem] font-display font-semibold leading-tight tracking-tight mb-4"
            style={{
              color: "var(--text-primary)",
              backgroundClip: 'text',
            }}
          >
            Implement SMART 2.0
          </motion.h2>

          <motion.p
            {...staggerChild}
            className="text-lg text-text-secondary mb-10"
          >
            Download the full strategic framework document or explore the
            detailed data intelligence dashboard.
          </motion.p>

          <motion.div
            {...staggerChild}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-base font-semibold transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]" style={{ background: "var(--accent-primary)", color: 'var(--bg-deep)' }}>
              <Download size={18} />
              Download Framework PDF
            </button>
            <Link
              to="/data-intelligence"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-base font-medium text-text-primary border border-[rgba(26,43,60,0.25)] transition-all duration-200 hover:border-accent-cyan hover:text-accent-cyan"
            >
              <BarChart3 size={18} />
              Explore Data Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
