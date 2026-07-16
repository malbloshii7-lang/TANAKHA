import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Command Center', path: '/' },
  { label: 'Data Intelligence', path: '/data-intelligence' },
  { label: 'Strategic Framework', path: '/strategic-framework' },
  { label: 'Global Partnerships', path: '/partnerships' },
  { label: 'Governance', path: '/governance' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <>
      <nav
        className={
          'band-dark fixed top-0 left-0 right-0 z-50 h-[72px] md:h-[72px] flex items-center transition-all duration-300 ' +
          (scrolled
            ? 'bg-[rgba(16,32,47,0.95)] border-b border-[var(--border-subtle)]'
            : 'bg-[rgba(16,32,47,0.92)] border-b border-[var(--border-subtle)]')
        }
      >
        <div className="w-full max-w-[1280px] mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M24 4L6 14v20l18 10 18-10V14L24 4z"
                stroke="var(--accent-primary)"
                strokeWidth="1.5"
                fill="none"
              />
              <text
                x="24"
                y="29"
                textAnchor="middle"
                fill="var(--accent-primary)"
                fontFamily="Source Serif 4 Variable, Georgia, serif"
                fontWeight="600"
                fontSize="14"
              >
                CCC
              </text>
            </svg>
            <span className="font-display font-semibold text-[1.25rem] tracking-normal text-text-primary hidden sm:inline">
              Climate Command Center
            </span>
          </Link>

          {/* Center Nav Links - Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={
                  'relative text-[0.875rem] font-medium transition-colors duration-200 group ' +
                  (location.pathname === link.path ? 'text-accent-cyan' : 'text-text-secondary hover:text-accent-cyan')
                }
              >
                {link.label}
                <span
                  className={
                    'absolute -bottom-1 left-0 h-[1.5px] bg-accent-cyan transition-transform duration-250 ease-out origin-left ' +
                    (location.pathname === link.path ? 'w-full scale-x-100' : 'w-full scale-x-0 group-hover:scale-x-100')
                  }
                />
              </Link>
            ))}
          </div>

          {/* Right: Data link */}
          <div className="flex items-center gap-4">
            <Link
              to="/data-intelligence"
              className="hidden md:inline-flex items-center gap-2 text-[0.875rem] font-medium text-text-secondary border-b border-transparent hover:text-accent-cyan hover:border-accent-cyan transition-colors duration-200 pb-0.5"
            >
              Data Intelligence
            </Link>

            {/* Mobile Hamburger */}
            <button
              className="lg:hidden text-text-primary p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Fullscreen Overlay */}
      {mobileOpen && (
        <div className="band-dark fixed inset-0 z-40 bg-[rgba(16,32,47,0.98)] flex flex-col items-center justify-center gap-8 lg:hidden">
          {navLinks.map((link, i) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-2xl font-display font-medium text-text-primary hover:text-accent-cyan transition-colors duration-200"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/data-intelligence"
            className="mt-4 text-base font-medium text-accent-cyan border-b border-accent-cyan pb-0.5"
          >
            Data Intelligence
          </Link>
        </div>
      )}
    </>
  )
}
