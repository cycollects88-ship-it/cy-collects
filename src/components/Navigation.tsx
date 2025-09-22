import React, { useState } from "react";
import { Link } from "react-router-dom";

/**
 * Navigation component with comprehensive category menu
 * Features dropdown menus and modern styling with brand colors
 */
const Navigation: React.FC = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navigationItems = [
    {
      label: "Home",
      href: "#",
      hasDropdown: false,
    },
    {
      label: "Original Goods",
      href: "#",
      hasDropdown: true,
      subItems: ["Trading Cards", "Accessories", "Collectibles"],
    },
    {
      label: "Deck Sales",
      href: "#",
      hasDropdown: true,
      subItems: ["Pre-built Decks", "Custom Decks", "Deck Accessories"],
    },
    {
      label: "MEGA",
      href: "#",
      hasDropdown: true,
      subItems: ["Mega Evolution Cards", "Special Packs", "Limited Edition"],
    },
    {
      label: "Scarlet & Violet",
      href: "#",
      hasDropdown: true,
      subItems: ["Base Set", "Paldea Evolved", "Obsidian Flames", "Paradox Rift"],
    },
    {
      label: "Sword & Shield",
      href: "#",
      hasDropdown: true,
      subItems: ["Base Set", "Rebel Clash", "Darkness Ablaze", "Vivid Voltage"],
    },
    {
      label: "Sun & Moon",
      href: "#",
      hasDropdown: true,
      subItems: ["Base Set", "Guardians Rising", "Crimson Invasion", "Ultra Prism"],
    },
    {
      label: "XY Series",
      href: "#",
      hasDropdown: true,
      subItems: ["Base Set", "Flashfire", "Furious Fists", "Phantom Forces"],
    },
    {
      label: "Black & White",
      href: "#",
      hasDropdown: true,
      subItems: ["Base Set", "Emerging Powers", "Noble Victories", "Next Destinies"],
    },
    {
      label: "LEGEND",
      href: "#",
      hasDropdown: true,
      subItems: ["Legendary Cards", "Mythical Cards", "Special Promos"],
    },
    {
      label: "DP/DPt",
      href: "#",
      hasDropdown: true,
      subItems: ["Diamond & Pearl", "Mysterious Treasures", "Secret Wonders"],
    },
    {
      label: "ADV/PCG",
      href: "#",
      hasDropdown: true,
      subItems: ["Advanced Generation", "Pokemon Card Game", "Classic Sets"],
    },
    {
      label: "Supplies",
      href: "#",
      hasDropdown: true,
      subItems: ["Card Sleeves", "Deck Boxes", "Playmats", "Storage"],
    },
    {
      label: "Appraised Items",
      href: "#",
      hasDropdown: false,
    },
    {
      label: "Unopened Products",
      href: "#",
      hasDropdown: true,
      subItems: ["Booster Packs", "Booster Boxes", "Elite Trainer Boxes"],
    },
    {
      label: "Out of Print",
      href: "#",
      hasDropdown: false,
    },
    {
      label: "Other Languages",
      href: "#",
      hasDropdown: true,
      subItems: ["Japanese", "Korean", "Chinese", "European"],
    },
    {
      label: "Apparel & Goods",
      href: "#",
      hasDropdown: true,
      subItems: ["T-Shirts", "Hoodies", "Accessories", "Merchandise"],
    },
    {
      label: "Store Info",
      href: "#",
      hasDropdown: false,
    },
    {
      label: "Careers",
      href: "#",
      hasDropdown: false,
    },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <div className="flex md:hidden items-center justify-between py-3">
          <button className="flex items-center space-x-2 text-gray-700 hover:text-[#7D78A3] transition-colors duration-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="font-medium">Browse Categories</span>
          </button>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex space-x-1 overflow-x-auto py-4 scrollbar-hide">
          {navigationItems.slice(0, 8).map((item, index) => (
            <div
              key={index}
              className="relative group"
              onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                to={index === 0 ? "/" : item.href}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  index === 0 
                    ? "text-[#7D78A3] bg-[#7D78A3]/5" 
                    : "text-gray-600 hover:text-[#7D78A3] hover:bg-gray-50"
                }`}
              >
                <span>{item.label}</span>
                {item.hasDropdown && (
                  <svg
                    className="w-3 h-3 opacity-60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </Link>

              {/* Dropdown Menu */}
              {item.hasDropdown && activeDropdown === item.label && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      {item.label}
                    </div>
                    {item.subItems?.map((subItem, subIndex) => (
                      <a
                        key={subIndex}
                        href="#"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-[#7D78A3]/5 hover:text-[#7D78A3] transition-all duration-200 border-l-2 border-transparent hover:border-[#7D78A3]"
                      >
                        {subItem}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* More Categories Button */}
          <div className="relative group">
            <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#7D78A3] hover:bg-gray-50 transition-all duration-200">
              <span>More</span>
              <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* More Categories Dropdown */}
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  More Categories
                </div>
                <div className="grid grid-cols-2 gap-1 p-2">
                  {navigationItems.slice(8).map((item, index) => (
                    <a
                      key={index}
                      href={item.href}
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-[#7D78A3]/5 hover:text-[#7D78A3] transition-all duration-200 rounded-lg"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
