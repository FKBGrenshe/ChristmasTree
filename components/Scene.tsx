import React from 'react';
import { Environment, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { Polaroids } from './Polaroids';
import { CameraRig } from './CameraRig';

export const Scene: React.FC = () => {
  return (
    <>
      <CameraRig />
      
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} color="#001100" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2} 
        color="#fff" 
        castShadow 
      />
      <pointLight position={[-10, 5, 10]} intensity={1} color="#FFD700" />
      
      {/* Environment for reflections */}
      <Environment preset="lobby" />

      {/* 3D Elements */}
      <Foliage />
      <Ornaments />
      <Polaroids />

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.2} 
          radius={0.4}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
      </EffectComposer>
    </>
  );
};
