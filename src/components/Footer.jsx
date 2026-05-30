import fistoLogo from '../assets/images/fisto-logo.png';

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] shrink-0" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" fill="currentColor" />
      <path d="M4 7l8 6 8-6" fill="none" stroke="#BDC0B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[22px] w-[22px] shrink-0" aria-hidden="true">
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.56.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.56 1 1 0 0 1-.24 1.02l-2.21 2.21Z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[24px] w-[24px] shrink-0" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-[#BDC0B0] px-6 py-16 font-['Poppins'] text-black lg:px-12 xl:px-20">
      <div className="mx-auto grid w-full max-w-[1352px] grid-cols-1 gap-10 md:grid-cols-[1fr_1.25fr_1.05fr_2fr] md:items-start md:gap-12">
        <div className="flex items-center md:pt-2">
          <img src={fistoLogo} alt="FIST-O Tech Pvt Ltd" className="h-auto w-[190px] object-contain" />
        </div>

        <div>
          <div className="mb-4 flex items-center gap-5">
            <MailIcon />
            <h3 className="m-0 text-[18px] font-bold uppercase leading-none tracking-[-0.01em]">Email Support</h3>
          </div>
          <div className="space-y-3 text-[15px] font-medium leading-tight">
            <p className="m-0">Info@fist-o.com</p>
            <p className="m-0">support@fist-o.com</p>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-5">
            <PhoneIcon />
            <h3 className="m-0 text-[18px] font-bold uppercase leading-none tracking-[-0.01em]">Contact Support</h3>
          </div>
          <div className="space-y-3 text-[15px] font-medium leading-tight">
            <p className="m-0">+91 9994425147</p>
            <p className="m-0">+91 7530025147</p>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-5">
            <PinIcon />
            <h3 className="m-0 text-[18px] font-bold uppercase leading-none tracking-[-0.01em]">Address</h3>
          </div>
          <p className="m-0 max-w-[420px] text-[15px] font-medium leading-[1.35]">
            10/11, Trichy Rd, Sundaram Brothers Layout, Olympus, Ramanathapuram,
            Coimbatore, Tamil Nadu - 641045
          </p>
        </div>
      </div>
    </footer>
  );
}
