import React from "react";
import Header from "./Header";
import Navigation from "./Navigation";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Main Layout Component for Customer-Facing Site
 * Wraps all customer pages with header, navigation, and footer
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
