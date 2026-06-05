import { useState, useRef, useEffect } from 'react';

// Box Images
import burgerWrapperImage from '../../assets/images/MockupsSection/BurgerWrapper.webp';
import foodBoxImage from '../../assets/images/MockupsSection/Food Box.webp';
import iceCreamImage from '../../assets/images/MockupsSection/IceCream.webp';
import paperBagImage from '../../assets/images/MockupsSection/PaperBag.webp';
import pizzaBoxImage from '../../assets/images/MockupsSection/PizzaBox.webp';
import plasticBagImage from '../../assets/images/MockupsSection/PlasticBag.webp';
import squareBoxImage from '../../assets/images/MockupsSection/Square Box.webp';
import bulkCanImage from '../../assets/images/MockupsSection/bulkCan.webp';
import glassBottleImage from '../../assets/images/MockupsSection/glassBottle.webp';
import hoodieImage from '../../assets/images/MockupsSection/hoodie.webp';
import oilBottleImage from '../../assets/images/MockupsSection/oilBottle.webp';
import paperCupImage from '../../assets/images/MockupsSection/paperCup.webp';
import plasticBoxImage from '../../assets/images/MockupsSection/plasticBox.webp';
import plasticCupImage from '../../assets/images/MockupsSection/plasticCup.webp';
import rectangleBoxImage from '../../assets/images/MockupsSection/RectangleBox.webp';
import roundContainerImage from '../../assets/images/MockupsSection/roundContainer.webp';
import roundSquareContainerImage from '../../assets/images/MockupsSection/roundSquareContainer.webp';
import sweetBoxImage from '../../assets/images/MockupsSection/sweetBox.webp';
import tshirtImage from '../../assets/images/MockupsSection/t-shirt.webp';
import tumblerImage from '../../assets/images/MockupsSection/tumbler.webp';
import waterBottleImage from '../../assets/images/MockupsSection/waterBottle.webp';

// Box Models
import sqBox1Url from "../../assets/models/box models/sq box/Box-4(Mockup).glb?url";
import sqBox2Url from "../../assets/models/box models/sq box/Perfume box-1.glb?url";
import plasticBox1Url from "../../assets/models/box models/plastic box/750 Biriyani Rectangular.glb?url";
import plasticBox2Url from "../../assets/models/box models/plastic box/Plasticbox-Mockup.glb?url";
import foodBox1Url from "../../assets/models/box models/food box/Food packaging mockup.glb?url";
import foodBox2Url from "../../assets/models/box models/food box/plastic food container-Mockup2.glb?url";

// Bag Models
import paperBag1Url from "../../assets/models/Bag/Paper.glb?url";
import plasticBag1Url from "../../assets/models/Bag/Plastic1.glb?url";
import plasticBag2Url from "../../assets/models/Bag/Plastic2.glb?url";
import plasticBag3Url from "../../assets/models/Bag/Plastic3.glb?url";
import plasticBag4Url from "../../assets/models/Bag/Plastic4.glb?url";

// Bottle Models
import waterBottle1Url from "../../assets/models/Bottle/2.bottle-water bottle/01.Round 300ml ltr.glb?url";
import waterBottle2Url from "../../assets/models/Bottle/2.bottle-water bottle/02.water bottle Mockup.glb?url";
import waterBottle3Url from "../../assets/models/Bottle/2.bottle-water bottle/03.small water bottle M.glb?url";
import waterBottle4Url from "../../assets/models/Bottle/2.bottle-water bottle/04 .glb?url";

import oilBottle1Url from "../../assets/models/Bottle/2.bottle-oil bottle/01.Oil bottle.glb?url";
import oilBottle2Url from "../../assets/models/Bottle/2.bottle-oil bottle/02.oil CrimsonMockup.glb?url";

import glassBottle1Url from "../../assets/models/Bottle/2.bottle-glass bottle/01.oil glass bottle-M.glb?url";
import glassBottle2Url from "../../assets/models/Bottle/2.bottle-glass bottle/02.Glass bottle Mockup.glb?url";

import waterCan1Url from "../../assets/models/Bottle/2.bottl- water can/01.glb?url";
import waterCan2Url from "../../assets/models/Bottle/2.bottl- water can/02.glb?url";
import waterCan3Url from "../../assets/models/Bottle/2.bottl- water can/03.glb?url";

// Container Models
import tumbler1Url from "../../assets/models/Container/Tumbler/01.Paper tumbler .glb?url";
import tumbler2Url from "../../assets/models/Container/Tumbler/02.glb?url";

