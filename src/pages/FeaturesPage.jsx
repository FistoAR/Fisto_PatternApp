import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import ReadyMockupBanner from '../components/ReadyMockupBanner';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Icons
import frameImg from '../assets/images/featureSection/feautureHero.webp';
import jarIcon from '../assets/images/MockupsSection/Icons/jar.webp';
import icon50K from '../assets/images/featureSection/Icons/50K.webp';
import icon100plus from '../assets/images/featureSection/Icons/100plus.webp';
import ratingIcon from '../assets/images/featureSection/Icons/rating.webp';

// Feature Icons Imports
import highQualityIcon from '../assets/images/featureSection/Icons/highQuality.webp';
import editIcon from '../assets/images/featureSection/Icons/edit.webp';
import categoriesIcon from '../assets/images/featureSection/categories.webp';
import multiFormatIcon from '../assets/images/featureSection/Icons/multiFormat.webp';
import realisticIcon from '../assets/images/featureSection/Icons/realistic.webp';
import fastIcon from '../assets/images/featureSection/Icons/fast.webp';
import supportIcon from '../assets/images/featureSection/Icons/support.webp';
import realTime3DIcon from '../assets/images/featureSection/Icons/RealTime3D.webp';
import smartIcon from '../assets/images/featureSection/Icons/smart.webp';
import highQualityRenderingIcon from '../assets/images/featureSection/Icons/High Quality Rendering.webp';
import realTimeLightningIcon from '../assets/images/featureSection/Icons/RealTimeLightning.webp';
import multipleViewingIcon from '../assets/images/featureSection/Icons/Multipleviewing.webp';
import qrCodeIcon from '../assets/images/featureSection/Icons/QRCode.webp';
import multilayerIcon from '../assets/images/featureSection/Icons/Multilayer.webp';
import uploadOwnIcon from '../assets/images/featureSection/Icons/Upload own.webp';
import exportMultiformatIcon from '../assets/images/featureSection/Icons/ExportMultiformat.webp';
import organizedProductIcon from '../assets/images/featureSection/Icons/OrganizedProduct.webp';
import icon360d from '../assets/images/featureSection/Icons/360d.webp';
import printreadyIcon from '../assets/images/featureSection/Icons/Printready.webp';
import desktopCompatibilityIcon from '../assets/images/featureSection/Icons/desktopCompatibility.webp';
import cloudBasedDesignIcon from '../assets/images/featureSection/Icons/CloudBasedDesign.webp';
import sharableDesignIcon from '../assets/images/featureSection/Icons/sharableDesign.webp';

const FEATURES = [
  {
    title: "High-Quality Mockups",
    description: "Access premium, photorealistic mockups for all your packaging needs.",
    icon: highQualityIcon
  },
  {
    title: "Easy Customization",
    description: "Edit colors, texts and designs in just a few clicks with our smart tools.",
    icon: editIcon
  },
  {
    title: "Organized Categories",
    description: "Browse mockups by category to quickly find exactly what you need.",
    icon: categoriesIcon
  },
  {
    title: "Multi-Format Files",
    description: "Download in multiple formats including PSD, AI, PNG and more.",
    icon: multiFormatIcon
  },
  {
    title: "Realistic Shadows & Lighting",
    description: "Built-in lighting and shadows for ultra-realistic results.",
    icon: realisticIcon
  },
  {
    title: "Fast & Reliable",
    description: "Optimized for speed and performance to save your time.",
    icon: fastIcon
  },
  {
    title: "Dedicated Support",
    description: "Our support team is always ready to help you with any questions.",
    icon: supportIcon
  },
  {
    title: "Real-Time 3D Preview",
    description: "Instantly preview your packaging in interactive 3D.",
    icon: realTime3DIcon
  },
  {
    title: "Realistic Material & Texture Mapping",
    description: "Apply realistic materials and textures for a true-to-life look.",
    icon: smartIcon
  },
  {
    title: "High-Quality Rendering",
    description: "Generate high-resolution renders for professional presentations.",
    icon: highQualityRenderingIcon
  },
  {
    title: "Real-Time Lighting & Shadow Effects",
    description: "Experience realistic lighting and shadow simulations instantly.",
    icon: realTimeLightningIcon
  },
  {
    title: "Multiple Viewing Angles",
    description: "Inspect your packaging design from every perspective.",
    icon: multipleViewingIcon
  },
  {
    title: "QR Code-Based AR Experience",
    description: "Generate QR codes to view packaging in Augmented Reality.",
    icon: qrCodeIcon
  },
  {
    title: "Multi-Layer Artwork Support",
    description: "Manage multiple artwork layers with complete control.",
    icon: multilayerIcon
  },
  {
    title: "Upload Your Own Graphics",
    description: "Upload logos, images, and custom graphics effortlessly.",
    icon: uploadOwnIcon
  },
  {
    title: "Easy Design Customization",
    description: "Customize colors, logos, text, and branding elements easily.",
    icon: editIcon
  },
  {
    title: "Export Multi-Format File Support",
    description: "Export designs in PNG, JPG, PDF, SVG, and more.",
    icon: exportMultiformatIcon
  },
  {
    title: "Organized Product Categories",
    description: "Browse products through structured and easy-to-use categories.",
    icon: organizedProductIcon
  },
  {
    title: "360° Product Visualization",
    description: "Rotate and explore packaging designs in full 360° view.",
    icon: icon360d
  },
  {
    title: "Print-Ready Packaging Preview",
    description: "Validate print-ready artwork with accurate production previews.",
    icon: printreadyIcon
  },
  {
    title: "Desktop Compatibility",
    description: "Fully compatible with Windows and macOS desktop platforms.",
    icon: desktopCompatibilityIcon
  },
  {
    title: "Cloud-Based Design Storage",
    description: "Store and access your projects securely from the cloud.",
    icon: cloudBasedDesignIcon
  },
  {
    title: "Shareable Design Links",
    description: "Share designs instantly with clients, teams, and stakeholders.",
    icon: sharableDesignIcon
  }
];

