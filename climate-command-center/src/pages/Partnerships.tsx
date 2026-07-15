import { useState, useEffect, useRef } from 'react'
import { motion, useInView, type Transition, type TargetAndTransition } from 'framer-motion'
import {
  Shield,
  Handshake,
  ArrowRightLeft,
  Check,
  Globe,
  Building2,
  HardHat,
  Cpu,
  Heart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { PARTNERS, type Partner } from '../content/partners'

/* ──────────────────────── animation helpers ──────────────────────── */

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1]

interface AnimConfig {
  initial: TargetAndTransition
  whileInView: TargetAndTransition
  transition: Transition
  viewport: { once: boolean; amount: number }
}

const fadeUp = (delay = 0): AnimConfig => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: easeOutExpo, delay },
  viewport: { once: true, amount: 0.15 },
})

const slideRight = (delay = 0): AnimConfig => ({
  initial: { opacity: 0, x: -60 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 0.7, ease: easeOutExpo, delay },
  viewport: { once: true, amount: 0.15 },
})

const slideLeft = (delay = 0): AnimConfig => ({
  initial: { opacity: 0, x: 60 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 0.7, ease: easeOutExpo, delay },
  viewport: { once: true, amount: 0.15 },
})

const staggerContainer = (stagger = 0.08) => ({
  initial: {},
  whileInView: {},
  transition: { staggerChildren: stagger },
  viewport: { once: true, amount: 0.15 },
})

const staggerChild = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: easeOutExpo },
}

const viewportOnce = { once: true, amount: 0.15 }

/* ──────────────────────── data ──────────────────────── */

const FOCUS_COLOR: Record<Partner['focus'], string> = {
  POLICY: 'text-accent-cyan',
  CLIMATE: 'text-accent-teal',
  RESILIENCE: 'text-accent-lime',
  TECHNOLOGY: 'text-accent-cyan',
  ENVIRONMENT: 'text-accent-lime',
  ENERGY: 'text-accent-amber',
  DATA: 'text-accent-cyan',
}

const partners = PARTNERS

interface RegionalCard {
  name: string
  code: string
  sapm: string
  sapmColor: string
  alignmentLabel: string
  alignmentColor: string
  priority: string
  cri: string
  criColor: string
  stripColor: string
  icon: React.ReactNode
}

const regionalCards: RegionalCard[] = [
  {
    name: 'Small Island Developing States',
    code: 'SIDS',
    sapm: '95%',
    sapmColor: 'text-accent-lime',
    alignmentLabel: 'Strong Alignment',
    alignmentColor: 'text-accent-lime',
    priority: 'EW4ALL Delivery — early warning systems',
    cri: '49',
    criColor: 'bg-[rgba(51,96,140,0.15)] text-[#33608C]',
    stripColor: 'bg-accent-lime',
    icon: <Globe size={18} />,
  },
  {
    name: 'Sub-Saharan Africa',
    code: 'RA I',
    sapm: '90%',
    sapmColor: 'text-accent-teal',
    alignmentLabel: 'Strong Alignment',
    alignmentColor: 'text-accent-teal',
    priority: 'Climate Finance Platform — $2Bn mechanism',
    cri: '52',
    criColor: 'bg-[rgba(51,96,140,0.15)] text-[#33608C]',
    stripColor: 'bg-accent-teal',
    icon: <Heart size={18} />,
  },
  {
    name: 'Asia',
    code: 'RA II',
    sapm: '85%',
    sapmColor: 'text-accent-cyan',
    alignmentLabel: 'Strong Alignment',
    alignmentColor: 'text-accent-cyan',
    priority: 'AI/Digital Transformation — prediction systems',
    cri: '44',
    criColor: 'bg-[rgba(79,125,70,0.15)] text-[#4F7D46]',
    stripColor: 'bg-accent-cyan',
    icon: <Cpu size={18} />,
  },
  {
    name: 'Americas',
    code: 'RA III/IV',
    sapm: '70%',
    sapmColor: 'text-accent-amber',
    alignmentLabel: 'Moderate Alignment',
    alignmentColor: 'text-accent-amber',
    priority: 'Disaster Risk Reduction — resilience frameworks',
    cri: '49',
    criColor: 'bg-[rgba(51,96,140,0.15)] text-[#33608C]',
    stripColor: 'bg-accent-amber',
    icon: <Building2 size={18} />,
  },
  {
    name: 'Europe',
    code: 'RA VI',
    sapm: '55%',
    sapmColor: 'text-accent-rose',
    alignmentLabel: 'Caution Required',
    alignmentColor: 'text-accent-rose',
    priority: 'Governance Transparency — neutrality protocols',
    cri: '60',
    criColor: 'bg-[rgba(150,105,13,0.15)] text-[#96690D]',
    stripColor: 'bg-accent-rose',
    icon: <HardHat size={18} />,
  },
]

