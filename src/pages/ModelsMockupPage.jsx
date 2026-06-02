import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import ReadyMockupBanner from '../components/ReadyMockupBanner';
import bagIcon from '../assets/images/Icons/bag.webp';
import boxIcon from '../assets/images/Icons/box.webp';
import boxAltIcon from '../assets/images/Icons/box2.webp';
import jarIcon from '../assets/images/Icons/jar.webp';
import shirtIcon from '../assets/images/Icons/t-shirt.webp';
import mockupBanner from '../assets/images/MockupsSection/banner.svg';
import burgerWrapperImage from '../assets/images/MockupsSection/BurgerWrapper.webp';
import foodBoxImage from '../assets/images/MockupsSection/Food Box.webp';
import iceCreamImage from '../assets/images/MockupsSection/IceCream.webp';
import paperBagImage from '../assets/images/MockupsSection/PaperBag.webp';
import pizzaBoxImage from '../assets/images/MockupsSection/PizzaBox.webp';
import plasticBagImage from '../assets/images/MockupsSection/PlasticBag.webp';
import squareBoxImage from '../assets/images/MockupsSection/Square Box.webp';
import bulkCanImage from '../assets/images/MockupsSection/bulkCan.webp';
import glassBottleImage from '../assets/images/MockupsSection/glassBottle.webp';
import hoodieImage from '../assets/images/MockupsSection/hoodie.webp';
import oilBottleImage from '../assets/images/MockupsSection/oilBottle.webp';
import paperCupImage from '../assets/images/MockupsSection/paperCup.webp';
import plasticBoxImage from '../assets/images/MockupsSection/plasticBox.webp';
import plasticCupImage from '../assets/images/MockupsSection/plasticCup.webp';
import rectangleBoxImage from '../assets/images/MockupsSection/RectangleBox.webp';
import roundContainerImage from '../assets/images/MockupsSection/roundContainer.webp';
import roundSquareContainerImage from '../assets/images/MockupsSection/roundSquareContainer.webp';
import sweetBoxImage from '../assets/images/MockupsSection/sweetBox.webp';
import tshirtImage from '../assets/images/MockupsSection/t-shirt.webp';
import tumblerImage from '../assets/images/MockupsSection/tumbler.webp';
import waterBottleImage from '../assets/images/MockupsSection/waterBottle.webp';

const categoryGroups = [
  {
    title: 'Boxes',
    items: [
      'Premium Square Box',
      'Food Box',
      'Plastic Box',
    ],
  },
  {
    title: 'Bottle',
    items: [
      'Pure Water Bottle',
      'Oil bottle',
      'Glass bottle',
      'Bulk can',
    ],
  },
  {
    title: 'Container',
    items: [
      'Tumbler',
      'Plastic Cup',
      'Sustainable Paper Cup',
      'Round Container',
      'Round Square Container',
      'Rectangle Container',
      'Premium Sweet box',
    ],
  },
  {
    title: 'Food Packaging',
    items: ['Fro'],
  },
  {
    title: 'Bag',
    items: [],
  },
  {
    title: 'T- shirt',
    items: [],
  },
];

const catalogSections = [
  {
    title: 'Box Mockups',
    icon: 'box',
    sidebarLabels: ['Boxes'],
    products: ['Premium Square Box', 'Food Box', 'plastic Box'],
  },
  {
    title: 'Bottles & Liquids',
    icon: 'bottle',
    sidebarLabels: ['Bottle'],
    products: ['Pure Water Bottle', 'Oil bottle', 'Glass Bottle', 'Industrial Bulk Can'],
  },
  {
    title: 'Containers & Cups',
    icon: 'cup',
    sidebarLabels: ['Container'],
    products: [
      'Tumbler',
      'Plastic Cup',
      'Sustainable Paper Cup',
      'Round container',
      'Round Square container',
      'Rectangle container',
      'Premium Sweet box',
    ],
  },
  {
    title: 'Food Packaging',
    icon: 'pack',
    sidebarLabels: ['Food Packaging'],
    products: ['Frozen Ice Cream', 'Burger Wrap', 'Pizza Box'],
  },
  {
    title: 'Bag',
    icon: 'bag',
    sidebarLabels: ['Bag'],
    products: ['Paper Bag', 'Bio-Plastic Bag'],
  },
  {
    title: 'Apparel Branding',
    icon: 'shirt',
    sidebarLabels: ['T- shirt'],
    products: ['Oversized Heavy Cotton', 'Premium Fleece Hoodie'],
  },
];

