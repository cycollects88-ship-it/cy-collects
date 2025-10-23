import React from "react";
import { Link } from "react-router-dom";
import { useCategoryContext } from "../contexts/CategoryContext";

/**
 * Navigation component with comprehensive category menu
 * Features dropdown menus and modern styling with brand colors
 */
const Navigation: React.FC = () => {
  const { categories, loading: categoriesLoading } = useCategoryContext();

  // Build navigation items dynamically from categories
  const activeCategories = categories.filter(cat => cat.active);
  
  const navigationItems = [
    {
      label: "Home",
      href: "/",
      categoryId: null,
    },
    {
      label: "Services",
      href: "/services",
      categoryId: null,
    },
    // Add active categories
    ...activeCategories.map(category => ({
      label: category.name || "Category",
      href: `/?category=${category.id}`,
      categoryId: category.id,
    })),
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
          {categoriesLoading ? (
            <div className="py-4 text-sm text-gray-500">Loading categories...</div>
          ) : (
            <div className="flex space-x-1 overflow-x-auto py-4 scrollbar-hide">
              {navigationItems.map((item) => (
                <Link
                  key={item.categoryId || item.label}
                  to={item.href}
                  className="flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap text-gray-600 hover:text-[#7D78A3] hover:bg-gray-50"
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
