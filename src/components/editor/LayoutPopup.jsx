export default function LayoutPopup() {
  return (
    <div className="w-[350px] h-fit max-h-[620px] shrink-0 bg-white rounded-[15px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col">
      <div className="p-5 pb-3">
        <h2 className="text-xl font-bold text-gray-900 m-0">Layout</h2>
      </div>

      <div className="px-5 pb-5 overflow-y-auto flex-1 scrollbar-hide">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }, (_, index) => (
            <button
              key={`layout-${index + 1}`}
              type="button"
              className={`relative aspect-[1.2] overflow-hidden rounded-lg border-2 bg-gray-50 p-3 cursor-pointer transition-all hover:border-[#c05520] hover:shadow-sm flex flex-col items-center justify-center gap-1.5 ${
                index === 0 ? 'border-[#c05520] shadow-[0_0_0_2px_rgba(192,85,32,0.18)]' : 'border-transparent'
              }`}
            >
              <div className="w-10 h-10 rounded border border-gray-200 bg-white flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V18ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-gray-500">
                Layout {index + 1}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
