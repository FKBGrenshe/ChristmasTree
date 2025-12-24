import { Vector3 } from 'three';

export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED',
}

export interface DualPosition {
  chaos: Vector3;
  target: Vector3;
  scale?: number;
  rotation?: Vector3;
  color?: string;
  speed?: number;
}

export interface HandGestureData {
  isOpen: boolean; // True = Unleash (Chaos), False = Formed
  handPosition: { x: number; y: number }; // Normalized -1 to 1
  isDetected: boolean;
}

export interface AppState {
  mode: TreeState;
  setMode: (mode: TreeState) => void;
  
  cameraOffset: { x: number; y: number };
  setCameraOffset: (x: number, y: number) => void;
  
  isCameraEnabled: boolean;
  setCameraEnabled: (enabled: boolean) => void;

  // Photo System
  uploadedPhotos: string[];
  currentPhotoIndex: number;
  addPhotos: (urls: string[]) => void;
  cyclePhoto: (direction: 1 | -1) => void;
}