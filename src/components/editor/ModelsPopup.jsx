import { useState, useRef, useEffect } from 'react';

// Box Models
import sqBox1Url from "../../assets/models/box models/sq box/squareBox1.glb?url";
import sqBox2Url from "../../assets/models/box models/sq box/squareBox2.glb?url";
import plasticBox1Url from "../../assets/models/box models/plastic box/PlasticBox1.glb?url";
import plasticBox2Url from "../../assets/models/box models/plastic box/PlasticBox2.glb?url";
import foodBox1Url from "../../assets/models/box models/food box/Food Box1.glb?url";
import foodBox2Url from "../../assets/models/box models/food box/Food Box2.glb?url";

// Bag Models
import paperBag1Url from "../../assets/models/Bag/paperBag.glb?url";
import plasticBag1Url from "../../assets/models/Bag/plasticBag1.glb?url";
import plasticBag2Url from "../../assets/models/Bag/plasticBag2.glb?url";
import plasticBag3Url from "../../assets/models/Bag/plasticBag3.glb?url";
import plasticBag4Url from "../../assets/models/Bag/plasticBag4.glb?url";

// Bottle Models
import waterBottle1Url from "../../assets/models/Bottle/2.bottle-water bottle/waterBottle1.glb?url";
import waterBottle2Url from "../../assets/models/Bottle/2.bottle-water bottle/waterBottle2.glb?url";
import waterBottle3Url from "../../assets/models/Bottle/2.bottle-water bottle/waterBottle3.glb?url";
import waterBottle4Url from "../../assets/models/Bottle/2.bottle-water bottle/waterBottle4.glb?url";

import oilBottle1Url from "../../assets/models/Bottle/2.bottle-oil bottle/oilBottle1.glb?url";
import oilBottle2Url from "../../assets/models/Bottle/2.bottle-oil bottle/oilBottle2.glb?url";

import glassBottle1Url from "../../assets/models/Bottle/2.bottle-glass bottle/glassBottle1.glb?url";
import glassBottle2Url from "../../assets/models/Bottle/2.bottle-glass bottle/glassBottle2.glb?url";

import waterCan1Url from "../../assets/models/Bottle/2.bottl- water can/waterCan1.glb?url";
import waterCan2Url from "../../assets/models/Bottle/2.bottl- water can/waterCan2.glb?url";
import waterCan3Url from "../../assets/models/Bottle/2.bottl- water can/waterCan3.glb?url";

// Container Models
import tumbler1Url from "../../assets/models/Container/Tumbler/tumbler1.glb?url";
import tumbler2Url from "../../assets/models/Container/Tumbler/tumbler2.glb?url";

import cup1Url from "../../assets/models/Container/cup/papercup1.glb?url";
import cup2Url from "../../assets/models/Container/cup/papercup2.glb?url";
import cup3Url from "../../assets/models/Container/cup/plasticCup1.glb?url";
import cup4Url from "../../assets/models/Container/cup/plasticCup2.glb?url";

import roundContainer1Url from "../../assets/models/Container/Food Conatiner/Round Container/roundCont1.glb?url";
import roundContainer2Url from "../../assets/models/Container/Food Conatiner/Round Container/roundCont2.glb?url";

import roundSquare1Url from "../../assets/models/Container/Food Conatiner/Round Square/roundSquareCont1.glb?url";
import roundSquare2Url from "../../assets/models/Container/Food Conatiner/Round Square/roundSquareCont2.glb?url";

import rectContainer1Url from "../../assets/models/Container/Food Conatiner/Rectangle Container/rectangleCont1.glb?url";
import rectContainer2Url from "../../assets/models/Container/Food Conatiner/Rectangle Container/rectangleCont2.glb?url";

import sweetBox1Url from "../../assets/models/Container/Food Conatiner/Sweet Box/sweetBox1.glb?url";
import sweetBox2Url from "../../assets/models/Container/Food Conatiner/Sweet Box/sweetBox2.glb?url";

// Food Packaging Models
import iceCream1Url from "../../assets/models/Food/Ice cream/iceCream1.glb?url";
import iceCream2Url from "../../assets/models/Food/Ice cream/iceCream2.glb?url";

