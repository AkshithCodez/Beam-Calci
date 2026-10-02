import type { FC, ChangeEvent } from 'react';
import type { InputFields, FieldErrors, SupportType } from '../types/beam';

// ─── Icon helpers ─────────────────────────────────────────────
const RulerIcon = () => (
  <svg className="section-group__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="1" y="5" width="14" height="6" rx="1"/>
    <line x1="4" y1="5" x2="4" y2="7"/><line x1="7" y1="5" x2="7" y2="7"/>
    <line x1="10" y1="5" x2="10" y2="7"/><line x1="13" y1="5" x2="13" y2="7"/>
  </svg>
);

const LoadIcon = () => (
  <svg className="section-group__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="8" y1="1" x2="8" y2="9"/><polyline points="5,6 8,9 11,6"/>
    <rect x="2" y="11" width="12" height="3" rx="1"/>
  </svg>
);

const UDLIcon = () => (
  <svg className="section-group__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="2" y1="1" x2="14" y2="1"/><line x1="2" y1="1" x2="2" y2="6"/><polyline points="0,4 2,6 4,4"/>
    <line x1="8" y1="1" x2="8" y2="6"/><polyline points="6,4 8,6 10,4"/>
    <line x1="14" y1="1" x2="14" y2="6"/><polyline points="12,4 14,6 16,4"/>
    <rect x="1" y="8" width="14" height="3" rx="1"/>
  </svg>
);

const MaterialIcon = () => (
  <svg className="section-group__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="1" y="6" width="14" height="4" rx="1"/>
    <path d="M4 6 L4 3 Q4 1 6 1 L10 1 Q12 1 12 3 L12 6"/><path d="M4 10 L4 13 Q4 15 6 15 L10 15 Q12 15 12 13 L12 10"/>
  </svg>
);

const BCIcon = () => (
  <svg className="section-group__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="2" y1="8" x2="14" y2="8"/><polygon points="4,8 2,12 6,12"/><polygon points="12,8 10,12 14,12"/>
    <line x1="2" y1="13" x2="6" y2="13"/><circle cx="12" cy="13" r="1.5"/>
  </svg>
);

const ErrorIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const CalcIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/>
    <line x1="8" y1="10" x2="12" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/>
    <line x1="14" y1="12" x2="16" y2="12"/><line x1="14" y1="16" x2="16" y2="16"/>
  </svg>
);

const ResetIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
  </svg>
);

// ── Support SVG symbols ───────────────────────────────────────
const FixedSVG: FC<{ side: 'left' | 'right' }> = ({ side }) => (
  <svg className="bc-option__icon" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {side === 'left' ? (
      <>
        <rect x="0" y="0" width="10" height="24" fill="var(--border)" stroke="var(--border-2)" strokeWidth="1"/>
        <line x1="0" y1="4" x2="10" y2="4" stroke="var(--text-3)" strokeWidth="1"/>
        <line x1="0" y1="8" x2="10" y2="8" stroke="var(--text-3)" strokeWidth="1"/>
        <line x1="0" y1="12" x2="10" y2="12" stroke="var(--text-3)" strokeWidth="1"/>
        <line x1="0" y1="16" x2="10" y2="16" stroke="var(--text-3)" strokeWidth="1"/>
        <line x1="0" y1="20" x2="10" y2="20" stroke="var(--text-3)" strokeWidth="1"/>
        <rect x="10" y="9" width="16" height="6" rx="1" fill="var(--accent)" />
      </>
    ) : (
      <>
        <rect x="26" y="0" width="10" height="24" fill="var(--border)" stroke="var(--border-2)" strokeWidth="1"/>
        <line x1="26" y1="4" x2="36" y2="4" stroke="var(--text-3)" strokeWidth="1"/>
        <line x1="26" y1="8" x2="36" y2="8" stroke="var(--text-3)" strokeWidth="1"/>
        <line x1="26" y1="12" x2="36" y2="12" stroke="var(--text-3)" strokeWidth="1"/>
        <line x1="26" y1="16" x2="36" y2="16" stroke="var(--text-3)" strokeWidth="1"/>
        <line x1="26" y1="20" x2="36" y2="20" stroke="var(--text-3)" strokeWidth="1"/>
        <rect x="10" y="9" width="16" height="6" rx="1" fill="var(--accent)" />
      </>
    )}
  </svg>
);

