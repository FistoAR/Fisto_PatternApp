import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

import bgImage from "../assets/images/Home/Hero/Testing1/bg.png";
import leftPlantImage from "../assets/images/Home/Hero/Testing1/leftplantsmall.png";
import rightPlantImage from "../assets/images/Home/Hero/Testing1/rightplant.png";
import productImage from "../assets/images/Home/Hero/Testing1/product.png";

export default function Testing1Hero() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Tall Plant (right) and its shadow
      gsap.to([".plant-right", ".plant-right-shadow"], {
        rotation: 2,
        x: 10,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "bottom center"
      });

      // Small Table Plant (left)
      gsap.to(".plant-left", {
        rotation: -3,
        x: -5,
        duration: 4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        transformOrigin: "bottom center"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100vh] overflow-hidden bg-gray-100 flex items-center justify-center"
    >
      {/* Background Wall */}
      <img
        src={bgImage}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Table Plant (left) */}
      <img
        src={leftPlantImage}
        alt="Left Plant"
        className="plant-left absolute bottom-0 left-0 w-auto h-[50%] z-10 origin-bottom"
      />

      {/* Tall Plant (right) Shadow Overlay */}
      {/* The shadow needs to be behind the product or right plant. The user's order:
          Background Wall -> Table Plant -> Tall Plant -> Product -> Shadow Overlay.
          Wait, user order: 
          Background Wall
                ↓
          Table Plant (left)
                ↓
          Tall Plant (right)
                ↓
          Product (Bottle/Tshirt/etc.)
                ↓
          Shadow Overlay

          Wait, the shadow overlay is for the right plant? "Duplicate the plant image... .plant-right-shadow"
          If it's an overlay, it might go on top of the product?
          Let's place them according to the user's z-index order.
      */}

      {/* Tall Plant (right) */}
      <img
        src={rightPlantImage}
        alt="Right Plant"
        className="plant-right absolute bottom-0 right-0 w-auto h-[80%] z-20 origin-bottom"
      />

      {/* Product */}
      <img
        src={productImage}
        alt="Product"
        className="absolute z-30 max-h-[70%] max-w-[50%] drop-shadow-2xl"
      />

      {/* Shadow Overlay - Realistic Shadow for the right plant */}
      <img
        src={rightPlantImage}
        alt="Right Plant Shadow"
        className="plant-right-shadow absolute bottom-0 right-0 w-auto h-[80%] z-40 origin-bottom pointer-events-none mix-blend-multiply"
        style={{
          filter: "blur(12px)",
          opacity: 0.18,
          transform: "skewX(-35deg)",
          transformOrigin: "bottom"
        }}
      />
    </div>
  );
}
