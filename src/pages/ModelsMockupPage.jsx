import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import ReadyMockupBanner from "../components/ReadyMockupBanner";
import bagIcon from "../assets/images/MockupsSection/Icons/bag.webp";
import boxIcon from "../assets/images/MockupsSection/Icons/box.webp";
import boxAltIcon from "../assets/images/MockupsSection/Icons/box2.webp";
import jarIcon from "../assets/images/MockupsSection/Icons/jar.webp";
import shirtIcon from "../assets/images/MockupsSection/Icons/t-shirt.webp";
import bottleIcon from "../assets/images/MockupsSection/Icons/Bottle.webp";
import burgerIcon from "../assets/images/MockupsSection/Icons/Burger.webp";
import foodBoxIcon from "../assets/images/MockupsSection/Icons/FoodBox.webp";
import glassBottleIcon from "../assets/images/MockupsSection/Icons/GlassBottle.webp";
import hoodieIcon from "../assets/images/MockupsSection/Icons/Hoodie.webp";
import icecreamIcon from "../assets/images/MockupsSection/Icons/Icecream.webp";
import paperBagIcon from "../assets/images/MockupsSection/Icons/PaperBag.webp";
import paperCupIcon from "../assets/images/MockupsSection/Icons/PaperCup.webp";
import pizzaIcon from "../assets/images/MockupsSection/Icons/Pizza.webp";
import plasticBagIcon from "../assets/images/MockupsSection/Icons/PlasticBag.webp";
import plasticBoxIcon from "../assets/images/MockupsSection/Icons/PlasticBox.webp";
import plasticCupIcon from "../assets/images/MockupsSection/Icons/PlasticCup.webp";
import rectangleContainerIcon from "../assets/images/MockupsSection/Icons/RectangleContainer.webp";
import roundContainerIcon from "../assets/images/MockupsSection/Icons/RoundContainer.webp";
import roundSquareContainerIcon from "../assets/images/MockupsSection/Icons/RoundSquareContainer.webp";
import sweetBoxIcon from "../assets/images/MockupsSection/Icons/SweetBox.webp";
import tShirtIcon from "../assets/images/MockupsSection/Icons/TShirt.webp";
import tumblerIcon from "../assets/images/MockupsSection/Icons/Tumbler.webp";
import waterCanIcon from "../assets/images/MockupsSection/Icons/WaterCan.webp";
import waterbottleIcon from "../assets/images/MockupsSection/Icons/Waterbottle.webp";
import mockupBanner from "../assets/images/MockupsSection/banner.svg";
import burgerWrapperImage from "../assets/images/MockupsSection/BurgerWrapper.webp";
import foodBoxImage from "../assets/images/MockupsSection/Food Box.webp";
import iceCreamImage from "../assets/images/MockupsSection/IceCream.webp";
import paperBagImage from "../assets/images/MockupsSection/PaperBag.webp";
import pizzaBoxImage from "../assets/images/MockupsSection/PizzaBox.webp";
import plasticBagImage from "../assets/images/MockupsSection/PlasticBag.webp";
import squareBoxImage from "../assets/images/MockupsSection/Square Box.webp";
import bulkCanImage from "../assets/images/MockupsSection/bulkCan.webp";
import glassBottleImage from "../assets/images/MockupsSection/glassBottle.webp";
import hoodieImage from "../assets/images/MockupsSection/hoodie.webp";
import oilBottleImage from "../assets/images/MockupsSection/oilBottle.webp";
import paperCupImage from "../assets/images/MockupsSection/paperCup.webp";
import plasticBoxImage from "../assets/images/MockupsSection/plasticBox.webp";
import plasticCupImage from "../assets/images/MockupsSection/plasticCup.webp";
import rectangleBoxImage from "../assets/images/MockupsSection/RectangleBox.webp";
import roundContainerImage from "../assets/images/MockupsSection/roundContainer.webp";
import roundSquareContainerImage from "../assets/images/MockupsSection/roundSquareContainer.webp";
import sweetBoxImage from "../assets/images/MockupsSection/sweetBox.webp";
import tshirtImage from "../assets/images/MockupsSection/t-shirt.webp";
import tumblerImage from "../assets/images/MockupsSection/tumbler.webp";

