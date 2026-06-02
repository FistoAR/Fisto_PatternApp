import { useNavigate } from 'react-router-dom';
import frameImg from '../assets/images/Home/frame.webp';

export default function ReadyMockupBanner({
  className = '',
  target = '/modelsMockup',
  animated = false,
  fullWidth = false,
}) {
  const navigate = useNavigate();
  const widthClass = fullWidth ? 'w-full max-w-none' : 'mx-auto w-full max-w-[1352px]';

  return (
    <div
      data-scroll-section={animated ? true : undefined}
      className={`frame-banner relative ${widthClass} min-h-[262px] overflow-hidden rounded-[10px] px-[clamp(28px,4.35vw,59px)] py-[52px] ${className}`}
      style={{ backgroundColor: '#294A26' }}
    >
      <div className="frame-copy relative z-10 w-full max-w-[700px] text-left">
        <div className="mb-3 flex items-center gap-4">
          <div className="h-[2px] w-6" style={{ backgroundColor: '#F2B62C' }} />
          <span
            data-scroll-text={animated ? true : undefined}
            className="text-[11px] font-bold uppercase leading-none tracking-[0.16em]"
            style={{ color: '#F2B62C' }}
          >
            Ready To Get Started?
          </span>
        </div>
        <h2
          data-scroll-text={animated ? 'right' : undefined}
          className="mb-3 text-[clamp(31px,2.7vw,38px)] font-bold leading-[1.28] text-white"
        >
          Ready to Create Stunning<br />Packaging <span style={{ color: '#F2B62C' }}>Mockups?</span>
        </h2>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-12">
          <p
            data-scroll-text={animated ? true : undefined}
            className="max-w-[395px] text-[15px] font-medium leading-[1.65] text-white"
          >
            Bring your ideas to life with our premium mockups <br /> and packaging solutions.
          </p>
          <button
            onClick={() => navigate(target)}
            className="group flex h-[51px] w-fit min-w-[207px] items-center justify-center gap-7 rounded-[10px] border-none px-4 text-[16px] font-bold text-[#20391E] transition-opacity hover:opacity-90 cursor-pointer"
            style={{ background: '#F2B62C' }}
          >
            Start Designing
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 transition-transform duration-300 ease-out group-hover:translate-x-1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>

        <img
          src={frameImg}
          alt="Products"
          className="frame-product pointer-events-none relative z-0 mt-8 w-full max-w-[700px] object-contain sm:mt-6 lg:absolute lg:bottom-0 lg:right-[34px] lg:mt-0 lg:w-[43.2vw] lg:max-w-[586px]"
        />
 
    </div>
  );
}
