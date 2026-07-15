import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import CountUp from 'react-countup'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import {
  Globe, AlertTriangle,
  Leaf, Network, Cpu, Users, RefreshCw,
  ChevronDown, ArrowRight,
} from 'lucide-react'
import { PILLARS as SMART_PILLARS, type PillarIconKey } from '../content/smart-framework'
import { TIMELINE_EVENTS as CONTENT_TIMELINE_EVENTS } from '../content/events'
import { HEADLINE_METRICS, REGIONAL_RISK, SAPM_ALIGNMENT, DATA_VINTAGE_SHORT } from '../content/stats'

gsap.registerPlugin(ScrollTrigger)

/* ------------------------------------------------------------------ */
/*  DATA CONSTANTS — presentation layer over ../content modules        */
/* ------------------------------------------------------------------ */

const REGIONAL_CO2_DATA = [
  { region: 'North America', value: 13.66, color: '#A63A3A' },
  { region: 'Europe & Central Asia', value: 6.82, color: '#96690D' },
  { region: 'World Average', value: 4.69, color: 'var(--accent-primary)' },
  { region: 'East Asia & Pacific', value: 4.21, color: 'var(--accent-secondary)' },
  { region: 'Sub-Saharan Africa', value: 0.70, color: '#557A32' },
]

const METRIC_TONE_STYLES: Record<string, { deltaColor: string; stripColor: string; textColor: string; icon: typeof Globe }> = {
  amber: { deltaColor: 'text-accent-amber', stripColor: 'bg-accent-amber', textColor: 'text-accent-amber', icon: Globe },
  rose: { deltaColor: 'text-accent-rose', stripColor: 'bg-accent-rose', textColor: 'text-accent-rose', icon: AlertTriangle },
  lime: { deltaColor: 'text-accent-lime', stripColor: 'bg-accent-lime', textColor: 'text-accent-lime', icon: Leaf },
  muted: { deltaColor: 'text-text-muted', stripColor: 'bg-accent-amber', textColor: 'text-accent-amber', icon: Globe },
}

const METRICS = HEADLINE_METRICS.map((m) => ({
  ...m,
  ...METRIC_TONE_STYLES[m.tone],
  pulse: m.tone === 'rose',
}))

const RISK_CARD_COLORS: Record<'Low' | 'Moderate' | 'High', string> = {
  Low: '#4F7D46',
  Moderate: '#33608C',
  High: '#96690D',
}

const RISK_CARDS = REGIONAL_RISK.map((r) => ({ ...r, color: RISK_CARD_COLORS[r.tier] }))
const SAPM_DATA = SAPM_ALIGNMENT
const TIMELINE_EVENTS = CONTENT_TIMELINE_EVENTS.map((e) => ({
  code: e.code, name: e.name, date: e.date, type: e.type, opportunity: e.description, highlight: e.highlight,
}))

const PILLAR_ICON_MAP: Record<PillarIconKey, typeof Leaf> = {
  leaf: Leaf, network: Network, cpu: Cpu, users: Users, refresh: RefreshCw,
}

const PILLARS = SMART_PILLARS.map((p) => ({
  letter: p.letter,
  name: p.name,
  icon: PILLAR_ICON_MAP[p.iconKey],
  description: `${p.tagline}. ${p.initiatives[0]?.description ?? ''}`,
  anchor: p.anchor,
}))

/* ------------------------------------------------------------------ */
/*  HERO                                                               */
/* ------------------------------------------------------------------ */

