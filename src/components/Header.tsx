import React from "react";
import { Search, ShoppingCart, Menu, X, Landmark, User, ShieldAlert, LogOut } from "lucide-react";
import { Employee } from "../types";

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  userRole: string;
  setUserRole: (role: string) => void;
  onOpenChat: () => void;
  authenticatedStaff?: Employee | null;
  onLogout?: () => void;
}

export default function Header({
  currentTab,
  setCurrentTab,
  cartCount,
  onOpenCart,
  userRole,
  setUserRole,
  onOpenChat,
  authenticatedStaff,
  onLogout
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const publicTabs = ["Home", "Menu", "Blog", "About", "Contact"];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md shadow-sm border-b border-[#EDF2F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left Side: Logo & Restaurant Name */}
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => { setCurrentTab("Home"); setUserRole("customer"); }}
        >
          <div className="w-10 h-10 rounded-xl bg-[#2B6CB0] flex items-center justify-center shadow-sm">
            <span className="font-serif text-white font-bold text-xl">A</span>
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl text-slate-800 tracking-wide">
              AURA <span className="text-[#2B6CB0]">GOURMET</span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Premium Burger Suite</p>
          </div>
        </div>

        {/* Center: Navigation Links for Public Site */}
        {userRole === "customer" && (
          <nav className="hidden md:flex items-center space-x-8">
            {publicTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`font-sans text-xs uppercase tracking-widest transition-all duration-300 relative py-2 ${
                  currentTab === tab 
                    ? "text-[#2B6CB0] font-semibold" 
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                {tab}
                {currentTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2B6CB0] rounded-full" />
                )}
              </button>
            ))}
          </nav>
        )}

        {/* Right Side Controls */}
        <div className="flex items-center space-x-4">
          {/* Unified Staff / Customer Portal Buttons */}
          {userRole === "customer" ? (
            <button
              onClick={() => {
                setUserRole("waiter");
                setCurrentTab("Dashboard");
              }}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-sans font-medium rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors shadow-sm duration-200"
            >
              <User className="w-3.5 h-3.5" />
              <span>Staff Login</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setUserRole("customer");
                  setCurrentTab("Home");
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-sans font-medium rounded-xl bg-[#EBF8FF] text-[#2B6CB0] hover:bg-[#2B6CB0]/10 transition-colors shadow-sm duration-200"
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Customer View</span>
              </button>

              {authenticatedStaff && (
                <>
                  <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium">
                    <User className="w-3.5 h-3.5 text-[#2B6CB0]" />
                    <span>{authenticatedStaff.name}</span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-sans font-medium rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors shadow-sm duration-200"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Search Bar - Customer Mode Only */}
          {userRole === "customer" && (
            <button 
              onClick={() => { setCurrentTab("Menu"); }}
              className="text-slate-500 hover:text-[#2B6CB0] hover:bg-slate-100 transition-colors p-2 rounded-xl"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* Shopping Cart Trigger - Customer Mode Only */}
          {userRole === "customer" && (
            <button 
              onClick={onOpenCart}
              className="relative text-slate-500 hover:text-[#2B6CB0] hover:bg-slate-100 transition-colors p-2 rounded-xl"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#2B6CB0] text-white text-[10px] font-bold font-mono rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Hamburger Menu - Mobile view */}
          {userRole === "customer" && (
            <button 
              className="md:hidden text-slate-500 hover:text-[#2B6CB0]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {userRole === "customer" && mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-white border-b border-[#EDF2F7] shadow-sm flex flex-col space-y-2 animate-fadeIn">
          {publicTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setCurrentTab(tab);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left font-sans text-sm uppercase tracking-wider py-2.5 px-4 rounded-xl ${
                currentTab === tab 
                  ? "bg-[#2B6CB0]/10 text-[#2B6CB0] font-semibold" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
