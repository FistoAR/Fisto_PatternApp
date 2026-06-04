import { useRef, useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Canvas from './Canvas';
import RightPanel from './RightPanel';
import UploadsPopup from './UploadsPopup';

// ─── Font options & Loading ───────────────────────────────────────────────────
const GOOGLE_FONTS = [
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 
  'Source Sans Pro', 'Slabo 27px', 'Raleway', 'PT Sans', 
  'Merriweather', 'Roboto Condensed', 'Noto Sans', 'Ubuntu', 
  'Roboto Slab', 'Lora', 'Playfair Display', 'Nunito', 
  'Poppins', 'Arimo', 'Titillium Web', 'Muli', 'PT Serif', 
  'Mukta', 'Rubik', 'Bitter', 'Work Sans', 'Quicksand', 
  'Fira Sans', 'Inconsolata', 'Oxygen', 'Dosis', 'Cabin', 
  'Anton', 'Josefin Sans', 'Libre Baskerville', 'Arvo', 
  'Hind', 'Pacifico', 'Crimson Text', 'Varela Round', 
  'Hind Siliguri', 'Merriweather Sans', 'Asap', 'Yantramanav', 
  'Dancing Script', 'Signika', 'Heebo', 'Ubuntu Condensed', 
  'Karla', 'Abhaya Libre', 'Expletus Sans', 'Alegreya', 
  'EB Garamond', 'Zilla Slab', 'Bungee', 'Alfa Slab One', 
  'Creepster', 'Permanent Marker', 'Orbitron', 'Outfit'
].sort();

const loadFont = (fontFamily) => {
  if (!fontFamily) return;
  const family = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
  const fontId = `font-${family.replace(/\s+/g, '-')}`;
  if (!document.getElementById(fontId)) {
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s+/g, '+')}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
    document.head.appendChild(link);
  }
};

