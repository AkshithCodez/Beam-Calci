import { useState, useEffect, useCallback } from 'react';
import type { InputFields, SupportType, BeamInput, BeamAnalysis } from './types/beam';
import { DEFAULT_FIELDS } from './types/beam';
import type { FieldErrors } from './types/beam';
import { validateInputs } from './engine/validation';
import { solveBeam } from './engine/beamSolver';
import Header from './components/Header';
import Logo from './components/Logo';
import InputPanel from './components/InputPanel';
import BeamDiagram from './components/BeamDiagram';
import ResultsPanel from './components/ResultsPanel';
import LandingPage from './components/landing/LandingPage';

type Theme = 'light' | 'dark';
type ViewMode = 'landing' | 'calculator';

// ── Example configuration (clearly labelled) ─────────────────
// Simply-supported beam, 6m span, 10kN central point load, E=200GPa, 200×400mm section
const EXAMPLE_FIELDS: InputFields = {
  length: '6',
  breadth: '0.2',
  depth: '0.4',
  E: '200000000000',
  pointMag: '10000',
  pointPos: '3',
  udlIntensity: '2000',
  udlStart: '1',
  udlEnd: '5',
  leftBC: 'pin',
  rightBC: 'roller',
};

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('beam-calculator-theme') || localStorage.getItem('beam-calci-theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch { /* Storage can be unavailable in private or restricted contexts. */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [view, setView] = useState<ViewMode>(() => {
    return window.location.hash === '#calculator' ? 'calculator' : 'landing';
  });

  const [fields, setFields] = useState<InputFields>(DEFAULT_FIELDS);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [analysis, setAnalysis] = useState<BeamAnalysis | null>(null);
  const [solvedInput, setSolvedInput] = useState<BeamInput | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#calculator') {
        setView('calculator');
      } else if (
        window.location.hash === '#home' ||
        window.location.hash === '' ||
        window.location.hash === '#overview' ||
        window.location.hash === '#features' ||
        window.location.hash === '#workflow' ||
        window.location.hash === '#theory'
      ) {
        setView('landing');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Persist theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem('beam-calculator-theme', theme); } catch { /* Keep session preference. */ }
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const handleOpenCalculator = useCallback(() => {
    setView('calculator');
    window.location.hash = '#calculator';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNavigateHome = useCallback(() => {
    setView('landing');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleFieldChange = useCallback((key: keyof InputFields, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleBCChange = useCallback((side: 'leftBC' | 'rightBC', value: SupportType) => {
    setFields(prev => ({ ...prev, [side]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next.leftBC;
      delete next.rightBC;
      return next;
    });
  }, []);

  const handleCalculateWithFields = useCallback((inputFields: InputFields) => {
    const { errors: validationErrors, input } = validateInputs(inputFields);
    setErrors(validationErrors);

    if (!input) return;

    setIsCalculating(true);
    setTimeout(() => {
      const result = solveBeam(input);
      setAnalysis(result);
      setSolvedInput(input);
      setHasCalculated(true);
      setIsCalculating(false);
    }, 50);
  }, []);

  const handleCalculate = useCallback(() => {
    handleCalculateWithFields(fields);
  }, [fields, handleCalculateWithFields]);

  const handleReset = useCallback(() => {
    setFields(DEFAULT_FIELDS);
    setErrors({});
    setAnalysis(null);
    setSolvedInput(null);
    setHasCalculated(false);
  }, []);

  const handleLoadExample = useCallback(() => {
    setFields(EXAMPLE_FIELDS);
    setErrors({});
    setAnalysis(null);
    setSolvedInput(null);
    setHasCalculated(false);
  }, []);

  const handleLoadExampleAndCalculate = useCallback(() => {
    setFields(EXAMPLE_FIELDS);
    setErrors({});
    setView('calculator');
    window.location.hash = '#calculator';
    window.scrollTo({ top: 0, behavior: 'instant' });
    handleCalculateWithFields(EXAMPLE_FIELDS);
  }, [handleCalculateWithFields]);

  // Build a live preview input (for beam diagram — shows current form state)
  const { input: liveInput } = validateInputs(fields);

  if (view === 'landing') {
    return (
      <LandingPage
        onOpenCalculator={handleOpenCalculator}
        onLoadExampleAndCalculate={handleLoadExampleAndCalculate}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div className="app" data-theme={theme}>
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onNavigateHome={handleNavigateHome}
      />

      <main className="workspace" id="main-content">
        {/* ── Left column: inputs ── */}
        <div>
          {/* Example loader */}
          {!hasCalculated && (
            <div style={{
              marginBottom: 16,
              padding: '10px 14px',
              background: 'var(--accent-2-light)',
              border: '1px solid var(--accent-2)',
              borderRadius: 'var(--r-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.8125rem',
              color: 'var(--text-2)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ flex: 1 }}>New to Beam Calculator? Try a worked example.</span>
              <button
                onClick={handleLoadExample}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: 'var(--accent-2)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--r-sm)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-head)',
                }}
              >
                Load Example
              </button>
            </div>
          )}

          <InputPanel
            fields={fields}
            errors={errors}
            onFieldChange={handleFieldChange}
            onBCChange={handleBCChange}
            onCalculate={handleCalculate}
            onReset={handleReset}
            isCalculating={isCalculating}
          />
        </div>

        {/* ── Right column: results ── */}
        <div className="results-col">
          {/* Live beam diagram */}
          <BeamDiagram input={liveInput} />

          {/* Results or empty state */}
          {!hasCalculated && !analysis && (
            <div className="panel">
              <div className="state-empty">
                <svg className="state-empty__icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="4" y="19" width="40" height="10" rx="3"/>
                  <polygon points="12,29 6,42 18,42"/>
                  <polygon points="36,29 30,42 42,42"/>
                  <line x1="24" y1="8" x2="24" y2="18"/>
                  <polyline points="20,13 24,18 28,13"/>
                </svg>
                <div className="state-empty__title">No Results Yet</div>
                <div className="state-empty__sub">
                  Enter beam parameters and click <strong>Calculate</strong> to see the shear force diagram, bending moment diagram, and deflection curve.
                </div>
              </div>
            </div>
          )}

          {analysis && !analysis.valid && (
            <div className="panel">
              <div className="state-error" role="alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div>
                  <strong>Calculation Error</strong>
                  <div style={{ marginTop: 4 }}>{analysis.error}</div>
                </div>
              </div>
            </div>
          )}

          {analysis && analysis.valid && solvedInput && (
            <ResultsPanel results={analysis} input={solvedInput} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        padding: '16px 24px',
        fontSize: '0.75rem',
        color: 'var(--text-3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Logo theme={theme} height={24} />
          <span>Euler-Bernoulli FEA, 100 elements</span>
        </div>
        <span>Results are for educational and design-check purposes only. Verify against applicable codes before construction.</span>
      </footer>
    </div>
  );
}

export default App;
