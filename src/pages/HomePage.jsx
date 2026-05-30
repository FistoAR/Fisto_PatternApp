import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import homeBg from '../assets/images/Home/homebg.webp';
import packagingIcon from '../assets/images/Home/packaging.webp';
import realistic3dIcon from '../assets/images/Home/realistic3d.webp';
import fasteasyIcon from '../assets/images/Home/fasteasy.webp';
import AnimatedSvgCard from '../components/AnimatedSvgCard';
import card1 from '../assets/images/Home/card1.svg?url';
import card2 from '../assets/images/Home/card2.svg?url';
import card3 from '../assets/images/Home/card3.svg?url';
import card4 from '../assets/images/Home/card4.svg?url';
import card5 from '../assets/images/Home/card5.svg?url';
import frameImg from '../assets/images/Home/frame.webp';
import Footer from '../components/Footer';
import GsapSmoothScroll from '../components/GsapSmoothScroll';

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const navigate = useNavigate();
  const pageRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) return undefined;

    const context = gsap.context(() => {
      gsap.utils.toArray('[data-scroll-fade]').forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 32 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: 'power3.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: element,
              start: 'top 92%',
              toggleActions: 'play none none none',
              once: true,
            },
          }
        );
      });

      const cards = gsap.utils.toArray('.category-card');
      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: 36, scale: 0.96 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: 'back.out(1.35)',
          stagger: 0.14,
          immediateRender: false,
          scrollTrigger: {
            trigger: '.category-cards',
            start: 'top 88%',
            toggleActions: 'play none none none',
            once: true,
          },
        }
      );
    }, pageRef);

    return () => context.revert();
  }, []);

  return (
    <GsapSmoothScroll>
    <div ref={pageRef} className="flex flex-col min-h-full bg-white font-['Inter'] flex-1 w-full">
      <main className="flex flex-col w-full flex-1">
        {/* Hero Section */}
        <div 
          className="relative w-[100vw] h-[100vh] flex flex-col justify-center bg-cover bg-center bg-no-repeat" 
          style={{ backgroundImage: `url(${homeBg})` }}
        >
          <div className="w-full px-6 lg:px-12 xl:px-20 flex flex-col lg:flex-row items-center">
            
            {/* Left Content */}
            <div className="w-full lg:w-[60%] z-10 text-left pt-10 lg:pt-0">
              <h1 
                data-scroll-fade
                className="font-bold text-gray-900 mb-6"
                style={{
                  fontSize: 'clamp(40px, 4.3vw, 81.1px)',
                  lineHeight: '127.1%',
                  letterSpacing: '0%'
                }}
              >
                Create Professional<br />
                Box <span style={{ color: '#37472F' }}>Mockups</span><br />
                <span style={{ color: '#37472F' }}>In Seconds</span>
              </h1>
              
              <p data-scroll-fade className="text-lg lg:text-xl text-gray-800 max-w-2xl mb-10 leading-relaxed">
                Showcase your packaging designs on realistic box mockups with high-quality 3D previews. Perfect for product packaging, shipping boxes, retail branding, and e-commerce presentations.
              </p>

              <button
                data-scroll-fade
                onClick={() => navigate('/editor')}
                className="group flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-white font-semibold text-lg shadow-lg hover:opacity-90 transition-opacity border-none cursor-pointer mb-16"
                style={{ background: '#C15F27' }}
              >
                Start Designing
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>

              {/* 3 Features */}
              <div data-scroll-fade className="flex flex-wrap items-center gap-6 lg:gap-10">
                {/* Feature 1 */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#37472F' }}>
                    <img src={realistic3dIcon} alt="Realistic 3D" className="w-6 h-6 object-contain filter invert brightness-0" style={{ filter: 'brightness(0) invert(1)' }} />
                  </div>
                  <span className="text-sm lg:text-base font-bold text-gray-900 leading-tight">Realistic 3D<br/>Box Preview</span>
                </div>
                {/* Feature 2 */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#37472F' }}>
                    <img src={packagingIcon} alt="Premium Packaging" className="w-6 h-6 object-contain filter invert brightness-0" style={{ filter: 'brightness(0) invert(1)' }} />
                  </div>
                  <span className="text-sm lg:text-base font-bold text-gray-900 leading-tight">Premium<br/>Packaging Mockups</span>
                </div>
                {/* Feature 3 */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#37472F' }}>
                    <img src={fasteasyIcon} alt="Fast Easy" className="w-6 h-6 object-contain filter invert brightness-0" style={{ filter: 'brightness(0) invert(1)' }} />
                  </div>
                  <span className="text-sm lg:text-base font-bold text-gray-900 leading-tight">Fast & Easy<br/>Customization</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Marquee Bar */}
        <div className="w-[100vw] overflow-hidden flex items-center h-[72px]" style={{ backgroundColor: '#2B4326' }}>
          <div className="flex animate-marquee text-white font-bold text-xl md:text-2xl tracking-wide w-max">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center whitespace-nowrap">
                <span className="mx-8">Burger Boxes</span>
                <span style={{ color: '#C15F27' }}>●</span>
                <span className="mx-8">Pizza Boxes</span>
                <span style={{ color: '#C15F27' }}>●</span>
                <span className="mx-8">Square Box</span>
                <span style={{ color: '#C15F27' }}>●</span>
                <span className="mx-8">Food box</span>
                <span style={{ color: '#C15F27' }}>●</span>
                <span className="mx-8">Plastic Box</span>
                <span style={{ color: '#C15F27' }}>●</span>
                <span className="mx-8">Water bottle</span>
                <span style={{ color: '#C15F27', marginRight: '2rem' }}>●</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Explore by Category */}
        <div className="w-full py-14 px-6 lg:px-12 xl:px-20 flex flex-col items-center bg-white">
          <span data-scroll-fade className="text-lg font-bold tracking-widest uppercase mb-4" style={{ color: '#D89234' }}>Explore By Category</span>
          <h2 data-scroll-fade className="text-4xl lg:text-5xl font-semibold  mb-4 text-center" style={{ color: '#111827' }}>
            Mockups For Every Need
          </h2>
          <p data-scroll-fade className="text-gray-500 text-xl text-center  mb-12">
            Choose from a wide range of packaging mockups and bring your ideas to life.
          </p>

          <div className="category-cards w-full flex gap-6">
            <AnimatedSvgCard src={card1} index={0} />
            <AnimatedSvgCard src={card2} index={1} />
            <AnimatedSvgCard src={card3} index={2} />
            <AnimatedSvgCard src={card4} index={3} />
            <AnimatedSvgCard src={card5} index={4} />
          </div>

          <button
            data-scroll-fade
            onClick={() => navigate('/editor')}
            className="group mt-16 flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg hover:opacity-90 transition-opacity border-none cursor-pointer"
            style={{ background: '#C15F27' }}
          >
            View All Mockups
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

        {/* Section 3: How it Works */}
        <div className="w-full pb-10 px-6 lg:px-12 xl:px-20 flex flex-col items-center bg-white">
          <span data-scroll-fade className="text-md font-bold tracking-widest uppercase mb-4" style={{ color: '#D89234' }}>How it Works</span>
          <h2 data-scroll-fade className="text-4xl lg:text-5xl font-bold text-black mb-16 text-center">
            Simple Steps, Stunning Results
          </h2>

          <div data-scroll-fade className="w-full  mx-auto flex  items-center justify-between gap-6 xl:gap-4">
            
            {/* Step 1 */}
            <div className="bg-[#FAF8F8] border-2 border-white shadow-xl rounded-[32px] p-8 w-full max-w-[300px] h-[220px] flex flex-col justify-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mb-4" style={{ backgroundColor: '#E4EADF', color: '#37472F' }}>1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Choose Mockup</h3>
              <p className="text-gray-500 text-sm">Select the perfect mockup for your product.</p>
            </div>

            {/* Arrow */}
            <div className="text-[#6B7280]">
              <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 10H38M38 10L30 2M38 10L30 18" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
              </svg>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FAF8F8] border-2 border-white shadow-xl rounded-[32px] p-8 w-full max-w-[300px] h-[220px] flex flex-col justify-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mb-4" style={{ backgroundColor: '#E4EADF', color: '#37472F' }}>2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Design</h3>
              <p className="text-gray-500 text-sm">Upload your artwork with ease.</p>
            </div>

            {/* Arrow */}
            <div className="text-[#6B7280]">
              <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 10H38M38 10L30 2M38 10L30 18" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
              </svg>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FAF8F8] border-2 border-white shadow-xl rounded-[32px] p-8 w-full max-w-[300px] h-[220px] flex flex-col justify-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mb-4" style={{ backgroundColor: '#E4EADF', color: '#37472F' }}>3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Customize</h3>
              <p className="text-gray-500 text-sm">Adjust colors, shadows and elements.</p>
            </div>

            {/* Arrow */}
            <div className="text-[#6B7280]">
              <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 10H38M38 10L30 2M38 10L30 18" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
              </svg>
            </div>

            {/* Step 4 */}
            <div className="bg-[#FAF8F8] border-2 border-white shadow-xl rounded-[32px] p-8 w-full max-w-[300px] h-[220px] flex flex-col justify-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mb-4" style={{ backgroundColor: '#E4EADF', color: '#37472F' }}>4</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Download</h3>
              <p className="text-gray-500 text-sm">Download high-quality images instantly.</p>
            </div>

          </div>
        </div>

        {/* Bottom Banner */}
        <div className="w-full px-4 lg:px-10 xl:px-18 pb-12 pt-10">
          <div className="relative mx-auto w-full max-w-[1352px] min-h-[262px] overflow-hidden rounded-[10px] px-[clamp(28px,4.35vw,59px)] py-[52px]" style={{ backgroundColor: '#294A26' }}>
            
            {/* Left Content */}
            <div data-scroll-fade className="relative z-10 w-full max-w-[700px] text-left">
              <div className="mb-3 flex items-center gap-4">
                <div className="h-[2px] w-6" style={{ backgroundColor: '#F2B62C' }}></div>
                <span className="text-[11px] font-bold uppercase leading-none tracking-[0.16em]" style={{ color: '#F2B62C' }}>Ready To Get Started?</span>
              </div>
              <h2 className="mb-3 text-[clamp(31px,2.7vw,38px)] font-bold leading-[1.28] text-white">
                Ready to Create Stunning<br/>Packaging <span style={{ color: '#F2B62C' }}>Mockups?</span>
              </h2>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-12">
                <p className="max-w-[395px] text-[15px] font-medium leading-[1.65] text-white">
                  Bring your ideas to life with our premium mockups <br /> and packaging solutions.
                </p>
                <button
                  onClick={() => navigate('/editor')}
                  className="group flex h-[51px] w-fit min-w-[207px] items-center justify-center gap-7 rounded-[10px] px-4 text-[16px] font-bold text-[#20391E] transition-opacity hover:opacity-90 border-none cursor-pointer"
                  style={{ background: '#F2B62C' }}
                >
                  Start Designing
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 transition-transform duration-300 ease-out group-hover:translate-x-1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right Image */}
            <img
              data-scroll-fade
              src={frameImg}
              alt="Products"
              className="pointer-events-none relative z-0 mt-8 w-full max-w-[700px] object-contain sm:mt-6 lg:absolute lg:bottom-0 lg:right-[34px] lg:mt-0 lg:w-[43.2vw] lg:max-w-[586px]"
            />

          </div>
        </div>
      </main>
      <Footer />
    </div>
    </GsapSmoothScroll>
  );
}