import cup1Url from "../../assets/models/Container/cup/01-M.glb?url";
import cup2Url from "../../assets/models/Container/cup/02.glb?url";
import cup3Url from "../../assets/models/Container/cup/03.R 250 M.glb?url";
import cup4Url from "../../assets/models/Container/cup/04.R 750 ML .glb?url";

import roundContainer1Url from "../../assets/models/Container/Food Conatiner/Round Container/01.R 500 ML.glb?url";
import roundContainer2Url from "../../assets/models/Container/Food Conatiner/Round Container/02.R 1000 ML .glb?url";

import roundSquare1Url from "../../assets/models/Container/Food Conatiner/Round Square/01.120 dessert cup.glb?url";
import roundSquare2Url from "../../assets/models/Container/Food Conatiner/Round Square/02.RS.glb?url";

import rectContainer1Url from "../../assets/models/Container/Food Conatiner/Rectangle Container/01.650 BT.glb?url";
import rectContainer2Url from "../../assets/models/Container/Food Conatiner/Rectangle Container/02.1000 BT.glb?url";

import sweetBox1Url from "../../assets/models/Container/Food Conatiner/Sweet Box/01.SB 250 .glb?url";
import sweetBox2Url from "../../assets/models/Container/Food Conatiner/Sweet Box/02.SB TE 500 .glb?url";

// Food Packaging Models
import iceCream1Url from "../../assets/models/Food/Ice cream/01.glb?url";
import iceCream2Url from "../../assets/models/Food/Ice cream/02.glb?url";

import burgerWrap1Url from "../../assets/models/Food/Burger/01.glb?url";
import burgerWrap2Url from "../../assets/models/Food/Burger/02.glb?url";

import pizzaBox1Url from "../../assets/models/Food/pIZZA/01.glb?url";
import pizzaBox2Url from "../../assets/models/Food/pIZZA/02.glb?url";

// Tshirt Models
import tshirt1Url from "../../assets/models/Tshirt/t-shirt.glb?url";
import tshirt2Url from "../../assets/models/Tshirt/t-shirt1.glb?url";
import hoodie1Url from "../../assets/models/Tshirt/Hoodie.glb?url";

