import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { TreeState } from '../types';

declare global {
  interface Window {
    handpose: any;
    tf: any;
  }
}

export const GestureController: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isCameraEnabled, setMode, setCameraOffset, cyclePhoto } = useStore();
  const [model, setModel] = useState<any>(null);
  const [status, setStatus] = useState<string>("");

  // Refs for gesture smoothing and swipe detection
  const lastXRef = useRef<number>(0);
  const swipeCooldownRef = useRef<number>(0);

  // Load Model
  useEffect(() => {
    if (!isCameraEnabled) return;

    const loadModel = async () => {
      setStatus("Loading AI Model...");
      try {
        if (window.handpose) {
            const loadedModel = await window.handpose.load();
            setModel(loadedModel);
            setStatus("Ready. Show hand.");
        } else {
            setStatus("Handpose library missing.");
        }
      } catch (e) {
        console.error(e);
        setStatus("Error loading model.");
      }
    };
    loadModel();
  }, [isCameraEnabled]);

  // Detection Loop
  useEffect(() => {
    if (!model || !isCameraEnabled || !videoRef.current) return;

    let animationId: number;
    const video = videoRef.current;
    let isRunning = true;

    const detect = async () => {
      if (!isRunning) return;

      if (video.readyState === 4) {
        try {
          const predictions = await model.estimateHands(video);

          if (predictions.length > 0) {
            const hand = predictions[0];
            
            // 1. Gesture Logic: Open vs Closed
            const annotations = hand.annotations;
            const palmBase = annotations.palmBase[0];
            const middleTip = annotations.middleFinger[3];
            
            const dist = Math.sqrt(
                Math.pow(palmBase[0] - middleTip[0], 2) + 
                Math.pow(palmBase[1] - middleTip[1], 2)
            );
            
            const isOpen = dist > 80; 
            
            if (isOpen) {
              setMode(TreeState.CHAOS);
              setStatus("Detected: OPEN (Unleashed)");
            } else {
              setMode(TreeState.FORMED);
              setStatus("Detected: CLOSED (Formed)");
            }

            // 2. Camera & Swipe Control
            const xRaw = hand.landmarks[0][0]; // Wrist x
            const yRaw = hand.landmarks[0][1];
            const normalizedX = (xRaw / video.videoWidth) * 2 - 1; // -1 to 1
            const normalizedY = (yRaw / video.videoHeight) * 2 - 1;
            
            // Invert X because webcam is mirrored
            const invertedX = -normalizedX;

            // Camera Move (Smooth)
            setCameraOffset(invertedX * 10, -normalizedY * 5);

            // 3. Swipe Detection
            if (isOpen) {
              const now = Date.now();
              if (now > swipeCooldownRef.current) {
                  const deltaX = invertedX - lastXRef.current;
                  
                  if (deltaX > 0.15) {
                      cyclePhoto(1); 
                      swipeCooldownRef.current = now + 600; 
                      setStatus(">> SWIPE RIGHT >>");
                  } else if (deltaX < -0.15) {
                      cyclePhoto(-1); 
                      swipeCooldownRef.current = now + 600;
                      setStatus("<< SWIPE LEFT <<");
                  }
              }
            }
            
            lastXRef.current = invertedX;

          } else {
              setStatus("No hand detected");
          }
        } catch (err) {
          console.warn("Detection error:", err);
        }
      }
      animationId = requestAnimationFrame(detect);
    };

    detect();

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationId);
    };
  }, [model, isCameraEnabled, setMode, setCameraOffset, cyclePhoto]);

  // Setup Webcam with Safe Check
  useEffect(() => {
    if (isCameraEnabled) {
      // SECURITY CHECK: Check if browser supports mediaDevices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus("Error: Camera requires HTTPS or localhost.");
        console.error("Camera API not available. This is likely because the site is served over HTTP instead of HTTPS.");
        return;
      }

      if (videoRef.current) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then((stream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch((err) => {
            console.error("Webcam denied or error", err);
            setStatus("Webcam denied or unavailable.");
          });
      }
    }
  }, [isCameraEnabled]);

  if (!isCameraEnabled) return null;

  return (
    <div className="absolute bottom-4 right-4 z-50 flex flex-col items-end">
      <div className="bg-black/80 border border-gold text-gold p-2 mb-2 font-mono text-xs uppercase shadow-[0_0_10px_#D4AF37]">
        {status}
      </div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width="320"
        height="240"
        className="w-32 h-24 border-2 border-gold rounded opacity-80 mirrored scale-x-[-1]"
      />
    </div>
  );
};