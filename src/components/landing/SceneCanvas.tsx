import { useEffect, useRef, useState, FC } from 'react';
import * as THREE from 'three';
import {
  createCelestialTexture,
  createCelestialBumpMap,
  createAtmosphericCloudTexture,
} from './textureGenerator';

interface SceneCanvasProps {
  containerRef: React.RefObject<HTMLElement>;
}

/**
 * Checks if WebGL is supported by the current browser/device.
 */
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export const SceneCanvas: FC<SceneCanvasProps> = ({ containerRef }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setWebGLSupported(false);
      return;
    }

    const mount = mountRef.current;
    const heroContainer = containerRef.current;
    if (!mount) return;

    // Detect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── 1. Scene, Camera, Renderer ─────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c121d, 0.035);

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    const initialCamPos = new THREE.Vector3(0, 0.6, 9.2);
    camera.position.copy(initialCamPos);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebGLSupported(false);
      return;
    }

    const isMobile = window.innerWidth < 768;
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.appendChild(renderer.domElement);

    // ── 2. Atmospheric & Sunset Lighting ────────────────────────
    // Ambient light - deep moody twilight indigo
    const ambientLight = new THREE.AmbientLight(0x1a2436, 1.25);
    scene.add(ambientLight);

    // Warm golden sunset key light located behind the monolithic portal
    const sunsetKeyLight = new THREE.DirectionalLight(0xf79d39, 4.4);
    sunsetKeyLight.position.set(2.2, 0.8, -3.8);
    sunsetKeyLight.castShadow = true;
    sunsetKeyLight.shadow.mapSize.width = 1024;
    sunsetKeyLight.shadow.mapSize.height = 1024;
    sunsetKeyLight.shadow.camera.near = 0.5;
    sunsetKeyLight.shadow.camera.far = 25;
    sunsetKeyLight.shadow.bias = -0.001;
    scene.add(sunsetKeyLight);

    // Warm rim light defining the outer edge of the monolithic arch portal
    const archRimLight = new THREE.DirectionalLight(0xe88a38, 2.6);
    archRimLight.position.set(6.5, 1.8, -1.0);
    scene.add(archRimLight);

    // Soft cool slate fill light from front-left
    const fillLight = new THREE.DirectionalLight(0x6a87a8, 1.4);
    fillLight.position.set(-6, 4, 5);
    scene.add(fillLight);

    // Warm horizon glow point light for water reflections
    const horizonGlow = new THREE.PointLight(0xe88a38, 2.8, 22);
    horizonGlow.position.set(1.8, -2.2, -2.5);
    scene.add(horizonGlow);

    // Procedural sunset horizon glow backdrop (adds the warm twilight line from reference)
    const horizonCanvas = document.createElement('canvas');
    horizonCanvas.width = 512;
    horizonCanvas.height = 256;
    const hCtx = horizonCanvas.getContext('2d');
    if (hCtx) {
      const hGrad = hCtx.createLinearGradient(0, 0, 0, 256);
      hGrad.addColorStop(0, 'rgba(11, 16, 26, 0)');
      hGrad.addColorStop(0.4, 'rgba(19, 28, 45, 0.4)');
      hGrad.addColorStop(0.78, 'rgba(235, 135, 45, 0.7)');
      hGrad.addColorStop(0.92, 'rgba(245, 175, 75, 0.9)');
      hGrad.addColorStop(1, 'rgba(180, 95, 30, 0.6)');
      hCtx.fillStyle = hGrad;
      hCtx.fillRect(0, 0, 512, 256);
    }
    const horizonTex = new THREE.CanvasTexture(horizonCanvas);
    const horizonPlaneGeo = new THREE.PlaneGeometry(36, 14);
    const horizonPlaneMat = new THREE.MeshBasicMaterial({
      map: horizonTex,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const horizonPlane = new THREE.Mesh(horizonPlaneGeo, horizonPlaneMat);
    horizonPlane.position.set(1.5, -0.6, -7.5);
    scene.add(horizonPlane);

    // ── 3. Monolithic Arch Geometry (Procedural) ─────────────────
    // Recreates the monumental portal structure from the reference
    const archShape = new THREE.Shape();
    const aw = 1.75; // half-width = 3.5 total
    const ah = 7.4;  // total height
    archShape.moveTo(-aw, 0);
    archShape.lineTo(aw, 0);
    archShape.lineTo(aw, ah);
    archShape.lineTo(-aw, ah);
    archShape.lineTo(-aw, 0);

    // Inner arch cutout
    const holePath = new THREE.Path();
    const hw = 1.05;      // half-width of cutout = 2.1 total
    const legH = 3.4;     // vertical leg height
    const archTopH = 4.65; // peak of rounded arch
    holePath.moveTo(-hw, 0);
    holePath.lineTo(hw, 0);
    holePath.lineTo(hw, legH);
    // Semicircular top arch curve
    holePath.absarc(0, legH, hw, 0, Math.PI, false);
    holePath.lineTo(-hw, 0);
    archShape.holes.push(holePath);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.95,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.045,
      bevelThickness: 0.045,
    };

    const archGeometry = new THREE.ExtrudeGeometry(archShape, extrudeSettings);
    // Center geometry origin at ground level
    archGeometry.center();
    archGeometry.translate(0, ah * 0.5 - 3.2, 0);

    const archMaterial = new THREE.MeshStandardMaterial({
      color: 0x161d2b,
      roughness: 0.68,
      metalness: 0.12,
    });

    const archMesh = new THREE.Mesh(archGeometry, archMaterial);
    archMesh.position.set(1.9, 0, -0.9);
    archMesh.rotation.y = -0.14;
    archMesh.castShadow = true;
    archMesh.receiveShadow = true;
    scene.add(archMesh);

    // ── 4. The Focal Rotating Celestial Sphere ────────────────────
    // Positioned beside the arch, matching reference composition
    const sphereRadius = 1.45;
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 64, 64);

    const celestialTex = createCelestialTexture();
    const celestialBump = createCelestialBumpMap();

    const sphereMaterial = new THREE.MeshStandardMaterial({
      map: celestialTex,
      bumpMap: celestialBump,
      bumpScale: 0.065,
      roughness: 0.54,
      metalness: 0.16,
    });

    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    // Anchored beside the arc
    sphereMesh.position.set(0.38, 1.25, 0.25);
    sphereMesh.castShadow = true;
    sphereMesh.receiveShadow = true;
    scene.add(sphereMesh);

    // ── 5. The Sweeping Orbital Arc (Elliptical Ring) ────────────
    // Encircles the sphere at an angle, passing through the portal opening
    const arcRadius = 2.45;
    const arcTube = 0.024;
    const arcGeometry = new THREE.TorusGeometry(arcRadius, arcTube, 24, 160);

    const arcMaterial = new THREE.MeshStandardMaterial({
      color: 0xd89e5a,
      emissive: 0x6e3c12,
      emissiveIntensity: 0.45,
      roughness: 0.22,
      metalness: 0.88,
    });

    const arcMesh = new THREE.Mesh(arcGeometry, arcMaterial);
    // Anchor at sphere position
    arcMesh.position.copy(sphereMesh.position);
    // Tilted inclination matching reference angle (~30 deg)
    const baseArcRotX = Math.PI * 0.46;
    const baseArcRotY = -Math.PI * 0.16;
    const baseArcRotZ = -Math.PI * 0.12;
    arcMesh.rotation.set(baseArcRotX, baseArcRotY, baseArcRotZ);
    scene.add(arcMesh);

    // ── 6. Secondary Companion Orbs ─────────────────────────────
    // Mid-ground sphere on the left
    const orbLeftGeo = new THREE.SphereGeometry(0.28, 32, 32);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x222a3a,
      roughness: 0.6,
      metalness: 0.2,
    });
    const orbLeft = new THREE.Mesh(orbLeftGeo, orbMat);
    orbLeft.position.set(-3.4, -0.65, -1.8);
    scene.add(orbLeft);

    // Distant small sphere on the right
    const orbRightGeo = new THREE.SphereGeometry(0.12, 24, 24);
    const orbRight = new THREE.Mesh(orbRightGeo, orbMat);
    orbRight.position.set(5.1, -0.2, -4.2);
    scene.add(orbRight);

    // ── 7. Reflective Water Ground & Architectural Pier ──────────
    const waterGeo = new THREE.PlaneGeometry(36, 24, 1, 1);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x090e18,
      roughness: 0.14,
      metalness: 0.92,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = -3.2;
    waterMesh.receiveShadow = true;
    scene.add(waterMesh);

    // Slender pier walkway extending out towards the arch
    const pierGeo = new THREE.BoxGeometry(0.85, 0.12, 9.5);
    const pierMat = new THREE.MeshStandardMaterial({
      color: 0x121722,
      roughness: 0.7,
      metalness: 0.1,
    });
    const pierMesh = new THREE.Mesh(pierGeo, pierMat);
    pierMesh.position.set(0.65, -3.14, 0.8);
    pierMesh.receiveShadow = true;
    scene.add(pierMesh);

    // Silhouetted figure standing on the pier for scale
    const figureGroup = new THREE.Group();
    const figureBodyGeo = new THREE.CylinderGeometry(0.045, 0.075, 0.42, 12);
    const figureMat = new THREE.MeshBasicMaterial({ color: 0x070b12 });
    const figureBody = new THREE.Mesh(figureBodyGeo, figureMat);
    figureBody.position.y = 0.21;
    const figureHeadGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const figureHead = new THREE.Mesh(figureHeadGeo, figureMat);
    figureHead.position.y = 0.46;
    figureGroup.add(figureBody);
    figureGroup.add(figureHead);
    figureGroup.position.set(0.65, -3.08, -1.8);
    scene.add(figureGroup);

    // ── 8. Volumetric Ambient Cloud Sprites ──────────────────────
    const cloudTexture = createAtmosphericCloudTexture();
    const cloudMat = new THREE.SpriteMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });

    const cloudGroup = new THREE.Group();
    for (let c = 0; c < 12; c++) {
      const sprite = new THREE.Sprite(cloudMat);
      const angle = (c / 12) * Math.PI * 1.5 - 0.4;
      const dist = 3.5 + (c % 4) * 0.8;
      sprite.position.set(
        Math.cos(angle) * dist + 1.2,
        -2.2 + (c % 3) * 0.45,
        Math.sin(angle) * dist - 2.5
      );
      const scale = 2.4 + (c % 3) * 0.9;
      sprite.scale.set(scale, scale * 0.65, 1);
      cloudGroup.add(sprite);
    }
    scene.add(cloudGroup);

    // ── 9. Interaction Dynamics & State ─────────────────────────
    // Normalized pointer target coordinates
    const targetRot = { x: 0, y: 0 };
    const currentRot = { x: 0, y: 0 };
    let isPointerOver = false;
    let idleBlend = 1.0; // 1 when idle, 0 when user is actively moving pointer
    let idleTime = 0;
    let isVisible = true;

    // ±25 degrees = ~0.4363 rad horizontal
    // ±15 degrees = ~0.2618 rad vertical
    const MAX_ROT_Y = 25 * (Math.PI / 180);
    const MAX_ROT_X = 15 * (Math.PI / 180);

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (prefersReducedMotion) return;

      const hero = heroContainer || mount;
      const rect = hero.getBoundingClientRect();

      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      } else {
        return;
      }

      // Check if inside hero area
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        isPointerOver = true;
        const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
        const normY = ((clientY - rect.top) / rect.height) * 2 - 1;

        // Map horizontal pointer to Y-axis rotation
        // Map vertical pointer to X-axis rotation (inverted so moving up tilts up)
        targetRot.y = Math.max(-1, Math.min(1, normX)) * MAX_ROT_Y;
        targetRot.x = -Math.max(-1, Math.min(1, normY)) * MAX_ROT_X;
      } else if (isPointerOver) {
        // Just left hero area
        isPointerOver = false;
        targetRot.x = 0;
        targetRot.y = 0;
      }
    };

    const handlePointerLeave = () => {
      isPointerOver = false;
      targetRot.x = 0;
      targetRot.y = 0;
    };

    // Attach pointer listeners to window so movement across hero text is captured
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    // ── 10. Responsive Resizing ─────────────────────────────────
    const handleResize = () => {
      if (!mount || !renderer) return;
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;

      camera.aspect = w / h;
      // Adjust camera distance & positions on smaller screens
      if (w < 768) {
        camera.fov = 48;
        camera.position.set(0, 0.4, 10.8);
        sphereMesh.position.set(0, 1.1, 0.2);
        arcMesh.position.set(0, 1.1, 0.2);
        archMesh.position.set(1.2, -0.3, -1.2);
      } else if (w < 1024) {
        camera.fov = 44;
        camera.position.set(0, 0.5, 9.8);
        sphereMesh.position.set(0.3, 1.2, 0.25);
        arcMesh.position.set(0.3, 1.2, 0.25);
        archMesh.position.set(1.6, 0, -1.0);
      } else {
        camera.fov = 40;
        camera.position.copy(initialCamPos);
        sphereMesh.position.set(0.38, 1.25, 0.25);
        arcMesh.position.set(0.38, 1.25, 0.25);
        archMesh.position.set(1.9, 0, -0.9);
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // ── 11. Intersection Observer & Visibility ──────────────────
    // Pauses animation loop when scrolled off-screen or tab is hidden
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(mount);

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ── 12. Main Render Loop ────────────────────────────────────
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) {
        lastTime = currentTime;
        return;
      }

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      idleTime += delta;

      if (!prefersReducedMotion) {
        // Frame-rate-independent damping (exponential smoothing)
        const damping = 4.8;
        const lerpFactor = 1 - Math.exp(-damping * delta);

        currentRot.y += (targetRot.y - currentRot.y) * lerpFactor;
        currentRot.x += (targetRot.x - currentRot.x) * lerpFactor;

        // Manage idle oscillation: blend out when pointer is actively interacting
        if (isPointerOver) {
          idleBlend = Math.max(0, idleBlend - delta * 3.5);
        } else {
          idleBlend = Math.min(1, idleBlend + delta * 1.2);
        }

        // Very subtle resting idle breathing oscillation
        const idleRotY = Math.sin(idleTime * 0.35) * 0.035 * idleBlend;
        const idleRotX = Math.cos(idleTime * 0.28) * 0.018 * idleBlend;

        // Apply primary rotation to the focal celestial sphere
        sphereMesh.rotation.y = currentRot.y + idleRotY;
        sphereMesh.rotation.x = currentRot.x + idleRotX;

        // Secondary subtle parallax on the orbital arc (~22% ratio)
        arcMesh.rotation.y = baseArcRotY + currentRot.y * 0.22;
        arcMesh.rotation.x = baseArcRotX + currentRot.x * 0.18;

        // Subtle secondary parallax on arch structure
        archMesh.rotation.y = -0.14 + currentRot.y * 0.06;

        // Subtle camera parallax drift
        const targetCamX = (isMobile ? 0 : initialCamPos.x) + currentRot.y * 0.35;
        const targetCamY = initialCamPos.y - currentRot.x * 0.25;
        camera.position.x += (targetCamX - camera.position.x) * (lerpFactor * 0.5);
        camera.position.y += (targetCamY - camera.position.y) * (lerpFactor * 0.5);
        camera.lookAt(0.3, 0.4, 0);

        // Slow ambient drift on cloud sprites
        cloudGroup.rotation.y = idleTime * 0.012;
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // ── 13. Resource Cleanup ────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();

      // Dispose Three.js resources
      archGeometry.dispose();
      archMaterial.dispose();
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      celestialTex.dispose();
      celestialBump.dispose();
      arcGeometry.dispose();
      arcMaterial.dispose();
      orbLeftGeo.dispose();
      orbRightGeo.dispose();
      orbMat.dispose();
      waterGeo.dispose();
      waterMat.dispose();
      pierGeo.dispose();
      pierMat.dispose();
      figureBodyGeo.dispose();
      figureHeadGeo.dispose();
      figureMat.dispose();
      cloudTexture.dispose();
      cloudMat.dispose();
      horizonPlaneGeo.dispose();
      horizonPlaneMat.dispose();
      horizonTex.dispose();

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
        }
      }
    };
  }, [containerRef]);

  if (!webGLSupported) {
    return (
      <div className="scene-fallback" aria-label="Beam Calci 3D visualization preview">
        <svg
          className="scene-fallback__svg"
          viewBox="0 0 1000 800"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B101A" />
              <stop offset="55%" stopColor="#1B263B" />
              <stop offset="85%" stopColor="#B36A2E" />
              <stop offset="100%" stopColor="#0D1420" />
            </linearGradient>
            <radialGradient id="sunGlow" cx="65%" cy="60%" r="40%">
              <stop offset="0%" stopColor="#F5A647" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#D97A26" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0B101A" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="sphereGrad" x1="0.2" y1="0.2" x2="0.85" y2="0.85">
              <stop offset="0%" stopColor="#3A485C" />
              <stop offset="60%" stopColor="#1E2738" />
              <stop offset="90%" stopColor="#F39C38" />
            </linearGradient>
          </defs>

          {/* Sky background */}
          <rect width="1000" height="800" fill="url(#skyGrad)" />
          <circle cx="650" cy="480" r="320" fill="url(#sunGlow)" />

          {/* Monolithic Arch */}
          <path
            d="M 520,200 L 760,200 L 760,650 L 690,650 L 690,380 Q 640,320 590,380 L 590,650 L 520,650 Z"
            fill="#151C2A"
          />

          {/* Celestial Sphere */}
          <circle cx="480" cy="380" r="140" fill="url(#sphereGrad)" />

          {/* Orbital Ring Arc */}
          <ellipse
            cx="480"
            cy="380"
            rx="230"
            ry="45"
            transform="rotate(-28 480 380)"
            fill="none"
            stroke="#D89E5A"
            strokeWidth="3.5"
          />

          {/* Reflective Water surface */}
          <rect x="0" y="650" width="1000" height="150" fill="#0A0E18" />
          <line x1="0" y1="650" x2="1000" y2="650" stroke="#E28E3A" strokeWidth="2" strokeOpacity="0.5" />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="scene-canvas-mount"
      role="img"
      aria-label="Interactive 3D visualization featuring an architectural portal arch, an orbital ring, and a rotating celestial sphere responding to pointer movements"
    />
  );
};

export default SceneCanvas;