const MODELS = [
  // Box Models
  { id: 'sq-box-1', name: 'Square Box 1', modelUrl: sqBox1Url, category: 'Boxes', imageKey: 'square box' },
  { id: 'sq-box-2', name: 'Square Box 2', modelUrl: sqBox2Url, category: 'Boxes', imageKey: 'square box' },
  { id: 'plastic-box-1', name: 'Plastic Box 1', modelUrl: plasticBox1Url, category: 'Boxes', imageKey: 'plastic box' },
  { id: 'plastic-box-2', name: 'Plastic Box 2', modelUrl: plasticBox2Url, category: 'Boxes', imageKey: 'plastic box' },
  { id: 'food-box-1', name: 'Food Box 1', modelUrl: foodBox1Url, category: 'Boxes', imageKey: 'food box' },
  { id: 'food-box-2', name: 'Food Box 2', modelUrl: foodBox2Url, category: 'Boxes', imageKey: 'food box' },

  // Bag Models
  { id: 'paper-bag-1', name: 'Paper Bag 1', modelUrl: paperBag1Url, category: 'Bag', imageKey: 'paper bag' },
  { id: 'plastic-bag-1', name: 'Plastic Bag 1', modelUrl: plasticBag1Url, category: 'Bag', imageKey: 'plastic bag' },
  { id: 'plastic-bag-2', name: 'Plastic Bag 2', modelUrl: plasticBag2Url, category: 'Bag', imageKey: 'plastic bag' },
  { id: 'plastic-bag-3', name: 'Plastic Bag 3', modelUrl: plasticBag3Url, category: 'Bag', imageKey: 'plastic bag' },
  { id: 'plastic-bag-4', name: 'Plastic Bag 4', modelUrl: plasticBag4Url, category: 'Bag', imageKey: 'plastic bag' },

  // Bottle Models
  { id: 'water-bottle-1', name: 'Water Bottle 1', modelUrl: waterBottle1Url, category: 'Bottle', imageKey: 'water bottle' },
  { id: 'water-bottle-2', name: 'Water Bottle 2', modelUrl: waterBottle2Url, category: 'Bottle', imageKey: 'water bottle' },
  { id: 'water-bottle-3', name: 'Water Bottle 3', modelUrl: waterBottle3Url, category: 'Bottle', imageKey: 'water bottle' },
  { id: 'water-bottle-4', name: 'Water Bottle 4', modelUrl: waterBottle4Url, category: 'Bottle', imageKey: 'water bottle' },
  { id: 'oil-bottle-1', name: 'Oil Bottle 1', modelUrl: oilBottle1Url, category: 'Bottle', imageKey: 'oil bottle' },
  { id: 'oil-bottle-2', name: 'Oil Bottle 2', modelUrl: oilBottle2Url, category: 'Bottle', imageKey: 'oil bottle' },
  { id: 'glass-bottle-1', name: 'Glass Bottle 1', modelUrl: glassBottle1Url, category: 'Bottle', imageKey: 'glass bottle' },
  { id: 'glass-bottle-2', name: 'Glass Bottle 2', modelUrl: glassBottle2Url, category: 'Bottle', imageKey: 'glass bottle' },
  { id: 'water-can-1', name: 'Water can 1', modelUrl: waterCan1Url, category: 'Bottle', imageKey: 'water can' },
  { id: 'water-can-2', name: 'Water can 2', modelUrl: waterCan2Url, category: 'Bottle', imageKey: 'water can' },
  { id: 'water-can-3', name: 'Water can 3', modelUrl: waterCan3Url, category: 'Bottle', imageKey: 'water can' },

  // Container Models
  { id: 'tumbler-1', name: 'Tumbler 1', modelUrl: tumbler1Url, category: 'Container', imageKey: 'tumbler' },
  { id: 'tumbler-2', name: 'Tumbler 2', modelUrl: tumbler2Url, category: 'Container', imageKey: 'tumbler' },
  { id: 'cup-1', name: 'Cup 1', modelUrl: cup1Url, category: 'Container', imageKey: 'cup' },
  { id: 'cup-2', name: 'Cup 2', modelUrl: cup2Url, category: 'Container', imageKey: 'cup' },
  { id: 'cup-3', name: 'Cup 3', modelUrl: cup3Url, category: 'Container', imageKey: 'cup' },
  { id: 'cup-4', name: 'Cup 4', modelUrl: cup4Url, category: 'Container', imageKey: 'cup' },
  { id: 'round-container-1', name: 'Round Container 1', modelUrl: roundContainer1Url, category: 'Container', imageKey: 'round container' },
  { id: 'round-container-2', name: 'Round Container 2', modelUrl: roundContainer2Url, category: 'Container', imageKey: 'round container' },
  { id: 'round-square-1', name: 'Round Square Container 1', modelUrl: roundSquare1Url, category: 'Container', imageKey: 'round square container' },
  { id: 'round-square-2', name: 'Round Square Container 2', modelUrl: roundSquare2Url, category: 'Container', imageKey: 'round square container' },
  { id: 'rect-container-1', name: 'Rectangle Container 1', modelUrl: rectContainer1Url, category: 'Container', imageKey: 'rectangle container' },
  { id: 'rect-container-2', name: 'Rectangle Container 2', modelUrl: rectContainer2Url, category: 'Container', imageKey: 'rectangle container' },
  { id: 'sweet-box-1', name: 'Sweet box 1', modelUrl: sweetBox1Url, category: 'Container', imageKey: 'sweet box' },
  { id: 'sweet-box-2', name: 'Sweet box 2', modelUrl: sweetBox2Url, category: 'Container', imageKey: 'sweet box' },

  // Food Packaging Models
  { id: 'ice-cream-1', name: 'Ice Cream 1', modelUrl: iceCream1Url, category: 'Food Packaging', imageKey: 'ice cream' },
  { id: 'ice-cream-2', name: 'Ice Cream 2', modelUrl: iceCream2Url, category: 'Food Packaging', imageKey: 'ice cream' },
  { id: 'burger-wrap-1', name: 'Burger Wrap 1', modelUrl: burgerWrap1Url, category: 'Food Packaging', imageKey: 'burger wrap' },
  { id: 'burger-wrap-2', name: 'Burger Wrap 2', modelUrl: burgerWrap2Url, category: 'Food Packaging', imageKey: 'burger wrap' },
  { id: 'pizza-box-1', name: 'Pizza Box 1', modelUrl: pizzaBox1Url, category: 'Food Packaging', imageKey: 'pizza box' },
  { id: 'pizza-box-2', name: 'Pizza Box 2', modelUrl: pizzaBox2Url, category: 'Food Packaging', imageKey: 'pizza box' },

  // Tshirt Models
  { id: 't-shirt-1', name: 'T-shirt 1', modelUrl: tshirt1Url, category: 'T-shirt', imageKey: 't shirt' },
  { id: 't-shirt-2', name: 'T-shirt 2', modelUrl: tshirt2Url, category: 'T-shirt', imageKey: 't shirt' },
  { id: 'hoodie-1', name: 'Hoodies 1', modelUrl: hoodie1Url, category: 'T-shirt', imageKey: 'hoodies' },
];

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
  "tumbler": tumblerImage,
};

