import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { GestureController } from './components/GestureController';
import { useStore } from './store';
import { TreeState } from './types';

const App: React.FC = () => {
  const { mode, setMode, isCameraEnabled, setCameraEnabled, addPhotos } = useStore();
  const [showInstructions, setShowInstructions] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newPhotos: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            newPhotos.push(ev.target.result as string);
            // If we processed the last one, update store
            if (newPhotos.length === files.length) {
                addPhotos(newPhotos);
            }
          }
        };
        // Fix: Cast file to Blob to resolve 'unknown' type error
        reader.readAsDataURL(file as Blob);
      });
    }
  };

  return (
    <div className="w-full h-full relative bg-emerald-deep overflow-hidden">
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-8 z-10 flex justify-between items-start pointer-events-none">
        <div>
          <h1 className="font-serif text-4xl md:text-6xl text-gold-light drop-shadow-lg tracking-widest uppercase">
            The Grand Tree
          </h1>
          <p className="font-serif text-gold text-sm md:text-lg mt-2 tracking-widest opacity-80">
            Luxury. Interactive. Magnificent.
          </p>
        </div>
        
        <div className="pointer-events-auto flex flex-col gap-4 items-end">
           {/* Upload Button */}
           <input 
             type="file" 
             ref={fileInputRef} 
             multiple 
             accept="image/*" 
             className="hidden" 
             onChange={handleFileUpload}
           />
           <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 bg-gold/10 border border-gold text-gold font-serif tracking-widest uppercase hover:bg-gold hover:text-emerald-deep transition-all duration-300 backdrop-blur-sm"
          >
            + Upload Memories
          </button>

          <button 
            onClick={() => setCameraEnabled(!isCameraEnabled)}
            className={`px-6 py-2 border border-gold font-serif tracking-widest uppercase transition-all duration-500 ${
              isCameraEnabled ? 'bg-gold text-emerald-deep' : 'bg-transparent text-gold hover:bg-gold/10'
            }`}
          >
            {isCameraEnabled ? 'Disable Camera' : 'Enable Gesture Control'}
          </button>
        </div>
      </div>

      {/* Mode Toggles (Fallback if no camera) */}
      {!isCameraEnabled && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 flex gap-8 pointer-events-auto">
          <button
            onClick={() => setMode(TreeState.CHAOS)}
            className={`px-8 py-3 font-serif text-xl border border-gold uppercase tracking-widest transition-all duration-300 ${
              mode === TreeState.CHAOS ? 'bg-gold text-emerald-deep shadow-[0_0_20px_#D4AF37]' : 'text-gold bg-black/50 hover:bg-gold/20'
            }`}
          >
            Unleash Chaos
          </button>
          <button
            onClick={() => setMode(TreeState.FORMED)}
            className={`px-8 py-3 font-serif text-xl border border-gold uppercase tracking-widest transition-all duration-300 ${
              mode === TreeState.FORMED ? 'bg-gold text-emerald-deep shadow-[0_0_20px_#D4AF37]' : 'text-gold bg-black/50 hover:bg-gold/20'
            }`}
          >
            Form Tree
          </button>
        </div>
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="border-2 border-gold p-8 max-w-lg text-center bg-emerald-deep">
                <h2 className="text-3xl font-serif text-gold mb-4 uppercase">Instructions</h2>
                <p className="text-gold/80 mb-6 font-serif leading-relaxed text-sm">
                    Welcome to the Grand Interactive Christmas Experience.
                    <br/><br/>
                    1. <strong>Upload Memories:</strong> Add your own photos via the button.
                    <br/>
                    2. <strong>Enable Camera:</strong> Use hand gestures for magic.
                    <br/>
                    3. <strong>Open Hand 🖐:</strong> Explode the tree. Your photos will float.
                    <br/>
                    4. <strong>Swipe 🖐⬅➡:</strong> While hand is open, swipe Left/Right to browse your memories.
                    <br/>
                    5. <strong>Closed Hand ✊:</strong> Reform the tree.
                </p>
                <button 
                    onClick={() => setShowInstructions(false)}
                    className="px-6 py-2 bg-gold text-emerald-deep font-bold font-serif uppercase tracking-widest hover:bg-white transition-colors"
                >
                    Enter Experience
                </button>
            </div>
        </div>
      )}

      <GestureController />

      <Canvas
        camera={{ position: [0, 4, 20], fov: 45 }}
        gl={{ antialias: false, toneMappingExposure: 1.2 }}
        className="w-full h-full"
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default App;