import { create } from 'zustand';
import { TreeState, AppState } from './types';

// Default photos - You can replace these URLs with your own hosted images
// Or simply use the Upload button in the app to add local files.
const DEFAULT_PHOTOS = [
    'https://images.unsplash.com/photo-1543589077-47d81606c1bf?q=80&w=600&auto=format&fit=crop', // Couple/Love vibe
    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop', // Christmas cat
    'https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=600&auto=format&fit=crop', // Snow landscape
    'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?q=80&w=600&auto=format&fit=crop', // Gift
];

export const useStore = create<AppState>((set) => ({
  mode: TreeState.FORMED,
  setMode: (mode) => set({ mode }),
  
  uploadedPhotos: DEFAULT_PHOTOS,
  selectedPhoto: null,

  addPhotos: (urls) => set((state) => ({ 
    uploadedPhotos: [...urls, ...state.uploadedPhotos] // New photos first
  })),
  
  setSelectedPhoto: (url) => set({ selectedPhoto: url }),
}));