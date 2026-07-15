import { Link } from 'react-router'
import { Github, Linkedin, Twitter, ExternalLink } from 'lucide-react'

const platformLinks = [
  { label: 'Command Center', path: '/' },
  { label: 'Data Intelligence', path: '/data-intelligence' },
  { label: 'Strategic Framework', path: '/strategic-framework' },
  { label: 'Global Partnerships', path: '/partnerships' },
  { label: 'Governance', path: '/governance' },
]

const resourceLinks = [
  { label: 'World Bank Open Data', url: 'https://data.worldbank.org' },
  { label: 'Climate Change Portal', url: 'https://climateknowledgeportal.worldbank.org' },
  { label: 'Carbon Pricing Dashboard', url: 'https://carbonpricingdashboard.worldbank.org' },
  { label: 'Energy Statistics', url: 'https://energydata.info' },
]

export default function Footer() {
  return (
    <footer className="band-dark bg-bg-deep border-t border-[var(--border-subtle)]">
      <div className="max-w-[1280px] mx-auto px-6 pt-24 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Col 1: Logo + Tagline */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-3">
              <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4L6 14v20l18 10 18-10V14L24 4z" stroke="var(--accent-primary)" strokeWidth="2" fill="none" />
                <text x="24" y="29" textAnchor="middle" fill="var(--accent-primary)" fontFamily="Source Serif 4 Variable, Georgia, serif" fontWeight="600" fontSize="14">CCC</text>
              </svg>
              <span className="font-display font-semibold text-[1.25rem] text-text-primary">
                Climate Command Center
              </span>
            </Link>
            <p className="text-[0.875rem] text-text-muted leading-relaxed">
              An initiative for global climate coordination powered by real-time World Bank Open Data.
            </p>
          </div>

          {/* Col 2: Platform */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display font-semibold text-[1rem] text-text-primary mb-1">Platform</h4>
            {platformLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-[0.875rem] text-text-secondary hover:text-accent-cyan transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Col 3: Resources */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display font-semibold text-[1rem] text-text-primary mb-1">Resources</h4>
            {resourceLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.875rem] text-text-secondary hover:text-accent-cyan transition-colors duration-200 inline-flex items-center gap-1"
              >
                {link.label}
                <ExternalLink size={12} />
              </a>
            ))}
          </div>

          {/* Col 4: Connect */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display font-semibold text-[1rem] text-text-primary mb-1">Connect</h4>
            <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent-cyan transition-colors duration-200" aria-label="GitHub">
                <Github size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent-cyan transition-colors duration-200" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent-cyan transition-colors duration-200" aria-label="X/Twitter">
                <Twitter size={20} />
              </a>
            </div>
            <p className="text-[0.875rem] text-text-muted mt-2">
              Data: World Bank Open Data, retrieved July 2026
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-[var(--border-subtle)] text-center">
          <p className="text-[0.875rem] text-text-muted">
            &copy; 2026 Climate Command Center. All data sourced from World Bank Open Data.
          </p>
        </div>
      </div>
    </footer>
  )
}
