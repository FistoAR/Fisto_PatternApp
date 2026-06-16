import {
  useRef,
  useState,
  useMemo,
  useEffect,
  useCallback,
  Suspense,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Canvas as R3FCanvas, useThree, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Html,
  useProgress,
  Environment,
} from "@react-three/drei";
import SafeEnvironment from "./SafeEnvironment";
import * as THREE from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

function CustomHdriEnvironment({ url, intensity }) {
  const texture = useLoader(RGBELoader, url);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return (
    <Environment
      map={texture}
      background={false}
      environmentIntensity={intensity}
    />
  );
}

function BackgroundImage({ url }) {
  const { scene } = useThree();
  const texture = useLoader(THREE.TextureLoader, url);

  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      scene.background = texture;
    }
    return () => {
      scene.background = null;
    };
  }, [texture, scene]);

  return null;
}

import LeftSidebar from "./LeftSidebar";
import ModelsPopup from "./ModelsPopup";
import LayoutPopup from "./LayoutPopup";
import ScenePopup from "./ScenePopup";
import { getTextureLibrary } from "../../utils/TextureLibrary";

import cursorIcon from "../../assets/images/Icons/cursor.webp";
import handIcon from "../../assets/images/Icons/hand.webp";

// ---- Loading overlay (outside canvas, driven by state or drei's useProgress) ----
function ModelLoadingOverlay({ isLoading }) {
  const { progress } = useProgress();
  if (!isLoading) return null;
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

function HdriLoadingOverlay({ isModelLoading }) {
  const { active } = useProgress();
  // Show this overlay when Suspense is active but the main model isn't loading
  // (which happens when HDRI Environments are being downloaded/compiled)
  if (isModelLoading || !active) return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#e6e2db]/60 backdrop-blur-[2px] pointer-events-none">
      <div className="relative w-14 h-14 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-[#c05520]/20" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#c05520] animate-spin"
          style={{ animationDuration: "1s" }}
        />
        <div className="absolute inset-[14px] rounded-full bg-[#c05520]/20" />
      </div>
      <p className="text-[#c05520] font-bold text-base tracking-wide">
        Applying Environment...
      </p>
    </div>
  );
}

