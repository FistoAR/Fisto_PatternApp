import React, { useEffect } from 'react';
import Footer from '../components/Footer';
import ReadyMockupBanner from '../components/ReadyMockupBanner';

// Icons
import callIcon from '../assets/images/contact/call.webp';
import mailIcon from '../assets/images/contact/mail.webp';
import locationIcon from '../assets/images/contact/location.webp';

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F6] w-full font-['Inter']">
      <main className="flex-1 w-full pt-16 lg:pt-24 px-6 lg:px-12 xl:px-20">
        
        {/* Top Header */}
        <div className="mb-12 px-20">
          <h1 className="text-3xl lg:text-4xl font-semibold text-black mb-6 uppercase tracking-[0.1em]">
            CONTACT US
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed  font-medium">
            We'd love hear from you.<br/>
            Whether you have a question about our products,<br/>
            pricing or anything else - our team is ready to answer all your questions.
          </p>
        </div>

        {/* Content Section */}
        <div className="flex flex-col lg:flex-row gap-40 mb-24 px-20">
          
          {/* Left Column - Contact Info */}
          <div className="flex flex-col gap-8 w-full lg:w-1/3">
            
            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FDF8F5] flex items-center justify-center shadow-md border border-[#f5e9df] shrink-0">
                <img src={callIcon} alt="Phone" className="w-5 h-5 object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Phone</h3>
                <p className="text-gray-600 text-sm mb-1">+91 98765 43210</p>
                <p className="text-gray-500 text-sm">Mon - Fri, 9:00 AM - 6:00 PM</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FDF8F5] flex items-center justify-center shadow-md border border-[#f5e9df] shrink-0">
                <img src={mailIcon} alt="Email" className="w-5 h-5 object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Email</h3>
                <p className="text-gray-600 text-sm mb-1">hello@fistotech.com</p>
                <p className="text-gray-500 text-sm">We'll replay within 24 hours</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FDF8F5] flex items-center justify-center shadow-md border border-[#f5e9df] shrink-0">
                <img src={locationIcon} alt="Address" className="w-5 h-5 object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Address</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  FIST-O TECH Pvt. Ltd.<br/>
                  123 Packaging Street,<br/>
                  Surat, Gujarat 395003, India
                </p>
              </div>
            </div>

          </div>

          {/* Right Column - Form */}
          <div className="w-full lg:w-2/3 max-w-2xl bg-white rounded-3xl p-8 lg:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-gray-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Send us a Message</h2>
            
            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Your Name</label>
                  <input type="text" placeholder="Enter your name" className="w-full bg-[#F6F3EC] border-none rounded-lg px-4 py-3.5 text-sm outline-none focus:ring-1 focus:ring-gray-300 transition-all placeholder:text-gray-400" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-900">Email Address</label>
                  <input type="email" placeholder="Enter your email" className="w-full bg-[#F6F3EC] border-none rounded-lg px-4 py-3.5 text-sm outline-none focus:ring-1 focus:ring-gray-300 transition-all placeholder:text-gray-400" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Phone Number</label>
                <input type="tel" placeholder="Enter your phone number" className="w-full bg-[#F6F3EC] border-none rounded-lg px-4 py-3.5 text-sm outline-none focus:ring-1 focus:ring-gray-300 transition-all placeholder:text-gray-400" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Subject</label>
                <input type="text" placeholder="How can we help you?" className="w-full bg-[#F6F3EC] border-none rounded-lg px-4 py-3.5 text-sm outline-none focus:ring-1 focus:ring-gray-300 transition-all placeholder:text-gray-400" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Message</label>
                <textarea rows="4" placeholder="Type your message here..." className="w-full bg-[#F6F3EC] border-none rounded-lg px-4 py-3.5 text-sm outline-none focus:ring-1 focus:ring-gray-300 transition-all placeholder:text-gray-400 resize-none"></textarea>
              </div>

              <button type="submit" className="w-full bg-[#2F4629] text-white font-bold text-[17px] rounded-lg py-4 mt-2 hover:opacity-90 transition-opacity border-none cursor-pointer">
                Submit Message
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="mb-20">
          <ReadyMockupBanner
            fullWidth
            target="/modelsMockup"
            label="Get in Touch"
            title="Get in"
            titleHighlight="Touch"
            subtitle="We are here to help your business grow with premium packaging mockups."
            showButton={false}
            compact={true}
          />
        </div>

      </main>
      <Footer />
    </div>
  );
}