import burgerWrap1Url from "../../assets/models/Food/Burger/burger1.glb?url";
import burgerWrap2Url from "../../assets/models/Food/Burger/burger2.glb?url";

import pizzaBox1Url from "../../assets/models/Food/pIZZA/pizza1.glb?url";
import pizzaBox2Url from "../../assets/models/Food/pIZZA/pizza2.glb?url";

// Tshirt Models
import tshirt1Url from "../../assets/models/Tshirt/tShirt1.glb?url";
import tshirt2Url from "../../assets/models/Tshirt/tShirt2.glb?url";
import hoodie1Url from "../../assets/models/Tshirt/hoodie.glb?url";

// Specific Webp Image Imports
import sqBox1Img from "../../assets/models/box models/sq box/squareBox1.webp";
import sqBox2Img from "../../assets/models/box models/sq box/squareBox2.webp";
import plasticBox1Img from "../../assets/models/box models/plastic box/Plastic Box1.webp";
import plasticBox2Img from "../../assets/models/box models/plastic box/Plastic Box2.webp";
import foodBox1Img from "../../assets/models/box models/food box/Food Box1.webp";
import foodBox2Img from "../../assets/models/box models/food box/Food Box2.webp";
import paperBag1Img from "../../assets/models/Bag/plasticBag1.webp";
import plasticBag1Img from "../../assets/models/Bag/plasticBag1.webp";
import plasticBag2Img from "../../assets/models/Bag/plasticBag2.webp";
import plasticBag3Img from "../../assets/models/Bag/plasticBag3.webp";
import plasticBag4Img from "../../assets/models/Bag/plasticBag4.webp";
import waterBottle1Img from "../../assets/models/Bottle/2.bottle-water bottle/waterBottle1.webp";
import waterBottle2Img from "../../assets/models/Bottle/2.bottle-water bottle/waterBottle1.webp";
import waterBottle3Img from "../../assets/models/Bottle/2.bottle-water bottle/waterBottle3.webp";
import waterBottle4Img from "../../assets/models/Bottle/2.bottle-water bottle/waterBottle4.webp";
import oilBottle1Img from "../../assets/models/Bottle/2.bottle-oil bottle/oilBottle1.webp";
import oilBottle2Img from "../../assets/models/Bottle/2.bottle-oil bottle/oilBottle1.webp";
import glassBottle1Img from "../../assets/models/Bottle/2.bottle-glass bottle/glassBottle1.webp";
import glassBottle2Img from "../../assets/models/Bottle/2.bottle-glass bottle/glassBottle1.webp";
import waterCan1Img from "../../assets/models/Bottle/2.bottl- water can/waterCan1.webp";
import waterCan2Img from "../../assets/models/Bottle/2.bottl- water can/waterCan1.webp";
import waterCan3Img from "../../assets/models/Bottle/2.bottl- water can/waterCan3.webp";
import tumbler1Img from "../../assets/models/Container/Tumbler/tumbler1.webp";
import tumbler2Img from "../../assets/models/Container/Tumbler/tumbler2.webp";
import cup1Img from "../../assets/models/Container/cup/papercup1.webp";
import cup2Img from "../../assets/models/Container/cup/papercup2.webp";
import roundContainer1Img from "../../assets/models/Container/Food Conatiner/Round Container/roundCont1.webp";
import roundContainer2Img from "../../assets/models/Container/Food Conatiner/Round Container/roundCont2.webp";
import roundSquare1Img from "../../assets/models/Container/Food Conatiner/Round Square/roundSquareCont1.webp";
import roundSquare2Img from "../../assets/models/Container/Food Conatiner/Round Square/roundSquareCont2.webp";
import rectContainer1Img from "../../assets/models/Container/Food Conatiner/Rectangle Container/rectangleCont1.webp";
import rectContainer2Img from "../../assets/models/Container/Food Conatiner/Rectangle Container/rectangleCont2.webp";
import sweetBox1Img from "../../assets/models/Container/Food Conatiner/Sweet Box/sweetBox1.webp";
import sweetBox2Img from "../../assets/models/Container/Food Conatiner/Sweet Box/sweetBox2.webp";
import iceCream1Img from "../../assets/models/Food/Ice cream/iceCream1.webp";
import iceCream2Img from "../../assets/models/Food/Ice cream/iceCream2.webp";
import burgerWrap1Img from "../../assets/models/Food/Burger/burger1.webp";
import burgerWrap2Img from "../../assets/models/Food/Burger/burger2.webp";
import pizzaBox1Img from "../../assets/models/Food/pIZZA/pizza1.webp";
import pizzaBox2Img from "../../assets/models/Food/pIZZA/pizza2.webp";
import tshirt1Img from "../../assets/models/Tshirt/tShirt1.webp";
import tshirt2Img from "../../assets/models/Tshirt/tShirt2.webp";
import hoodie1Img from "../../assets/models/Tshirt/hoodie.webp";