// Box Models
import sqBox1Url from "../assets/models/box models/sq box/Box-4(Mockup).glb?url";
import sqBox2Url from "../assets/models/box models/sq box/Perfume box-1.glb?url";
import plasticBox1Url from "../assets/models/box models/plastic box/750 Biriyani Rectangular.glb?url";
import plasticBox2Url from "../assets/models/box models/plastic box/Plasticbox-Mockup.glb?url";
import foodBox1Url from "../assets/models/box models/food box/Food packaging mockup.glb?url";
import foodBox2Url from "../assets/models/box models/food box/plastic food container-Mockup2.glb?url";

// Bag Models
import paperBag1Url from "../assets/models/Bag/Paper.glb?url";
import plasticBag1Url from "../assets/models/Bag/Plastic1.glb?url";
import plasticBag2Url from "../assets/models/Bag/Plastic2.glb?url";
import plasticBag3Url from "../assets/models/Bag/Plastic3.glb?url";
import plasticBag4Url from "../assets/models/Bag/Plastic4.glb?url";

// Bottle Models
import waterBottle1Url from "../assets/models/Bottle/2.bottle-water bottle/01.Round 300ml ltr.glb?url";
import waterBottle2Url from "../assets/models/Bottle/2.bottle-water bottle/02.water bottle Mockup.glb?url";
import waterBottle3Url from "../assets/models/Bottle/2.bottle-water bottle/03.small water bottle M.glb?url";
import waterBottle4Url from "../assets/models/Bottle/2.bottle-water bottle/04 .glb?url";

import oilBottle1Url from "../assets/models/Bottle/2.bottle-oil bottle/01.Oil bottle.glb?url";
import oilBottle2Url from "../assets/models/Bottle/2.bottle-oil bottle/02.oil CrimsonMockup.glb?url";

import glassBottle1Url from "../assets/models/Bottle/2.bottle-glass bottle/01.oil glass bottle-M.glb?url";
import glassBottle2Url from "../assets/models/Bottle/2.bottle-glass bottle/02.Glass bottle Mockup.glb?url";

import waterCan1Url from "../assets/models/Bottle/2.bottl- water can/01.glb?url";
import waterCan2Url from "../assets/models/Bottle/2.bottl- water can/02.glb?url";
import waterCan3Url from "../assets/models/Bottle/2.bottl- water can/03.glb?url";

// Container Models
import tumbler1Url from "../assets/models/Container/Tumbler/01.Paper tumbler .glb?url";
import tumbler2Url from "../assets/models/Container/Tumbler/02.glb?url";

import cup1Url from "../assets/models/Container/cup/01-M.glb?url";
import cup2Url from "../assets/models/Container/cup/02.glb?url";
import cup3Url from "../assets/models/Container/cup/03.R 250 M.glb?url";
import cup4Url from "../assets/models/Container/cup/04.R 750 ML .glb?url";

import roundContainer1Url from "../assets/models/Container/Food Conatiner/Round Container/01.R 500 ML.glb?url";
import roundContainer2Url from "../assets/models/Container/Food Conatiner/Round Container/02.R 1000 ML .glb?url";

import roundSquare1Url from "../assets/models/Container/Food Conatiner/Round Square/01.120 dessert cup.glb?url";
import roundSquare2Url from "../assets/models/Container/Food Conatiner/Round Square/02.RS.glb?url";

import rectContainer1Url from "../assets/models/Container/Food Conatiner/Rectangle Container/01.650 BT.glb?url";
import rectContainer2Url from "../assets/models/Container/Food Conatiner/Rectangle Container/02.1000 BT.glb?url";

import sweetBox1Url from "../assets/models/Container/Food Conatiner/Sweet Box/01.SB 250 .glb?url";
import sweetBox2Url from "../assets/models/Container/Food Conatiner/Sweet Box/02.SB TE 500 .glb?url";

// Food Packaging Models
import iceCream1Url from "../assets/models/Food/Ice cream/01.glb?url";
import iceCream2Url from "../assets/models/Food/Ice cream/02.glb?url";

import burgerWrap1Url from "../assets/models/Food/Burger/01.glb?url";
import burgerWrap2Url from "../assets/models/Food/Burger/02.glb?url";

