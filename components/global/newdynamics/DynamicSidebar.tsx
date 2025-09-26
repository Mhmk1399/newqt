"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  IoMenu, 

  IoChevronDown,
  IoChevronUp
} from "react-icons/io5";

interface SidebarItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType;
}

interface DynamicSidebarProps {
  items: SidebarItem[];
  userRole: string;
  onItemSelect: (key: string, component: React.ComponentType) => void;
  activeItem?: string;
}

const DynamicSidebar: React.FC<DynamicSidebarProps> = ({
  items,
  userRole,
  onItemSelect,
  activeItem
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (sidebarRef.current) {
      if (isMobile) {
        // Mobile: slide from right
        gsap.set(sidebarRef.current, { x: "100%" });
        if (isOpen) {
          gsap.to(sidebarRef.current, { x: "0%", duration: 0.3, ease: "power2.out" });
          gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" });
        } else {
          gsap.to(sidebarRef.current, { x: "100%", duration: 0.3, ease: "power2.in" });
          gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, ease: "power2.in" });
        }
      } else {
        // Desktop: expand/collapse
        if (isOpen) {
          gsap.to(sidebarRef.current, { width: "280px", duration: 0.3, ease: "power2.out" });
        } else {
          gsap.to(sidebarRef.current, { width: "80px", duration: 0.3, ease: "power2.in" });
        }
      }
    }
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (dropdownRef.current && isMobile) {
      if (isDropdownOpen) {
        gsap.fromTo(dropdownRef.current, 
          { height: 0, opacity: 0 },
          { height: "auto", opacity: 1, duration: 0.3, ease: "power2.out" }
        );
      } else {
        gsap.to(dropdownRef.current, { height: 0, opacity: 0, duration: 0.3, ease: "power2.in" });
      }
    }
  }, [isDropdownOpen, isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleItemClick = (item: SidebarItem) => {
    // Update URL with the selected item key
    const currentPath = window.location.pathname;
    const newUrl = `${currentPath}?tab=${item.key}`;
    router.push(newUrl, { scroll: false });
    
    // Call the parent handler
    onItemSelect(item.key, item.component);
    
    if (isMobile) {
      setIsDropdownOpen(false);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black/50 z-40 opacity-0 pointer-events-none"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#030014] via-[#0A0A2E] to-[#030014] border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text">
              داشبورد {userRole === 'admin' ? 'مدیریت' : userRole}
            </h1>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 hover:bg-white/20 transition-all duration-300"
            >
              {isDropdownOpen ? <IoChevronUp size={20} /> : <IoChevronDown size={20} />}
            </button>
          </div>
          
          {/* Mobile Dropdown Menu */}
          <div ref={dropdownRef} className="overflow-hidden">
            <div className="mt-4 space-y-2">
              {items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                    activeItem === item.key
                      ? 'bg-purple-500/20 text-purple-200 border border-purple-400/30'
                      : 'bg-white/10 text-white/90 border border-white/20 hover:bg-white/20'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div
          ref={sidebarRef}
          className="fixed right-0 top-0 h-full bg-gradient-to-b from-[#030014] via-[#0A0A2E] to-[#030014] border-l border-white/10 z-40 overflow-hidden"
          style={{ width: "80px" }}
        >
          {/* Luxury Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-10 right-5 w-16 h-16 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full filter blur-xl"></div>
            <div className="absolute bottom-20 left-5 w-20 h-20 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full filter blur-xl"></div>
          </div>

          <div className="relative z-10 h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 hover:bg-white/20 transition-all duration-300"
                >
                  <IoMenu size={20} />
                </button>
                {isOpen && (
                  <h1 className="text-lg font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text">
                    داشبورد {userRole === 'admin' ? 'مدیریت' : userRole}
                  </h1>
                )}
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-luxury">
              {items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                    activeItem === item.key
                      ? 'bg-purple-500/20 text-purple-200 border border-purple-400/30'
                      : 'bg-white/10 text-white/90 border border-white/20 hover:bg-white/20'
                  }`}
                  title={!isOpen ? item.label : undefined}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  {isOpen && (
                    <span className="font-medium whitespace-nowrap overflow-hidden">
                      {item.label}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DynamicSidebar;