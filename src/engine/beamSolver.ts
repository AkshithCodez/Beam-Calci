// ============================================================
// Beam Calculator — Finite Element Analysis Solver
//
// Method : Euler-Bernoulli beam finite elements (Hermitian shape functions)
// Elements: 100 elements of equal length (configurable via N_ELEM)
// DOFs    : 2 per node [transverse deflection v, rotation θ]
//           Positive v = upward, positive θ = counterclockwise
//
// Sign Conventions (consistently applied throughout):
//   Forces : upward = positive
//   Moments: CCW    = positive (reaction moments stored this way)
//   Shear  : V(x) = sum of upward forces to the LEFT of section
//   Moment : M(x) = positive when sagging (tension at bottom)
//             M(x) = leftV·x − leftM_reaction − load contributions
//   Deflect: displayed as downward positive for intuitive diagrams
// ============================================================

import type { BeamInput, BeamAnalysis, BeamResults } from '../types/beam';

const N_ELEM = 100;  // Number of finite elements (accuracy vs. speed)
const N_PLOT = 200;  // Base evaluation points for output arrays

// ─── Gaussian Elimination with Partial Pivoting ───────────────────────────
function gaussElim(A: number[][], b: number[]): number[] {
  const n = b.length;
  const a: number[][] = A.map(row => [...row]);
  const rhs = [...b];

  for (let col = 0; col < n; col++) {
    // Partial pivot
    let pivRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivRow][col])) pivRow = row;
    }
    [a[col], a[pivRow]] = [a[pivRow], a[col]];
    [rhs[col], rhs[pivRow]] = [rhs[pivRow], rhs[col]];

    const piv = a[col][col];
    if (Math.abs(piv) < 1e-12) {
      throw new Error(
        'Stiffness matrix is singular — check boundary conditions (beam may be a mechanism).'
      );
    }

    for (let row = col + 1; row < n; row++) {
      const fac = a[row][col] / piv;
      for (let j = col; j < n; j++) a[row][j] -= fac * a[col][j];
      rhs[row] -= fac * rhs[col];
    }
  }

  // Back-substitution
  const x = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = rhs[i];
    for (let j = i + 1; j < n; j++) x[i] -= a[i][j] * x[j];
    x[i] /= a[i][i];
  }
  return x;
}

// ─── Hermitian Shape Functions at ξ ∈ [0, 1] ─────────────────────────────
// N1 = 1 - 3ξ² + 2ξ³      (deflection at node 1)
// N2 = h·ξ·(1-ξ)²          (rotation at node 1)
// N3 = 3ξ² - 2ξ³            (deflection at node 2)
// N4 = h·ξ²·(ξ-1)           (rotation at node 2)
function hermitian(xi: number, h: number): [number, number, number, number] {
  const xi2 = xi * xi;
  const xi3 = xi2 * xi;
  return [
    1 - 3 * xi2 + 2 * xi3,
    h * xi * (1 - xi) * (1 - xi),
    3 * xi2 - 2 * xi3,
    h * xi2 * (xi - 1),
  ];
}

// ─── Bending Moment contribution from UDL to the left of x ──────────────
// UDL w N/m from x1 to x2 (downward positive).
// Moment contribution (reduces sagging): w·len·(x − centroid)
function udlMomentContrib(x: number, x1: number, x2: number, w: number): number {
  if (x <= x1) return 0;
  const ovlEnd = Math.min(x, x2);
  const len = ovlEnd - x1;
  const centroid = x1 + len / 2;
  return w * len * (x - centroid);
}

// ─── UDL shear contribution (downward, reduces V) ─────────────────────
function udlShearContrib(x: number, x1: number, x2: number, w: number): number {
  if (x <= x1) return 0;
  const ovlEnd = Math.min(x, x2);
  return w * (ovlEnd - x1);
}

// ─── Error helper ─────────────────────────────────────────────────────────
function err(msg: string): BeamAnalysis {
  return { valid: false, error: msg };
}

