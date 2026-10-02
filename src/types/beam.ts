// ============================================================
// Beam Calci — Type Definitions
// ============================================================

/** Support conditions at each end of the beam */
export type SupportType = 'fixed' | 'pin' | 'roller' | 'free';

/** Point load definition */
export interface PointLoad {
  magnitude: number;  // N, positive = downward
  position: number;   // m from left end
}

/** Uniformly Distributed Load */
export interface UDL {
  intensity: number;  // N/m, positive = downward
  start: number;      // m from left end
  end: number;        // m from left end
}

/** Complete beam input parameters */
export interface BeamInput {
  length: number;     // L in metres
  breadth: number;    // b in metres (cross-section width)
  depth: number;      // d in metres (cross-section height)
  E: number;          // Modulus of elasticity in N/m²
  pointLoad: PointLoad;
  udl: UDL;
  leftBC: SupportType;
  rightBC: SupportType;
}

/** Default/empty beam input */
export const DEFAULT_INPUT: BeamInput = {
  length: 0,
  breadth: 0,
  depth: 0,
  E: 0,
  pointLoad: { magnitude: 0, position: 0 },
  udl: { intensity: 0, start: 0, end: 0 },
  leftBC: 'pin',
  rightBC: 'roller',
};

/** Reaction forces at supports */
export interface Reactions {
  leftV: number;
  leftM: number;
  rightV: number;
  rightM: number;
}

/** Peak value with its location */
export interface Peak {
  value: number;
  position: number;
}

/** Equilibrium verification */
export interface EquilibriumCheck {
  sumFyError: number;
  sumMomentError: number;
  passed: boolean;
}

/** Complete beam analysis results */
export interface BeamResults {
  valid: true;
  I: number;
  EI: number;
  reactions: Reactions;
  x: number[];
  deflection: number[];
  shear: number[];
  moment: number[];
  maxDeflection: Peak;
  maxShear: Peak;
  maxMoment: Peak;
  equilibrium: EquilibriumCheck;
  totalLoad: number;
}

/** Failure result */
export interface BeamError {
  valid: false;
  error: string;
}

export type BeamAnalysis = BeamResults | BeamError;

/** Raw string form of each input field (for controlled inputs) */
export interface InputFields {
  length: string;
  breadth: string;
  depth: string;
  E: string;
  pointMag: string;
  pointPos: string;
  udlIntensity: string;
  udlStart: string;
  udlEnd: string;
  leftBC: SupportType;
  rightBC: SupportType;
}

export const DEFAULT_FIELDS: InputFields = {
  length: '',
  breadth: '',
  depth: '',
  E: '',
  pointMag: '',
  pointPos: '',
  udlIntensity: '',
  udlStart: '',
  udlEnd: '',
  leftBC: 'pin',
  rightBC: 'roller',
};

export type FieldErrors = Partial<Record<keyof InputFields, string>>;
