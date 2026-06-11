import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import fistoLogo from "../assets/images/fisto-logo.png";
import packagingIcon from "../assets/images/Home/packaging.webp";
import realistic3dIcon from "../assets/images/Home/realistic3d.webp";
import fasteasyIcon from "../assets/images/Home/fasteasy.webp";
import bg1 from "../assets/images/Home/Hero/banner1/background.webp";
import prod1 from "../assets/images/Home/Hero/banner1/product.webp";

import bg2 from "../assets/images/Home/Hero/banner2/background.webp";
import prod2 from "../assets/images/Home/Hero/banner2/product.webp";
import label2 from "../assets/images/Home/Hero/banner2/label.webp";

import bg3 from "../assets/images/Home/Hero/banner3/background.webp";
import prod3 from "../assets/images/Home/Hero/banner3/product.webp";
import label3 from "../assets/images/Home/Hero/banner3/label.webp";

import bg4 from "../assets/images/Home/Hero/banner4/background.webp";
import prod4 from "../assets/images/Home/Hero/banner4/product.webp";
import label4 from "../assets/images/Home/Hero/banner4/label.webp";

import bg5 from "../assets/images/Home/Hero/banner5/background.webp";
import prod5 from "../assets/images/Home/Hero/banner5/product.webp";

import bg6 from "../assets/images/Home/Hero/banner6/background.webp";
import prod6 from "../assets/images/Home/Hero/banner6/product.webp";
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
  const [imagesLoaded, setImagesLoaded] = useState(false);


  const slideConfigs = [
    {
      id: 1,
      bg: bg1,
      productSelector: ".banner-prod",
      labelSelector: null,
      prod: {
        src: prod1,
        css: {
          left: "46.1979%",
          top: "37.5618%",
          width: "40.1262%",
          height: "49.1919%",
          transformOrigin: "top left",
          transform: "rotate(-10.7475deg)",
        },
      },
      label: null,
    },
    {
      id: 2,
      bg: bg2,
      productSelector: ".banner-prod",
      labelSelector: ".banner-label",
      prod: {
        src: prod2,
        css: {
          left: "47.5%",
          top: "25.2777%",
          width: "31.5625%",
          height: "57.7777%",
        },
      },
      label: {
        src: label2,
        css: {
          left: "47.7604%",
          top: "44.4444%",
          width: "29.6354%",
          height: "35.1851%",
        },
      },
    },
    {
      id: 3,
      bg: bg3,
      productSelector: ".banner-prod",
      labelSelector: ".banner-label",
      prod: {
        src: prod3,
        css: {
          left: "58.9692%",
          top: "23.5185%",
          width: "26.1577%",
          height: "55.8173%",
        },
      },
      label: {
        src: label3,
        css: {
          left: "55.1041%",
          top: "45.3703%",
          width: "34.2187%",
          height: "24.6296%",
        },
      },
    },
    {
      id: 4,
      bg: bg4,
      productSelector: ".banner-prod",
      labelSelector: ".banner-label",
      prod: {
        src: prod4,
        css: {
          left: "51.25%",
          top: "16.9444%",
          width: "32.552%",
          height: "72.3148%",
        },
      },
      label: {
        src: label4,
        css: {
          left: "49.4791%",
          top: "32.4074%",
          width: "36.4062%",
          height: "45.2777%",
        },
      },
    },
    {
      id: 5,
      bg: bg5,
      productSelector: ".banner-prod",
      labelSelector: null,
      prod: {
        src: prod5,
        css: {
          left: "39.7395%",
          top: "6.3888%",
          width: "42.9166%",
          height: "84.9074%",
        },
      },
      label: null,
    },
    {
      id: 6,
      bg: bg6,
      productSelector: ".banner-prod",
      labelSelector: null,
      prod: {
        src: prod6,
        css: {
          left: "49.1666%",
          top: "14.3518%",
          width: "39.0104%",
          height: "79.9074%",
        },
      },
      label: null,
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

  // Preload images
  useEffect(() => {
    const imageUrls = [];
    slideConfigs.forEach((config) => {
      if (config.bg) imageUrls.push(config.bg);
      if (config.prod?.src) imageUrls.push(config.prod.src);
      if (config.label?.src) imageUrls.push(config.label.src);
    });

    let loadedCount = 0;
    const totalImages = imageUrls.length;

    if (totalImages === 0) {
      setImagesLoaded(true);
      setBannersContent(slideConfigs);
      return;
    }

    const handleImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        setImagesLoaded(true);
        setBannersContent(slideConfigs);
      }
    };

    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = handleImageLoad;
      img.onerror = handleImageLoad;
    });
  }, []);

  const changeSlide = (nextIndex) => {
    if (isTransitioning) return;

    let logicalNext = nextIndex;
    if (nextIndex >= 6) logicalNext = 0;
    if (nextIndex < 0) logicalNext = 5;

    if (currentSlide === logicalNext) return;

    setIsTransitioning(true);

    const leftContent = pageRef.current?.querySelector(".hero-left-content");

    if (leftContent && leftContent.children) {
      gsap.to(leftContent.children, {
        y: 40,
        opacity: 0,
        duration: 0.4, // Speed up text exit so it feels more responsive
        stagger: 0.1,
        ease: "power2.inOut",
        onComplete: () => {
          setCurrentSlide(logicalNext);

          setTimeout(() => {
            // Unlock early so users can rapidly click next/prev without waiting for text to finish animating in!
            setIsTransitioning(false);

            gsap.fromTo(
              leftContent.children,
              { y: 200, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 1.0,
                stagger: 0.15,
                ease: "power3.out",
              },
            );
          }, 700);
        },
      });
    } else {
      setCurrentSlide(logicalNext);
      setIsTransitioning(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      changeSlide(currentSlide + 1);
    }, 2000); // Increased interval time so the new slower animations can play
    return () => clearInterval(timer);
  }, [currentSlide, isTransitioning]);

  useEffect(() => {
    if (bannersContent.length === 0 || hasAnimatedMount) return;

    const leftContent = pageRef.current?.querySelector(".hero-left-content");
    if (leftContent && leftContent.children) {
      gsap.fromTo(
        leftContent.children,
        { opacity: 0, y: 80 },
        { opacity: 1, y: 0, duration: 1.0, stagger: 0.15, ease: "power3.out" },
      );
      // Reveal the container itself to avoid CSS hidden
      gsap.set(leftContent, { opacity: 1 });
    }
    setHasAnimatedMount(true);
  }, [bannersContent, hasAnimatedMount]);

  useEffect(() => {
    // Only run if banners are loaded. If currentSlide is briefly -1, don't run animation on non-existent element
    if (bannersContent.length === 0 || currentSlide < 0) return;

    const container = pageRef.current?.querySelector(".hero-svg-wrapper");
    if (!container) return;

    const activeSlideEl = container.querySelectorAll(
      ".hero-svg-wrapper-inner > div",
    )[currentSlide];
    if (!activeSlideEl) return;

    const logicalSlide = currentSlide;
    const config = slideConfigs[logicalSlide];
    const product = activeSlideEl.querySelector(config.productSelector);
    const labels = config.labelSelector
      ? activeSlideEl.querySelectorAll(config.labelSelector)
      : null;
    const background = activeSlideEl.querySelector('img[alt="Background"]');

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    if (background) {
      tl.fromTo(background, { opacity: 0.5 }, { opacity: 1, duration: 1.0 }, 0);
    }

    if (product) {
      // Section 1: Initial load and all slider changes product scale 0 to 1
      if (logicalSlide === 0) {
        tl.fromTo(
          product,
          {
            scale: 0,
            rotate: -10.7475,
            transformOrigin: "50% 50%",
            opacity: 0,
          },
          {
            scale: 1,
            rotate: -10.7475,
            opacity: 1,
            duration: 2.5,
            ease: "back.out(0.5)",
          },
          0.2,
        );
      }
      // Section 2, 3, 4: Product from right, label from left
      else if (logicalSlide === 1 || logicalSlide === 2 || logicalSlide === 3) {
        tl.fromTo(
          product,
          { x: 550, opacity: 0 },
          { x: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
          0.2,
        );
        if (labels && labels.length > 0) {
          gsap.set(labels, { opacity: 0, x: -450 });
          tl.fromTo(
            labels,
            { x: -450, opacity: 0 },
            { x: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
            0.8, // Delays label so it comes after the bottle
          );
        }
      }
      // Section 5: Product fade in from top
      else if (logicalSlide === 4) {
        tl.fromTo(
          product,
          { y: -300, opacity: 0 },
          { y: 0, opacity: 1, duration: 2, ease: "power3.out" },
          0.2,
        );
      }
      // Section 6: Product fade in from left
      else if (logicalSlide === 5) {
        tl.fromTo(
          product,
          { x: -500, opacity: 0 },
          { x: 0, opacity: 1, duration: 2, ease: "power3.out" },
          0.2,
        );
      }
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

      // Explore By Category - Header Text Reveal
      gsap.fromTo(
        ".explore-text",
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#features",
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // Explore By Category - Cards
      gsap.fromTo(
        ".explore-card",
        { autoAlpha: 0, x: -50 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".category-cards",
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // How It Works - Header Text
      gsap.fromTo(
        ".how-text",
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#mockups",
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // How It Works - Cards
      gsap.fromTo(
        ".how-card",
        { autoAlpha: 0, y: 30, scale: 0.95 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: "#mockups > div:nth-child(3)",
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // Ready Mockup Banner Text
      gsap.fromTo(
        ".frame-text",
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".frame-banner",
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // Ready Mockup Banner Image
      gsap.fromTo(
        ".frame-product",
        { autoAlpha: 0, x: 50 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".frame-banner",
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

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
            {/* Loading Overlay */}
            {!imagesLoaded && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#EEE2D3]">
                <img
                  src={fistoLogo}
                  alt="Loading..."
                  className="w-48 h-auto animate-pulse drop-shadow-xl"
                />
              </div>
            )}
            {/* Background & Right-Side SVG Banner Fade (Fade In / Fade Out) */}
            <div className="hero-svg-wrapper absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden bg-[#EEE2D3]">
              <div className="hero-svg-wrapper-inner relative w-[100vw] h-full">
                {bannersContent.map((banner, index) => {
                  const isActive = currentSlide === index;
                  return (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex justify-center items-center select-none ${isActive ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] min-w-[177.777vh] min-h-[56.25vw]">
                        {/* Background */}
                        <img
                          src={banner.bg}
                          className="absolute inset-0 w-full h-full object-cover"
                          alt="Background"
                        />

                        {/* Product */}
                        <img
                          src={banner.prod.src}
                          style={banner.prod.css}
                          className="absolute banner-prod drop-shadow-2xl will-change-transform"
                          alt="Product"
                        />

                        {/* Label (if exists) */}
                        {banner.label && (
                          <img
                            src={banner.label.src}
                            style={banner.label.css}
                            className="absolute banner-label drop-shadow-xl will-change-transform"
                            alt="Label"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
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
                  {
                    slideContents[currentSlide]?.title
                  }
                </h1>

                <p className="text-lg lg:text-xl text-gray-800 max-w-2xl mb-10 leading-relaxed">
                  {
                    slideContents[currentSlide]?.description
                  }
                </p>

                <button
                  onClick={() => navigate("/editor")}
                  className="hero-btn group flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-white font-semibold text-lg shadow-lg hover:opacity-90 border-none cursor-pointer mb-16 "
                  style={{
                    background:
                      slideContents[currentSlide]?.buttonBg,
                  }}
                >
                  Start Designing
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-5 h-5 transition-transform group-hover:translate-x-1.5"
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
              onClick={() =>
                changeSlide(currentSlide === 0 ? -1 : currentSlide - 1)
              }
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
              onClick={() => changeSlide(currentSlide + 1)}
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
              className="explore-text text-lg font-bold tracking-widest uppercase mb-4"
              style={{ color: "#D89234" }}
            >
              Explore By Category
            </span>
            <h2
              className="explore-text text-4xl lg:text-5xl font-semibold  mb-4 text-center"
              style={{ color: "#111827" }}
            >
              Mockups For Every Need
            </h2>
            <p className="explore-text text-gray-500 text-xl text-center  mb-12">
              Choose from a wide range of packaging mockups and bring your ideas
              to life.
            </p>

            <div className="category-cards w-full flex gap-6">
              <div className="explore-card flex-1 cursor-pointer transition-transform hover:scale-105" onClick={() => navigate("/modelsMockup", { state: { activeCategory: "Box" } })}><AnimatedSvgCard src={card1} index={0} /></div>
              <div className="explore-card flex-1 cursor-pointer transition-transform hover:scale-105" onClick={() => navigate("/modelsMockup", { state: { activeCategory: "Bottle" } })}><AnimatedSvgCard src={card2} index={1} /></div>
              <div className="explore-card flex-1 cursor-pointer transition-transform hover:scale-105" onClick={() => navigate("/modelsMockup", { state: { activeCategory: "Container" } })}><AnimatedSvgCard src={card3} index={2} /></div>
              <div className="explore-card flex-1 cursor-pointer transition-transform hover:scale-105" onClick={() => navigate("/modelsMockup", { state: { activeCategory: "Bag" } })}><AnimatedSvgCard src={card4} index={3} /></div>
              <div className="explore-card flex-1 cursor-pointer transition-transform hover:scale-105" onClick={() => navigate("/modelsMockup", { state: { activeCategory: "T-shirt" } })}><AnimatedSvgCard src={card5} index={4} /></div>
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
              className="how-text text-md font-bold tracking-widest uppercase mb-4"
              style={{ color: "#D89234" }}
            >
              How it Works
            </span>
            <h2
              className="how-text text-4xl lg:text-5xl font-bold text-black mb-16 text-center"
            >
              Simple Steps, Stunning Results
            </h2>

            <div
              className="w-full  mx-auto flex  items-center justify-between gap-6 xl:gap-4"
            >
              {/* Step 1 */}
              <div className="how-card step-card bg-[#FAF8F8] border-2 border-white shadow-xl rounded-[32px] p-8 w-full max-w-[300px] h-[220px] flex flex-col justify-center cursor-pointer will-change-transform">
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
              <div className="how-card text-[#6B7280]">
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
              <div className="how-card step-card bg-[#FAF8F8] border-2 border-white shadow-xl rounded-[32px] p-8 w-full max-w-[300px] h-[220px] flex flex-col justify-center cursor-pointer will-change-transform">
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
              <div className="how-card text-[#6B7280]">
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
              <div className="how-card step-card bg-[#FAF8F8] border-2 border-white shadow-xl rounded-[32px] p-8 w-full max-w-[300px] h-[220px] flex flex-col justify-center cursor-pointer will-change-transform">
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
              <div className="how-card text-[#6B7280]">
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
              <div className="how-card step-card bg-[#FAF8F8] border-2 border-white shadow-xl rounded-[32px] p-8 w-full max-w-[300px] h-[220px] flex flex-col justify-center cursor-pointer will-change-transform">
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
