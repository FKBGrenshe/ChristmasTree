import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';
import { useStore } from '../store';

export const CameraRig: React.FC = () => {
  const { cameraOffset } = useStore();
  const vec = new Vector3();

  useFrame((state) => {
    // Base position
    const baseX = 0;
    const baseY = 4;
    const baseZ = 20;

    // Apply offset with lerp for smoothness
    const targetX = baseX + cameraOffset.x;
    const targetY = baseY + cameraOffset.y;
    
    state.camera.position.lerp(vec.set(targetX, targetY, baseZ), 0.05);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
};