interface Principle {
  number: string
  title: string
  description: string
}

const principles: Principle[] = [
  {
    number: '01',
    title: 'Data Transparency',
    description:
      'All partnership decisions are informed by publicly accessible World Bank data. No closed-door agreements.',
  },
  {
    number: '02',
    title: 'Multilateral Governance',
    description:
      'Partnerships are governed by rotating committees with equal regional representation, not unilateral control.',
  },
  {
    number: '03',
    title: 'Independent Verification',
    description:
      'Impact claims are verified by independent third-party auditors using standardized metrics.',
  },
  {
    number: '04',
    title: 'Equitable Benefit Sharing',
    description:
      'Climate-vulnerable regions receive priority funding allocation proportional to their risk exposure.',
  },
  {
    number: '05',
    title: 'Open Source Technology',
    description:
      'All digital platforms and tools developed through partnerships are open-source and freely available.',
  },
  {
    number: '06',
    title: 'Annual Public Reporting',
    description:
      'Comprehensive annual reports published with full financial and impact data for public review.',
  },
]

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
      setDisplay(prefix + current.toFixed(decimals) + suffix)
      if (progress < 1) requestAnimationFrame(animate)
      else setDisplay(value)
    }
    requestAnimationFrame(animate)
  }, [inView, value, duration])

  return <span ref={ref}>{display}</span>
}

/* ──────────────────────── Benefit Card ──────────────────────── */

interface Benefit {
  title: string
  subtext: string
}

