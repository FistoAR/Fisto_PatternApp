import {
  useRef,
  useState,
  useMemo,
  useEffect,
  Suspense,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Canvas as R3FCanvas, useThree } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  useGLTF,
  Html,
  useProgress,
} from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

import LeftSidebar from "./LeftSidebar";
import ModelsPopup from "./ModelsPopup";
import LayoutPopup from "./LayoutPopup";

import cursorIcon from "../../assets/images/Icons/cursor.webp";
import handIcon from "../../assets/images/Icons/hand.webp";

// ---- Loading overlay (outside canvas, driven by state or drei's useProgress) ----
function ModelLoadingOverlay({ isLoading }) {
  const { progress, active } = useProgress();
  const showLoader = isLoading || active || progress < 100;
  if (!showLoader) return null;
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#e6e2db]/80 backdrop-blur-[2px] pointer-events-none">
      {/* Spinner ring */}
      <div className="relative w-16 h-16 mb-5">
        <div className="absolute inset-0 rounded-full border-4 border-[#c05520]/20" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#c05520] animate-spin"
          style={{ animationDuration: "0.9s" }}
        />
        {/* Inner dot */}
        <div className="absolute inset-[18px] rounded-full bg-[#c05520]/20" />
      </div>
      <p className="text-[#c05520] font-bold text-base tracking-wide">
        Model Loading
      </p>
      <p className="text-[#c05520]/60 text-xs mt-1 font-medium">
        {Math.round(progress)}%
      </p>
    </div>
  );
}

