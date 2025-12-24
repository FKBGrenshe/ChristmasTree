import { Vector3, Color } from 'three';

// Constants for Tree Shape
const TREE_HEIGHT = 18;
const TREE_RADIUS_BASE = 6;
const CHAOS_RADIUS = 25;

/**
 * Generates a random point inside a sphere
 */
export const getChaosPosition = (): Vector3 => {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos((Math.random() * 2) - 1);
  const r = Math.cbrt(Math.random()) * CHAOS_RADIUS;
  
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  
  return new Vector3(x, y, z);
};

/**
 * Generates a point on a cone surface (The Tree)
 */
export const getTreePosition = (yOverride?: number): Vector3 => {
  // Height from -height/2 to height/2
  const normalizedY = Math.random(); // 0 to 1
  const y = (normalizedY * TREE_HEIGHT) - (TREE_HEIGHT / 2);
  
  // Radius decreases as we go up
  const r = (1 - normalizedY) * TREE_RADIUS_BASE;
  
  const angle = Math.random() * Math.PI * 2;
  
  // Add slight noise to make it look like foliage depth
  const rVariation = r + (Math.random() - 0.5) * 1.5;
  
  const x = Math.cos(angle) * rVariation;
  const z = Math.sin(angle) * rVariation;
  
  return new Vector3(x, y, z);
};

/**
 * Generate spiral placement for ornaments
 */
export const getOrnamentTreePosition = (index: number, total: number): Vector3 => {
  const progress = index / total;
  const y = (progress * TREE_HEIGHT) - (TREE_HEIGHT / 2);
  const r = (1 - progress) * (TREE_RADIUS_BASE * 0.9); // Slightly inside
  
  // Golden angle for nice distribution
  const angle = index * 2.4; 
  
  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;
  
  return new Vector3(x, y, z);
};