export default function FeaturesPage() {
  const navigate = useNavigate();
  const pageRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const context = gsap.context(() => {
      // Animate top hero section on load
      gsap.fromTo('.features-hero-title', 
        { autoAlpha: 0, y: 30 }, 
        { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
      gsap.fromTo('.features-hero-subtitle', 
        { autoAlpha: 0, y: 20 }, 
        { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.15 }
      );
      gsap.fromTo('.features-hero-image', 
        { autoAlpha: 0, scale: 0.95 }, 
        { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'power3.out', delay: 0.25 }
      );

      // Features Section Texts
      gsap.fromTo(
        ".features-section-text",
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power2.out", scrollTrigger: { trigger: ".features-grid-container", start: "top 85%", toggleActions: "play reverse play reverse" } }
      );

      // Staggered trigger animation on features cards (animates as you scroll)
      gsap.utils.toArray('.feature-card').forEach((card) => {
        gsap.fromTo(card, 
          { autoAlpha: 0, y: 30, scale: 0.95 }, 
          { 
            autoAlpha: 1, 
            y: 0, 
            scale: 1, 
            duration: 0.6, 
            ease: 'power3.out', 
            scrollTrigger: { 
              trigger: card, 
              start: "top 90%", 
              toggleActions: "play reverse play reverse" 
            } 
          }
        );
      });

      // Stats Bar
      gsap.fromTo(
        ".stat-item",
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "back.out(1.2)", scrollTrigger: { trigger: ".stats-container", start: "top 85%", toggleActions: "play reverse play reverse" } }
      );

      // Ready Mockup Banner Text
      gsap.fromTo(
        ".frame-text",
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power2.out", scrollTrigger: { trigger: ".frame-banner", start: "top 85%", toggleActions: "play reverse play reverse" } }
      );

      // Ready Mockup Banner Image
      gsap.fromTo(
        ".frame-product",
        { autoAlpha: 0, x: 50 },
        { autoAlpha: 1, x: 0, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: ".frame-banner", start: "top 85%", toggleActions: "play reverse play reverse" } }
      );
    }, pageRef);

    return () => context.revert();
  }, []);

  return (
    <div ref={pageRef} className="flex flex-col min-h-screen bg-[#FBF9F6] w-full font-['Inter']">
      <main className="flex-1 w-full pt-16">
        
        {/* Top Hero Section */}
        <div className="w-full px-6 lg:px-12 xl:px-34 mb-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-xl">
            <h1 className="features-hero-title text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Features that Make<br/>
              Mockups <span style={{ color: '#37472F' }}>Simple,</span><br/>
              <span style={{ color: '#37472F' }}>Fast & Powerful</span>
            </h1>
            <p className="features-hero-subtitle text-gray-600 text-xl">
              Fist-o provides all the tools you need to create professional<br/>
              packaging mockups with ease and efficiency.
            </p>
          </div>
          <div className="features-hero-image relative w-full lg:w-[40%] flex justify-end">
            <img src={frameImg} alt="Products" className="w-full max-w-[600px] object-contain" />
          </div>
        </div>

        {/* Features Grid Section */}
        <div className="w-full px-6 lg:px-12 xl:px-20 mb-20 features-grid-container">
          <div className="text-center mb-12">
            <h3 className="features-section-text text-xl font-bold tracking-widest uppercase mb-4" style={{ color: '#C15F27' }}>WHY CHOOSE FIST-O</h3>
            <h2 className="features-section-text text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Powerful Features For Every Creator</h2>
            <p className="features-section-text text-gray-500 text-lg">Everything you need to design, customize and showcase packaging mockups like a pro.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feat) => (
              <div 
                key={feat.title} 
                className="feature-card bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg hover:border-[#C15F27]/25 hover:bg-orange-50/5 cursor-default"
              >
                <div className="w-12 h-12 rounded-full bg-[#EBF2DE] flex items-center justify-center mb-6">
                  <img src={feat.icon} alt={feat.title} className="w-6 h-6 object-contain" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{feat.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="stats-container w-full px-6 lg:px-12 xl:px-20 mb-20">
          <div className="bg-[#344B2D] rounded-[24px] py-10 px-8 flex flex-wrap justify-between items-center text-white gap-8">
            <div className="stat-item flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
              </div>
              <div>
                <div className="text-2xl font-bold">25K+</div>
                <div className="text-xs text-white/70">Happy Customers</div>
              </div>
            </div>
            <div className="stat-item hidden lg:block w-[1px] h-12 bg-white/20"></div>
            <div className="stat-item flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <img src={icon50K} alt="Mockups Created" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-xs text-white/70">Mockups Created</div>
              </div>
            </div>
            <div className="stat-item hidden lg:block w-[1px] h-12 bg-white/20"></div>
            <div className="stat-item flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <img src={icon100plus} alt="Countries Served" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <div className="text-2xl font-bold">100+</div>
                <div className="text-xs text-white/70">Countries Served</div>
              </div>
            </div>
            <div className="stat-item hidden lg:block w-[1px] h-12 bg-white/20"></div>
            <div className="stat-item flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <img src={ratingIcon} alt="Customer Rating" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#F2B62C' }}>4.9/5</div>
                <div className="text-xs text-white/70">Customer Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="w-full px-6 lg:px-12 xl:px-20 pb-16">
          <ReadyMockupBanner target="/editor" fullWidth animated />
        </div>

      </main>
      <Footer />
    </div>
  );
}
