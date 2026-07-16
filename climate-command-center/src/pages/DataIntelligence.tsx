import { useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import CountUp from "react-countup";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Download,
  ExternalLink,
  AlertTriangle,
  AlertCircle,
  Info,
  TrendingUp,
  Leaf,
  Zap,
  BarChart3,
  Database,
  Globe,
  ChevronRight,
} from "lucide-react";
import { DATA_VINTAGE } from "../content/stats";

/* ──────────────────────────────────────────────
   Easing constants
   ────────────────────────────────────────────── */
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ──────────────────────────────────────────────
   Data
   ────────────────────────────────────────────── */
const co2Data = [
  { region: "North America", value: 13.66, color: "#A63A3A" },
  { region: "High Income", value: 9.75, color: "#96690D" },
  { region: "East Asia & Pacific", value: 7.35, color: "#96690D" },
  { region: "Europe & Central Asia", value: 6.62, color: "#B5822A" },
  { region: "Euro Area", value: 5.40, color: "#B5822A" },
  { region: "World Average", value: 4.69, color: "var(--accent-primary)" },
  { region: "Latin America & Caribbean", value: 2.68, color: "var(--accent-secondary)" },
  { region: "South Asia", value: 1.98, color: "#4F7D46" },
  { region: "Sub-Saharan Africa", value: 0.70, color: "#4F7D46" },
  { region: "Least Developed", value: 0.38, color: "#557A32" },
];

const renewableData = [
  { region: "Africa W. & Central", value: 75.8, color: "#557A32" },
  { region: "Heavily Indebted Poor", value: 76.0, color: "#557A32" },
  { region: "IDA Only", value: 67.4, color: "#557A32" },
  { region: "Africa E. & Southern", value: 65.8, color: "#4F7D46" },
  { region: "Latin America & Carib.", value: 34.2, color: "var(--accent-secondary)" },
  { region: "European Union", value: 21.1, color: "var(--accent-primary)" },
  { region: "Euro Area", value: 19.8, color: "var(--accent-primary)" },
  { region: "East Asia & Pacific", value: 14.8, color: "#33608C" },
  { region: "High Income", value: 12.8, color: "#33608C" },
  { region: "Arab World", value: 5.2, color: "#A63A3A" },
];

interface RiskCardData {
  title: string;
  severity: string;
  probability: number;
  borderColor: string;
  stripColor: string;
  icon: "critical" | "high" | "moderate";
  description: string;
  mitigation: string;
}

const riskCards: RiskCardData[] = [
  {
    title: "Emissions Disparity Cascade",
    severity: "Critical",
    probability: 85,
    borderColor: "rgba(166,58,58,0.2)",
    stripColor: "#A63A3A",
    icon: "critical",
    description:
      "The 19.5x per-capita emissions gap between North America (13.66t) and Sub-Saharan Africa (0.70t) creates a structural inequity that threatens climate negotiation collapse.",
    mitigation:
      "Implement differentiated responsibility frameworks with transparent data verification.",
  },
  {
    title: "Climate Finance Concentration",
    severity: "High",
    probability: 72,
    borderColor: "rgba(150,105,13,0.2)",
    stripColor: "#96690D",
    icon: "high",
    description:
      "76% renewable energy share in IDA nations creates structural dependency. Over-reliance on limited climate finance mechanisms creates single-point-of-failure risk.",
    mitigation:
      "Diversify finance channels through multilateral platforms and private sector engagement.",
  },
  {
    title: "Energy Poverty Trap",
    severity: "Moderate",
    probability: 58,
    borderColor: "rgba(51,96,140,0.2)",
    stripColor: "#33608C",
    icon: "moderate",
    description:
      "High-income nations consume 4,178kg vs Kenya's 539kg per capita, perpetuating inequity. Regions below 1,000 kg/capita lack energy infrastructure for development and adaptation.",
    mitigation:
      "Targeted clean energy investment with performance-linked disbursement.",
  },
];

