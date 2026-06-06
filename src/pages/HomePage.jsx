import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import packagingIcon from "../assets/images/Home/packaging.webp";
import realistic3dIcon from "../assets/images/Home/realistic3d.webp";
import fasteasyIcon from "../assets/images/Home/fasteasy.webp";
import banner1 from "../assets/images/Home/Hero/banner1.svg";
import banner2 from "../assets/images/Home/Hero/banner2.svg";
import banner3 from "../assets/images/Home/Hero/banner3.svg";
import banner4 from "../assets/images/Home/Hero/banner4.svg";
import banner5 from "../assets/images/Home/Hero/banner5.svg";
import banner6 from "../assets/images/Home/Hero/banner6.svg";
import AnimatedSvgCard from "../components/AnimatedSvgCard";
import card1 from "../assets/images/Home/card1.svg?url";
import card2 from "../assets/images/Home/card2.svg?url";
import card3 from "../assets/images/Home/card3.svg?url";
import card4 from "../assets/images/Home/card4.svg?url";
import card5 from "../assets/images/Home/card5.svg?url";
import Footer from "../components/Footer";
import GsapSmoothScroll from "../components/GsapSmoothScroll";
import ReadyMockupBanner from "../components/ReadyMockupBanner";

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const navigate = useNavigate();
  const pageRef = useRef(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [bannersContent, setBannersContent] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasAnimatedMount, setHasAnimatedMount] = useState(false);

  const slideConfigs = [
    {
      productSelector: 'rect[fill*="pattern1_2127_41"]',
      labelSelector: null,
    },
    {
      productSelector: 'rect[fill*="pattern1_2118_2"]',
      labelSelector: null,
    },
    {
      productSelector: 'rect[fill*="pattern2_2112_30"]',
      labelSelector:
        'rect[fill*="pattern3_2112_30"], rect[fill*="pattern4_2112_30"]',
    },
    {
      productSelector: 'rect[fill*="pattern1_2112_74"]',
      labelSelector: 'rect[fill*="pattern2_2112_74"]',
    },
    {
      productSelector: 'rect[fill*="pattern1_2112_115"]',
      labelSelector: null,
    },
    {
      productSelector: 'rect[fill*="pattern1_2118_43"]',
      labelSelector: null,
    },
  ];

  const slideContents = [
    {
      title: (
        <>
          <span className="hero-title-line block">Create Professional</span>
          <span className="hero-title-line block">
            Box <span style={{ color: "#37472F" }}>Mockups</span>
          </span>
          <span className="hero-title-line block" style={{ color: "#37472F" }}>
            In Seconds
          </span>
        </>
      ),
      description:
        "Showcase your packaging designs on realistic box mockups with high-quality 3D previews. Perfect for product packaging, shipping boxes, retail branding, and e-commerce presentations.",
      buttonBg: "#37472F",
      themeColor: "#37472F",
      features: [
        { text: "Realistic 3D\nBox Preview", icon: realistic3dIcon },
        { text: "Premium\nPackaging Mockups", icon: packagingIcon },
        { text: "Fast & Easy\nCustomization", icon: fasteasyIcon },
      ],
    },
    {
      title: (
        <>
          <span className="hero-title-line block">Create Stunning</span>
          <span className="hero-title-line block">
            Bottle <span style={{ color: "#D54B0D" }}>Mockups</span>
          </span>
          <span className="hero-title-line block" style={{ color: "#D54B0D" }}>
            Instantly
          </span>
        </>
      ),
      description:
        "Upload your label design and preview it on premium-quality bottle mockups in real time. Perfect for beverage brands, cosmetic products, and e-commerce presentations.",
      buttonBg: "#D54B0D",
      themeColor: "#D54B0D",
      features: [
        { text: "Real-time\nPreview", icon: realistic3dIcon },
        { text: "High Quality\nBottle Renders", icon: packagingIcon },
        { text: "Easy Label\nCustomization", icon: fasteasyIcon },
      ],
    },
    {
      title: (
        <>
          <span className="hero-title-line block">Design Premium</span>
          <span className="hero-title-line block">
            Container <span style={{ color: "#224964" }}>Mockups</span>
          </span>
          <span className="hero-title-line block" style={{ color: "#224964" }}>
            In Minutes
          </span>
        </>
      ),
      description:
        "Showcase your packaging designs on realistic food and storage containers with studio-quality mockups built for modern brands.",
      buttonBg: "#224964",
      themeColor: "#224964",
      features: [
        { text: "Smart\nPacking Preview", icon: realistic3dIcon },
        { text: "HD Container\nMockups", icon: packagingIcon },
        { text: "Fast Design\nEditing", icon: fasteasyIcon },
      ],
    },
    {
      title: (
        <>
          <span className="hero-title-line block">Bring Your</span>
          <span className="hero-title-line block">
            Food <span style={{ color: "#7C4321" }}>Packaging</span>
          </span>
          <span className="hero-title-line block" style={{ color: "#7C4321" }}>
            To Life
          </span>
        </>
      ),
      description:
        "Present your snack, bakery, and takeaway packaging with realistic mockups designed for branding, marketing, and online stores.",
      buttonBg: "#7C4321",
      themeColor: "#7C4321",
      features: [
        { text: "Realistic\nFood Packaging", icon: realistic3dIcon },
        { text: "Print-ready\nPresentation", icon: packagingIcon },
        { text: "Instant Brand\nPreview", icon: fasteasyIcon },
      ],
    },
    {
      title: (
        <>
          <span className="hero-title-line block">Create Eye-Catching</span>
          <span className="hero-title-line block">
            Bag <span style={{ color: "#5C5281" }}>Mockups</span>
          </span>
          <span className="hero-title-line block" style={{ color: "#5C5281" }}>
            Effortlessly
          </span>
        </>
      ),
      description:
        "Preview shopping bags, paper bags and carry bags with professional mockups that help your brand stand out instantly.",
      buttonBg: "#5C5281",
      themeColor: "#5C5281",
      features: [
        { text: "Premium Bag\nDesign", icon: realistic3dIcon },
        { text: "Realistic Print\nPreview", icon: packagingIcon },
        { text: "Quick Custom\nEditing", icon: fasteasyIcon },
      ],
    },
    {
      title: (
        <>
          <span className="hero-title-line block">Design Modern</span>
          <span className="hero-title-line block">
            T-Shirt <span style={{ color: "#244963" }}>Mockups</span>
          </span>
          <span className="hero-title-line block" style={{ color: "#244963" }}>
            Like a pro
          </span>
        </>
      ),
      description:
        "Upload your artwork and visual it on realistic t-shirt mockups perfect for fashion brands, print shops and online stores.",
      buttonBg: "#244963",
      themeColor: "#244963",
      features: [
        { text: "HD Apparel\nMockups", icon: realistic3dIcon },
        { text: "Instant Design\nPreview", icon: packagingIcon },
        { text: "Easy Color\nCustomization", icon: fasteasyIcon },
      ],
    },
  ];

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const urls = [banner1, banner2, banner3, banner4, banner5, banner6];
        const contents = await Promise.all(
          urls.map((url) => fetch(url).then((res) => res.text())),
        );

        // Inject preserveAspectRatio and explicit 100% width/height to make them scale to fill width/height
        const adjustedContents = contents.map((text) => {
          return text.replace(/<svg([^>]*)/, (match, group) => {
            let res = group;
            res = res.replace(/width="[^"]*"/, 'width="100%"');
            res = res.replace(/height="[^"]*"/, 'height="100%"');
            if (res.includes("preserveAspectRatio")) {
              res = res.replace(
                /preserveAspectRatio="[^"]*"/,
                'preserveAspectRatio="xMidYMid slice"',
              );
            } else {
              res = `${res} preserveAspectRatio="xMidYMid slice"`;
            }
            return `<svg${res}`;
          });
        });

        setBannersContent(adjustedContents);
      } catch (err) {
        console.error("Error fetching banners:", err);
      }
    };
    fetchBanners();
  }, []);

  const changeSlide = (nextIndex) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const leftContent = pageRef.current?.querySelector(".hero-left-content");

    if (leftContent) {
      // 1. Animate left content down & fade out
      gsap.to(leftContent, {
        y: 60,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          // 2. Change state (updates content and lets CSS slide the wrapper!)
          setCurrentSlide(nextIndex);

          // Wait for CSS slide transition (700ms)
          setTimeout(() => {
            // 3. Animate left content back up
            gsap.to(leftContent, {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: "power3.out",
              onComplete: () => {
                setIsTransitioning(false);
              },
            });
          }, 700);
        },
      });
    } else {
      setCurrentSlide(nextIndex);
      setIsTransitioning(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      changeSlide((currentSlide + 1) % 6);
    }, 2000);
    return () => clearInterval(timer);
  }, [currentSlide, isTransitioning]);

  useEffect(() => {
    if (bannersContent.length === 0 || hasAnimatedMount) return;

    gsap.fromTo(
      ".hero-left-content",
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1.0, ease: "power3.out" },
    );
    setHasAnimatedMount(true);
  }, [bannersContent, hasAnimatedMount]);

  useEffect(() => {
    if (bannersContent.length === 0 || !bannersContent[currentSlide]) return;

    const container = pageRef.current?.querySelector(".hero-svg-wrapper");
    if (!container) return;

    // Find the active slide's container to query only within it
    const activeSlideEl = container.querySelectorAll(
      ".hero-svg-wrapper-inner > div",
    )[currentSlide];
    if (!activeSlideEl) return;

    const config = slideConfigs[currentSlide];
    const product = activeSlideEl.querySelector(config.productSelector);
    const labels = config.labelSelector
      ? activeSlideEl.querySelectorAll(config.labelSelector)
      : null;
    const background = activeSlideEl.querySelector('rect[fill*="pattern0_"]');

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    if (background) {
      tl.fromTo(background, { opacity: 0 }, { opacity: 1, duration: 1.0 }, 0);
    }

    if (product) {
      if (currentSlide === 0) {
        tl.fromTo(
          product,
          {
            scale: 0,
            rotate: -10.7475,
            transformOrigin: "50% 50%",
            opacity: 0,
          },
          { scale: 1, rotate: -10.7475, opacity: 1, duration: 2.0 },
          0.1,
        );
      } else if (currentSlide === 4) {
        tl.fromTo(
          product,
          { y: -300, opacity: 0 },
          { y: 0, opacity: 1, duration: 2.0 },
          0.1,
        );
      } else if (currentSlide === 5) {
        tl.fromTo(
          product,
          { x: 350, opacity: 0 },
          { x: 0, opacity: 1, duration: 2.0 },
          0.1,
        );
      } else {
        tl.fromTo(
          product,
          { x: 200, opacity: 0 },
          { x: 0, opacity: 1, duration: 2.0 },
          0.1,
        );
      }
    }

    if (labels && labels.length > 0) {
      tl.fromTo(
        labels,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 2.0 },
        0.1,
      );
    }
  }, [currentSlide, bannersContent]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (prefersReducedMotion.matches) return undefined;

    const hoverCleanups = [];
    const context = gsap.context(() => {
      const revealOnScroll = (elements, fromVars, toVars = {}) => {
        const {
          trigger,
          start = "top 88%",
          end = "bottom 12%",
          duration = 0.9,
          ease = "power3.out",
          ...animationVars
        } = toVars;

        gsap.utils.toArray(elements).forEach((element) => {
          gsap.fromTo(element, fromVars, {
            ...animationVars,
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0,
            duration,
            ease,
            overwrite: "auto",
            immediateRender: false,
            scrollTrigger: {
              trigger: trigger ?? element,
              start,
              end,
              toggleActions: "play reverse play reverse",
            },
          });
        });
      };

      gsap.to(".hero-svg-wrapper", {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      revealOnScroll("[data-scroll-fade]", { autoAlpha: 0, y: 34 });
      revealOnScroll("[data-scroll-left]", { autoAlpha: 0, x: -54 });
      revealOnScroll("[data-scroll-right]", { autoAlpha: 0, x: 54 });

      gsap.utils.toArray(".step-card").forEach((card) => {
        const enter = () =>
          gsap.to(card, {
            y: -12,
            scale: 1.035,
            boxShadow: "0 24px 52px rgba(17,24,39,0.16)",
            duration: 0.35,
            ease: "power3.out",
          });
        const leave = () =>
          gsap.to(card, {
            y: 0,
            scale: 1,
            boxShadow:
              "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            duration: 0.35,
            ease: "power3.out",
          });
        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseleave", leave);
        hoverCleanups.push(() => {
          card.removeEventListener("mouseenter", enter);
          card.removeEventListener("mouseleave", leave);
        });
      });

      gsap.fromTo(
        ".frame-product",
        { autoAlpha: 0, x: 120, y: 46, rotate: 5, scale: 0.88 },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          duration: 1.05,
          ease: "back.out(1.25)",
          immediateRender: false,
          overwrite: "auto",
          scrollTrigger: {
            trigger: ".frame-banner",
            start: "top 82%",
            end: "bottom 18%",
            toggleActions: "play reverse play reverse",
          },
        },
      );

      revealOnScroll(
        "footer > div > div",
        { autoAlpha: 0, y: 30, scale: 0.98 },
        { trigger: "footer", start: "top 92%" },
      );

      window.requestAnimationFrame(() => ScrollTrigger.refresh());
    }, pageRef);

    return () => {
      hoverCleanups.forEach((cleanup) => cleanup());
      context.revert();
    };
  }, []);

  return (
    <GsapSmoothScroll>
      <div
        ref={pageRef}
        className="flex flex-col min-h-full bg-white font-['Inter'] flex-1 w-full"
      >
        <main className="flex flex-col w-full flex-1">
          {/* Hero Section */}
          <div
            id="home"
            className="hero-section relative w-[100vw] h-[100vh] flex flex-col justify-center overflow-hidden"
          >
            {/* Background & Right-Side SVG Banner Carousel (Horizontal Slide) */}
            <div className="hero-svg-wrapper absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
              <div
                className="hero-svg-wrapper-inner flex h-full transition-transform duration-700 ease-in-out"
                style={{
                  width: "600vw",
                  transform: `translateX(${-currentSlide * (100 / 6)}%)`,
                }}
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="w-[100vw] h-full relative flex justify-center items-center select-none"
                  >
                    {bannersContent[index] ? (
                      <div
                        className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover"
                        dangerouslySetInnerHTML={{
                          __html: bannersContent[index],
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-[#EEE2D3]" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full px-6 lg:px-12 xl:px-20 flex flex-col lg:flex-row items-center z-10 relative">
              {/* Left Content */}
              <div className="hero-left-content w-full lg:w-[60%] z-10 text-left pt-10 lg:pt-0 opacity-0">
                <h1
                  className="font-bold text-gray-900 mb-6"
                  style={{
                    fontSize: "clamp(40px, 4.3vw, 81.1px)",
                    lineHeight: "127.1%",
                    letterSpacing: "0%",
                  }}
                >
                  {slideContents[currentSlide]?.title}
                </h1>

                <p className="text-lg lg:text-xl text-gray-800 max-w-2xl mb-10 leading-relaxed">
                  {slideContents[currentSlide]?.description}
                </p>

                <button
                  onClick={() => navigate("/editor")}
                  className="hero-btn group flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-white font-semibold text-lg shadow-lg hover:opacity-90 border-none cursor-pointer mb-16 transition-all duration-300"
                  style={{ background: slideContents[currentSlide]?.buttonBg }}
                >
                  Start Designing
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>

                {/* 3 Features */}
                <div className="flex flex-wrap items-center gap-6 lg:gap-10">
                  {slideContents[currentSlide]?.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300"
                        style={{
                          backgroundColor:
                            slideContents[currentSlide]?.themeColor,
                        }}
                      >
                        <img
                          src={feature.icon}
                          alt={feature.text}
                          className="w-6 h-6 object-contain filter invert brightness-0"
                          style={{ filter: "brightness(0) invert(1)" }}
                        />
                      </div>
                      <span className="text-sm lg:text-base font-bold text-gray-900 leading-tight whitespace-pre-line">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Carousel Navigation Arrows */}
            <button
              onClick={() => changeSlide((currentSlide - 1 + 6) % 6)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/15 hover:bg-black/30 border border-white/20 text-white flex items-center justify-center cursor-pointer z-20 backdrop-blur-sm transition-all hover:scale-105"
              aria-label="Previous slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <button
              onClick={() => changeSlide((currentSlide + 1) % 6)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/15 hover:bg-black/30 border border-white/20 text-white flex items-center justify-center cursor-pointer z-20 backdrop-blur-sm transition-all hover:scale-105"
              aria-label="Next slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>

            {/* Carousel Slide Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
              {Array.from({ length: 6 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => changeSlide(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentSlide === index
                      ? "w-8 bg-[#C15F27]"
                      : "w-2.5 bg-black/20 hover:bg-black/40"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Marquee Bar */}
          <div
            data-scroll-fade
            className="w-[100vw] overflow-hidden flex items-center h-[72px]"
            style={{ backgroundColor: "#2B4326" }}
          >
            <div className="flex animate-marquee text-white font-bold text-xl md:text-2xl tracking-wide w-max">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center whitespace-nowrap">
                  <span className="mx-8">Burger Boxes</span>
                  <span style={{ color: "#C15F27" }}>●</span>
                  <span className="mx-8">Pizza Boxes</span>
                  <span style={{ color: "#C15F27" }}>●</span>
                  <span className="mx-8">Square Box</span>
                  <span style={{ color: "#C15F27" }}>●</span>
                  <span className="mx-8">Food box</span>
                  <span style={{ color: "#C15F27" }}>●</span>
                  <span className="mx-8">Plastic Box</span>
                  <span style={{ color: "#C15F27" }}>●</span>
                  <span className="mx-8">Water bottle</span>
                  <span style={{ color: "#C15F27", marginRight: "2rem" }}>
                    ●
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Explore by Category */}
          <div
            id="features"
            className="w-full py-14 px-6 lg:px-12 xl:px-20 flex flex-col items-center bg-white"
          >
            <span
              className="text-lg font-bold tracking-widest uppercase mb-4"
              style={{ color: "#D89234" }}
            >
              Explore By Category
            </span>
            <h2
              className="text-4xl lg:text-5xl font-semibold  mb-4 text-center"
              style={{ color: "#111827" }}
            >
              Mockups For Every Need
            </h2>
            <p className="text-gray-500 text-xl text-center  mb-12">
              Choose from a wide range of packaging mockups and bring your ideas
              to life.
            </p>

            <div className="category-cards w-full flex gap-6">
              <AnimatedSvgCard src={card1} index={0} />
              <AnimatedSvgCard src={card2} index={1} />
              <AnimatedSvgCard src={card3} index={2} />
              <AnimatedSvgCard src={card4} index={3} />
              <AnimatedSvgCard src={card5} index={4} />
            </div>

            <button
              onClick={() => navigate("/modelsMockup")}
              className="group mt-16 flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg hover:opacity-90 transition-opacity border-none cursor-pointer"
              style={{ background: "#C15F27" }}
            >
              View All Mockups
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </div>

          {/* Section 3: How it Works */}
          <div
            id="mockups"
            data-scroll-section
            className="w-full pb-10 px-6 lg:px-12 xl:px-20 flex flex-col items-center bg-white font-Outfit"
          >
            <span
              data-scroll-text
              className="text-md font-bold tracking-widest uppercase mb-4"
              style={{ color: "#D89234" }}
            >
              How it Works
            </span>
            <h2
              data-scroll-text="right"
              className="text-4xl lg:text-5xl font-bold text-black mb-16 text-center"
            >
              Simple Steps, Stunning Results
            </h2>

            <div
              data-scroll-fade
              className="w-full  mx-auto flex  items-center justify-between gap-6 xl:gap-4"
            >
              {/* Step 1 */}
              <div className="step-card bg-[#FAF8F8] border-2 border-white shadow-xl rounded-[32px] p-8 w-full max-w-[300px] h-[220px] flex flex-col justify-center cursor-pointer will-change-transform">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mb-4"
                  style={{ backgroundColor: "#E4EADF", color: "#37472F" }}
                >
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Choose Mockup
                </h3>
                <p className="text-gray-500 text-sm">
                  Select the perfect mockup for your product.
                </p>
              </div>

              {/* Arrow */}
              <div className="text-[#6B7280]">
                <svg
                  width="40"
                  height="20"
                  viewBox="0 0 40 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 10H38M38 10L30 2M38 10L30 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>

              {/* Step 2 */}
              <div className="step-card bg-[#FAF8F8] border-2 border-white shadow-xl rounded-[32px] p-8 w-full max-w-[300px] h-[220px] flex flex-col justify-center cursor-pointer will-change-transform">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mb-4"
                  style={{ backgroundColor: "#E4EADF", color: "#37472F" }}
                >
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Upload Design
                </h3>
                <p className="text-gray-500 text-sm">
                  Upload your artwork with ease.
                </p>
              </div>

              {/* Arrow */}
              <div className="text-[#6B7280]">
                <svg
                  width="40"
                  height="20"
                  viewBox="0 0 40 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 10H38M38 10L30 2M38 10L30 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>

              {/* Step 3 */}
              <div className="step-card bg-[#FAF8F8] border-2 border-white shadow-xl rounded-[32px] p-8 w-full max-w-[300px] h-[220px] flex flex-col justify-center cursor-pointer will-change-transform">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mb-4"
                  style={{ backgroundColor: "#E4EADF", color: "#37472F" }}
                >
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Customize
                </h3>
                <p className="text-gray-500 text-sm">
                  Adjust colors, shadows and elements.
                </p>
              </div>

              {/* Arrow */}
              <div className="text-[#6B7280]">
                <svg
                  width="40"
                  height="20"
                  viewBox="0 0 40 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 10H38M38 10L30 2M38 10L30 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>

              {/* Step 4 */}
              <div className="step-card bg-[#FAF8F8] border-2 border-white shadow-xl rounded-[32px] p-8 w-full max-w-[300px] h-[220px] flex flex-col justify-center cursor-pointer will-change-transform">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mb-4"
                  style={{ backgroundColor: "#E4EADF", color: "#37472F" }}
                >
                  4
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Download
                </h3>
                <p className="text-gray-500 text-sm">
                  Download high-quality images instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Banner */}
          <div
            id="pricing"
            className="w-full px-4 lg:px-10 xl:px-18 pb-12 pt-10"
          >
            <ReadyMockupBanner animated />
          </div>
        </main>
        <Footer />
      </div>
    </GsapSmoothScroll>
  );
}