const productAliases = {
  'bulk can': 'industrial bulk can',
  fro: 'frozen ice cream',
  't shirt': 'apparel branding',
};

function CubeIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </svg>
  );
}

function BottleIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M10 2h4v5l2 3v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10l2-3V2Z" />
      <path d="M9 13h6" />
    </svg>
  );
}

function BagIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}

function ShirtIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M8 4 4 7l3 4 1.5-1.2V21h7V9.8L17 11l3-4-4-3-4 2-4-2Z" />
    </svg>
  );
}

const sidebarIcons = {
  bag: bagIcon,
  bottle: jarIcon,
  box: boxIcon,
  container: jarIcon,
  pack: boxAltIcon,
  shirt: shirtIcon,
};

const productImages = {
  'bio plastic bag': plasticBagImage,
  'burger wrap': burgerWrapperImage,
  'food box': foodBoxImage,
  'frozen ice cream': iceCreamImage,
  'glass bottle': glassBottleImage,
  'industrial bulk can': bulkCanImage,
  'oil bottle': oilBottleImage,
  'oversized heavy cotton': tshirtImage,
  'paper bag': paperBagImage,
  'pizza box': pizzaBoxImage,
  'plastic box': plasticBoxImage,
  'plastic cup': plasticCupImage,
  'premium fleece hoodie': hoodieImage,
  'premium square box': squareBoxImage,
  'premium sweet box': sweetBoxImage,
  'pure water bottle': waterBottleImage,
  'rectangle container': rectangleBoxImage,
  'round container': roundContainerImage,
  'round square container': roundSquareContainerImage,
  'sustainable paper cup': paperCupImage,
  tumbler: tumblerImage,
};

function iconFor(type, className) {
  if (type === 'bottle') return <BottleIcon className={className} />;
  if (type === 'bag') return <BagIcon className={className} />;
  if (type === 'shirt') return <ShirtIcon className={className} />;
  return <CubeIcon className={className} />;
}

function ProductPlaceholder({ name, index }) {
  const image = productImages[normalizeLabel(name)];
  const tones = [
    'from-[#d9c7aa] via-[#b99a6b] to-[#f3eadf]',
    'from-[#f0ddba] via-[#bd9050] to-[#fff6e8]',
    'from-[#cfd9d7] via-[#80999b] to-[#edf4f4]',
    'from-[#f2efe7] via-[#b7afa1] to-[#ffffff]',
    'from-[#e4dfd1] via-[#a88964] to-[#f7efe5]',
    'from-[#d9e6e4] via-[#8ba19d] to-[#f7fbfa]',
  ];

  return (
    <article className="group cursor-pointer rounded-[8px] border border-transparent bg-white p-2 shadow-[0_12px_28px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d7c9bd] hover:shadow-[0_18px_34px_rgba(15,23,42,0.16)]">
      <div className={`relative aspect-[1.02] overflow-hidden rounded-[8px] bg-gradient-to-br ${tones[index % tones.length]}`}>
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <>
            <div className="absolute inset-x-8 bottom-8 top-12 rounded-[6px] border border-white/70 bg-white/45 shadow-[0_18px_40px_rgba(31,41,55,0.22)]" />
            <div className="absolute bottom-7 left-1/2 h-3 w-24 -translate-x-1/2 rounded-full bg-black/10 blur-sm" />
          </>
        )}
        <button
          type="button"
          aria-label={`Save ${name}`}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-white/70 text-[#6d7960] transition-colors duration-200 hover:bg-[#cc6428] hover:text-white cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
        </button>
      </div>
      <h3 className="mt-3 truncate text-[15px] font-bold text-[#2b2b2b] transition-colors duration-200 group-hover:text-[#cc6428]">{name}</h3>
      <button
        type="button"
        className="mt-2 h-10 w-full rounded-[6px] border-none bg-[#4f673f] text-[16px] font-medium text-white transition-all duration-200 hover:bg-[#cc6428] hover:shadow-[0_8px_16px_rgba(193,95,39,0.25)] cursor-pointer"
      >
        Customize
      </button>
    </article>
  );
}