function BenefitCard({
  header,
  headerColor,
  icon,
  title,
  benefits,
  gradientDir,
  delay = 0,
}: {
  header: string
  headerColor: string
  icon: React.ReactNode
  title: string
  benefits: Benefit[]
  gradientDir: string
  delay?: number
}) {
  return (
    <motion.div
      {...(gradientDir === 'ltr' ? slideRight(delay) : slideLeft(delay))}
      viewport={viewportOnce}
      className="bg-bg-surface border border-[var(--border-subtle)] rounded-2xl p-8 lg:p-10 relative overflow-hidden hover:border-[var(--border-active)] transition-all duration-300 hover:-translate-y-1"
    >
      {/* Top strip */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background:
            gradientDir === 'ltr'
              ? "var(--accent-primary)"
              : 'linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
        }}
      />

      <span
        className={`text-[0.8125rem] font-mono uppercase tracking-wider ${headerColor}`}
      >
        {header}
      </span>

      <div className="mt-4 mb-2 text-accent-cyan">{icon}</div>

      <h3 className="text-xl lg:text-[1.75rem] font-display font-semibold text-text-primary tracking-tight mb-6">
        {title}
      </h3>

      <div className="space-y-5">
        {benefits.map((b, i) => (
          <motion.div
            key={i}
            className="flex items-start gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              ease: easeOutExpo,
              delay: 0.6 + i * 0.1,
            }}
            viewport={viewportOnce}
          >
            <Check
              size={16}
              className="text-accent-lime mt-1 shrink-0"
            />
            <div>
              <p className="text-base text-text-primary font-medium">
                {b.title}
              </p>
              <p className="text-sm text-text-secondary mt-0.5">
                {b.subtext}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/* ──────────────────────── Regional Stakeholder Row ──────────────────────── */

function RegionalStakeholderRow() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', checkScroll, { passive: true })
    checkScroll()
    return () => el.removeEventListener('scroll', checkScroll)
  }, [])

  const scrollBy = (dir: number) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {/* Scroll buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scrollBy(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-bg-surface border border-[rgba(26,43,60,0.18)] flex items-center justify-center text-text-secondary hover:text-accent-cyan hover:border-accent-cyan transition-colors duration-200"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scrollBy(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-bg-surface border border-[rgba(26,43,60,0.18)] flex items-center justify-center text-text-secondary hover:text-accent-cyan hover:border-accent-cyan transition-colors duration-200"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 px-1 snap-x snap-mandatory scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {regionalCards.map((card, i) => (
          <motion.div
            key={card.code}
            className="min-w-[280px] max-w-[280px] flex-shrink-0 snap-start"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.6,
              ease: easeOutExpo,
              delay: i * 0.12,
            }}
            viewport={viewportOnce}
          >
            <div className="bg-bg-surface border border-[var(--border-subtle)] rounded-2xl overflow-hidden h-full hover:border-[var(--border-active)] transition-all duration-300 hover:-translate-y-1">
              {/* Top strip */}
              <div className={`h-[3px] ${card.stripColor}`} />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-text-muted">{card.icon}</span>
                  <h3 className="text-lg font-display font-semibold text-text-primary">
                    {card.name}
                  </h3>
                </div>
                <p className="text-[0.8125rem] font-mono text-text-muted uppercase tracking-wider mb-4">
                  {card.code}
                </p>

                <div className="mb-1">
                  <span
                    className={`text-3xl lg:text-[3rem] font-mono font-medium ${card.sapmColor}`}
                  >
                    <CountUp value={card.sapm} />
                  </span>
                </div>
                <p
                  className={`text-sm ${card.alignmentColor} font-medium mb-4`}
                >
                  {card.alignmentLabel}
                </p>

                <div className="border-t border-[var(--border-subtle)] pt-4 mb-3">
                  <p className="text-sm text-text-primary">
                    {card.priority}
                  </p>
                </div>

                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-mono ${card.criColor}`}
                >
                  CRI: {card.cri}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ──────────────────────── Main Page ──────────────────────── */

export default function Partnerships() {
  return (
    <div className="bg-bg-deep">
      {/* ────────────── Section 1: Hero ────────────── */}
      <section
        className="band-dark relative min-h-[50dvh] flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: '#10202F' }}
      >
        {/* Background — network pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300D4FF' fill-opacity='0.15'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-16 pb-16">
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full text-[0.8125rem] font-mono uppercase tracking-wider text-accent-cyan bg-[var(--accent-wash)] border border-[var(--border-active)] mb-8"
            {...fadeUp(0.3)}
            viewport={viewportOnce}
          >
            Global Partnerships
          </motion.span>

          <motion.h1
            className="text-3xl sm:text-[3.5rem] lg:text-[3.5rem] font-display font-semibold leading-[1.1] tracking-tight mb-6"
            style={{
              color: "var(--text-primary)",
              backgroundClip: 'text',
            }}
            {...fadeUp(0.5)}
            viewport={viewportOnce}
          >
            Strategic Alliance Network
          </motion.h1>

          <motion.p
            className="text-lg text-text-secondary max-w-[720px] mx-auto leading-relaxed"
            {...fadeUp(0.7)}
            viewport={viewportOnce}
          >
            A multilateral coalition of leading institutions, foundations, and
            governance bodies committed to evidence-based climate coordination.
            Every partnership is governed by transparent technical standards
            and open data protocols.
          </motion.p>
        </div>
      </section>

      {/* ────────────── Section 2: Partner Endorsement Grid ────────────── */}
      <section className="bg-bg-base py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Section Header */}
          <motion.div className="mb-16" {...fadeUp()} viewport={viewportOnce}>
            <span className="inline-block px-4 py-1.5 rounded-full text-[0.8125rem] font-mono uppercase tracking-wider text-accent-cyan bg-[var(--accent-wash)] border border-[var(--border-active)] mb-6">
              Endorsements
            </span>
            <h2 className="text-2xl lg:text-[2.5rem] font-display font-semibold text-text-primary leading-tight tracking-tight mb-3">
              Institutional Partners
            </h2>
            <p className="text-base text-text-secondary max-w-xl">
              Major foundations and institutions supporting the climate
              coordination initiative across five impact domains.
            </p>
          </motion.div>

          {/* Partner Grid */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6"
            {...staggerContainer(0.08)}
            viewport={viewportOnce}
          >
            {partners.map((p) => (
              <motion.div
                key={p.name}
                {...staggerChild}
                className="bg-bg-surface border border-[var(--border-subtle)] rounded-xl p-6 hover:border-[var(--border-active)] hover:-translate-y-[3px] transition-all duration-300 group cursor-default"
              >
                {/* Initial circle */}
                <div className="w-12 h-12 rounded-full bg-[var(--accent-wash)] flex items-center justify-center mb-4">
                  <span className="text-[1.25rem] font-display font-medium text-accent-cyan">
                    {p.initial}
                  </span>
                </div>

                <h3 className="text-[1.05rem] font-display font-medium text-text-primary leading-snug mb-2 group-hover:text-accent-cyan transition-colors duration-200">
                  {p.name}
                </h3>

                <span
                  className={`text-[0.8125rem] uppercase tracking-wider ${FOCUS_COLOR[p.focus]} font-medium`}
                >
                  {p.focus}
                </span>

                <p className="text-sm text-text-secondary mt-3 leading-relaxed line-clamp-2">
                  {p.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ────────────── Section 3: Flagship Partnership ────────────── */}
      <section className="bg-bg-deep py-24 lg:py-32">
        <div className="max-w-[1440px] mx-auto px-6">
          {/* Section Header */}
          <motion.div className="text-center mb-16" {...fadeUp()} viewport={viewportOnce}>
            <span className="inline-block px-4 py-1.5 rounded-full text-[0.8125rem] font-mono uppercase tracking-wider text-accent-cyan bg-[var(--accent-wash)] border border-[var(--border-active)] mb-6">
              Flagship Partnership
            </span>
            <h2 className="text-2xl lg:text-[2.5rem] font-display font-semibold text-text-primary leading-tight tracking-tight mb-4">
              Global Climate Finance Platform
            </h2>
            <p className="text-lg text-text-secondary max-w-[720px] mx-auto">
              A $2 billion multilateral financing mechanism for
              climate-vulnerable regions, governed by transparent technical
              standards and open data verification protocols.
            </p>
          </motion.div>

          {/* Two-Column Benefit Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 relative">
            {/* Left Card */}
            <BenefitCard
              header="For the CCC"
              headerColor="text-accent-cyan"
              icon={<Shield size={32} className="text-accent-cyan" />}
              title="Institutional Benefits"
              gradientDir="ltr"
              delay={0}
              benefits={[
                {
                  title:
                    'Access to development financing for CCC-led climate initiatives',
                  subtext:
                    'Direct funding channel for early warning systems and resilient infrastructure',
                },
                {
                  title:
                    'Enhanced visibility and influence in delivering climate solutions',
                  subtext:
                    'Global platform positioning for data-driven climate governance',
                },
                {
                  title:
                    'Amplified global impact on water security and community resilience',
                  subtext:
                    'Measurable outcomes through transparent impact reporting frameworks',
                },
              ]}
            />

            {/* Center arrow connector (desktop) */}
            <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 items-center justify-center">
              <div className="flex items-center">
                <div className="w-12 h-[1px] border-t border-dashed border-[var(--border-active)]" />
                <ArrowRightLeft
                  size={24}
                  className="text-accent-cyan mx-1"
                />
                <div className="w-12 h-[1px] border-t border-dashed border-[var(--border-active)]" />
              </div>
            </div>

            {/* Right Card */}
            <BenefitCard
              header="For Partners"
              headerColor="text-accent-teal"
              icon={<Handshake size={32} className="text-accent-teal" />}
              title="Partner Benefits"
              gradientDir="rtl"
              delay={0.15}
              benefits={[
                {
                  title:
                    'Technical credibility and CCC expertise integration',
                  subtext:
                    'Access to World Bank-validated climate datasets and analysis frameworks',
                },
                {
                  title:
                    'Global leadership positioning in climate finance',
                  subtext:
                    'Recognition as a premier multilateral climate finance contributor',
                },
                {
                  title:
                    'Enhanced impact on climate-vulnerable communities worldwide',
                  subtext:
                    'Direct, data-verified impact reporting with independent verification',
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ────────────── Section 4: Regional Stakeholder Map ────────────── */}
      <section className="bg-bg-base py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Section Header */}
          <motion.div className="mb-16" {...fadeUp()} viewport={viewportOnce}>
            <span className="inline-block px-4 py-1.5 rounded-full text-[0.8125rem] font-mono uppercase tracking-wider text-accent-cyan bg-[var(--accent-wash)] border border-[var(--border-active)] mb-6">
              Stakeholder Map
            </span>
            <h2 className="text-2xl lg:text-[2.5rem] font-display font-semibold text-text-primary leading-tight tracking-tight mb-3">
              Regional Engagement Matrix
            </h2>
            <p className="text-base text-text-secondary max-w-xl">
              Strategic alignment probability and engagement priorities across
              five regional governance blocs.
            </p>
          </motion.div>

          {/* Regional Cards — horizontal scrollable */}
          <RegionalStakeholderRow />
        </div>
      </section>

      {/* ────────────── Section 5: Partnership Governance ────────────── */}
      <section className="bg-bg-deep py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Section Header */}
          <motion.div className="text-center mb-16" {...fadeUp()} viewport={viewportOnce}>
            <span className="inline-block px-4 py-1.5 rounded-full text-[0.8125rem] font-mono uppercase tracking-wider text-accent-cyan bg-[var(--accent-wash)] border border-[var(--border-active)] mb-6">
              Governance
            </span>
            <h2 className="text-2xl lg:text-[2.5rem] font-display font-semibold text-text-primary leading-tight tracking-tight mb-4">
              Partnership Principles
            </h2>
            <p className="text-base text-text-secondary max-w-2xl mx-auto">
              All partnerships operate under a binding governance framework
              ensuring transparency, data integrity, and equitable benefit
              distribution.
            </p>
          </motion.div>

          {/* Principles Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            {...staggerContainer(0.1)}
            viewport={viewportOnce}
          >
            {principles.map((p) => (
              <motion.div
                key={p.number}
                {...staggerChild}
                className="bg-bg-surface border border-[var(--border-subtle)] rounded-xl p-6 hover:border-[var(--border-active)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="text-3xl lg:text-[3rem] font-mono font-medium text-[var(--border-active)] leading-none">
                  {p.number}
                </span>
                <h3 className="text-xl font-display font-medium text-text-primary mt-3 mb-2">
                  {p.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {p.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ────────────── Section 6: CTA ────────────── */}
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
            Join the Alliance
          </motion.h2>

          <motion.p
            {...staggerChild}
            className="text-lg text-text-secondary mb-10"
          >
            Institutional partners, foundations, and governance bodies are
            invited to explore collaboration opportunities within the SMART
            2.0 framework.
          </motion.p>

          <motion.div {...staggerChild}>
            <button
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-base font-semibold transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
              style={{
                background:
                  "var(--accent-primary)",
                color: 'var(--bg-deep)',
              }}
            >
              <Handshake size={18} />
              Become a Partner
            </button>
          </motion.div>

          <motion.p
            {...staggerChild}
            className="text-sm text-text-muted mt-6"
          >
            All partnerships subject to multilateral governance review.
          </motion.p>
        </motion.div>
      </section>
    </div>
  )
}