import pizzaBox1Url from "../assets/models/Food/pIZZA/01.glb?url";
import pizzaBox2Url from "../assets/models/Food/pIZZA/02.glb?url";

// Tshirt Models
import tshirt1Url from "../assets/models/Tshirt/t-shirt.glb?url";
import tshirt2Url from "../assets/models/Tshirt/t-shirt1.glb?url";
import hoodie1Url from "../assets/models/Tshirt/Hoodie.glb?url";

const modelMappings = {
  "Square Box 1": sqBox1Url,
  "Square Box 2": sqBox2Url,
  "Plastic Box 1": plasticBox1Url,
  "Plastic Box 2": plasticBox2Url,
  "Food Box 1": foodBox1Url,
  "Food Box 2": foodBox2Url,

  "Paper Bag 1": paperBag1Url,
  "Paper Bag 2": paperBag1Url,
  "Paper Bag 3": paperBag1Url,
  "Plastic Bag 1": plasticBag1Url,
  "Plastic Bag 2": plasticBag2Url,
  "Plastic Bag 3": plasticBag3Url,
  "Plastic Bag 4": plasticBag4Url,

  "Water Bottle 1": waterBottle1Url,
  "Water Bottle 2": waterBottle2Url,
  "Water Bottle 3": waterBottle3Url,
  "Water Bottle 4": waterBottle4Url,

  "Oil Bottle 1": oilBottle1Url,
  "Oil Bottle 2": oilBottle2Url,

  "Glass Bottle 1": glassBottle1Url,
  "Glass Bottle 2": glassBottle2Url,

  "Water can 1": waterCan1Url,
  "Water can 2": waterCan2Url,
  "Water can 3": waterCan3Url,

  "Tumbler 1": tumbler1Url,
  "Tumbler 2": tumbler2Url,

  "Cup 1": cup1Url,
  "Cup 2": cup2Url,
  "Cup 3": cup3Url,
  "Cup 4": cup4Url,

  "Round Container 1": roundContainer1Url,
  "Round Container 2": roundContainer2Url,

  "Round Square Container 1": roundSquare1Url,
  "Round Square Container 2": roundSquare2Url,

  "Rectangle Container 1": rectContainer1Url,
  "Rectangle Container 2": rectContainer2Url,

  "Sweet box 1": sweetBox1Url,
  "Sweet box 2": sweetBox2Url,

  "Ice Cream 1": iceCream1Url,
  "Ice Cream 2": iceCream2Url,

  "Burger Wrap 1": burgerWrap1Url,
  "Burger Wrap 2": burgerWrap2Url,

  "Pizza Box 1": pizzaBox1Url,
  "Pizza Box 2": pizzaBox2Url,

  "T-shirt 1": tshirt1Url,
  "T-shirt 2": tshirt2Url,
  "Hoodies 1": hoodie1Url,
};
import waterBottleImage from "../assets/images/MockupsSection/waterBottle.webp";

const categoryGroups = [
  {
    title: "Boxes",
    items: ["Square Box", "Food Box", "Plastic Box"],
  },
  {
    title: "Bottle",
    items: ["Water Bottle", "Oil Bottle", "Glass Bottle", "Water can"],
  },
  {
    title: "Container",
    items: [
      "Tumbler",
      "Cup",
      "Round Container",
      "Round Square Container",
      "Rectangle Container",
      "Sweet box",
    ],
  },
  {
    title: "Food Packaging",
    items: ["Ice Cream", "Burger Wrap", "Pizza Box"],
  },
  {
    title: "Bag",
    items: ["Paper Bag", "Plastic Bag"],
  },
  {
    title: "T- shirt",
    items: ["T-shirt", "Hoodies"],
  },
];

