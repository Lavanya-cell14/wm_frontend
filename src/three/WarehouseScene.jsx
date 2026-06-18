import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
    zones.forEach((zone, idx) => {
      // Find zone coordinates and size
      const zX = zone.x !== undefined ? zone.x : (idx * 25 - 37.5);
      const zZ = zone.z !== undefined ? zone.z : 0;
      const zWidth = zone.width || 22;
      const zDepth = zone.depth || 18;
      const zHeight = 0.2; // Flat border pads

      // Colors for Zones
      const zoneColorMap = {
        'Zone A': '#0071C1', // Blue
        'Zone B': '#a855f7', // Purple
        'Zone C': '#f97316', // Orange
        'Zone D': '#10b981', // Green
      };
      const zColor = zoneColorMap[zone.name] || '#64748b';

      // Draw Zone floor area plate
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

      // Draw simple wire outline for the zone
      const edges = new THREE.EdgesGeometry(zoneGeo);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: zColor, linewidth: 2 }));
      line.position.copy(zoneMesh.position);
      scene.add(line);

      // Text sprite tag for Zone label (rendered dynamically in 3D)
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = zColor;
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillText(zone.name, 10, 40);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(zX + zWidth / 2, 4, zZ + zDepth / 2);
      sprite.scale.set(8, 4, 1);
      scene.add(sprite);
    });

    // 7. Draw Racks and Shelves (derived from bins grouping)
    // To represent realistic wire shelves, we group bins by their combination of zone and rack name
    const shelfGroupings = {};

    bins.forEach(bin => {
      // Standardize values
      const bX = bin.x || 0;
      const bY = bin.y || 1;
      const bZ = bin.z || 0;
      
      // Determine occupancy status
      const item = inventory.find(i => i.bin === bin.code);
      const capRatio = bin.maxCapacity > 0 ? (bin.currentCapacity / bin.maxCapacity) : 0;
      let statusKey = 'occupied';
      if (bin.currentCapacity === 0 || !item) {
        statusKey = 'empty';
      } else if (capRatio > 0.8 || bin.status === 'FULL') {
        statusKey = 'full';
      }

      // Draw Bin Cube
      // Width/Depth dimensions fit inside racks
      const binWidth = 1.6;
      const binHeight = 0.9;
      const binDepth = 1.4;

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

    // 9. Click Handler Raycaster with drag prevention
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
      {/* Help Overlay HUD */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/80 border border-slate-700/60 backdrop-blur-xs text-[10px] text-slate-300 font-bold p-3 rounded-lg flex flex-col gap-1.5 select-none pointer-events-none">
        <div>🖱️ Left-Click + Drag : Orbit Camera</div>
        <div>🖱️ Right-Click + Drag : Pan Camera</div>
        <div>🖱️ Scroll Wheel : Zoom Camera</div>
        <div className="text-yellow-400 font-bold mt-1">🏷️ Click any bin block to load telemetry details</div>
      </div>
    </div>
  );
}
