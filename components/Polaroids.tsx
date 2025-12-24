import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image } from '@react-three/drei';
import * as THREE from 'three';
import { getChaosPosition } from '../utils/geometry';
import { useStore } from '../store';
import { TreeState } from '../types';

const FRAME_COUNT = 16; 

export const Polaroids: React.FC = () => {
  const { mode, uploadedPhotos, setSelectedPhoto } = useStore();
  
  // Create fixed slots for polaroids
  const items = useMemo(() => {
    return new Array(FRAME_COUNT).fill(0).map((_, i) => {
      const angle = (i / FRAME_COUNT) * Math.PI * 2;
      const radius = 5.0; // Slightly wider than tree
      const y = (i / FRAME_COUNT) * 14 - 7;
      
      return {
        id: i,
        chaos: getChaosPosition(),
        // Spiraling around the tree
        target: new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius),
        rotation: new THREE.Euler(0, -angle, Math.random() * 0.2 - 0.1),
      };
    });
  }, []);

  return (
    <group>
      {items.map((data, i) => {
        const photoUrl = uploadedPhotos[i % uploadedPhotos.length];
        return (
          <PolaroidItem 
            key={i} 
            data={data} 
            mode={mode} 
            url={photoUrl} 
            onClick={() => setSelectedPhoto(photoUrl)}
          />
        );
      })}
    </group>
  );
};

interface PolaroidItemProps {
  data: { chaos: THREE.Vector3; target: THREE.Vector3; rotation: THREE.Euler };
  mode: TreeState;
  url: string;
  onClick: () => void;
}

const PolaroidItem: React.FC<PolaroidItemProps> = ({ data, mode, url, onClick }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);
  
  const progress = useRef(0);

  useFrame((state, delta) => {
    const isFormed = mode === TreeState.FORMED;
    const targetP = isFormed ? 1 : 0;
    
    // Smooth transitions
    progress.current = THREE.MathUtils.lerp(progress.current, targetP, delta * 2);

    if (meshRef.current) {
      let currentPos = new THREE.Vector3().lerpVectors(data.chaos, data.target, progress.current);
      
      // Hover effect scale
      const targetScale = hovered ? 1.5 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

      meshRef.current.position.copy(currentPos);
      
      // Rotation logic
      if (progress.current > 0.8) {
         // Formed: Face outward
         meshRef.current.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
         meshRef.current.lookAt(0, currentPos.y, 0);
         meshRef.current.rotateY(Math.PI); 
      } else {
         // Chaos: Tumble slowly
         meshRef.current.rotation.x += 0.005;
         meshRef.current.rotation.y += 0.005;
      }
    }
  });

  return (
    <group 
        ref={meshRef} 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(true); }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false); }}
    >
        {/* Frame (Gold border when hovered) */}
        <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[1.2, 1.5, 0.05]} />
            <meshStandardMaterial 
                color={hovered ? "#FFD700" : "#fff"} 
                roughness={0.8} 
                metalness={hovered ? 0.8 : 0.0}
            />
        </mesh>
        
        {/* Photo using Drei Image for better loading/CORS handling */}
        <Image 
          url={url}
          position={[0, 0.15, 0.06]}
          scale={[1, 1]}
          transparent
          toneMapped={false} // Keep photos bright
        />
    </group>
  );
};