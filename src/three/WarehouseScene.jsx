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

export default function WarehouseScene({ 
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
  
  // Keep refs of interactive meshes for click detection and highlighting
  const binMeshesRef = useRef([]);
  const pulseGroupRef = useRef([]);

  useEffect(() => {
    if (!mountRef.current) return;

    // ── Guard: render empty-state if no bins provided ────────────────────────
    if (!Array.isArray(bins) || bins.length === 0) return;
    // ─────────────────────────────────────────────────────────────────────────
    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b1329'); // Sleek dark slate blue
    sceneRef.current = scene;

    // Add fog for visual depth
    scene.fog = new THREE.FogExp2('#0b1329', 0.007);

    // 2. Camera setup
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 450;
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(50, 45, 90); // Initial elevated view
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below floor
    controls.minDistance = 10;
    controls.maxDistance = 200;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.35);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 0.85);
    dirLight.position.set(40, 100, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 200;
    const d = 80;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(200, 50, '#1e293b', '#0f172a');
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Concrete floor plane
    const floorGeo = new THREE.PlaneGeometry(300, 300);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: '#070b19', 
      roughness: 0.8, 
      metalness: 0.2 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // ── Precompute deterministic positions for all bins ──────────────────────
    // A bin from Django has x/y/z = 0 when no spatial coords were set.
    // We treat x===0 AND y===0 AND z===0 as "no coords" (same as null)
    // to force the deterministic layout engine instead of stacking everything
    // at the world origin.
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

    // Zone bounding info (computed from auto-placed bins)
    const autoZoneBounds = buildZoneBounds(binsNeedingAutoLayout, autoPositions);

    // Bins & Racks rendering lists
    const binMeshes = [];
    const pulsingObjects = [];

    // Helper map of bin status colors
    const colors = {
      empty: '#334155',      // Slate-700
      occupied: '#10b981',   // Emerald-500
      full: '#ef4444',       // Red-500
      highlight: '#fbbf24',  // Amber-400 (glowing/pulse)
    };

    // 6. Draw Zones Bounding boxes
    // Use zone name as lookup key to match auto-positioned bins
    const zoneColorMap = {
      'Zone A': '#0071C1',
      'Zone B': '#a855f7',
      'Zone C': '#f97316',
      'Zone D': '#10b981',
    };
    const PAD = 2.0; // extra padding around bin bounds for zone plate

    // Collect all unique zone names from either zones API data or from bins
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
        // Use API-provided coordinates if available
        zX = apiZone.x;
        zZ = apiZone.z;
        zWidth = apiZone.width || 22;
        zDepth = apiZone.depth || 18;
      } else if (bounds) {
        // Derive from computed bin positions with padding
        zX = bounds.minX - PAD;
        zZ = bounds.minZ - PAD;
        zWidth = (bounds.maxX - bounds.minX) + PAD * 2 + BIN_W;
        zDepth = (bounds.maxZ - bounds.minZ) + PAD * 2 + BIN_D;
      } else {
        // Fallback: evenly spaced strip
        zX = idx * 29;
        zZ = 0;
        zWidth = 22;
        zDepth = 18;
      }

      const zoneGeo = new THREE.BoxGeometry(zWidth, zHeight, zDepth);
      const zoneMat = new THREE.MeshStandardMaterial({
        color: zColor,
        roughness: 0.5,
        transparent: true,
        opacity: 0.15,
      });
      const zoneMesh = new THREE.Mesh(zoneGeo, zoneMat);
      zoneMesh.position.set(zX + zWidth / 2, 0.05, zZ + zDepth / 2);
      scene.add(zoneMesh);

      const edges = new THREE.EdgesGeometry(zoneGeo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: zColor, linewidth: 2 })
      );
      line.position.copy(zoneMesh.position);
      scene.add(line);

      // Zone label sprite
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = zColor;
      ctx.font = 'bold 26px Inter, sans-serif';
      ctx.fillText(zoneName, 10, 42);
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(zX + zWidth / 2, 5, zZ + zDepth / 2);
      sprite.scale.set(10, 4, 1);
      scene.add(sprite);
    });

    // 7. Draw Racks and Shelves (derived from bins grouping)
    // Group bins by zone+rack+shelf to draw shelf support beams
    const shelfGroupings = {};

    bins.forEach(bin => {
      // Use deterministic or API-provided position
      const [bX, bY, bZ] = getBinPosition(bin);
      
      // Determine occupancy status
      const item = inventory.find(i => i.bin === bin.code);
      const capRatio = bin.maxCapacity > 0 ? (bin.currentCapacity / bin.maxCapacity) : 0;
      let statusKey = 'occupied';
      if (bin.currentCapacity === 0 || !item) {
        statusKey = 'empty';
      } else if (capRatio > 0.8 || bin.status === 'FULL') {
        statusKey = 'full';
      }

      const binWidth = BIN_W;
      const binHeight = BIN_H;
      const binDepth = BIN_D;

      const binGeo = new THREE.BoxGeometry(binWidth, binHeight, binDepth);
      const binMat = new THREE.MeshStandardMaterial({
        color: colors[statusKey],
        roughness: 0.6,
        metalness: 0.1,
      });

      // Special highlight or glowing border for selected bin
      const isSelected = selectedBinCode === bin.code;
      if (isSelected) {
        binMat.color.set(colors.highlight);
        binMat.emissive.set(colors.highlight);
        binMat.emissiveIntensity = 0.45;
      }

      const binMesh = new THREE.Mesh(binGeo, binMat);
      binMesh.position.set(bX, bY, bZ);
      binMesh.castShadow = true;
      binMesh.receiveShadow = true;
      
      // Save reference to custom property for raycasting click handlers
      binMesh.userData = { binCode: bin.code };
      
      scene.add(binMesh);
      binMeshes.push(binMesh);

      if (isSelected) {
        pulsingObjects.push(binMesh);
      }

      // Track shelf positions to draw support beams
      const shelfKey = `${bin.zone}-${bin.shelf}`;
      if (!shelfGroupings[shelfKey]) {
        shelfGroupings[shelfKey] = [];
      }
      shelfGroupings[shelfKey].push(new THREE.Vector3(bX, bY - binHeight / 2 - 0.05, bZ));
    });

    // Save interactive bin meshes references
    binMeshesRef.current = binMeshes;
    pulseGroupRef.current = pulsingObjects;

    // 8. Draw shelf beams under groups of bins
    Object.keys(shelfGroupings).forEach(key => {
      const positions = shelfGroupings[key];
      if (positions.length === 0) return;

      // Find bounds of bins in this row to draw a shelf beam
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

      // Flat support tray
      const supportGeo = new THREE.BoxGeometry(shelfW, 0.1, shelfD);
      const supportMat = new THREE.MeshStandardMaterial({ 
        color: '#475569', 
        metalness: 0.8, 
        roughness: 0.3 
      });
      const supportMesh = new THREE.Mesh(supportGeo, supportMat);
      supportMesh.position.set((minX + maxX) / 2, levelY, (minZ + maxZ) / 2);
      scene.add(supportMesh);

      // Draw metallic support pillars at the 4 corners of each rack column
      const corners = [
        { x: minX - pad, z: minZ - pad },
        { x: minX - pad, z: maxZ + pad },
        { x: maxX + pad, z: minZ - pad },
        { x: maxX + pad, z: maxZ + pad },
      ];

      corners.forEach(corner => {
        // Draw vertical columns from floor up to maximum shelf level + a bit extra
        const columnGeo = new THREE.CylinderGeometry(0.12, 0.12, 10, 8);
        const columnMat = new THREE.MeshStandardMaterial({ 
          color: '#64748b', 
          metalness: 0.9, 
          roughness: 0.2 
        });
        const column = new THREE.Mesh(columnGeo, columnMat);
        column.position.set(corner.x, 5, corner.z);
        column.castShadow = true;
        scene.add(column);
      });
    });

    // 9. Auto-center camera on all placed bins
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
      // Position camera at 45° elevation, offset back from centroid by spread amount
      camera.position.set(centX + spread * 0.8, spread * 0.7, centZ + spread * 1.2);
      controls.target.set(centX, 1.5, centZ);
      controls.update();
    }

    // 10. Click Handler Raycaster with drag prevention
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerStartX = 0;
    let pointerStartY = 0;

    const handlePointerDown = (event) => {
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
    };

    const handlePointerUp = (event) => {
      if (!onBinClick) return;

      // Avoid triggering click during camera orbit/pan drag operations
      const deltaX = Math.abs(event.clientX - pointerStartX);
      const deltaY = Math.abs(event.clientY - pointerStartY);
      if (deltaX > 6 || deltaY > 6) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(binMeshes);

      if (intersects.length > 0) {
        const selectedMesh = intersects[0].object;
        const clickedCode = selectedMesh.userData.binCode;
        onBinClick(clickedCode);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    // 10. Animation Loop
    let clock = new THREE.Clock();
    let animFrameId;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      
      const elapsed = clock.getElapsedTime();

      // Make the selected bin pulse visually
      pulseGroupRef.current.forEach(mesh => {
        const pulse = 1.0 + Math.sin(elapsed * 5.0) * 0.1;
        mesh.scale.set(pulse, pulse, pulse);
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 11. Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
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
      // Dispose materials & geometries
      binMeshes.forEach(mesh => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          mesh.material.dispose();
        }
      });
      gridHelper.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      renderer.dispose();
    };

  }, [zones, bins, selectedBinCode]); // Rebuild on layout, bins, or selection updates

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