const PinSVG: FC = () => (
  <svg className="bc-option__icon" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="10" y="7" width="16" height="6" rx="1" fill="var(--accent)" />
    <polygon points="18,13 12,22 24,22" fill="var(--accent-2)" />
    <line x1="8" y1="23" x2="28" y2="23" stroke="var(--accent-2)" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const RollerSVG: FC = () => (
  <svg className="bc-option__icon" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="10" y="7" width="16" height="6" rx="1" fill="var(--accent)" />
    <polygon points="18,13 12,20 24,20" fill="var(--accent-2)" />
    <circle cx="14" cy="22" r="2" fill="var(--accent-2)" />
    <circle cx="22" cy="22" r="2" fill="var(--accent-2)" />
  </svg>
);

const FreeSVG: FC = () => (
  <svg className="bc-option__icon" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="10" y="9" width="16" height="6" rx="1" fill="var(--accent)" />
    <line x1="26" y1="9" x2="30" y2="6" stroke="var(--text-3)" strokeWidth="1.5" strokeDasharray="2,2"/>
    <line x1="26" y1="12" x2="32" y2="12" stroke="var(--text-3)" strokeWidth="1.5" strokeDasharray="2,2"/>
    <line x1="26" y1="15" x2="30" y2="18" stroke="var(--text-3)" strokeWidth="1.5" strokeDasharray="2,2"/>
  </svg>
);

const FREE_SVG_LEFT: FC = () => (
  <svg className="bc-option__icon" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="10" y="9" width="16" height="6" rx="1" fill="var(--accent)" />
    <line x1="10" y1="9" x2="6" y2="6" stroke="var(--text-3)" strokeWidth="1.5" strokeDasharray="2,2"/>
    <line x1="10" y1="12" x2="4" y2="12" stroke="var(--text-3)" strokeWidth="1.5" strokeDasharray="2,2"/>
    <line x1="10" y1="15" x2="6" y2="18" stroke="var(--text-3)" strokeWidth="1.5" strokeDasharray="2,2"/>
  </svg>
);

// ── Field component ───────────────────────────────────────────
interface FieldProps {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  step?: string;
}

const Field: FC<FieldProps> = ({ id, label, unit, value, onChange, error, placeholder = '0', step = 'any' }) => (
  <div className="field">
    <div className="field__label">
      <label className="field__name" htmlFor={id}>{label}</label>
      <span className="field__unit">{unit}</span>
    </div>
    <input
      id={id}
      className={`field__input${error ? ' has-error' : ''}`}
      type="number"
      step={step}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-describedby={error ? `${id}-error` : undefined}
      aria-invalid={!!error}
    />
    {error && (
      <div className="field__error" id={`${id}-error`} role="alert">
        <ErrorIcon />
        {error}
      </div>
    )}
  </div>
);

// ── BC option ─────────────────────────────────────────────────
interface BCOptionProps {
  id: string;
  value: SupportType;
  selected: boolean;
  onSelect: () => void;
  side: 'left' | 'right';
  error?: string;
}

const BC_ICONS: Record<SupportType, { left: FC; right: FC; label: string }> = {
  fixed:  { left: () => <FixedSVG side="left"/>, right: () => <FixedSVG side="right"/>, label: 'Fixed' },
  pin:    { left: PinSVG, right: PinSVG, label: 'Pin' },
  roller: { left: RollerSVG, right: RollerSVG, label: 'Roller' },
  free:   { left: FREE_SVG_LEFT, right: FreeSVG, label: 'Free' },
};

const BCOption: FC<BCOptionProps> = ({ id, value, selected, onSelect, side, error }) => {
  const { label } = BC_ICONS[value];
  const IconComp = BC_ICONS[value][side];
  return (
    <label
      className={`bc-option${selected ? ' selected' : ''}`}
      htmlFor={id}
      aria-current={selected ? 'true' : 'false'}
    >
      <input
        type="radio"
        id={id}
        name={`bc-${side}`}
        value={value}
        checked={selected}
        onChange={onSelect}
        aria-describedby={error ? `bc-${side}-error` : undefined}
      />
      <IconComp />
      <span className="bc-option__name">{label}</span>
    </label>
  );
};

// ── Main InputPanel ───────────────────────────────────────────
interface InputPanelProps {
  fields: InputFields;
  errors: FieldErrors;
  onFieldChange: (key: keyof InputFields, value: string) => void;
  onBCChange: (side: 'leftBC' | 'rightBC', value: SupportType) => void;
  onCalculate: () => void;
  onReset: () => void;
  isCalculating: boolean;
}

const SUPPORT_TYPES: SupportType[] = ['fixed', 'pin', 'roller', 'free'];

const InputPanel: FC<InputPanelProps> = ({
  fields, errors, onFieldChange, onBCChange, onCalculate, onReset, isCalculating,
}) => {
  return (
    <section className="panel" aria-label="Beam input parameters">
      <div className="panel__head">
        <CalcIcon />
        <span className="panel__title">Beam Parameters</span>
      </div>
      <div className="panel__body">
        {/* ── Geometry ── */}
        <div className="section-group">
          <div className="section-group__label">
            <RulerIcon />
            Geometry
          </div>
          <Field id="length"  label="Length"  unit="m" value={fields.length}  onChange={v => onFieldChange('length', v)}  error={errors.length}  />
          <Field id="breadth" label="Breadth" unit="m" value={fields.breadth} onChange={v => onFieldChange('breadth', v)} error={errors.breadth} />
          <Field id="depth"   label="Depth"   unit="m" value={fields.depth}   onChange={v => onFieldChange('depth', v)}   error={errors.depth}   />
        </div>

        {/* ── Point Load ── */}
        <div className="section-group">
          <div className="section-group__label">
            <LoadIcon />
            Point Load
          </div>
          <Field id="pointMag" label="Magnitude" unit="N"   value={fields.pointMag} onChange={v => onFieldChange('pointMag', v)} error={errors.pointMag} placeholder="0 (optional)" />
          <Field id="pointPos" label="Position"  unit="m"   value={fields.pointPos} onChange={v => onFieldChange('pointPos', v)} error={errors.pointPos} />
        </div>

        {/* ── UDL ── */}
        <div className="section-group">
          <div className="section-group__label">
            <UDLIcon />
            UDL
          </div>
          <Field id="udlInt" label="Intensity" unit="N/m" value={fields.udlIntensity} onChange={v => onFieldChange('udlIntensity', v)} error={errors.udlIntensity} placeholder="0 (optional)" />
          <div className="field">
            <div className="field__label">
              <span className="field__name">Range</span>
              <span className="field__unit">m</span>
            </div>
            <div className="field-row">
              <input
                id="udlStart"
                className={`field__input${errors.udlStart ? ' has-error' : ''}`}
                type="number" step="any"
                value={fields.udlStart}
                onChange={e => onFieldChange('udlStart', e.target.value)}
                placeholder="Start"
                aria-label="UDL start position (m)"
              />
              <span className="field-row__sep">to</span>
              <input
                id="udlEnd"
                className={`field__input${errors.udlEnd ? ' has-error' : ''}`}
                type="number" step="any"
                value={fields.udlEnd}
                onChange={e => onFieldChange('udlEnd', e.target.value)}
                placeholder="End"
                aria-label="UDL end position (m)"
              />
            </div>
            {errors.udlStart && (
              <div className="field__error" role="alert"><ErrorIcon />{errors.udlStart}</div>
            )}
            {errors.udlEnd && (
              <div className="field__error" role="alert"><ErrorIcon />{errors.udlEnd}</div>
            )}
          </div>
        </div>

        {/* ── Material ── */}
        <div className="section-group">
          <div className="section-group__label">
            <MaterialIcon />
            Material
          </div>
          <Field id="Emod" label="Modulus of Elasticity (E)" unit="N/m²" value={fields.E} onChange={v => onFieldChange('E', v)} error={errors.E} placeholder="e.g. 200e9" />
        </div>

        {/* ── Boundary Conditions ── */}
        <div className="section-group">
          <div className="section-group__label">
            <BCIcon />
            Boundary Conditions
          </div>
          <div className="bc-grid">
            <div>
              <div className="bc-col__label">Left</div>
              <div className="bc-options" role="radiogroup" aria-label="Left boundary condition">
                {SUPPORT_TYPES.map(t => (
                  <BCOption
                    key={t}
                    id={`left-${t}`}
                    value={t}
                    selected={fields.leftBC === t}
                    onSelect={() => onBCChange('leftBC', t)}
                    side="left"
                    error={errors.leftBC}
                  />
                ))}
              </div>
              {errors.leftBC && (
                <div className="field__error" id="bc-left-error" role="alert">
                  <ErrorIcon />{errors.leftBC}
                </div>
              )}
            </div>
            <div>
              <div className="bc-col__label">Right</div>
              <div className="bc-options" role="radiogroup" aria-label="Right boundary condition">
                {SUPPORT_TYPES.map(t => (
                  <BCOption
                    key={t}
                    id={`right-${t}`}
                    value={t}
                    selected={fields.rightBC === t}
                    onSelect={() => onBCChange('rightBC', t)}
                    side="right"
                    error={errors.rightBC}
                  />
                ))}
              </div>
              {errors.rightBC && (
                <div className="field__error" id="bc-right-error" role="alert">
                  <ErrorIcon />{errors.rightBC}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="action-row">
          <button
            className="btn btn--primary"
            onClick={onCalculate}
            disabled={isCalculating}
            aria-label="Run beam analysis"
          >
            <CalcIcon />
            {isCalculating ? 'Calculating…' : 'Calculate'}
          </button>
          <button
            className="btn btn--secondary"
            onClick={onReset}
            aria-label="Reset all inputs"
          >
            <ResetIcon />
            Reset
          </button>
        </div>
      </div>
    </section>
  );
};

export default InputPanel;