function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline()
    tl.fromTo('.hero-bg', { opacity: 0, scale: 1.05 }, { opacity: 0.6, scale: 1, duration: 1.2, ease: 'power2.out' })
    tl.fromTo('.hero-pill', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.6')
    tl.fromTo('.hero-line1', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3')
    tl.fromTo('.hero-line2', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
    tl.fromTo('.hero-subtitle', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
    tl.fromTo('.hero-cta', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
    tl.fromTo('.hero-scroll', { opacity: 0 }, { opacity: 0.6, duration: 0.5, ease: 'power2.out' }, '-=0.1')
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="band-dark relative min-h-[100dvh] overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#10202F' }}>
      {/* Background layers */}
      <div className="absolute inset-0 bg-bg-deep" />
      <div
        className="hero-bg absolute inset-0 bg-cover bg-center opacity-0"
        style={{ backgroundImage: 'url(/hero-bg-globe.jpg)' }}
      />
      <div
        className="absolute inset-0 opacity-[0.05] bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: 'url(/hero-grid-overlay.png)' }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-[800px] mx-auto">
        {/* Pill Badge */}
        <div className="hero-pill opacity-0 mb-6">
          <span className="inline-block px-4 py-1.5 rounded-full text-[0.8125rem] font-medium tracking-[0.05em] uppercase text-accent-cyan bg-[var(--accent-wash)] border border-[var(--border-active)] font-mono">
            Climate Command Center 2027
          </span>
        </div>

        {/* Main Title */}
        <h1 className="font-display font-bold leading-[1.05] tracking-[-0.03em]">
          <span
            className="hero-line1 block opacity-0 text-[2.5rem] sm:text-[3.5rem] lg:text-[4.5rem]"
            style={{ color: 'var(--text-primary)' }}
          >
            GLOBAL CLIMATE
          </span>
          <span className="hero-line2 block opacity-0 text-[2.5rem] sm:text-[3.5rem] lg:text-[4.5rem] text-text-primary mt-2">
            COORDINATION INITIATIVE
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle opacity-0 mt-6 text-[1rem] sm:text-[1.125rem] font-light text-text-secondary leading-[1.65] max-w-[640px]">
          An evidence-based campaign for institutional climate leadership, powered by real-time World Bank Open Data and the SMART 2.0 Strategic Framework for 2027–2031.
        </p>

        {/* CTA Group */}
        <div className="hero-cta opacity-0 mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/data-intelligence"
            className="inline-flex items-center px-8 py-3.5 rounded-lg text-[1rem] font-semibold text-bg-deep transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, var(--accent-secondary) 0%, var(--accent-primary) 100%)' }}
          >
            Explore the Data
          </Link>
          <Link
            to="/strategic-framework"
            className="inline-flex items-center px-8 py-3.5 rounded-lg text-[1rem] font-medium text-text-primary border border-[rgba(26,43,60,0.25)] transition-all duration-200 hover:border-accent-cyan hover:text-accent-cyan"
          >
            View Strategic Framework
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="hero-scroll absolute bottom-10 left-1/2 -translate-x-1/2 z-10 opacity-0">
        <ChevronDown size={24} className="text-accent-cyan" />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  METRIC CARD                                                        */
/* ------------------------------------------------------------------ */

interface MetricCardProps {
  label: string
  value: number
  unit: string
  delta: string
  deltaColor: string
  stripColor: string
  textColor: string
  sublabel?: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  pulse?: boolean
  delay?: number
}

function MetricCard({ label, value, unit, delta, deltaColor, stripColor, textColor, sublabel, icon: Icon, pulse }: MetricCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={cardRef}
      className={
        'relative bg-bg-surface border border-[var(--border-subtle)] rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--border-active)] group ' +
        (pulse ? 'animate-border-pulse-rose shadow-[0_0_20px_rgba(166,58,58,0.1)]' : '')
      }
    >
      <div className={'absolute left-0 top-4 bottom-4 w-[3px] rounded-r ' + stripColor} />
      <div className="flex items-start justify-between mb-4">
        <span className="text-[0.8125rem] font-medium tracking-[0.02em] uppercase text-text-muted font-mono">{label}</span>
        <Icon size={20} className="text-text-muted" />
      </div>
      <div className={'text-[3rem] font-medium font-mono leading-none ' + textColor}>
        {inView ? (
          <CountUp end={value} decimals={value % 1 !== 0 ? 2 : 0} duration={1.5} />
        ) : (
          <span>0</span>
        )}
      </div>
      <div className="text-[0.875rem] text-text-secondary mt-1">{unit}</div>
      {sublabel && <div className="text-[0.875rem] text-text-muted mt-1">{sublabel}</div>}
      <div className={'text-[0.875rem] mt-3 ' + deltaColor}>{delta}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  LIVE DATA DASHBOARD                                                */
/* ------------------------------------------------------------------ */

function LiveDataDashboard() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.fromTo('.dashboard-header > *',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none none' }
      }
    )
    gsap.fromTo('.metric-card',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, stagger: 0.1, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: '.metrics-grid', start: 'top 85%', toggleActions: 'play none none none' }
      }
    )
    gsap.fromTo('.chart-container',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: '.chart-container', start: 'top 85%', toggleActions: 'play none none none' }
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="bg-bg-base py-24 lg:py-32">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Section Header */}
        <div className="dashboard-header text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-[0.8125rem] font-medium tracking-[0.05em] uppercase text-accent-cyan bg-[var(--accent-wash)] border border-[var(--border-active)] font-mono mb-6">
            Live World Bank Data · {DATA_VINTAGE_SHORT}
          </span>
          <h2 className="font-display font-semibold text-[2rem] sm:text-[2.5rem] lg:text-[3.5rem] text-text-primary tracking-[-0.02em] leading-[1.1]">
            Global Climate Indicators
          </h2>
          <p className="mt-4 text-[1rem] sm:text-[1.125rem] text-text-secondary leading-[1.65] max-w-[720px] mx-auto">
            Real-time data sourced from World Bank Open Data. Key metrics driving the climate coordination agenda.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="metrics-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {METRICS.map((m) => (
            <div key={m.label} className="metric-card">
              <MetricCard {...m} />
            </div>
          ))}
        </div>

        {/* Regional Comparison Chart */}
        <div className="chart-container mt-16 bg-bg-surface rounded-xl p-6 lg:p-10">
          <h3 className="font-display font-semibold text-[1.75rem] text-text-primary mb-6">
            CO2 Emissions by Region (t/capita)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REGIONAL_CO2_DATA} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 13, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: 'var(--border-subtle)' }} />
                <YAxis
                  type="category"
                  dataKey="region"
                  width={160}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 13, fontFamily: 'Inter' }}
                  axisLine={{ stroke: 'var(--border-subtle)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontFamily: 'JetBrains Mono',
                  }}
                  formatter={(value: number) => [`${value} t/capita`, '']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                  {REGIONAL_CO2_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  SMART 2.0 FRAMEWORK                                                */
/* ------------------------------------------------------------------ */

function SMARTFramework() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.fromTo('.smart-header > *',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
      }
    )
    gsap.fromTo('.pillar-card',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, stagger: 0.12, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: '.pillars-grid', start: 'top 85%' }
      }
    )
    gsap.fromTo('.connecting-line',
      { scaleX: 0 },
      { scaleX: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.connecting-line', start: 'top 90%' }
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="relative bg-bg-deep py-24 lg:py-32 overflow-hidden">
      <div className="relative z-10 max-w-[1280px] mx-auto px-6">
        <div className="smart-header text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-[0.8125rem] font-medium tracking-[0.05em] uppercase text-accent-cyan bg-[var(--accent-wash)] border border-[var(--border-active)] font-mono mb-6">
            Strategic Framework
          </span>
          <h2
            className="font-display font-semibold text-[2rem] sm:text-[2.5rem] lg:text-[3.5rem] tracking-[-0.02em] leading-[1.1]"
            style={{ color: 'var(--text-primary)' }}
          >
            SMART 2.0
          </h2>
          <p className="mt-4 text-[1rem] sm:text-[1.125rem] text-text-secondary leading-[1.65] max-w-[680px] mx-auto">
            Five strategic pillars driving global climate coordination, resilience, and evidence-based governance for 2027–2031.
          </p>
        </div>

        <div className="pillars-grid relative mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {PILLARS.map((pillar) => {
            const IconComp = pillar.icon
            return (
              <div
                key={pillar.letter}
                className="pillar-card bg-bg-surface border border-[var(--border-subtle)] rounded-2xl p-6 lg:p-8 min-h-[280px] flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-active)] group"
              >
                <span className="text-[3.5rem] font-display font-bold text-accent-cyan leading-none mb-2 group-hover:brightness-125 transition-all duration-300">
                  {pillar.letter}
                </span>
                <IconComp size={24} className="text-accent-teal mb-3 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="font-display font-semibold text-[1.75rem] text-text-primary leading-[1.2] mb-3">
                  {pillar.name}
                </h3>
                <p className="text-[1rem] text-text-secondary leading-[1.6] flex-1">
                  {pillar.description}
                </p>
                <Link
                  to={`/strategic-framework#pillar-${pillar.anchor}`}
                  className="text-[0.875rem] text-accent-cyan mt-4 inline-flex items-center gap-1 hover:underline"
                >
                  Learn more <ArrowRight size={14} />
                </Link>
              </div>
            )
          })}

          {/* Connecting line (desktop) */}
          <div className="connecting-line hidden lg:block absolute top-[90px] left-[5%] right-[5%] h-[1px] bg-[var(--accent-wash)] origin-left -z-10" />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  CAMPAIGN RISK INDEX                                                */
