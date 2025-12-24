import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getChaosPosition, getOrnamentTreePosition } from '../utils/geometry';
import { useStore } from '../store';
import { TreeState } from '../types';

const BALL_COUNT = 150;
const BOX_COUNT = 50;

// Reusable dummy for matrix updates
const dummy = new THREE.Object3D();

export const Ornaments: React.FC = () => {
  const mode = useStore((s) => s.mode);
  
  // -- Balls (Ornaments) --
  const ballMeshRef = useRef<THREE.InstancedMesh>(null);
  const ballData = useMemo(() => {
    return new Array(BALL_COUNT).fill(0).map((_, i) => ({
      chaos: getChaosPosition(),
      target: getOrnamentTreePosition(i, BALL_COUNT),
      scale: 0.3 + Math.random() * 0.3,
      speed: 0.02 + Math.random() * 0.03, // Faster
      color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.1, 0.8, 0.5) // Golds
    }));
  }, []);

  // -- Boxes (Gifts) --
  const boxMeshRef = useRef<THREE.InstancedMesh>(null);
  const boxData = useMemo(() => {
    return new Array(BOX_COUNT).fill(0).map((_, i) => ({
      chaos: getChaosPosition(),
      // Place gifts at the bottom of the tree
      target: new THREE.Vector3(
        (Math.random() - 0.5) * 8, 
        -9 + Math.random() * 2, 
        (Math.random() - 0.5) * 8
      ),
      scale: 0.8 + Math.random() * 0.6,
      speed: 0.01 + Math.random() * 0.01, // Slower (Heavy)
      rotation: new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, 0),
      color: new THREE.Color().setHex(Math.random() > 0.5 ? 0x8b0000 : 0x013220) // Red or Green
    }));
  }, []);

  useLayoutEffect(() => {
    if (ballMeshRef.current) {
        ballData.forEach((d, i) => {
            ballMeshRef.current!.setColorAt(i, d.color);
        });
        ballMeshRef.current.instanceColor!.needsUpdate = true;
    }
    if (boxMeshRef.current) {
        boxData.forEach((d, i) => {
            boxMeshRef.current!.setColorAt(i, d.color);
        });
        boxMeshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [ballData, boxData]);

  // Current animation progress for each instance (0 = Chaos, 1 = Formed)
  const [progresses] = useState(() => new Float32Array(BALL_COUNT + BOX_COUNT).fill(0));

  useFrame((state, delta) => {
    const targetP = mode === TreeState.FORMED ? 1 : 0;
    
    // Update Balls
    if (ballMeshRef.current) {
      ballData.forEach((data, i) => {
        // Individual lerp for staggering effect
        progresses[i] = THREE.MathUtils.lerp(progresses[i], targetP, data.speed);
        
        const currentPos = new THREE.Vector3().lerpVectors(data.chaos, data.target, progresses[i]);
        
        // Add subtle hover in formed state
        if (progresses[i] > 0.9) {
          currentPos.y += Math.sin(state.clock.elapsedTime * 2 + i) * 0.1;
        }

        dummy.position.copy(currentPos);
        dummy.scale.setScalar(data.scale);
        dummy.updateMatrix();
        ballMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      ballMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update Boxes
    if (boxMeshRef.current) {
      boxData.forEach((data, i) => {
        const pIdx = BALL_COUNT + i;
        progresses[pIdx] = THREE.MathUtils.lerp(progresses[pIdx], targetP, data.speed);
        
        const currentPos = new THREE.Vector3().lerpVectors(data.chaos, data.target, progresses[pIdx]);
        
        dummy.position.copy(currentPos);
        dummy.rotation.setFromVector3(data.rotation);
        dummy.scale.setScalar(data.scale);
        dummy.updateMatrix();
        boxMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      boxMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh ref={ballMeshRef} args={[undefined, undefined, BALL_COUNT]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
            roughness={0.1} 
            metalness={0.9} 
            emissive="#443300"
            emissiveIntensity={0.2}
        />
      </instancedMesh>

      <instancedMesh ref={boxMeshRef} args={[undefined, undefined, BOX_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            roughness={0.3} 
            metalness={0.5}
        />
      </instancedMesh>
    </group>
  );
};
