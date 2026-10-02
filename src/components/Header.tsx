import type { FC } from 'react';
import Logo from './Logo';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNavigateHome?: () => void;
}

const SunIcon: FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon: FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const InfoIcon: FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

const Header: FC<HeaderProps> = ({ theme, onToggleTheme, onNavigateHome }) => {
  return (
    <header className="header" role="banner">
      <div className="header__inner">
        <a
          href="#home"
          className="header__logo"
          aria-label="Beam Calculator — home"
          onClick={(e) => {
            if (onNavigateHome) {
              e.preventDefault();
              onNavigateHome();
            }
          }}
        >
          <Logo theme={theme} height={34} />
        </a>

        <div className="header__spacer" />

        <nav className="header__nav" aria-label="Site navigation">
          {onNavigateHome && (
            <button
              type="button"
              className="btn btn--outline"
              style={{
                padding: '5px 14px',
                fontSize: '0.8rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 500,
                fontFamily: 'var(--font-head)',
              }}
              onClick={onNavigateHome}
              title="Return to 3D Overview"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Overview</span>
            </button>
          )}

          <button
            className="btn-icon"
            aria-label="About Beam Calculator"
            title="About"
            onClick={() => {
              alert(
                'Beam Calculator v1.0\n\nA professional structural beam analysis platform.\n\n' +
                'Supports:\n• Simply supported beams\n• Cantilever beams\n• Fixed-fixed beams\n• Propped cantilevers\n\n' +
                'Method: Euler-Bernoulli Finite Element Analysis\n' +
                'Elements: 100 Hermitian beam elements\n\n' +
                'Calculates: Reactions, Shear Force Diagram (SFD),\n' +
                'Bending Moment Diagram (BMD), Deflection curve.'
              );
            }}
          >
            <InfoIcon />
          </button>

          <button
            className="btn-icon"
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
            onClick={onToggleTheme}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
