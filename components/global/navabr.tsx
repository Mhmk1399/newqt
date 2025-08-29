"use client";
import { useState, useEffect, useRef } from "react";
import {
  FaHome,
  FaImages,
  FaUserAlt,
  FaEnvelope,
  FaShareAlt,
  FaBars,
  FaTimes,
  FaSignInAlt,
  FaTachometerAlt,
} from "react-icons/fa";
import SocialModal from "./SocialModal";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";

const baseMenuItems = [
  {
    icon: FaHome,
    title: "خانه",
    color: "#4ade80",
    href: "/",
    target: "_self",
  },
  {
    icon: FaImages,
    title: "گالری",
    color: "#60a5fa",
    href: "/works",
    target: "_self",
  },
  {
    icon: FaUserAlt,
    title: "درباره ما",
    color: "#f472b6",
    href: "/about",
    target: "_self",
  },
  {
    icon: FaEnvelope,
    title: "تماس",
    color: "#a78bfa",
    href: "/contact",
    target: "_self",
  },
  {
    icon: FaShareAlt,
    title: "اشتراک گذاری",
    color: "#34d399",
    href: "#",
    hasSocials: true,
    target: "_self",
  },
];

const authMenuItems = {
  login: {
    icon: FaSignInAlt,
    title: "ورود",
    color: "#fbbf24",
    href: "/auth",
    target: "_blank",
  },
  dashboard: {
    icon: FaTachometerAlt,
    title: "داشبورد",
    color: "#10b981",
    href: "/dashboard",
    target: "_blank",
  },
};

