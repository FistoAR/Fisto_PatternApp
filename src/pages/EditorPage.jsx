import { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import EditorScreen1 from "../components/editor/EditorScreen1";
import EditorScreen2 from "../components/editor/EditorScreen2";
import ovalContainerUrl from "../assets/models/Food Containers/Oval/oval .glb?url";
import { getSingleModelUrl } from "../components/editor/LayoutPopup";

export default function EditorPage() {
  const location = useLocation();
  const [currentScreen, setCurrentScreen] = useState(1);
  const [modelUrl, setModelUrl] = useState(
    location.state?.initialModelUrl || ovalContainerUrl,
  );
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Global scene background state (from Screen 1)
  const [sceneBgColor, setSceneBgColor] = useState("#e6e2db");
  const [sceneBgImage, setSceneBgImage] = useState(null);

  // Lifted environment and lighting states
  const [hdriPreset, setHdriPreset] = useState("studio");
  const [envIntensity, setEnvIntensity] = useState(0.4);
  const [ambLight, setAmbLight] = useState(0.3);
  const [dirLight, setDirLight] = useState(0.8);
  const [shadowOpacity, setShadowOpacity] = useState(0.25);
  const [customHdri, setCustomHdri] = useState(null);

  // Key to force Screen 2 canvas re-mount on reset
  const [canvasResetKey, setCanvasResetKey] = useState(0);

  // Lift activeTab state here to preserve it when switching screens
  const [activeTab, setActiveTab] = useState("models");

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

  const onLoadScene = (scene) => {
    if (scene.modelUrl) setModelUrl(scene.modelUrl);
    if (scene.sceneBgColor !== undefined) setSceneBgColor(scene.sceneBgColor);
    if (scene.sceneBgImage !== undefined) setSceneBgImage(scene.sceneBgImage);
    if (scene.editorState) {
      setEditorState(scene.editorState);
      history.current = [scene.editorState];
      historyIndex.current = 0;
    }
    if (scene.hdriPreset !== undefined) setHdriPreset(scene.hdriPreset);
    if (scene.envIntensity !== undefined) setEnvIntensity(scene.envIntensity);
    if (scene.ambLight !== undefined) setAmbLight(scene.ambLight);
    if (scene.dirLight !== undefined) setDirLight(scene.dirLight);
    if (scene.shadowOpacity !== undefined) setShadowOpacity(scene.shadowOpacity);
    if (scene.customHdri !== undefined) setCustomHdri(scene.customHdri);
    setCanvasResetKey((k) => k + 1);
  };

  // Transition from Screen 1 to Screen 2
  const handleProceedToTextureEditor = (materialName) => {
    setSelectedMaterial(materialName || null);
    setCurrentScreen(2);
  };

  // Optional: Transition back to Screen 1
  const handleBackToModelViewer = (textureDataUrl, colorHex) => {
    let targetMat = selectedMaterial || "all";
    if (targetMat === "none") {
      targetMat = "all";
    }
    
    let newTextures = { ...editorState.textures };
    let newColors = { ...editorState.colors };
    let newMaterials = { ...editorState.materials };
    let newLastApplied = { ...editorState.lastApplied };
    let updated = false;

    if (typeof textureDataUrl === "string") {
      newTextures[targetMat] = textureDataUrl;
      newLastApplied[targetMat] = "texture";
      updated = true;
    }
    
    if (typeof colorHex === "string") {
      if (colorHex === "none") {
        if (newColors[targetMat] !== undefined) {
          delete newColors[targetMat];
          updated = true;
        }
      } else {
        newColors[targetMat] = colorHex;
        newLastApplied[targetMat] = "color";
        updated = true;

        if (targetMat === "all") {
          newMaterials = {};
        } else {
          delete newMaterials[targetMat];
          delete newMaterials["all"];
        }
      }
    }

    if (updated) {
      pushHistory({
        textures: newTextures,
        colors: newColors,
        materials: newMaterials,
        lastApplied: newLastApplied,
      });
    }

    setSelectedMaterial(null);
    setCurrentScreen(1);
  };

  const colorDebounceRef = useRef(null);

  const handleApplyColor = (materialId, colorHex) => {
    const targetMat = (materialId && materialId !== "none") ? materialId : "all";
    
    setEditorState((prevState) => {
      const nextMaterials = { ...prevState.materials };
      if (targetMat === "all") {
        Object.keys(nextMaterials).forEach((k) => delete nextMaterials[k]);
      } else {
        delete nextMaterials[targetMat];
        delete nextMaterials["all"];
      }

      const nextState = {
        ...prevState,
        colors: { ...prevState.colors, [targetMat]: colorHex },
        materials: nextMaterials,
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
      const nextColors = { ...editorState.colors };
      if (targetMat === "all") {
        Object.keys(nextColors).forEach((k) => delete nextColors[k]);
      } else {
        delete nextColors[targetMat];
        delete nextColors["all"];
      }

      pushHistory({
        colors: nextColors,
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
          onLoadScene={onLoadScene}
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
          modelUrl={getSingleModelUrl(modelUrl)}
          setModelUrl={setModelUrl}
          appliedMaterials={editorState.materials}
          appliedColors={editorState.colors}
          appliedLastApplied={editorState.lastApplied}
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