const catalogSections = [
  {
    title: "Square Box",
    icon: "box",
    sidebarLabels: ["Square Box", "Boxes"],
    products: ["Square Box 1", "Square Box 2"],
  },
  {
    title: "Food Box",
    icon: "box",
    sidebarLabels: ["Food Box", "Boxes"],
    products: ["Food Box 1", "Food Box 2"],
  },
  {
    title: "Plastic Box",
    icon: "box",
    sidebarLabels: ["Plastic Box", "Boxes"],
    products: ["Plastic Box 1", "Plastic Box 2"],
  },
  {
    title: "Water Bottle",
    icon: "bottle",
    sidebarLabels: ["Water Bottle", "Bottle"],
    products: ["Water Bottle 1", "Water Bottle 2", "Water Bottle 3", "Water Bottle 4"],
  },
  {
    title: "Oil Bottle",
    icon: "bottle",
    sidebarLabels: ["Oil Bottle", "Bottle"],
    products: ["Oil Bottle 1", "Oil Bottle 2"],
  },
  {
    title: "Glass Bottle",
    icon: "bottle",
    sidebarLabels: ["Glass Bottle", "Bottle"],
    products: ["Glass Bottle 1", "Glass Bottle 2"],
  },
  {
    title: "Water can",
    icon: "bottle",
    sidebarLabels: ["Water can", "Bottle"],
    products: ["Water can 1", "Water can 2", "Water can 3"],
  },
  {
    title: "Tumbler",
    icon: "cup",
    sidebarLabels: ["Tumbler", "Container"],
    products: ["Tumbler 1", "Tumbler 2"],
  },
  {
    title: "Cup",
    icon: "cup",
    sidebarLabels: ["Cup", "Container"],
    products: ["Cup 1", "Cup 2", "Cup 3", "Cup 4"],
  },
  {
    title: "Round Container",
    icon: "cup",
    sidebarLabels: ["Round Container", "Container"],
    products: ["Round Container 1", "Round Container 2"],
  },
  {
    title: "Round Square Container",
    icon: "cup",
    sidebarLabels: ["Round Square Container", "Container"],
    products: ["Round Square Container 1", "Round Square Container 2"],
  },
  {
    title: "Rectangle Container",
    icon: "cup",
    sidebarLabels: ["Rectangle Container", "Container"],
    products: ["Rectangle Container 1", "Rectangle Container 2"],
  },
  {
    title: "Sweet box",
    icon: "cup",
    sidebarLabels: ["Sweet box", "Container"],
    products: ["Sweet box 1", "Sweet box 2"],
  },
  {
    title: "Ice Cream",
    icon: "pack",
    sidebarLabels: ["Ice Cream", "Food Packaging"],
    products: ["Ice Cream 1", "Ice Cream 2"],
  },
  {
    title: "Burger Wrap",
    icon: "pack",
    sidebarLabels: ["Burger Wrap", "Food Packaging"],
    products: ["Burger Wrap 1", "Burger Wrap 2"],
  },
  {
    title: "Pizza Box",
    icon: "pack",
    sidebarLabels: ["Pizza Box", "Food Packaging"],
    products: ["Pizza Box 1", "Pizza Box 2"],
  },
  {
    title: "Paper Bag",
    icon: "bag",
    sidebarLabels: ["Paper Bag", "Bag"],
    products: ["Paper Bag 1"],
  },
  {
    title: "Plastic Bag",
    icon: "bag",
    sidebarLabels: ["Plastic Bag", "Bag"],
    products: ["Plastic Bag 1", "Plastic Bag 2", "Plastic Bag 3", "Plastic Bag 4"],
  },
  {
    title: "T-shirt",
    icon: "shirt",
    sidebarLabels: ["T-shirt", "T- shirt"],
    products: ["T-shirt 1", "T-shirt 2"],
  },
  {
    title: "Hoodies",
    icon: "shirt",
    sidebarLabels: ["Hoodies", "T- shirt"],
    products: ["Hoodies 1"],
  },
];

const productAliases = {};

function CubeIcon({ className = "h-6 w-6" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </svg>
  );
}

function BottleIcon({ className = "h-6 w-6" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 2h4v5l2 3v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10l2-3V2Z" />
      <path d="M9 13h6" />
    </svg>
  );
}

