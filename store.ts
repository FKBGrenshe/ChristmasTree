import { create } from 'zustand';
import { TreeState, AppState } from './types';

// Default luxury placeholder images
const DEFAULT_PHOTOS = [
    'https://picsum.photos/id/1011/400/400', // landscape
    'https://picsum.photos/id/1015/400/400', // river
    'https://picsum.photos/id/1016/400/400', // canyon
    'https://picsum.photos/id/1025/400/400', // pug
];

export const useStore = create<AppState>((set) => ({
  mode: TreeState.FORMED,
  setMode: (mode) => set({ mode }),
  
  cameraOffset: { x: 0, y: 0 },
  setCameraOffset: (x, y) => set({ cameraOffset: { x, y } }),
  
  isCameraEnabled: false,
  setCameraEnabled: (enabled) => set({ isCameraEnabled: enabled }),

  uploadedPhotos: DEFAULT_PHOTOS,
  currentPhotoIndex: 0,
  addPhotos: (urls) => set((state) => ({ 
    uploadedPhotos: [...urls, ...state.uploadedPhotos] // New photos first
  })),
  cyclePhoto: (direction) => set((state) => {
    const total = state.uploadedPhotos.length;
    // Modulo arithmetic that handles negative numbers correctly
    const nextIndex = (state.currentPhotoIndex + direction + total) % total;
    return { currentPhotoIndex: nextIndex };
  }),
}));