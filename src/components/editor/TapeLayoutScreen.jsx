import React, { useState, useEffect, useRef } from "react";

export default function TapeLayoutScreen({ onSave, onCancel }) {
  const [image, setImage] = useState(null);
  const [canvasWidth, setCanvasWidth] = useState(360);
  const [matterWidth, setMatterWidth] = useState(60);
  const [matterHeight, setMatterHeight] = useState(48);
  const [repeatGap, setRepeatGap] = useState(30);
  const [copies, setCopies] = useState(5);

  const canvasRef = useRef(null);

  const totalCanvasHeight = matterHeight + 12; // As seen in screenshot "Calculated as Matter Height + 12mm"
  const printSpan = matterWidth * copies + repeatGap * (copies - 1);

  // Canvas pixel resolution
  const PPI = 300;
  const mmToPx = (mm) => (mm * PPI) / 25.4;
  
  // Auto-update canvas width when dimensions or copies change
  useEffect(() => {
    const minRequiredWidth = matterWidth * copies + repeatGap * (copies + 1);
    setCanvasWidth(minRequiredWidth);
  }, [matterWidth, repeatGap, copies]);

  const canvasResWidth = Math.round(mmToPx(canvasWidth));
  const canvasResHeight = Math.round(mmToPx(totalCanvasHeight));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => setImage(img);
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const drawCanvas = (withBackground = false) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const widthPx = canvasResWidth;
    const heightPx = canvasResHeight;

    // Clear canvas
    ctx.clearRect(0, 0, widthPx, heightPx);
    if (withBackground) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, widthPx, heightPx);
    }

    if (!image) return;

    // Calculate dimensions in pixels
    const matterWidthPx = mmToPx(matterWidth);
    const matterHeightPx = mmToPx(matterHeight);
    const repeatGapPx = mmToPx(repeatGap);

    // Draw copies centered vertically and starting from left (or centered horizontally)
    const printSpanPx = mmToPx(printSpan);
    const startX = (widthPx - printSpanPx) / 2;
    const startY = (heightPx - matterHeightPx) / 2;

    for (let i = 0; i < copies; i++) {
      const x = startX + i * (matterWidthPx + repeatGapPx);
      
      // Preserve aspect ratio (object-fit: contain)
      const imgW = image.naturalWidth || image.width;
      const imgH = image.naturalHeight || image.height;
      const imgAspect = imgW && imgH ? imgW / imgH : 1;
      const boxAspect = matterWidthPx / matterHeightPx;
      let drawW, drawH, drawX, drawY;
      
      if (imgAspect > boxAspect) {
        drawW = matterWidthPx;
        drawH = matterWidthPx / imgAspect;
      } else {
        drawH = matterHeightPx;
        drawW = matterHeightPx * imgAspect;
      }
      
      drawX = x + (matterWidthPx - drawW) / 2;
      drawY = startY + (matterHeightPx - drawH) / 2;

      ctx.drawImage(image, drawX, drawY, drawW, drawH);
    }
  };

  useEffect(() => {
    drawCanvas(false);
  }, [image, canvasWidth, matterWidth, matterHeight, repeatGap, copies]);

  const handleSave = () => {
    drawCanvas(false); // Ensure transparent background for applied texture
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      onSave(dataUrl);
    }
  };

  const handleExport = () => {
    drawCanvas(true); // Ensure white background for export
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "tape-layout.png";
      a.click();
    }
    drawCanvas(false); // Restore transparent preview
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm font-sans">
      <div className="bg-[#f8fafc] w-full max-w-[1200px] h-[85vh] mt-[5vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative border border-white/20">
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden p-6 gap-6 min-h-0">
          {/* Left Sidebar */}
          <div className="w-80 shrink-0 flex flex-col gap-6 overflow-y-auto pr-2 pb-6">
            {/* Image Upload */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-[#c0623a] uppercase tracking-wider mb-3 mt-0">
                1. Image Upload
              </h3>
              <div className="flex items-center gap-3">
                <label className="px-4 py-2 bg-[#f8ede8] text-[#c0623a] font-semibold rounded-lg cursor-pointer hover:bg-[#eabfb0] transition-colors text-sm">
                  Choose file
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-slate-500 truncate">
                  {image ? "Image selected" : "No file chosen"}
                </span>
              </div>
            </div>

            {/* Dimensions */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider m-0">
                2. Dimensions (MM)
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500">
                  Canvas Width
                </label>
                <input
                  type="number"
                  value={canvasWidth}
                  onChange={(e) => setCanvasWidth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#c0623a] focus:ring-1 focus:ring-[#c0623a]"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-medium text-slate-500">
                    Matter Width
                  </label>
                  <input
                    type="number"
                    value={matterWidth}
                    onChange={(e) => setMatterWidth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#c0623a] focus:ring-1 focus:ring-[#c0623a]"
                  />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-medium text-slate-500">
                    Matter Height
                  </label>
                  <input
                    type="number"
                    value={matterHeight}
                    onChange={(e) => setMatterHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#c0623a] focus:ring-1 focus:ring-[#c0623a]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500">
                  Repeat Gap
                </label>
                <input
                  type="number"
                  value={repeatGap}
                  onChange={(e) => setRepeatGap(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#c0623a] focus:ring-1 focus:ring-[#c0623a]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500">
                  Copies
                </label>
                <input
                  type="number"
                  value={copies}
                  onChange={(e) => setCopies(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#c0623a] focus:ring-1 focus:ring-[#c0623a]"
                />
              </div>

              {/* Total Height Card */}
              <div className="mt-2 bg-[#c0623a] rounded-xl p-4 text-white">
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/80 mb-1">
                  Total Canvas Height
                </div>
                <div className="text-3xl font-black tracking-tight leading-none mb-1">
                  {totalCanvasHeight}mm
                </div>
                <div className="text-[11px] text-white/80">
                  Calculated as Matter Height + 12mm
                </div>
              </div>
            </div>
          </div>

          {/* Right Preview Area */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <div
              className="flex-1 bg-[#f1f1f1] rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center p-8 overflow-auto"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #e5e5e5 25%, transparent 25%), linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5e5 75%), linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)",
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
              }}
            >
              {/* Visual representation of the layout */}
              <div
                className="relative shadow-md"
                style={{
                  width: `${(canvasWidth / 360) * 100}%`,
                  maxWidth: "100%",
                  aspectRatio: `${canvasWidth} / ${totalCanvasHeight}`,
                  backgroundColor: "rgba(255, 255, 255, 0.4)",
                }}
              >
                {/* This is the invisible actual canvas used for generating the output image */}
                <canvas
                  ref={canvasRef}
                  width={canvasResWidth}
                  height={canvasResHeight}
                  className="hidden"
                />

                {/* Visual preview elements (red lines, etc.) */}
                {image && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="relative border border-red-400/50 flex"
                      style={{
                        width: `${(printSpan / canvasWidth) * 100}%`,
                        height: `${(matterHeight / totalCanvasHeight) * 100}%`,
                      }}
                    >
                      {Array.from({ length: copies }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute h-full flex items-center justify-center"
                          style={{
                            width: `${(matterWidth / printSpan) * 100}%`,
                            left: `${((i * (matterWidth + repeatGap)) / printSpan) * 100}%`,
                          }}
                        >
                          <img
                            src={image.src}
                            alt=""
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Stats */}
            <div className="flex justify-end ">
              <div className="flex items-center gap-3 bg-white shadow-sm shrink-0 rounded-xl border border-slate-200 p-4 ">
                <button
                  onClick={onCancel}
                  className="px-5 py-2.5 rounded-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  className="px-5 py-2.5 rounded-lg font-bold text-[#c0623a] bg-[#fdfdfd] border border-[#eabfb0] hover:bg-[#f8ede8] transition-colors cursor-pointer"
                >
                  Export PNG
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 rounded-lg font-bold text-white bg-[#c0623a] hover:bg-[#a54f2c] transition-colors border-none cursor-pointer shadow-md"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