const CATEGORIES = ['Boxes', 'Bag', 'Bottle', 'Container', 'Food Packaging', 'T-shirt'];

const QUICK_TAGS = [
  'All',
  'Square Box', 'Food Box', 'Plastic Box',
  'Paper Bag', 'Plastic Bag',
  'Water Bottle', 'Oil Bottle', 'Glass Bottle', 'Water can',
  'Tumbler', 'Cup', 'Round Container', 'Round Square', 'Rectangle Container', 'Sweet box',
  'Ice Cream', 'Burger Wrap', 'Pizza Box',
  'T-shirt', 'Hoodies'
];

export default function ModelsPopup({ onSelectModel, currentModelUrl }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const activeModelRef = useRef(null);

  useEffect(() => {
    if (activeModelRef.current) {
      activeModelRef.current.scrollIntoView({
        behavior: 'auto',
        block: 'center'
      });
    }
  }, [currentModelUrl]);

  const filteredModels = MODELS.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          model.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'All' || 
                       model.name.toLowerCase().includes(selectedTag.toLowerCase()) ||
                       model.imageKey.toLowerCase().includes(selectedTag.toLowerCase());
    return matchesSearch && matchesTag;
  });

  const visibleTags = ['All', 'Square Box', 'Food Box'];
  const displayTags = [...visibleTags];
  if (selectedTag && !visibleTags.includes(selectedTag)) {
    displayTags.push(selectedTag);
  }

  return (
    <div className="w-[350px] h-[600px] shrink-0 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col">
      <div className="p-5 border-b border-gray-100 flex flex-col gap-3">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Select Model</h2>
        
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search models..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c05520] transition-colors bg-gray-50"
          />
        </div>

        {/* Quick select horizontal chips with Drop Arrow */}
        <div className="flex gap-1.5 py-1 items-center justify-between relative">
          <div className="flex gap-1.5 overflow-hidden flex-wrap max-h-8">
            {displayTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-200 border ${
                    isSelected 
                      ? 'bg-[#c05520] text-white border-[#c05520] shadow-sm scale-[1.02]' 
                      : 'bg-gray-50 text-gray-600 border-gray-200/80 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="relative shrink-0">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`p-1.5 rounded-lg border text-gray-500 hover:text-gray-900 bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-pointer flex items-center justify-center transition-all ${isDropdownOpen ? 'bg-gray-100 border-gray-300' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto py-1.5 flex flex-col">
                  {QUICK_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTag(tag);
                        setIsDropdownOpen(false);
                      }}
                      className={`px-4 py-2 text-left text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer ${selectedTag === tag ? 'text-[#c05520] bg-orange-50/50' : 'text-gray-700'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-6">
        {CATEGORIES.map((category) => {
          const catModels = filteredModels.filter(m => m.category === category);
          if (catModels.length === 0) return null;

          return (
            <div key={category} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 border-l-4 border-[#c05520] pl-2.5 py-0.5">
                <h4 className="text-xs font-bold tracking-wider uppercase text-gray-800 m-0">
                  {category}
                </h4>
                <span className="text-[10px] bg-orange-50 text-[#c05520] font-bold px-1.5 py-0.5 rounded-md">
                  {catModels.length}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {catModels.map((model) => {
                  const isActive = currentModelUrl === model.modelUrl;
                  const img = productImages[model.imageKey];
                  return (
                    <button 
                      key={model.id}
                      ref={isActive ? activeModelRef : null}
                      onClick={() => onSelectModel(model.modelUrl)}
                      title={model.name}
                      className={`aspect-square rounded-2xl relative overflow-hidden transition-all cursor-pointer border-2 p-0 ${
                        isActive ? 'border-[#c05520] shadow-sm' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {img ? (
                        <img src={img} alt={model.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                      {isActive && (
                        <div className="absolute bottom-2 right-2 w-5 h-5 bg-[#c05520] rounded-full flex items-center justify-center shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-3 h-3">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