const downloadDatasets = [
  {
    title: "CO2 Emissions (t/capita)",
    description: "Annual carbon dioxide emissions per capita by country and region, World Bank indicator EN.GHG.CO2.PC.CE.AR5.",
    meta: "CSV · 250 rows · countries & regions, 2024",
    icon: BarChart3,
    href: "/data/co2_per_capita.csv",
    filename: "co2_per_capita.csv",
  },
  {
    title: "Renewable Energy Share (%)",
    description: "Renewable energy consumption as percentage of total final energy consumption, World Bank indicator EG.FEC.RNEW.ZS.",
    meta: "CSV · 752 rows · countries & regions, 1990–2020",
    icon: Leaf,
    href: "/data/renewable_energy_consumption.csv",
    filename: "renewable_energy_consumption.csv",
  },
  {
    title: "Energy Use (kg oil eq./capita)",
    description: "Energy use per capita in kilograms of oil equivalent, World Bank indicator EG.USE.PCAP.KG.OE.",
    meta: "CSV · 51 rows · countries & regions, 2024",
    icon: Zap,
    href: "/data/energy_use_per_capita.csv",
    filename: "energy_use_per_capita.csv",
  },
];

/* ──────────────────────────────────────────────
   Sub-components
   ────────────────────────────────────────────── */

