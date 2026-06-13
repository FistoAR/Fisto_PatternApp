import { useRef, useState, useCallback, useEffect } from 'react';
import img1 from "../../assets/images/Editor 2/images/1.webp";
import img2 from "../../assets/images/Editor 2/images/2.webp";
import img3 from "../../assets/images/Editor 2/images/3.webp";
import img4 from "../../assets/images/Editor 2/images/4.webp";
import img5 from "../../assets/images/Editor 2/images/5.webp";
import img6 from "../../assets/images/Editor 2/images/6.webp";
import img7 from "../../assets/images/Editor 2/images/7.webp";
import img8 from "../../assets/images/Editor 2/images/8.webp";
import img9 from "../../assets/images/Editor 2/images/9.webp";
import img10 from "../../assets/images/Editor 2/images/10.webp";
import img11 from "../../assets/images/Editor 2/images/11.webp";
import img12 from "../../assets/images/Editor 2/images/12.webp";
import img13 from "../../assets/images/Editor 2/images/13.webp";
import img14 from "../../assets/images/Editor 2/images/14.webp";

const presetImages = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12, img13, img14];

export default function UploadsPopup({ onUpload, uploadedImages, isImageSelected, onApplyFit, selectedLayer }) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // { x: number, y: number, url: string }
  const [warningMessage, setWarningMessage] = useState('');
  const warningTimeoutRef = useRef(null);

  const handleApplyFit = (fitType) => {
    if (!isImageSelected) {
      setWarningMessage('Please select a frame and image first');
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = setTimeout(() => {
        setWarningMessage('');
      }, 5000);
      return;
    }
    onApplyFit(fitType);
  };

  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!contextMenu) return;
    const handleClose = () => setContextMenu(null);
    window.addEventListener('click', handleClose);
    window.addEventListener('contextmenu', handleClose);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('contextmenu', handleClose);
    };
  }, [contextMenu]);

  const handleContextMenu = (e, url) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Position menu slightly offset to avoid blocking cursor
    setContextMenu({
      x: e.clientX + 2,
      y: e.clientY + 2,
      url,
    });
  };

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    onUpload(file, url);
  }, [onUpload]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only reset if leaving the drop zone itself (not a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full h-fit shrink-0 bg-white rounded-[15px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col">
      <div className="p-6 pb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Uploads</h2>

        {/* Drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="relative rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 select-none"
          style={{
            border: `2px dashed ${isDragOver ? '#c0623a' : '#d1d5db'}`,
            background: isDragOver ? '#fff5f0' : '#f9fafb',
            transform: isDragOver ? 'scale(1.01)' : 'scale(1)',
          }}
        >
          {/* Animated upload icon */}
          <div
            className="transition-transform duration-200"
            style={{ transform: isDragOver ? 'translateY(-4px)' : 'translateY(0)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
              stroke={isDragOver ? '#c0623a' : '#9ca3af'} className="w-10 h-10 mb-3 transition-colors duration-200">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
          </div>

          {isDragOver ? (
            <p className="text-sm font-semibold text-[#c0623a] mb-1">Drop to upload!</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-600 mb-1">Drag &amp; drop image here</p>
              <p className="text-xs text-gray-400 mb-3">or click to browse</p>
            </>
          )}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {!isDragOver && (
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="px-5 py-1.5 bg-[#c0623a] hover:bg-[#a65330] text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors border-none cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              Upload
            </button>
          )}
        </div>

        <p className="text-[10px] text-gray-400 text-center mt-2">Supports PNG, JPG, WEBP, SVG</p>
      </div>

      <div className="px-6 pb-4 border-b border-gray-100 mb-4 shrink-0">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
          Image Formatting
        </h3>
        <div className="bg-gray-50 p-1 rounded-xl flex gap-1 border border-gray-100/80">
          <button
            onClick={() => handleApplyFit('contain')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border-none cursor-pointer transition-all duration-200
              ${isImageSelected && selectedLayer?.fitType === 'contain'
                ? 'bg-white text-[#c0623a] shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                : 'bg-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeDasharray="3 3" />
              <rect x="5" y="7" width="14" height="10" rx="1" stroke="currentColor" fill="currentColor" fillOpacity="0.1" />
            </svg>
            Contain
          </button>
          <button
            onClick={() => handleApplyFit('cover')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border-none cursor-pointer transition-all duration-200
              ${isImageSelected && selectedLayer?.fitType === 'cover'
                ? 'bg-white text-[#c0623a] shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                : 'bg-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeDasharray="3 3" />
              <rect x="1" y="5" width="22" height="14" rx="1.5" stroke="currentColor" fill="currentColor" fillOpacity="0.15" />
            </svg>
            Cover
          </button>
        </div>
        
        {warningMessage && (
          <div className="mt-2 text-[11px] text-[#c0623a] bg-[#fff5f0] border border-[#ffebd8] rounded-lg p-2 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-semibold">{warningMessage}</span>
          </div>
        )}
      </div>

      <div className="px-6 pb-6 overflow-y-auto flex-1">
        <h3 className="text-[13px] font-bold text-gray-800 mb-3">Custom Material</h3>
        <div className="grid grid-cols-3 gap-3">
          {uploadedImages.map((url, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                if (e.button === 0) onUpload(null, url);
              }}
              onContextMenu={(e) => handleContextMenu(e, url)}
              className="aspect-square rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-gray-50 flex items-center justify-center p-0 cursor-pointer hover:border-[#c0623a] hover:shadow-md transition-all relative"
            >
              <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-contain pointer-events-none" />
            </button>
          ))}
          {uploadedImages.length === 0 && (
            <p className="col-span-3 text-xs text-gray-400 text-center py-4">No uploaded materials yet.</p>
          )}
        </div>

        <h3 className="text-[13px] font-bold text-gray-800 mb-3 mt-6">Preset Material</h3>
        <div className="grid grid-cols-3 gap-3">
          {presetImages.map((url, idx) => (
            <button
              key={`preset-${idx}`}
              onClick={(e) => {
                if (e.button === 0) onUpload(null, url);
              }}
              onContextMenu={(e) => handleContextMenu(e, url)}
              className="aspect-square rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-gray-50 flex items-center justify-center p-0 cursor-pointer hover:border-[#c0623a] hover:shadow-md transition-all relative"
            >
              <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-contain pointer-events-none" />
            </button>
          ))}
        </div>
      </div>

      {contextMenu && (
        <div
          className="fixed z-[9999] bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 py-1.5 min-w-[140px] text-left animate-in fade-in zoom-in-95 duration-100"
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">
            Resize &amp; Fit
          </div>
          <button
            onClick={() => {
              onUpload(null, contextMenu.url, 'contain');
              setContextMenu(null);
            }}
            className="w-full px-3 py-2 text-xs font-medium text-gray-700 hover:bg-[#fff5f0] hover:text-[#c0623a] flex items-center gap-2 border-none bg-transparent cursor-pointer text-left transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeDasharray="3 3" />
              <rect x="5" y="7" width="14" height="10" rx="1" stroke="currentColor" fill="currentColor" fillOpacity="0.1" />
            </svg>
            Contain
          </button>
          <button
            onClick={() => {
              onUpload(null, contextMenu.url, 'cover');
              setContextMenu(null);
            }}
            className="w-full px-3 py-2 text-xs font-medium text-gray-700 hover:bg-[#fff5f0] hover:text-[#c0623a] flex items-center gap-2 border-none bg-transparent cursor-pointer text-left transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeDasharray="3 3" />
              <rect x="1" y="5" width="22" height="14" rx="1.5" stroke="currentColor" fill="currentColor" fillOpacity="0.15" />
            </svg>
            Cover
          </button>
        </div>
      )}
    </div>
  );
}
