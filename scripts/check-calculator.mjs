// Regression checks for the unchanged solver. Run: node scripts/check-calculator.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

async function sourceModule(path) {
  const code = await readFile(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.ES2020 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const { solveBeam } = await sourceModule('../src/engine/beamSolver.ts');
const { validateInputs } = await sourceModule('../src/engine/validation.ts');
const base = { length: 6, breadth: .2, depth: .4, E: 200e9,
  pointLoad: { magnitude: 10000, position: 3 }, udl: { intensity: 0, start: 0, end: 6 },
  leftBC: 'pin', rightBC: 'roller' };
function near(actual, expected, name) {
  assert.ok(Math.abs(actual - expected) <= Math.max(Math.abs(expected) * 1e-5, 1e-7), `${name}: ${actual} != ${expected}`);
}
const EI = base.E * base.breadth * base.depth ** 3 / 12;
const central = solveBeam(base);
assert.ok(central.valid); assert.ok(central.equilibrium.passed);
near(central.reactions.leftV, 5000, 'Central load left reaction');
near(central.maxMoment.value, 15000, 'Central load moment');
near(Math.abs(central.maxDeflection.value), 10000 * 6 ** 3 / (48 * EI), 'Central load deflection');
const cantilever = solveBeam({ ...base, leftBC: 'fixed', rightBC: 'free', pointLoad: { magnitude: 10000, position: 6 } });
assert.ok(cantilever.valid);
near(cantilever.reactions.leftV, 10000, 'Cantilever reaction');
near(Math.abs(cantilever.maxDeflection.value), 10000 * 6 ** 3 / (3 * EI), 'Cantilever deflection');
const fixed = solveBeam({ ...base, leftBC: 'fixed', rightBC: 'fixed', pointLoad: { magnitude: 0, position: 0 }, udl: { intensity: 2000, start: 0, end: 6 } });
assert.ok(fixed.valid);
near(fixed.reactions.leftV, 6000, 'Fixed UDL reaction');
near(Math.abs(fixed.maxDeflection.value), 2000 * 6 ** 4 / (384 * EI), 'Fixed UDL deflection');
const benchmark = solveBeam({ ...base, udl: { intensity: 2000, start: 1, end: 5 } });
assert.ok(benchmark.valid); assert.ok(benchmark.equilibrium.passed);
near(benchmark.reactions.leftV, 9000, 'Benchmark left reaction');
near(benchmark.reactions.rightV, 9000, 'Benchmark right reaction');
near(benchmark.maxMoment.value, 23000, 'Benchmark moment');
const fields = { length: '6', breadth: '.2', depth: '.4', E: '200e9', pointMag: '10000', pointPos: '3', udlIntensity: '2000', udlStart: '1', udlEnd: '5', leftBC: 'pin', rightBC: 'roller' };
assert.ok(validateInputs(fields).input);
assert.equal(validateInputs({ ...fields, length: '' }).input, null);
assert.equal(validateInputs({ ...fields, pointPos: '7' }).input, null);
assert.equal(validateInputs({ ...fields, leftBC: 'free', rightBC: 'free' }).input, null);
console.log('PASS: central load, cantilever, fixed-fixed UDL, combined benchmark, and validation regressions.');
