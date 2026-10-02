// ============================================================
// Beam Calculator — Input Validation
// ============================================================

import type { InputFields, FieldErrors, BeamInput } from '../types/beam';

function parseNum(s: string): number | null {
  if (s.trim() === '') return null;
  const n = Number(s);
  return isNaN(n) ? null : n;
}

/**
 * Validate all input fields.
 * Returns { errors, input } where input is null if there are blocking errors.
 */
export function validateInputs(fields: InputFields): {
  errors: FieldErrors;
  input: BeamInput | null;
} {
  const errors: FieldErrors = {};

  // Geometry
  const L = parseNum(fields.length);
  const b = parseNum(fields.breadth);
  const d = parseNum(fields.depth);

  if (L === null)     errors.length  = 'Enter a number';
  else if (L <= 0)    errors.length  = 'Must be > 0';

  if (b === null)     errors.breadth = 'Enter a number';
  else if (b <= 0)    errors.breadth = 'Must be > 0';

  if (d === null)     errors.depth   = 'Enter a number';
  else if (d <= 0)    errors.depth   = 'Must be > 0';

  // Material
  const E = parseNum(fields.E);
  if (E === null)  errors.E = 'Enter a number';
  else if (E <= 0) errors.E = 'Must be > 0';

  // Point load (optional — zero means no load)
  const pMag = parseNum(fields.pointMag) ?? 0;
  const pPos = parseNum(fields.pointPos) ?? 0;

  if (fields.pointMag !== '' && fields.pointMag !== '0' && parseNum(fields.pointMag) === null) {
    errors.pointMag = 'Invalid number';
  }
  if (fields.pointPos !== '' && parseNum(fields.pointPos) === null) {
    errors.pointPos = 'Invalid number';
  }
  if (L !== null && L > 0 && pPos < 0) {
    errors.pointPos = 'Must be ≥ 0';
  }
  if (L !== null && L > 0 && pPos > L) {
    errors.pointPos = `Must be ≤ ${L} m`;
  }

  // UDL (optional — zero intensity means no load)
  const udlInt   = parseNum(fields.udlIntensity) ?? 0;
  const udlStart = parseNum(fields.udlStart)     ?? 0;
  const udlEnd   = parseNum(fields.udlEnd)       ?? 0;

  if (fields.udlIntensity !== '' && fields.udlIntensity !== '0' && parseNum(fields.udlIntensity) === null) {
    errors.udlIntensity = 'Invalid number';
  }
  if (fields.udlStart !== '' && parseNum(fields.udlStart) === null) {
    errors.udlStart = 'Invalid number';
  }
  if (fields.udlEnd !== '' && parseNum(fields.udlEnd) === null) {
    errors.udlEnd = 'Invalid number';
  }

  const udlActive = udlInt !== 0;
  if (udlActive) {
    if (L !== null && L > 0) {
      if (udlStart < 0) errors.udlStart = 'Must be ≥ 0';
      if (udlEnd   > L) errors.udlEnd   = `Must be ≤ ${L} m`;
      if (udlEnd <= udlStart) errors.udlEnd = 'Must be > start';
    }
  }

  // Boundary condition validation
  const { leftBC, rightBC } = fields;
  let nConstraints = 0;
  if (leftBC  === 'fixed') nConstraints += 2;
  else if (leftBC  === 'pin' || leftBC  === 'roller') nConstraints += 1;
  if (rightBC === 'fixed') nConstraints += 2;
  else if (rightBC === 'pin' || rightBC === 'roller') nConstraints += 1;

  if (nConstraints < 2) {
    errors.leftBC  = 'Beam is under-constrained';
    errors.rightBC = 'At least 2 constraints needed';
  }

  // If any required field has an error, return null input
  const hasBlockingError = Object.keys(errors).length > 0;
  if (hasBlockingError || L === null || b === null || d === null || E === null) {
    return { errors, input: null };
  }

  const input: BeamInput = {
    length: L,
    breadth: b,
    depth: d,
    E,
    pointLoad: { magnitude: pMag, position: pPos },
    udl: { intensity: udlInt, start: udlStart, end: udlEnd },
    leftBC,
    rightBC,
  };

  return { errors, input };
}

/** Format a number for display with appropriate significant figures */
export function fmt(n: number, digits = 4): string {
  if (!isFinite(n)) return '—';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e6)    return n.toExponential(3);
  if (abs >= 1000)   return n.toFixed(1);
  if (abs >= 1)      return n.toFixed(digits > 4 ? 4 : digits);
  if (abs >= 0.001)  return n.toFixed(6);
  return n.toExponential(3);
}

/** Format with unit */
export function fmtUnit(n: number, unit: string, digits = 4): string {
  return `${fmt(n, digits)} ${unit}`;
}
