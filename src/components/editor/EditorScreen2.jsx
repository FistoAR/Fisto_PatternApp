import { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';
import Canvas from './Canvas';
import RightPanel from './RightPanel';
import ModelsPopup from './ModelsPopup';
import UploadsPopup from './UploadsPopup';
import LayoutPopup from './LayoutPopup';

export default function EditorScreen2({ onBack, isActive, modelUrl, setModelUrl }) {
  const location = useLocation();
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const textureCanvasRef = useRef(null);
  const [textureVersion, setTextureVersion] = useState(0);

  const handleSave = () => {
    if (canvasRef.current && canvasRef.current.getCleanTexture) {
      const dataUrl = canvasRef.current.getCleanTexture();
      onBack(dataUrl);
    } else if (textureCanvasRef.current) {
      const dataUrl = textureCanvasRef.current.toDataURL('image/png');
      onBack(dataUrl);
    } else {
      onBack();
    }
  };

  const [activeTab, setActiveTab] = useState('edit');
  const [uploadedImages, setUploadedImages] = useState([]);
  const canvasRef = useRef(null);

  const [wireframe, setWireframe] = useState(false);
  const [showUv, setShowUv] = useState(true);
  const [fullUv, setFullUv] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff');

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white">
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden bg-[#f5efe6]">

        {/* Left Side Panel */}
        <div className="flex flex-col z-20 h-full py-6 pl-6 pr-0 gap-4 w-[350px] shrink-0">
          <button 
            onClick={onBack}
            className="w-14 h-12 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center border-none cursor-pointer hover:bg-gray-50 transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-800">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          
          <div className="flex-1 overflow-hidden">
            <UploadsPopup
              onUpload={(file, url) => {
                if (!uploadedImages.includes(url)) {
                  setUploadedImages(prev => [url, ...prev]);
                }
                canvasRef.current?.uploadImage(url);
              }}
              uploadedImages={uploadedImages}
            />
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col h-full min-w-0">
          <Canvas
            ref={canvasRef}
            textureCanvasRef={textureCanvasRef}
            onTextureUpdated={() => setTextureVersion((v) => v + 1)}
            modelUrl={modelUrl}
            setModelUrl={setModelUrl}
            showUv={showUv}
            fullUv={fullUv}
            bgColor={bgColor}
            isActive={isActive}
          />
        </div>

        {/* Right Panel — hidden on mobile, shown via toggle */}
        <div className={`
          shrink-0 py-6 pr-6
          lg:relative lg:block
          ${showMobilePanel
            ? 'absolute inset-y-0 right-0 z-40 block'
            : 'hidden lg:block'
          }
        `}>
          <div className="h-fit rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-white">
          <RightPanel
            canvasRef={canvasRef}
            textureCanvasRef={textureCanvasRef}
            textureVersion={textureVersion}
            modelUrl={modelUrl}
            wireframe={wireframe}
            setWireframe={setWireframe}
            showUv={showUv}
            setShowUv={setShowUv}
            fullUv={fullUv}
            setFullUv={setFullUv}
            bgColor={bgColor}
            setBgColor={setBgColor}
            hideExport={true}
            onSave={handleSave}
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
    </div>
  );
}
