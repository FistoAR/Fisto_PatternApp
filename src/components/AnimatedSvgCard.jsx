import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedSvgCard({ src, index = 0 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const tweens = [];
    const cleanupHandlers = [];

    fetch(src)
      .then(res => res.text())
      .then(svg => {
        if (!isMounted || !containerRef.current) return;
        containerRef.current.innerHTML = svg;
        
        const container = containerRef.current;
        const svgElement = container.querySelector('svg');
        if (svgElement) {
          svgElement.style.width = '100%';
          svgElement.style.height = 'auto';
        }

        const enter = () => {
          gsap.to(container, {
            y: -14,
            scale: 1.045,
            rotate: index % 2 === 0 ? -1.2 : 1.2,
            duration: 0.35,
            ease: 'power3.out',
          });
          gsap.to(svgElement, {
            filter: 'drop-shadow(0px 24px 28px rgba(17, 24, 39, 0.18))',
            duration: 0.35,
            ease: 'power3.out',
          });
        };

        const leave = () => {
          gsap.to(container, {
            y: 0,
            scale: 1,
            rotate: 0,
            duration: 0.35,
            ease: 'power3.out',
          });
          gsap.to(svgElement, {
            filter: 'drop-shadow(0px 0px 0px rgba(17, 24, 39, 0))',
            duration: 0.35,
            ease: 'power3.out',
          });
        };

        container.addEventListener('mouseenter', enter);
        container.addEventListener('mouseleave', leave);
        cleanupHandlers.push(() => {
          container.removeEventListener('mouseenter', enter);
          container.removeEventListener('mouseleave', leave);
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
    <div 
      ref={containerRef} 
      className="category-card w-full flex-1 justify-center cursor-pointer will-change-transform" 
    />
  );
}
