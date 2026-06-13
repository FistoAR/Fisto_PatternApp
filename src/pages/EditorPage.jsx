import { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import EditorScreen1 from "../components/editor/EditorScreen1";
import EditorScreen2 from "../components/editor/EditorScreen2";
import foldingBoxUrl from "../assets/models/Carton box/Folding/Folding.glb?url";

export default function EditorPage() {
  const location = useLocation();
  const [currentScreen, setCurrentScreen] = useState(1);
  const [modelUrl, setModelUrl] = useState(
    location.state?.initialModelUrl || foldingBoxUrl,
  );
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Global scene background state (from Screen 1)
  const [sceneBgColor, setSceneBgColor] = useState("#e6e2db");
  const [sceneBgImage, setSceneBgImage] = useState(null);

  // Key to force Screen 2 canvas re-mount on reset
  const [canvasResetKey, setCanvasResetKey] = useState(0);

  // Lift activeTab state here to preserve it when switching screens
  const [activeTab, setActiveTab] = useState(() => {
    return modelUrl && modelUrl.includes("Folding.glb")
      ? "models"
      : "edit";
  });

  // Unified state for size, textures, colors, and physical materials
  const [editorState, setEditorState] = useState({
    textures: {},
    colors: {},
    materials: {},
    customSize: null,
    lastApplied: {},
  });

  // History stack
  const history = useRef([editorState]);
  const historyIndex = useRef(0);

  const pushHistory = (newStateUpdates) => {
    setEditorState((prevState) => {
      const nextState = { ...prevState, ...newStateUpdates };
      const currentStack = history.current.slice(0, historyIndex.current + 1);
      const lastItem = currentStack[currentStack.length - 1];
      const isDuplicate =
        lastItem &&
        lastItem.textures === nextState.textures &&
        lastItem.colors === nextState.colors &&
        lastItem.materials === nextState.materials &&
        lastItem.customSize === nextState.customSize;

      if (!isDuplicate) {
        history.current = [...currentStack, nextState];
        historyIndex.current = history.current.length - 1;
      }
      return nextState;
    });
  };

  const handleUndo = () => {
    if (historyIndex.current > 0) {
      historyIndex.current -= 1;
      setEditorState(history.current[historyIndex.current]);
    }
  };

  const handleRedo = () => {
    if (historyIndex.current < history.current.length - 1) {
      historyIndex.current += 1;
      setEditorState(history.current[historyIndex.current]);
    }
  };

  const canUndo = historyIndex.current > 0;
  const canRedo = historyIndex.current < history.current.length - 1;

  const handleResetAll = () => {
    const defaultState = {
      textures: {},
      colors: {},
      materials: {},
      customSize: null,
      lastApplied: {},
    };
    setEditorState(defaultState);
    history.current = [defaultState];
    historyIndex.current = 0;
    setCanvasResetKey((k) => k + 1);
  };

  // Transition from Screen 1 to Screen 2
  const handleProceedToTextureEditor = (materialName) => {
    setSelectedMaterial(materialName || null);
    setCurrentScreen(2);
  };

  // Optional: Transition back to Screen 1
  const handleBackToModelViewer = (textureDataUrl) => {
    if (typeof textureDataUrl === "string") {
      const targetMat = selectedMaterial || "all";
      pushHistory({
        textures: { ...editorState.textures, [targetMat]: textureDataUrl },
        lastApplied: { ...editorState.lastApplied, [targetMat]: "texture" },
      });
    }
    setSelectedMaterial(null);
    setCurrentScreen(1);
  };

  const colorDebounceRef = useRef(null);

  const handleApplyColor = (materialId, colorHex) => {
    const targetMat = (materialId && materialId !== "none") ? materialId : "all";
    
    setEditorState((prevState) => {
      const nextState = {
        ...prevState,
        colors: { ...prevState.colors, [targetMat]: colorHex },
        lastApplied: { ...prevState.lastApplied, [targetMat]: "color" },
      };

      if (colorDebounceRef.current) clearTimeout(colorDebounceRef.current);
      colorDebounceRef.current = setTimeout(() => {
        history.current = history.current.slice(0, historyIndex.current + 1);
        history.current.push(nextState);
        historyIndex.current = history.current.length - 1;
      }, 300);

      return nextState;
    });
  };

  const handleApplyMaterial = (materialId, materialType) => {
    const targetMat = (materialId && materialId !== "none") ? materialId : "all";
    if (materialType === null) {
      if (targetMat === "all") {
        pushHistory({
          materials: {},
          lastApplied: {},
        });
      } else {
        const newMaterials = { ...editorState.materials };
        delete newMaterials[targetMat];
        const newLastApplied = { ...editorState.lastApplied };
        delete newLastApplied[targetMat];
        
        pushHistory({
          materials: newMaterials,
          lastApplied: newLastApplied,
        });
      }
    } else {
      pushHistory({
        materials: { ...editorState.materials, [targetMat]: materialType },
        lastApplied: { ...editorState.lastApplied, [targetMat]: "material" },
      });
    }
  };

  const handleApplyCustomSize = (size) => {
    pushHistory({ customSize: size });
  };

  return (
    <div className="w-full h-full overflow-hidden relative">
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${currentScreen === 1 ? "z-10 opacity-100" : "-z-10 opacity-0 pointer-events-none"}`}
      >
        <EditorScreen1
          modelUrl={modelUrl}
          setModelUrl={setModelUrl}
          appliedTextures={editorState.textures}
          appliedColors={editorState.colors}
          appliedMaterials={editorState.materials}
          appliedLastApplied={editorState.lastApplied}
          appliedCustomSize={editorState.customSize}
          selectedMaterial={selectedMaterial}
          setSelectedMaterial={setSelectedMaterial}
          sceneBgColor={sceneBgColor}
          setSceneBgColor={setSceneBgColor}
          sceneBgImage={sceneBgImage}
          setSceneBgImage={setSceneBgImage}
          onProceed={handleProceedToTextureEditor}
          onApplyColor={handleApplyColor}
          onApplyMaterial={handleApplyMaterial}
          onApplyCustomSize={handleApplyCustomSize}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onResetAll={handleResetAll}
          canUndo={canUndo}
          canRedo={canRedo}
          isActive={currentScreen === 1}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${currentScreen === 2 ? "z-10 opacity-100" : "-z-10 opacity-0 pointer-events-none"}`}
      >
        <EditorScreen2
          modelUrl={modelUrl}
          setModelUrl={setModelUrl}
          appliedMaterials={editorState.materials}
          onBack={handleBackToModelViewer}
          isActive={currentScreen === 2}
          canvasResetKey={canvasResetKey}
          sceneBgColor={sceneBgColor}
          sceneBgImage={sceneBgImage}
        />
      </div>
    </div>
  );
}