const Navbar = () => {
  const pathname = usePathname();
  const shareButtonRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [activeItem, setActiveItem] = useState(0);
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [menuItems, setMenuItems] = useState(baseMenuItems);

  const [modalPosition, setModalPosition] = useState<{
    top: number;
    left?: number;
    right?: number;
  }>({ top: 0 });

  // Check for token in localStorage
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const tokenExists = !!token;
    setHasToken(tokenExists);

    const authItem = hasToken
      ? authMenuItems.dashboard
      : authMenuItems.login;
    setMenuItems([...baseMenuItems, authItem]);
  }, [hasToken]);

  // GSAP animations setup
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial navbar animation
      if (isDesktop && toggleButtonRef.current) {
        gsap.fromTo(
          toggleButtonRef.current,
          { opacity: 0, y: -20, scale: 0.8 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
        );
      }

      if (!isDesktop && mobileNavRef.current) {
        gsap.fromTo(
          mobileNavRef.current,
          { opacity: 0, y: 50, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
        );
      }
    });

    return () => ctx.revert();
  }, [isDesktop]);

  // Handle scroll effect with GSAP
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;

      if (toggleButtonRef.current) {
        gsap.to(toggleButtonRef.current, {
          scale: scrolled ? 0.9 : 1,
          backgroundColor: scrolled
            ? "rgba(17, 24, 39, 0.95)"
            : "rgba(17, 24, 39, 0.8)",
          duration: 0.3,
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle share button click
  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (shareButtonRef.current) {
      const rect = shareButtonRef.current.getBoundingClientRect();

      if (isDesktop) {
        // Position modal in the center of the page on desktop
        setModalPosition({
          top: window.innerHeight / 2 - 200, // Center vertically (200px is approximately half the modal height)
          left: window.innerWidth / 2 - 150, // Center horizontally (300px modal width / 2 = 150px)
        });
      } else {
        // Position modal above the share button on mobile
        setModalPosition({
          top: rect.top - 350, // Position above with some spacing
          left: window.innerWidth / 2 - 150, // Center horizontally
        });
      }

      setSocialModalOpen(true);
    }
  };

  if (
    pathname === "/admin" ||
    pathname === "/customers/admin" ||
    pathname === "/users/admin" ||
    pathname === "/dashboard"
  ) {
    return null;
  }

  // Handle menu toggle with GSAP
  const handleMenuToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (toggleButtonRef.current) {
      gsap.to(toggleButtonRef.current, {
        rotation: newIsOpen ? 180 : 0,
        scale: newIsOpen ? 1.1 : 1,
        duration: 0.3,
        ease: "back.out(1.7)",
      });
    }

    if (newIsOpen && navRef.current) {
      gsap.fromTo(
        navRef.current,
        { opacity: 0, y: -20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
      );

      menuItemsRef.current.forEach((item, index) => {
        if (item) {
          gsap.fromTo(
            item,
            { opacity: 0, x: -30 },
            {
              opacity: 1,
              x: 0,
              duration: 0.3,
              delay: index * 0.05,
              ease: "power2.out",
            }
          );
        }
      });
    } else if (navRef.current) {
      gsap.to(navRef.current, {
        opacity: 0,
        y: -20,
        scale: 0.9,
        duration: 0.2,
        ease: "power2.in",
      });
    }
  };

  // Desktop Navbar Component
  const DesktopNav = () => {
    return (
      <div className="fixed left-10 top-10 z-40">
        <div className="relative">
          <button
            ref={toggleButtonRef}
            onClick={handleMenuToggle}
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all duration-300 hover:bg-white/20 group"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
              boxShadow:
                "0 10px 25px -5px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
            onMouseEnter={() => {
              if (toggleButtonRef.current) {
                gsap.to(toggleButtonRef.current, {
                  scale: 1.05,
                  duration: 0.2,
                });
              }
            }}
            onMouseLeave={() => {
              if (toggleButtonRef.current) {
                gsap.to(toggleButtonRef.current, { scale: 1, duration: 0.2 });
              }
            }}
          >
            {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>

          {isOpen && (
            <div
              ref={navRef}
              className="absolute top-20 left-0 min-w-[260px] rounded-3xl overflow-hidden border border-white/20"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                backdropFilter: "blur(25px)",
                boxShadow:
                  "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
              }}
            >
              <div className="" dir="rtl">
                {menuItems.map((item, index) => (
                  <div
                    key={index}
                    ref={(el) => {
                      menuItemsRef.current[index] = el;
                    }}
                    className="relative"
                  >
                    <Link
                      href={item.href}
                      target={item.target}
                      className="flex items-center gap-4 px-6 py-4 text-white/80 hover:text-white relative group transition-all duration-300"
                      onClick={(e) => {
                        if (item.hasSocials) {
                          handleShareClick(e);
                        } else {
                          setActiveItem(index);
                        }
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => {
                        setHoveredItem(index);
                        const el = menuItemsRef.current[index];
                        if (el) {
                          gsap.to(el, { x: 5, duration: 0.2 });
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredItem(null);
                        const el = menuItemsRef.current[index];
                        if (el) {
                          gsap.to(el, { x: 0, duration: 0.2 });
                        }
                      }}
                    >
                      {/* Active/Hover background */}
                      {(activeItem === index || hoveredItem === index) && (
                        <div
                          className="absolute inset-0 rounded-xl transition-all duration-300"
                          style={{
                            background: `linear-gradient(90deg, ${item.color}20, transparent)`,
                            border: `1px solid ${item.color}30`,
                          }}
                        />
                      )}

                      {/* Icon */}
                      <div
                        className="relative z-10 flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 group-hover:scale-110"
                        ref={item.hasSocials ? shareButtonRef : null}
                        style={{
                          backgroundColor:
                            activeItem === index
                              ? `${item.color}30`
                              : undefined,
                        }}
                      >
                        <item.icon size={18} color={item.color} />
                      </div>

                      {/* Title */}
                      <span className="relative z-10 font-medium text-lg">
                        {item.title}
                      </span>

                      {/* Active indicator */}
                      {activeItem === index && (
                        <div
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      )}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <SocialModal
          isOpen={socialModalOpen}
          onClose={() => setSocialModalOpen(false)}
          modalPosition={modalPosition}
        />
      </div>
    );
  };

  // Mobile Navbar Component
  const MobileNav = () => {
    return (
      <div className="fixed bottom-2 left-0 right-0 z-40 px-4">
        <div className="relative">
          <div
            ref={mobileNavRef}
            className="flex items-center justify-center p-1 rounded-3xl border border-white/20"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
              backdropFilter: "blur(25px)",
              boxShadow:
                "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            <div className="flex items-center justify-between w-full max-w-xs mx-auto">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  target={item.target}
                  className="relative flex flex-col items-center p-0.5 rounded-2xl transition-all duration-300"
                  onClick={(e) => {
                    if (item.hasSocials) {
                      handleShareClick(e);
                    } else {
                      setActiveItem(index);
                    }
                  }}
                  onTouchStart={() => {
                    gsap.to(`.mobile-item-${index}`, {
                      scale: 1,
                      duration: 0.1,
                    });
                  }}
                  onTouchEnd={() => {
                    gsap.to(`.mobile-item-${index}`, {
                      scale: 1,
                      duration: 0.1,
                    });
                  }}
                >
                  <div
                    className={`mobile-item-${index} flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                      activeItem === index ? "bg-white/20" : "bg-white/5"
                    }`}
                    ref={item.hasSocials ? shareButtonRef : null}
                    style={{
                      backgroundColor:
                        activeItem === index ? `${item.color}30` : undefined,
                      border:
                        activeItem === index
                          ? `1px solid ${item.color}50`
                          : "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <item.icon
                      size={20}
                      color={activeItem === index ? item.color : "#9CA3AF"}
                    />
                  </div>

                  {/* Active indicator */}
                  {activeItem === index && (
                    <div
                      className="w-[3px] h-[3px] rounded-full absolute bottom-0 transition-all duration-300"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          <SocialModal
            isOpen={socialModalOpen}
            onClose={() => setSocialModalOpen(false)}
            modalPosition={modalPosition}
          />
        </div>
      </div>
    );
  };

  return isDesktop ? <DesktopNav /> : <MobileNav />;
};

export default Navbar;