function TextureActiveOverlay() {
  const { active } = useProgress();
  return (
    <div className="absolute inset-0 bg-[#c05520]/20 flex items-center justify-center backdrop-blur-[1px]">
      {active ? (
        <svg className="animate-spin h-5 w-5 text-white drop-shadow-md" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6 text-white drop-shadow-md"
        >
          <path
            fillRule="evenodd"
            d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );
}

function AutoSizedModelWithDimensions({
  modelUrl,
  appliedTextures,
  appliedColors,
  appliedMaterials,
  appliedLastApplied,
  shadowEnabled,
  customSize,
  selectedMaterialId,
  onMaterialsLoaded,
  onBaseDimensionsLoaded,
  onSceneLoaded,
  onTextureLoadStart,
  onTextureLoadEnd,
}) {
  const { scene } = useGLTF(modelUrl);
  const { invalidate } = useThree();
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

  // Optimize texture loader by memoizing it and tracking loading state
  const callbacksRef = useRef({ onTextureLoadStart, onTextureLoadEnd });
  callbacksRef.current = { onTextureLoadStart, onTextureLoadEnd };

  const loader = useMemo(() => {
    const mgr = new THREE.LoadingManager();
    mgr.onStart = () => {
      if (callbacksRef.current.onTextureLoadStart) callbacksRef.current.onTextureLoadStart();
    };
    mgr.onLoad = () => {
      // Small timeout to allow the GPU upload to complete before hiding the spinner
      setTimeout(() => {
        if (callbacksRef.current.onTextureLoadEnd) callbacksRef.current.onTextureLoadEnd();
      }, 3000);
    };
    return new THREE.TextureLoader(mgr);
  }, []);

  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((obj) => {
      if (!obj.isMesh || !obj.material || obj.userData.isDecal) return;
      const mArray = Array.isArray(obj.material)
        ? obj.material
        : [obj.material];

      mArray.forEach((m) => {
        const id = m.name || m.uuid;

        // Store original color and map if not stored yet
        if (m.userData.originalColorHex === undefined) {
          m.userData.originalColorHex = m.color ? m.color.getHex() : 0xffffff;
          m.userData.originalMap = m.map;
          m.userData.originalRoughness = m.roughness;
          m.userData.originalMetalness = m.metalness;
        }

        const colorHex = appliedColors
          ? appliedColors[id] || appliedColors["all"]
          : null;
        const materialType = appliedMaterials
          ? appliedMaterials[id] || appliedMaterials["all"]
          : null;
        let textureUrl = null;
        if (appliedTextures) {
          if (typeof appliedTextures === "string") textureUrl = appliedTextures;
          else textureUrl = appliedTextures[id] || appliedTextures["all"];
        }

        const last = appliedLastApplied
          ? appliedLastApplied[id] || appliedLastApplied["all"]
          : null;

        // --- HANDLE DECAL MESH FOR CANVAS EDITS ---
        if (!m.userData.decalMesh) {
          const decalMat = new THREE.MeshStandardMaterial({
            transparent: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1,
          });
          const decal = new THREE.Mesh(obj.geometry, decalMat);
          decal.userData.isDecal = true;
          decal.scale.set(1.002, 1.002, 1.002);
          obj.add(decal);
          m.userData.decalMesh = decal;
        }

        const decalMat = m.userData.decalMesh.material;
        if (textureUrl) {
          m.userData.decalMesh.visible = true;
          if (decalMat.userData.currentTextureUrl !== textureUrl) {
            decalMat.userData.currentTextureUrl = textureUrl;
            loader.load(textureUrl, (texture) => {
              texture.colorSpace = THREE.SRGBColorSpace;
              texture.flipY = false;
              if (modelUrl && modelUrl.includes("Tape")) {
                texture.center.set(0.5, 0.5);
                texture.rotation = -Math.PI / 2;
              }
              if (decalMat.map) decalMat.map.dispose();
              decalMat.map = texture;
              decalMat.color.setHex(0xffffff);
              decalMat.needsUpdate = true;
              invalidate();
            });
          }
        } else {
          m.userData.decalMesh.visible = false;
          if (decalMat.map) decalMat.map.dispose();
          decalMat.map = null;
          decalMat.userData.currentTextureUrl = null;
          decalMat.needsUpdate = true;
          invalidate();
        }

        // --- HANDLE BASE MESH (PBR OR COLOR) ---
        if (colorHex) {
          m.color.set(colorHex);
          // Only clear m.map if it's NOT a PBR material
          if (!m.userData.currentPbrId) {
             if (m.map) m.map.dispose();
             m.map = null;
          }
          m.needsUpdate = true;
          invalidate();
        } else {
          // Reset color if no custom color is specified
          if (m.userData.currentPbrId) {
            m.color.setHex(0xffffff); // PBR active: base color white
          } else {
            m.color.setHex(m.userData.originalColorHex); // Restore original
          }

          if (!materialType) {
            // Restore Originals (No custom color, no PBR material)
            m.userData.currentPbrId = null;
            if (textureUrl) {
              if (m.map) m.map.dispose();
              m.map = null;
            } else {
              m.map = m.userData.originalMap;
            }
            if (m.normalMap) m.normalMap.dispose();
            if (m.roughnessMap) m.roughnessMap.dispose();
            if (m.metalnessMap) m.metalnessMap.dispose();
            if (m.aoMap) m.aoMap.dispose();
            m.normalMap = null;
            m.roughnessMap = null;
            m.metalnessMap = null;
            m.aoMap = null;
            m.roughness = m.userData.originalRoughness !== undefined ? m.userData.originalRoughness : 0.5;
            m.metalness = m.userData.originalMetalness !== undefined ? m.userData.originalMetalness : 0.1;
          }
          m.needsUpdate = true;
          invalidate();
        }

        // Apply custom materials properties
        if (typeof materialType === "string") {
          // It's a legacy default material
          if (materialType === "kraft") {
            m.roughness = 0.9;
            m.metalness = 0.1;
            if (!textureUrl && last !== "color") m.color.setHex(0xbc9476);
          } else if (materialType === "glossy") {
            m.roughness = 0.1;
            m.metalness = 0.1;
            if (!textureUrl && last !== "color") m.color.setHex(0xffffff);
          } else if (materialType === "matte") {
            m.roughness = 0.8;
            m.metalness = 0.1;
            if (!textureUrl && last !== "color") m.color.setHex(0x222222);
          } else if (materialType === "metallic") {
            m.roughness = 0.2;
            m.metalness = 0.9;
            if (!textureUrl && last !== "color") m.color.setHex(0xaaaaaa);
          }
        } else if (typeof materialType === "object" && materialType !== null) {
          // It's a PBR texture object from the TextureLibrary
          if (m.userData.currentPbrId !== materialType.id) {
            m.userData.currentPbrId = materialType.id;
            m.userData.currentTextureUrl = null; // Clear active simple texture

            // Set base color to white so textures show accurately
            m.color.setHex(0xffffff);

            // Dispose old maps first
            if (m.map) m.map.dispose();
            if (m.normalMap) m.normalMap.dispose();
            if (m.roughnessMap) m.roughnessMap.dispose();
            if (m.metalnessMap) m.metalnessMap.dispose();
            if (m.aoMap) m.aoMap.dispose();

            // Initialize maps
            m.map = null;
            m.normalMap = null;
            m.roughnessMap = null;
            m.metalnessMap = null;
            m.aoMap = null;

            const loadMap = (url, mapType, isColorSpace) => {
              if (!url) return;
              loader.load(url, (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                if (isColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
                if (m[mapType]) m[mapType].dispose();
                m[mapType] = texture;
                m.needsUpdate = true;
                invalidate();
              });
            };

            // Load available maps
            if (materialType.maps.albedo)
              loadMap(materialType.maps.albedo, "map", true);
            if (materialType.maps.normal)
              loadMap(materialType.maps.normal, "normalMap", false);
            if (materialType.maps.roughness)
              loadMap(materialType.maps.roughness, "roughnessMap", false);
            if (materialType.maps.metallic)
              loadMap(materialType.maps.metallic, "metalnessMap", false);
            if (materialType.maps.ao)
              loadMap(materialType.maps.ao, "aoMap", false);

            // Set physical properties to full effect to let maps dictate appearance
            m.roughness = 1.0;
            m.metalness = 1.0;
            m.needsUpdate = true;
          }
        } else {
          // No material specified, restore originals
          m.userData.currentPbrId = null;
          m.roughness =
            m.userData.originalRoughness !== undefined
              ? m.userData.originalRoughness
              : 0.5;
          m.metalness =
            m.userData.originalMetalness !== undefined
              ? m.userData.originalMetalness
              : 0.1;

          // Only clear custom PBR maps if they exist, but leave m.map intact if it came from texture picker
          m.normalMap = null;
          m.roughnessMap = null;
          m.metalnessMap = null;
          m.aoMap = null;
        }
      });
    });
  }, [
    clonedScene,
    appliedTextures,
    appliedColors,
    appliedMaterials,
    appliedLastApplied,
  ]);

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
  appliedMaterials,
  appliedLastApplied,
  appliedCustomSize,
  selectedMaterial,
  setSelectedMaterial,
  onProceed,
  onApplyColor,
  onApplyMaterial,
  onApplyCustomSize,
  onUndo,
  onRedo,
  onResetAll,
  canUndo,
  canRedo,
  activeTab,
  setActiveTab,
  sceneBgColor: bgColor,
  setSceneBgColor: setBgColor,
  sceneBgImage: bgImage,
  setSceneBgImage: setBgImage,
}) {
  const [showCustomSize, setShowCustomSize] = useState(false);
  const [showCameraViews, setShowCameraViews] = useState(false);
  const orbitControlsRef = useRef(null);
  const cameraRef = useRef(null);

  const [modelMaterials, setModelMaterials] = useState([]);

  // Model switch confirmation state
  const [pendingModelUrl, setPendingModelUrl] = useState(null);
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);

  // Zoom state
  const [zoomPercent, setZoomPercent] = useState(100);
  const [showLegend, setShowLegend] = useState(false);

  // Scene & Environment States
  const [hdriPreset, setHdriPreset] = useState("studio");
  const [envIntensity, setEnvIntensity] = useState(0.4);
  const [ambLight, setAmbLight] = useState(0.3);
  const [dirLight, setDirLight] = useState(0.8);
  const [shadowOpacity, setShadowOpacity] = useState(0.25);
  const [customHdri, setCustomHdri] = useState(null);

  const handleZoom = (step) => {
    let newPct = zoomPercent + step;
    if (newPct < 50) newPct = 50;
    if (newPct > 150) newPct = 150;

    const controls = orbitControlsRef.current;
    const camera = cameraRef.current;
    if (controls && camera) {
      const newDist = 4 / (newPct / 100);
      const offset = new THREE.Vector3().subVectors(
        camera.position,
        controls.target,
      );
      offset.setLength(newDist);
      camera.position.copy(controls.target).add(offset);
      controls.update();
      setZoomPercent(newPct);
    }
  };

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
  const [isExporting, setIsExporting] = useState(false);
  const [exportGlbChecked, setExportGlbChecked] = useState(false);
  const [exportPngChecked, setExportPngChecked] = useState(true);
  const [exportJpgChecked, setExportJpgChecked] = useState(false);
  const [exportPdfChecked, setExportPdfChecked] = useState(false);

  const textureLibrary = useMemo(() => getTextureLibrary(), []);
  const [activeTextureCategory, setActiveTextureCategory] = useState(
    textureLibrary[0]?.category || "Wood",
  );
  const [isTextureDropdownOpen, setIsTextureDropdownOpen] = useState(false);

  const [isModelLoading, setIsModelLoading] = useState(false);
  const textureTimeoutRef = useRef(null);
  const textureFallbackTimeoutRef = useRef(null);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (textureTimeoutRef.current) clearTimeout(textureTimeoutRef.current);
      if (textureFallbackTimeoutRef.current) clearTimeout(textureFallbackTimeoutRef.current);
    };
  }, []);

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
    if (
      !exportGlbChecked &&
      !exportPngChecked &&
      !exportJpgChecked &&
      !exportPdfChecked
    ) {
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
            if (!exportPngChecked && !exportJpgChecked && !exportPdfChecked) {
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

    if (exportPngChecked || exportJpgChecked || exportPdfChecked) {
      setTimeout(() => {
        if (captureRef.current) {
          captureRef.current.capture({
            png: exportPngChecked,
            jpg: exportJpgChecked,
            pdf: exportPdfChecked,
          });
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
  const handleBaseDimensionsLoaded = useCallback((dims) => {
    setBaseDimensions((prev) => {
      if (!prev) {
        setCustomSizeInput(dims); // default inputs to base size
        return dims;
      }
      return prev;
    });
  }, []);

  const handleMaterialsLoaded = useCallback((mats) => {
    setModelMaterials(mats);
    setIsModelLoading(false);
  }, []);

  const handleTextureLoadStart = useCallback(() => {
    setIsModelLoading(true);
  }, []);

  const handleTextureLoadEnd = useCallback(() => {
    setIsModelLoading(false);
  }, []);

  // Tools state
  const [zoom, setZoom] = useState(1);
  const [toolMode, setToolMode] = useState("cursor");
  const [shadowEnabled, setShadowEnabled] = useState(false);

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
      if (
        !isModKey &&
        (e.key.toLowerCase() === "v" || e.key.toLowerCase() === "s")
      ) {
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
    <div
      className="flex flex-col h-full w-full transition-colors duration-300 relative"
      style={{ backgroundColor: bgColor }}
    >
      {/* 3D Canvas Background */}
      <div
        id="three-canvas-container"
        className="absolute inset-0 z-0"
        style={{ cursor: toolMode === "hand" ? "grab" : "default" }}
      >
        <R3FCanvas
          camera={{ position: [0, 0.5, 4.5], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
          shadows={shadowEnabled ? { type: THREE.PCFShadowMap } : false}
          onCreated={({ gl, camera }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.9;
            gl.setClearColor(new THREE.Color(bgColor), 1);
            if (shadowEnabled) {
              gl.shadowMap.enabled = true;
              gl.shadowMap.type = THREE.PCFShadowMap;
            }
            cameraRef.current = camera;
          }}
        >
          {!bgImage && <color attach="background" args={[bgColor]} />}
          {bgImage && (
            <Suspense fallback={null}>
              <BackgroundImage url={bgImage} />
            </Suspense>
          )}
          <ambientLight intensity={ambLight} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={shadowEnabled ? dirLight : dirLight * 0.75}
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
              <shadowMaterial opacity={shadowOpacity} />
            </mesh>
          )}
          {customHdri ? (
            <CustomHdriEnvironment url={customHdri} intensity={envIntensity} />
          ) : (
            <SafeEnvironment
              preset={hdriPreset}
              environmentIntensity={envIntensity}
            />
          )}
          <OrbitControls
            ref={orbitControlsRef}
            makeDefault
            enableRotate={toolMode === "cursor"}
            enablePan={toolMode === "hand"}
            enableZoom={true}
            screenSpacePanning={true}
            minDistance={4 / 1.5}
            maxDistance={4 / 0.5}
            onEnd={(e) => {
              const controls = e.target;
              if (controls && controls.object) {
                const dist = controls.object.position.distanceTo(
                  controls.target,
                );
                const pct = Math.round((4 / dist) * 100);
                setZoomPercent(Math.min(150, Math.max(50, pct)));
              }
            }}
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
                appliedMaterials={appliedMaterials}
                appliedLastApplied={appliedLastApplied}
                shadowEnabled={shadowEnabled}
                customSize={appliedCustomSize}
                selectedMaterialId={selectedMaterial}
                onMaterialsLoaded={handleMaterialsLoaded}
                onBaseDimensionsLoaded={handleBaseDimensionsLoaded}
                onSceneLoaded={setActiveScene}
                onTextureLoadStart={handleTextureLoadStart}
                onTextureLoadEnd={handleTextureLoadEnd}
              />
            )}
          </Suspense>
          <ScreenshotHelper
            ref={captureRef}
            filename={getModelName()}
            bgColor={bgColor}
          />
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
          className={`transition-all duration-300 overflow-hidden shrink-0 pointer-events-auto ${activeTab === "models" || activeTab === "layout" || activeTab === "scene" ? "w-[350px]" : "w-0"}`}
        >
          {activeTab === "models" && (
            <ModelsPopup
              onSelectModel={(url) => {
                if (url === modelUrl) return;
                const hasEdits =
                  Object.keys(appliedTextures || {}).length > 0 ||
                  Object.keys(appliedColors || {}).length > 0;
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
          {activeTab === "layout" && <LayoutPopup currentModelUrl={modelUrl} onSelectLayout={setModelUrl} />}
          {activeTab === "scene" && (
            <ScenePopup
              bgColor={bgColor}
              setBgColor={setBgColor}
              hdriPreset={hdriPreset}
              setHdriPreset={setHdriPreset}
              envIntensity={envIntensity}
              setEnvIntensity={setEnvIntensity}
              ambLight={ambLight}
              setAmbLight={setAmbLight}
              dirLight={dirLight}
              setDirLight={setDirLight}
              shadowOpacity={shadowOpacity}
              setShadowOpacity={setShadowOpacity}
              customHdri={customHdri}
              setCustomHdri={setCustomHdri}
              bgImage={bgImage}
              setBgImage={setBgImage}
            />
          )}
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
                  <span className="font-bold text-[#111827] text-sm">Size</span>
                  <span className="text-[11px] font-medium text-gray-500">
                    {baseDimensions
                      ? `${baseDimensions.length} x ${baseDimensions.width} x ${baseDimensions.height} mm`
                      : "Loading..."}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onProceed(selectedMaterial)}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border-2 border-[#c05520] bg-transparent hover:bg-orange-50 transition-all duration-300 cursor-pointer group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center border border-orange-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 text-[#c05520]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    />
                  </svg>
                </div>
                <span className="font-bold text-[#c05520] text-[15px] tracking-wide">
                  Upload Artwork
                </span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5 text-[#c05520] transition-transform duration-300 group-hover:translate-x-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">
                Target Material
              </label>
              <select
                value={selectedMaterial || ""}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium outline-none focus:border-[#c05520] focus:ring-1 focus:ring-[#c05520] transition-all"
              >
                <option value="none">Select Material</option>
                <option value="all">All Materials</option>
                {modelMaterials.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-gray-700">
                Apply Color
              </label>
              <div className="flex items-center gap-3 w-full">
                <div className="relative w-10 h-10 rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer flex-shrink-0 flex items-center justify-center bg-gray-50 hover:bg-gray-100 group">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-500 absolute z-0 group-hover:scale-110 transition-transform"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11.25l1.5 1.5.75-.75V8.758l2.276-.61a3 3 0 10-3.675-3.675l-.61 2.277H12l-.75.75 1.5 1.5M15 11.25v-2.25m0 2.25l-2.25 1.5M7.5 15l-1.5 1.5-.75-.75V12.5l2.25-1.5M7.5 15l1.5 2.25m0-2.25l-2.25-1.5M10.5 18l-1.5 1.5-.75-.75V15.5l2.25-1.5M10.5 18l1.5 2.25m0-2.25l-2.25-1.5"
                    />
                  </svg>
                  <input
                    type="color"
                    value={
                      appliedColors?.[(selectedMaterial && selectedMaterial !== "none") ? selectedMaterial : "all"] || "#ffffff"
                    }
                    onChange={(e) =>
                      onApplyColor &&
                      onApplyColor(selectedMaterial, e.target.value)
                    }
                    className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer opacity-0 z-10"
                  />
                </div>
                <div className="flex-1 grid grid-cols-5 gap-2">
                  {["#e6e2db", "#ffffff", "#1a1a1a", "#2c3e50", "#c05520"].map(
                    (color) => (
                      <button
                        key={color}
                        onClick={() =>
                          onApplyColor && onApplyColor(selectedMaterial, color)
                        }
                        className={`w-full aspect-square rounded-md border-2 transition-transform hover:scale-110 cursor-pointer ${appliedColors?.[(selectedMaterial && selectedMaterial !== "none") ? selectedMaterial : "all"] === color ? "border-[#c05520] shadow-md" : "border-gray-200"}`}
                        style={{ backgroundColor: color }}
                      />
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Texture Library */}
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 mt-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">
                  Texture Library
                </label>
                <button
                  onClick={() => {
                    if (textureTimeoutRef.current) clearTimeout(textureTimeoutRef.current);
                    if (textureFallbackTimeoutRef.current) clearTimeout(textureFallbackTimeoutRef.current);
                    setIsModelLoading(false);
                    if (onApplyMaterial) onApplyMaterial(selectedMaterial, null);
                  }}
                  className="text-[10px] text-gray-500 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-3 h-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Clear
                </button>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-1.5 py-1 items-center justify-between relative">
                <div className="flex gap-1.5 overflow-hidden flex-wrap max-h-8">
                  {textureLibrary
                    .filter(
                      (c, i) => i < 3 || c.category === activeTextureCategory,
                    )
                    .map((category) => (
                      <button
                        key={category.category}
                        onClick={() =>
                          setActiveTextureCategory(category.category)
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeTextureCategory === category.category ? "bg-[#c05520] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        {category.category}
                      </button>
                    ))}
                </div>

                <div className="relative shrink-0">
                  <button
                    onClick={() =>
                      setIsTextureDropdownOpen(!isTextureDropdownOpen)
                    }
                    className={`p-1.5 rounded-full border text-gray-500 hover:text-gray-900 bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-pointer flex items-center justify-center transition-all ${isTextureDropdownOpen ? "bg-gray-100 border-gray-300" : ""}`}
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
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>

                  {isTextureDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsTextureDropdownOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto py-1.5 flex flex-col">
                        {textureLibrary.map((category) => (
                          <button
                            key={category.category}
                            onClick={() => {
                              setActiveTextureCategory(category.category);
                              setIsTextureDropdownOpen(false);
                            }}
                            className={`px-4 py-2 text-left text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer ${activeTextureCategory === category.category ? "text-[#c05520] bg-orange-50/50" : "text-gray-700"}`}
                          >
                            {category.category}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Texture Grid */}
              <div className="grid grid-cols-3 gap-2 mt-1 max-h-[200px] overflow-y-auto pr-1">
                {textureLibrary
                  .find((c) => c.category === activeTextureCategory)
                  ?.textures.map((texture) => (
                    <button
                      key={texture.id}
                      title={texture.name}
                      disabled={isModelLoading}
                      onClick={() => {
                        if (isModelLoading || !onApplyMaterial) return;

                        if (textureTimeoutRef.current) clearTimeout(textureTimeoutRef.current);
                        if (textureFallbackTimeoutRef.current) clearTimeout(textureFallbackTimeoutRef.current);

                        // Force the loading spinner to appear before blocking the main thread
                        setIsModelLoading(true);
                        textureTimeoutRef.current = setTimeout(() => {
                          onApplyMaterial(selectedMaterial, texture);
                          // Fallback to hide spinner to cover the WebGL shader compilation block
                          textureFallbackTimeoutRef.current = setTimeout(() => setIsModelLoading(false), 3000);
                        }, 150);
                      }}
                      className={`relative rounded-xl border-2 overflow-hidden aspect-square flex flex-col items-center justify-center transition-all ${isModelLoading ? "opacity-40 cursor-not-allowed" : "cursor-pointer"} ${appliedMaterials?.[(selectedMaterial && selectedMaterial !== "none") ? selectedMaterial : "all"]?.id === texture.id ? "border-[#c05520] shadow-md" : "border-transparent hover:border-gray-200"}`}
                    >
                      {texture.preview ? (
                        <img
                          src={texture.preview}
                          alt={texture.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 p-1 text-center font-medium leading-tight">
                          {texture.name}
                        </div>
                      )}
                      {appliedMaterials?.[(selectedMaterial && selectedMaterial !== "none") ? selectedMaterial : "all"]?.id === texture.id && (
                        <TextureActiveOverlay />
                      )}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "scene" && <HdriLoadingOverlay isModelLoading={isModelLoading} />}

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

        <Tooltip1 label="Reset Position" side="left">
          <button
            onClick={() => {
              if (orbitControlsRef.current && cameraRef.current) {
                orbitControlsRef.current.target.set(0, 0, 0);
                // The camera is usually at z=300 to z=400 depending on model size,
                // let's just reset the pivot target, which fulfills "reset the pivot to 0"
                orbitControlsRef.current.update();
              }
              setToolMode("cursor");
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2.25v1.5m0 16.5v1.5m-9.75-9.75h1.5m16.5 0h1.5"
              />
            </svg>
          </button>
        </Tooltip1>

        <Tooltip1 label="Reset All Edits" side="left">
          <button
            onClick={() => {
              if (onResetAll) onResetAll();
              if (baseDimensions) setCustomSizeInput(baseDimensions);
              setToolMode("cursor");
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

        <Tooltip1 label="Zoom In" side="left">
          <button
            onClick={() => handleZoom(10)}
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
              />
            </svg>
          </button>
        </Tooltip1>

        <div className="text-[11px] font-bold text-gray-400 text-center w-full select-none">
          {zoomPercent}%
        </div>

        <Tooltip1 label="Zoom Out" side="left">
          <button
            onClick={() => handleZoom(-10)}
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
              />
            </svg>
          </button>
        </Tooltip1>

        <div className="w-6 h-px bg-gray-200 mx-auto" />

        <Tooltip1
          label={shadowEnabled ? "Shadow Off" : "Shadow On"}
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

        <div className="w-6 h-px bg-gray-200 mx-auto" />

        <Tooltip1 label="Help & Controls" side="left">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${
              showLegend
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
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
              />
            </svg>
          </button>
        </Tooltip1>
      </div>

      {/* Help / Legend Panel */}
      {showLegend && (
        <>
          {/* Invisible overlay for click-outside to close */}
          <div
            className="fixed inset-0 z-[999]"
            onClick={() => setShowLegend(false)}
          />
          <div className="absolute bottom-6 right-24 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] text-xs text-gray-600 border border-white/60 flex flex-col gap-3 z-[1000]">
            <div className="font-bold text-gray-800 text-[14px]">
              Editor Controls
            </div>
            <div className="flex gap-6 pointer-events-none">
              <div className="flex items-start gap-2">
                <img
                  src={cursorIcon}
                  className="w-4 h-4 opacity-70 mt-0.5"
                  alt=""
                />
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700">Select Tool</span>
                  <span className="text-gray-500">Rotate & explore</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <img
                  src={handIcon}
                  className="w-4 h-4 opacity-70 mt-0.5"
                  alt=""
                />
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700">Hand Tool</span>
                  <span className="text-gray-500">Pan & move</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[16px] leading-none mt-0.5">⚙️</span>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700">Mouse Wheel</span>
                  <span className="text-gray-500">Zoom in / out</span>
                </div>
              </div>
            </div>
            <div className="flex gap-6 pt-3 border-t border-gray-200/60 mt-1">
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 opacity-70 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 2.25v1.5m0 16.5v1.5m-9.75-9.75h1.5m16.5 0h1.5"
                  />
                </svg>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700">
                    Reset Position
                  </span>
                  <span className="text-gray-500">Center view</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 opacity-70 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700">Reset Edits</span>
                  <span className="text-gray-500">Clear all designs</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Export Options Popup */}
      {showExportModal && (
        <>
          {/* Invisible overlay for click-outside to close */}
          <div
            className="fixed inset-0 z-[999]"
            onClick={() => setShowExportModal(false)}
          />
          <div className="absolute right-[100px] top-6 z-[1000] pointer-events-auto">
            <div className="bg-white rounded-[15px] p-6 w-[340px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col gap-5 relative border border-gray-100">
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
                    checked={exportPngChecked}
                    onChange={(e) => setExportPngChecked(e.target.checked)}
                    className="w-5 h-5 accent-[#c05520] cursor-pointer rounded"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">
                      Export as PNG
                    </span>
                    <span className="text-[11px] text-gray-500">
                      High-res image with transparent background
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100/70 transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={exportJpgChecked}
                    onChange={(e) => setExportJpgChecked(e.target.checked)}
                    className="w-5 h-5 accent-[#c05520] cursor-pointer rounded"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">
                      Export as JPG
                    </span>
                    <span className="text-[11px] text-gray-500">
                      High-res screenshot with background
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100/70 transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={exportPdfChecked}
                    onChange={(e) => setExportPdfChecked(e.target.checked)}
                    className="w-5 h-5 accent-[#c05520] cursor-pointer rounded"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">
                      Export as PDF
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Document containing the 3D model view
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
        </>
      )}

      {/* Bottom Floating Bar removed as requested */}

      {/* Model Switch Confirmation Dialog */}
      {showSwitchDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-[90%] max-w-[360px] flex flex-col gap-5 text-center transform transition-all">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-[#c0623a] mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
                />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-900 m-0">
              Switch Model
            </h3>
            <p className="text-[13px] text-gray-500 m-0 leading-relaxed">
              Do you want to keep your current design on the new model, or start
              fresh?
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

const ScreenshotHelper = forwardRef(({ filename, bgColor }, ref) => {
  const { gl, scene, camera } = useThree();

  useImperativeHandle(ref, () => ({
    capture: async ({ png, jpg, pdf }) => {
      const currentPixelRatio = gl.getPixelRatio();
      const currentClearColor = gl.getClearColor(new THREE.Color());
      const currentClearAlpha = gl.getClearAlpha();
      const originalBackground = scene.background;

      gl.setPixelRatio(3); // High-res export multiplier

      const doExport = async (format, transparent) => {
        if (transparent) {
          gl.setClearColor(0x000000, 0); // Transparent background
          scene.background = null;
        } else {
          gl.setClearColor(new THREE.Color(bgColor), 1); // Solid background
          scene.background = new THREE.Color(bgColor);
        }

        gl.render(scene, camera);

        let mimeType = format === "jpg" ? "image/jpeg" : "image/png";
        const url = gl.domElement.toDataURL(mimeType, 1.0);

        if (format === "pdf") {
          const { jsPDF } = await import("jspdf");
          const pdfDoc = new jsPDF("landscape", "px", [
            gl.domElement.width,
            gl.domElement.height,
          ]);
          pdfDoc.addImage(
            url,
            "PNG",
            0,
            0,
            gl.domElement.width,
            gl.domElement.height,
          );
          pdfDoc.save(`${filename || "model"}.pdf`);
        } else {
          const a = document.createElement("a");
          a.href = url;
          a.download = `${filename || "model"}.${format}`;
          a.click();
        }
      };

      if (png) await doExport("png", true);
      if (jpg) await doExport("jpg", false);
      if (pdf) await doExport("pdf", false);

      // Restore original state
      scene.background = originalBackground;
      gl.setPixelRatio(currentPixelRatio);
      gl.setClearColor(currentClearColor, currentClearAlpha);
      gl.render(scene, camera);
    },
  }));

  return null;
});
