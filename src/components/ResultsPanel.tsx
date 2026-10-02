import { FC, useState } from 'react';
import type { BeamResults, BeamInput } from '../types/beam';
import { fmt } from '../engine/validation';
import DiagramChart from './DiagramChart';

interface ResultsPanelProps {
  results: BeamResults;
  input: BeamInput;
}

type Tab = 'sfd' | 'bmd' | 'deflection';

const TAB_CONFIG = {
  sfd:        { label: 'Shear Force (SFD)',  color: 'var(--chart-shear)',  unit: 'N',  invertY: false },
  bmd:        { label: 'Bending Moment (BMD)', color: 'var(--chart-moment)', unit: 'N·m', invertY: false },
  deflection: { label: 'Deflection',         color: 'var(--chart-defl)',   unit: 'm',  invertY: true  },
} as const;

// ── Chevron icon ──────────────────────────────────────────────
const ChevronDown: FC<{ className?: string }> = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const CheckIcon: FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const WarnIcon: FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

// ── Results summary cards ─────────────────────────────────────
const ResultCards: FC<{ results: BeamResults }> = ({ results }) => {
  const { reactions, maxDeflection, maxShear, maxMoment, I, EI } = results;
  return (
    <div className="results-grid">
      <div className="result-card result-card--accent">
        <div className="result-card__label">RA (left reaction)</div>
        <div className="result-card__value">{fmt(reactions.leftV)} N</div>
        {Math.abs(reactions.leftM) > 1e-6 && (
          <div className="result-card__sub">M = {fmt(reactions.leftM)} N·m</div>
        )}
      </div>
      <div className="result-card result-card--accent">
        <div className="result-card__label">RB (right reaction)</div>
        <div className="result-card__value">{fmt(reactions.rightV)} N</div>
        {Math.abs(reactions.rightM) > 1e-6 && (
          <div className="result-card__sub">M = {fmt(reactions.rightM)} N·m</div>
        )}
      </div>
      <div className="result-card result-card--danger">
        <div className="result-card__label">Max Shear</div>
        <div className="result-card__value">{fmt(maxShear.value)} N</div>
        <div className="result-card__sub">at x = {fmt(maxShear.position, 3)} m</div>
      </div>
      <div className="result-card">
        <div className="result-card__label">Max Moment</div>
        <div className="result-card__value">{fmt(maxMoment.value)} N·m</div>
        <div className="result-card__sub">at x = {fmt(maxMoment.position, 3)} m</div>
      </div>
      <div className="result-card">
        <div className="result-card__label">Max Deflection</div>
        <div className="result-card__value">{fmt(maxDeflection.value * 1000, 4)} mm</div>
        <div className="result-card__sub">at x = {fmt(maxDeflection.position, 3)} m</div>
      </div>
      <div className="result-card">
        <div className="result-card__label">I (2nd moment)</div>
        <div className="result-card__value">{fmt(I, 3)} m⁴</div>
        <div className="result-card__sub">EI = {fmt(EI)} N·m²</div>
      </div>
    </div>
  );
};