function AutoSizedModelWithDimensions({
  modelUrl,
  appliedTextures,
  appliedColors,
  appliedLastApplied,
  shadowEnabled,
  customSize,
  selectedMaterialId,
  onMaterialsLoaded,
  onBaseDimensionsLoaded,
  onSceneLoaded,
}) {
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

  useEffect(() => {
    if (clonedScene && onSceneLoaded) {
      onSceneLoaded(clonedScene);
    }
  }, [clonedScene, onSceneLoaded]);

  // Apply shadow settings whenever shadowEnabled changes
  useEffect(() => {
    if (!clonedScene) return;
    clonedScene.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = !!shadowEnabled;
      obj.receiveShadow = !!shadowEnabled;
    });
  }, [clonedScene, shadowEnabled]);

  // Extract materials
  useEffect(() => {
    if (!clonedScene) return;
    const mats = [];
    clonedScene.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      const mArray = Array.isArray(obj.material)
        ? obj.material
        : [obj.material];
      mArray.forEach((m) => {
        const id = m.name || m.uuid;
        if (!mats.some((x) => x.id === id)) {
          mats.push({ id, name: m.name || `Material (${m.uuid.slice(0, 4)})` });
        }
      });
    });
    if (onMaterialsLoaded) onMaterialsLoaded(mats);
  }, [clonedScene, onMaterialsLoaded]);

  // Highlight selected material with an outline (EdgesGeometry)
  useEffect(() => {
    if (!clonedScene) return;
    clonedScene.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      const mArray = Array.isArray(obj.material)
        ? obj.material
        : [obj.material];

      let isSelected = false;
      mArray.forEach((m) => {
        const id = m.name || m.uuid;
        if (selectedMaterialId && id === selectedMaterialId) {
          isSelected = true;
        }
      });

      if (isSelected) {
        if (!obj.userData.outlineMesh) {
          const edges = new THREE.EdgesGeometry(obj.geometry);
          const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0x4a90e2, linewidth: 2 }),
          );
          // Scale it slightly up to ensure it shows outside the mesh
          line.scale.set(1.002, 1.002, 1.002);
          obj.add(line);
          obj.userData.outlineMesh = line;
        }
        obj.userData.outlineMesh.visible = true;
      } else {
        if (obj.userData.outlineMesh) {
          obj.userData.outlineMesh.visible = false;
        }
      }
    });
  }, [clonedScene, selectedMaterialId]);

  const { baseTransform, baseDims } = useMemo(() => {
    if (!clonedScene)
      return { baseTransform: { scale: 1, offset: [0, 0, 0] }, baseDims: null };
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 3.0 / maxDim; // Make it fit nicely on full screen

    const dims = {
      length: Math.round(size.x * 1000), // x = length
      height: Math.round(size.y * 1000), // y = height
      width: Math.round(size.z * 1000), // z = width
    };

    return {
      baseTransform: {
        scale,
        offset: [-center.x * scale, -center.y * scale, -center.z * scale],
      },
      baseDims: dims,
    };
  }, [clonedScene]);

  // Pass dimensions up
  useEffect(() => {
    if (baseDims && onBaseDimensionsLoaded) {
      onBaseDimensionsLoaded(baseDims);
    }
  }, [baseDims, onBaseDimensionsLoaded]);

  // Calculate non-uniform custom scale
  const customScale = useMemo(() => {
    if (!baseDims || !customSize) return [1, 1, 1];
    return [
      customSize.length ? customSize.length / baseDims.length : 1,
      customSize.height ? customSize.height / baseDims.height : 1,
      customSize.width ? customSize.width / baseDims.width : 1,
    ];
  }, [baseDims, customSize]);

  useEffect(() => {
    if (!clonedScene) return;

    const loader = new THREE.TextureLoader();
    clonedScene.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      const mArray = Array.isArray(obj.material)
        ? obj.material
        : [obj.material];

      mArray.forEach((m) => {
        const id = m.name || m.uuid;

        // Store original color and map if not stored yet
        if (m.userData.originalColorHex === undefined) {
          m.userData.originalColorHex = m.color ? m.color.getHex() : 0xffffff;
          m.userData.originalMap = m.map;
        }

        const colorHex = appliedColors
          ? appliedColors[id] || appliedColors["all"]
          : null;
        let textureUrl = null;
        if (appliedTextures) {
          if (typeof appliedTextures === "string") textureUrl = appliedTextures;
          else textureUrl = appliedTextures[id] || appliedTextures["all"];
        }

        const last = appliedLastApplied
          ? appliedLastApplied[id] || appliedLastApplied["all"]
          : null;

        // Decide what to render based on last applied action
        if (textureUrl && last === "texture") {
          m.color.setHex(0xffffff); // Neutral white, no blending/tinting
          m.userData.loadingTextureUrl = textureUrl;
          loader.load(textureUrl, (texture) => {
            if (m.userData.loadingTextureUrl === textureUrl) {
              texture.colorSpace = THREE.SRGBColorSpace;
              texture.flipY = false;
              m.map = texture;
              m.needsUpdate = true;
              delete m.userData.loadingTextureUrl;
            }
          });
        } else if (colorHex && last === "color") {
          m.userData.loadingTextureUrl = null; // Cancel any active texture loads
          m.color.set(colorHex);
          m.map = null; // Clear the original texture so it doesn't merge/tint
          m.needsUpdate = true;
        }
        // Fallbacks if one exists but last is not set (e.g. initial loads or simple states)
        else if (textureUrl) {
          m.color.setHex(0xffffff);
          m.userData.loadingTextureUrl = textureUrl;
          loader.load(textureUrl, (texture) => {
            if (m.userData.loadingTextureUrl === textureUrl) {
              texture.colorSpace = THREE.SRGBColorSpace;
              texture.flipY = false;
              m.map = texture;
              m.needsUpdate = true;
              delete m.userData.loadingTextureUrl;
            }
          });
        } else if (colorHex) {
          m.userData.loadingTextureUrl = null;
          m.color.set(colorHex);
          m.map = null;
          m.needsUpdate = true;
        }
        // Restore Originals (No custom color, no custom texture)
        else {
          m.userData.loadingTextureUrl = null;
          m.color.setHex(m.userData.originalColorHex);
          m.map = m.userData.originalMap;
          m.needsUpdate = true;
        }
      });
    });
  }, [clonedScene, appliedTextures, appliedColors, appliedLastApplied]);

  if (!clonedScene) return null;

  return (
    <group position={baseTransform.offset} scale={baseTransform.scale}>
      <group scale={customScale}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}

