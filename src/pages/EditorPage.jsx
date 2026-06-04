import { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import EditorScreen1 from '../components/editor/EditorScreen1';
import EditorScreen2 from '../components/editor/EditorScreen2';
import sqBox1Url from '../assets/models/box models/sq box/Box-4(Mockup).glb?url';

export default function EditorPage() {
  const location = useLocation();
  const [currentScreen, setCurrentScreen] = useState(1);
  const [modelUrl, setModelUrl] = useState(location.state?.initialModelUrl || sqBox1Url);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Key to force Screen 2 canvas re-mount on reset
  const [canvasResetKey, setCanvasResetKey] = useState(0);

  // Unified state for size, textures, and colors
  const [editorState, setEditorState] = useState({
    textures: {},
    colors: {},
    customSize: null,
    lastApplied: {}
  });

  // History stack
  const history = useRef([editorState]);
  const historyIndex = useRef(0);

  const pushHistory = (newStateUpdates) => {
    const nextState = { ...editorState, ...newStateUpdates };
    // Truncate future history if we're branching off an undo
    history.current = history.current.slice(0, historyIndex.current + 1);
    history.current.push(nextState);
    historyIndex.current = history.current.length - 1;
    setEditorState(nextState);
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
    const defaultState = { textures: {}, colors: {}, customSize: null, lastApplied: {} };
    setEditorState(defaultState);
    history.current = [defaultState];
    historyIndex.current = 0;
    setCanvasResetKey(k => k + 1);
  };

  // Transition from Screen 1 to Screen 2
  const handleProceedToTextureEditor = (materialName) => {
    setSelectedMaterial(materialName || null);
    setCurrentScreen(2);
  };

  // Optional: Transition back to Screen 1
  const handleBackToModelViewer = (textureDataUrl) => {
    if (typeof textureDataUrl === 'string') {
      const targetMat = selectedMaterial || 'all';
      pushHistory({
        textures: { ...editorState.textures, [targetMat]: textureDataUrl },
        lastApplied: { ...editorState.lastApplied, [targetMat]: 'texture' }
      });
    }
    setSelectedMaterial(null);
    setCurrentScreen(1);
  };

  const handleApplyColor = (materialId, colorHex) => {
    const targetMat = materialId || 'all';
    pushHistory({
      colors: { ...editorState.colors, [targetMat]: colorHex },
      lastApplied: { ...editorState.lastApplied, [targetMat]: 'color' }
    });
  };

  const handleApplyCustomSize = (size) => {
    pushHistory({ customSize: size });
  };

  return (
    <div className="w-full h-full overflow-hidden relative">
      <div className={`absolute inset-0 transition-opacity duration-300 ${currentScreen === 1 ? 'z-10 opacity-100' : '-z-10 opacity-0 pointer-events-none'}`}>
        <EditorScreen1 
          modelUrl={modelUrl}
          setModelUrl={setModelUrl}
          appliedTextures={editorState.textures}
          appliedColors={editorState.colors}
          appliedLastApplied={editorState.lastApplied}
          appliedCustomSize={editorState.customSize}
          selectedMaterial={selectedMaterial}
          setSelectedMaterial={setSelectedMaterial}
          onProceed={handleProceedToTextureEditor}
          onApplyColor={handleApplyColor}
          onApplyCustomSize={handleApplyCustomSize}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onResetAll={handleResetAll}
          canUndo={canUndo}
          canRedo={canRedo}
          isActive={currentScreen === 1}
        />
      </div>
      <div className={`absolute inset-0 transition-opacity duration-300 ${currentScreen === 2 ? 'z-10 opacity-100' : '-z-10 opacity-0 pointer-events-none'}`}>
        <EditorScreen2 
          modelUrl={modelUrl}
          setModelUrl={setModelUrl}
          onBack={handleBackToModelViewer}
          isActive={currentScreen === 2}
          canvasResetKey={canvasResetKey}
        />
      </div>
    </div>
  );
}
