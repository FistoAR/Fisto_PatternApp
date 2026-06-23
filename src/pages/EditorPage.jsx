import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import EditorScreen1 from "../components/editor/EditorScreen1";
import EditorScreen2 from "../components/editor/EditorScreen2";
import roundContainerUrl from "../assets/models/Food Containers/Round/Round.glb?url";
import { getSingleModelUrl } from "../components/editor/LayoutPopup";
import cap1Url from "../assets/models/Drinkware Bottles/Caps/Cap1.glb?url";
import cap2Url from "../assets/models/Drinkware Bottles/Caps/Cap2.glb?url";
import cap3Url from "../assets/models/Drinkware Bottles/Caps/Cap3.glb?url";
import cap4Url from "../assets/models/Drinkware Bottles/Caps/Cap4.glb?url";
import cap5Url from "../assets/models/Drinkware Bottles/Caps/Cap5.glb?url";
import cap6Url from "../assets/models/Drinkware Bottles/Caps/Cap6.glb?url";
import cap7Url from "../assets/models/Drinkware Bottles/Caps/Cap7.glb?url";
import cap8Url from "../assets/models/Drinkware Bottles/Caps/Cap8.glb?url";

export const CAPS = [
  { id: "cap-1", name: "Cap 1", url: cap1Url },
  { id: "cap-2", name: "Cap 2", url: cap2Url },
  { id: "cap-3", name: "Cap 3", url: cap3Url },
  { id: "cap-4", name: "Cap 4", url: cap4Url },
  { id: "cap-5", name: "Cap 5", url: cap5Url },
  { id: "cap-6", name: "Cap 6", url: cap6Url },
  { id: "cap-7", name: "Cap 7", url: cap7Url },
  { id: "cap-8", name: "Cap 8", url: cap8Url },
];

export default function EditorPage() {
  const location = useLocation();
  const [currentScreen, setCurrentScreen] = useState(1);
  const [modelUrl, setModelUrlState] = useState(() => {
    const initial = location.state?.initialModelUrl || roundContainerUrl;
    return typeof initial === 'string' ? initial.replace("Biodegradable%20%20bags.glb", "Biodegradable%20bags.glb").replace("Biodegradable  bags.glb", "Biodegradable bags.glb") : initial;
  });

  const setModelUrl = (url) => {
    const cleaned = typeof url === 'string' ? url.replace("Biodegradable%20%20bags.glb", "Biodegradable%20bags.glb").replace("Biodegradable  bags.glb", "Biodegradable bags.glb") : url;
    setModelUrlState(cleaned);
  };
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedCapUrl, setSelectedCapUrl] = useState("none");

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

  useEffect(() => {
    if (modelUrl && modelUrl.toLowerCase().includes("glass_bottle")) {
      setHdriPreset("apartment");
      setShadowOpacity(1.0);
      setEnvIntensity(1.0);
    } else {
      setHdriPreset("studio");
      setShadowOpacity(0.25);
      setEnvIntensity(0.4);
    }
  }, [modelUrl]);

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
    metallic: {},
    roughness: {},
  });

  // History stack
  const history = useRef([editorState]);
  const historyIndex = useRef(0);
  const [historyVersion, setHistoryVersion] = useState(0);

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
        lastItem.customSize === nextState.customSize &&
        lastItem.metallic === nextState.metallic &&
        lastItem.roughness === nextState.roughness;

      if (!isDuplicate) {
        history.current = [...currentStack, nextState];
        historyIndex.current = history.current.length - 1;
        setHistoryVersion((v) => v + 1);
      }
      return nextState;
    });
  };

  const handleUndo = () => {
    if (historyIndex.current > 0) {
      historyIndex.current -= 1;
      setEditorState(history.current[historyIndex.current]);
      setHistoryVersion((v) => v + 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex.current < history.current.length - 1) {
      historyIndex.current += 1;
      setEditorState(history.current[historyIndex.current]);
      setHistoryVersion((v) => v + 1);
    }
  };

  const canUndo = historyIndex.current > 0;
  const canRedo = historyIndex.current < history.current.length - 1;

  const handleApplyMetallic = (materialId, value) => {
    const targetMat = (materialId && materialId !== "none") ? materialId : "all";
    const nextMetallic = { ...editorState.metallic, [targetMat]: value };
    pushHistory({ metallic: nextMetallic });
  };

  const handleApplyRoughness = (materialId, value) => {
    const targetMat = (materialId && materialId !== "none") ? materialId : "all";
    const nextRoughness = { ...editorState.roughness, [targetMat]: value };
    pushHistory({ roughness: nextRoughness });
  };

  const handleResetAll = () => {
    const defaultState = {
      textures: {},
      colors: {},
      materials: {},
      customSize: null,
      lastApplied: {},
      metallic: {},
      roughness: {},
    };
    setEditorState(defaultState);
    history.current = [defaultState];
    historyIndex.current = 0;
    setCanvasResetKey((k) => k + 1);
    setHistoryVersion((v) => v + 1);
  };

  const onLoadScene = (scene) => {
    if (scene.modelUrl) setModelUrl(scene.modelUrl);
    if (scene.sceneBgColor !== undefined) setSceneBgColor(scene.sceneBgColor);
    if (scene.sceneBgImage !== undefined) setSceneBgImage(scene.sceneBgImage);
    if (scene.editorState) {
      setEditorState(scene.editorState);
      history.current = [scene.editorState];
      historyIndex.current = 0;
      setHistoryVersion((v) => v + 1);
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
      const nextColors = { ...prevState.colors };
      const nextLastApplied = { ...prevState.lastApplied };
      
      if (colorHex === null) {
        delete nextColors[targetMat];
        delete nextLastApplied[targetMat];
      } else {
        nextColors[targetMat] = colorHex;
        nextLastApplied[targetMat] = "color";
      }

      const nextMaterials = { ...prevState.materials };
      if (colorHex !== null) {
        if (targetMat === "all") {
          Object.keys(nextMaterials).forEach((k) => delete nextMaterials[k]);
        } else {
          delete nextMaterials[targetMat];
          delete nextMaterials["all"];
        }
      }

      const nextState = {
        ...prevState,
        colors: nextColors,
        materials: nextMaterials,
        lastApplied: nextLastApplied,
      };

      if (colorDebounceRef.current) clearTimeout(colorDebounceRef.current);
      colorDebounceRef.current = setTimeout(() => {
        history.current = history.current.slice(0, historyIndex.current + 1);
        history.current.push(nextState);
        historyIndex.current = history.current.length - 1;
        setHistoryVersion((v) => v + 1);
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
          appliedMetallic={editorState.metallic}
          appliedRoughness={editorState.roughness}
          onApplyMetallic={handleApplyMetallic}
          onApplyRoughness={handleApplyRoughness}
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
          selectedCapUrl={selectedCapUrl}
          onSelectCap={setSelectedCapUrl}
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
          selectedCapUrl={selectedCapUrl}
          onSelectCap={setSelectedCapUrl}
        />
      </div>
    </div>
  );
}
