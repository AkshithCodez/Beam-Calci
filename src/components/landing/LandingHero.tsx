import type { FC } from 'react';

interface LandingHeroProps {
  onOpenCalculator: () => void;
  onExploreFeatures: () => void;
}

export const LandingHero: FC<LandingHeroProps> = ({
  onOpenCalculator,
  onExploreFeatures,
}) => {
  return (
    <div className="landing-hero-content">
      <div className="landing-hero-left">
        {/* Subtle kicker */}
        <div className="landing-kicker">
          <span className="landing-kicker__dot" />
          <span>STRUCTURAL MECHANICS ENGINE</span>
        </div>

        {/* Main headline - styled exactly matching the reference's grand typography */}
        <h1 className="landing-headline">
          Understand <br />
          <span className="landing-headline__accent">every beam.</span>
        </h1>

        {/* Minimal horizontal divider */}
        <div className="landing-divider" aria-hidden="true" />

        {/* Supporting description grounded in real application capabilities */}
        <p className="landing-subtext">
          Beam Calci couples 100-element Euler-Bernoulli finite element analysis with real-time
          shear, bending moment, and deflection visualization — bringing rigorous structural mechanics
          to your browser.
        </p>

        {/* Action controls */}
        <div className="landing-actions">
          {/* Primary Action matching reference circle-arrow button style */}
          <button
            type="button"
            className="landing-btn-primary"
            onClick={onOpenCalculator}
            aria-label="Open structural beam calculator"
          >
            <span className="landing-btn-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
            <span className="landing-btn-text">OPEN CALCULATOR</span>
          </button>

          {/* Secondary Action */}
          <button
            type="button"
            className="landing-btn-secondary"
            onClick={onExploreFeatures}
          >
            Explore Features
          </button>
        </div>
      </div>

      {/* Bottom Scroll Indicator matching reference visual */}
      <div className="landing-scroll-indicator" aria-hidden="true">
        <span className="landing-scroll-text">SCROLL</span>
        <div className="landing-scroll-track">
          <div className="landing-scroll-dot" />
        </div>
      </div>
    </div>
  );
};

export default LandingHero;
