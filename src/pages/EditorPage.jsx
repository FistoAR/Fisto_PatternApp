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

import cap1Img from "../assets/models/Drinkware Bottles/Caps/Cap1.webp";
import cap2Img from "../assets/models/Drinkware Bottles/Caps/Cap2.webp";
import cap3Img from "../assets/models/Drinkware Bottles/Caps/Cap3.webp";
import cap4Img from "../assets/models/Drinkware Bottles/Caps/Cap4.webp";
import cap5Img from "../assets/models/Drinkware Bottles/Caps/Cap5.webp";
import cap6Img from "../assets/models/Drinkware Bottles/Caps/Cap6.webp";
import cap7Img from "../assets/models/Drinkware Bottles/Caps/Cap7.webp";
import cap8Img from "../assets/models/Drinkware Bottles/Caps/Cap8.webp";

export const CAPS = [
  { id: "cap-1", name: "Cap 1", url: cap1Url, imageUrl: cap1Img },
  { id: "cap-2", name: "Cap 2", url: cap2Url, imageUrl: cap2Img },
  { id: "cap-3", name: "Cap 3", url: cap3Url, imageUrl: cap3Img },
  { id: "cap-4", name: "Cap 4", url: cap4Url, imageUrl: cap4Img },
  { id: "cap-5", name: "Cap 5", url: cap5Url, imageUrl: cap5Img },
  { id: "cap-6", name: "Cap 6", url: cap6Url, imageUrl: cap6Img },
  { id: "cap-7", name: "Cap 7", url: cap7Url, imageUrl: cap7Img },
  { id: "cap-8", name: "Cap 8", url: cap8Url, imageUrl: cap8Img },
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
      setShadowOpacity(0.25);
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
  const colorDebounceRef = useRef(null);

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

  const splitState = (state) => {
    const subMats = ["Lid Label", "Body Label"];
    const newState = {
      ...state,
      textures: { ...state.textures },
      colors: { ...state.colors },
      materials: { ...state.materials },
      lastApplied: { ...state.lastApplied },
      metallic: { ...state.metallic },
      roughness: { ...state.roughness },
    };

    const keys = ["textures", "colors", "materials", "lastApplied", "metallic", "roughness"];
    keys.forEach((key) => {
      if (newState[key]["all"] !== undefined) {
        const val = newState[key]["all"];
        subMats.forEach((name) => {
          if (newState[key][name] === undefined) {
            newState[key][name] = val;
          }
        });
        delete newState[key]["all"];
      }
    });

    return newState;
  };

  const handleApplyMetallic = (materialId, value) => {
    const targetMat = (materialId && materialId !== "none") ? materialId : "all";
    const nextState = splitState(editorState);
    const targets = targetMat === "all" ? ["Lid Label", "Body Label"] : [targetMat];
    targets.forEach((t) => {
      nextState.metallic[t] = value;
    });
    pushHistory({ metallic: nextState.metallic });
  };

  const handleApplyRoughness = (materialId, value) => {
    const targetMat = (materialId && materialId !== "none") ? materialId : "all";
    const nextState = splitState(editorState);
    const targets = targetMat === "all" ? ["Lid Label", "Body Label"] : [targetMat];
    targets.forEach((t) => {
      nextState.roughness[t] = value;
    });
    pushHistory({ roughness: nextState.roughness });
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

    // DYNAMIC SPLIT: If targetMat is "all", split the global state into individual keys
    if (targetMat === "all") {
      const subMats = ["Lid Label", "Body Label"];
      subMats.forEach((name) => {
        if (newTextures["all"] !== undefined && newTextures[name] === undefined) {
          newTextures[name] = newTextures["all"];
        }
        if (newColors["all"] !== undefined && newColors[name] === undefined) {
          newColors[name] = newColors["all"];
        }
        if (newMaterials["all"] !== undefined && newMaterials[name] === undefined) {
          newMaterials[name] = newMaterials["all"];
        }
        if (newLastApplied["all"] !== undefined && newLastApplied[name] === undefined) {
          newLastApplied[name] = newLastApplied["all"];
        }
      });
      
      // Clean up the global "all" keys
      delete newTextures["all"];
      delete newColors["all"];
      delete newMaterials["all"];
      delete newLastApplied["all"];
    }

    if (typeof textureDataUrl === "string" || textureDataUrl === null) {
      if (textureDataUrl === null) {
        if (targetMat === "all") {
          newTextures = {};
          updated = true;
        } else if (newTextures[targetMat] !== undefined) {
          delete newTextures[targetMat];
          updated = true;
        }
      } else {
        updated = true;
        if (targetMat === "all") {
          newTextures["Lid Label"] = textureDataUrl;
          newTextures["Body Label"] = textureDataUrl;
          newLastApplied["Lid Label"] = "texture";
          newLastApplied["Body Label"] = "texture";
          delete newMaterials["Lid Label"];
          delete newMaterials["Body Label"];
        } else {
          newTextures[targetMat] = textureDataUrl;
          delete newMaterials[targetMat];
          newLastApplied[targetMat] = "texture";
        }
      }
    }
    
    if (typeof colorHex === "string" || colorHex === null) {
      if (colorHex === "none" || colorHex === null) {
        if (targetMat === "all") {
          newColors = {};
          updated = true;
        } else if (newColors[targetMat] !== undefined) {
          delete newColors[targetMat];
          updated = true;
        }
      } else {
        updated = true;
        if (targetMat === "all") {
          // If the user specified a background color for "all", apply it to both Lid and Body labels
          // and clear their PBR materials so the color shows cleanly.
          newColors["Lid Label"] = colorHex;
          newColors["Body Label"] = colorHex;
          newLastApplied["Lid Label"] = "color";
          newLastApplied["Body Label"] = "color";
          delete newMaterials["Lid Label"];
          delete newMaterials["Body Label"];
        } else {
          newColors[targetMat] = colorHex;
          delete newMaterials[targetMat];
          newLastApplied[targetMat] = "color";
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

  const handleApplyColor = (materialId, colorHex) => {
    const targetMat = (materialId && materialId !== "none") ? materialId : "all";
    
    setEditorState((prevState) => {
      const splitPrev = splitState(prevState);
      const nextColors = { ...splitPrev.colors };
      const nextLastApplied = { ...splitPrev.lastApplied };
      const nextMaterials = { ...splitPrev.materials };
      const nextTextures = { ...splitPrev.textures };

      if (targetMat === "all") {
        // Write to the "all" key so every mesh in the traversal picks it up
        if (colorHex === null) {
          delete nextColors["all"];
          delete nextLastApplied["all"];
          // Also clear any per-label overrides so they don't block
          delete nextColors["Lid Label"];
          delete nextLastApplied["Lid Label"];
          delete nextColors["Body Label"];
          delete nextLastApplied["Body Label"];
        } else {
          nextColors["all"] = colorHex;
          nextLastApplied["all"] = "color";
          delete nextMaterials["all"];
          // Clear all per-material color/material overrides so they don't block the new global color
          Object.keys(nextColors).forEach((key) => {
            if (key !== "all") delete nextColors[key];
          });
          Object.keys(nextMaterials).forEach((key) => {
            if (key !== "all") delete nextMaterials[key];
          });
          Object.keys(nextLastApplied).forEach((key) => {
            if (key !== "all") delete nextLastApplied[key];
          });
        }
      } else {
        if (colorHex === null) {
          delete nextColors[targetMat];
          delete nextLastApplied[targetMat];
        } else {
          nextColors[targetMat] = colorHex;
          nextLastApplied[targetMat] = "color";
          delete nextMaterials[targetMat];
        }
      }

      const nextState = {
        ...splitPrev,
        colors: nextColors,
        materials: nextMaterials,
        textures: nextTextures,
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
    
    setEditorState((prevState) => {
      const splitPrev = splitState(prevState);
      const nextColors = { ...splitPrev.colors };
      const nextTextures = { ...splitPrev.textures };
      const nextMaterials = { ...splitPrev.materials };
      const nextLastApplied = { ...splitPrev.lastApplied };

      if (targetMat === "all") {
        // Write to the "all" key so every mesh in the traversal picks it up
        if (materialType === null) {
          delete nextMaterials["all"];
          delete nextLastApplied["all"];
          delete nextMaterials["Lid Label"];
          delete nextLastApplied["Lid Label"];
          delete nextMaterials["Body Label"];
          delete nextLastApplied["Body Label"];
        } else {
          nextMaterials["all"] = materialType;
          nextLastApplied["all"] = "material";
          delete nextColors["all"];
          // Clear all per-material color/material overrides so they don't block the new global material
          Object.keys(nextColors).forEach((key) => {
            if (key !== "all") delete nextColors[key];
          });
          Object.keys(nextMaterials).forEach((key) => {
            if (key !== "all") delete nextMaterials[key];
          });
          Object.keys(nextLastApplied).forEach((key) => {
            if (key !== "all") delete nextLastApplied[key];
          });
        }
      } else {
        if (materialType === null) {
          delete nextMaterials[targetMat];
          delete nextLastApplied[targetMat];
        } else {
          nextMaterials[targetMat] = materialType;
          nextLastApplied[targetMat] = "material";
          delete nextColors[targetMat];
        }
      }

      const nextState = {
        ...splitPrev,
        colors: nextColors,
        textures: nextTextures,
        materials: nextMaterials,
        lastApplied: nextLastApplied,
      };

      history.current = history.current.slice(0, historyIndex.current + 1);
      history.current.push(nextState);
      historyIndex.current = history.current.length - 1;
      setHistoryVersion((v) => v + 1);

      return nextState;
    });
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
          appliedTextures={editorState.textures}
          appliedLastApplied={editorState.lastApplied}
          activeTab={activeTab}
          onBack={handleBackToModelViewer}
          isActive={currentScreen === 2}
          canvasResetKey={canvasResetKey}
          sceneBgColor={sceneBgColor}
          sceneBgImage={sceneBgImage}
          selectedCapUrl={selectedCapUrl}
          onSelectCap={setSelectedCapUrl}
          selectedMaterial={selectedMaterial}
        />
      </div>
    </div>
  );
}