const FontSelect = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadFont(value);
  }, [value]);

  useEffect(() => {
    if (isOpen) {
      // Preload all fonts so they render correctly in the dropdown list
      GOOGLE_FONTS.forEach(font => loadFont(`"${font}", sans-serif`));
    }
  }, [isOpen]);

  const filteredFonts = GOOGLE_FONTS.filter(f => f.toLowerCase().includes(search.toLowerCase()));
  const displayValue = value.split(',')[0].replace(/['"]/g, '').trim();

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 font-medium flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
        style={{ fontFamily: value }}
      >
        <span>{displayValue}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden flex flex-col max-h-[300px]">
          <div className="p-2 border-b border-gray-100 shrink-0 bg-gray-50/50">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
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
            {filteredFonts.map(font => (
              <div 
                key={font} 
                onClick={() => {
                  const fontVal = `"${font}", sans-serif`;
                  loadFont(fontVal);
                  onChange(fontVal);
                  setIsOpen(false);
                  setSearch('');
                }}
                onMouseEnter={() => loadFont(`"${font}", sans-serif`)}
                className="px-3 py-2 text-sm text-gray-700 hover:bg-[#fff5f0] hover:text-[#c0623a] rounded-lg cursor-pointer transition-colors"
                style={{ fontFamily: `"${font}", sans-serif` }}
              >
                {font}
              </div>
            ))}
            {filteredFonts.length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">No fonts found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function EditorScreen2({ onBack, isActive, modelUrl, setModelUrl, canvasResetKey }) {
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const textureCanvasRef = useRef(null);
  const [textureVersion, setTextureVersion] = useState(0);
  const canvasRef = useRef(null);

  const [wireframe, setWireframe] = useState(false);
  const [showUv, setShowUv] = useState(true);
  const [fullUv, setFullUv] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff');

  // ── Left panel tab ───────────────────────────────────────────────────────
  const [leftTab, setLeftTab] = useState('uploads'); // 'uploads' | 'text'

  // ── Uploaded images ──────────────────────────────────────────────────────
  const [uploadedImages, setUploadedImages] = useState([]);

  // Reset local state when canvasResetKey changes (user clicked "Clear Design")
  const prevResetKeyRef = useRef(canvasResetKey);
  useEffect(() => {
    if (canvasResetKey !== prevResetKeyRef.current) {
      prevResetKeyRef.current = canvasResetKey;
      setUploadedImages([]);
      setSelectedLayer(null);
      setTextProps({
        color: '#000000',
        fontSize: 80,
        fontFamily: 'Outfit, sans-serif',
        bold: false,
        italic: false,
        underline: false,
      });
    }
  }, [canvasResetKey]);

  // ── Currently selected layer (for text formatting panel) ─────────────────
  const [selectedLayer, setSelectedLayer] = useState(null);

  // Text formatting controls state (mirrors selected layer)
  const [textProps, setTextProps] = useState({
    color: '#000000',
    fontSize: 80,
    fontFamily: 'Outfit, sans-serif',
    bold: false,
    italic: false,
    underline: false,
  });

  const handleSelectedLayerChange = useCallback((layer) => {
    setSelectedLayer(layer);
    if (layer && layer.text !== undefined) {
      setTextProps({
        color: layer.color || '#000000',
        fontSize: layer.fontSize || 80,
        fontFamily: layer.fontFamily || 'Outfit, sans-serif',
        bold: layer.bold || false,
        italic: layer.italic || false,
        underline: layer.underline || false,
      });
    }
  }, []);

  const applyTextProp = useCallback((key, value) => {
    const next = { ...textProps, [key]: value };
    setTextProps(next);
    canvasRef.current?.updateSelectedTextProps({ [key]: value });
  }, [textProps]);

  const handleSave = () => {
    if (canvasRef.current?.getCleanTexture) {
      const dataUrl = canvasRef.current.getCleanTexture();
      onBack(dataUrl);
    } else if (textureCanvasRef.current) {
      const dataUrl = textureCanvasRef.current.toDataURL('image/png');
      onBack(dataUrl);
    } else {
      onBack();
    }
  };

  const isTextLayer = selectedLayer && selectedLayer.text !== undefined;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white">
      <div className="flex flex-1 overflow-hidden bg-[#f5efe6]">

        {/* ── Left Side Panel ────────────────────────────────────────── */}
        <div className="flex flex-col z-20 h-full py-6 pl-6 pr-0 gap-4 w-[350px] shrink-0">
          {/* Back button */}
          <button
            onClick={onBack}
            className="w-14 h-12 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center border-none cursor-pointer hover:bg-gray-50 transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-800">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>

          {/* Tab switcher */}
          <div className="flex bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-1.5 gap-1 shrink-0">
            <button
              onClick={() => setLeftTab('uploads')}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border-none cursor-pointer
                ${leftTab === 'uploads' ? 'bg-[#c0623a] text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-800'}`}
            >
              Uploads
            </button>
            <button
              onClick={() => setLeftTab('text')}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border-none cursor-pointer
                ${leftTab === 'text' ? 'bg-[#c0623a] text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-800'}`}
            >
              Text
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {leftTab === 'uploads' && (
              <UploadsPopup
                onUpload={(file, url) => {
                  if (!uploadedImages.includes(url)) {
                    setUploadedImages(prev => [url, ...prev]);
                  }
                  canvasRef.current?.uploadImage(url);
                }}
                uploadedImages={uploadedImages}
              />
            )}

            {leftTab === 'text' && (
              <div className="flex flex-col gap-4">
                {/* Add Text button */}
                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-5">
                  {/* <h2 className="text-xl font-bold text-gray-900 mb-4">Text</h2> */}
                  <button
                    onClick={() => {
                      canvasRef.current?.addText('Your Text');
                    }}
                    className="w-full py-3 rounded-xl bg-[#c0623a] hover:bg-[#a65330] text-white font-semibold text-sm flex items-center justify-center gap-2 border-none cursor-pointer transition-colors shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Text Box
                  </button>
                  <p className="text-[11px] text-gray-400 text-center mt-2">Double-click a text layer to edit its content</p>
                </div>

                {/* Formatting panel — only shows when text layer selected */}
                {isTextLayer ? (
                  <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-5 flex flex-col gap-4">
                    {/* <h3 className="text-[13px] font-bold text-gray-800">Format Text</h3> */}

                    {/* Font Family */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Font</label>
                      <FontSelect
                        value={textProps.fontFamily}
                        onChange={(val) => applyTextProp('fontFamily', val)}
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
                        onChange={(e) => applyTextProp('fontSize', Number(e.target.value))}
                        className="w-full accent-[#c0623a] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                        <span>20px</span>
                        <span>300px</span>
                      </div>
                    </div>

                    {/* Bold / Italic / Underline */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Style</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => applyTextProp('bold', !textProps.bold)}
                          className={`flex-1 flex items-center justify-center py-2 rounded-xl text-sm font-bold border-none cursor-pointer transition-all ${textProps.bold ? 'bg-[#c0623a] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          B
                        </button>
                        <button
                          onClick={() => applyTextProp('italic', !textProps.italic)}
                          className={`flex-1 flex items-center justify-center py-2 rounded-xl text-sm border-none cursor-pointer transition-all ${textProps.italic ? 'bg-[#c0623a] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          <span className="font-serif italic font-bold leading-none text-base">I</span>
                        </button>
                        <button
                          onClick={() => applyTextProp('underline', !textProps.underline)}
                          className={`flex-1 flex items-center justify-center py-2 rounded-xl text-sm font-bold underline border-none cursor-pointer transition-all ${textProps.underline ? 'bg-[#c0623a] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          U
                        </button>
                      </div>
                    </div>

                    {/* Color */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Color</label>
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-gray-200 shrink-0 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                          <input
                            type="color"
                            value={textProps.color}
                            onInput={(e) => applyTextProp('color', e.target.value)}
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
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Preset Colors</label>
                      <div className="flex flex-wrap gap-2">
                        {['#000000','#ffffff','#c0623a','#2563eb','#16a34a','#dc2626','#9333ea','#f59e0b','#64748b','#f472b6'].map(c => (
                          <button
                            key={c}
                            onClick={() => applyTextProp('color', c)}
                            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer"
                            style={{
                              background: c,
                              borderColor: textProps.color === c ? '#c0623a' : '#e5e7eb',
                              boxShadow: textProps.color === c ? '0 0 0 2px #c0623a44' : undefined,
                            }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-5">
                    <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#d1d5db" className="w-10 h-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                      <p className="text-sm text-gray-400 font-medium">Select a text layer on the canvas to format it</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Center Canvas ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col h-full min-w-0">
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
            onSelectedLayerChange={handleSelectedLayerChange}
          />
        </div>

        {/* ── Right Panel ───────────────────────────────────────────────── */}
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
