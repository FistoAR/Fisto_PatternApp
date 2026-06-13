import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedSvgCard({ src, index = 0 }) {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const tweens = [];
    const cleanupHandlers = [];

    fetch(src)
      .then(res => res.text())
      .then(svg => {
        if (!isMounted || !containerRef.current || !wrapperRef.current) return;
        containerRef.current.innerHTML = svg;
        
        const container = containerRef.current;
        const wrapper = wrapperRef.current;
        const svgElement = container.querySelector('svg');
        if (svgElement) {
          svgElement.style.width = '100%';
          svgElement.style.height = 'auto';
        }

        // Hide card background container and border
        const rects = container.querySelectorAll('rect');
        rects.forEach((rect) => {
          const fill = rect.getAttribute('fill') || '';
          if (!fill.startsWith('url(')) {
            rect.style.display = 'none';
          }
        });

        // Remove card drop-shadow filters
        const groups = container.querySelectorAll('g');
        groups.forEach((g) => {
          const filter = g.getAttribute('filter') || '';
          if (filter.includes('filter0') || filter.includes('filter1')) {
            g.removeAttribute('filter');
          }
        });

        const titleText = container.querySelector('path[fill="#111827"]');
        const descText = container.querySelector('path[fill="#6B7280"]');

        const enter = () => {
          gsap.to(wrapper, {
            y: -14,
            scale: 1.045,
            rotate: index % 2 === 0 ? -1.2 : 1.2,
            duration: 0.35,
            ease: 'power3.out',
          });
          if (titleText) {
            gsap.to(titleText, {
              y: -8,
              duration: 0.35,
              ease: 'power3.out',
              overwrite: 'auto',
            });
          }
          if (descText) {
            gsap.to(descText, {
              y: -4,
              duration: 0.35,
              ease: 'power3.out',
              overwrite: 'auto',
            });
          }
        };

        const leave = () => {
          gsap.to(wrapper, {
            y: 0,
            scale: 1,
            rotate: 0,
            duration: 0.35,
            ease: 'power3.out',
          });
          if (titleText) {
            gsap.to(titleText, {
              y: 0,
              duration: 0.35,
              ease: 'power3.out',
              overwrite: 'auto',
            });
          }
          if (descText) {
            gsap.to(descText, {
              y: 0,
              duration: 0.35,
              ease: 'power3.out',
              overwrite: 'auto',
            });
          }
        };

        wrapper.addEventListener('mouseenter', enter);
        wrapper.addEventListener('mouseleave', leave);
        cleanupHandlers.push(() => {
          wrapper.removeEventListener('mouseenter', enter);
          wrapper.removeEventListener('mouseleave', leave);
        });

        const productImage = container.querySelector('rect[fill^="url("]');
        if (productImage) {
          tweens.push(gsap.to(productImage, {
            y: -16,
            duration: 1.8,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            delay: index * 0.18,
          }));
        }

        ScrollTrigger.refresh();
      });

    return () => {
      isMounted = false;
      cleanupHandlers.forEach((cleanup) => cleanup());
      tweens.forEach((tween) => tween.kill());
    };
  }, [index, src]);

  return (
    <div ref={wrapperRef} className="relative group category-wrapper w-full flex-1 justify-center cursor-pointer will-change-transform">
      <div 
        ref={containerRef} 
        className="category-card w-full h-full" 
      />
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-gray-100 text-gray-700 transition-colors duration-300 group-hover:bg-[#C15F27] group-hover:text-white group-hover:border-[#C15F27] z-10 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </div>
    </div>
  );
}