/* ------------------------------------------------------------------ */

function CampaignRiskIndex() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.fromTo('.cri-header > *',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
      }
    )
    gsap.fromTo('.risk-card',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: '.risk-grid', start: 'top 85%' }
      }
    )
    gsap.fromTo('.cri-legend',
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.out',
        scrollTrigger: { trigger: '.cri-legend', start: 'top 90%' }
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="bg-bg-base py-24 lg:py-32">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="cri-header text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-[0.8125rem] font-medium tracking-[0.05em] uppercase text-accent-cyan bg-[var(--accent-wash)] border border-[var(--border-active)] font-mono mb-6">
            Risk Assessment
          </span>
          <h2 className="font-display font-semibold text-[2rem] sm:text-[2.5rem] lg:text-[3.5rem] text-text-primary tracking-[-0.02em] leading-[1.1]">
            Campaign Risk Index
          </h2>
          <p className="mt-4 text-[1rem] sm:text-[1.125rem] text-text-secondary leading-[1.65] max-w-[720px] mx-auto">
            Regional risk assessment across key climate governance blocs. Lower scores indicate higher strategic alignment and lower operational risk.
          </p>
        </div>

        <div className="risk-grid mt-16 grid grid-cols-2 lg:grid-cols-5 gap-6">
          {RISK_CARDS.map((card) => {
            const cardRef = useRef<HTMLDivElement>(null)
            const [inView, setInView] = useState(false)

            useEffect(() => {
              const el = cardRef.current
              if (!el) return
              const obs = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
                { threshold: 0.15 }
              )
              obs.observe(el)
              return () => obs.disconnect()
            }, [])

            return (
              <div
                key={card.region}
                ref={cardRef}
                className={
                  'risk-card bg-bg-surface border border-[var(--border-subtle)] rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--border-active)] ' +
                  (card.tier === 'High' ? 'animate-border-pulse-amber' : '')
                }
              >
                <h4 className="font-display font-medium text-[1.25rem] text-text-primary leading-[1.3] mb-2">
                  {card.region}
                </h4>
                <div className="text-[3rem] font-mono font-medium leading-none" style={{ color: card.color }}>
                  {inView ? <CountUp end={card.cri} duration={1.2} /> : '0'}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: card.color }} />
                  <span className="text-[0.875rem] text-text-muted">{card.tier} Risk</span>
                </div>
                <div className="text-[0.875rem] text-text-muted mt-1">{card.category}</div>
              </div>
            )
          })}
        </div>

        {/* CRI Scale Legend */}
        <div className="cri-legend mt-10 flex flex-col items-center">
          <div className="w-full max-w-[600px] h-3 rounded-full" style={{ background: 'linear-gradient(90deg, #4F7D46 0%, #33608C 40%, #96690D 70%, #A63A3A 100%)' }} />
          <div className="flex justify-between w-full max-w-[600px] mt-2">
            <span className="text-[0.875rem] text-text-muted">Low Risk</span>
            <span className="text-[0.875rem] text-text-muted">Moderate</span>
            <span className="text-[0.875rem] text-text-muted">High Risk</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  STRATEGIC ALIGNMENT PROBABILITY MATRIX                             */
