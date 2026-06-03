import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import EditorScreen1 from '../components/editor/EditorScreen1';
import EditorScreen2 from '../components/editor/EditorScreen2';

export default function EditorPage() {
  const location = useLocation();
  const [currentScreen, setCurrentScreen] = useState(1);
  const [modelUrl, setModelUrl] = useState(location.state?.initialModelUrl || null);
  const [appliedTexture, setAppliedTexture] = useState(null);

  // Transition from Screen 1 to Screen 2
  const handleProceedToTextureEditor = () => {
    setCurrentScreen(2);
  };

  // Optional: Transition back to Screen 1
  const handleBackToModelViewer = (textureDataUrl) => {
    if (typeof textureDataUrl === 'string') {
      setAppliedTexture(textureDataUrl);
    }
    setCurrentScreen(1);
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      <div className={`absolute inset-0 transition-opacity duration-300 ${currentScreen === 1 ? 'z-10 opacity-100' : '-z-10 opacity-0 pointer-events-none'}`}>
        <EditorScreen1 
          modelUrl={modelUrl}
          setModelUrl={setModelUrl}
          appliedTexture={appliedTexture}
          onProceed={handleProceedToTextureEditor}
          isActive={currentScreen === 1}
        />
      </div>
      <div className={`absolute inset-0 transition-opacity duration-300 ${currentScreen === 2 ? 'z-10 opacity-100' : '-z-10 opacity-0 pointer-events-none'}`}>
        <EditorScreen2 
          modelUrl={modelUrl}
          setModelUrl={setModelUrl}
          onBack={handleBackToModelViewer}
          isActive={currentScreen === 2}
        />
      </div>
    </div>
  );
}
