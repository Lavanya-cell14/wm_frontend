import React from 'react';

export default function RackMesh({
  rackId,
  rackName,
  numShelves,
  numBinsPerShelf,
  position, // [x, y, z] - center base position
  shelfHeightSpacing = 1.2,
  binWidthSpacing = 1.5,
  children
}) {
  const rackHeight = numShelves * shelfHeightSpacing;
  const rackDepth = numBinsPerShelf * binWidthSpacing;
  const rackWidth = 1.4; // standard rack width

  // Center coordinate of structural components relative to base
  const centerX = position[0];
  const centerY = position[1] + rackHeight / 2;
  const centerZ = position[2];

  // Helper to render vertical pillars at the 4 corners
  const pillarOffset = 0.05;
  const pillars = [
    [centerX - rackWidth / 2 + pillarOffset, centerZ - rackDepth / 2 + pillarOffset],
    [centerX + rackWidth / 2 - pillarOffset, centerZ - rackDepth / 2 + pillarOffset],
    [centerX - rackWidth / 2 + pillarOffset, centerZ + rackDepth / 2 - pillarOffset],
    [centerX + rackWidth / 2 - pillarOffset, centerZ + rackDepth / 2 - pillarOffset],
  ];

  // Helper to render horizontal support beams at each shelf level
  const shelfYLevels = Array.from({ length: numShelves }).map((_, idx) => (idx * shelfHeightSpacing) + 0.1);

  return (
    <group>
      {/* 4 Vertical Corner Pillars */}
      {pillars.map(([pX, pZ], idx) => (
        <mesh key={`pillar-${idx}`} position={[pX, centerY, pZ]}>
          <boxGeometry args={[0.1, rackHeight, 0.1]} />
          <meshStandardMaterial
            color="#64748B"
            roughness={0.4}
            metalness={0.8}
          />
        </mesh>
      ))}

      {/* Horizontal Support Rails along length (Z-axis) */}
      {shelfYLevels.map((shelfY, idx) => (
        <group key={`shelf-beams-${idx}`}>
          {/* Left Rail */}
          <mesh position={[centerX - rackWidth / 2 + pillarOffset, position[1] + shelfY, centerZ]}>
            <boxGeometry args={[0.05, 0.05, rackDepth]} />
            <meshStandardMaterial
              color="#475569"
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
          {/* Right Rail */}
          <mesh position={[centerX + rackWidth / 2 - pillarOffset, position[1] + shelfY, centerZ]}>
            <boxGeometry args={[0.05, 0.05, rackDepth]} />
            <meshStandardMaterial
              color="#475569"
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
        </group>
      ))}

      {/* Child meshes (actual bins in this rack) */}
      {children}
    </group>
  );
}
