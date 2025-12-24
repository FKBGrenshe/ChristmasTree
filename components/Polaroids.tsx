import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getChaosPosition } from '../utils/geometry';
import { useStore } from '../store';
import { TreeState } from '../types';

const FRAME_COUNT = 12;

export const Polaroids: React.FC = () => {
  const { mode, uploadedPhotos, currentPhotoIndex } = useStore();
  
  // Create fixed slots for polaroids
  const items = useMemo(() => {
    return new Array(FRAME_COUNT).fill(0).map((_, i) => {
      const angle = (i / FRAME_COUNT) * Math.PI * 2;
      const radius = 4.5;
      const y = (i / FRAME_COUNT) * 12 - 6;
      
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
        // Cycle through uploaded photos
        const photoUrl = uploadedPhotos[i % uploadedPhotos.length];
        
        // Determine if this is the "Hero" photo (the one currently selected)
        // We map the global currentPhotoIndex (which can grow infinitely) to our frame slots
        // But the store index logic matches the photos array length.
        // We need to match the specific frame to the specific photo index.
        // Simplified: The Frame 'i' displays photo 'i % photos.length'. 
        // If 'currentPhotoIndex' matches 'i % photos.length', this frame is active.
        const photoIndexForThisFrame = i % uploadedPhotos.length;
        const isHero = photoIndexForThisFrame === currentPhotoIndex;

        return (
          <PolaroidItem 
            key={i} 
            data={data} 
            mode={mode} 
            url={photoUrl} 
            isHero={isHero}
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
  isHero: boolean;
}

const PolaroidItem: React.FC<PolaroidItemProps> = ({ data, mode, url, isHero }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Manually load texture to handle dynamic URLs gracefully without hook rules issues
  useEffect(() => {
    new THREE.TextureLoader().load(url, (loadedTex) => {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        setTexture(loadedTex);
    });
  }, [url]);
  
  // Local progress state for smooth animation
  const progress = useRef(0);
  const heroProgress = useRef(0);

  useFrame((state, delta) => {
    const isFormed = mode === TreeState.FORMED;
    const targetP = isFormed ? 1 : 0;
    const targetHeroP = (!isFormed && isHero) ? 1 : 0;
    
    // Smooth transitions
    progress.current = THREE.MathUtils.lerp(progress.current, targetP, delta * 2);
    heroProgress.current = THREE.MathUtils.lerp(heroProgress.current, targetHeroP, delta * 3);

    if (meshRef.current) {
      // 1. Calculate Base Position (Chaos vs Formed)
      let currentPos = new THREE.Vector3().lerpVectors(data.chaos, data.target, progress.current);
      let currentScale = 1.0;
      let currentRot = new THREE.Euler().copy(data.rotation);

      // 2. Apply Hero Overrides (When unleashed and selected)
      if (heroProgress.current > 0.01) {
        // Hero Position: Front and Center relative to camera default
        const heroPos = new THREE.Vector3(0, 1, 14); 
        const heroScale = 2.5; 
        
        currentPos.lerp(heroPos, heroProgress.current);
        currentScale = THREE.MathUtils.lerp(1.0, heroScale, heroProgress.current);
        
        // Face the camera perfectly when Hero
        // We know camera is at roughly [0, 4, 20] looking at [0,0,0]
        // But we can just zero out rotation to face Z
        const targetRot = new THREE.Euler(0, 0, 0); 
        
        // Manual Euler lerp (simplified)
        currentRot.x = THREE.MathUtils.lerp(currentRot.x, targetRot.x, heroProgress.current);
        currentRot.y = THREE.MathUtils.lerp(currentRot.y, targetRot.y, heroProgress.current);
        currentRot.z = THREE.MathUtils.lerp(currentRot.z, targetRot.z, heroProgress.current);
      }

      meshRef.current.position.copy(currentPos);
      meshRef.current.scale.setScalar(currentScale);
      
      // Rotation handling
      if (progress.current > 0.8 && !isHero) {
         // Formed state: Locked rotation facing out
         meshRef.current.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
         meshRef.current.lookAt(0, currentPos.y, 0);
         meshRef.current.rotateY(Math.PI); 
      } else if (heroProgress.current > 0.5) {
         // Hero state: Face camera (handled above roughly, refine here)
         meshRef.current.rotation.set(0, 0, Math.sin(state.clock.elapsedTime) * 0.05); // Slight wobble
      } else {
         // Chaos state (Background): Tumbling
         meshRef.current.rotation.x += 0.01;
         meshRef.current.rotation.y += 0.01;
      }
    }
  });

  return (
    <group ref={meshRef}>
        {/* Frame */}
        <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[1.2, 1.5, 0.05]} />
            <meshStandardMaterial color="#fff" roughness={0.8} />
        </mesh>
        {/* Photo */}
        <mesh position={[0, 0.15, 0.04]}>
            <planeGeometry args={[1, 1]} />
            {texture ? (
                <meshBasicMaterial map={texture} />
            ) : (
                <meshBasicMaterial color="#eee" />
            )}
        </mesh>
    </group>
  );
};