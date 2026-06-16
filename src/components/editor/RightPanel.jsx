import {
  Suspense,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas as R3FCanvas, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import SafeEnvironment from "./SafeEnvironment";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

function BackgroundImage({ url }) {
  const { scene } = useThree();
  const texture = useLoader(THREE.TextureLoader, url);
  
  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      scene.background = texture;
    }
    return () => { scene.background = null; }
  }, [texture, scene]);

  return null;
}

const packageColors = [
  { id: "cream", color: "#f5e6d3" },
  { id: "tan", color: "#c9a96e" },
  { id: "brown", color: "#8b7355" },
  { id: "darkbrown", color: "#4a3728" },
  { id: "green", color: "#4a7c59" },
  { id: "silver", color: "#d4d4d8" },
];

function LoaderOverlay() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none">
      <div className="relative w-10 h-10 mb-2">
        <div className="absolute inset-0 rounded-full border-4 border-white/20" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"
          style={{ animationDuration: "0.8s" }}
        />
      </div>
      <p className="text-white font-bold text-xs">Loading Model...</p>
      <p className="text-white/70 text-[10px] mt-0.5">{Math.round(progress)}%</p>
    </div>
  );
}

export default function RightPanel({
  canvasRef,
  textureCanvasRef,
  textureVersion,
  modelUrl,
  appliedMaterials,
  appliedColors,
  wireframe,
  setWireframe,
  showUv,
  setShowUv,
  fullUv,
  setFullUv,
  bgColor,
  setBgColor,
  sceneBgColor = "#e5e5e5",
  sceneBgImage = null,
  hideExport,
  onSave,
  onExportClick,
  customSize,
  isActive,
  selectedColor,
  setSelectedColor,
  onOpenTapeLayout,
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [panelWidth, setPanelWidth] = useState(() =>
    Math.max(280, window.innerWidth * 0.2),
  );

  const customColorInputRef = useRef(null);
  const lastColorUpdate = useRef(0);
  const colorTimeoutRef = useRef(null);
  const captureRef = useRef(null);
  const orbitControlsRef = useRef(null);

  const handleExportCanvasPNG = () => {
    if (!canvasRef?.current) return;
    const url = canvasRef.current.exportAsPNG();
    const a = document.createElement("a");
    a.href = url;
    a.download = "texture-canvas.png";
    a.click();
    setShowExportMenu(false);
  };

  const handleExportModelPNG = () => {
    if (!captureRef.current) return;
    captureRef.current.capture();
    setShowExportMenu(false);
  };

  const handleExportSVG = () => {
    if (!canvasRef?.current) return;
    const svgContent = canvasRef.current.exportAsSVG();
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "texture-layered.svg";
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportPDF = async () => {
    if (!canvasRef?.current) return;
    setExporting(true);
    try {
      const url = await canvasRef.current.exportAsPDF();
      const a = document.createElement("a");
      a.href = url;
      a.download = "texture-layered.pdf";
      a.click();
    } catch (err) {
      console.error("PDF Export Error:", err);
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  };

  const handleExportGLB = () => {
    if (!modelUrl || !textureCanvasRef?.current) return;
    setExporting(true);
    setShowExportMenu(false);
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const scene = gltf.scene;
        const texture = new THREE.CanvasTexture(textureCanvasRef.current);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.flipY = false;
        // No uv layout offset/scale applying, exactly 1:1 raw mapping
        texture.needsUpdate = true;
        scene.traverse((obj) => {
          if (!obj.isMesh) return;
          const mats = Array.isArray(obj.material)
            ? obj.material
            : [obj.material];
          mats.forEach((mat) => {
            if (mat && "map" in mat) {
              mat.map = texture;
              mat.needsUpdate = true;
            }
          });
        });
        const exporter = new GLTFExporter();
        exporter.parse(
          scene,
          (glb) => {
            const blob = new Blob([glb], { type: "model/gltf-binary" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "model-export.glb";
            a.click();
            URL.revokeObjectURL(url);
            setExporting(false);
          },
          (err) => {
            console.error("GLTFExporter error:", err);
            setExporting(false);
          },
          { binary: true },
        );
      },
      undefined,
      () => setExporting(false),
    );
  };

  const handleCustomColorChange = (e) => {
    const newColor = e.target.value;
    setSelectedColor("custom");

    const now = Date.now();
    if (now - lastColorUpdate.current >= 50) {
      setBgColor(newColor);
      lastColorUpdate.current = now;
    } else {
      clearTimeout(colorTimeoutRef.current);
      colorTimeoutRef.current = setTimeout(() => {
        setBgColor(newColor);
        lastColorUpdate.current = Date.now();
      }, 50);
    }
  };

  const resetPreviewCamera = () => {
    orbitControlsRef.current?.reset();
  };

  return (
    <aside
      style={{ width: panelWidth, minWidth: "20vw" }}
      className="bg-white border-l border-gray-100 flex flex-col shrink-0 h-auto overflow-y-auto relative z-10 max-[1024px]:!w-[230px] max-[640px]:!w-[270px]"
    >
      <div className="flex gap-2 px-3 pb-2 pt-1">

      </div>

      <div className="px-3 pb-2" style={{ display: "none" }}>
        <div className="flex items-center justify-center gap-3 bg-white border border-gray-100 px-3 py-2 rounded-xl text-[11px] shadow-sm flex-wrap">
          <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={fullUv}
              onChange={(e) => setFullUv(e.target.checked)}
              className="cursor-pointer"
            />
            Full UV
          </label>
          <div className="w-px h-4 bg-gray-200" />
          <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={wireframe}
              onChange={(e) => setWireframe(e.target.checked)}
              className="cursor-pointer"
            />
            Wireframe
          </label>
        </div>
      </div>

      {/* 3D Preview */}
      <div className="px-3 pb-2 relative select-none">
        <div
          className="relative rounded-xl overflow-hidden aspect-square"
          style={{ background: sceneBgColor }}
        >
          <LoaderOverlay />
          <R3FCanvas
            className="w-full h-full"
            camera={{ position: [0, 0.2, 3.2], fov: 40 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
            onCreated={({ gl }) => {
              gl.outputColorSpace = THREE.SRGBColorSpace;
              gl.toneMapping = THREE.NeutralToneMapping;
              gl.toneMappingExposure = 1;
              if (!sceneBgImage) gl.setClearColor(new THREE.Color(sceneBgColor), 1);
            }}
          >
            {!sceneBgImage && <color attach="background" args={[sceneBgColor]} />}
            {sceneBgImage && (
              <Suspense fallback={null}>
                <BackgroundImage url={sceneBgImage} />
              </Suspense>
            )}
            <ambientLight intensity={0.7} />
            <SafeEnvironment preset="city" />
            <directionalLight position={[4, 5, 4]} intensity={0.8} />
            <directionalLight position={[-4, 3, -4]} intensity={0.3} />
            <Suspense fallback={null}>
              {modelUrl && (
                <AutoSizedModel
                  key={modelUrl}
                  modelUrl={modelUrl}
                  textureCanvasRef={textureCanvasRef}
                  textureVersion={textureVersion}
                  wireframe={wireframe}
                  appliedMaterials={appliedMaterials}
                  appliedColors={appliedColors}
                  bgColor={bgColor}
                  selectedColor={selectedColor}
                  isActive={isActive}
                />
              )}
            </Suspense>
            <ScreenshotHelper ref={captureRef} />
            <OrbitControls
              ref={orbitControlsRef}
              enablePan={false}
              enableZoom={true}
              minDistance={1.5}
              maxDistance={10}
              minPolarAngle={0}
              maxPolarAngle={Math.PI}
            />
          </R3FCanvas>

          {/* Refresh button */}
          <button
            type="button"
            title="Reset model view"
            onClick={resetPreviewCamera}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/70 backdrop-blur-sm border-none cursor-pointer flex items-center justify-center text-gray-800 hover:bg-white transition-colors z-10"
            style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>

          {/* Resize Handle */}
          <div
            className="absolute bottom-0 left-0 w-8 h-8 cursor-sw-resize flex items-end justify-start z-20"
            onPointerDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
              const startX = e.clientX;
              const startWidth = panelWidth;
              const maxAllowedWidth = window.innerWidth * 0.27;
              const minAllowedWidth = window.innerWidth * 0.2;

              const onMove = (moveEvent) => {
                const dx = moveEvent.clientX - startX;
                // Subtract dx because dragging left (negative dx) increases width
                setPanelWidth(
                  Math.max(
                    minAllowedWidth,
                    Math.min(maxAllowedWidth, startWidth - dx),
                  ),
                );
              };

              const onUp = () => {
                setIsResizing(false);
                document.removeEventListener("pointermove", onMove);
                document.removeEventListener("pointerup", onUp);
              };

              document.addEventListener("pointermove", onMove);
              document.addEventListener("pointerup", onUp);
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 0 L32 32 L0 32 Z" fill="#cbd5e1" />
              <line
                x1="6"
                y1="22"
                x2="22"
                y2="6"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="12"
                y1="26"
                x2="26"
                y2="12"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="px-3 pb-2">
        <button
          onClick={onSave}
          className="w-full py-[11px] rounded-[10px] text-white font-bold text-[15px] border-none cursor-pointer transition-all duration-200 hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
          style={{ background: "#eab308" }}
        >
          Save
        </button>
      </div>

      {/* Export Button (Below Save) */}
      {!hideExport && (
        <div className="px-3 pb-2 relative">
          <button
            onClick={() => {
              if (onExportClick) {
                onExportClick();
              } else {
                setShowExportMenu(!showExportMenu);
              }
            }}
            className="w-full py-[11px] rounded-[10px] text-white font-bold text-[15px] border-none cursor-pointer transition-all duration-200 hover:shadow-lg hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-1.5"
            style={{ background: "#c0623a" }}
          >
            {exporting ? (
              <span className="flex items-center gap-1.5 text-white">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Exporting...
              </span>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
                Export
              </>
            )}
          </button>

          {/* Export dropdown */}
          {showExportMenu && !onExportClick && (
            <div className="absolute right-full bottom-0 mr-3 w-64 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.14)] border border-gray-100 overflow-hidden z-50">
              {/* GLB */}
              <button
                onClick={handleExportGLB}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-800 font-semibold hover:bg-orange-50 transition-colors border-none cursor-pointer bg-transparent text-left"
              >
                <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="#c0623a"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                    />
                  </svg>
                </span>
                <div className="flex flex-col">
                  <span className="text-gray-900 leading-tight mb-0.5">
                    Export 3D Model
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    .glb format
                  </span>
                </div>
              </button>

              <div className="h-px bg-gray-100 mx-4" />

              {/* Model PNG */}
              <button
                onClick={handleExportModelPNG}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-800 font-semibold hover:bg-purple-50 transition-colors border-none cursor-pointer bg-transparent text-left"
              >
                <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="#7c3aed"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                    />
                  </svg>
                </span>
                <div className="flex flex-col">
                  <span className="text-gray-900 leading-tight mb-0.5">
                    Model as .PNG
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    3D render screenshot with texture
                  </span>
                </div>
              </button>

              <div className="h-px bg-gray-100 mx-4" />

              {/* Canvas PNG */}
              <button
                onClick={handleExportCanvasPNG}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-800 font-semibold hover:bg-blue-50 transition-colors border-none cursor-pointer bg-transparent text-left"
              >
                <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="#3b82f6"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                </span>
                <div className="flex flex-col">
                  <span className="text-gray-900 leading-tight mb-0.5">
                    Canvas as .PNG
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    Flat texture image (2048×2048)
                  </span>
                </div>
              </button>

              <div className="h-px bg-gray-100 mx-4" />

              {/* Canvas SVG */}
              <button
                onClick={handleExportSVG}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-800 font-semibold hover:bg-green-50 transition-colors border-none cursor-pointer bg-transparent text-left"
              >
                <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="#16a34a"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
                    />
                  </svg>
                </span>
                <div className="flex flex-col">
                  <span className="text-gray-900 leading-tight mb-0.5">
                    Canvas as .SVG
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    Vector layers (for Illustrator)
                  </span>
                </div>
              </button>

              <div className="h-px bg-gray-100 mx-4" />

              {/* Canvas PDF */}
              <button
                onClick={handleExportPDF}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-800 font-semibold hover:bg-red-50 transition-colors border-none cursor-pointer bg-transparent text-left"
              >
                <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="#dc2626"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </span>
                <div className="flex flex-col">
                  <span className="text-gray-900 leading-tight mb-0.5">
                    Canvas as .PDF
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    Layered PDF document
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Package Color */}
      <div className="px-3 pb-3">
        <h3 className="text-[12px] font-semibold text-gray-800 mb-2.5 mt-0">
          Package Color
        </h3>
        <div className="flex items-center gap-[6px]">
          {packageColors.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedColor(c.id);
                setBgColor(c.color);
              }}
              className="w-[26px] h-[26px] rounded-full cursor-pointer transition-all duration-200 hover:scale-110 p-0"
              style={{
                background: c.color,
                border:
                  selectedColor === c.id
                    ? "2px solid #c0623a"
                    : "2px solid transparent",
                outline: selectedColor === c.id ? "1px solid #c0623a" : "none",
                outlineOffset: "1px",
              }}
            />
          ))}
          {/* Add color button */}
          <button
            onClick={() => customColorInputRef.current?.click()}
            className="w-[26px] h-[26px] rounded-full bg-transparent cursor-pointer flex items-center justify-center p-0 transition-all duration-200 hover:scale-110 relative"
            style={{
              border:
                selectedColor === "custom"
                  ? "2px solid #c0623a"
                  : "1.5px solid #4a9e6e",
              outline:
                selectedColor === "custom" ? "1px solid #c0623a" : "none",
              outlineOffset: "1px",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill={selectedColor === "custom" ? "#c0623a" : "#4a9e6e"}
              className="w-3 h-3"
            >
              <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
            </svg>
            <input
              type="color"
              ref={customColorInputRef}
              onChange={handleCustomColorChange}
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
            />
          </button>
        </div>
      </div>
    </aside>
  );
}

function MaterialItem({ icon, title, subtitle, hasArrow }) {
  const iconBg = { shadow: "#fef3c7", camera: "#fce7f3", size: "#e0e7ff" };
  const iconColor = { shadow: "#d97706", camera: "#db2777", size: "#6366f1" };
  const icons = {
    shadow: (
      <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM6.75 9.25a.75.75 0 0 0 0 1.5h4.59l-2.1 1.95a.75.75 0 0 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25a.75.75 0 1 0-1.02 1.1l2.1 1.95H6.75Z" />
    ),
    camera: (
      <path d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    ),
    size: (
      <path
        fillRule="evenodd"
        d="M1 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V6Zm4 1.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm2 3a4 4 0 0 0-3.665 2.395.75.75 0 0 0 .416 1A8.98 8.98 0 0 0 7 14.5a8.98 8.98 0 0 0 3.249-.605.75.75 0 0 0 .416-1A4 4 0 0 0 7 10.5Z"
        clipRule="evenodd"
      />
    ),
  };

  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer group">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: iconBg[icon] }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill={iconColor[icon]}
          className="w-[16px] h-[16px]"
        >
          {icons[icon]}
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-gray-800 m-0 leading-tight">
          {title}
        </p>
        <p className="text-[10px] text-gray-400 m-0 leading-tight mt-[2px]">
          {subtitle}
        </p>
      </div>
      {hasArrow && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0"
        >
          <path
            fillRule="evenodd"
            d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );
}

function AutoSizedModel({
  modelUrl,
  textureCanvasRef,
  textureVersion,
  wireframe,
  customSize,
  appliedMaterials,
  appliedColors,
  bgColor,
  selectedColor,
  isActive,
}) {
  const { scene } = useGLTF(modelUrl);
  const { gl } = useThree();
  const clonedScene = useMemo(() => {
    if (!scene) return null;

    const clone = cloneSkeleton(scene);
    clone.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      
      const processMat = (mat) => {
        if (!mat) return mat;
        const m = mat.clone();
        m.userData.originalMap = m.map;
        m.userData.originalColorHex = m.color.getHex();
        // Remove the default map so "Upload your design" is hidden immediately
        m.map = null;
        return m;
      };

      obj.material = Array.isArray(obj.material)
        ? obj.material.map(processMat)
        : processMat(obj.material);
    });
    return clone;
  }, [scene]);
  // No uvLayout memoization needed
  const canvasTextureRef = useRef(null);
  const appliedTextureVersionRef = useRef(null);
  const appliedWireframeRef = useRef(null);
  const appliedMaterialsRef = useRef(null);
  const appliedColorsRef = useRef(null);
  const appliedBgColorRef = useRef(null);
  const appliedSelectedColorRef = useRef(null);
  const appliedActiveRef = useRef(false);

  const { autoTransform, baseDims } = useMemo(() => {
    if (!clonedScene)
      return { autoTransform: { scale: 1, offset: [0, 0, 0] }, baseDims: null };
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 1.7 / maxDim;
    return {
      autoTransform: {
        scale,
        offset: [-center.x * scale, -center.y * scale, -center.z * scale],
      },
      baseDims: {
        length: Math.round(size.x * 1000),
        height: Math.round(size.y * 1000),
        width: Math.round(size.z * 1000),
      },
    };
  }, [clonedScene]);

  const customScale = useMemo(() => {
    if (!baseDims || !customSize) return [1, 1, 1];
    return [
      customSize.length ? customSize.length / baseDims.length : 1,
      customSize.height ? customSize.height / baseDims.height : 1,
      customSize.width ? customSize.width / baseDims.width : 1,
    ];
  }, [baseDims, customSize]);

  // Apply texture + wireframe + materials
  useEffect(() => {
    if (
      wireframe === appliedWireframeRef.current &&
      appliedMaterials === appliedMaterialsRef.current &&
      appliedColors === appliedColorsRef.current &&
      bgColor === appliedBgColorRef.current &&
      selectedColor === appliedSelectedColorRef.current &&
      appliedActiveRef.current === isActive &&
      canvasTextureRef.current
    ) {
      return;
    }
    if (!clonedScene || !textureCanvasRef?.current) return;

    const textureCanvas = textureCanvasRef.current;
    // Create the canvas texture once
    if (!canvasTextureRef.current) {
      const tex = new THREE.CanvasTexture(textureCanvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      tex.flipY = false;
      if (modelUrl && modelUrl.includes("Tape")) {
        tex.center.set(0.5, 0.5);
        tex.rotation = -Math.PI / 2;
      }
      canvasTextureRef.current = tex;
    }

    clonedScene.traverse((obj) => {
      if (!obj.isMesh || obj.userData.isDecal) return;
      const materials = Array.isArray(obj.material)
        ? obj.material
        : [obj.material];
      for (const mat of materials) {
        if (!mat) continue;
        
        // --- OVERLAY CANVAS TEXTURE VIA DECAL MESH ---
        if (!obj.userData.decalMesh) {
          const decalMat = new THREE.MeshStandardMaterial({
            transparent: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1,
          });
          const decal = new THREE.Mesh(obj.geometry, decalMat);
          decal.userData.isDecal = true;
          // Scale slightly to avoid z-fighting
          decal.scale.set(1.002, 1.002, 1.002);
          obj.add(decal);
          obj.userData.decalMesh = decal;
        }
        
        const decalMat = obj.userData.decalMesh.material;
        decalMat.map = canvasTextureRef.current;
        decalMat.color.set(0xffffff);
        decalMat.needsUpdate = true;

        // --- APPLY PBR MATERIALS TO BASE MESH ---
        const materialType = appliedMaterials
          ? appliedMaterials[mat.name] || appliedMaterials["all"]
          : null;

        if (typeof materialType === "object" && materialType !== null) {
          // PBR Material
          if (mat.userData.currentPbrId !== materialType.id) {
            mat.userData.currentPbrId = materialType.id;
            mat.color.setHex(0xffffff);
            mat.map = null;
            mat.normalMap = null;
            mat.roughnessMap = null;
            mat.metalnessMap = null;
            mat.aoMap = null;

            const loadMap = (url, mapType, isColorSpace) => {
              if (!url) return;
              new THREE.TextureLoader().load(url, (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                if (isColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
                mat[mapType] = texture;
                mat.needsUpdate = true;
              });
            };

            if (materialType.maps.albedo) loadMap(materialType.maps.albedo, "map", true);
            if (materialType.maps.normal) loadMap(materialType.maps.normal, "normalMap", false);
            if (materialType.maps.roughness) loadMap(materialType.maps.roughness, "roughnessMap", false);
            if (materialType.maps.metallic) loadMap(materialType.maps.metallic, "metalnessMap", false);
            if (materialType.maps.ao) loadMap(materialType.maps.ao, "aoMap", false);

            mat.roughness = 1.0;
            mat.metalness = 1.0;
            mat.needsUpdate = true;
          }
        } else {
          // No PBR Material
          if (mat.userData.currentPbrId !== null) {
            mat.userData.currentPbrId = null;
            mat.normalMap = null;
            mat.roughnessMap = null;
            mat.metalnessMap = null;
            mat.aoMap = null;
            mat.roughness = Math.max(0.72, mat.roughness);
            mat.metalness = 0;
            mat.needsUpdate = true;
          }
        }

        // --- APPLY COLORS ---
        // Precedence: 
        // 1. If Editor 2 swatch is used (not default cream), use `bgColor`.
        // 2. Else fallback to `appliedColors` from Editor 1.
        let finalColorHex = null;

        // "cream" (#f5e6d3) is the default unselected state for selectedColor in Editor 2.
        // Wait, what if they actually want cream? It sets selectedColor="cream".
        // But if they haven't touched it, it's "cream" by default. If we ALWAYS apply `bgColor`, 
        // we override Editor 1's `appliedColors` immediately on load. 
        // We only want to override if they actually changed it!
        // A better heuristic: we can track if they clicked a swatch by checking if we have a state change,
        // but it's simpler: if appliedColors has a value, use it, UNLESS selectedColor changes.
        // Let's use `bgColor` as the base if it's explicitly set. Actually, the user asked to 
        // "removwe that old color and update new one without collapse those"
        // Let's check if the current bgColor matches the Editor 1 color, or if it has been updated.
        const editor1Color = appliedColors ? (appliedColors[mat.name] || appliedColors["all"]) : null;

        // We can give precedence to bgColor. Since we don't have a perfect dirty flag,
        // we apply editor1Color on first mount, but if they click a swatch in Editor 2, 
        // we apply bgColor.
        // If Editor 1 passed a color, and Editor 2's bgColor is default "#ffffff" or "cream" (#f5e6d3)
        // and hasn't been explicitly clicked, we might accidentally override it.
        // Let's just use `bgColor` but we need to know if `bgColor` is user-selected or default.
        // We will just use `bgColor` directly. The parent sets it.
        // Wait, the parent's default `bgColor` is "#ffffff" (in EditorScreen2). 
        // Wait, packageColors default is "cream". EditorScreen2 state is "#ffffff".
        // Let's just use `bgColor` if it differs from "#ffffff", or if `selectedColor` !== "cream" (or actually, if Editor 2 color is actively used).
        
        if (selectedColor && selectedColor !== "none") {
           finalColorHex = bgColor;
        } else if (editor1Color) {
           finalColorHex = editor1Color;
        }

        if (finalColorHex) {
          mat.color.set(finalColorHex);
          // Hide base map so 'your design here' doesn't show under the decal
          if (!mat.userData.currentPbrId && mat.map !== null) {
            mat.map = null;
          }
          mat.needsUpdate = true;
        } else if (!materialType) {
          // Restore Original color only, keep map null to hide "upload your design"
          if (mat.userData.originalColorHex !== undefined) {
             mat.color.setHex(mat.userData.originalColorHex);
          }
          if (mat.map !== null && !mat.userData.currentPbrId) {
             mat.map = null;
          }
          mat.needsUpdate = true;
        } else if (materialType) {
           // For PBR materials with no custom color, default to white
           mat.color.setHex(0xffffff);
           if (mat.map !== null && !mat.userData.currentPbrId) {
             mat.map = null;
           }
           mat.needsUpdate = true;
        }

        if ("envMapIntensity" in mat) mat.envMapIntensity = 0.08;
        if (mat.side !== undefined) mat.side = THREE.DoubleSide;
        if ("toneMapped" in mat) mat.toneMapped = true;
        mat.needsUpdate = true;
      }

      // Wireframe overlay
      let wireframeLines = obj.children.find(
        (c) => c.isLineSegments && c.name === "wireframeHelper",
      );
      if (wireframe && !wireframeLines) {
        const geo = new THREE.WireframeGeometry(obj.geometry);
        const mat = new THREE.LineBasicMaterial({
          color: 0x000000,
          transparent: true,
          opacity: 0.15,
        });
        const line = new THREE.LineSegments(geo, mat);
        line.name = "wireframeHelper";
        obj.add(line);
      } else if (!wireframe && wireframeLines) {
        obj.remove(wireframeLines);
        wireframeLines.geometry.dispose();
        wireframeLines.material.dispose();
      }
    });

    appliedWireframeRef.current = wireframe;
    appliedMaterialsRef.current = appliedMaterials;
    appliedColorsRef.current = appliedColors;
    appliedBgColorRef.current = bgColor;
    appliedSelectedColorRef.current = selectedColor;
    appliedActiveRef.current = true;
  }, [clonedScene, gl, textureCanvasRef, wireframe, appliedMaterials, appliedColors, bgColor, selectedColor, isActive]);

  // Fast-path for just updating the texture without re-traversing the scene
  useEffect(() => {
    if (textureVersion === appliedTextureVersionRef.current) return;
    
    if (canvasTextureRef.current && textureCanvasRef?.current) {
      // Just mark needsUpdate. Three.js will upload the new canvas pixels to GPU.
      canvasTextureRef.current.needsUpdate = true;
    }
    appliedTextureVersionRef.current = textureVersion;
  }, [textureVersion, textureCanvasRef]);

  if (!clonedScene) return null;

  return (
    <group
      position={autoTransform.offset}
      scale={autoTransform.scale}
      rotation={[0, Math.PI / 6, 0]}
    >
      <group scale={customScale}>
        <primitive object={clonedScene} dispose={null} />
      </group>
    </group>
  );
}

// Lives inside R3FCanvas — uses useThree to access the live renderer, scene, camera
const ScreenshotHelper = forwardRef((_, ref) => {
  const { gl, scene, camera } = useThree();

  useImperativeHandle(ref, () => ({
    capture: () => {
      // Save current pixel ratio
      const currentPixelRatio = gl.getPixelRatio();

      // Temporarily set a high pixel ratio for a high-quality render
      gl.setPixelRatio(4);

      // Force a fresh render with the high-res state
      gl.render(scene, camera);

      // Read the framebuffer
      const url = gl.domElement.toDataURL("image/png", 1.0);

      // Restore original state to prevent the UI from staying high-res/slow
      gl.setPixelRatio(currentPixelRatio);
      gl.render(scene, camera);

      const a = document.createElement("a");
      a.href = url;
      a.download = "model-render-high-res.png";
      a.click();
    },
  }));

  return null;
});
