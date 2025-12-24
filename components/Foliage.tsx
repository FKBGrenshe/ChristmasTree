import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getChaosPosition, getTreePosition } from '../utils/geometry';
import { useStore } from '../store';
import { TreeState } from '../types';

const COUNT = 15000;

const vertexShader = `
  uniform float uProgress;
  uniform float uTime;
  attribute vec3 aTargetPosition;
  attribute float aRandomScale;
  
  varying vec3 vColor;
  
  // Simplex noise function (simplified)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) { 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i); 
    vec4 p = permute( permute( permute( 
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vec3 pos = mix(position, aTargetPosition, uProgress);
    
    // Add some "breathing" noise when in formed state
    float noiseVal = snoise(pos * 0.5 + uTime * 0.5);
    vec3 breath = pos * (1.0 + noiseVal * 0.02 * uProgress);
    
    vec4 mvPosition = modelViewMatrix * vec4(breath, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = (4.0 * aRandomScale + 2.0) * (30.0 / -mvPosition.z);
    
    // Color mixing: Chaos (Gold/Red hints) -> Formed (Emerald Green/Gold)
    vec3 emerald = vec3(0.01, 0.2, 0.05);
    vec3 gold = vec3(0.8, 0.6, 0.1);
    
    // Sparkle effect
    float sparkle = abs(sin(uTime * 2.0 + aRandomScale * 10.0));
    vec3 baseColor = mix(gold, emerald, uProgress * 0.8 + 0.2); // Mostly gold in chaos, green in tree
    
    vColor = baseColor + vec3(sparkle * 0.2 * uProgress); 
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  
  void main() {
    // Circular particle
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    // Soft edge
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);
    
    gl_FragColor = vec4(vColor, glow);
  }
`;

export const Foliage: React.FC = () => {
  const mode = useStore((s) => s.mode);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  // Data Generation
  const { positions, targetPositions, scales } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const target = new Float32Array(COUNT * 3);
    const sc = new Float32Array(COUNT);
    
    for (let i = 0; i < COUNT; i++) {
      const chaos = getChaosPosition();
      const formed = getTreePosition();
      
      pos[i * 3] = chaos.x;
      pos[i * 3 + 1] = chaos.y;
      pos[i * 3 + 2] = chaos.z;
      
      target[i * 3] = formed.x;
      target[i * 3 + 1] = formed.y;
      target[i * 3 + 2] = formed.z;
      
      sc[i] = Math.random();
    }
    
    return { positions: pos, targetPositions: target, scales: sc };
  }, []);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      
      const targetProgress = mode === TreeState.FORMED ? 1.0 : 0.0;
      // Lerp the uniform
      shaderRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        shaderRef.current.uniforms.uProgress.value,
        targetProgress,
        0.02
      );
    }
  });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 }
  }), []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTargetPosition"
          count={targetPositions.length / 3}
          array={targetPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandomScale"
          count={scales.length}
          array={scales}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
      />
    </points>
  );
};