function BagIcon({ className = "h-6 w-6" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}

function ShirtIcon({ className = "h-6 w-6" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 4 4 7l3 4 1.5-1.2V21h7V9.8L17 11l3-4-4-3-4 2-4-2Z" />
    </svg>
  );
}

const sidebarIcons = {
  // Generic / Fallback
  box: boxIcon,
  bag: bagIcon,
  bottle: bottleIcon,
  container: jarIcon,
  pack: boxAltIcon,
  shirt: shirtIcon,

  // Group mappings
  boxes: boxIcon,
  "food packaging": boxAltIcon,

  // Specific Subcategory mappings
  "square box": boxIcon,
  "food box": foodBoxIcon,
  "plastic box": plasticBoxIcon,
  "water bottle": waterbottleIcon,
  "oil bottle": bottleIcon,
  "glass bottle": glassBottleIcon,
  "water can": waterCanIcon,
  tumbler: tumblerIcon,
  cup: paperCupIcon,
  "round container": roundContainerIcon,
  "round square container": roundSquareContainerIcon,
  "rectangle container": rectangleContainerIcon,
  "sweet box": sweetBoxIcon,
  "ice cream": icecreamIcon,
  "burger wrap": burgerIcon,
  "pizza box": pizzaIcon,
  "paper bag": paperBagIcon,
  "plastic bag": plasticBagIcon,
  "t-shirt": tShirtIcon,
  "t shirt": tShirtIcon,
  hoodies: hoodieIcon,
};

const productImages = {
  "plastic bag": plasticBagImage,
  "burger wrap": burgerWrapperImage,
  "food box": foodBoxImage,
  "ice cream": iceCreamImage,
  "glass bottle": glassBottleImage,
  "water can": bulkCanImage,
  "oil bottle": oilBottleImage,
  "t shirt": tshirtImage,
  "paper bag": paperBagImage,
  "pizza box": pizzaBoxImage,
  "plastic box": plasticBoxImage,
  "plastic cup": plasticCupImage,
  "hoodies": hoodieImage,
  "square box": squareBoxImage,
  "sweet box": sweetBoxImage,
  "water bottle": waterBottleImage,
  "rectangle container": rectangleBoxImage,
  "round container": roundContainerImage,
  "round square container": roundSquareContainerImage,
  "paper cup": paperCupImage,
  "cup": paperCupImage,
  tumbler: tumblerImage,
};

function iconFor(type, className) {
  if (type === "bottle") return <BottleIcon className={className} />;
  if (type === "bag") return <BagIcon className={className} />;
  if (type === "shirt") return <ShirtIcon className={className} />;
  return <CubeIcon className={className} />;
}

function ProductPlaceholder({ name, index }) {
  const navigate = useNavigate();
  const baseName = name.replace(/\s*\d+$/, "");
  const image = productImages[normalizeLabel(baseName)];
  const tones = [
    "from-[#d9c7aa] via-[#b99a6b] to-[#f3eadf]",
    "from-[#f0ddba] via-[#bd9050] to-[#fff6e8]",
    "from-[#cfd9d7] via-[#80999b] to-[#edf4f4]",
    "from-[#f2efe7] via-[#b7afa1] to-[#ffffff]",
    "from-[#e4dfd1] via-[#a88964] to-[#f7efe5]",
    "from-[#d9e6e4] via-[#8ba19d] to-[#f7fbfa]",
  ];

  return (
    <article
      onClick={() => {
        const url = modelMappings[name] || null;
        navigate("/editor", { state: { initialModelUrl: url } });
      }}
      className="group cursor-pointer rounded-[8px] border border-transparent bg-white p-2 shadow-[0_12px_28px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d7c9bd] hover:shadow-[0_18px_34px_rgba(15,23,42,0.16)]"
    >
      <div
        className={`relative aspect-[1.02] overflow-hidden rounded-[8px] bg-gradient-to-br ${tones[index % tones.length]}`}
      >
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
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
        </button>
      </div>
      <h3 className="mt-3 truncate text-[15px] font-bold text-[#2b2b2b] transition-colors duration-200 group-hover:text-[#cc6428]">
        {name}
      </h3>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          const url = modelMappings[name] || null;
          navigate("/editor", { state: { initialModelUrl: url } });
        }}
        className="mt-2 h-10 w-full rounded-[6px] border-none bg-[#4f673f] text-[16px] font-medium text-white transition-all duration-200 hover:bg-[#cc6428] hover:shadow-[0_8px_16px_rgba(193,95,39,0.25)] cursor-pointer"
      >
        Customize
      </button>
    </article>
  );
}

