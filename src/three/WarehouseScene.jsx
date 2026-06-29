import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ─── Deterministic Layout Engine ──────────────────────────────────────────────
// Generates stable 3D positions from the natural ordering of bins even when
// the backend hasn't stored explicit x/y/z coordinates.
//
// Layout strategy:
//   • Zones are laid out in a grid horizontally (2 per row, spaced by ZONE_GAP).
//   • Within each zone, racks are placed in columns (spaced by RACK_GAP_Z).
//   • Bins on the same shelf (same zone + rack + shelf) sit side-by-side along X.
//   • Each shelf level stacks upward on Y.

const BIN_W = 1.6;   // bin width  (X)
const BIN_H = 0.9;   // bin height (Y)
const BIN_D = 1.4;   // bin depth  (Z)
const BIN_PAD_X = 0.3;  // horizontal gap between bins in same shelf row
const SHELF_H_GAP = 0.4; // vertical gap between shelf levels
const RACK_GAP_Z = 3.5;  // space between racks along Z inside a zone
const ZONE_W = 26;        // allocated width per zone column
const ZONE_D = 22;        // allocated depth per zone row
const ZONE_COLS = 3;      // zones per row
const ZONE_PAD = 3;       // padding between zones

function buildDeterministicPositions(bins) {
  // Group bins: zone → rack → shelf → [bins]
  const tree = {};
  bins.forEach(bin => {
    const zoneKey = bin.zone || 'Zone A';
    const rackKey = bin.rack || bin.aisle || 'Rack-1';
    const shelfKey = bin.shelf !== undefined ? String(bin.shelf) : '1';
    if (!tree[zoneKey]) tree[zoneKey] = {};
    if (!tree[zoneKey][rackKey]) tree[zoneKey][rackKey] = {};
    if (!tree[zoneKey][rackKey][shelfKey]) tree[zoneKey][rackKey][shelfKey] = [];
    tree[zoneKey][rackKey][shelfKey].push(bin);
  });

  const positions = {};
  const zoneKeys = Object.keys(tree);

  zoneKeys.forEach((zoneKey, zoneIdx) => {
    // Zones grid: ZONE_COLS zones per row
    const zoneCol = zoneIdx % ZONE_COLS;
    const zoneRow = Math.floor(zoneIdx / ZONE_COLS);
    const zoneOriginX = zoneCol * (ZONE_W + ZONE_PAD);
    const zoneOriginZ = zoneRow * (ZONE_D + ZONE_PAD);

    const rackKeys = Object.keys(tree[zoneKey]);
    rackKeys.forEach((rackKey, rackIdx) => {
      const rackOriginZ = zoneOriginZ + rackIdx * RACK_GAP_Z;
      const shelfKeys = Object.keys(tree[zoneKey][rackKey]).sort();

      shelfKeys.forEach((shelfKey, shelfIdx) => {
        const shelfY = 0.5 + shelfIdx * (BIN_H + SHELF_H_GAP);
        const shelfBins = tree[zoneKey][rackKey][shelfKey];

        shelfBins.forEach((bin, binIdx) => {
          const binX = zoneOriginX + binIdx * (BIN_W + BIN_PAD_X);
          positions[bin.code] = [binX, shelfY, rackOriginZ];
        });
      });
    });
  });

  return positions;
}

// Returns per-zone bounding box info for zone plate rendering
function buildZoneBounds(bins, positions) {
  const bounds = {};
  bins.forEach(bin => {
    const zoneKey = bin.zone || 'Zone A';
    const pos = positions[bin.code];
    if (!pos) return;
    if (!bounds[zoneKey]) {
      bounds[zoneKey] = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity };
    }
    const b = bounds[zoneKey];
    if (pos[0] < b.minX) b.minX = pos[0];
    if (pos[0] > b.maxX) b.maxX = pos[0];
    if (pos[2] < b.minZ) b.minZ = pos[2];
    if (pos[2] > b.maxZ) b.maxZ = pos[2];
  });
  return bounds;
}
// ──────────────────────────────────────────────────────────────────────────────

