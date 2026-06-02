import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import ReadyMockupBanner from '../components/ReadyMockupBanner';

// Icons
import jarIcon from '../assets/images/Icons/jar.webp';
import frameImg from '../assets/images/featureSection/feautureHero.webp';

// Feature Icons
import highQualityIcon from '../assets/images/featureSection/Icons/highQuality.webp';
import editIcon from '../assets/images/featureSection/Icons/edit.webp';
import categoriesIcon from '../assets/images/featureSection/categories.webp';
import multiFormatIcon from '../assets/images/featureSection/Icons/multiFormat.webp';
import smartIcon from '../assets/images/featureSection/Icons/smart.webp';
import realisticIcon from '../assets/images/featureSection/Icons/realistic.webp';
import fastIcon from '../assets/images/featureSection/Icons/fast.webp';
import supportIcon from '../assets/images/featureSection/Icons/support.webp';

export default function FeaturesPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F6] w-full font-['Inter']">
      <main className="flex-1 w-full pt-16">
        
        {/* Top Hero Section */}
        <div className="w-full px-6 lg:px-12 xl:px-34 mb-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-xl">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Features that Make<br/>
              Mockups <span style={{ color: '#37472F' }}>Simple,</span><br/>
              <span style={{ color: '#37472F' }}>Fast & Powerful</span>
            </h1>
            <p className="text-gray-600 text-xl">
              Fist-o provides all the tools you need to create professional<br/>
              packaging mockups with ease and efficiency.
            </p>
          </div>
          <div className="relative w-full lg:w-[40%] flex justify-end">
            <img src={frameImg} alt="Products" className="w-full max-w-[600px] object-contain" />
          </div>
        </div>

        {/* Features Grid Section */}
        <div className="w-full px-6 lg:px-12 xl:px-20 mb-20">
          <div className="text-center mb-12">
            <h3 className="text-xl font-bold tracking-widest uppercase mb-4" style={{ color: '#C15F27' }}>WHY CHOOSE FIST-O</h3>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Powerful Features For Every Creator</h2>
            <p className="text-gray-500 text-lg">Everting you to design, customize and showcase packaging mockups like a pro.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cards */}
            <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col">
              <div className="w-12 h-12 rounded-full bg-[#EBF2DE] flex items-center justify-center text-[#37472F] mb-6">
                <img src={highQualityIcon} alt="High-Quality" className="w-6 h-6 object-contain" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">High-Quality Mockups</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Access premium, Photorealistic mockups for all your packaging needs.</p>
            </div>

            <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col">
              <div className="w-12 h-12 rounded-full bg-[#EBF2DE] flex items-center justify-center text-[#37472F] mb-6">
                <img src={editIcon} alt="Easy Customization" className="w-6 h-6 object-contain" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Easy Customization</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Edit colors, texts and designs in just a few clicks with our smart tools.</p>
            </div>

            <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col">
              <div className="w-12 h-12 rounded-full bg-[#EBF2DE] flex items-center justify-center text-[#37472F] mb-6">
                <img src={categoriesIcon} alt="Organized Categories" className="w-6 h-6 object-contain" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Organized Categories</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Browse mockups by category to quickly find exactly what you need.</p>
            </div>

            <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col">
              <div className="w-12 h-12 rounded-full bg-[#EBF2DE] flex items-center justify-center text-[#37472F] mb-6">
                <img src={multiFormatIcon} alt="Multi-Format" className="w-6 h-6 object-contain" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Multi-Format Files</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Download in multiple formats including PSD, AI, PNG and more.</p>
            </div>

            <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col">
              <div className="w-12 h-12 rounded-full bg-[#EBF2DE] flex items-center justify-center text-[#37472F] mb-6">
                <img src={smartIcon} alt="Smart Object" className="w-6 h-6 object-contain" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Smart Object Support</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Replace designs instantly using smart objects for seamless editing.</p>
            </div>

            <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col">
              <div className="w-12 h-12 rounded-full bg-[#EBF2DE] flex items-center justify-center text-[#37472F] mb-6">
                <img src={realisticIcon} alt="Realistic Shadows" className="w-6 h-6 object-contain" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Realistic Shadows & Lighting</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Built-in lighting and shadows for ultra-realistic results.</p>
            </div>

            <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col">
              <div className="w-12 h-12 rounded-full bg-[#EBF2DE] flex items-center justify-center text-[#37472F] mb-6">
                <img src={fastIcon} alt="Fast & Reliable" className="w-6 h-6 object-contain" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Fast & Reliable</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Optimized for speed and performance to save your time.</p>
            </div>

            <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col">
              <div className="w-12 h-12 rounded-full bg-[#EBF2DE] flex items-center justify-center text-[#37472F] mb-6">
                <img src={supportIcon} alt="Dedicated Support" className="w-6 h-6 object-contain" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Dedicated Support</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Our support team is always ready to help you with any questions.</p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="w-full px-6 lg:px-12 xl:px-20 mb-20">
          <div className="bg-[#344B2D] rounded-[24px] py-10 px-8 flex flex-wrap justify-between items-center text-white gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
              </div>
              <div>
                <div className="text-2xl font-bold">25K+</div>
                <div className="text-xs text-white/70">Happy Customers</div>
              </div>
            </div>
            <div className="hidden lg:block w-[1px] h-12 bg-white/20"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <img src={jarIcon} alt="Icon" className="w-6 h-6 object-contain filter invert brightness-0" />
              </div>
              <div>
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-xs text-white/70">Mockups Created</div>
              </div>
            </div>
            <div className="hidden lg:block w-[1px] h-12 bg-white/20"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" /></svg>
              </div>
              <div>
                <div className="text-2xl font-bold">100+</div>
                <div className="text-xs text-white/70">Countries Served</div>
              </div>
            </div>
            <div className="hidden lg:block w-[1px] h-12 bg-white/20"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>
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
          <ReadyMockupBanner target="/modelsMockup" fullWidth />
        </div>

      </main>
      <Footer />
    </div>
  );
}
