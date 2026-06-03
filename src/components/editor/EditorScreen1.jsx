import { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas as R3FCanvas } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';

import LeftSidebar from './LeftSidebar';
import ModelsPopup from './ModelsPopup';
import LayoutPopup from './LayoutPopup';

import cursorIcon from '../../assets/images/Icons/cursor.webp';
import handIcon from '../../assets/images/Icons/hand.webp';


function AutoSizedModelWithDimensions({ modelUrl, appliedTexture, shadowEnabled }) {
  const { scene } = useGLTF(modelUrl);
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    const clone = cloneSkeleton(scene);
    clone.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      obj.material = Array.isArray(obj.material)
        ? obj.material.map((mat) => mat?.clone())
        : obj.material.clone();
    });
    return clone;
  }, [scene]);

  // Apply shadow settings whenever shadowEnabled changes
  useEffect(() => {
    if (!clonedScene) return;
    clonedScene.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = !!shadowEnabled;
      obj.receiveShadow = !!shadowEnabled;
    });
  }, [clonedScene, shadowEnabled]);

  const { transform, dimensions } = useMemo(() => {
    if (!clonedScene) return { transform: { scale: 1, offset: [0, 0, 0] }, dimensions: null };
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 3.0 / maxDim; // Make it fit nicely on full screen

    return {
      transform: {
        scale,
        offset: [
          -center.x * scale,
          -center.y * scale,
          -center.z * scale,
        ],
      },
      dimensions: {
        width: Math.round(size.x * 1000), // mm
        height: Math.round(size.y * 1000),
        depth: Math.round(size.z * 1000),
        boxSize: size.clone().multiplyScalar(scale),
        boxCenter: center.clone().multiplyScalar(scale)
      }
    };
  }, [clonedScene]);

  useEffect(() => {
    if (!clonedScene || !appliedTexture) return;
    
    const loader = new THREE.TextureLoader();
    loader.load(appliedTexture, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = false;
      
      clonedScene.traverse((obj) => {
        if (!obj.isMesh || !obj.material) return;
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => { m.map = texture; m.needsUpdate = true; });
        } else {
          obj.material.map = texture;
          obj.material.needsUpdate = true;
        }
      });
    });
  }, [clonedScene, appliedTexture]);

  if (!clonedScene) return null;

  return (
    <group position={transform.offset} scale={transform.scale}>
      <primitive object={clonedScene} />
    </group>
  );
}

