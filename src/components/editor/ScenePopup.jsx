import React from 'react';

const hdriPresets = [
  "studio",
  "city",
  "sunset",
  "dawn",
  "night",
  "warehouse",
  "forest",
  "apartment",
  "park",
  "lobby",
];

export default function ScenePopup({
  bgColor, setBgColor,
  hdriPreset, setHdriPreset,
  envIntensity, setEnvIntensity,
  ambLight, setAmbLight,
  dirLight, setDirLight,
  shadowOpacity, setShadowOpacity,
  customHdri, setCustomHdri
}) {
  const handleHdriUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomHdri(url);
      setHdriPreset("custom");
    }
  };
  return (
    <div className="w-[350px] h-[620px] shrink-0 bg-white rounded-[15px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col">
      <div className="p-5 pb-3 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 m-0">Environment</h2>
      </div>

      <div className="p-5 overflow-y-auto flex-1 scrollbar-hide flex flex-col gap-6">
        
        {/* Background Color */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-gray-700 flex justify-between">
            Background Color
            <span className="text-gray-400 font-normal">{bgColor}</span>
          </label>
          <div className="flex items-center gap-3 w-full">
            <div className="relative w-10 h-10 rounded shadow-sm border border-gray-200 overflow-hidden cursor-pointer flex-shrink-0 flex items-center justify-center bg-gray-50 hover:bg-gray-100 group">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 absolute z-0 group-hover:scale-110 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l1.5 1.5.75-.75V8.758l2.276-.61a3 3 0 10-3.675-3.675l-.61 2.277H12l-.75.75 1.5 1.5M15 11.25v-2.25m0 2.25l-2.25 1.5M7.5 15l-1.5 1.5-.75-.75V12.5l2.25-1.5M7.5 15l1.5 2.25m0-2.25l-2.25-1.5M10.5 18l-1.5 1.5-.75-.75V15.5l2.25-1.5M10.5 18l1.5 2.25m0-2.25l-2.25-1.5" />
              </svg>
              <input 
                type="color" 
                value={bgColor} 
                onChange={(e) => setBgColor(e.target.value)}
                className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer opacity-0 z-10"
              />
            </div>
            <div className="flex-1 grid grid-cols-5 gap-2">
              {['#e6e2db', '#ffffff', '#1a1a1a', '#2c3e50', '#c05520'].map(color => (
                <button
                  key={color}
                  onClick={() => setBgColor(color)}
                  className={`w-full aspect-square rounded-md border-2 transition-transform hover:scale-110 cursor-pointer ${bgColor === color ? 'border-gray-900 shadow-md' : 'border-gray-200'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* HDRI Preset */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-gray-700">HDRI Environment</label>
          
          {customHdri ? (
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#c05520] bg-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-[#c05520] shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800">Custom HDR</span>
                  <span className="text-[11px] font-medium text-gray-500">Active Environment</span>
                </div>
              </div>
              <button 
                onClick={() => { setCustomHdri(null); setHdriPreset("studio"); }} 
                className="w-8 h-8 rounded-full bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center border border-gray-200 transition-colors cursor-pointer shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <select 
                value={hdriPreset} 
                onChange={(e) => {
                  setHdriPreset(e.target.value);
                  if (e.target.value !== "custom") setCustomHdri(null);
                }}
                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#c05520] focus:ring-1 focus:ring-[#c05520] cursor-pointer"
              >
                {hdriPresets.map(preset => (
                  <option key={preset} value={preset}>
                    {preset.charAt(0).toUpperCase() + preset.slice(1)}
                  </option>
                ))}
              </select>
              <label className="flex items-center justify-center gap-2 p-2.5 w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-sm font-semibold text-gray-600">Upload Custom .HDR</span>
                <input type="file" accept=".hdr" onChange={handleHdriUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Sliders */}
        <div className="flex flex-col gap-6 mt-1">
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold text-gray-600 flex justify-between">
              Environment Intensity <span>{envIntensity.toFixed(2)}</span>
            </label>
            <input 
              type="range" min="0" max="2" step="0.1" 
              value={envIntensity} 
              onChange={(e) => setEnvIntensity(parseFloat(e.target.value))}
              className="w-full accent-[#c05520]"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold text-gray-600 flex justify-between">
              Ambient Light <span>{ambLight.toFixed(2)}</span>
            </label>
            <input 
              type="range" min="0" max="2" step="0.1" 
              value={ambLight} 
              onChange={(e) => setAmbLight(parseFloat(e.target.value))}
              className="w-full accent-[#c05520]"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold text-gray-600 flex justify-between">
              Directional Light <span>{dirLight.toFixed(2)}</span>
            </label>
            <input 
              type="range" min="0" max="3" step="0.1" 
              value={dirLight} 
              onChange={(e) => setDirLight(parseFloat(e.target.value))}
              className="w-full accent-[#c05520]"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold text-gray-600 flex justify-between">
              Shadow Opacity <span>{shadowOpacity.toFixed(2)}</span>
            </label>
            <input 
              type="range" min="0" max="1" step="0.05" 
              value={shadowOpacity} 
              onChange={(e) => setShadowOpacity(parseFloat(e.target.value))}
              className="w-full accent-[#c05520]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
