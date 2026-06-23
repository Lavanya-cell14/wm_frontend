import React, { useState } from 'react';

export default function BinMesh({
  bin,
  position,
  size = [1.2, 0.8, 1.2],
  color,
  isHighlighted = false,
  onClick
}) {
  const [hovered, setHovered] = useState(false);

  // Determine standard color vs hovered vs highlighted
  const baseColor = color;
  const hoverScale = hovered ? 1.08 : 1.0;
  
  return (
    <group>
      <mesh
        position={position}
        scale={[hoverScale, hoverScale, hoverScale]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick(bin);
        }}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={hovered ? '#60A5FA' : baseColor}
          roughness={0.2}
          metalness={0.1}
          transparent={true}
          opacity={bin.status === 'Empty' ? 0.4 : 0.85}
        />
      </mesh>

      {/* Sci-fi selection ring/bounding box highlight for target bins */}
      {isHighlighted && (
        <mesh position={position}>
          <boxGeometry args={[size[0] + 0.15, size[1] + 0.15, size[2] + 0.15]} />
          <meshBasicMaterial
            color="#10B981"
            wireframe={true}
            transparent={true}
            opacity={0.8}
          />
        </mesh>
      )}

      {/* Subtle black border outlines around occupied/reserved bins for structural clarity */}
      {bin.status !== 'Empty' && (
        <mesh position={position}>
          <boxGeometry args={size} />
          <meshBasicMaterial
            color="#1E293B"
            wireframe={true}
            transparent={true}
            opacity={0.2}
          />
        </mesh>
      )}
    </group>
  );
}