function normalizeLabel(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function sidebarIconType(label) {
  const normalized = normalizeLabel(label);
  if (normalized.includes('bag')) return 'bag';
  if (normalized.includes('shirt')) return 'shirt';
  if (normalized.includes('bottle') || normalized.includes('can')) return 'bottle';
  if (normalized.includes('container') || normalized.includes('cup') || normalized.includes('tumbler')) return 'container';
  if (normalized.includes('food') || normalized.includes('fro')) return 'pack';
  return 'box';
}

function SidebarItem({ label, active, icon, onClick, isGroup, expanded, hasChildren, parentActive }) {
  const inactiveGroupClass = 'bg-[#ecebea] text-[#8f8f8f] hover:bg-[#e5e2df] hover:text-[#2b2b2b]';
  const activeGroupClass = 'bg-[#F2B62C] text-[#2b2b2b] font-bold'; // Yellow background, dark text
  const inactiveChildClass = 'bg-transparent text-[#858585] hover:bg-[#f7eee9] hover:text-[#37472F]';
  const activeChildClass = 'bg-[#D2692B] text-white font-bold';

  let finalClass = '';
  if (isGroup) {
    finalClass = (active || parentActive) ? activeGroupClass : inactiveGroupClass;
  } else {
    finalClass = active ? activeChildClass : inactiveChildClass;
  }

  const iconSrc = sidebarIcons[icon] ?? boxIcon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center justify-between rounded-[8px] border-none py-3 transition-all duration-200 ${finalClass} ${isGroup ? 'px-4 text-[clamp(13px,1.45vw,16px)] font-bold' : 'pr-4 pl-10 text-[clamp(12px,1.3vw,14px)] font-semibold'}`}
    >
      <div className="flex items-center gap-3">
        <img
          src={iconSrc}
          alt=""
          className={`${isGroup ? 'h-6 w-6' : 'h-5 w-5'} shrink-0 object-contain transition-all ${
            (!isGroup && active) ? 'brightness-0 invert' : (isGroup && (active || parentActive) ? 'brightness-0' : 'opacity-60')
          }`}
        />
        <span>{label}</span>
      </div>
      {isGroup && hasChildren && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''} ${(active || parentActive) ? 'text-[#2b2b2b]' : 'text-[#8f8f8f]'}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      )}
    </button>
  );
}

export default function ModelsMockupPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Premium Square Box');
  const [expandedGroups, setExpandedGroups] = useState({ 'Boxes': true });

  const toggleGroup = (groupTitle) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  };

  const displayedSections = useMemo(() => {
    const active = normalizeLabel(activeCategory);
    const alias = productAliases[active] ?? active;

    return catalogSections
      .map((section) => {
        const sectionLabels = [section.title, ...(section.sidebarLabels ?? [])].map(normalizeLabel);
        const isSectionMatch = sectionLabels.includes(alias);

        if (isSectionMatch) {
          return section;
        }

        const products = section.products.filter((product) => normalizeLabel(product) === alias);
        if (!products.length) return null;

        return {
          ...section,
          title: activeCategory,
          products,
        };
      })
      .filter(Boolean);
  }, [activeCategory]);

  return (
    <div className="h-screen w-screen overflow-hidden  pt-[5vh]  text-[#292929]">
      <main className="flex h-full w-full flex-col">
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(180px,34%)_minmax(0,1fr)] bg-[#FBF9F6] md:grid-cols-[28%_72%] lg:grid-cols-[22%_78%]">
          <aside className="flex min-h-0 flex-col border-r border-[#e5ded9] px-3 pb-6 pt-6 sm:px-4 lg:pt-8 xl:px-7">
            <header className="shrink-0 pb-7">
              <h1 className="m-0 text-[clamp(16px,2.8vw,23px)] font-bold leading-[1.05]">BROWSE BY CATEGORY</h1>
              <p className="mt-2 text-[clamp(12px,2vw,17px)] font-medium text-[#6f6f6f]">Premium Mockups Collection</p>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto pr-3">
              <div className="space-y-2 pb-8">
                {categoryGroups.map((group) => {
                  const isExpanded = expandedGroups[group.title];
                  const isParentActive = group.items.includes(activeCategory) || activeCategory === group.title;
                  
                  return (
                    <div key={group.title} className="flex flex-col gap-1">
                      <SidebarItem
                        label={group.title}
                        isGroup={true}
                        active={activeCategory === group.title}
                        parentActive={isParentActive}
                        expanded={isExpanded}
                        hasChildren={group.items.length > 0}
                        icon={sidebarIconType(group.title)}
                        onClick={() => {
                          if (group.items.length > 0) {
                            toggleGroup(group.title);
                            setActiveCategory(group.title);
                          } else {
                            setActiveCategory(group.title);
                          }
                        }}
                      />
                      
                      {isExpanded && group.items.length > 0 && (
                        <div className="flex flex-col gap-1 mt-1 mb-2">
                          {group.items.map((item) => (
                            <SidebarItem
                              key={item}
                              label={item}
                              isGroup={false}
                              active={activeCategory === item}
                              icon={sidebarIconType(item)}
                              onClick={() => setActiveCategory(item)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="min-h-0 min-w-0 overflow-y-auto pb-0">
            <div className="px-6 pt-8 lg:px-10 xl:px-12">
              <div className="relative mb-7 overflow-hidden rounded-[10px] shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
                <img src={mockupBanner} alt="Design smarter, not harder" className="block h-auto w-full" />
                <button
                  type="button"
                  onClick={() => navigate('/editor')}
                  aria-label="Explore more"
                  className="group absolute left-[4.2%] top-[78.4%] h-[12.5%] w-[15.2%] rounded-[10px] border-none bg-transparent cursor-pointer transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C15F27]"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-[10px] opacity-0 ring-2 ring-white/70 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="pointer-events-none absolute inset-y-0 left-[-45%] w-[35%] -skew-x-12 bg-white/30 opacity-0 transition-all duration-500 group-hover:left-[115%] group-hover:opacity-100" />
                </button>
              </div>

              <div className="space-y-10">
                {displayedSections.map((section, sectionIndex) => (
                  <section key={section.title}>
                    <div className="group/heading mb-5 flex w-fit cursor-default items-center gap-3">
                      <span className="text-[#7d8478] transition-colors duration-200 group-hover/heading:text-[#cc6428]">{iconFor(section.icon, 'h-7 w-7')}</span>
                      <h2 className="m-0 text-[28px] font-extrabold leading-none text-[#3b3b3b] transition-colors duration-200 group-hover/heading:text-[#cc6428]">{section.title}</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 2xl:grid-cols-3">
                      {section.products.map((product, productIndex) => (
                        <ProductPlaceholder
                          key={product}
                          name={product}
                          index={sectionIndex * 4 + productIndex}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            <div className="p-10">
              <ReadyMockupBanner target="/editor" fullWidth />
            </div>
            <Footer />
          </section>
        </div>
      </main>
    </div>
  );
}
