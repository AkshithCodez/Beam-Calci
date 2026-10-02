import { useRef, useState, FC } from 'react';
import SceneCanvas from './SceneCanvas';
import LandingHero from './LandingHero';
import './landing.css';

interface LandingPageProps {
  onOpenCalculator: () => void;
  onLoadExampleAndCalculate?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const BeamCalciLogo: FC = () => (
  <svg
    className="landing-nav__logo-icon"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Architectural arch with beam flexure curve */}
    <path
      d="M6 24V14C6 8.47715 10.4772 4 16 4C21.5228 4 26 8.47715 26 14V24"
      stroke="url(#logoGrad)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line x1="4" y1="24" x2="28" y2="24" stroke="#dfa85b" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="16" cy="14" r="3.5" fill="#dfa85b" />
    <defs>
      <linearGradient id="logoGrad" x1="6" y1="4" x2="26" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffffff" />
        <stop offset="0.6" stopColor="#dfa85b" />
        <stop offset="1" stopColor="#94a3b8" />
      </linearGradient>
    </defs>
  </svg>
);

export const LandingPage: FC<LandingPageProps> = ({
  onOpenCalculator,
  onLoadExampleAndCalculate,
  theme,
  onToggleTheme,
}) => {
  const heroRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'features' | 'workflow' | 'theory'>('overview');

  const scrollToSection = (id: string, sectionKey: typeof activeSection) => {
    setActiveSection(sectionKey);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* ── Top Navigation Bar ───────────────────────────────── */}
      <header className="landing-nav" role="banner">
        <div className="landing-nav__inner">
          <a
            href="#hero"
            className="landing-nav__brand"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('hero', 'overview');
            }}
            aria-label="Beam Calci — Home"
          >
            <BeamCalciLogo />
            <span className="landing-nav__brand-title">
              BEAM <span>CALCI</span>
            </span>
          </a>

          <nav className="landing-nav__links" aria-label="Landing Navigation">
            <button
              type="button"
              className={`landing-nav__link ${activeSection === 'overview' ? 'is-active' : ''}`}
              onClick={() => scrollToSection('hero', 'overview')}
            >
              <span>OVERVIEW</span>
              {activeSection === 'overview' && <span className="landing-nav__dot" />}
            </button>

            <button
              type="button"
              className={`landing-nav__link ${activeSection === 'features' ? 'is-active' : ''}`}
              onClick={() => scrollToSection('features', 'features')}
            >
              <span>FEATURES</span>
              {activeSection === 'features' && <span className="landing-nav__dot" />}
            </button>

            <button
              type="button"
              className={`landing-nav__link ${activeSection === 'workflow' ? 'is-active' : ''}`}
              onClick={() => scrollToSection('workflow', 'workflow')}
            >
              <span>WORKFLOW</span>
              {activeSection === 'workflow' && <span className="landing-nav__dot" />}
            </button>

            <button
              type="button"
              className={`landing-nav__link ${activeSection === 'theory' ? 'is-active' : ''}`}
              onClick={() => scrollToSection('theory', 'theory')}
            >
              <span>THEORY</span>
              {activeSection === 'theory' && <span className="landing-nav__dot" />}
            </button>
          </nav>

          <div className="landing-nav__actions">
            <button
              type="button"
              className="landing-nav__theme-btn"
              onClick={onToggleTheme}
              aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
              title="Toggle theme"
            >
              {theme === 'light' ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>

            <button
              type="button"
              className="landing-nav__cta"
              onClick={onOpenCalculator}
            >
              LAUNCH APP
            </button>
          </div>
        </div>
      </header>

      {/* ── 3D Hero Section ──────────────────────────────────── */}
      <section
        id="hero"
        ref={heroRef}
        className="landing-hero"
        aria-label="Beam Calci 3D Hero"
      >
        {/* Three.js Interactive WebGL Scene */}
        <SceneCanvas containerRef={heroRef} />

        {/* HTML Content Overlay */}
        <LandingHero
          onOpenCalculator={onOpenCalculator}
          onExploreFeatures={() => scrollToSection('features', 'features')}
        />
      </section>

      {/* ── Features Section ─────────────────────────────────── */}
      <section id="features" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-tag">CAPABILITIES</span>
            <h2 className="landing-section-title">
              Engineered with Mathematical Rigor
            </h2>
            <p className="landing-section-desc">
              From continuous elasticity theory to discretized matrix equations,
              Beam Calci delivers structural mechanics directly in your browser.
            </p>
          </div>

          <div className="landing-features-grid">
            <div className="feature-card">
              <div className="feature-card__icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <h3 className="feature-card__title">100-Element Euler-Bernoulli FEA</h3>
              <p className="feature-card__desc">
                Discretizes the beam span into 100 elements using 2-node cubic Hermitian shape
                functions (C¹ continuity). Solves the global stiffness matrix via Gaussian elimination.
              </p>
              <div className="feature-card__badge">High Precision</div>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 21h16" />
                  <polygon points="12,3 7,12 17,12" />
                  <line x1="7" y1="12" x2="17" y2="12" />
                </svg>
              </div>
              <h3 className="feature-card__title">Versatile Boundary Conditions</h3>
              <p className="feature-card__desc">
                Configure pinned-roller simply supported spans, fixed-fixed double clamped beams,
                cantilevers, or propped cantilevers with custom end restraints.
              </p>
              <div className="feature-card__badge">Pin • Roller • Fixed • Free</div>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="3" x2="12" y2="15" />
                  <polyline points="7 10 12 15 17 10" />
                  <path d="M5 21h14" />
                </svg>
              </div>
              <h3 className="feature-card__title">Dynamic Force Combinations</h3>
              <p className="feature-card__desc">
                Combine concentrated point forces placed anywhere along the span with uniformly distributed
                loads (UDL) defined across custom start and end coordinates.
              </p>
              <div className="feature-card__badge">Point Loads &amp; UDL</div>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 3v18h18" />
                  <path d="M18 17V9" />
                  <path d="M13 17V5" />
                  <path d="M8 17v-3" />
                </svg>
              </div>
              <h3 className="feature-card__title">Synchronized Vector Diagrams</h3>
              <p className="feature-card__desc">
                Instant interactive SVG generation of Shear Force Diagrams (SFD), Bending Moment
                Diagrams (BMD), and elastic deflection profiles with live crosshair inspection.
              </p>
              <div className="feature-card__badge">Interactive SVG Charts</div>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3 className="feature-card__title">Transparent Step-by-Step Proofs</h3>
              <p className="feature-card__desc">
                Review complete mathematical derivations: static equilibrium equations ΣFy = 0,
                moment balance ΣM = 0, reaction breakdown, and maximum moment location.
              </p>
              <div className="feature-card__badge">Pedagogical Clarity</div>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                </svg>
              </div>
              <h3 className="feature-card__title">Section Modulus &amp; Elastic Physics</h3>
              <p className="feature-card__desc">
                Computes second moment of area I = (b·h³)/12 and flexural rigidity EI from
                cross-sectional breadth, depth, and Young&apos;s Modulus E in real engineering units.
              </p>
              <div className="feature-card__badge">Mechanics of Materials</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow Section ─────────────────────────────────── */}
      <section id="workflow" className="landing-section landing-section--alt">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-tag">ANALYSIS JOURNEY</span>
            <h2 className="landing-section-title">From Geometry to Solutions in 3 Steps</h2>
            <p className="landing-section-desc">
              An intuitive structural engineering workflow designed for rapid iteration and deep understanding.
            </p>
          </div>

          <div className="landing-workflow-grid">
            <div className="workflow-step">
              <div className="workflow-step__num">01</div>
              <h3 className="workflow-step__title">Define Beam &amp; Material</h3>
              <p className="workflow-step__desc">
                Specify total span length L, cross-section breadth b and depth h, and material
                elasticity (Young&apos;s Modulus E, e.g., 200 GPa for structural steel).
              </p>
              <div className="workflow-step__meta">
                <span>Span L</span>
                <span>Inertia I = (b·h³)/12</span>
                <span>Rigidity EI</span>
              </div>
            </div>

            <div className="workflow-step">
              <div className="workflow-step__num">02</div>
              <h3 className="workflow-step__title">Set Supports &amp; Loads</h3>
              <p className="workflow-step__desc">
                Choose boundary conditions at left and right boundaries (pin, roller, fixed, free).
                Add concentrated point loads with exact locations and uniform loads across specific spans.
              </p>
              <div className="workflow-step__meta">
                <span>Boundary Conditions</span>
                <span>Point Load P</span>
                <span>Distributed Load w</span>
              </div>
            </div>

            <div className="workflow-step">
              <div className="workflow-step__num">03</div>
              <h3 className="workflow-step__title">Solve &amp; Inspect Mechanics</h3>
              <p className="workflow-step__desc">
                Click Calculate to run the FEA solver. Inspect reaction forces RA, RB, hover along
                the SFD and BMD curves, check max deflection, and verify equilibrium equations.
              </p>
              <div className="workflow-step__meta">
                <span>Reactions R_A, R_B</span>
                <span>SFD &amp; BMD Plots</span>
                <span>Deflection v_max</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Theory & Equations Section ───────────────────────── */}
      <section id="theory" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-tag">THEORETICAL FOUNDATION</span>
            <h2 className="landing-section-title">Classical Beam Theory Meets Modern FEA</h2>
            <p className="landing-section-desc">
              Beam Calci implements the standard Euler-Bernoulli fourth-order governing differential equation.
            </p>
          </div>

          <div className="theory-box">
            <div className="theory-equation">
              <span className="theory-equation__math">EI · d⁴w/dx⁴ = q(x)</span>
            </div>

            <div className="theory-grid">
              <div className="theory-item">
                <span className="theory-item__label">Shear Force Relation</span>
                <span className="theory-item__formula">V(x) = dM/dx = -EI · d³w/dx³</span>
                <p className="theory-item__text">
                  The derivative of the bending moment yields the internal shear force distribution.
                </p>
              </div>

              <div className="theory-item">
                <span className="theory-item__label">Bending Moment Relation</span>
                <span className="theory-item__formula">M(x) = -EI · d²w/dx²</span>
                <p className="theory-item__text">
                  The internal bending moment is directly proportional to beam curvature.
                </p>
              </div>

              <div className="theory-item">
                <span className="theory-item__label">Finite Element Formulation</span>
                <span className="theory-item__formula">[K]{'{d}'} = {'{F}'}</span>
                <p className="theory-item__text">
                  100 Hermitian elements assemble into a band-diagonal stiffness matrix solved with Gaussian elimination.
                </p>
              </div>
            </div>

            {/* Quick worked example card */}
            <div className="theory-example-card">
              <div className="theory-example-info">
                <h4>Standard Benchmark Example: Simply Supported 6m Span</h4>
                <p>
                  10 kN central concentrated load at x = 3m plus 2 kN/m uniform load from x = 1m to 5m.
                  Theoretical analytical reactions: R_A = 9.00 kN, R_B = 9.00 kN, M_max = 23.00 kN·m.
                </p>
              </div>
              <button
                type="button"
                className="theory-example-btn"
                onClick={() => {
                  if (onLoadExampleAndCalculate) {
                    onLoadExampleAndCalculate();
                  } else {
                    onOpenCalculator();
                  }
                }}
              >
                Solve Benchmark in Calculator →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final Architectural CTA Section ──────────────────── */}
      <section className="landing-cta-section">
        <div className="landing-container">
          <div className="landing-cta-box">
            <div className="landing-cta-arch-deco" aria-hidden="true" />
            <h2 className="landing-cta-title">Ready to analyze your structure?</h2>
            <p className="landing-cta-desc">
              Experience instant, verified structural beam computations with rich interactive diagrams
              and transparent mathematical proofs.
            </p>
            <div className="landing-cta-actions">
              <button
                type="button"
                className="landing-btn-primary"
                onClick={onOpenCalculator}
              >
                <span className="landing-btn-arrow">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
                <span className="landing-btn-text">OPEN CALCULATOR</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer__inner">
          <div className="landing-footer__brand">
            <div className="landing-footer__title">
              BEAM <span>CALCI</span>
            </div>
            <p className="landing-footer__tag">
              Euler-Bernoulli Finite Element Structural Analysis Platform.
            </p>
          </div>

          <div className="landing-footer__links">
            <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero', 'overview'); }}>Overview</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features', 'features'); }}>Features</a>
            <a href="#workflow" onClick={(e) => { e.preventDefault(); scrollToSection('workflow', 'workflow'); }}>Workflow</a>
            <a href="#theory" onClick={(e) => { e.preventDefault(); scrollToSection('theory', 'theory'); }}>Theory</a>
            <button type="button" onClick={onOpenCalculator} className="landing-footer__text-btn">Calculator</button>
          </div>

          <div className="landing-footer__legal">
            <span>Beam Calci v1.0 • Built with Three.js, React & TypeScript</span>
            <span>Intended for structural design checks and educational analysis.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
