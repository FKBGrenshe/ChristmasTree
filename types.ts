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

export interface AppState {
  mode: TreeState;
  setMode: (mode: TreeState) => void;
  
  // Photo System
  uploadedPhotos: string[];
  selectedPhoto: string | null; // The photo currently being viewed in full screen
  addPhotos: (urls: string[]) => void;
  setSelectedPhoto: (url: string | null) => void;
}