export default function EditorScreen1({
  modelUrl,
  setModelUrl,
  appliedTextures,
  appliedColors,
  appliedLastApplied,
  appliedCustomSize,
  selectedMaterial,
  setSelectedMaterial,
  onProceed,
  onApplyColor,
  onApplyCustomSize,
  onUndo,
  onRedo,
  onResetAll,
  canUndo,
  canRedo,
  activeTab,
  setActiveTab,
}) {
  const [showCustomSize, setShowCustomSize] = useState(false);
  const [showCameraViews, setShowCameraViews] = useState(false);
  const orbitControlsRef = useRef(null);
  const cameraRef = useRef(null);

  const [modelMaterials, setModelMaterials] = useState([]);

  // Model switch confirmation state
  const [pendingModelUrl, setPendingModelUrl] = useState(null);
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);

  // Custom size logic
  const [baseDimensions, setBaseDimensions] = useState(null);
  const [customSizeInput, setCustomSizeInput] = useState({
    length: 180,
    width: 60,
    height: 160,
  });

  // Export Modal states and handlers
  const captureRef = useRef(null);
  const [activeScene, setActiveScene] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportGlbChecked, setExportGlbChecked] = useState(true);
  const [exportImageChecked, setExportImageChecked] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [isModelLoading, setIsModelLoading] = useState(false);

  useEffect(() => {
    if (modelUrl) {
      setIsModelLoading(true);
    }
  }, [modelUrl]);

  const getModelName = () => {
    if (!modelUrl) return "model";
    const base = modelUrl.split("/").pop() || "model";
    let name = base.substring(0, base.lastIndexOf(".")) || base;
    name = name.replace(/-[A-Za-z0-9_]{8}$/, ""); // Strip Vite hashes
    return decodeURIComponent(name);
  };

  const handleExport = () => {
    if (!exportGlbChecked && !exportImageChecked) {
      alert("Please select at least one option to export.");
      return;
    }

    setIsExporting(true);

    if (exportGlbChecked) {
      if (activeScene) {
        const exporter = new GLTFExporter();
        exporter.parse(
          activeScene,
          (glb) => {
            const blob = new Blob([glb], { type: "model/gltf-binary" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${getModelName()}.glb`;
            a.click();
            URL.revokeObjectURL(url);
            if (!exportImageChecked) {
              setIsExporting(false);
              setShowExportModal(false);
            }
          },
          (err) => {
            console.error("GLTFExporter error:", err);
            setIsExporting(false);
          },
          { binary: true },
        );
      } else {
        alert("3D Model is still loading. Please wait.");
        setIsExporting(false);
      }
    }

    if (exportImageChecked) {
      setTimeout(() => {
        if (captureRef.current) {
          captureRef.current.capture();
        } else {
          alert("Could not capture 3D Canvas screen.");
        }
        setIsExporting(false);
        setShowExportModal(false);
      }, 100);
    } else if (!exportGlbChecked) {
      setShowExportModal(false);
    }
  };

  // Initialize custom size inputs when base dimensions load
  const handleBaseDimensionsLoaded = (dims) => {
    if (!baseDimensions) {
      setBaseDimensions(dims);
      setCustomSizeInput(dims); // default inputs to base size
    }
  };

  // Tools state
  const [zoom, setZoom] = useState(1);
  const [toolMode, setToolMode] = useState("cursor");
  const [shadowEnabled, setShadowEnabled] = useState(true);

  // Sync inputs when applied size changes via undo/redo
  useEffect(() => {
    if (appliedCustomSize) {
      setCustomSizeInput(appliedCustomSize);
    }
  }, [appliedCustomSize]);

  // Keyboard shortcuts for EditorScreen1
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "SELECT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      const isModKey = e.metaKey || e.ctrlKey;

      // Undo: Cmd/Ctrl + Z
      if (isModKey && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo && onUndo) onUndo();
      }

      // Redo: Cmd/Ctrl + Y or Cmd/Ctrl + Shift + Z
      if (
        (isModKey && e.key.toLowerCase() === "y") ||
        (isModKey && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        if (canRedo && onRedo) onRedo();
      }

      // V or S -> select/cursor tool
      if (!isModKey && (e.key.toLowerCase() === "v" || e.key.toLowerCase() === "s")) {
        e.preventDefault();
        handleSetToolMode("cursor");
      }

      // H -> hand/pan tool
      if (!isModKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        handleSetToolMode("hand");
      }

      // R -> reset view
      if (!isModKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        if (orbitControlsRef.current && cameraRef.current) {
          orbitControlsRef.current.target.set(0, 0, 0);
          orbitControlsRef.current.update();
        }
      }

      // E -> open export modal
      if (!isModKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setShowExportModal(true);
      }

      // Escape -> close export modal, reset tool settings
      if (e.key === "Escape") {
        e.preventDefault();
        setShowExportModal(false);
        setShowSwitchDialog(false);
        setShowCustomSize(false);
        setSelectedMaterial("");
        setActiveTab("edit");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canUndo, canRedo, onUndo, onRedo, activeTab, setActiveTab]);

  const handleCameraView = (view) => {
    if (!orbitControlsRef.current) return;
    const ctrl = orbitControlsRef.current;
    switch (view) {
      case "front":
        ctrl.setAzimuthalAngle(0);
        ctrl.setPolarAngle(Math.PI / 2);
        break;
      case "top":
        ctrl.setAzimuthalAngle(0);
        ctrl.setPolarAngle(0);
        break;
      case "front-right":
        ctrl.setAzimuthalAngle(Math.PI / 4);
        ctrl.setPolarAngle(Math.PI / 3);
        break;
    }
  };

  const handleSetToolMode = (mode) => setToolMode(mode);

  return (
    <div className="flex flex-col h-full w-full bg-[#e6e2db] relative">
      {/* 3D Canvas Background */}
      <div
        id="three-canvas-container"
        className="absolute inset-0 z-0"
        style={{ cursor: toolMode === "hand" ? "grab" : "default" }}
      >
        <R3FCanvas
          camera={{ position: [0, 0.5, 4.5], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
          shadows={shadowEnabled ? { type: THREE.PCFShadowMap } : false}
          onCreated={({ gl, camera }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.9;
            gl.setClearColor(new THREE.Color("#e6e2db"), 1);
            if (shadowEnabled) {
              gl.shadowMap.enabled = true;
              gl.shadowMap.type = THREE.PCFShadowMap;
            }
            cameraRef.current = camera;
          }}
        >
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={shadowEnabled ? 0.8 : 0.6}
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
          <directionalLight position={[-5, 5, -5]} intensity={0.3} />
          {/* Shadow catcher plane */}
          {shadowEnabled && (
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -1.2, 0]}
              receiveShadow
            >
              <planeGeometry args={[20, 20]} />
              <shadowMaterial opacity={0.25} />
            </mesh>
          )}
          <Environment preset="studio" environmentIntensity={0.4} />
          <OrbitControls
            ref={orbitControlsRef}
            makeDefault
            enableRotate={toolMode === "cursor"}
            enablePan={toolMode === "hand"}
            enableZoom={true}
            screenSpacePanning={true}
            minDistance={1.5}
            maxDistance={8}
            rotateSpeed={1}
            panSpeed={1.2}
            zoomSpeed={0.8}
            mouseButtons={{
              LEFT: toolMode === "hand" ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.ROTATE,
            }}
            touches={{
              ONE: toolMode === "hand" ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE,
              TWO: THREE.TOUCH.DOLLY_PAN,
            }}
          />
          <Suspense fallback={null}>
            {modelUrl && (
              <AutoSizedModelWithDimensions
                modelUrl={modelUrl}
                appliedTextures={appliedTextures}
                appliedColors={appliedColors}
                appliedLastApplied={appliedLastApplied}
                shadowEnabled={shadowEnabled}
                customSize={appliedCustomSize}
                selectedMaterialId={selectedMaterial}
                onMaterialsLoaded={(mats) => {
                  setModelMaterials(mats);
                  setIsModelLoading(false);
                }}
                onBaseDimensionsLoaded={handleBaseDimensionsLoaded}
                onSceneLoaded={setActiveScene}
              />
            )}
          </Suspense>
          <ScreenshotHelper ref={captureRef} filename={getModelName()} />
        </R3FCanvas>
        {/* Loading overlay sits on top of canvas */}
        {modelUrl && <ModelLoadingOverlay isLoading={isModelLoading} />}
      </div>

      {/* Floating UI Elements */}

      {/* Left Sidebar Container */}
      <div className="absolute left-6 top-6 bottom-6 z-10 flex gap-4 pointer-events-none">
        <div className="pointer-events-auto h-full">
          <LeftSidebar active={activeTab} setActive={setActiveTab} />
        </div>

        {/* Popups */}
        <div
          className={`transition-all duration-300 overflow-hidden shrink-0 pointer-events-auto ${activeTab === "models" || activeTab === "layout" ? "w-[350px]" : "w-0"}`}
        >
          {activeTab === "models" && (
            <ModelsPopup
              onSelectModel={(url) => {
                if (url === modelUrl) return;
                const hasEdits = Object.keys(appliedTextures || {}).length > 0 || Object.keys(appliedColors || {}).length > 0;
                if (hasEdits) {
                  setPendingModelUrl(url);
                  setShowSwitchDialog(true);
                } else {
                  setModelUrl(url);
                }
              }}
              currentModelUrl={modelUrl}
            />
          )}
          {activeTab === "layout" && <LayoutPopup />}
        </div>

        {/* Edit Popup Panel */}
        {activeTab === "edit" && !showCustomSize && (
          <div className="pointer-events-auto w-[280px] h-fit bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-5 flex flex-col gap-4">
            <div className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 12h-15m0 0v1.5m0-1.5v-1.5m15 1.5v1.5m0-1.5v-1.5m-12 1.5v-1.5m3 1.5v-1.5m3 1.5v-1.5m3 1.5v-1.5"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18h12a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3Z"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[#111827] text-sm">
                    Size
                  </span>
                  <span className="text-[11px] font-medium text-gray-500">
                    {baseDimensions ? `${baseDimensions.length} x ${baseDimensions.width} x ${baseDimensions.height} mm` : 'Loading...'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onProceed(selectedMaterial)}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-[#c05520]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
                <span className="font-bold text-[#111827] text-sm">
                  Upload Artwork
                </span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Target Material
              </label>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium outline-none focus:border-[#c05520] focus:ring-1 focus:ring-[#c05520] transition-all"
              >
                <option value="">All Materials</option>
                {modelMaterials.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer overflow-hidden">
              <div className="flex items-center gap-3 z-10 pointer-events-none">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
                    />
                  </svg>
                </div>
                <span className="font-bold text-[#111827] text-sm">
                  Apply Color
                </span>
              </div>
              <input
                type="color"
                value={appliedColors?.[selectedMaterial || "all"] || "#ffffff"}
                onChange={(e) =>
                  onApplyColor && onApplyColor(selectedMaterial, e.target.value)
                }
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow-md z-10 pointer-events-none"
                style={{
                  backgroundColor:
                    appliedColors?.[selectedMaterial || "all"] || "#ffffff",
                }}
              />
            </div>

            <div className="text-[11px] text-[#8a5338] bg-[#fdf8f5] border border-[#f5e3d7] rounded-2xl p-3 flex gap-2.5 leading-relaxed">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-[#c05520] shrink-0 mt-0.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>
                Note: Applying a material color will override and replace any
                custom artwork applied to this face.
              </span>
            </div>
          </div>
        )}

        {/* Custom Size Editor */}
        {activeTab === "edit" && showCustomSize && (
          <div className="pointer-events-auto h-fit">
            <div className="w-[360px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowCustomSize(false)}
                    className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer border border-gray-100 shadow-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-700"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                      />
                    </svg>
                  </button>
                  <h2 className="text-[22px] font-bold text-[#111827] m-0">
                    Custom size
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setCustomSizeInput(baseDimensions);
                    onApplyCustomSize(baseDimensions);
                  }}
                  title="Reset to original size"
                  className="w-10 h-10 rounded-xl bg-white hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer border border-gray-100 shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div>
                  <label className="text-[13px] font-medium text-gray-500 mb-1 block">
                    Length
                  </label>
                  <input
                    type="number"
                    value={customSizeInput.length}
                    onChange={(e) =>
                      setCustomSizeInput((prev) => ({
                        ...prev,
                        length: Number(e.target.value),
                      }))
                    }
                    className="w-full py-3 px-3 border border-gray-200 rounded-xl outline-none text-center font-semibold text-base text-gray-800 focus:border-[#a855f7]"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-500 mb-1 block">
                    Width
                  </label>
                  <input
                    type="number"
                    value={customSizeInput.width}
                    onChange={(e) =>
                      setCustomSizeInput((prev) => ({
                        ...prev,
                        width: Number(e.target.value),
                      }))
                    }
                    className="w-full py-3 px-3 border border-gray-200 rounded-xl outline-none text-center font-semibold text-base text-gray-800 focus:border-[#a855f7]"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-500 mb-1 block">
                    Height
                  </label>
                  <input
                    type="number"
                    value={customSizeInput.height}
                    onChange={(e) =>
                      setCustomSizeInput((prev) => ({
                        ...prev,
                        height: Number(e.target.value),
                      }))
                    }
                    className="w-full py-3 px-3 border border-gray-200 rounded-xl outline-none text-center font-semibold text-base text-gray-800 focus:border-[#a855f7]"
                  />
                </div>
              </div>

              <button
                onClick={() => onApplyCustomSize(customSizeInput)}
                className="w-full py-3.5 rounded-xl bg-[#c05520] hover:bg-[#a04619] text-white font-bold text-base transition-colors border-none cursor-pointer shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export Action Button (Separate Container) */}
      <div className="absolute right-7 top-6 z-10 pointer-events-none bg-white rounded-full p-2 shadow-lg flex flex-col items-center justify-center">
        <Tooltip1 label="Export" side="left">
          <button
            onClick={() => setShowExportModal(true)}
            className="pointer-events-auto w-8 h-8 rounded-full bg-transparent flex items-center justify-center border-none cursor-pointer hover:bg-gray-100 text-[#c05520] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
          </button>
        </Tooltip1>
      </div>

      {/* Right Floating Pill */}
      <div className="absolute right-6 top-[88px] z-10 bg-white rounded-full p-2 shadow-lg flex flex-col gap-1">
        <Tooltip1 label="Select" side="left">
          <button
            onClick={() => handleSetToolMode("cursor")}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${
              toolMode === "cursor"
                ? "bg-gray-900 hover:bg-gray-700"
                : "bg-transparent hover:bg-gray-100"
            }`}
          >
            <img
              src={cursorIcon}
              alt="Cursor"
              className={`w-5 h-5 object-contain ${toolMode === "cursor" ? "invert brightness-0 saturate-100" : ""}`}
            />
          </button>
        </Tooltip1>
        <Tooltip1 label="Hand" side="left">
          <button
            onClick={() => handleSetToolMode("hand")}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${
              toolMode === "hand"
                ? "bg-gray-900 hover:bg-gray-700"
                : "bg-transparent hover:bg-gray-100"
            }`}
          >
            <img
              src={handIcon}
              alt="Hand"
              className={`w-5 h-5 object-contain ${toolMode === "hand" ? "invert brightness-0 saturate-100" : ""}`}
            />
          </button>
        </Tooltip1>

        <div className="w-6 h-px bg-gray-200 mx-auto" />

        <Tooltip1 label="Reset View" side="left">
          <button
            onClick={() => {
              if (orbitControlsRef.current && cameraRef.current) {
                orbitControlsRef.current.target.set(0, 0, 0);
                // The camera is usually at z=300 to z=400 depending on model size,
                // let's just reset the pivot target, which fulfills "reset the pivot to 0"
                orbitControlsRef.current.update();
              }
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center border-none bg-transparent hover:bg-gray-100 cursor-pointer text-gray-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25v1.5m0 16.5v1.5m-9.75-9.75h1.5m16.5 0h1.5" />
            </svg>
          </button>
        </Tooltip1>

        <Tooltip1 label="Reset All Edits" side="left">
          <button
            onClick={() => {
              if (onResetAll) onResetAll();
              if (baseDimensions) setCustomSizeInput(baseDimensions);
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center border-none bg-transparent hover:bg-red-50 hover:text-red-500 cursor-pointer text-gray-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        </Tooltip1>

        <div className="w-6 h-px bg-gray-200 mx-auto" />

        <Tooltip1 label="Undo" side="left">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-none transition-colors ${canUndo ? "bg-transparent hover:bg-gray-100 cursor-pointer text-gray-600" : "bg-transparent text-gray-300 cursor-not-allowed"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
              />
            </svg>
          </button>
        </Tooltip1>
        <Tooltip1 label="Redo" side="left">
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-none transition-colors ${canRedo ? "bg-transparent hover:bg-gray-100 cursor-pointer text-gray-600" : "bg-transparent text-gray-300 cursor-not-allowed"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
              />
            </svg>
          </button>
        </Tooltip1>

        <div className="w-6 h-px bg-gray-200 mx-auto" />

        <Tooltip1
          label={shadowEnabled ? "Shadow On" : "Shadow Off"}
          side="left"
        >
          <button
            onClick={() => setShadowEnabled((s) => !s)}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${
              shadowEnabled
                ? "bg-gray-900 text-white hover:bg-gray-700"
                : "bg-transparent text-gray-500 hover:bg-gray-100"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
              />
            </svg>
          </button>
        </Tooltip1>
      </div>

      {/* Export Options Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 backdrop-blur-[4px]">
          <div className="bg-white rounded-3xl p-6 w-[340px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col gap-5 relative border border-gray-100">
            <button
              onClick={() => setShowExportModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center border-none text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="flex flex-col gap-1 pr-6">
              <h3 className="text-lg font-bold text-gray-900 m-0">
                Export Design
              </h3>
              <p className="text-xs text-gray-500 m-0">
                Choose your preferred format(s)
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100/70 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={exportGlbChecked}
                  onChange={(e) => setExportGlbChecked(e.target.checked)}
                  className="w-5 h-5 accent-[#c05520] cursor-pointer rounded"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800">
                    Export as GLB
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Download the 3D model with your design applied
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100/70 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={exportImageChecked}
                  onChange={(e) => setExportImageChecked(e.target.checked)}
                  className="w-5 h-5 accent-[#c05520] cursor-pointer rounded"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800">
                    Export as Image
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Download a high-res screenshot of the 3D canvas
                  </span>
                </div>
              </label>
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full py-3.5 rounded-2xl bg-[#c05520] hover:bg-[#a04619] disabled:bg-gray-300 text-white font-bold text-base transition-colors border-none cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Exporting...</span>
                </>
              ) : (
                <span>Download Now</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Bar removed as requested */}

      {/* Model Switch Confirmation Dialog */}
      {showSwitchDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-[90%] max-w-[360px] flex flex-col gap-5 text-center transform transition-all">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-[#c0623a] mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 m-0">Switch Model</h3>
            <p className="text-[13px] text-gray-500 m-0 leading-relaxed">
              Do you want to keep your current design on the new model, or start fresh?
            </p>
            
            <div className="flex flex-col gap-2 mt-2">
              <button 
                onClick={() => {
                  setModelUrl(pendingModelUrl);
                  setShowSwitchDialog(false);
                  setPendingModelUrl(null);
                }}
                className="w-full py-3 bg-[#c0623a] text-white rounded-xl font-bold text-sm border-none cursor-pointer hover:bg-[#a65330] transition-colors"
              >
                Keep Design
              </button>
              <button 
                onClick={() => {
                  onResetAll();
                  setModelUrl(pendingModelUrl);
                  setShowSwitchDialog(false);
                  setPendingModelUrl(null);
                }}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm border-none cursor-pointer hover:bg-gray-200 transition-colors"
              >
                Clear Design
              </button>
              <button 
                onClick={() => {
                  setShowSwitchDialog(false);
                  setPendingModelUrl(null);
                }}
                className="w-full py-2.5 bg-transparent text-gray-500 rounded-xl font-medium text-sm border-none cursor-pointer hover:text-gray-700 transition-colors mt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ViewBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-16 h-16 rounded-xl bg-transparent hover:bg-gray-50 border-none flex flex-col items-center justify-center gap-1 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
        />
      </svg>
      <span className="text-[10px] font-semibold text-gray-500">{label}</span>
    </button>
  );
}

function Tooltip1({ label, children, side = "left" }) {
  const sideClasses = {
    left: "right-[calc(100%+8px)] top-1/2 -translate-y-1/2",
    right: "left-[calc(100%+8px)] top-1/2 -translate-y-1/2",
    top: "bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2",
    bottom: "top-[calc(100%+8px)] left-1/2 -translate-x-1/2",
  };
  const arrowClasses = {
    left: "left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-y-transparent border-r-transparent",
    right:
      "right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-y-transparent border-l-transparent",
    top: "top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-x-transparent border-b-transparent",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-x-transparent border-t-transparent",
  };
  return (
    <div className="relative group flex items-center justify-center">
      {children}
      <div
        className={`absolute ${sideClasses[side]} px-2.5 py-1 bg-gray-900 text-white text-[11px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[100] shadow-sm`}
      >
        {label}
        <div
          className={`absolute w-0 h-0 border-solid border-4 ${arrowClasses[side]}`}
        ></div>
      </div>
    </div>
  );
}

const ScreenshotHelper = forwardRef(({ filename }, ref) => {
  const { gl, scene, camera } = useThree();

  useImperativeHandle(ref, () => ({
    capture: () => {
      const currentPixelRatio = gl.getPixelRatio();
      gl.setPixelRatio(3); // High-res export multiplier
      gl.render(scene, camera);
      const url = gl.domElement.toDataURL("image/png", 1.0);
      gl.setPixelRatio(currentPixelRatio);
      gl.render(scene, camera);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename || "model"}.png`;
      a.click();
    },
  }));

  return null;
});

