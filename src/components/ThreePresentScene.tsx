import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PresentTheme } from '../types/card';
import { audioEngine } from '../utils/audio';

interface ThreePresentSceneProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  theme: PresentTheme;
  teacherName: string;
  onBoxClick?: () => void;
  autoRotate?: boolean;
}

interface ConfettiParticle {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  originalY: number;
  active: boolean;
  delay: number;
}

export const ThreePresentScene: React.FC<ThreePresentSceneProps> = ({
  isOpen,
  onToggleOpen,
  theme,
  teacherName,
  onBoxClick,
  autoRotate = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Group references
  const mainGroupRef = useRef<THREE.Group | null>(null);
  const boxBaseRef = useRef<THREE.Mesh | null>(null);
  const lidGroupRef = useRef<THREE.Group | null>(null);
  const cardMeshRef = useRef<THREE.Mesh | null>(null);
  const innerGlowRef = useRef<THREE.PointLight | null>(null);
  const confettiParticlesRef = useRef<ConfettiParticle[]>([]);
  const cardTextureCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation values
  const animProgressRef = useRef<number>(isOpen ? 1 : 0);
  const targetProgressRef = useRef<number>(isOpen ? 1 : 0);

  // Orbit rotation controls
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationAngleRef = useRef({ x: 0.25, y: -0.45 });
  const targetRotationRef = useRef({ x: 0.25, y: -0.45 });
  const cameraDistanceRef = useRef(7.8);
  const isHoveredRef = useRef(false);

  // Keep target updated
  useEffect(() => {
    targetProgressRef.current = isOpen ? 1 : 0;
  }, [isOpen]);

  // Generate dynamic 2D canvas texture for the 3D greeting card
  const createCardTexture = (name: string, accentHex: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Card background: Luxurious parchment ivory with subtle radial glow
    const bgGradient = ctx.createRadialGradient(512, 384, 50, 512, 384, 600);
    bgGradient.addColorStop(0, '#fffdf7');
    bgGradient.addColorStop(0.85, '#fef9e7');
    bgGradient.addColorStop(1, '#fdecc7');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1024, 768);

    // Ornate gold border
    ctx.strokeStyle = accentHex || '#d97706';
    ctx.lineWidth = 14;
    ctx.strokeRect(36, 36, 952, 696);

    // Inner delicate hairline border
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
    ctx.lineWidth = 3;
    ctx.strokeRect(52, 52, 920, 664);

    // Corner decorative flourishes
    const drawCorner = (x: number, y: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.fillStyle = accentHex || '#d97706';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-2, -28, 4, 30);
      ctx.fillRect(-28, -2, 30, 4);
      ctx.restore();
    };

    drawCorner(52, 52, 0);
    drawCorner(972, 52, Math.PI / 2);
    drawCorner(972, 716, Math.PI);
    drawCorner(52, 716, -Math.PI / 2);

    // Farewell emblems at top
    ctx.font = '54px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💐 🎓 🍎', 512, 140);

    // Top subtitle
    ctx.fillStyle = '#b45309';
    ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '5px';
    ctx.fillText('HONORING OUR BELOVED MENTOR & GUIDE', 512, 205);

    // Primary Headline: "FAREWELL & THANK YOU"
    ctx.fillStyle = '#1e293b';
    ctx.font = '800 58px "Outfit", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('FAREWELL & THANK YOU', 512, 290);

    // "TEACHER!" in large vibrant display
    const headGradient = ctx.createLinearGradient(300, 320, 724, 410);
    headGradient.addColorStop(0, '#d97706');
    headGradient.addColorStop(0.5, '#ea580c');
    headGradient.addColorStop(1, '#ca8a04');
    ctx.fillStyle = headGradient;
    ctx.font = '900 84px "Outfit", sans-serif';
    ctx.fillText('TEACHER!', 512, 388);

    // Teacher Name Ribbon
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 46px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`To: ${name || 'Our Beloved Teacher'}`, 512, 475);

    // Heartfelt farewell quote
    ctx.fillStyle = '#475569';
    ctx.font = '500 25px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('“A great teacher affects eternity; they never stop inspiring.”', 512, 545);

    // Gold stars ribbon
    ctx.font = '34px system-ui, sans-serif';
    ctx.fillText('⭐ ⭐ ⭐ ⭐ ⭐', 512, 608);

    // Bottom class credit
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Forever in Our Hearts · Class of 2026 🎓', 512, 665);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
  };

  // Update card texture when teacher name or theme changes
  useEffect(() => {
    if (cardMeshRef.current) {
      const newTexture = createCardTexture(teacherName, theme.accentHex);
      if (Array.isArray(cardMeshRef.current.material)) {
        (cardMeshRef.current.material[4] as THREE.MeshStandardMaterial).map = newTexture;
        (cardMeshRef.current.material[4] as THREE.MeshStandardMaterial).needsUpdate = true;
      } else {
        (cardMeshRef.current.material as THREE.MeshStandardMaterial).map = newTexture;
        (cardMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
      }
    }
  }, [teacherName, theme]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = mount.clientWidth;
    const height = mount.clientHeight;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 2.5, cameraDistanceRef.current);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(6, 9, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.1);
    fillLight.position.set(-6, 4, -4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfef08a, 1.6);
    rimLight.position.set(0, -3, -6);
    scene.add(rimLight);

    // Magical inside-the-box point light
    const insideGlow = new THREE.PointLight(0xfbbf24, 0, 8);
    insideGlow.position.set(0, 0.5, 0);
    scene.add(insideGlow);
    innerGlowRef.current = insideGlow;

    // 3. Ground contact shadow plane
    const shadowGeo = new THREE.PlaneGeometry(8, 8);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.28 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.25;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Pedestal disk with subtle gold rim
    const pedestalGeo = new THREE.CylinderGeometry(2.6, 2.7, 0.12, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7,
      metalness: 0.2,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.31;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    const pedestalRimGeo = new THREE.TorusGeometry(2.68, 0.03, 16, 64);
    const pedestalRimMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.3,
      metalness: 0.8,
    });
    const pedestalRim = new THREE.Mesh(pedestalRimGeo, pedestalRimMat);
    pedestalRim.rotation.x = Math.PI / 2;
    pedestalRim.position.y = -1.25;
    scene.add(pedestalRim);

    // 4. Main Present Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    mainGroupRef.current = mainGroup;

    // --- Box Base (The lower container) ---
    const boxSize = 2.4;
    const boxHeight = 2.1;
    const boxGeo = new THREE.BoxGeometry(boxSize, boxHeight, boxSize);
    const boxMat = new THREE.MeshStandardMaterial({
      color: theme.boxColor,
      roughness: 0.35,
      metalness: 0.15,
    });
    const boxBase = new THREE.Mesh(boxGeo, boxMat);
    boxBase.position.y = 0;
    boxBase.castShadow = true;
    boxBase.receiveShadow = true;
    mainGroup.add(boxBase);
    boxBaseRef.current = boxBase;

    // --- Ribbon Straps on Box Base ---
    const ribbonWidth = 0.44;
    const ribbonThickness = 0.03;
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: theme.ribbonColor,
      roughness: 0.22,
      metalness: 0.75,
    });

    // Vertical ribbon X wrap
    const ribbonXGeo = new THREE.BoxGeometry(ribbonWidth, boxHeight + 0.02, boxSize + 0.04);
    const ribbonX = new THREE.Mesh(ribbonXGeo, ribbonMat);
    boxBase.add(ribbonX);

    // Vertical ribbon Z wrap
    const ribbonZGeo = new THREE.BoxGeometry(boxSize + 0.04, boxHeight + 0.02, ribbonWidth);
    const ribbonZ = new THREE.Mesh(ribbonZGeo, ribbonMat);
    boxBase.add(ribbonZ);

    // --- Lid Group (Lid, Lid Ribbons, and 3D Ribbon Bow) ---
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, boxHeight / 2 + 0.18, 0);
    mainGroup.add(lidGroup);
    lidGroupRef.current = lidGroup;

    const lidSize = boxSize + 0.16;
    const lidHeight = 0.42;
    const lidGeo = new THREE.BoxGeometry(lidSize, lidHeight, lidSize);
    const lidMat = new THREE.MeshStandardMaterial({
      color: theme.lidColor,
      roughness: 0.35,
      metalness: 0.2,
    });
    const lidMesh = new THREE.Mesh(lidGeo, lidMat);
    lidMesh.castShadow = true;
    lidMesh.receiveShadow = true;
    lidGroup.add(lidMesh);

    // Lid Ribbon Straps
    const lidRibbonXGeo = new THREE.BoxGeometry(ribbonWidth, lidHeight + 0.03, lidSize + 0.03);
    const lidRibbonX = new THREE.Mesh(lidRibbonXGeo, ribbonMat);
    lidGroup.add(lidRibbonX);

    const lidRibbonZGeo = new THREE.BoxGeometry(lidSize + 0.03, lidHeight + 0.03, ribbonWidth);
    const lidRibbonZ = new THREE.Mesh(lidRibbonZGeo, ribbonMat);
    lidGroup.add(lidRibbonZ);

    // --- 3D Ribbon Bow on top of Lid ---
    const bowGroup = new THREE.Group();
    bowGroup.position.y = lidHeight / 2 + 0.08;
    lidGroup.add(bowGroup);

    // Center knot
    const knotGeo = new THREE.SphereGeometry(0.24, 20, 20);
    const knotMesh = new THREE.Mesh(knotGeo, ribbonMat);
    knotMesh.scale.set(1, 0.75, 1);
    bowGroup.add(knotMesh);

    // 8 Ornate Ribbon Loops
    const loopGeo = new THREE.TorusGeometry(0.38, 0.09, 16, 32, Math.PI * 1.55);
    const loopAngles = [
      Math.PI * 0.1,
      Math.PI * 0.35,
      Math.PI * 0.6,
      Math.PI * 0.85,
      Math.PI * 1.1,
      Math.PI * 1.35,
      Math.PI * 1.6,
      Math.PI * 1.85,
    ];

    loopAngles.forEach((ang, idx) => {
      const loop = new THREE.Mesh(loopGeo, ribbonMat);
      loop.rotation.y = ang;
      loop.rotation.x = Math.PI / 4 + (idx % 2 === 0 ? 0.15 : -0.05);
      loop.position.set(Math.cos(ang) * 0.25, 0.15, Math.sin(ang) * 0.25);
      loop.castShadow = true;
      bowGroup.add(loop);
    });

    // Ribbon tails curving down
    const createTail = (angle: number) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.05, 0),
        new THREE.Vector3(Math.cos(angle) * 0.45, -0.05, Math.sin(angle) * 0.45),
        new THREE.Vector3(Math.cos(angle) * 0.9, -0.35, Math.sin(angle) * 0.9),
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.06, 8, false);
      const tail = new THREE.Mesh(tubeGeo, ribbonMat);
      tail.castShadow = true;
      return tail;
    };
    bowGroup.add(createTail(Math.PI * 0.25));
    bowGroup.add(createTail(Math.PI * 0.85));
    bowGroup.add(createTail(Math.PI * 1.45));

    // --- 3D Greeting Card inside box ---
    const cardWidth = 2.0;
    const cardHeight = 1.5;
    const cardThickness = 0.04;
    const cardGeo = new THREE.BoxGeometry(cardWidth, cardHeight, cardThickness);

    const cardFrontTex = createCardTexture(teacherName, theme.accentHex);
    const cardSideMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5 });
    const cardBackMat = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      roughness: 0.4,
      metalness: 0.05,
    });
    const cardFrontMat = new THREE.MeshStandardMaterial({
      map: cardFrontTex,
      roughness: 0.3,
      metalness: 0.1,
    });

    // Box materials array: [+x, -x, +y, -y, +z, -z]
    const cardMaterials = [
      cardSideMat,
      cardSideMat,
      cardSideMat,
      cardSideMat,
      cardFrontMat, // Front face (+z)
      cardBackMat,  // Back face (-z)
    ];

    const cardMesh = new THREE.Mesh(cardGeo, cardMaterials);
    cardMesh.position.set(0, 0, 0);
    cardMesh.castShadow = true;
    cardMesh.visible = false;
    mainGroup.add(cardMesh);
    cardMeshRef.current = cardMesh;

    // --- 3D Confetti Particle System ---
    const confettiColors = [
      0xf59e0b, // Gold
      0xef4444, // Crimson Red
      0x3b82f6, // Royal Blue
      0x10b981, // Emerald Green
      0xec4899, // Pink
      0x8b5cf6, // Purple
      0xfbbf24, // Amber
      0xffffff, // Silver white
    ];

    const particles: ConfettiParticle[] = [];
    const confettiCount = 130;

    const discGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.008, 8);
    const rectGeo = new THREE.PlaneGeometry(0.12, 0.06);

    for (let i = 0; i < confettiCount; i++) {
      const geo = i % 2 === 0 ? discGeo : rectGeo;
      const col = confettiColors[i % confettiColors.length];
      const mat = new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.25,
        metalness: 0.85,
        side: THREE.DoubleSide,
      });

      const pMesh = new THREE.Mesh(geo, mat);
      pMesh.position.set(0, 0.5, 0);
      pMesh.visible = false;
      mainGroup.add(pMesh);

      // Random 3D explosion vectors
      const angle = Math.random() * Math.PI * 2;
      const speedHoriz = 0.8 + Math.random() * 2.2;
      particles.push({
        mesh: pMesh,
        vx: Math.cos(angle) * speedHoriz,
        vy: 2.5 + Math.random() * 4.0,
        vz: Math.sin(angle) * speedHoriz,
        rotSpeedX: (Math.random() - 0.5) * 12,
        rotSpeedY: (Math.random() - 0.5) * 14,
        rotSpeedZ: (Math.random() - 0.5) * 10,
        originalY: 0.5,
        active: false,
        delay: Math.random() * 0.35,
      });
    }
    confettiParticlesRef.current = particles;

    // Handle Window Resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 5. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let confettiTimer = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Smooth interpolation of open/closed transition (Lerp)
      const targetP = targetProgressRef.current;
      animProgressRef.current += (targetP - animProgressRef.current) * 4.5 * delta;
      const p = animProgressRef.current;

      // Animate Lid opening:
      // Smoothly lifts straight up, tilts backward, and gently sways
      if (lidGroupRef.current) {
        const lidLift = p * 2.4;
        const lidTilt = p * 0.95; // Tilt backwards
        lidGroupRef.current.position.y = boxHeight / 2 + 0.18 + lidLift;
        lidGroupRef.current.position.z = -p * 1.1;
        lidGroupRef.current.rotation.x = -lidTilt;
        lidGroupRef.current.rotation.z = Math.sin(elapsed * 2) * 0.03 * p;
      }

      // Animate 3D Greeting Card:
      // Rises from within the box to hover majestically above it
      if (cardMeshRef.current) {
        if (p > 0.05) {
          cardMeshRef.current.visible = true;
          // Easing for pop out
          const cardY = -0.5 + p * 2.2 + Math.sin(elapsed * 2.5) * 0.08 * p;
          cardMeshRef.current.position.y = cardY;
          cardMeshRef.current.position.z = 0.15 * p;
          cardMeshRef.current.rotation.x = -0.15 * (1 - p * 0.5);
          // Gentle celebratory wobble
          cardMeshRef.current.rotation.y = Math.sin(elapsed * 1.5) * 0.08 * p;
          // Scale pop
          const scale = 0.2 + p * 0.8;
          cardMeshRef.current.scale.set(scale, scale, scale);
        } else {
          cardMeshRef.current.visible = false;
        }
      }

      // Inner Light Glow
      if (innerGlowRef.current) {
        innerGlowRef.current.intensity = p * 3.5;
      }

      // 3D Confetti explosion & flutter
      if (p > 0.2) {
        confettiTimer += delta;
        confettiParticlesRef.current.forEach((cp, idx) => {
          if (!cp.active && p > 0.35 && confettiTimer > cp.delay) {
            cp.active = true;
            cp.mesh.visible = true;
            cp.mesh.position.set(
              (Math.random() - 0.5) * 0.4,
              0.8,
              (Math.random() - 0.5) * 0.4
            );
          }

          if (cp.active) {
            // Apply physics: gravity and air resistance
            cp.mesh.position.x += cp.vx * delta;
            cp.mesh.position.y += cp.vy * delta;
            cp.mesh.position.z += cp.vz * delta;

            cp.vy -= 4.2 * delta; // Gravity
            cp.vx *= 0.985;
            cp.vz *= 0.985;

            // Tumbling rotation
            cp.mesh.rotation.x += cp.rotSpeedX * delta;
            cp.mesh.rotation.y += cp.rotSpeedY * delta;
            cp.mesh.rotation.z += cp.rotSpeedZ * delta;

            // When fallen to ground, gently float or reset
            if (cp.mesh.position.y < -1.25) {
              if (p > 0.8) {
                // Recycle gently back upward for ongoing celebratory atmosphere
                cp.mesh.position.set(
                  (Math.random() - 0.5) * 1.2,
                  1.0 + Math.random() * 0.8,
                  (Math.random() - 0.5) * 1.2
                );
                cp.vy = 1.0 + Math.random() * 2.5;
              } else {
                cp.mesh.visible = false;
                cp.active = false;
              }
            }
          }
        });
      } else {
        confettiTimer = 0;
        confettiParticlesRef.current.forEach((cp) => {
          cp.active = false;
          cp.mesh.visible = false;
        });
      }

      // Smooth Orbit Camera / Object rotation
      if (autoRotate && !isDraggingRef.current) {
        targetRotationRef.current.y += delta * 0.35;
      }

      // Damping on rotation
      rotationAngleRef.current.x += (targetRotationRef.current.x - rotationAngleRef.current.x) * 8 * delta;
      rotationAngleRef.current.y += (targetRotationRef.current.y - rotationAngleRef.current.y) * 8 * delta;

      if (mainGroupRef.current) {
        mainGroupRef.current.rotation.y = rotationAngleRef.current.y;
        mainGroupRef.current.rotation.x = rotationAngleRef.current.x;

        // Subtle floating idle motion
        mainGroupRef.current.position.y = Math.sin(elapsed * 1.8) * 0.06;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update theme colors when user selects a different palette
  useEffect(() => {
    if (boxBaseRef.current) {
      (boxBaseRef.current.material as THREE.MeshStandardMaterial).color.setHex(theme.boxColor);
    }
    if (lidGroupRef.current) {
      const lidMesh = lidGroupRef.current.children[0] as THREE.Mesh;
      if (lidMesh && lidMesh.material) {
        (lidMesh.material as THREE.MeshStandardMaterial).color.setHex(theme.lidColor);
      }
      // Ribbons
      const ribMat = (lidGroupRef.current.children[1] as THREE.Mesh)
        ?.material as THREE.MeshStandardMaterial;
      if (ribMat) {
        ribMat.color.setHex(theme.ribbonColor);
      }
    }
  }, [theme]);

  // Mouse & Touch Orbit Controls handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    targetRotationRef.current.y += deltaX * 0.009;
    targetRotationRef.current.x = Math.max(
      -0.5,
      Math.min(0.8, targetRotationRef.current.x + deltaY * 0.007)
    );

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!cameraRef.current) return;
    cameraDistanceRef.current = Math.max(
      5.2,
      Math.min(10.5, cameraDistanceRef.current + e.deltaY * 0.005)
    );
    cameraRef.current.position.z = cameraDistanceRef.current;
  };

  // Raycast click detection on the box
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If dragged significantly, don't trigger click
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    if (mainGroupRef.current) {
      const intersects = raycaster.intersectObjects(mainGroupRef.current.children, true);
      if (intersects.length > 0) {
        onToggleOpen();
        onBoxClick?.();
      }
    }
  };

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none outline-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      onClick={handleCanvasClick}
      aria-label="Interactive 3D Keepsake Present Box Farewell Card for Teacher. Drag to rotate 360 degrees, click to open and burst confetti."
      role="application"
    />
  );
};
