import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { useCartContext } from "../contexts/CartContext";
import { useUserDetailsContext } from "../contexts/UserDetailsContext";

/**
 * Header component with logo, search bar, and user actions
 * Features a modern design with the brand colors
 */
const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { user, signOut } = useAuthContext();
  const { userDetails } = useUserDetailsContext();
  const { getCartItemCount } = useCartContext();
  const navigate = useNavigate();
  const cartCount = getCartItemCount();
  const isAdmin = userDetails?.role === "admin";

  /**
   * Handle search submission
   * Navigate to home page with search query parameter
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to home with search query
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  /**
   * Handle sign out
   */
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  return (
    <header className="bg-[#7D78A3] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[#7D78A3] font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">CY Collects</h1>
                <p className="text-white/80 text-xs">Trading Cards</p>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search for cards, sets, or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 text-gray-900 bg-white rounded-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-gray-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </form>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Auth Section */}
            {user ? (
              // Logged in user menu
              <div className="relative group">
                <button className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors duration-200">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block">
                    {user.email?.split('@')[0]}
                  </span>
                  <svg
                    className="w-4 h-4"
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
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      My Profile
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Not logged in - show login/register
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-white hover:text-white/80 transition-colors duration-200"
                >
                  Login
                </Link>
                <span className="text-white/60">|</span>
                <Link
                  to="/register"
                  className="text-white hover:text-white/80 transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Request a Card Button */}
            <Link
              to="/want-to-buy"
              className="hidden md:flex items-center space-x-2 text-white hover:text-white/80 transition-colors duration-200 bg-white/10 px-3 py-2 rounded-lg hover:bg-white/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="text-sm font-medium">Request a Card</span>
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center space-x-2 text-white hover:text-white/80 transition-colors duration-200"
            >
              <div className="relative">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:block">Cart</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
