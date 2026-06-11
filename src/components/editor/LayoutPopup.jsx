import boxPreview from '../../assets/images/box-preview.png';

const layoutItems = Array.from({ length: 6 }, (_, index) => ({
  id: `layout-${index + 1}`,
  image: boxPreview,
}));

export default function LayoutPopup() {
  return (
    <div className="w-[350px] h-fit max-h-[620px] shrink-0 bg-white rounded-[15px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col">
      <div className="p-5 pb-3">
        <h2 className="text-xl font-bold text-gray-900 m-0">Layout</h2>
      </div>

      <div className="px-5 pb-5 overflow-y-auto flex-1 scrollbar-hide">
        <div className="grid grid-cols-2 gap-3">
          {layoutItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`relative aspect-[1.2] overflow-hidden rounded-lg border-2 bg-gray-50 p-0 cursor-pointer transition-all hover:border-[#c05520] hover:shadow-sm ${
                index === 0 ? 'border-[#c05520] shadow-[0_0_0_2px_rgba(192,85,32,0.18)]' : 'border-transparent'
              }`}
            >
              <img
                src={item.image}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
