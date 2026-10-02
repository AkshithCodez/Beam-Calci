import * as THREE from 'three';

/**
 * Generates a high-resolution procedural planetary/celestial surface texture.
 * Combines lunar crater formations, maria basalt patches, subtle continental elevation,
 * and delicate engineering meridian/latitude rings to fit the "Beam Calci" theme.
 */
export function createCelestialTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const w = canvas.width;
  const h = canvas.height;

  // 1. Base gradient - cool charcoal / slate basalt
  const baseGrad = ctx.createLinearGradient(0, 0, 0, h);
  baseGrad.addColorStop(0, '#242b38');
  baseGrad.addColorStop(0.5, '#313a4d');
  baseGrad.addColorStop(1, '#1e2430');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Procedural terrain patches (perlin-like noise simulation using overlaid radial clouds)
  const rng = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  let seed = 42;
  // Major maria / basalt lowlands
  for (let i = 0; i < 40; i++) {
    const cx = rng(seed++) * w;
    const cy = rng(seed++) * h;
    const rad = 80 + rng(seed++) * 220;
    const grad = ctx.createRadialGradient(cx, cy, rad * 0.1, cx, cy, rad);
    const alpha = 0.15 + rng(seed++) * 0.25;
    grad.addColorStop(0, `rgba(18, 22, 32, ${alpha})`);
    grad.addColorStop(0.6, `rgba(28, 35, 48, ${alpha * 0.6})`);
    grad.addColorStop(1, 'rgba(36, 43, 56, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Highland lighter crust areas
  for (let i = 0; i < 50; i++) {
    const cx = rng(seed++) * w;
    const cy = rng(seed++) * h;
    const rad = 40 + rng(seed++) * 140;
    const grad = ctx.createRadialGradient(cx, cy, rad * 0.1, cx, cy, rad);
    const alpha = 0.08 + rng(seed++) * 0.14;
    grad.addColorStop(0, `rgba(140, 160, 190, ${alpha})`);
    grad.addColorStop(0.7, `rgba(90, 110, 135, ${alpha * 0.4})`);
    grad.addColorStop(1, 'rgba(50, 65, 85, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Impact Craters with bright rims and shadowed cavities
  // Craters ensure that when the sphere rotates, the features clearly move across the horizon!
  for (let i = 0; i < 90; i++) {
    const cx = rng(seed++) * w;
    const cy = rng(seed++) * h;
    const rad = 8 + rng(seed++) * 65;

    // Outer crater rim highlight (warm amber / bone white)
    ctx.strokeStyle = `rgba(240, 245, 255, ${0.4 + rng(seed++) * 0.45})`;
    ctx.lineWidth = Math.max(2, rad * 0.14);
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.stroke();

    // Inner crater shadow
    const innerGrad = ctx.createRadialGradient(cx - rad * 0.25, cy - rad * 0.25, rad * 0.08, cx, cy, rad);
    innerGrad.addColorStop(0, 'rgba(8, 12, 18, 0.85)');
    innerGrad.addColorStop(0.7, 'rgba(18, 24, 34, 0.55)');
    innerGrad.addColorStop(1, 'rgba(40, 50, 65, 0)');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, rad * 0.88, 0, Math.PI * 2);
    ctx.fill();

    // Secondary concentric ripple ring for large impact basins
    if (rad > 32) {
      ctx.strokeStyle = 'rgba(223, 168, 91, 0.35)'; // Warm golden tectonic ring
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(cx, cy, rad * 1.35, 0, Math.PI * 2);
      ctx.stroke();

      // Central crater peak
      ctx.fillStyle = 'rgba(245, 250, 255, 0.65)';
      ctx.beginPath();
      ctx.arc(cx, cy, rad * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 5. Engineering / Structural coordinate meridian & latitude lines
  // Gives an ultra-sleek, technical architectural feel fitting "Beam Calci"
  ctx.strokeStyle = 'rgba(224, 168, 98, 0.22)'; // Warm golden accent matching reference
  ctx.lineWidth = 1.2;

  // Equator
  ctx.beginPath();
  ctx.moveTo(0, h * 0.5);
  ctx.lineTo(w, h * 0.5);
  ctx.stroke();

  // Parallels of latitude
  const latitudes = [0.2, 0.35, 0.65, 0.8];
  ctx.strokeStyle = 'rgba(180, 200, 230, 0.12)';
  ctx.setLineDash([8, 12]);
  for (const lat of latitudes) {
    ctx.beginPath();
    ctx.moveTo(0, h * lat);
    ctx.lineTo(w, h * lat);
    ctx.stroke();
  }

  // Meridians of longitude
  const meridians = 12;
  for (let m = 0; m < meridians; m++) {
    const mx = (w / meridians) * m;
    ctx.beginPath();
    ctx.moveTo(mx, 0);
    ctx.lineTo(mx, h);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // 6. Subtle micro-grain noise across surface
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  for (let p = 0; p < data.length; p += 4) {
    const noise = (Math.random() - 0.5) * 16;
    data[p] = Math.min(255, Math.max(0, data[p] + noise));
    data[p + 1] = Math.min(255, Math.max(0, data[p + 1] + noise));
    data[p + 2] = Math.min(255, Math.max(0, data[p + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

/**
 * Generates a height/bump map corresponding to the crater and surface topography
 * so directional light produces realistic rim highlights and relief depth during rotation.
 */
export function createCelestialBumpMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const w = canvas.width;
  const h = canvas.height;

  // Mid-grey neutral height
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, w, h);

  const rng = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  let seed = 42;
  // Maria (depressions)
  for (let i = 0; i < 40; i++) {
    const cx = rng(seed++) * w;
    const cy = rng(seed++) * h;
    const rad = 40 + rng(seed++) * 110;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    grad.addColorStop(0, 'rgba(90, 90, 90, 0.4)');
    grad.addColorStop(1, 'rgba(128, 128, 128, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Craters (depressed center, elevated rim)
  for (let i = 0; i < 70; i++) {
    const cx = rng(seed++) * w;
    const cy = rng(seed++) * h;
    const rad = 5 + rng(seed++) * 28;

    // Rim ridge (elevated = white)
    ctx.strokeStyle = 'rgba(240, 240, 240, 0.7)';
    ctx.lineWidth = Math.max(1, rad * 0.15);
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.stroke();

    // Cavity (depressed = dark)
    const cavity = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad * 0.85);
    cavity.addColorStop(0, 'rgba(40, 40, 40, 0.7)');
    cavity.addColorStop(1, 'rgba(128, 128, 128, 0)');
    ctx.fillStyle = cavity;
    ctx.beginPath();
    ctx.arc(cx, cy, rad * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates soft volumetric cloud puff texture for atmospheric fog around the base
 */
export function createAtmosphericCloudTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
  grad.addColorStop(0, 'rgba(235, 185, 130, 0.35)'); // Warm sunset glow
  grad.addColorStop(0.4, 'rgba(160, 150, 170, 0.18)');
  grad.addColorStop(0.8, 'rgba(90, 100, 120, 0.05)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