/* ------------------------------------------------------------------ */

function SAPMSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.fromTo('.sapm-header > *',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
      }
    )
    gsap.fromTo('.sapm-row',
      { opacity: 0, x: -40 },
      { opacity: 1, x: 0, stagger: 0.15, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: '.sapm-rows', start: 'top 85%' }
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="relative bg-bg-deep py-24 lg:py-32 overflow-hidden">
      <div className="relative z-10 max-w-[1280px] mx-auto px-6">
        <div className="sapm-header text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-[0.8125rem] font-medium tracking-[0.05em] uppercase text-accent-cyan bg-[var(--accent-wash)] border border-[var(--border-active)] font-mono mb-6">
            Alignment Matrix
          </span>
          <h2 className="font-display font-semibold text-[2rem] sm:text-[2.5rem] lg:text-[3.5rem] text-text-primary tracking-[-0.02em] leading-[1.1]">
            Strategic Alignment Probability
          </h2>
          <p className="mt-4 text-[1rem] sm:text-[1.125rem] text-text-secondary leading-[1.65] max-w-[720px] mx-auto">
            Support probability across regional voting blocs based on strategic initiative alignment and historical cooperation patterns.
          </p>
        </div>

        <div className="sapm-rows mt-16 max-w-[800px] mx-auto flex flex-col gap-10">
          {SAPM_DATA.map((row) => {
            const rowRef = useRef<HTMLDivElement>(null)
            const [inView, setInView] = useState(false)

            useEffect(() => {
              const el = rowRef.current
              if (!el) return
              const obs = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
                { threshold: 0.2 }
              )
              obs.observe(el)
              return () => obs.disconnect()
            }, [])

            const isEurope = row.region === 'Europe'

            return (
              <div
                key={row.region}
                ref={rowRef}
                className={'sapm-row flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 ' + (isEurope ? 'bg-[rgba(150,105,13,0.05)] -mx-4 px-4 py-3 rounded-lg' : '')}
              >
                <div className="w-full sm:w-[200px] shrink-0">
                  <h4 className="font-display font-medium text-[1.25rem] text-text-primary leading-[1.3]">
                    {row.region}
                  </h4>
                  <p className="text-[0.875rem] text-text-muted">{row.initiative}</p>
                </div>
                <div className="flex-1 w-full flex items-center gap-4">
                  <div className="flex-1 h-3 rounded-full bg-[var(--border-subtle)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all ease-out"
                      style={{
                        width: inView ? `${row.probability}%` : '0%',
                        background: isEurope
                          ? 'linear-gradient(90deg, #96690D, var(--accent-primary))'
                          : 'linear-gradient(90deg, var(--accent-secondary), var(--accent-primary))',
                        opacity: isEurope ? 0.7 : 1,
                      }}
                    />
                  </div>
                  <span className="text-[2rem] font-mono font-medium text-text-primary min-w-[70px] text-right">
                    {inView ? <CountUp end={row.probability} duration={1.2} suffix="%" /> : '0%'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  GOVERNANCE TIMELINE                                                */
/* ------------------------------------------------------------------ */

function GovernanceTimeline() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.fromTo('.timeline-header > *',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
      }
    )
    gsap.fromTo('.timeline-line',
      { scaleY: 0 },
      { scaleY: 1, duration: 1, ease: 'power3.out', transformOrigin: 'top',
        scrollTrigger: { trigger: '.timeline-container', start: 'top 85%' }
      }
    )
    gsap.fromTo('.timeline-node',
      { opacity: 0, x: (i) => (i % 2 === 0 ? -60 : 60) },
      { opacity: 1, x: 0, stagger: 0.2, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: '.timeline-container', start: 'top 85%' }
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="bg-bg-base py-24 lg:py-32">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="timeline-header text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-[0.8125rem] font-medium tracking-[0.05em] uppercase text-accent-cyan bg-[var(--accent-wash)] border border-[var(--border-active)] font-mono mb-6">
            Governance Timeline
          </span>
          <h2 className="font-display font-semibold text-[2rem] sm:text-[2.5rem] lg:text-[3.5rem] text-text-primary tracking-[-0.02em] leading-[1.1]">
            Strategic Milestones
          </h2>
          <p className="mt-4 text-[1rem] sm:text-[1.125rem] text-text-secondary leading-[1.65] max-w-[720px] mx-auto">
            Key governance events and decision points on the path to the 2027 coordination cycle.
          </p>
        </div>

        <div className="timeline-container relative mt-16 max-w-[900px] mx-auto">
          {/* Vertical line */}
          <div
            className="timeline-line absolute left-4 lg:left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2"
            style={{ background: 'linear-gradient(to bottom, var(--accent-secondary), var(--accent-primary))' }}
          />

          <div className="flex flex-col gap-12">
            {TIMELINE_EVENTS.map((event, i) => {
              const isLeft = i % 2 === 0
              return (
                <div
                  key={event.code}
                  className={
                    'timeline-node relative flex items-start gap-6 ' +
                    (isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse')
                  }
                >
                  {/* Dot */}
                  <div className="absolute left-4 lg:left-1/2 -translate-x-1/2 z-10">
                    <div
                      className={
                        'w-4 h-4 rounded-full border-2 border-accent-cyan ' +
                        (event.highlight
                          ? 'bg-accent-cyan animate-pulse-live'
                          : 'bg-bg-base')
                      }
                    />
                  </div>

                  {/* Card */}
                  <div className={
                    'ml-10 lg:ml-0 w-full lg:w-[360px] ' +
                    (isLeft ? 'lg:mr-auto lg:pr-12' : 'lg:ml-auto lg:pl-12')
                  }>
                    <div
                      className={
                        'bg-bg-surface border border-[var(--border-subtle)] rounded-xl p-5 transition-all duration-300 hover:border-[var(--border-active)] ' +
                        (event.highlight ? 'border-[var(--border-active)] shadow-card' : '')
                      }
                    >
                      <span className="text-[0.8125rem] font-mono text-accent-cyan uppercase tracking-[0.02em]">
                        {event.code}
                      </span>
                      <h4 className="font-display font-medium text-[1.25rem] text-text-primary leading-[1.3] mt-1">
                        {event.name}
                      </h4>
                      <p className="text-[0.875rem] font-mono text-text-muted mt-1">
                        {event.date}
                      </p>
                      <span
                        className={
                          'inline-block mt-2 px-3 py-0.5 rounded-full text-[0.75rem] font-medium tracking-[0.05em] uppercase border ' +
                          (event.type === 'WMO'
                            ? 'text-accent-teal bg-[rgba(0,184,169,0.1)] border-[rgba(0,184,169,0.25)]'
                            : 'text-accent-cyan bg-[var(--accent-wash)] border-[var(--border-active)]')
                        }
                      >
                        {event.type}
                      </span>
                      <p className="text-[0.875rem] text-text-secondary mt-3 leading-[1.5]">
                        {event.opportunity}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  STRATEGIC GAP ANALYSIS                                             */
/* ------------------------------------------------------------------ */

function StrategicGapAnalysis() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.fromTo('.gap-header > *',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
      }
    )
    gsap.fromTo('.gap-card',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, stagger: 0.2, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: '.gap-grid', start: 'top 85%' }
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="relative bg-bg-deep py-24 lg:py-32 overflow-hidden">
      <div className="relative z-10 max-w-[1280px] mx-auto px-6">
        <div className="gap-header text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-[0.8125rem] font-medium tracking-[0.05em] uppercase text-accent-cyan bg-[var(--accent-wash)] border border-[var(--border-active)] font-mono mb-6">
            Strategic Analysis
          </span>
          <h2 className="font-display font-semibold text-[2rem] sm:text-[2.5rem] lg:text-[3.5rem] text-text-primary tracking-[-0.02em] leading-[1.1]">
            Gap Analysis & Mitigation
          </h2>
          <p className="mt-4 text-[1rem] sm:text-[1.125rem] text-text-secondary leading-[1.65] max-w-[720px] mx-auto">
            Key strategic challenges identified through data-driven risk assessment, with evidence-based counter-measures.
          </p>
        </div>

        <div className="gap-grid mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Gap Card 1 — Neutrality */}
          <div className="gap-card relative bg-bg-surface border border-[rgba(150,105,13,0.2)] rounded-2xl p-6 lg:p-8">
            <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r bg-risk-high" />
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={28} className="text-risk-high" />
              <h3 className="font-display font-semibold text-[2rem] lg:text-[2.5rem] text-text-primary leading-[1.15]">
                The Neutrality Gap
              </h3>
            </div>
            <p className="text-[1rem] text-text-secondary leading-[1.6]">
              European and Western missions prioritize scientific neutrality and regional diversity. Risk: Perception of climate coordination as a geopolitical instrument rather than a purely scientific endeavour.
            </p>
            <div className="my-5 h-[1px] bg-[var(--border-subtle)]" />
            <span className="text-[0.8125rem] font-mono font-medium tracking-[0.02em] uppercase text-accent-lime">
              Counter-Measure
            </span>
            <p className="mt-2 text-[1rem] text-text-primary leading-[1.6]">
              Frame all partnerships as multilateral tools governed by independent technical standards and open data protocols, not bilateral initiatives. Establish transparent governance committees with rotating regional representation.
            </p>
            <div className="mt-4 inline-block px-4 py-1.5 rounded-full text-[0.8125rem] font-medium tracking-[0.05em] uppercase text-risk-high bg-[rgba(150,105,13,0.1)] border border-[rgba(150,105,13,0.25)]">
              CRI: 60 — Europe
            </div>
          </div>

          {/* Gap Card 2 — Equity */}
          <div className="gap-card relative bg-bg-surface border border-[rgba(166,58,58,0.2)] rounded-2xl p-6 lg:p-8">
            <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r bg-risk-critical" />
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={28} className="text-risk-critical" />
              <h3 className="font-display font-semibold text-[2rem] lg:text-[2.5rem] text-text-primary leading-[1.15]">
                The Equity Gap
              </h3>
            </div>
            <p className="text-[1rem] text-text-secondary leading-[1.6]">
              A <span className="text-[2rem] font-mono text-accent-rose">19.5x</span> disparity in per-capita CO2 emissions between the highest and lowest emitting regions creates fundamental inequity in climate burden-sharing. Least developed regions face disproportionate adaptation costs with minimal historical responsibility.
            </p>
            <div className="my-5 h-[1px] bg-[var(--border-subtle)]" />
            <span className="text-[0.8125rem] font-mono font-medium tracking-[0.02em] uppercase text-accent-lime">
              Counter-Measure
            </span>
            <p className="mt-2 text-[1rem] text-text-primary leading-[1.6]">
              Mandate differentiated responsibility frameworks in all climate finance mechanisms. Prioritize direct adaptation funding for SIDS and LDCs through transparent, data-verified allocation models.
            </p>
            <div className="mt-4 inline-block px-4 py-1.5 rounded-full text-[0.8125rem] font-medium tracking-[0.05em] uppercase text-risk-critical bg-[rgba(166,58,58,0.1)] border border-[rgba(166,58,58,0.25)]">
              Black Swan Risk: HIGH
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  CTA FOOTER SECTION                                                 */
/* ------------------------------------------------------------------ */

function CTAFooterSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.fromTo('.cta-content > *',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
      }
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="relative bg-bg-deep py-24 lg:py-32 overflow-hidden">
      <div className="relative z-10 max-w-[800px] mx-auto px-6 text-center">
        <div className="cta-content flex flex-col items-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-[0.8125rem] font-medium tracking-[0.05em] uppercase text-accent-cyan bg-[var(--accent-wash)] border border-[var(--border-active)] font-mono mb-6">
            Take Action
          </span>
          <h2
            className="font-display font-semibold text-[2rem] sm:text-[2.5rem] lg:text-[3.5rem] tracking-[-0.02em] leading-[1.1]"
            style={{ color: 'var(--text-primary)' }}
          >
            Join the Climate Coordination Initiative
          </h2>
          <p className="mt-6 text-[1rem] sm:text-[1.125rem] text-text-secondary leading-[1.65]">
            Support evidence-based global climate governance for 2027–2031. Together, we can bridge the 19.5x emissions gap and build a climate-resilient future for all nations.
          </p>
          <Link
            to="/partnerships"
            className="mt-8 inline-flex items-center px-12 py-4 rounded-lg text-[1rem] font-semibold text-bg-deep transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, var(--accent-secondary) 0%, var(--accent-primary) 100%)' }}
          >
            Get Involved
          </Link>
          <p className="mt-6 text-[0.875rem] text-text-muted">
            All data sourced from World Bank Open Data, retrieved {DATA_VINTAGE_SHORT}.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  HOME PAGE                                                          */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div>
      <HeroSection />
      <LiveDataDashboard />
      <SMARTFramework />
      <CampaignRiskIndex />
      <SAPMSection />
      <GovernanceTimeline />
      <StrategicGapAnalysis />
      <CTAFooterSection />
    </div>
  )
}