// ── Calculation steps ─────────────────────────────────────────
const CalcSteps: FC<{ results: BeamResults; input: BeamInput }> = ({ results, input }) => {
  const [open, setOpen] = useState(false);
  const { I, EI, reactions, totalLoad, equilibrium } = results;
  const { leftBC, rightBC, length: L, breadth: b, depth: d, E, pointLoad, udl } = input;

  const hasUDL = udl.intensity !== 0 && udl.end > udl.start;
  const hasPoint = pointLoad.magnitude !== 0;

  return (
    <div className="calc-steps">
      <button
        className="calc-steps__toggle"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="calc-steps-body"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/>
          <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="15" x2="12" y2="15"/>
        </svg>
        Calculation Steps &amp; Assumptions
        <ChevronDown className={`calc-steps__chevron${open ? ' open' : ''}`} />
      </button>

      {open && (
        <div className="calc-steps__body" id="calc-steps-body">

          {/* Step 1: Section properties */}
          <div className="calc-step">
            <div className="calc-step__num">1</div>
            <div>
              <div className="calc-step__title">Section Properties</div>
              <div className="calc-step__formula">{`I = b·d³/12 = ${b}×${d}³/12`}</div>
              <div className="calc-step__result">I = {fmt(I, 4)} m⁴ &nbsp;|&nbsp; EI = {fmt(EI)} N·m²</div>
            </div>
          </div>

          {/* Step 2: Boundary conditions */}
          <div className="calc-step">
            <div className="calc-step__num">2</div>
            <div>
              <div className="calc-step__title">Boundary Conditions</div>
              <div className="calc-step__formula">{`Left: ${leftBC.toUpperCase()}   Right: ${rightBC.toUpperCase()}`}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-2)', marginTop: 4 }}>
                {leftBC === 'fixed' ? '• Left end: v=0, θ=0 (2 constraints)' : leftBC !== 'free' ? '• Left end: v=0 (1 constraint)' : '• Left end: free'}
                <br />
                {rightBC === 'fixed' ? '• Right end: v=0, θ=0 (2 constraints)' : rightBC !== 'free' ? '• Right end: v=0 (1 constraint)' : '• Right end: free'}
              </div>
            </div>
          </div>

          {/* Step 3: Loads */}
          <div className="calc-step">
            <div className="calc-step__num">3</div>
            <div>
              <div className="calc-step__title">Applied Loads</div>
              {hasPoint && (
                <div className="calc-step__formula">{`Point load P = ${pointLoad.magnitude} N  at  a = ${pointLoad.position} m`}</div>
              )}
              {hasUDL && (
                <div className="calc-step__formula">{`UDL  w = ${udl.intensity} N/m  from  ${udl.start} m  to  ${udl.end} m`}</div>
              )}
              {!hasPoint && !hasUDL && (
                <div className="calc-step__formula">No loads applied</div>
              )}
              <div className="calc-step__result">Total load = {fmt(totalLoad)} N</div>
            </div>
          </div>

          {/* Step 4: FEA solution */}
          <div className="calc-step">
            <div className="calc-step__num">4</div>
            <div>
              <div className="calc-step__title">Finite Element Analysis</div>
              <div className="calc-step__formula">{`Method: Euler-Bernoulli beam elements (N=100)\nK·d = F  →  solve for nodal displacements\nReactions: R = K·d − F`}</div>
              <div className="calc-step__result">
                RA = {fmt(reactions.leftV)} N &nbsp;|&nbsp;
                RB = {fmt(reactions.rightV)} N
                {Math.abs(reactions.leftM) > 1e-3 && ` | MA = ${fmt(reactions.leftM)} N·m`}
                {Math.abs(reactions.rightM) > 1e-3 && ` | MB = ${fmt(reactions.rightM)} N·m`}
              </div>
            </div>
          </div>

          {/* Step 5: Equilibrium */}
          <div className="calc-step">
            <div className="calc-step__num">5</div>
            <div>
              <div className="calc-step__title">Equilibrium Verification</div>
              <div className="calc-step__formula">{`ΣFy = RA + RB − W = ${fmt(reactions.leftV)} + ${fmt(reactions.rightV)} − ${fmt(totalLoad)}\n     = ${fmt(equilibrium.sumFyError)} N  (should be ≈ 0)`}</div>
              <div className="calc-step__result">
                {equilibrium.passed
                  ? `✓ Equilibrium satisfied (error < 0.05%)`
                  : `⚠ Equilibrium error: ${fmt(equilibrium.sumFyError)} N`}
              </div>
            </div>
          </div>

          {/* Step 6: Diagrams */}
          <div className="calc-step">
            <div className="calc-step__num">6</div>
            <div>
              <div className="calc-step__title">SFD &amp; BMD (from equilibrium)</div>
              <div className="calc-step__formula">{`V(x) = RA − w·[overlap(0,x)∩(x₁,x₂)] − P·H(x−a)\nM(x) = RA·x − MA − w·moment − P·(x−a)·H(x−a)\nδ(x) = Hermitian interpolation of FEA node displacements`}</div>
            </div>
          </div>

          {/* Assumptions */}
          <div style={{
            marginTop: 16,
            padding: '10px 14px',
            background: 'var(--accent-light)',
            borderRadius: 'var(--r-md)',
            fontSize: '0.8125rem',
            color: 'var(--text-2)',
            lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--accent)', display: 'block', marginBottom: 4 }}>Assumptions &amp; Limitations</strong>
            • Linear elastic material (Hooke's Law applies)<br />
            • Euler-Bernoulli beam theory (plane sections remain plane; shear deformation ignored)<br />
            • Rectangular cross-section: I = b·d³/12<br />
            • Small deflection theory (first-order)<br />
            • All loads applied in the vertical plane (no torsion)<br />
            • Beam length L = {L} m discretised into {100} elements (h ≈ {fmt(L / 100, 4)} m)
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main ResultsPanel ─────────────────────────────────────────
const ResultsPanel: FC<ResultsPanelProps> = ({ results, input }) => {
  const [activeTab, setActiveTab] = useState<Tab>('sfd');
  const cfg = TAB_CONFIG[activeTab];

  const chartData = {
    sfd: results.shear,
    bmd: results.moment,
    deflection: results.deflection,
  }[activeTab];

  return (
    <div className="results-col">
      {/* Summary cards */}
      <div className="panel">
        <div className="panel__head">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="panel__icon" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span className="panel__title">Analysis Results</span>
          <div style={{ marginLeft: 'auto' }}>
            <span className={`badge badge--${results.equilibrium.passed ? 'success' : 'warning'}`}>
              {results.equilibrium.passed ? <><CheckIcon /> Equilibrium OK</> : <><WarnIcon /> Check equilibrium</>}
            </span>
          </div>
        </div>
        <div className="panel__body">
          <ResultCards results={results} />
        </div>
      </div>

      {/* Charts */}
      <div className="panel">
        <div className="chart-tabs" role="tablist" aria-label="Diagram type">
          {(Object.keys(TAB_CONFIG) as Tab[]).map(tab => (
            <button
              key={tab}
              role="tab"
              className={`chart-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
              aria-selected={activeTab === tab}
              aria-controls="chart-panel"
            >
              {TAB_CONFIG[tab].label}
            </button>
          ))}
        </div>
        <div className="chart-wrap" id="chart-panel" role="tabpanel" aria-label={cfg.label}>
          <DiagramChart
            x={results.x}
            y={chartData}
            label={cfg.label}
            unit={cfg.unit}
            color={cfg.color}
            invertY={cfg.invertY}
            showPeak
          />
        </div>

        {/* Calculation steps */}
        <CalcSteps results={results} input={input} />
      </div>
    </div>
  );
};

export default ResultsPanel;
