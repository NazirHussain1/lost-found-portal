"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  FaSearch,
  FaPlusCircle,
  FaTh,
  FaUserCircle,
  FaSignInAlt,
  FaUserPlus,
  FaCog,
  FaSignOutAlt,
  FaHome,
  FaBars,
  FaTimes
} from 'react-icons/fa';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  
  const pathname = usePathname();
  const mobileMenuRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const hamburgerButtonRef = useRef(null);
  const profileButtonRef = useRef(null);

  // Navigation links configuration
  const navLinks = [
    { href: "/", label: "Home", icon: FaHome },
    { href: "/lost", label: "Lost", icon: FaSearch },
    { href: "/found", label: "Found", icon: FaPlusCircle },
    { href: "/browse", label: "Browse", icon: FaTh },
  ];

  // Check if current path is active
  const isActiveLink = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => {
      const newState = !prev;
      if (newState && isProfileDropdownOpen) {
        setIsProfileDropdownOpen(false);
      }
      return newState;
    });
  };

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(prev => {
      const newState = !prev;
      if (newState && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
      return newState;
    });
  };

  // Close all menus
  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  // Handle link click
  const handleLinkClick = () => {
    closeAllMenus();
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      setUser(null);
      closeAllMenus();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event, action) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    } else if (event.key === "Escape") {
      closeAllMenus();
    }
  };

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close mobile menu if clicked outside
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !hamburgerButtonRef.current?.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }

      // Close profile dropdown if clicked outside
      if (
        isProfileDropdownOpen &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        !profileButtonRef.current?.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen, isProfileDropdownOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Navbar */}
      <nav 
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
          ${scrolled 
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 backdrop-blur-md border-b border-white/10 shadow-lg' 
            : 'bg-gradient-to-r from-indigo-600 to-purple-600'
          }
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link 
              href="/" 
              onClick={handleLinkClick}
              className="flex items-center space-x-2 group"
              aria-label="Lost & Found Portal - Home"
            >
              <img
                src="/images/lost and found logo.png"
                alt="Lost & Found Portal Logo"
                className="w-10 h-7 sm:w-12 sm:h-8 transition-transform duration-200 group-hover:scale-105 drop-shadow-md"
              />
            </Link>

            {/* Desktop Navigation */}
            <ul className="hidden lg:flex items-center space-x-1" role="menubar">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = isActiveLink(link.href);
                
                return (
                  <li key={link.href} role="none">
                    <Link
                      href={link.href}
                      onClick={handleLinkClick}
                      role="menuitem"
                      aria-current={isActive ? "page" : undefined}
                      className={`
                        flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
                        transition-all duration-200 ease-in-out relative group
                        ${isActive 
                          ? 'text-white bg-white/20 shadow-sm' 
                          : 'text-white/90 hover:text-white hover:bg-white/10'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      <span>{link.label}</span>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-white rounded-full" aria-hidden="true" />
                      )}
                      
                      {/* Hover indicator */}
                      {!isActive && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white rounded-full transition-all duration-200 group-hover:w-6" aria-hidden="true" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Desktop Profile & Mobile Controls */}
            <div className="flex items-center space-x-2">
              
              {/* Desktop Profile Dropdown */}
              <div className="hidden lg:block relative">
                <button
                  ref={profileButtonRef}
                  id="profile-button"
                  onClick={toggleProfileDropdown}
                  onKeyDown={(e) => handleKeyDown(e, toggleProfileDropdown)}
                  aria-expanded={isProfileDropdownOpen}
                  aria-controls="profile-dropdown"
                  aria-haspopup="menu"
                  aria-label="User account menu"
                  className={`
                    flex items-center space-x-2 p-2 rounded-lg transition-all duration-200
                    ${isProfileDropdownOpen 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  <FaUserCircle className="w-6 h-6" aria-hidden="true" />
                </button>

                {/* Desktop Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div
                    ref={profileDropdownRef}
                    id="profile-dropdown"
                    role="menu"
                    aria-labelledby="profile-button"
                    className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    {user ? (
                      <>
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                              <FaUserCircle className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {user.name || "User"}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          <Link
                            href="/userProfile"
                            onClick={handleLinkClick}
                            role="menuitem"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <FaUserCircle className="w-4 h-4 mr-3 text-gray-400" aria-hidden="true" />
                            <div>
                              <div className="font-medium">My Profile</div>
                              <div className="text-xs text-gray-500">View your profile</div>
                            </div>
                          </Link>
                          
                          <Link
                            href="/myItems"
                            onClick={handleLinkClick}
                            role="menuitem"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <FaTh className="w-4 h-4 mr-3 text-gray-400" aria-hidden="true" />
                            <div>
                              <div className="font-medium">My Items</div>
                              <div className="text-xs text-gray-500">Manage your reports</div>
                            </div>
                          </Link>

                          <hr className="my-1 border-gray-100" role="separator" />
                          
                          <button
                            onClick={handleLogout}
                            role="menuitem"
                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                          >
                            <FaSignOutAlt className="w-4 h-4 mr-3" aria-hidden="true" />
                            <div>
                              <div className="font-medium">Logout</div>
                              <div className="text-xs text-red-500">Sign out of account</div>
                            </div>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="px-4 py-6">
                        <div className="text-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FaUserCircle className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-1">Welcome!</h3>
                          <p className="text-xs text-gray-500">Sign in to access all features</p>
                        </div>
                        <div className="space-y-2">
                          <Link
                            href="/loginPage"
                            onClick={handleLinkClick}
                            role="menuitem"
                            className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-150"
                          >
                            <FaSignInAlt className="w-4 h-4 mr-2" aria-hidden="true" />
                            Login
                          </Link>
                          <Link
                            href="/signup"
                            onClick={handleLinkClick}
                            role="menuitem"
                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-150"
                          >
                            <FaUserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
                            Register
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Profile Button */}
              <button
                onClick={toggleProfileDropdown}
                onKeyDown={(e) => handleKeyDown(e, toggleProfileDropdown)}
                aria-expanded={isProfileDropdownOpen}
                aria-controls="mobile-profile-menu"
                aria-haspopup="menu"
                aria-label="User account menu"
                className={`
                  lg:hidden p-2 rounded-lg transition-all duration-200
                  ${isProfileDropdownOpen 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <FaUserCircle className="w-5 h-5" aria-hidden="true" />
              </button>

              {/* Mobile Menu Button */}
              <button
                ref={hamburgerButtonRef}
                onClick={toggleMobileMenu}
                onKeyDown={(e) => handleKeyDown(e, toggleMobileMenu)}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-haspopup="menu"
                aria-label="Toggle navigation menu"
                className={`
                  lg:hidden p-2 rounded-lg transition-all duration-200
                  ${isMobileMenuOpen 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                {isMobileMenuOpen ? (
                  <FaTimes className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <FaBars className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            id="mobile-menu"
            role="menu"
            aria-labelledby="mobile-menu-button"
            className="lg:hidden bg-white border-t border-gray-200 shadow-lg animate-in slide-in-from-top duration-200"
          >
            <ul className="px-4 py-3 space-y-1" role="none">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = isActiveLink(link.href);
                
                return (
                  <li key={link.href} role="none">
                    <Link
                      href={link.href}
                      onClick={handleLinkClick}
                      role="menuitem"
                      aria-current={isActive ? "page" : undefined}
                      className={`
                        flex items-center space-x-3 px-4 py-4 rounded-lg text-sm font-medium transition-colors duration-150
                        ${isActive 
                          ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} aria-hidden="true" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Mobile Profile Menu */}
        {isProfileDropdownOpen && (
          <div
            id="mobile-profile-menu"
            className="lg:hidden bg-white border-t border-gray-200 shadow-lg animate-in slide-in-from-top duration-200"
          >
            {user ? (
              <>
                {/* User Info */}
                <div className="px-4 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <FaUserCircle className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {user.name || "User"}
                      </p>
                      <p className="text-xs text-white/80 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="px-4 py-3 space-y-1">
                  <Link
                    href="/userProfile"
                    onClick={handleLinkClick}
                    className="flex items-center space-x-3 px-4 py-4 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <FaUserCircle className="w-5 h-5 text-gray-400" />
                    <div>
                      <div>My Profile</div>
                      <div className="text-xs text-gray-500">Personal information</div>
                    </div>
                  </Link>
                  
                  <Link
                    href="/myItems"
                    onClick={handleLinkClick}
                    className="flex items-center space-x-3 px-4 py-4 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <FaTh className="w-5 h-5 text-gray-400" />
                    <div>
                      <div>My Items</div>
                      <div className="text-xs text-gray-500">Manage your reports</div>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-4 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    <FaSignOutAlt className="w-5 h-5" />
                    <div className="text-left">
                      <div>Logout</div>
                      <div className="text-xs text-red-500">Sign out of account</div>
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4 py-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaUserCircle className="w-9 h-9 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Welcome!</h3>
                  <p className="text-sm text-gray-500">Sign in to access all features</p>
                </div>
                <div className="space-y-3">
                  <Link
                    href="/loginPage"
                    onClick={handleLinkClick}
                    className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-150"
                  >
                    <FaSignInAlt className="w-4 h-4 mr-2" />
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={handleLinkClick}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-150"
                  >
                    <FaUserPlus className="w-4 h-4 mr-2" />
                    Register
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Spacer to prevent content overlap */}
      <div className="h-16" />
    </>
  );
}