function normalizeLabel(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function sidebarIconType(label) {
  return normalizeLabel(label);
}

function SidebarItem({
  label,
  active,
  icon,
  onClick,
  isGroup,
  expanded,
  hasChildren,
  parentActive,
}) {
  const inactiveGroupClass =
    "bg-[#ecebea] text-[#8f8f8f] hover:bg-[#e5e2df] hover:text-[#2b2b2b]";
  const activeGroupClass = "bg-[#F2B62C] text-[#2b2b2b] font-bold";
  const inactiveChildClass =
    "bg-transparent text-[#858585] hover:bg-[#f7eee9] hover:text-[#37472F]";
  const activeChildClass = "bg-[#D2692B] text-white font-bold";

  let finalClass = "";
  if (isGroup) {
    finalClass = active || parentActive ? activeGroupClass : inactiveGroupClass;
  } else {
    finalClass = active ? activeChildClass : inactiveChildClass;
  }

  const iconSrc = sidebarIcons[icon] ?? boxIcon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center justify-between rounded-[8px] border-none py-3 transition-all duration-200 ${finalClass} ${isGroup ? "px-4 text-[clamp(13px,1.45vw,16px)] font-bold" : "pr-4 pl-10 text-[clamp(12px,1.3vw,14px)] font-semibold"}`}
    >
      <div className="flex items-center gap-3">
        <img
          src={iconSrc}
          alt=""
          className={`${isGroup ? "h-6 w-6" : "h-5 w-5"} shrink-0 object-contain transition-all ${
            !isGroup && active
              ? "brightness-0 invert"
              : isGroup && (active || parentActive)
                ? "brightness-0"
                : "opacity-60"
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
          className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""} ${active || parentActive ? "text-[#2b2b2b]" : "text-[#8f8f8f]"}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      )}
    </button>
  );
}

export default function ModelsMockupPage() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedGroups, setExpandedGroups] = useState({ All: true });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, [activeCategory]);

  const toggleGroup = (groupTitle) => {
    setExpandedGroups((prev) => ({
      [groupTitle]: !prev[groupTitle],
    }));
  };

  const displayedSections = useMemo(() => {
    if (activeCategory === "All") {
      return catalogSections;
    }
    const active = normalizeLabel(activeCategory);
    const alias = productAliases[active] ?? active;

    return catalogSections
      .map((section) => {
        const sectionLabels = [
          section.title,
          ...(section.sidebarLabels ?? []),
        ].map(normalizeLabel);
        const isSectionMatch = sectionLabels.includes(alias);

        if (isSectionMatch) {
          return section;
        }

        const products = section.products.filter(
          (product) => normalizeLabel(product) === alias,
        );
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
              <h1 className="m-0 text-[clamp(16px,2.8vw,23px)] font-bold leading-[1.05]">
                BROWSE BY CATEGORY
              </h1>
              <p className="mt-2 text-[clamp(12px,2vw,17px)] font-medium text-[#6f6f6f]">
                Premium Mockups Collection
              </p>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto pr-3">
              <div className="space-y-2 pb-8">
                <SidebarItem
                  label="All"
                  isGroup={true}
                  active={activeCategory === "All"}
                  parentActive={activeCategory === "All"}
                  expanded={false}
                  hasChildren={false}
                  icon="box"
                  onClick={() => {
                    setActiveCategory("All");
                  }}
                />

                {categoryGroups.map((group) => {
                  const isExpanded = expandedGroups[group.title];
                  const isParentActive =
                    group.items.includes(activeCategory) ||
                    activeCategory === group.title;

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

          <section ref={scrollRef} className="min-h-0 min-w-0 overflow-y-auto pb-0">
            <div className="px-6 pt-8 lg:px-10 xl:px-12">
              <div className="relative mb-7 overflow-hidden rounded-[10px] shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
                <img
                  src={mockupBanner}
                  alt="Design smarter, not harder"
                  className="block h-auto w-full"
                />
                <button
                  type="button"
                  onClick={() => navigate("/editor")}
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
                      <span className="text-[#7d8478] transition-colors duration-200 group-hover/heading:text-[#cc6428]">
                        {iconFor(section.icon, "h-7 w-7")}
                      </span>
                      <h2 className="m-0 text-[28px] font-extrabold leading-none text-[#3b3b3b] transition-colors duration-200 group-hover/heading:text-[#cc6428]">
                        {section.title}
                      </h2>
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