const MODELS = [
  { id: 'sq-box-1', name: 'Square Box 1', modelUrl: sqBox1Url, category: 'Boxes', imageUrl: sqBox1Img },
  { id: 'sq-box-2', name: 'Square Box 2', modelUrl: sqBox2Url, category: 'Boxes', imageUrl: sqBox2Img },
  { id: 'plastic-box-1', name: 'Plastic Box 1', modelUrl: plasticBox1Url, category: 'Boxes', imageUrl: plasticBox1Img },
  { id: 'plastic-box-2', name: 'Plastic Box 2', modelUrl: plasticBox2Url, category: 'Boxes', imageUrl: plasticBox2Img },
  { id: 'food-box-1', name: 'Food Box 1', modelUrl: foodBox1Url, category: 'Boxes', imageUrl: foodBox1Img },
  { id: 'food-box-2', name: 'Food Box 2', modelUrl: foodBox2Url, category: 'Boxes', imageUrl: foodBox2Img },
  { id: 'paper-bag-1', name: 'Paper Bag 1', modelUrl: paperBag1Url, category: 'Bag', imageUrl: paperBag1Img },
  { id: 'plastic-bag-1', name: 'Plastic Bag 1', modelUrl: plasticBag1Url, category: 'Bag', imageUrl: plasticBag1Img },
  { id: 'plastic-bag-2', name: 'Plastic Bag 2', modelUrl: plasticBag2Url, category: 'Bag', imageUrl: plasticBag2Img },
  { id: 'plastic-bag-3', name: 'Plastic Bag 3', modelUrl: plasticBag3Url, category: 'Bag', imageUrl: plasticBag3Img },
  { id: 'plastic-bag-4', name: 'Plastic Bag 4', modelUrl: plasticBag4Url, category: 'Bag', imageUrl: plasticBag4Img },
  { id: 'water-bottle-1', name: 'Water Bottle 1', modelUrl: waterBottle1Url, category: 'Bottle', imageUrl: waterBottle1Img },
  { id: 'water-bottle-2', name: 'Water Bottle 2', modelUrl: waterBottle2Url, category: 'Bottle', imageUrl: waterBottle2Img },
  { id: 'water-bottle-3', name: 'Water Bottle 3', modelUrl: waterBottle3Url, category: 'Bottle', imageUrl: waterBottle3Img },
  { id: 'water-bottle-4', name: 'Water Bottle 4', modelUrl: waterBottle4Url, category: 'Bottle', imageUrl: waterBottle4Img },
  { id: 'oil-bottle-1', name: 'Oil Bottle 1', modelUrl: oilBottle1Url, category: 'Bottle', imageUrl: oilBottle1Img },
  { id: 'oil-bottle-2', name: 'Oil Bottle 2', modelUrl: oilBottle2Url, category: 'Bottle', imageUrl: oilBottle2Img },
  { id: 'glass-bottle-1', name: 'Glass Bottle 1', modelUrl: glassBottle1Url, category: 'Bottle', imageUrl: glassBottle1Img },
  { id: 'glass-bottle-2', name: 'Glass Bottle 2', modelUrl: glassBottle2Url, category: 'Bottle', imageUrl: glassBottle2Img },
  { id: 'water-can-1', name: 'Water can 1', modelUrl: waterCan1Url, category: 'Bottle', imageUrl: waterCan1Img },
  { id: 'water-can-2', name: 'Water can 2', modelUrl: waterCan2Url, category: 'Bottle', imageUrl: waterCan2Img },
  { id: 'water-can-3', name: 'Water can 3', modelUrl: waterCan3Url, category: 'Bottle', imageUrl: waterCan3Img },
  { id: 'tumbler-1', name: 'Tumbler 1', modelUrl: tumbler1Url, category: 'Container', imageUrl: tumbler1Img },
  { id: 'tumbler-2', name: 'Tumbler 2', modelUrl: tumbler2Url, category: 'Container', imageUrl: tumbler2Img },
  { id: 'cup-1', name: 'Cup 1', modelUrl: cup1Url, category: 'Container', imageUrl: cup1Img },
  { id: 'cup-2', name: 'Cup 2', modelUrl: cup2Url, category: 'Container', imageUrl: cup2Img },
  { id: 'cup-3', name: 'Cup 3', modelUrl: cup3Url, category: 'Container', imageUrl: cup2Img },
  { id: 'cup-4', name: 'Cup 4', modelUrl: cup4Url, category: 'Container', imageUrl: cup2Img },
  { id: 'round-container-1', name: 'Round Container 1', modelUrl: roundContainer1Url, category: 'Container', imageUrl: roundContainer1Img },
  { id: 'round-container-2', name: 'Round Container 2', modelUrl: roundContainer2Url, category: 'Container', imageUrl: roundContainer2Img },
  { id: 'round-square-1', name: 'Round Square Container 1', modelUrl: roundSquare1Url, category: 'Container', imageUrl: roundSquare1Img },
  { id: 'round-square-2', name: 'Round Square Container 2', modelUrl: roundSquare2Url, category: 'Container', imageUrl: roundSquare2Img },
  { id: 'rect-container-1', name: 'Rectangle Container 1', modelUrl: rectContainer1Url, category: 'Container', imageUrl: rectContainer1Img },
  { id: 'rect-container-2', name: 'Rectangle Container 2', modelUrl: rectContainer2Url, category: 'Container', imageUrl: rectContainer2Img },
  { id: 'sweet-box-1', name: 'Sweet box 1', modelUrl: sweetBox1Url, category: 'Container', imageUrl: sweetBox1Img },
  { id: 'sweet-box-2', name: 'Sweet box 2', modelUrl: sweetBox2Url, category: 'Container', imageUrl: sweetBox2Img },
  { id: 'ice-cream-1', name: 'Ice Cream 1', modelUrl: iceCream1Url, category: 'Food Packaging', imageUrl: iceCream1Img },
  { id: 'ice-cream-2', name: 'Ice Cream 2', modelUrl: iceCream2Url, category: 'Food Packaging', imageUrl: iceCream2Img },
  { id: 'burger-wrap-1', name: 'Burger Wrap 1', modelUrl: burgerWrap1Url, category: 'Food Packaging', imageUrl: burgerWrap1Img },
  { id: 'burger-wrap-2', name: 'Burger Wrap 2', modelUrl: burgerWrap2Url, category: 'Food Packaging', imageUrl: burgerWrap2Img },
  { id: 'pizza-box-1', name: 'Pizza Box 1', modelUrl: pizzaBox1Url, category: 'Food Packaging', imageUrl: pizzaBox1Img },
  { id: 'pizza-box-2', name: 'Pizza Box 2', modelUrl: pizzaBox2Url, category: 'Food Packaging', imageUrl: pizzaBox2Img },
  { id: 't-shirt-1', name: 'T-shirt 1', modelUrl: tshirt1Url, category: 'T-shirt', imageUrl: tshirt1Img },
  { id: 't-shirt-2', name: 'T-shirt 2', modelUrl: tshirt2Url, category: 'T-shirt', imageUrl: tshirt2Img },
  { id: 'hoodie-1', name: 'Hoodies 1', modelUrl: hoodie1Url, category: 'T-shirt', imageUrl: hoodie1Img },
];

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
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold text-gray-900 m-0">Select Model</h2>
          <label className="cursor-pointer bg-[#c05520] hover:bg-[#a94a1c] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            Import
            <input 
              type="file" 
              accept=".glb" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  onSelectModel(url);
                  e.target.value = '';
                }
              }}
            />
          </label>
        </div>
        
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
                  const img = model.imageUrl;
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
