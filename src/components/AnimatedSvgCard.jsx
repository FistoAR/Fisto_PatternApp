import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedSvgCard({ src, index = 0 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const tweens = [];

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

        const paths = container.querySelectorAll('path');
        tweens.push(gsap.fromTo(paths, {
          autoAlpha: 0,
          y: 28,
        }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.03,
          immediateRender: false,
          scrollTrigger: {
            trigger: container,
            start: 'top 88%',
            toggleActions: 'play none none none',
            once: true,
          },
        }));

        ScrollTrigger.refresh();
      });

    return () => {
      isMounted = false;
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
