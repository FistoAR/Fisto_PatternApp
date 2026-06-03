import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import homeBg from '../assets/images/Home/homebg.svg';
import packagingIcon from '../assets/images/Home/packaging.webp';
import realistic3dIcon from '../assets/images/Home/realistic3d.webp';
import fasteasyIcon from '../assets/images/Home/fasteasy.webp';
import AnimatedSvgCard from '../components/AnimatedSvgCard';
import card1 from '../assets/images/Home/card1.svg?url';
import card2 from '../assets/images/Home/card2.svg?url';
import card3 from '../assets/images/Home/card3.svg?url';
import card4 from '../assets/images/Home/card4.svg?url';
import card5 from '../assets/images/Home/card5.svg?url';
import Footer from '../components/Footer';
import GsapSmoothScroll from '../components/GsapSmoothScroll';
import ReadyMockupBanner from '../components/ReadyMockupBanner';

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const navigate = useNavigate();
  const pageRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) return undefined;

    const hoverCleanups = [];
    const context = gsap.context(() => {
      const revealOnScroll = (elements, fromVars, toVars = {}) => {
        const {
          trigger,
          start = 'top 88%',
          end = 'bottom 12%',
          duration = 0.9,
          ease = 'power3.out',
          ...animationVars
        } = toVars;

        gsap.utils.toArray(elements).forEach((element) => {
          gsap.fromTo(
            element,
            fromVars,
            {
              ...animationVars,
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              rotate: 0,
              duration,
              ease,
              overwrite: 'auto',
              immediateRender: false,
              scrollTrigger: {
                trigger: trigger ?? element,
                start,
                end,
                toggleActions: 'play reverse play reverse',
              },
            }
          );
        });
      };

      const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTimeline
        .from('.hero-title-line', { autoAlpha: 0, x: -72, y: 16, duration: 0.78, stagger: 0.12 })
        .from('.hero-copy-item', { autoAlpha: 0, x: -42, duration: 0.65, stagger: 0.11 }, '-=0.32')
        .from('.hero-feature', { autoAlpha: 0, y: 24, scale: 0.92, duration: 0.55, stagger: 0.1 }, '-=0.18');

      gsap.to('.hero-section', {
        backgroundPosition: '52% 44%',
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        },
      });

      revealOnScroll('[data-scroll-fade]', { autoAlpha: 0, y: 34 });
      revealOnScroll('[data-scroll-left]', { autoAlpha: 0, x: -54 });
      revealOnScroll('[data-scroll-right]', { autoAlpha: 0, x: 54 });

      gsap.utils.toArray('.step-card').forEach((card) => {
        const enter = () => gsap.to(card, { y: -12, scale: 1.035, boxShadow: '0 24px 52px rgba(17,24,39,0.16)', duration: 0.35, ease: 'power3.out' });
        const leave = () => gsap.to(card, { y: 0, scale: 1, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', duration: 0.35, ease: 'power3.out' });
        card.addEventListener('mouseenter', enter);
        card.addEventListener('mouseleave', leave);
        hoverCleanups.push(() => {
          card.removeEventListener('mouseenter', enter);
          card.removeEventListener('mouseleave', leave);
        });
      });

      gsap.fromTo(
        '.frame-product',
        { autoAlpha: 0, x: 120, y: 46, rotate: 5, scale: 0.88 },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          duration: 1.05,
          ease: 'back.out(1.25)',
          immediateRender: false,
          overwrite: 'auto',
          scrollTrigger: {
            trigger: '.frame-banner',
            start: 'top 82%',
            end: 'bottom 18%',
            toggleActions: 'play reverse play reverse',
          },
        }
      );

      revealOnScroll('footer > div > div', { autoAlpha: 0, y: 30, scale: 0.98 }, { trigger: 'footer', start: 'top 92%' });

      window.requestAnimationFrame(() => ScrollTrigger.refresh());
    }, pageRef);

    return () => {
      hoverCleanups.forEach((cleanup) => cleanup());
      context.revert();
    };
  }, []);

  return (
    <GsapSmoothScroll>
    <div ref={pageRef} className="flex flex-col min-h-full bg-white font-['Inter'] flex-1 w-full">
      <main className="flex flex-col w-full flex-1">
        {/* Hero Section */}
        <div 
          id="home"
          className="hero-section relative w-[100vw] h-[100vh] flex flex-col justify-center bg-cover bg-center bg-no-repeat" 
          style={{ backgroundImage: `url(${homeBg})` }}
        >
          <div className="w-full px-6 lg:px-12 xl:px-20 flex flex-col lg:flex-row items-center">
            
            {/* Left Content */}
            <div className="w-full lg:w-[60%] z-10 text-left pt-10 lg:pt-0">
              <h1 
                className="font-bold text-gray-900 mb-6"
                style={{
                  fontSize: 'clamp(40px, 4.3vw, 81.1px)',
                  lineHeight: '127.1%',
                  letterSpacing: '0%'
                }}
              >
                <span className="hero-title-line block">Create Professional</span>
                <span className="hero-title-line block">Box <span style={{ color: '#37472F' }}>Mockups</span></span>
                <span className="hero-title-line block" style={{ color: '#37472F' }}>In Seconds</span>
              </h1>
              
              <p className="hero-copy-item text-lg lg:text-xl text-gray-800 max-w-2xl mb-10 leading-relaxed">
                Showcase your packaging designs on realistic box mockups with high-quality 3D previews. Perfect for product packaging, shipping boxes, retail branding, and e-commerce presentations.
              </p>

              <button
                onClick={() => navigate('/modelsMockup')}
                className="hero-copy-item group flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-white font-semibold text-lg shadow-lg hover:opacity-90 transition-opacity border-none cursor-pointer mb-16"
                style={{ background: '#C15F27' }}
              >
                Start Designing
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>

              {/* 3 Features */}
              <div className="hero-copy-item flex flex-wrap items-center gap-6 lg:gap-10">
                {/* Feature 1 */}
                <div className="hero-feature flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#37472F' }}>
                    <img src={realistic3dIcon} alt="Realistic 3D" className="w-6 h-6 object-contain filter invert brightness-0" style={{ filter: 'brightness(0) invert(1)' }} />
                  </div>
                  <span className="text-sm lg:text-base font-bold text-gray-900 leading-tight">Realistic 3D<br/>Box Preview</span>
                </div>
                {/* Feature 2 */}
                <div className="hero-feature flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#37472F' }}>
                    <img src={packagingIcon} alt="Premium Packaging" className="w-6 h-6 object-contain filter invert brightness-0" style={{ filter: 'brightness(0) invert(1)' }} />
                  </div>
                  <span className="text-sm lg:text-base font-bold text-gray-900 leading-tight">Premium<br/>Packaging Mockups</span>
                </div>
                {/* Feature 3 */}
                <div className="hero-feature flex items-center gap-4">
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
        <div data-scroll-fade className="w-[100vw] overflow-hidden flex items-center h-[72px]" style={{ backgroundColor: '#2B4326' }}>
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
        <div id="features" className="w-full py-14 px-6 lg:px-12 xl:px-20 flex flex-col items-center bg-white">
          <span className="text-lg font-bold tracking-widest uppercase mb-4" style={{ color: '#D89234' }}>Explore By Category</span>
          <h2 className="text-4xl lg:text-5xl font-semibold  mb-4 text-center" style={{ color: '#111827' }}>
            Mockups For Every Need
          </h2>
          <p className="text-gray-500 text-xl text-center  mb-12">
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
            onClick={() => navigate('/modelsMockup')}
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
        <div id="mockups" data-scroll-section className="w-full pb-10 px-6 lg:px-12 xl:px-20 flex flex-col items-center bg-white font-Outfit">
          <span data-scroll-text className="text-md font-bold tracking-widest uppercase mb-4" style={{ color: '#D89234' }}>How it Works</span>
          <h2 data-scroll-text="right" className="text-4xl lg:text-5xl font-bold text-black mb-16 text-center">
            Simple Steps, Stunning Results
          </h2>

          <div data-scroll-fade className="w-full  mx-auto flex  items-center justify-between gap-6 xl:gap-4">
            
            {/* Step 1 */}
            <div className="step-card bg-[#FAF8F8] border-2 border-white shadow-xl rounded-[32px] p-8 w-full max-w-[300px] h-[220px] flex flex-col justify-center cursor-pointer will-change-transform">
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
            <div className="step-card bg-[#FAF8F8] border-2 border-white shadow-xl rounded-[32px] p-8 w-full max-w-[300px] h-[220px] flex flex-col justify-center cursor-pointer will-change-transform">
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
            <div className="step-card bg-[#FAF8F8] border-2 border-white shadow-xl rounded-[32px] p-8 w-full max-w-[300px] h-[220px] flex flex-col justify-center cursor-pointer will-change-transform">
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
            <div className="step-card bg-[#FAF8F8] border-2 border-white shadow-xl rounded-[32px] p-8 w-full max-w-[300px] h-[220px] flex flex-col justify-center cursor-pointer will-change-transform">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mb-4" style={{ backgroundColor: '#E4EADF', color: '#37472F' }}>4</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Download</h3>
              <p className="text-gray-500 text-sm">Download high-quality images instantly.</p>
            </div>

          </div>
        </div>

        {/* Bottom Banner */}
        <div id="pricing" className="w-full px-4 lg:px-10 xl:px-18 pb-12 pt-10">
          <ReadyMockupBanner animated />
        </div>
      </main>
      <Footer />
    </div>
    </GsapSmoothScroll>
  );
}
