import { useState } from 'react';

const tools = [
  {
    id: 'models',
    label: 'MODELS',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[22px] h-[22px]">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[22px] h-[22px]">
        <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
      </svg>
    ),
  },
  {
    id: 'layout',
    label: 'LAYOUT',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[22px] h-[22px]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
      </svg>
    ),
  },
  {
    id: 'scene',
    label: 'SCENE',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[22px] h-[22px]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
  },
];

export default function LeftSidebar({ active, setActive, items }) {
  const displayTools = items ? tools.filter(t => items.includes(t.id)) : tools;

  return (
    <aside className="
      flex flex-col items-center py-6 gap-3
      bg-white rounded-[15px]
      shadow-[0_8px_30px_rgb(0,0,0,0.08)]
      w-[88px] h-fit shrink-0
      overflow-y-auto scrollbar-hide

      max-[640px]:w-[68px]
      max-[640px]:py-4 max-[640px]:gap-4
    ">
      {displayTools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setActive(active === tool.id ? null : tool.id)}
          className={`
            relative flex flex-col items-center justify-center gap-2 border-none cursor-pointer bg-transparent
            transition-all duration-200 text-[12.5px] font-bold p-0 w-full py-3
            max-[640px]:text-[9px]
            ${active === tool.id
              ? 'text-[#C15F27]'
              : 'text-[#9f9891] hover:text-gray-600'
            }
          `}
        >
          {active === tool.id && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[44px] bg-[#C15F27] rounded-r-full" />
          )}
          <div className={`
            flex items-center justify-center transition-all duration-200
            ${active === tool.id
              ? 'text-[#C15F27]'
              : 'text-[#9f9891]'
            }
          `}>
            {tool.icon}
          </div>
          <span className="tracking-[0.1em] pl-[0.1em]">{tool.label}</span>
        </button>
      ))}
    </aside>
  );
}