// ─── Main solver ──────────────────────────────────────────────────────────
export function solveBeam(input: BeamInput): BeamAnalysis {
  const { length: L, breadth: b, depth: d, E, pointLoad, udl, leftBC, rightBC } = input;

  // ── Section properties ──────────────────────────────────────────────────
  const I = (b * d * d * d) / 12;   // m⁴ — rectangular cross-section
  const EI = E * I;                  // N·m²

  const N = N_ELEM;
  const h = L / N;
  const nNodes = N + 1;
  const nDof = 2 * nNodes;           // [v₀,θ₀, v₁,θ₁, …, vₙ,θₙ]

  // ── Assemble global stiffness K ─────────────────────────────────────────
  // Using dense storage; bandwidth is 4 per element (205×205 max).
  const K: number[][] = Array.from({ length: nDof }, () => new Array<number>(nDof).fill(0));
  const F: number[] = new Array<number>(nDof).fill(0);

  const ki = EI / (h * h * h);  // Pre-computed stiffness coefficient

  for (let e = 0; e < N; e++) {
    // Element stiffness matrix (4×4)
    const ke: number[][] = [
      [ 12 * ki,       6 * ki * h,   -12 * ki,       6 * ki * h  ],
      [  6 * ki * h,   4 * ki * h*h,  -6 * ki * h,   2 * ki * h*h],
      [-12 * ki,      -6 * ki * h,    12 * ki,       -6 * ki * h  ],
      [  6 * ki * h,   2 * ki * h*h,  -6 * ki * h,   4 * ki * h*h],
    ];
    const g = [2 * e, 2 * e + 1, 2 * (e + 1), 2 * (e + 1) + 1];
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++)
        K[g[i]][g[j]] += ke[i][j];
  }

  // ── Apply point load (consistent nodal load vector) ─────────────────────
  // Downward force P → negative upward nodal forces on the beam.
  const P = pointLoad.magnitude;
  const pPos = pointLoad.position;
  if (P !== 0 && pPos >= 0 && pPos <= L) {
    const eIdx = Math.min(Math.floor(pPos / h), N - 1);
    const xi = (pPos - eIdx * h) / h;
    const [N1, N2, N3, N4] = hermitian(xi, h);
    const g = [2 * eIdx, 2 * eIdx + 1, 2 * (eIdx + 1), 2 * (eIdx + 1) + 1];
    F[g[0]] -= P * N1;
    F[g[1]] -= P * N2;
    F[g[2]] -= P * N3;
    F[g[3]] -= P * N4;
  }

  // ── Apply UDL (5-point Gauss quadrature per element segment) ────────────
  const w = udl.intensity;
  const x1 = udl.start, x2 = udl.end;
  if (w !== 0 && x2 > x1) {
    // 5-point Gauss–Legendre on [0,1]
    const gpXi = [0.046910077, 0.230765345, 0.5, 0.769234655, 0.953089923];
    const gpW  = [0.118463443, 0.239314335, 0.284444444, 0.239314335, 0.118463443];

    for (let e = 0; e < N; e++) {
      const xL = e * h, xR = (e + 1) * h;
      const segStart = Math.max(xL, x1);
      const segEnd   = Math.min(xR, x2);
      if (segStart >= segEnd) continue;

      const segLen = segEnd - segStart;
      const g = [2 * e, 2 * e + 1, 2 * (e + 1), 2 * (e + 1) + 1];

      for (let gp = 0; gp < 5; gp++) {
        const xAbs = segStart + gpXi[gp] * segLen;
        const xiElem = (xAbs - xL) / h;
        const [N1, N2, N3, N4] = hermitian(xiElem, h);
        const wt = gpW[gp] * segLen;
        F[g[0]] -= w * N1 * wt;
        F[g[1]] -= w * N2 * wt;
        F[g[2]] -= w * N3 * wt;
        F[g[3]] -= w * N4 * wt;
      }
    }
  }

  // ── Identify constrained DOFs ────────────────────────────────────────────
  const constrained = new Set<number>();
  switch (leftBC) {
    case 'fixed':  constrained.add(0); constrained.add(1); break;
    case 'pin':
    case 'roller': constrained.add(0); break;
    case 'free':   break;
  }
  switch (rightBC) {
    case 'fixed':  constrained.add(2 * N); constrained.add(2 * N + 1); break;
    case 'pin':
    case 'roller': constrained.add(2 * N); break;
    case 'free':   break;
  }

  const nConstr = constrained.size;
  if (nConstr < 2) {
    return err(
      'Insufficient boundary conditions. The beam is a mechanism — at least two translational constraints are required.'
    );
  }

  // ── Reduced system (free DOFs only) ─────────────────────────────────────
  const freeDofs = Array.from({ length: nDof }, (_, i) => i).filter(i => !constrained.has(i));
  const nFree = freeDofs.length;

  if (nFree === 0) return err('All DOFs are constrained. Check boundary conditions.');

  const Kff = freeDofs.map(i => freeDofs.map(j => K[i][j]));
  const Ff  = freeDofs.map(i => F[i]);

  let d_free: number[];
  try {
    d_free = gaussElim(Kff, Ff);
  } catch (e: unknown) {
    return err(`Solver failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  // ── Assemble full displacement vector ────────────────────────────────────
  const disp = new Array<number>(nDof).fill(0);
  freeDofs.forEach((gi, li) => { disp[gi] = d_free[li]; });

  // ── Compute reactions: R = K·d − F ──────────────────────────────────────
  // The original K (before BC modification) times d minus applied forces gives
  // the residual, which equals the support reactions at constrained DOFs.
  const reactions = K.map((row, i) => {
    const Kd = row.reduce((acc, kij, j) => acc + kij * disp[j], 0);
    return Kd - F[i];
  });

  const leftV  = constrained.has(0)       ? reactions[0]       : 0;
  const leftM  = constrained.has(1)       ? reactions[1]       : 0;
  const rightV = constrained.has(2 * N)   ? reactions[2 * N]   : 0;
  const rightM = constrained.has(2*N + 1) ? reactions[2*N + 1] : 0;

  // ── Build evaluation x-array (uniform + key positions) ──────────────────
  // Including positions just before/after point load captures the V-jump.
  const xSet = new Set<number>();
  const eps = L * 1e-5;
  for (let i = 0; i <= N_PLOT; i++) xSet.add((i / N_PLOT) * L);
  if (P !== 0 && pPos >= 0 && pPos <= L) {
    xSet.add(pPos);
    if (pPos > eps)    xSet.add(pPos - eps);
    if (pPos < L - eps) xSet.add(pPos + eps);
  }
  if (w !== 0 && x2 > x1) {
    xSet.add(x1); xSet.add(x2);
  }
  const xArr = Array.from(xSet).sort((a, bb) => a - bb).filter(x => x >= 0 && x <= L);

  // ── Deflection — Hermitian interpolation of FEA node displacements ───────
  const deflArr = xArr.map(x => {
    const eIdx = Math.min(Math.floor(x / h), N - 1);
    const xi = (x - eIdx * h) / h;
    const [N1, N2, N3, N4] = hermitian(xi, h);
    const v1 = disp[2 * eIdx];
    const t1 = disp[2 * eIdx + 1];
    const v2 = disp[2 * (eIdx + 1)];
    const t2 = disp[2 * (eIdx + 1) + 1];
    const vUpward = N1 * v1 + N2 * t1 + N3 * v2 + N4 * t2;
    return -vUpward;  // Display convention: downward positive
  });

  // ── Shear force — global equilibrium ─────────────────────────────────────
  // V(x) = leftV − (UDL load to left of x) − P·H(x − pPos)
  const shearArr = xArr.map(x => {
    let V = leftV;
    if (w !== 0 && x2 > x1) V -= udlShearContrib(x, x1, x2, w);
    if (P !== 0 && pPos < x) V -= P;
    return V;
  });

  // ── Bending moment — global equilibrium ──────────────────────────────────
  // M(x) = leftV·x − leftM − [UDL moment] − P·(x−pPos)·H(x−pPos)
  // leftM is the CCW reaction moment from the wall (from FEA).
  const momentArr = xArr.map(x => {
    let M = leftV * x - leftM;
    if (w !== 0 && x2 > x1) M -= udlMomentContrib(x, x1, x2, w);
    if (P !== 0 && pPos < x) M -= P * (x - pPos);
    return M;
  });

  // ── Peak values ──────────────────────────────────────────────────────────
  let maxDeflVal = 0, maxDeflPos = 0;
  let maxShearAbs = 0, maxShearPos = 0;
  let maxMomAbs = 0,  maxMomPos  = 0;

  for (let i = 0; i < xArr.length; i++) {
    if (deflArr[i] > maxDeflVal) { maxDeflVal = deflArr[i]; maxDeflPos = xArr[i]; }
    if (Math.abs(shearArr[i]) > maxShearAbs) { maxShearAbs = Math.abs(shearArr[i]); maxShearPos = xArr[i]; }
    if (Math.abs(momentArr[i]) > maxMomAbs)  { maxMomAbs  = Math.abs(momentArr[i]); maxMomPos   = xArr[i]; }
  }

  // ── Equilibrium checks ───────────────────────────────────────────────────
  const totalLoad =
    P +
    (w !== 0 && x2 > x1 ? w * (x2 - x1) : 0);

  const loadMomentAboutLeft =
    (P !== 0 ? P * pPos : 0) +
    (w !== 0 && x2 > x1 ? w * (x2 - x1) * (x1 + x2) / 2 : 0);

  const sumFyError = Math.abs(leftV + rightV - totalLoad);
  // ΣM about left = leftM + rightV·L + rightM − loadMoment = 0
  const sumMomentError = Math.abs(leftM + rightV * L + rightM - loadMomentAboutLeft);
  const refForce = Math.max(Math.abs(leftV), Math.abs(rightV), Math.abs(totalLoad), 1);
  const equilibriumPassed = sumFyError / refForce < 5e-4;

  const result: BeamResults = {
    valid: true,
    I,
    EI,
    reactions: { leftV, leftM, rightV, rightM },
    x: xArr,
    deflection: deflArr,
    shear: shearArr,
    moment: momentArr,
    maxDeflection: { value: maxDeflVal, position: maxDeflPos },
    maxShear:      { value: maxShearAbs, position: maxShearPos },
    maxMoment:     { value: maxMomAbs,  position: maxMomPos  },
    equilibrium: {
      sumFyError,
      sumMomentError,
      passed: equilibriumPassed,
    },
    totalLoad,
  };

  return result;
}
