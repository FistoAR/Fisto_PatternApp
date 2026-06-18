import { useRef, useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Canvas from "./Canvas";
import RightPanel from "./RightPanel";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import * as THREE from "three";
import UploadsPopup from "./UploadsPopup";
import TapeLayoutScreen from "./TapeLayoutScreen";

// ─── Font options & Loading ───────────────────────────────────────────────────
const GOOGLE_FONTS = [
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Oswald",
  "Source Sans Pro",
  "Slabo 27px",
  "Raleway",
  "PT Sans",
  "Merriweather",
  "Roboto Condensed",
  "Noto Sans",
  "Ubuntu",
  "Roboto Slab",
  "Lora",
  "Playfair Display",
  "Nunito",
  "Poppins",
  "Arimo",
  "Titillium Web",
  "Muli",
  "PT Serif",
  "Mukta",
  "Rubik",
  "Bitter",
  "Work Sans",
  "Quicksand",
  "Fira Sans",
  "Inconsolata",
  "Oxygen",
  "Dosis",
  "Cabin",
  "Anton",
  "Josefin Sans",
  "Libre Baskerville",
  "Arvo",
  "Hind",
  "Pacifico",
  "Crimson Text",
  "Varela Round",
  "Hind Siliguri",
  "Merriweather Sans",
  "Asap",
  "Yantramanav",
  "Dancing Script",
  "Signika",
  "Heebo",
  "Ubuntu Condensed",
  "Karla",
  "Abhaya Libre",
  "Expletus Sans",
  "Alegreya",
  "EB Garamond",
  "Zilla Slab",
  "Bungee",
  "Alfa Slab One",
  "Creepster",
  "Permanent Marker",
  "Orbitron",
  "Outfit",
].sort();

const loadFont = (fontFamily) => {
  if (!fontFamily) return;
  const family = fontFamily.split(",")[0].replace(/['"]/g, "").trim();
  const fontId = `font-${family.replace(/\s+/g, "-")}`;
  if (!document.getElementById(fontId)) {
    const link = document.createElement("link");
    link.id = fontId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s+/g, "+")}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
    document.head.appendChild(link);
  }
};

const FontSelect = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadFont(value);
  }, [value]);

  useEffect(() => {
    if (isOpen) {
      // Preload all fonts so they render correctly in the dropdown list
      GOOGLE_FONTS.forEach((font) => loadFont(`"${font}", sans-serif`));
    }
  }, [isOpen]);

  const filteredFonts = GOOGLE_FONTS.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase()),
  );
  const displayValue = value.split(",")[0].replace(/['"]/g, "").trim();

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 font-medium flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
        style={{ fontFamily: value }}
      >
        <span>{displayValue}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden flex flex-col max-h-[300px]">
          <div className="p-2 border-b border-gray-100 shrink-0 bg-gray-50/50">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fonts..."
                className="w-full bg-white border border-gray-200 rounded-lg py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:border-[#c0623a] transition-colors"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-1">
            {filteredFonts.map((font) => (
              <div
                key={font}
                onClick={() => {
                  const fontVal = `"${font}", sans-serif`;
                  loadFont(fontVal);
                  onChange(fontVal);
                  setIsOpen(false);
                  setSearch("");
                }}
                onMouseEnter={() => loadFont(`"${font}", sans-serif`)}
                className="px-3 py-2 text-sm text-gray-700 hover:bg-[#fff5f0] hover:text-[#c0623a] rounded-lg cursor-pointer transition-colors"
                style={{ fontFamily: `"${font}", sans-serif` }}
              >
                {font}
              </div>
            ))}
            {filteredFonts.length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">
                No fonts found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function EditorScreen2({
  onBack,
  isActive,
  modelUrl,
  setModelUrl,
  appliedMaterials,
  appliedColors,
  appliedLastApplied,
  canvasResetKey,
  sceneBgColor,
  sceneBgImage,
}) {
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [showTapeLayout, setShowTapeLayout] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const textureCanvasRef = useRef(null);
  const [textureVersion, setTextureVersion] = useState(0);
  const canvasRef = useRef(null);

  const [wireframe, setWireframe] = useState(false);
  const [showUv, setShowUv] = useState(true);
  const [fullUv, setFullUv] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [selectedColor, setSelectedColor] = useState("none");
  const [isFrameSelected, setIsFrameSelected] = useState(false);
  const [currentSelectedFaces, setCurrentSelectedFaces] = useState(new Set());
  const [pendingTapeLayoutDataUrl, setPendingTapeLayoutDataUrl] =
    useState(null);

  // Tape layout floating container dragging
  const [tapeLayoutPos, setTapeLayoutPos] = useState({
    x: typeof window !== "undefined" ? window.innerWidth / 2 - 128 : 0,
    y: 100,
  });
  const [isDraggingTape, setIsDraggingTape] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startPosX: 0, startPosY: 0 });

  // Right Panel vertical dragging
  const [rightPanelY, setRightPanelY] = useState(24);
  const [isDraggingRightPanel, setIsDraggingRightPanel] = useState(false);
  const rightPanelDragStart = useRef({ mouseY: 0, startY: 0 });
  const rightPanelRef = useRef(null);

  const handleRightPanelPointerDown = (e) => {
    if (e.button !== 0) return;
    setIsDraggingRightPanel(true);
    rightPanelDragStart.current = {
      mouseY: e.clientY,
      startY: rightPanelY,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleRightPanelPointerMove = (e) => {
    if (!isDraggingRightPanel) return;
    const dy = e.clientY - rightPanelDragStart.current.mouseY;
    let newY = rightPanelDragStart.current.startY + dy;

    if (typeof window !== "undefined") {
      const panelHeight = rightPanelRef.current ? rightPanelRef.current.offsetHeight : 500;
      const maxY = window.innerHeight - panelHeight - 24;
      newY = Math.max(24, Math.min(newY, maxY));
    }
    setRightPanelY(newY);
  };

  const handleRightPanelPointerUp = (e) => {
    if (isDraggingRightPanel) {
      setIsDraggingRightPanel(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  useEffect(() => {
    if (pendingTapeLayoutDataUrl && typeof window !== "undefined") {
      setTapeLayoutPos({ x: window.innerWidth / 2 - 128, y: 100 });
    }
  }, [pendingTapeLayoutDataUrl]);

  const handleTapePointerDown = (e) => {
    setIsDraggingTape(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPosX: tapeLayoutPos.x,
      startPosY: tapeLayoutPos.y,
    };
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDraggingTape) return;
    const handleMove = (e) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      let newX = dragStartRef.current.startPosX + dx;
      let newY = dragStartRef.current.startPosY + dy;

      // Add boundary constraints
      if (typeof window !== "undefined") {
        const maxX = window.innerWidth - 256; // 256px is roughly w-64
        const maxY = window.innerHeight - 100;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(80, Math.min(newY, maxY)); // Protect top navbar (80px)
      }

      setTapeLayoutPos({ x: newX, y: newY });
    };
    const handleUp = () => setIsDraggingTape(false);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [isDraggingTape]);

  // ── Left panel tab ───────────────────────────────────────────────────────
  const [leftTab, setLeftTab] = useState("uploads"); // 'uploads' | 'text'

  // ── Uploaded images ──────────────────────────────────────────────────────
  const [uploadedImages, setUploadedImages] = useState([]);

  // Reset local state when canvasResetKey changes (user clicked "Clear Design")
  const prevResetKeyRef = useRef(canvasResetKey);
  useEffect(() => {
    if (canvasResetKey !== prevResetKeyRef.current) {
      prevResetKeyRef.current = canvasResetKey;
      setUploadedImages([]);
      setSelectedLayer(null);
      setIsFrameSelected(false);
      setCurrentSelectedFaces(new Set());
      setPendingTapeLayoutDataUrl(null);
      setShowTapeLayout(false);
      setBgColor("#ffffff");
      setSelectedColor("none");
      setTextProps({
        color: "#000000",
        fontSize: 80,
        fontFamily: "Outfit, sans-serif",
        bold: false,
        italic: false,
        underline: false,
      });
    }
  }, [canvasResetKey]);

  // ── Currently selected layer (for text formatting panel) ─────────────────
  const [selectedLayer, setSelectedLayer] = useState(null);

  // Reset local color override whenever we re-enter Editor 2
  useEffect(() => {
    if (isActive) {
      setSelectedColor("none");
    }
  }, [isActive]);

  // Text formatting controls state (mirrors selected layer)
  const [textProps, setTextProps] = useState({
    color: "#000000",
    fontSize: 80,
    fontFamily: "Outfit, sans-serif",
    bold: false,
    italic: false,
    underline: false,
    bend: 0,
    letterSpacing: 0,
  });

  // ── Export Modal State ───────────────────────────────────────────────────
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportGlbChecked, setExportGlbChecked] = useState(false);
  const [exportPngChecked, setExportPngChecked] = useState(false);
  const [exportSvgChecked, setExportSvgChecked] = useState(true);
  const [exportPdfChecked, setExportPdfChecked] = useState(false);

  const handleExport = async () => {
    if (
      !exportGlbChecked &&
      !exportPngChecked &&
      !exportSvgChecked &&
      !exportPdfChecked
    ) {
      alert("Please select at least one option to export.");
      return;
    }
    setIsExporting(true);

    try {
      if (exportGlbChecked) {
        if (!modelUrl || !textureCanvasRef?.current) return;
        const loader = new GLTFLoader();
        loader.load(modelUrl, (gltf) => {
          const scene = gltf.scene;
          const texture = new THREE.CanvasTexture(textureCanvasRef.current);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.flipY = true;
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
            },
            (err) => console.error("GLTFExporter error:", err),
            { binary: true },
          );
        });
      }

      if (exportPngChecked) {
        if (canvasRef?.current) {
          const url = canvasRef.current.exportAsPNG();
          const a = document.createElement("a");
          a.href = url;
          a.download = "texture-canvas.png";
          a.click();
        }
      }

      if (exportSvgChecked) {
        if (canvasRef?.current) {
          const svgContent = canvasRef.current.exportAsSVG();
          const blob = new Blob([svgContent], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "texture-layered.svg";
          a.click();
          URL.revokeObjectURL(url);
        }
      }

      if (exportPdfChecked) {
        if (canvasRef?.current) {
          const url = await canvasRef.current.exportAsPDF();
          const a = document.createElement("a");
          a.href = url;
          a.download = "texture-layered.pdf";
          a.click();
        }
      }
    } catch (err) {
      console.error("Export Error:", err);
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  const handleSelectedLayerChange = useCallback((layer) => {
    setSelectedLayer(layer);
    if (layer && layer.text !== undefined) {
      setTextProps({
        color: layer.color || "#000000",
        fontSize: layer.fontSize || 80,
        fontFamily: layer.fontFamily || "Outfit, sans-serif",
        bold: layer.bold || false,
        italic: layer.italic || false,
        underline: layer.underline || false,
        bend: layer.bend || 0,
        letterSpacing: layer.letterSpacing || 0,
      });
    }
  }, []);

  const applyTextProp = useCallback(
    (key, value) => {
      const next = { ...textProps, [key]: value };
      setTextProps(next);
      canvasRef.current?.updateSelectedTextProps({ [key]: value });
    },
    [textProps],
  );

  const handleSave = () => {
    const finalColor = selectedColor !== "none" ? bgColor : undefined;
    if (canvasRef.current?.getCleanTexture) {
      const dataUrl = canvasRef.current.getCleanTexture();
      onBack(dataUrl, finalColor);
    } else if (textureCanvasRef.current) {
      const dataUrl = textureCanvasRef.current.toDataURL("image/png");
      onBack(dataUrl, finalColor);
    } else {
      onBack(undefined, finalColor);
    }
  };

  const isTextLayer = selectedLayer && selectedLayer.text !== undefined;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white">
      <div className="flex flex-1 overflow-hidden bg-[#f5efe6]">
        {/* ── Left Side Panel ────────────────────────────────────────── */}
        <div
          className={`absolute top-0 left-0 z-20 h-full gap-4 transition-all duration-300 flex flex-col shrink-0 pointer-events-none ${
            showLeftPanel
              ? "w-[350px] py-6 pl-6 pr-0 opacity-100"
              : "w-0 py-0 pl-0 pr-0 opacity-0 overflow-hidden"
          }`}
        >
          {/* Header Actions */}
          <div className="flex justify-start items-center gap-3 w-full shrink-0 pointer-events-auto">
            {/* Back button */}
            <button
              onClick={onBack}
              className="w-14 h-12 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center border-none cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-gray-800"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
            </button>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-1.5 gap-1 shrink-0 items-center pointer-events-auto">
            <button
              onClick={() => setLeftTab("uploads")}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border-none cursor-pointer
                ${leftTab === "uploads" ? "bg-[#c0623a] text-white shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-800"}`}
            >
              Uploads
            </button>
            <button
              onClick={() => setLeftTab("text")}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border-none cursor-pointer
                ${leftTab === "text" ? "bg-[#c0623a] text-white shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-800"}`}
            >
              Text
            </button>

            {/* Collapse button */}
            <button
              onClick={() => setShowLeftPanel(false)}
              className="py-1 px-1.5 rounded-xl bg-gray-100 hover:bg-gray-200/80 transition-all border-none cursor-pointer flex items-center justify-center shrink-0 text-gray-500 hover:text-gray-800 hover:scale-105 active:scale-95"
              title="Collapse Panel"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-7 h-7"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 9l-3 3 3 3"
                />
              </svg>
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden flex flex-col pointer-events-auto">
            {leftTab === "uploads" && (
              <UploadsPopup
                onUpload={(file, url, fitType, uploadType) => {
                  if (url && !uploadedImages.some(i => (typeof i === 'string' ? i : i.url) === url)) {
                    setUploadedImages((prev) => [{ url, type: uploadType || 'image' }, ...prev]);
                  }
                  const target = file || url;
                  if (target) {
                    canvasRef.current?.uploadImage(target, fitType);
                  }
                }}
                uploadedImages={uploadedImages}
                selectedLayer={selectedLayer}
                isImageSelected={
                  selectedLayer && selectedLayer.text === undefined
                }
                isFrameSelected={isFrameSelected}
                onApplyFit={(fitType) => {
                  canvasRef.current?.applyFitToSelectedImage(fitType);
                }}
              />
            )}

            {leftTab === "text" && (
              <div className="w-full h-full min-h-0 bg-white rounded-[15px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-y-auto flex flex-col p-6 gap-6">
                {/* Add Text button */}
                <div className="w-full pb-4 border-b border-gray-100 shrink-0">
                  {/* <h2 className="text-xl font-bold text-gray-900 mb-4">Text</h2> */}
                  <button
                    onClick={() => {
                      canvasRef.current?.addText("Your Text");
                    }}
                    className="w-full py-3 rounded-xl bg-[#c0623a] hover:bg-[#a65330] text-white font-semibold text-sm flex items-center justify-center gap-2 border-none cursor-pointer transition-colors shadow-sm"
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
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    Add Text Box
                  </button>
                  <p className="text-[11px] text-gray-400 text-center mt-2">
                    Double-click a text layer to edit its content
                  </p>
                </div>

                {/* Formatting panel — only shows when text layer selected */}
                {isTextLayer ? (
                  <div className="flex flex-col gap-4">
                    {/* <h3 className="text-[13px] font-bold text-gray-800">Format Text</h3> */}

                    {/* Font Family */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                        Font
                      </label>
                      <FontSelect
                        value={textProps.fontFamily}
                        onChange={(val) => applyTextProp("fontFamily", val)}
                      />
                    </div>

                    {/* Font Size */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                        Size — {textProps.fontSize}px
                      </label>
                      <input
                        type="range"
                        min={20}
                        max={300}
                        step={2}
                        value={textProps.fontSize}
                        onChange={(e) =>
                          applyTextProp("fontSize", Number(e.target.value))
                        }
                        className="w-full accent-[#c0623a] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                        <span>20px</span>
                        <span>300px</span>
                      </div>
                    </div>

                    {/* Blend (Arch) */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                        Blend (Arch) — {textProps.bend}
                      </label>
                      <input
                        type="range"
                        min={-100}
                        max={100}
                        step={1}
                        value={textProps.bend}
                        onChange={(e) =>
                          applyTextProp("bend", Number(e.target.value))
                        }
                        className="w-full accent-[#c0623a] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                        <span>Up</span>
                        <span>Straight</span>
                        <span>Down</span>
                      </div>
                    </div>

                    {/* Letter Spacing */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                        Letter Spacing — {textProps.letterSpacing}
                      </label>
                      <input
                        type="range"
                        min={-20}
                        max={100}
                        step={1}
                        value={textProps.letterSpacing}
                        onChange={(e) =>
                          applyTextProp("letterSpacing", Number(e.target.value))
                        }
                        className="w-full accent-[#c0623a] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                        <span>Tight</span>
                        <span>Normal</span>
                        <span>Loose</span>
                      </div>
                    </div>

                    {/* Alignment Options */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                        Alignment (to Selection)
                      </label>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              canvasRef.current?.alignSelectedLayer(
                                "left",
                                null,
                              )
                            }
                            className="flex-1 flex items-center justify-center py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 border-none cursor-pointer transition-all"
                            title="Align Left"
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
                                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              canvasRef.current?.alignSelectedLayer(
                                "center",
                                null,
                              )
                            }
                            className="flex-1 flex items-center justify-center py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 border-none cursor-pointer transition-all"
                            title="Align Center Horizontal"
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
                                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              canvasRef.current?.alignSelectedLayer(
                                "right",
                                null,
                              )
                            }
                            className="flex-1 flex items-center justify-center py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 border-none cursor-pointer transition-all"
                            title="Align Right"
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
                                d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              canvasRef.current?.alignSelectedLayer(null, "top")
                            }
                            className="flex-1 flex items-center justify-center py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 border-none cursor-pointer transition-all"
                            title="Align Top"
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
                                d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              canvasRef.current?.alignSelectedLayer(
                                null,
                                "center",
                              )
                            }
                            className="flex-1 flex items-center justify-center py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 border-none cursor-pointer transition-all"
                            title="Align Center Vertical"
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
                                d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              canvasRef.current?.alignSelectedLayer(
                                null,
                                "bottom",
                              )
                            }
                            className="flex-1 flex items-center justify-center py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 border-none cursor-pointer transition-all"
                            title="Align Bottom"
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
                                d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bold / Italic / Underline */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                        Style
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => applyTextProp("bold", !textProps.bold)}
                          className={`flex-1 flex items-center justify-center py-2 rounded-xl text-sm font-bold border-none cursor-pointer transition-all ${textProps.bold ? "bg-[#c0623a] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                          B
                        </button>
                        <button
                          onClick={() =>
                            applyTextProp("italic", !textProps.italic)
                          }
                          className={`flex-1 flex items-center justify-center py-2 rounded-xl text-sm border-none cursor-pointer transition-all ${textProps.italic ? "bg-[#c0623a] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                          <span className="font-serif italic font-bold leading-none text-base">
                            I
                          </span>
                        </button>
                        <button
                          onClick={() =>
                            applyTextProp("underline", !textProps.underline)
                          }
                          className={`flex-1 flex items-center justify-center py-2 rounded-xl text-sm font-bold underline border-none cursor-pointer transition-all ${textProps.underline ? "bg-[#c0623a] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                          U
                        </button>
                      </div>
                    </div>

                    {/* Color */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                        Color
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-gray-200 shrink-0 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                          <input
                            type="color"
                            value={textProps.color}
                            onInput={(e) =>
                              applyTextProp("color", e.target.value)
                            }
                            className="absolute -inset-2 w-[200%] h-[200%] p-0 border-none cursor-pointer outline-none"
                          />
                        </div>
                        <span className="text-sm font-mono text-gray-700 bg-gray-100 rounded-lg px-3 py-1.5 uppercase tracking-wider">
                          {textProps.color}
                        </span>
                      </div>
                    </div>

                    {/* Preset Colors */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                        Preset Colors
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "#000000",
                          "#ffffff",
                          "#c0623a",
                          "#2563eb",
                          "#16a34a",
                          "#dc2626",
                          "#9333ea",
                          "#f59e0b",
                          "#64748b",
                          "#f472b6",
                        ].map((c) => (
                          <button
                            key={c}
                            onClick={() => applyTextProp("color", c)}
                            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer"
                            style={{
                              background: c,
                              borderColor:
                                textProps.color === c ? "#c0623a" : "#e5e7eb",
                              boxShadow:
                                textProps.color === c
                                  ? "0 0 0 2px #c0623a44"
                                  : undefined,
                            }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="#d1d5db"
                        className="w-10 h-10"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                        />
                      </svg>
                      <p className="text-sm text-gray-400 font-medium">
                        Select a text layer on the canvas to format it
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Center Canvas ─────────────────────────────────────────────── */}
        <div
          className="flex-1 flex flex-col h-full min-w-0 relative transition-all duration-300"
          style={{
            paddingRight: 0
          }}
        >
          {/* Floating Left Panel Trigger when collapsed */}
          {!showLeftPanel && (
            <div className="absolute top-6 left-6 z-30 flex flex-col gap-3">
              {/* Back button */}
              <button
                onClick={onBack}
                className="w-14 h-12 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center border-none cursor-pointer hover:bg-gray-50 text-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
                title="Go Back"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                  />
                </svg>
              </button>
              {/* Open button */}
              <button
                onClick={() => setShowLeftPanel(true)}
                className="w-14 h-12 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center border-none cursor-pointer hover:bg-gray-50 text-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                title="Open Design Panel"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-7.5 h-7.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9l3 3-3 3"
                  />
                </svg>
              </button>
            </div>
          )}

          {showTapeLayout && (
            <TapeLayoutScreen
              onCancel={() => setShowTapeLayout(false)}
              onSave={(dataUrl) => {
                setShowTapeLayout(false);
                if (dataUrl) {
                  setPendingTapeLayoutDataUrl(dataUrl);
                }
              }}
            />
          )}

          {/* Floating Tape Layout Apply Container */}
          {pendingTapeLayoutDataUrl && (
            <div
              style={{ top: tapeLayoutPos.y, left: tapeLayoutPos.x }}
              className="fixed z-50 bg-white p-4 rounded-2xl shadow-xl border border-gray-200 flex flex-col items-center gap-4 w-64"
            >
              <div
                className="w-full flex justify-between items-center cursor-move touch-none"
                onPointerDown={handleTapePointerDown}
              >
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider select-none pointer-events-none">
                  Tape Layout
                </span>
                <button
                  onClick={() => setPendingTapeLayoutDataUrl(null)}
                  className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 border-none cursor-pointer z-10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="w-full h-20 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden p-2">
                <img
                  src={pendingTapeLayoutDataUrl}
                  alt="Tape Preview"
                  className="max-w-full max-h-full object-contain drop-shadow-sm"
                />
              </div>
              <button
                disabled={currentSelectedFaces.size === 0}
                onClick={() => {
                  if (canvasRef.current && canvasRef.current.uploadImage) {
                    canvasRef.current.uploadImage(
                      pendingTapeLayoutDataUrl,
                      "cover",
                    );
                    setPendingTapeLayoutDataUrl(null);
                  } else {
                    setPendingTapeLayoutDataUrl(null);
                  }
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all border-none ${
                  currentSelectedFaces.size > 0
                    ? "bg-[#c0623a] text-white hover:bg-[#a54f2c] cursor-pointer shadow-md hover:shadow-lg active:scale-95"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {currentSelectedFaces.size > 0
                  ? "Apply to Frame"
                  : "Select Frame First"}
              </button>
            </div>
          )}

          <Canvas
            key={canvasResetKey}
            ref={canvasRef}
            textureCanvasRef={textureCanvasRef}
            onTextureUpdated={() => setTextureVersion((v) => v + 1)}
            modelUrl={modelUrl}
            setModelUrl={setModelUrl}
            showUv={showUv}
            fullUv={fullUv}
            bgColor={bgColor}
            isActive={isActive}
            appliedMaterials={appliedMaterials}
            onSelectedLayerChange={handleSelectedLayerChange}
            onFaceSelectionChange={(faces) => {
              setIsFrameSelected(faces.size > 0);
              setCurrentSelectedFaces(faces);
            }}
            onOpenTapeLayout={() => setShowTapeLayout(true)}
          />
        </div>

        {/* ── Right Panel ───────────────────────────────────────────────── */}
        <div
          className={`
          absolute right-0 z-40
          pb-6 pr-6 h-fit pointer-events-none
          ${showMobilePanel ? "block" : "hidden lg:block"}
        `}
          style={{
            top: `${rightPanelY}px`,
            transition: isDraggingRightPanel
              ? "none"
              : "top 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
          }}
        >
          <div ref={rightPanelRef} className="h-fit rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-white flex flex-col pointer-events-auto">
            {/* Drag Handle for Vertical Repositioning */}
            <div
              className="w-full h-5 flex items-center justify-center cursor-ns-resize hover:bg-gray-50 active:cursor-grabbing border-b border-gray-100 select-none bg-white transition-colors"
              onPointerDown={handleRightPanelPointerDown}
              onPointerMove={handleRightPanelPointerMove}
              onPointerUp={handleRightPanelPointerUp}
              title="Drag Vertically"
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <RightPanel
              canvasRef={canvasRef}
              textureCanvasRef={textureCanvasRef}
              textureVersion={textureVersion}
              modelUrl={modelUrl}
              appliedMaterials={appliedMaterials}
              appliedColors={appliedColors}
              appliedLastApplied={appliedLastApplied}
              wireframe={wireframe}
              setWireframe={setWireframe}
              showUv={showUv}
              setShowUv={setShowUv}
              fullUv={fullUv}
              setFullUv={setFullUv}
              bgColor={bgColor}
              setBgColor={setBgColor}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              sceneBgColor={sceneBgColor}
              sceneBgImage={sceneBgImage}
              hideExport={false}
              onExportClick={() => setShowExportModal(true)}
              onSave={handleSave}
              isActive={isActive}
              showPreview={showPreview}
              setShowPreview={setShowPreview}
            />
          </div>
        </div>

        {/* Mobile overlay backdrop */}
        {showMobilePanel && (
          <div
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setShowMobilePanel(false)}
          />
        )}
      </div>

      {/* Export Options Popup (Left Side) */}
      {showExportModal && (
        <>
          {/* Invisible overlay for click-outside to close */}
          <div
            className="fixed inset-0 z-[999]"
            onClick={() => setShowExportModal(false)}
          />
          <div
            className="absolute top-6 z-[1000] pointer-events-auto transition-all duration-300"
            style={{ right: showPreview ? "380px" : "240px" }}
          >
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
                      Export as PNG (Texture)
                    </span>
                    <span className="text-[11px] text-gray-500">
                      High-res image of the flat canvas texture
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100/70 transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={exportSvgChecked}
                    onChange={(e) => setExportSvgChecked(e.target.checked)}
                    className="w-5 h-5 accent-[#c05520] cursor-pointer rounded"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">
                      Export as SVG
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Vector graphics with layers & UV wireframe
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
                      Document containing vector layers & UV wireframe
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
    </div>
  );
}
