import * as THREE from 'three';

function hash(x: number, y: number, seed: number) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
}
function noise(x: number, y: number, seed: number) {
  const ix = Math.floor(x), iy = Math.floor(y);
  let fx = x - ix, fy = y - iy;
  fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy, seed), b = hash(ix + 1, iy, seed);
  const c = hash(ix, iy + 1, seed), d = hash(ix + 1, iy + 1, seed);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, fx), THREE.MathUtils.lerp(c, d, fx), fy);
}
function fbm(x: number, y: number, seed: number) {
  let value = 0, weight = .5;
  for (let i = 0; i < 6; i++) { value += noise(x, y, seed) * weight; x *= 2.03; y *= 2.03; weight *= .5; }
  return value;
}
function texture(width: number, height: number, sample: (x: number, y: number) => number[]) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const data = ctx.createImageData(width, height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    data.data.set(sample(x / width, y / height), (y * width + x) * 4);
  }
  ctx.putImageData(data, 0, 0);
  const result = new THREE.CanvasTexture(canvas);
  result.colorSpace = THREE.SRGBColorSpace;
  return result;
}
export function createMineralTexture() {
  return texture(768, 384, (x, y) => {
    const n = fbm(x * 10, y * 5, 16), detail = fbm(x * 54, y * 27, 11);
    const v = 88 + n * 135 + detail * 35;
    return [v, v * .97, v * .93, 255];
  });
}

/** Irregular cumulus silhouettes with directional volume shading, not radial fog sprites. */
export function createCloudTexture(seed: number, dark: boolean) {
  const puffs = Array.from({ length: 32 }, (_, i) => {
    const x = .08 + hash(i, 1, seed) * .84;
    const center = Math.sin(x * Math.PI);
    return { x, y: .63 - hash(i, 2, seed) * .22 * center,
      rx: .035 + hash(i, 3, seed) * .12 * center,
      ry: .07 + hash(i, 4, seed) * .25 * center };
  });
  const shade = new THREE.Color(dark ? '#424b60' : '#6a737b');
  const sun = new THREE.Color(dark ? '#bc9a78' : '#ffe0c7');
  const color = new THREE.Color();
  return texture(512, 256, (x, y) => {
    const grain = fbm(x * 47, y * 25, seed) - .5;
    let density = -1, nx = 0, ny = 0;
    for (const puff of puffs) {
      const dx = (x - puff.x) / puff.rx, dy = (y - puff.y) / puff.ry;
      const d = 1 - dx * dx - dy * dy + grain * .34;
      if (d > density) { density = d; nx = dx; ny = dy; }
    }
    if (density < 0) return [0, 0, 0, 0];
    const nz = Math.sqrt(Math.max(0, density));
    const lighting = THREE.MathUtils.clamp(.35 + nx * .35 - ny * .5 + nz * .1 + grain * .3, 0, 1);
    color.copy(shade).lerp(sun, lighting).convertLinearToSRGB();
    return [color.r * 255, color.g * 255, color.b * 255, THREE.MathUtils.smoothstep(density, 0, .2) * 245];
  });
}
