import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { useStore } from './store';
import { TreeState } from './types';

const App: React.FC = () => {
  const { mode, setMode, addPhotos, selectedPhoto, setSelectedPhoto } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Compress image to save LocalStorage space
  const processFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension 800px to ensure we can store multiple photos without hitting quota
          const MAX_SIZE = 800; 
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG 0.7 quality
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const promises = Array.from(files).map((file) => processFile(file as File));
        const newPhotos = await Promise.all(promises);
        addPhotos(newPhotos);
        // Reset input to allow re-uploading same file if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error) {
        console.error("Image upload failed", error);
        alert("图片上传失败，可能是图片太大或格式不支持");
      }
    }
  };

  return (
    <div className="w-full h-full relative bg-emerald-deep overflow-hidden">
      
      {/* Main Title Overlay */}
      <div className={`absolute top-0 left-0 w-full p-8 z-10 flex flex-col justify-between items-center pointer-events-none transition-opacity duration-1000 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center">
          <h1 className="font-serif text-4xl md:text-6xl text-gold-light drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] tracking-widest uppercase">
            圣诞快乐，亲爱的
          </h1>
          <p className="font-serif text-gold text-sm md:text-lg mt-4 tracking-[0.2em] opacity-80">
            愿你的每一刻都如星光般璀璨
          </p>
        </div>
      </div>

      {/* Start Screen */}
      {!hasStarted && (
        <div className="absolute inset-0 z-50 bg-emerald-deep flex flex-col items-center justify-center p-4 transition-opacity duration-1000">
             <h1 className="font-serif text-5xl md:text-7xl text-gold mb-8 tracking-widest text-center animate-pulse">
                Merry Christmas
             </h1>
             <p className="text-gold/60 mb-12 font-serif text-center max-w-md leading-relaxed">
                这是为你准备的专属礼物。<br/>
                包含了我们珍贵的回忆，和对未来的期许。
             </p>
             <button 
                onClick={() => setHasStarted(true)}
                className="px-12 py-4 bg-transparent border-2 border-gold text-gold font-serif text-xl tracking-[0.3em] hover:bg-gold hover:text-emerald-deep transition-all duration-500 shadow-[0_0_20px_#D4AF37]"
             >
                开启惊喜
             </button>
        </div>
      )}

      {/* Controls */}
      {hasStarted && (
        <>
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 flex gap-6 pointer-events-auto">
              <button
                onClick={() => setMode(TreeState.CHAOS)}
                className={`px-6 py-2 md:px-8 md:py-3 font-serif text-lg border border-gold tracking-widest transition-all duration-500 rounded-sm ${
                  mode === TreeState.CHAOS 
                    ? 'bg-gold/90 text-emerald-deep shadow-[0_0_25px_#D4AF37] scale-105' 
                    : 'text-gold bg-black/40 hover:bg-gold/20 backdrop-blur-sm'
                }`}
              >
                ✨ 漫天星辰
              </button>
              <button
                onClick={() => setMode(TreeState.FORMED)}
                className={`px-6 py-2 md:px-8 md:py-3 font-serif text-lg border border-gold tracking-widest transition-all duration-500 rounded-sm ${
                  mode === TreeState.FORMED 
                    ? 'bg-gold/90 text-emerald-deep shadow-[0_0_25px_#D4AF37] scale-105' 
                    : 'text-gold bg-black/40 hover:bg-gold/20 backdrop-blur-sm'
                }`}
              >
                🎄 璀璨圣诞
              </button>
            </div>

            <div className="absolute top-8 right-8 z-20 pointer-events-auto">
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
                  className="px-4 py-2 text-xs border border-gold/50 text-gold/80 font-serif tracking-widest hover:bg-gold hover:text-emerald-deep transition-all duration-300"
                >
                  + 添加我们的回忆
                </button>
            </div>
            
            <div className="absolute bottom-4 right-8 z-10 pointer-events-none">
                <p className="text-gold/40 text-xs font-serif tracking-widest">
                    拖拽旋转 · 滚轮缩放 · 点击照片
                </p>
            </div>
        </>
      )}

      {/* Photo Overlay Modal */}
      {selectedPhoto && (
        <div 
            className="absolute inset-0 z-40 bg-black/90 flex items-center justify-center p-4 md:p-12 backdrop-blur-md cursor-pointer"
            onClick={() => setSelectedPhoto(null)}
        >
            <div className="relative max-w-full max-h-full p-2 border-2 border-gold bg-white shadow-[0_0_50px_#D4AF37] transform transition-transform duration-300 scale-100">
                 <img 
                    src={selectedPhoto} 
                    alt="Memory" 
                    className="max-h-[80vh] object-contain block"
                 />
                 <p className="text-emerald-deep font-serif text-center mt-2 tracking-widest text-sm uppercase">
                    美好瞬间
                 </p>
            </div>
            <p className="absolute bottom-8 text-gold/50 text-sm font-serif tracking-widest">
                点击任意处关闭
            </p>
        </div>
      )}

      <Canvas
        camera={{ position: [0, 4, 25], fov: 45 }}
        gl={{ antialias: false, toneMappingExposure: 1.2 }}
        className="w-full h-full"
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default App;