function WarehouseScene({ 
  zones = [], 
  bins = [], 
  inventory = [], 
  selectedBinCode = null, 
  onBinClick = null 
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const layoutGroupRef = useRef(null);
  
  // Keep refs of interactive meshes for click detection and highlighting
  const binMeshesRef = useRef([]);
  const pulseGroupRef = useRef([]);
  const onBinClickRef = useRef(onBinClick);
  const triggerRenderRef = useRef(null);

  useEffect(() => {
    onBinClickRef.current = onBinClick;
  }, [onBinClick]);

  // Effect 1: Core WebGL Scene, Camera, Renderer, Controls, and Event Setup (Mount Only)
  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene setup — lighter, more visible background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a'); // dark navy (less pure black)
    sceneRef.current = scene;

    // Mild fog — just enough for depth without hiding racks
    scene.fog = new THREE.Fog('#0f172a', 120, 350);

    // 2. Camera setup
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 450;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 800);
    camera.position.set(40, 35, 75); // closer, slightly lower angle for clarity
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3; // slightly brighter overall output
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 5;
    controls.maxDistance = 300;
    controlsRef.current = controls;

    // 5. Lighting — significantly brighter for demo clarity
    const ambientLight = new THREE.AmbientLight('#d4e8ff', 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 1.4);
    dirLight.position.set(50, 90, 60);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 300;
    const d = 100;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0003;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight('#7fb8ff', 0.6);
    fillLight.position.set(-40, 50, -30);
    scene.add(fillLight);

    const hemiLight = new THREE.HemisphereLight('#b8d4f0', '#1e293b', 0.55);
    scene.add(hemiLight);

    const gridHelper = new THREE.GridHelper(300, 60, '#1e3a5f', '#162032');
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(400, 400);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: '#0c1828', 
      roughness: 0.85, 
      metalness: 0.1 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Click Handler Raycaster with drag prevention
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerStartX = 0;
    let pointerStartY = 0;

    const handlePointerDown = (event) => {
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
    };

    const handlePointerUp = (event) => {
      if (!onBinClickRef.current) return;

      const deltaX = Math.abs(event.clientX - pointerStartX);
      const deltaY = Math.abs(event.clientY - pointerStartY);
      if (deltaX > 6 || deltaY > 6) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(binMeshesRef.current);

      if (intersects.length > 0) {
        const selectedMesh = intersects[0].object;
        const clickedCode = selectedMesh.userData.binCode;
        onBinClickRef.current(clickedCode);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    // Animation & On-demand Render Loop
    let clock = new THREE.Clock();
    let animFrameId;
    let needsRender = true;

    const triggerRender = () => {
      needsRender = true;
    };
    triggerRenderRef.current = triggerRender;
    controls.addEventListener('change', triggerRender);

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      
      const elapsed = clock.getElapsedTime();
      const isPulsing = pulseGroupRef.current.length > 0;

      // Make the selected bin pulse visually
      if (isPulsing) {
        pulseGroupRef.current.forEach(mesh => {
          const pulse = 1.0 + Math.sin(elapsed * 5.0) * 0.1;
          mesh.scale.set(pulse, pulse, pulse);
        });
      }

      const controlsActive = controls.update();

      if (controlsActive || isPulsing || needsRender) {
        renderer.render(scene, camera);
        needsRender = false;
      }
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      triggerRender();
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(mountRef.current);

    // Cleanups
    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      if (renderer.domElement && mountRef.current) {
        renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
        renderer.domElement.removeEventListener('pointerup', handlePointerUp);
        mountRef.current.removeChild(renderer.domElement);
      }
      controls.removeEventListener('change', triggerRender);
      gridHelper.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      renderer.dispose();
    };
  }, []);

  // Effect 2: Mesh Layout Construction (Runs when layout structure data changes)
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!scene || !camera || !controls) return;

    // 1. Clear old layoutGroup if it exists, disposing of unique resources exactly once
    if (layoutGroupRef.current) {
      scene.remove(layoutGroupRef.current);
      
      const uniqueGeometries = new Set();
      const uniqueMaterials = new Set();

      layoutGroupRef.current.traverse((child) => {
        if (child.geometry) uniqueGeometries.add(child.geometry);
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => uniqueMaterials.add(mat));
          } else {
            uniqueMaterials.add(child.material);
          }
        }
      });

      uniqueGeometries.forEach((g) => g.dispose());
      uniqueMaterials.forEach((m) => m.dispose());
      layoutGroupRef.current = null;
    }

    if (!Array.isArray(bins) || bins.length === 0) {
      binMeshesRef.current = [];
      pulseGroupRef.current = [];
      if (triggerRenderRef.current) triggerRenderRef.current();
      return;
    }

    // Create new layout group
    const layoutGroup = new THREE.Group();
    layoutGroupRef.current = layoutGroup;

    // Deterministic layout calculations
    const hasExplicitCoords = (b) =>
      (b.x != null && b.y != null && b.z != null) &&
      !(b.x === 0 && b.y === 0 && b.z === 0);

    const binsNeedingAutoLayout = bins.filter(b => !hasExplicitCoords(b));
    const autoPositions = buildDeterministicPositions(binsNeedingAutoLayout);

    const getBinPosition = (bin) => {
      if (hasExplicitCoords(bin)) {
        return [bin.x, bin.y, bin.z];
      }
      return autoPositions[bin.code] || [0, 0.5, 0];
    };

    const autoZoneBounds = buildZoneBounds(binsNeedingAutoLayout, autoPositions);
    const binMeshes = [];

    const colors = {
      empty: '#475569',
      occupied: '#22d3ee',
      full: '#f87171',
      highlight: '#fbbf24',
    };

    // Shared geometry and materials for Bins to optimize draw calls and memory overhead
    const binGeo = new THREE.BoxGeometry(BIN_W, BIN_H, BIN_D);
    const binMaterials = {
      empty: new THREE.MeshStandardMaterial({ color: colors.empty, roughness: 0.6, metalness: 0.1 }),
      occupied: new THREE.MeshStandardMaterial({ color: colors.occupied, roughness: 0.6, metalness: 0.1 }),
      full: new THREE.MeshStandardMaterial({ color: colors.full, roughness: 0.6, metalness: 0.1 }),
      highlight: new THREE.MeshStandardMaterial({ color: colors.highlight, roughness: 0.6, metalness: 0.1 }),
    };

    // Shared column geometry and material to reuse across all racks support poles
    const columnGeo = new THREE.CylinderGeometry(0.14, 0.14, 10, 8);
    const columnMat = new THREE.MeshStandardMaterial({ 
      color: '#94a3b8',
      metalness: 0.92, 
      roughness: 0.15,
    });

    // Shared support material
    const supportMat = new THREE.MeshStandardMaterial({ 
      color: '#64748b',
      metalness: 0.85, 
      roughness: 0.25,
      emissive: '#1e293b',
      emissiveIntensity: 0.2,
    });

    // Draw Zones
    const zoneColorMap = {
      'Zone A': '#38bdf8',
      'Zone B': '#c084fc',
      'Zone C': '#fb923c',
      'Zone D': '#4ade80',
    };
    const PAD = 2.0;

    const allZoneNames = new Set([
      ...zones.map(z => z.name),
      ...Object.keys(autoZoneBounds)
    ]);

    allZoneNames.forEach((zoneName, idx) => {
      const zColor = zoneColorMap[zoneName] || '#64748b';
      const zHeight = 0.2;

      let zX, zZ, zWidth, zDepth;
      const bounds = autoZoneBounds[zoneName];
      const apiZone = zones.find(z => z.name === zoneName);

      if (apiZone && apiZone.x != null && apiZone.z != null) {
        zX = apiZone.x;
        zZ = apiZone.z;
        zWidth = apiZone.width || 22;
        zDepth = apiZone.depth || 18;
      } else if (bounds) {
        zX = bounds.minX - PAD;
        zZ = bounds.minZ - PAD;
        zWidth = (bounds.maxX - bounds.minX) + PAD * 2 + BIN_W;
        zDepth = (bounds.maxZ - bounds.minZ) + PAD * 2 + BIN_D;
      } else {
        zX = idx * 29;
        zZ = 0;
        zWidth = 22;
        zDepth = 18;
      }

      const zoneGeo = new THREE.BoxGeometry(zWidth, zHeight, zDepth);
      const zoneMat = new THREE.MeshStandardMaterial({
        color: zColor,
        roughness: 0.4,
        transparent: true,
        opacity: 0.22,
        emissive: zColor,
        emissiveIntensity: 0.04,
      });
      const zoneMesh = new THREE.Mesh(zoneGeo, zoneMat);
      zoneMesh.position.set(zX + zWidth / 2, 0.06, zZ + zDepth / 2);
      layoutGroup.add(zoneMesh);

      const edges = new THREE.EdgesGeometry(zoneGeo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: zColor, linewidth: 2 })
      );
      line.position.copy(zoneMesh.position);
      layoutGroup.add(line);

      // Zone label sprite
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 80;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = `${zColor}33`;
      ctx.roundRect(4, 4, 248, 72, 12);
      ctx.fill();
      ctx.strokeStyle = zColor;
      ctx.lineWidth = 3;
      ctx.roundRect(4, 4, 248, 72, 12);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(zoneName, 128, 40);
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(zX + zWidth / 2, 4.5, zZ + zDepth / 2);
      sprite.scale.set(14, 4.5, 1);
      layoutGroup.add(sprite);
    });

    // Draw Bins and shelves
    const shelfGroupings = {};

    bins.forEach(bin => {
      const [bX, bY, bZ] = getBinPosition(bin);
      const item = inventory.find(i => i.bin === bin.code);
      const capRatio = bin.maxCapacity > 0 ? (bin.currentCapacity / bin.maxCapacity) : 0;
      let statusKey = 'occupied';
      if (bin.currentCapacity === 0 || !item) {
        statusKey = 'empty';
      } else if (capRatio > 0.8 || bin.status === 'FULL') {
        statusKey = 'full';
      }

      // Reuse the shared geometry and material cache
      const binMesh = new THREE.Mesh(binGeo, binMaterials[statusKey]);
      binMesh.position.set(bX, bY, bZ);
      binMesh.castShadow = true;
      binMesh.receiveShadow = true;
      binMesh.userData = { binCode: bin.code, baseColor: colors[statusKey] };

      layoutGroup.add(binMesh);
      binMeshes.push(binMesh);

      const shelfKey = `${bin.zone}-${bin.shelf}`;
      if (!shelfGroupings[shelfKey]) {
        shelfGroupings[shelfKey] = [];
      }
      shelfGroupings[shelfKey].push(new THREE.Vector3(bX, bY - BIN_H / 2 - 0.05, bZ));
    });

    binMeshesRef.current = binMeshes;

    // Draw shelf support beams
    Object.keys(shelfGroupings).forEach(key => {
      const positions = shelfGroupings[key];
      if (positions.length === 0) return;

      let minX = Infinity, maxX = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;
      let levelY = positions[0].y;

      positions.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.z < minZ) minZ = p.z;
        if (p.z > maxZ) maxZ = p.z;
      });

      const pad = 1.5;
      const shelfW = (maxX - minX) + pad * 2;
      const shelfD = (maxZ - minZ) + pad * 2;

      // Unique geometry for support beams as widths/depths differ, but reuse supportMat
      const supportGeo = new THREE.BoxGeometry(shelfW, 0.12, shelfD);
      const supportMesh = new THREE.Mesh(supportGeo, supportMat);
      supportMesh.position.set((minX + maxX) / 2, levelY, (minZ + maxZ) / 2);
      layoutGroup.add(supportMesh);

      const corners = [
        { x: minX - pad, z: minZ - pad },
        { x: minX - pad, z: maxZ + pad },
        { x: maxX + pad, z: minZ - pad },
        { x: maxX + pad, z: maxZ + pad },
      ];

      corners.forEach(corner => {
        // Reuse columnGeo and columnMat across all column instances
        const column = new THREE.Mesh(columnGeo, columnMat);
        column.position.set(corner.x, 5, corner.z);
        column.castShadow = true;
        layoutGroup.add(column);
      });
    });

    scene.add(layoutGroup);

    // Auto-center camera
    if (binMeshes.length > 0) {
      let sumX = 0, sumY = 0, sumZ = 0;
      let minX = Infinity, maxX = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;
      binMeshes.forEach(mesh => {
        sumX += mesh.position.x;
        sumY += mesh.position.y;
        sumZ += mesh.position.z;
        if (mesh.position.x < minX) minX = mesh.position.x;
        if (mesh.position.x > maxX) maxX = mesh.position.x;
        if (mesh.position.z < minZ) minZ = mesh.position.z;
        if (mesh.position.z > maxZ) maxZ = mesh.position.z;
      });
      const count = binMeshes.length;
      const centX = sumX / count;
      const centZ = sumZ / count;
      const spreadX = (maxX - minX) || 10;
      const spreadZ = (maxZ - minZ) || 10;
      const spread = Math.max(spreadX, spreadZ, 10);
      camera.position.set(centX + spread * 0.8, spread * 0.7, centZ + spread * 1.2);
      controls.target.set(centX, 1.5, centZ);
      controls.update();
    }

    if (triggerRenderRef.current) triggerRenderRef.current();
  }, [zones, bins]);

  // Effect 3: Highlight & Pulse selection (Runs when selection target updates)
  useEffect(() => {
    const interactiveMeshes = binMeshesRef.current || [];
    const pulsingObjects = [];

    const colors = {
      highlight: '#fbbf24',
    };

    interactiveMeshes.forEach(mesh => {
      const isSelected = selectedBinCode === mesh.userData.binCode;
      if (isSelected) {
        mesh.material.color.set(colors.highlight);
        mesh.material.emissive.set(colors.highlight);
        mesh.material.emissiveIntensity = 0.45;
        pulsingObjects.push(mesh);
      } else {
        // Restore base color
        const baseColor = mesh.userData.baseColor || '#334155';
        mesh.material.color.set(baseColor);
        mesh.material.emissive.set('#000000');
        mesh.material.emissiveIntensity = 0;
        mesh.scale.set(1.0, 1.0, 1.0); // Reset scale
      }
    });

    pulseGroupRef.current = pulsingObjects;
    if (triggerRenderRef.current) triggerRenderRef.current();
  }, [selectedBinCode, bins]); // Rebuild on layout, bins, or selection updates

  return (
    <div 
      ref={mountRef} 
      className="w-full h-[450px] relative rounded-2xl overflow-hidden border border-slate-800 shadow-inner bg-[#0b1329]"
    >
      {/* Empty state overlay — shown when no bins are available */}
      {(!Array.isArray(bins) || bins.length === 0) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-4 pointer-events-none">
          <div className="text-5xl opacity-30">🏭</div>
          <div className="text-center">
            <p className="text-slate-300 font-bold text-sm">
              No warehouse layout data available.
            </p>
            <p className="text-slate-500 text-xs mt-1 font-medium">
              Create warehouse structure first: Warehouses → Zones → Racks → Bins.
            </p>
          </div>
          <div className="text-[10px] text-slate-600 font-mono bg-slate-900/60 border border-slate-700 px-3 py-1.5 rounded-lg">
            Admin → Bins → Add Bin to get started
          </div>
        </div>
      )}

      {/* Help Overlay HUD — only shown when bins exist */}
      {Array.isArray(bins) && bins.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/80 border border-slate-700/60 backdrop-blur-xs text-[10px] text-slate-300 font-bold p-3 rounded-lg flex flex-col gap-1.5 select-none pointer-events-none">
          <div>🖱️ Left-Click + Drag : Orbit Camera</div>
          <div>🖱️ Right-Click + Drag : Pan Camera</div>
          <div>🖱️ Scroll Wheel : Zoom Camera</div>
          <div className="text-yellow-400 font-bold mt-1">🏷️ Click any bin block to load telemetry details</div>
        </div>
      )}
    </div>
  );
}

export default React.memo(WarehouseScene, (prevProps, nextProps) => {
  return (
    prevProps.selectedBinCode === nextProps.selectedBinCode &&
    prevProps.zones === nextProps.zones &&
    prevProps.bins === nextProps.bins &&
    prevProps.inventory === nextProps.inventory &&
    prevProps.onBinClick === nextProps.onBinClick
  );
});