function PillBadge({ children, variant = "cyan" }: { children: React.ReactNode; variant?: "cyan" | "rose" }) {
  const isRose = variant === "rose";
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider ${
        isRose ? "text-[#A03B3B]" : "text-[var(--accent-primary)]"
      }`}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {children}
    </span>
  );
}

function SectionHeader({
  badge,
  badgeVariant,
  title,
  subtitle,
  inView,
}: {
  badge: string;
  badgeVariant?: "cyan" | "rose";
  title: string;
  subtitle: string;
  inView: boolean;
}) {
  return (
    <div className="mb-12 md:mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
      >
        <PillBadge variant={badgeVariant}>{badge}</PillBadge>
      </motion.div>
      <motion.h2
        className="mt-4 text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl"
        style={{ fontFamily: "'Source Serif 4 Variable', Georgia, serif", letterSpacing: "-0.02em" }}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT_EXPO }}
      >
        {title}
      </motion.h2>
      <motion.p
        className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT_EXPO }}
      >
        {subtitle}
      </motion.p>
    </div>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
  suffix = "",
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[rgba(26,43,60,0.18)] bg-[var(--bg-base)] px-4 py-3 shadow-xl">
      <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
      <p
        className="mt-1 text-lg font-medium text-[var(--accent-primary)]"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {payload[0].value}
        {suffix}
      </p>
    </div>
  );
}

function RiskIcon({ type }: { type: "critical" | "high" | "moderate" }) {
  if (type === "critical") return <AlertTriangle className="h-8 w-8 text-[#A63A3A]" />;
  if (type === "high") return <AlertCircle className="h-8 w-8 text-[#96690D]" />;
  return <Info className="h-8 w-8 text-[#33608C]" />;
}

/* ──────────────────────────────────────────────
   Main Page Component
   ────────────────────────────────────────────── */
export default function DataIntelligence() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  const co2Ref = useRef<HTMLDivElement>(null);
  const co2InView = useInView(co2Ref, { once: true, margin: "-100px" });

  const renewableRef = useRef<HTMLDivElement>(null);
  const renewableInView = useInView(renewableRef, { once: true, margin: "-100px" });

  const energyRef = useRef<HTMLDivElement>(null);
  const energyInView = useInView(energyRef, { once: true, margin: "-100px" });

  const riskRef = useRef<HTMLDivElement>(null);
  const riskInView = useInView(riskRef, { once: true, margin: "-80px" });

  const downloadRef = useRef<HTMLDivElement>(null);
  const downloadInView = useInView(downloadRef, { once: true, margin: "-80px" });

  const handleDownload = useCallback(
    (dataset: (typeof downloadDatasets)[number]) => {
      const link = document.createElement("a");
      link.href = dataset.href;
      link.download = dataset.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    []
  );

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* ════════════════════════════════════════════
          SECTION 1 — Page Hero
          ════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="band-dark relative flex min-h-[50vh] items-center justify-center overflow-hidden"
        style={{ backgroundColor: "#10202F" }}
      >
        {/* Background image */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/data-heatmap-co2.jpg)" }}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={heroInView ? { opacity: 0.25, scale: 1 } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        {/* Overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(16,32,47,0.7) 0%, rgba(20,40,56,0.95) 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 py-32 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE_OUT_EXPO }}
          >
            <PillBadge>
              <Database className="h-3.5 w-3.5" />
              WORLD BANK OPEN DATA
            </PillBadge>
          </motion.div>

          <motion.h1
            className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            style={{
              fontFamily: "'Source Serif 4 Variable', Georgia, serif",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: "var(--text-primary)",
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.5, ease: EASE_OUT_EXPO }}
          >
            Climate Data Intelligence
          </motion.h1>

          <motion.p
            className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.7, ease: EASE_OUT_EXPO }}
          >
            Comprehensive analysis of global emissions, energy consumption, and
            renewable capacity. All data sourced from the World Bank Open Data
            platform.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--text-muted)]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />
              Data: {DATA_VINTAGE}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-secondary)]" />
              Source: World Bank Open Data
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#557A32]" />
              Indicators: 12
            </span>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 2 — CO2 Emissions Deep Dive
          ════════════════════════════════════════════ */}
      <section
        ref={co2Ref}
        className="relative py-24 md:py-32"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="EMISSIONS ANALYSIS"
            title="CO2 Emissions Per Capita"
            subtitle="Metric tons per capita by region. The 19.5x disparity between highest and lowest emitting regions represents a critical governance challenge."
            inView={co2InView}
          />

          {/* Two-column layout */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Left — Horizontal Bar Chart */}
            <motion.div
              className="lg:col-span-7"
              initial={{ opacity: 0, y: 40 }}
              animate={co2InView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT_EXPO }}
            >
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 md:p-6">
                <ResponsiveContainer width="100%" height={520}>
                  <BarChart
                    layout="vertical"
                    data={co2Data}
                    margin={{ top: 5, right: 60, bottom: 5, left: 5 }}
                    barCategoryGap={10}
                  >
                    <CartesianGrid
                      horizontal={false}
                      stroke="var(--border-subtle)"
                    />
                    <XAxis
                      type="number"
                      tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                      axisLine={{ stroke: "var(--border-subtle)" }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="region"
                      tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={170}
                    />
                    <Tooltip
                      content={<CustomTooltip suffix=" t/capita" />}
                      cursor={{ fill: "var(--border-subtle)" }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[0, 6, 6, 0]}
                      barSize={32}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    >
                      {co2Data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          fillOpacity={0.88}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Right — Insights Panel */}
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, y: 40 }}
              animate={co2InView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.4, ease: EASE_OUT_EXPO }}
            >
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 md:p-8">
                <h3
                  className="mb-5 flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]"
                  style={{ fontFamily: "'Source Serif 4 Variable', Georgia, serif" }}
                >
                  <TrendingUp className="h-5 w-5 text-[var(--accent-primary)]" />
                  Key Insights
                </h3>

                <div className="space-y-5">
                  <motion.div
                    className="rounded-lg border-l-2 border-[#A03B3B] bg-[rgba(166,58,58,0.04)] p-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={co2InView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.5, duration: 0.6, ease: EASE_OUT_EXPO }}
                  >
                    <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                      North American per-capita emissions{" "}
                      <span
                        className="text-[#A03B3B]"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        (13.66t)
                      </span>{" "}
                      are{" "}
                      <span
                        className="text-lg font-medium text-[#A03B3B]"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        19.5x
                      </span>{" "}
                      Sub-Saharan Africa&apos;s rate{" "}
                      <span
                        className="text-[#A03B3B]"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        (0.70t)
                      </span>
                      .
                    </p>
                  </motion.div>

                  <motion.div
                    className="rounded-lg border-l-2 border-[var(--accent-secondary)] bg-[rgba(15,107,102,0.04)] p-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={co2InView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.6, duration: 0.6, ease: EASE_OUT_EXPO }}
                  >
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                      Despite contributing least to historical emissions,
                      Sub-Saharan Africa faces the highest climate vulnerability
                      index.
                    </p>
                  </motion.div>

                  <motion.div
                    className="rounded-lg border-l-2 border-[#96690D] bg-[rgba(150,105,13,0.04)] p-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={co2InView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.7, duration: 0.6, ease: EASE_OUT_EXPO }}
                  >
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                      East Asia &amp; Pacific at{" "}
                      <span
                        className="text-[#96690D]"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        7.35t/capita
                      </span>{" "}
                      exceeds global average but represents the largest absolute
                      emissions volume due to population.
                    </p>
                  </motion.div>
                </div>

                <div className="mt-6 border-t border-[var(--border-subtle)] pt-5">
                  <p className="text-xs italic text-[var(--text-muted)]">
                    Source: World Bank — CO2 emissions (metric tons per capita),
                    2024
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section divider */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--accent-wash) 50%, transparent 100%)",
        }}
      />

      {/* ════════════════════════════════════════════
          SECTION 3 — Renewable Energy Capacity
          ════════════════════════════════════════════ */}
      <section
        ref={renewableRef}
        className="relative py-24 md:py-32"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="RENEWABLE ENERGY"
            title="Renewable Energy Share"
            subtitle="Percentage of total final energy consumption from renewable sources. Western and Central Africa leads at 75.8%, while the Arab World lags at 5.2%."
            inView={renewableInView}
          />

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Left — Insights Panel */}
            <motion.div
              className="order-2 lg:order-1 lg:col-span-5"
              initial={{ opacity: 0, y: 40 }}
              animate={renewableInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3, ease: EASE_OUT_EXPO }}
            >
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 md:p-8">
                <h3
                  className="mb-5 flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]"
                  style={{ fontFamily: "'Source Serif 4 Variable', Georgia, serif" }}
                >
                  <Leaf className="h-5 w-5 text-[#557A32]" />
                  Key Insights
                </h3>

                <div className="space-y-5">
                  <motion.div
                    className="rounded-lg border-l-2 border-[#557A32] bg-[rgba(85,122,50,0.04)] p-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={renewableInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.5, duration: 0.6, ease: EASE_OUT_EXPO }}
                  >
                    <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                      Heavily Indebted Poor Countries lead globally at{" "}
                      <span
                        className="text-lg font-medium text-[#557A32]"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        76.0%
                      </span>{" "}
                      renewable share, primarily driven by hydroelectric and
                      biomass energy sources.
                    </p>
                  </motion.div>

                  <motion.div
                    className="rounded-lg border-l-2 border-[#96690D] bg-[rgba(150,105,13,0.04)] p-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={renewableInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.6, duration: 0.6, ease: EASE_OUT_EXPO }}
                  >
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                      High-income nations average only{" "}
                      <span
                        className="text-lg font-medium text-[#96690D]"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        12.8%
                      </span>{" "}
                      renewable energy — a paradox of prosperity that demands
                      policy correction.
                    </p>
                  </motion.div>

                  <motion.div
                    className="rounded-lg border-l-2 border-[var(--accent-primary)] bg-[var(--accent-wash)] p-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={renewableInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.7, duration: 0.6, ease: EASE_OUT_EXPO }}
                  >
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                      The EU at{" "}
                      <span
                        className="text-[var(--accent-primary)]"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        21.1%
                      </span>{" "}
                      demonstrates that policy frameworks can accelerate
                      transition, though targets remain insufficient.
                    </p>
                  </motion.div>
                </div>

                <div className="mt-6 border-t border-[var(--border-subtle)] pt-5">
                  <p className="text-xs italic text-[var(--text-muted)]">
                    Source: World Bank — Renewable energy consumption (% of
                    total final energy consumption), 2024
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right — Vertical Bar Chart */}
            <motion.div
              className="order-1 lg:order-2 lg:col-span-7"
              initial={{ opacity: 0, y: 40 }}
              animate={renewableInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT_EXPO }}
            >
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 md:p-6">
                <ResponsiveContainer width="100%" height={520}>
                  <BarChart
                    data={renewableData}
                    margin={{ top: 10, right: 10, bottom: 40, left: 0 }}
                    barCategoryGap="15%"
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="var(--border-subtle)"
                    />
                    <XAxis
                      dataKey="region"
                      tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                      axisLine={{ stroke: "var(--border-subtle)" }}
                      tickLine={false}
                      angle={-35}
                      textAnchor="end"
                      height={70}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `${v}%`}
                    />
                    <Tooltip
                      content={<CustomTooltip suffix="%" />}
                      cursor={{ fill: "var(--border-subtle)" }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[6, 6, 0, 0]}
                      barSize={44}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    >
                      {renewableData.map((entry, index) => (
                        <Cell
                          key={`cell-ren-${index}`}
                          fill={entry.color}
                          fillOpacity={0.88}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section divider */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--accent-wash) 50%, transparent 100%)",
        }}
      />

      {/* ════════════════════════════════════════════
          SECTION 4 — Energy Use Inequity
          ════════════════════════════════════════════ */}
      <section
        ref={energyRef}
        className="relative py-24 md:py-32"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="ENERGY CONSUMPTION"
            title="Energy Use Per Capita"
            subtitle="Kilograms of oil equivalent per capita. An 11.9x disparity between North America and Kenya reveals deep global energy inequity."
            inView={energyInView}
          />

          {/* Comparison Cards */}
          <div className="mt-16 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-11">
            {/* Card A — Highest Consumer */}
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={energyInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT_EXPO }}
            >
              <div
                className="h-full rounded-2xl border p-6 md:p-8"
                style={{
                  background:
                    "linear-gradient(135deg, var(--bg-surface) 0%, rgba(166,58,58,0.05) 100%)",
                  borderColor: "rgba(166,58,58,0.15)",
                }}
              >
                <span
                  className="text-xs font-medium uppercase tracking-wider text-[#A03B3B]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Highest Per-Capita Consumption
                </span>
                <h3
                  className="mt-3 text-2xl font-semibold text-[var(--text-primary)] md:text-3xl"
                  style={{ fontFamily: "'Source Serif 4 Variable', Georgia, serif" }}
                >
                  North America
                </h3>
                <div className="mt-4">
                  {energyInView ? (
                    <CountUp
                      start={0}
                      end={6448}
                      duration={1.5}
                      separator=","
                      className="text-4xl font-medium text-[#A03B3B] md:text-5xl"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    />
                  ) : (
                    <span
                      className="text-4xl font-medium text-[#A03B3B] md:text-5xl"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      0
                    </span>
                  )}
                </div>
                <p
                  className="mt-1 text-sm text-[var(--text-muted)]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  kg oil equivalent / capita
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                  11.9x the consumption of the lowest region. Equivalent to the
                  energy use of approximately 12 average Kenyan citizens.
                </p>
                {/* Mini progress bar */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>Relative to world avg (1,973)</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      327%
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, #96690D, #A03B3B)",
                      }}
                      initial={{ width: 0 }}
                      animate={energyInView ? { width: "100%" } : {}}
                      transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Divider — 11.9x */}
            <motion.div
              className="flex items-center justify-center lg:col-span-1"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={energyInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.7, ease: EASE_OUT_EXPO }}
            >
              <div className="flex flex-col items-center">
                <div className="hidden text-2xl text-[var(--text-muted)] lg:block">÷</div>
                <div
                  className="my-2 text-3xl font-bold lg:text-2xl"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "var(--accent-rose)",
                  }}
                >
                  {energyInView ? (
                    <CountUp start={0} end={11.9} duration={1.5} decimals={1} />
                  ) : (
                    "0"
                  )}
                  x
                </div>
                <div className="hidden text-2xl text-[var(--text-muted)] lg:block">÷</div>
              </div>
            </motion.div>

            {/* Card B — Lowest Consumer */}
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={energyInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.35, ease: EASE_OUT_EXPO }}
            >
              <div
                className="h-full rounded-2xl border p-6 md:p-8"
                style={{
                  background:
                    "linear-gradient(135deg, var(--bg-surface) 0%, rgba(15,107,102,0.05) 100%)",
                  borderColor: "rgba(15,107,102,0.15)",
                }}
              >
                <span
                  className="text-xs font-medium uppercase tracking-wider text-[var(--accent-secondary)]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Lowest Per-Capita Consumption
                </span>
                <h3
                  className="mt-3 text-2xl font-semibold text-[var(--text-primary)] md:text-3xl"
                  style={{ fontFamily: "'Source Serif 4 Variable', Georgia, serif" }}
                >
                  Kenya
                </h3>
                <div className="mt-4">
                  {energyInView ? (
                    <CountUp
                      start={0}
                      end={539}
                      duration={1.5}
                      separator=","
                      className="text-4xl font-medium text-[var(--accent-secondary)] md:text-5xl"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    />
                  ) : (
                    <span
                      className="text-4xl font-medium text-[var(--accent-secondary)] md:text-5xl"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      0
                    </span>
                  )}
                </div>
                <p
                  className="mt-1 text-sm text-[var(--text-muted)]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  kg oil equivalent / capita
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                  Energy poverty limits economic development and climate
                  adaptation capacity. Yet per-capita emissions remain
                  minimal — a stark climate injustice.
                </p>
                {/* Mini progress bar */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>Relative to North America</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      8.4%
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          "var(--accent-primary)",
                      }}
                      initial={{ width: 0 }}
                      animate={energyInView ? { width: "8.4%" } : {}}
                      transition={{ delay: 1.0, duration: 1.2, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section divider */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--accent-wash) 50%, transparent 100%)",
        }}
      />

      {/* ════════════════════════════════════════════
          SECTION 5 — Black Swan Risk Assessment
          ════════════════════════════════════════════ */}
      <section
        ref={riskRef}
        className="relative py-24 md:py-32"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={riskInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            >
              <PillBadge variant="rose">
                <AlertTriangle className="h-3.5 w-3.5" />
                RISK ASSESSMENT
              </PillBadge>
            </motion.div>
            <motion.h2
              className="mt-4 text-3xl font-semibold tracking-tight text-[#A03B3B] md:text-4xl"
              style={{ fontFamily: "'Source Serif 4 Variable', Georgia, serif", letterSpacing: "-0.02em" }}
              initial={{ opacity: 0, y: 30 }}
              animate={riskInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT_EXPO }}
            >
              Black Swan Risk Assessment
            </motion.h2>
            <motion.p
              className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg"
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
              initial={{ opacity: 0, y: 30 }}
              animate={riskInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT_EXPO }}
            >
              Systemic risks identified through quantitative analysis of World
              Bank climate data. These represent low-probability, high-impact
              scenarios requiring proactive mitigation.
            </motion.p>
          </div>

          {/* Risk Cards Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {riskCards.map((risk, i) => (
              <motion.div
                key={risk.title}
                className="group relative rounded-xl border bg-[var(--bg-surface)] p-6 transition-all duration-300 hover:-translate-y-0.5"
                style={{ borderColor: risk.borderColor }}
                initial={{ opacity: 0, y: 40 }}
                animate={riskInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.15, ease: EASE_OUT_EXPO }}
              >
                {/* Left color strip */}
                <div
                  className="absolute left-0 top-4 h-12 w-1 rounded-r"
                  style={{ backgroundColor: risk.stripColor }}
                />

                <div className="pl-4">
                  <div className="flex items-start justify-between">
                    <RiskIcon type={risk.icon} />
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        backgroundColor:
                          risk.severity === "Critical"
                            ? "rgba(166,58,58,0.12)"
                            : risk.severity === "High"
                            ? "rgba(150,105,13,0.12)"
                            : "rgba(51,96,140,0.12)",
                        color:
                          risk.severity === "Critical"
                            ? "#A63A3A"
                            : risk.severity === "High"
                            ? "#96690D"
                            : "#33608C",
                      }}
                    >
                      {risk.severity.toUpperCase()}
                    </span>
                  </div>

                  <h3
                    className="mt-4 text-xl font-semibold text-[var(--text-primary)]"
                    style={{ fontFamily: "'Source Serif 4 Variable', Georgia, serif" }}
                  >
                    {risk.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {risk.description}
                  </p>

                  {/* Probability bar */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">Probability</span>
                      <span
                        className="font-medium"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          color:
                            risk.probability >= 80
                              ? "#A63A3A"
                              : risk.probability >= 60
                              ? "#96690D"
                              : "#33608C",
                        }}
                      >
                        {risk.probability}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: risk.stripColor }}
                        initial={{ width: 0 }}
                        animate={riskInView ? { width: `${risk.probability}%` } : {}}
                        transition={{
                          delay: 0.6 + i * 0.15,
                          duration: 1,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                  </div>

                  {/* Mitigation */}
                  <div className="mt-4 flex items-start gap-2 rounded-lg bg-[rgba(85,122,50,0.06)] p-3">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#557A32]" />
                    <p className="text-xs leading-relaxed text-[#557A32]">
                      {risk.mitigation}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section divider */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--accent-wash) 50%, transparent 100%)",
        }}
      />

      {/* ════════════════════════════════════════════
          SECTION 6 — Data Download Section
          ════════════════════════════════════════════ */}
      <section
        ref={downloadRef}
        className="relative py-20 md:py-28"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="OPEN DATA"
            title="Access the Raw Data"
            subtitle="All climate indicators used in this analysis are available through the World Bank Open Data API and can be downloaded for independent analysis."
            inView={downloadInView}
          />

          {/* Download Cards */}
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {downloadDatasets.map((dataset, i) => {
              const Icon = dataset.icon;
              return (
                <motion.div
                  key={dataset.title}
                  className="group rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--border-active)]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={downloadInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.1, ease: EASE_OUT_EXPO }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent-wash)]">
                      <Icon className="h-6 w-6 text-[var(--accent-primary)]" />
                    </div>
                    <span
                      className="text-xs text-[var(--text-muted)]"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      CSV
                    </span>
                  </div>

                  <h3
                    className="mt-4 text-lg font-semibold text-[var(--text-primary)]"
                    style={{ fontFamily: "'Source Serif 4 Variable', Georgia, serif" }}
                  >
                    {dataset.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {dataset.description}
                  </p>
                  <p
                    className="mt-3 text-xs text-[var(--text-muted)]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {dataset.meta}
                  </p>

                  <button
                    onClick={() => handleDownload(dataset)}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[rgba(26,43,60,0.18)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-all duration-200 hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                  >
                    <Download className="h-4 w-4" />
                    Download CSV
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Source Link Banner */}
          <motion.div
            className="mt-10 rounded-xl border border-[var(--accent-wash)] bg-[var(--bg-surface)] p-6"
            initial={{ opacity: 0, y: 30 }}
            animate={downloadInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6, ease: EASE_OUT_EXPO }}
          >
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 sm:items-center">
                <Globe className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent-primary)] sm:mt-0" />
                <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                  All data sourced from World Bank Open Data — Climate Change
                  Knowledge Portal. Visit{" "}
                  <span className="text-[var(--text-muted)]">data.worldbank.org</span> for
                  the complete dataset.
                </p>
              </div>
              <a
                href="https://data.worldbank.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-[var(--accent-primary)] transition-colors hover:text-[var(--accent-secondary)]"
              >
                Explore World Bank Data
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