export default function EditorScreen1({ modelUrl, setModelUrl, appliedTexture, onProceed }) {
  const [activeTab, setActiveTab] = useState('edit');
  const [showCustomSize, setShowCustomSize] = useState(false);
  const [showCameraViews, setShowCameraViews] = useState(false);
  const orbitControlsRef = useRef(null);
  const cameraRef = useRef(null);

  // Tools state
  const [zoom, setZoom] = useState(1);
  const [openSlider, setOpenSlider] = useState(0);
  const [toolMode, setToolMode] = useState('cursor');
  const toolModeRef = useRef('cursor'); // always-fresh ref for onChange callback
  useEffect(() => { toolModeRef.current = toolMode; }, [toolMode]);
  const [shadowEnabled, setShadowEnabled] = useState(true);

  // Camera history for undo/redo
  const cameraHistory = useRef([]);
  const cameraHistoryIndex = useRef(-1);

  const saveCameraSnapshot = () => {
    if (!cameraRef.current || !orbitControlsRef.current) return;
    const cam = cameraRef.current;
    const snapshot = {
      position: cam.position.clone(),
      target: orbitControlsRef.current.target.clone(),
    };
    // Trim any redo states
    cameraHistory.current = cameraHistory.current.slice(0, cameraHistoryIndex.current + 1);
    cameraHistory.current.push(snapshot);
    cameraHistoryIndex.current = cameraHistory.current.length - 1;
  };

  const handleUndo = () => {
    if (cameraHistoryIndex.current <= 0) return;
    cameraHistoryIndex.current -= 1;
    const snap = cameraHistory.current[cameraHistoryIndex.current];
    if (!snap || !cameraRef.current || !orbitControlsRef.current) return;
    cameraRef.current.position.copy(snap.position);
    orbitControlsRef.current.target.copy(snap.target);
    orbitControlsRef.current.update();
  };

  const handleRedo = () => {
    if (cameraHistoryIndex.current >= cameraHistory.current.length - 1) return;
    cameraHistoryIndex.current += 1;
    const snap = cameraHistory.current[cameraHistoryIndex.current];
    if (!snap || !cameraRef.current || !orbitControlsRef.current) return;
    cameraRef.current.position.copy(snap.position);
    orbitControlsRef.current.target.copy(snap.target);
    orbitControlsRef.current.update();
  };

  const handleCameraView = (view) => {
    if (!orbitControlsRef.current) return;
    const ctrl = orbitControlsRef.current;
    switch(view) {
      case 'front': ctrl.setAzimuthalAngle(0); ctrl.setPolarAngle(Math.PI/2); break;
      case 'top': ctrl.setAzimuthalAngle(0); ctrl.setPolarAngle(0); break;
      case 'front-right': ctrl.setAzimuthalAngle(Math.PI/4); ctrl.setPolarAngle(Math.PI/3); break;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#e6e2db] relative">
      
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0" style={{ cursor: toolMode === 'hand' ? 'grab' : 'default' }}>
        <R3FCanvas
          camera={{ position: [0, 0.5, 4.5], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false }}
          shadows={shadowEnabled}
          onCreated={({ gl, camera }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.NeutralToneMapping;
            gl.setClearColor(new THREE.Color('#e6e2db'), 1);
            if (shadowEnabled) {
              gl.shadowMap.enabled = true;
              gl.shadowMap.type = THREE.PCFSoftShadowMap;
            }
            cameraRef.current = camera;
            setTimeout(() => saveCameraSnapshot(), 400);
          }}
        >
          <ambientLight intensity={shadowEnabled ? 0.8 : 1.5} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={shadowEnabled ? 2 : 1.5}
            castShadow={shadowEnabled}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={30}
            shadow-camera-near={0.1}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
            shadow-camera-left={-5}
            shadow-camera-right={5}
          />
          <directionalLight position={[-5, 5, -5]} intensity={0.8} />
          {/* Shadow catcher plane */}
          {shadowEnabled && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <shadowMaterial opacity={0.25} />
            </mesh>
          )}
          <Environment preset="studio" />
          <OrbitControls
            ref={orbitControlsRef}
            makeDefault
            enableRotate={toolMode === 'cursor'}
            enablePan={toolMode === 'hand'}
            enableZoom={true}
            minDistance={1.5}
            maxDistance={8}
            rotateSpeed={1}
            panSpeed={1.5}
            zoomSpeed={0.8}
            screenSpacePanning={true}
            mouseButtons={{
              LEFT: toolMode === 'hand' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.ROTATE,
            }}
            touches={{
              ONE: toolMode === 'hand' ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE,
              TWO: THREE.TOUCH.DOLLY_PAN,
            }}
            onChange={() => {
              const ctrl = orbitControlsRef.current;
              if (!ctrl) return;
              // Only clamp pan in hand mode — never interfere with cursor/rotate mode
              const isHand = toolModeRef.current === 'hand';
              if (!isHand) return;
              const t = ctrl.target;
              const PAN_X = 2.5;
              const PAN_Y = 1.8;
              const clampX = Math.max(-PAN_X, Math.min(PAN_X, t.x));
              const clampY = Math.max(-PAN_Y, Math.min(PAN_Y, t.y));
              if (clampX !== t.x) {
                ctrl.object.position.x += clampX - t.x;
                t.x = clampX;
              }
              if (clampY !== t.y) {
                ctrl.object.position.y += clampY - t.y;
                t.y = clampY;
              }
            }}
            onEnd={saveCameraSnapshot}
          />
          {modelUrl && <AutoSizedModelWithDimensions modelUrl={modelUrl} appliedTexture={appliedTexture} shadowEnabled={shadowEnabled} />}
        </R3FCanvas>
      </div>

      {/* Floating UI Elements */}

      {/* Left Sidebar Container */}
      <div className="absolute left-6 top-6 bottom-6 z-10 flex gap-4 pointer-events-none">
        <div className="pointer-events-auto h-full">
          <LeftSidebar active={activeTab} setActive={setActiveTab} />
        </div>

        {/* Popups */}
        <div className={`transition-all duration-300 overflow-hidden shrink-0 pointer-events-auto ${activeTab !== 'edit' ? 'w-[350px]' : 'w-0'}`}>
          {activeTab === 'models' && (
            <ModelsPopup
              onSelectModel={(url) => { setModelUrl(url); setActiveTab('edit'); }}
              currentModelUrl={modelUrl}
            />
          )}
          {activeTab === 'layout' && (
            <LayoutPopup />
          )}
        </div>

        {/* Edit Popup Panel */}
        {activeTab === 'edit' && !showCustomSize && (
          <div className="pointer-events-auto w-[280px] h-fit bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-5 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-[#111827] m-0">Edit</h2>
            <button 
              onClick={() => setShowCustomSize(true)}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                </div>
                <span className="font-bold text-[#111827] text-sm">Custom size</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            <button 
              onClick={onProceed}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#c05520]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <span className="font-bold text-[#111827] text-sm">Upload Artwork</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        )}

        {/* Custom Size Editor */}
        {activeTab === 'edit' && showCustomSize && (
          <div className="pointer-events-auto flex gap-4 h-fit">
            <button 
              onClick={() => setShowCustomSize(false)} 
              className="w-[88px] h-[88px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col items-center justify-center gap-1 border-none cursor-pointer hover:bg-gray-50 transition-colors shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-800">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              <span className="font-semibold text-gray-800 text-sm">Back</span>
            </button>
            <div className="w-[360px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#fafafa]" />
                  <h2 className="text-[22px] font-bold text-[#111827] m-0">Custom size</h2>
                </div>
                <div className="flex bg-[#f3f4f6] rounded-lg p-0.5">
                  <button className="px-4 py-1.5 rounded-md bg-white border border-[#a855f7] text-[#a855f7] text-sm font-medium cursor-pointer shadow-sm">mm</button>
                  <button className="px-4 py-1.5 rounded-md bg-transparent border-none text-gray-500 text-sm font-medium cursor-pointer hover:text-gray-700">in</button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="relative">
                  <div className="absolute -top-2.5 left-2 bg-purple-100 px-1">
                    <label className="text-[11px] font-medium text-gray-600">Length</label>
                  </div>
                  <input type="text" defaultValue="180" className="w-full pt-4 pb-3 px-3 border border-[#a855f7] bg-[#fdfcff] rounded-xl outline-none text-center font-semibold text-base text-gray-800 shadow-[0_0_0_1px_#a855f7_inset]" />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-500 mb-1 block">Width</label>
                  <input type="text" defaultValue="60" className="w-full py-3 px-3 border border-gray-200 rounded-xl outline-none text-center font-semibold text-base text-gray-800 focus:border-[#a855f7]" />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-500 mb-1 block">Height</label>
                  <input type="text" defaultValue="160" className="w-full py-3 px-3 border border-gray-200 rounded-xl outline-none text-center font-semibold text-base text-gray-800 focus:border-[#a855f7]" />
                </div>
              </div>

              <button className="w-full py-3.5 rounded-xl bg-[#d1d5db] text-white font-bold text-base transition-colors border-none cursor-not-allowed">
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Top Right Action Bar */}
      <div className="absolute right-6 top-6 z-10 flex gap-3 pointer-events-none">
        <button className="pointer-events-auto h-11 px-5 rounded-xl bg-[#c05520] hover:bg-[#a04619] text-white font-bold transition-colors cursor-pointer border-none shadow-md flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export
        </button>
      </div>

      {/* Right Floating Pill */}
      <div className="absolute right-6 top-24 z-10 bg-white rounded-full p-2 shadow-lg flex flex-col gap-1">
        <Tooltip1 label="Select" side="left">
          <button
            onClick={() => setToolMode && setToolMode('cursor')}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${
              toolMode === 'cursor' ? 'bg-gray-100' : 'bg-transparent hover:bg-gray-100'
            }`}
          >
            <img src={cursorIcon} alt="Cursor" className="w-5 h-5 object-contain" />
          </button>
        </Tooltip1>
        <Tooltip1 label="Hand" side="left">
          <button
            onClick={() => setToolMode && setToolMode('hand')}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${
              toolMode === 'hand' ? 'bg-gray-100' : 'bg-transparent hover:bg-gray-100'
            }`}
          >
            <img src={handIcon} alt="Hand" className="w-5 h-5 object-contain" />
          </button>
        </Tooltip1>

        <div className="w-6 h-px bg-gray-200 mx-auto" />

        <Tooltip1 label="Undo" side="left">
          <button
            onClick={handleUndo}
            className="w-10 h-10 rounded-full flex items-center justify-center border-none bg-transparent hover:bg-gray-100 cursor-pointer text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
          </button>
        </Tooltip1>
        <Tooltip1 label="Redo" side="left">
          <button
            onClick={handleRedo}
            className="w-10 h-10 rounded-full flex items-center justify-center border-none bg-transparent hover:bg-gray-100 cursor-pointer text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
            </svg>
          </button>
        </Tooltip1>

        <div className="w-6 h-px bg-gray-200 mx-auto" />

        <Tooltip1 label={shadowEnabled ? 'Shadow On' : 'Shadow Off'} side="left">
          <button
            onClick={() => setShadowEnabled(s => !s)}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${
              shadowEnabled ? 'bg-gray-900 text-white hover:bg-gray-700' : 'bg-transparent text-gray-500 hover:bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          </button>
        </Tooltip1>
      </div>

      {/* Bottom Floating Bar removed as requested */}

    </div>
  );
}

function ViewBtn({ label, onClick }) {
  return (
    <button onClick={onClick} className="w-16 h-16 rounded-xl bg-transparent hover:bg-gray-50 border-none flex flex-col items-center justify-center gap-1 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
      <span className="text-[10px] font-semibold text-gray-500">{label}</span>
    </button>
  );
}

function Tooltip1({ label, children, side = 'left' }) {
  const sideClasses = {
    left: 'right-[calc(100%+8px)] top-1/2 -translate-y-1/2',
    right: 'left-[calc(100%+8px)] top-1/2 -translate-y-1/2',
    top: 'bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2',
    bottom: 'top-[calc(100%+8px)] left-1/2 -translate-x-1/2',
  };
  const arrowClasses = {
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-y-transparent border-l-transparent',
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-x-transparent border-t-transparent',
  };
  return (
    <div className="relative group flex items-center justify-center">
      {children}
      <div className={`absolute ${sideClasses[side]} px-2.5 py-1 bg-gray-900 text-white text-[11px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[100] shadow-sm`}>
        {label}
        <div className={`absolute w-0 h-0 border-solid border-4 ${arrowClasses[side]}`}></div>
      </div>
    </div>
  );
}
