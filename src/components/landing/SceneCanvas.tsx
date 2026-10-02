import { useEffect, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { createCloudTexture, createMineralTexture } from './textureGenerator';
import { createSky, createWater } from './sceneMaterials';

interface SceneCanvasProps { containerRef: RefObject<HTMLElement>; theme: 'light' | 'dark'; motionEnabled: boolean }

// Composition uses world coordinates, with a stable camera: pointer input only rotates the sphere.
export default function SceneCanvas({ containerRef, theme, motionEnabled }: SceneCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const motionAllowed = useRef(motionEnabled);
  const motionChanged = useRef<() => void>();
  useEffect(() => { motionAllowed.current = motionEnabled; motionChanged.current?.(); }, [motionEnabled]);
  useEffect(() => {
    const mount = mountRef.current, hero = containerRef.current;
    if (!mount || !hero) return;
    // A documented static preview also lets low-power devices opt out of WebGL.
    if (new URLSearchParams(location.search).get('scene') === 'static') { setFailed(true); return; }
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' }); }
    catch { setFailed(true); return; }
    setFailed(false);
    const dark = theme === 'dark';
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 400);
    renderer.setPixelRatio(Math.min(devicePixelRatio, mount.clientWidth < 700 ? 1.25 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = dark ? .9 : 1.08;
    mount.appendChild(renderer.domElement);
    const sky = new THREE.Mesh(new THREE.SphereGeometry(180, 32, 16), createSky(dark));
    scene.add(sky);
    scene.add(new THREE.HemisphereLight(dark ? '#7c91ba' : '#c6d7df', '#403a39', dark ? 1.3 : 2));
    const sun = new THREE.DirectionalLight(dark ? '#ffc178' : '#ffceaa', dark ? 3 : 3.5);
    sun.position.set(12, 5, -6); scene.add(sun);
    const fill = new THREE.DirectionalLight('#b2c2d4', dark ? .5 : 1);
    fill.position.set(-12, 9, 10); scene.add(fill);
    const portalLight = new THREE.PointLight(dark ? '#ffb65c' : '#ffdab8', dark ? 65 : 110, 18, 2);
    portalLight.position.set(6.7, 3.3, -1.8); scene.add(portalLight);
    const mineral = createMineralTexture();
    mineral.wrapS = mineral.wrapT = THREE.RepeatWrapping;
    const stone = new THREE.MeshStandardMaterial({
      color: dark ? '#30394b' : '#69727b', roughness: .89,
    });

    // A single continuous silhouette, open at its feet. Avoid a hole crossing an outer contour.
    const profile = new THREE.Shape();
    profile.moveTo(-2.25, 0); profile.lineTo(-2.25, 10.8); profile.lineTo(2.25, 10.8);
    profile.lineTo(2.25, 0); profile.lineTo(1.45, 0); profile.lineTo(1.45, 7.45);
    profile.absarc(0, 7.45, 1.45, 0, Math.PI, false);
    profile.lineTo(-1.45, 0); profile.closePath();
    const arch = new THREE.Mesh(new THREE.ExtrudeGeometry(profile, {
      depth: 1.25, bevelEnabled: true, bevelSize: .025, bevelThickness: .025, bevelSegments: 2, curveSegments: 48,
    }), stone);
    arch.position.set(6.2, 0, -3.8); arch.rotation.y = -.66;
    scene.add(arch);

    const sphere = new THREE.Mesh(new THREE.SphereGeometry(2.25, 64, 40),
      new THREE.MeshPhysicalMaterial({
        map: mineral, bumpMap: mineral, bumpScale: .055,
        color: dark ? '#a2adbd' : '#d7ccc4', roughness: .68, metalness: 0,
        transparent: true, opacity: .83, depthWrite: false,
        transmission: .16, thickness: .65, ior: 1.13,
      }));
    sphere.position.set(3.75, 6.8, -2); sphere.rotation.y = .35; scene.add(sphere);
    // Ellipse rises to the right, as in the reference; it stays still during interaction.
    const ring = new THREE.Mesh(new THREE.TorusGeometry(4.85, .011, 6, 180),
      new THREE.MeshStandardMaterial({ color: dark ? '#a99069' : '#424b50', roughness: .65, metalness: .3 }));
    ring.position.set(5.05, 6.5, -2.4); ring.rotation.order = 'ZXY'; ring.rotation.set(1.34, 0, .46); scene.add(ring);
    const orbMat = new THREE.MeshStandardMaterial({ color: dark ? '#4a5364' : '#78828a', map: mineral, roughness: .8 });
    const orb = new THREE.Mesh(new THREE.SphereGeometry(.36, 24, 16), orbMat);
    orb.position.set(-3.7, 3.1, -1); scene.add(orb);
    const farOrb = new THREE.Mesh(new THREE.SphereGeometry(.17, 20, 12), orbMat);
    farOrb.position.set(10.2, 3, -5); scene.add(farOrb);

    // The pier crosses from lower-left foreground through the portal.
    const pierMat = new THREE.MeshStandardMaterial({ color: dark ? '#343e50' : '#7b8387', roughness: .86 });
    const start = new THREE.Vector3(-8, .12, 15), end = new THREE.Vector3(6.1, .12, -5.5);
    const pier = new THREE.Mesh(new THREE.BoxGeometry(.82, .22, start.distanceTo(end)), pierMat);
    pier.position.copy(start).add(end).multiplyScalar(.5);
    pier.rotation.y = Math.atan2(end.x - start.x, end.z - start.z); scene.add(pier);
    // A distant secondary edge establishes the water level without a floating platform.
    const edge = new THREE.Mesh(new THREE.BoxGeometry(8.2, .1, .35), pierMat);
    edge.position.set(-.4, .09, -1.6); scene.add(edge);
    const figure = new THREE.Group();
    const figureMat = new THREE.MeshStandardMaterial({ color: '#171e27', roughness: 1 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.095, .13, .58, 9), figureMat);
    body.position.y = .64; figure.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.085, 12, 10), figureMat);
    head.position.y = 1.015; figure.add(head);
    for (const x of [-.062, .062]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(.034, .028, .4, 7), figureMat);
      leg.position.set(x, .2, 0); figure.add(leg);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(.031, .027, .5, 7), figureMat);
      arm.position.set(x * 2.25, .61, 0); arm.rotation.z = x * 1.1; figure.add(arm);
    }
    const figureT = .65;
    figure.position.copy(start).lerp(end, figureT); figure.position.y = .25; scene.add(figure);

    // One connected heightfield produces a ridged island silhouette instead of faceted scattered rocks.
    const rockGeo = new THREE.PlaneGeometry(12, 7, 80, 48);
    rockGeo.rotateX(-Math.PI / 2);
    const positions = rockGeo.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), z = positions.getZ(i);
      const peak = 2.7 * Math.exp(-((x + 1.5) ** 2 * .7 + z ** 2 * .42));
      const foothills = .8 * Math.exp(-((x - 1.2) ** 2 * .18 + (z + .5) ** 2 * .55));
      const ridge = .76 + .16 * Math.sin(x * 8 + z * 3) + .08 * Math.cos(z * 13 - x * 7);
      positions.setY(i, (peak + foothills) * ridge - .035);
    }
    rockGeo.computeVertexNormals();
    const island = new THREE.Mesh(rockGeo, new THREE.MeshStandardMaterial({
      color: dark ? '#657082' : '#a5a2a0', map: mineral, bumpMap: mineral, bumpScale: .12, roughness: 1,
    }));
    island.position.set(12.2, 0, -8); scene.add(island);

    const clouds = new THREE.Group();
    const cloudTextures = [3, 19, 41].map(seed => createCloudTexture(seed, dark));
    // Photographic alpha texture replaces the procedural fallback once decoded.
    // Separate world-space planes provide occlusion, depth and water reflections.
    const cloudPhoto = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}cloud-bank.webp`, () => {
      if (disposed) { cloudPhoto.dispose(); return; }
      clouds.children.forEach(child => {
        const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        material.map = cloudPhoto; material.color.set(dark ? '#a2aec6' : '#ffffff'); material.needsUpdate = true;
      });
      render();
    }, undefined, () => { /* The local procedural texture remains available offline/on error. */ });
    cloudPhoto.colorSpace = THREE.SRGBColorSpace;
    const cloudGeo = new THREE.PlaneGeometry(1, 1);
    const cloudDefs = [
      [-17, 1.1, -14, 14, 3.4], [-8, 1.6, -18, 12, 3.8], [0, .9, -18, 10, 2.8],
      [10, 1, -20, 13, 3], [17, 3, -14, 9, 3.2],
      [9.5, 8, -7, 10, 2.8], [6, 5.4, -5, 7, 1.8],
      [5.2, 3.3, -1, 5, 1.5], [-9, .65, -3, 9, 2.2],
      [-2, 1.35, -7, 6, 2.1], [13, 10, -12, 7, 2.4],
    ];
    cloudDefs.forEach(([x, y, z, w, h], i) => {
      const mat = new THREE.MeshBasicMaterial({ map: cloudTextures[i % 3], transparent: true, depthWrite: false,
        opacity: i === 7 ? .65 : .86, side: THREE.DoubleSide });
      const cloud = new THREE.Mesh(cloudGeo, mat); cloud.position.set(x, y, z);
      cloud.scale.set(w, h, 1); cloud.rotation.z = i === 5 ? .2 : 0; clouds.add(cloud);
    });
    scene.add(clouds);
    const water = createWater(dark, mount.clientWidth < 700); scene.add(water);

    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      if (w < 700) {
        // Portrait shows the environment below the HTML, retaining a full-size architectural silhouette.
        camera.fov = 48; camera.position.set(4.1, 1.65, 30); camera.lookAt(4.1, 9.2, -2);
      } else {
        camera.fov = 34; camera.position.set(0, 1.65, 24); camera.lookAt(0, 4.55, -2);
        if (w / h < 1.35) { camera.position.z = 29; camera.position.x = 1.7; camera.lookAt(1.7, 5.2, -2); }
      }
      camera.updateProjectionMatrix(); renderer.setSize(w, h);
      render();
    };

    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    let frame = 0, last = 0, elapsed = 0, onScreen = true, lost = false, disposed = false;
    let renderCount = 0;
    const render = () => {
      if (!lost && !disposed) {
        renderer.render(scene, camera);
        // Development-only observations for interaction / visibility regression checks.
        if (import.meta.env.DEV) {
          mount.dataset.sphereRotation = `${sphere.rotation.x.toFixed(4)},${sphere.rotation.y.toFixed(4)}`;
          mount.dataset.spherePosition = sphere.position.toArray().join(',');
          mount.dataset.renderCount = String(++renderCount);
        }
      }
    };
    const animate = (now: number) => {
      frame = 0;
      if (document.hidden || !onScreen || lost || disposed) return;
      const dt = Math.min((now - last) / 1000, .05); last = now;
      if (!motion.matches && motionAllowed.current) {
        elapsed += dt;
        const blend = 1 - Math.exp(-5 * dt);
        currentX += (targetX - currentX) * blend; currentY += (targetY - currentY) * blend;
        sphere.rotation.set(currentX, .35 + currentY, 0);
        (water.material as THREE.ShaderMaterial).uniforms.time.value = elapsed;
      }
      render();
      if (!motion.matches && motionAllowed.current) frame = requestAnimationFrame(animate);
    };
    const resume = () => {
      cancelAnimationFrame(frame); frame = 0; last = performance.now();
      if (!document.hidden && onScreen && !lost) frame = requestAnimationFrame(animate);
    };
    const reset = () => { targetX = 0; targetY = 0; };
    const pointer = (e: PointerEvent) => {
      if (motion.matches || !motionAllowed.current || (e.pointerType === 'touch' && e.buttons === 0)) return;
      const rect = hero.getBoundingClientRect();
      targetY = THREE.MathUtils.clamp((e.clientX - rect.left) / rect.width * 2 - 1, -1, 1) * .34;
      targetX = THREE.MathUtils.clamp((e.clientY - rect.top) / rect.height * 2 - 1, -1, 1) * .13;
    };
    const endTouch = (e: PointerEvent) => { if (e.pointerType !== 'mouse') reset(); };
    const changeMotion = () => { reset(); currentX = currentY = 0; sphere.rotation.set(0, .35, 0); resume(); };
    motionChanged.current = changeMotion;
    const contextLost = (e: Event) => { e.preventDefault(); lost = true; cancelAnimationFrame(frame); setFailed(true); };
    const contextRestored = () => { lost = false; setFailed(false); resume(); };
    hero.addEventListener('pointermove', pointer, { passive: true });
    hero.addEventListener('pointerleave', reset);
    hero.addEventListener('pointerup', endTouch);
    hero.addEventListener('pointercancel', reset);
    motion.addEventListener('change', changeMotion);
    document.addEventListener('visibilitychange', resume);
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    renderer.domElement.addEventListener('webglcontextrestored', contextRestored);
    const observer = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; resume(); });
    observer.observe(hero);
    const sizeObserver = new ResizeObserver(resize); sizeObserver.observe(mount);
    resize(); resume();
    return () => {
      disposed = true; cancelAnimationFrame(frame);
      motionChanged.current = undefined;
      observer.disconnect(); sizeObserver.disconnect();
      hero.removeEventListener('pointermove', pointer); hero.removeEventListener('pointerleave', reset);
      hero.removeEventListener('pointerup', endTouch); hero.removeEventListener('pointercancel', reset);
      motion.removeEventListener('change', changeMotion); document.removeEventListener('visibilitychange', resume);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', contextRestored);
      const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
      scene.traverse(obj => { if (obj instanceof THREE.Mesh) {
        geometries.add(obj.geometry);
        (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => materials.add(m));
      } });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
      mineral.dispose(); cloudPhoto.dispose(); cloudTextures.forEach(t => t.dispose()); water.getRenderTarget().dispose();
      renderer.dispose(); renderer.domElement.remove();
    };
  }, [containerRef, theme]);
  return <>
    <div ref={mountRef} className="scene-canvas-mount" aria-hidden="true" style={{ visibility: failed ? 'hidden' : 'visible' }} />
    {failed && <div className="scene-fallback" aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="fallback-sky" x2=".9" y2="1"><stop stopColor="#253441"/><stop offset="1" stopColor={theme === 'dark' ? '#665344' : '#eac0a7'}/></linearGradient>
          <radialGradient id="fallback-orb" cx=".8" cy=".6"><stop stopColor="#e6bf9c" stopOpacity=".3"/><stop offset="1" stopColor="#9fa7af" stopOpacity=".8"/></radialGradient>
        </defs>
        <path fill="url(#fallback-sky)" d="M0 0h1440v900H0z"/>
        <path fill={theme === 'dark' ? '#152235' : '#3c4c57'} d="M870 715V192l212-55v563h-55V355a65 65 0 0 0-130 0v353z"/>
        <path fill="#8e8985" d="m1082 137 58 38v520l-58 5z"/>
        <circle cx="896" cy="364" r="144" fill="url(#fallback-orb)"/>
        <ellipse cx="976" cy="358" rx="300" ry="47" transform="rotate(-28 976 358)" stroke="#bfa78d" fill="none"/>
        <path fill="#243441" opacity=".75" d="M0 710h1440v190H0z"/>
        <path fill="#4c565c" d="m50 900 920-195h80L240 900z"/>
      </svg>
    </div>}
  </>;
}

