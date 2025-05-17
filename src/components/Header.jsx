// src/components/Header.jsx
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { ArrowRightCircleIcon, ServerIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

// Professional brand logo component
const MemoizedLogo = React.memo(({ scrolled }) => {
  return (
    <Link href="/" className="flex items-center group" aria-label="NextGen Enterprise Solutions Home">
      <motion.div 
        className="flex items-center"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        <div className="relative h-12 w-12 mr-3">
          {/* Logo mark - clean geometric shape with server/tech indicators */}
          <div className="relative h-full w-full flex items-center justify-center">
            {/* Advanced professional logo */}
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" aria-hidden="true">
              {/* Hexagon base with beveled edges */}
              <path 
                d="M20 2L35.3205 11V29L20 38L4.67949 29V11L20 2Z" 
                fill="url(#logo-gradient)"
                className="drop-shadow-lg"
              />
              
              {/* Inner hexagon for layered effect */}
              <path 
                d="M20 7L30.3205 13V25L20 31L9.67949 25V13L20 7Z" 
                fill="url(#inner-gradient)"
                opacity="0.7"
              />
              
              {/* Tech circuit lines */}
              <path 
                d="M12 14H28M12 20H28M12 26H28" 
                stroke="white" 
                strokeWidth="1.25" 
                strokeLinecap="round"
              />
              
              {/* Diagonal connection lines */}
              <path 
                d="M15 12L25 28M25 12L15 28" 
                stroke="rgba(255,255,255,0.5)" 
                strokeWidth="0.75" 
                strokeLinecap="round"
                strokeDasharray="1 2"
              />
              
              {/* Center node */}
              <circle cx="20" cy="20" r="2.5" fill="white" opacity="0.9" />
              <circle cx="20" cy="20" r="1.5" fill="#4ADE80" />
              
              {/* Status nodes with professional glow */}
              <circle cx="9" cy="14" r="1.75" fill="#4ADE80" />
              <circle cx="9" cy="14" r="2.5" stroke="#4ADE80" strokeWidth="0.5" strokeOpacity="0.3" />
              
              <circle cx="9" cy="20" r="1.75" fill="#3B82F6" />
              <circle cx="9" cy="20" r="2.5" stroke="#3B82F6" strokeWidth="0.5" strokeOpacity="0.3" />
              
              <circle cx="9" cy="26" r="1.75" fill="#A855F7" />
              <circle cx="9" cy="26" r="2.5" stroke="#A855F7" strokeWidth="0.5" strokeOpacity="0.3" />
              
              {/* Tech connector dots */}
              <circle cx="31" cy="14" r="1" fill="white" opacity="0.8" />
              <circle cx="31" cy="20" r="1" fill="white" opacity="0.8" />
              <circle cx="31" cy="26" r="1" fill="white" opacity="0.8" />
              
              {/* Digital corner accents */}
              <path d="M5 11L8 11L8 14" stroke="white" strokeWidth="0.75" strokeOpacity="0.6" fill="none" />
              <path d="M35 11L32 11L32 14" stroke="white" strokeWidth="0.75" strokeOpacity="0.6" fill="none" />
              <path d="M5 29L8 29L8 26" stroke="white" strokeWidth="0.75" strokeOpacity="0.6" fill="none" />
              <path d="M35 29L32 29L32 26" stroke="white" strokeWidth="0.75" strokeOpacity="0.6" fill="none" />
              
              {/* Enhanced gradients */}
              <defs>
                <linearGradient id="logo-gradient" x1="4.67949" y1="2" x2="35.3205" y2="38" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#4F46E5" />
                  <stop offset="0.3" stopColor="#6366F1" />
                  <stop offset="0.7" stopColor="#8B5CF6" />
                  <stop offset="1" stopColor="#7C3AED" />
                </linearGradient>
                <linearGradient id="inner-gradient" x1="9.67949" y1="7" x2="30.3205" y2="31" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#818CF8" />
                  <stop offset="1" stopColor="#4F46E5" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
            </svg>
          </div>
        </div>
        <div>
          <span className="font-sans text-2xl font-extrabold bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent block tracking-tight leading-none group-hover:from-violet-500 group-hover:to-indigo-500 transition-all duration-300">
            NextGenRDP
          </span>
          <span className="text-xs text-gray-700 font-semibold tracking-wide">ENTERPRISE SOLUTIONS</span>
        </div>
      </motion.div>
    </Link>
  );
});
MemoizedLogo.displayName = 'MemoizedLogo';

// Memoized navigation link with rounded styles
const NavLink = React.memo(({ href, isActive, children }) => {
  const navItemHover = { 
    hover: { 
      color: '#6d28d9', // purple-700
      transition: { duration: 0.2 }
    } 
  };

  const navLinkBase = "relative px-4 py-2.5 text-sm font-medium transition-colors duration-200 ease-in-out rounded-full group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2";
  const linkClass = `${navLinkBase} ${isActive 
    ? 'text-white bg-gradient-to-r from-violet-600 to-purple-600 shadow-md' 
    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`;
  
  return (
    <motion.div variants={navItemHover} whileHover="hover" className="mx-1">
      <Link href={href} className={linkClass}>
        {children}
        {isActive && <span className="absolute inset-0 rounded-full bg-purple-600/10 animate-pulse"></span>}
      </Link>
    </motion.div>
  );
});
NavLink.displayName = 'NavLink';

// Memoized action button
const ActionButton = React.memo(({ href, variant, onClick, children }) => {
  // Optimized button animations
  const buttonVariants = {
    hover: { 
      scale: 1.03, 
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  // Button styles - pre-computed for efficiency
  const loginButtonClasses = "relative z-10 inline-flex items-center justify-center gap-x-1.5 px-5 py-2.5 rounded-full text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-md hover:shadow-lg transition-all duration-200 ease-in-out group";
  
  const registerButtonClasses = "relative z-10 inline-flex items-center justify-center gap-x-1.5 px-5 py-2.5 rounded-full text-sm font-medium text-purple-900 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 border border-purple-300 shadow-md hover:shadow-lg transition-all duration-200 ease-in-out group";
  
  const buttonClass = variant === 'primary' ? loginButtonClasses : registerButtonClasses;
  
  return (
    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
      <Link href={href} className={buttonClass} onClick={onClick}>
        {children}
        {variant === 'primary' && (
          <span className="absolute inset-0 rounded-full bg-indigo-600/20 blur-[1px] opacity-70"></span>
        )}
      </Link>
    </motion.div>
  );
});
ActionButton.displayName = 'ActionButton';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  
  // Memoized toggle function
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);
  
  // Optimized scroll handler with throttling
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Header class based on scroll state - memoized
  const headerClass = useMemo(() => {
    return `sticky top-0 z-50 w-full backdrop-blur-md border-b transition-all duration-300 font-sans ${
      scrolled ? 'bg-white shadow-lg border-purple-200' : 'bg-white/95 shadow-md border-indigo-100'
    }`;
  }, [scrolled]);

  // Only show the header on the homepage
  if (pathname !== '/') {
    return null;
  }

  return (
    <header className={headerClass} role="banner">
      <div className="h-[3px] bg-gradient-to-r from-purple-500 via-indigo-500 to-violet-500" />
      
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20" aria-label="Main navigation">
        {/* Logo - Memoized component */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.3 }}
        >
          <MemoizedLogo scrolled={scrolled} />
        </motion.div>
        
        {/* Desktop Menu with optimized links */}
        <div className="hidden md:flex md:items-center md:space-x-2 lg:space-x-3">
          <NavLink href="/" isActive={pathname === '/'}>Home</NavLink>
          <NavLink href="/vps" isActive={pathname === '/vps'}>VPS Solutions</NavLink>
          <NavLink href="/rdp" isActive={pathname === '/rdp'}>RDP Solutions</NavLink>
          <NavLink href="/pricing" isActive={pathname === '/pricing'}>Pricing</NavLink>
          <NavLink href="/support" isActive={pathname === '/support'}>Support</NavLink>
        </div>
        
        {/* Action Buttons - Optimized */}
        <motion.div
          initial={{ opacity: 0, x: 10 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.3 }}
            className="hidden md:flex md:items-center md:space-x-3"
        >
          <ActionButton href="/register" variant="secondary">
            <UserPlusIcon className="h-5 w-5 mr-1.5" /> Register
          </ActionButton>
          
          <ActionButton href="/login" variant="primary">
            Client Portal <ArrowRightCircleIcon className="h-5 w-5 ml-1.5" />
          </ActionButton>
        </motion.div>
        
        {/* Mobile Menu Button - Simplified animations */}
        <div className="md:hidden flex items-center">
          <motion.button 
            onClick={toggleMobileMenu} 
            className="p-2.5 text-gray-700 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full transition-colors duration-200 bg-gray-100/80 hover:bg-gray-200/80" 
            aria-controls="mobile-menu" 
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div 
                key={isMobileMenuOpen ? 'close' : 'open'} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                transition={{ duration: 0.15 }}
              >
                    {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6"/> : <Bars3Icon className="h-6 w-6"/>}
                  </motion.div>
               </AnimatePresence>
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu - Performance optimized */}
      <AnimatePresence initial={false}>
        {isMobileMenuOpen && (
          <motion.div 
            key="mobile-menu" 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }} 
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden absolute top-full left-0 w-full bg-white backdrop-blur-md shadow-lg border-t border-purple-200 overflow-hidden z-50"
            id="mobile-menu"
          >
            <nav className="px-6 py-5 space-y-3 relative" aria-label="Mobile menu">
              {/* Mobile Nav Links - Updated with rounded styles */}
              <Link href="/" className={`block relative px-4 py-3 text-sm font-medium rounded-full ${pathname === '/' ? 'text-white bg-gradient-to-r from-violet-600 to-purple-600 shadow-md' : 'text-gray-700 hover:bg-gray-100'}`} onClick={toggleMobileMenu}>Home</Link>
              <Link href="/vps" className={`block relative px-4 py-3 text-sm font-medium rounded-full ${pathname === '/vps' ? 'text-white bg-gradient-to-r from-violet-600 to-purple-600 shadow-md' : 'text-gray-700 hover:bg-gray-100'}`} onClick={toggleMobileMenu}>VPS Solutions</Link>
              <Link href="/rdp" className={`block relative px-4 py-3 text-sm font-medium rounded-full ${pathname === '/rdp' ? 'text-white bg-gradient-to-r from-violet-600 to-purple-600 shadow-md' : 'text-gray-700 hover:bg-gray-100'}`} onClick={toggleMobileMenu}>RDP Solutions</Link>
              <Link href="/pricing" className={`block relative px-4 py-3 text-sm font-medium rounded-full ${pathname === '/pricing' ? 'text-white bg-gradient-to-r from-violet-600 to-purple-600 shadow-md' : 'text-gray-700 hover:bg-gray-100'}`} onClick={toggleMobileMenu}>Pricing</Link>
              <Link href="/support" className={`block relative px-4 py-3 text-sm font-medium rounded-full ${pathname === '/support' ? 'text-white bg-gradient-to-r from-violet-600 to-purple-600 shadow-md' : 'text-gray-700 hover:bg-gray-100'}`} onClick={toggleMobileMenu}>Support</Link>
              
              {/* Mobile Action Buttons - Enhanced visibility */}
              <div className="pt-5 mt-5 border-t border-purple-200 space-y-4">
                <Link 
                  href="/register" 
                  className="relative z-10 inline-flex items-center justify-center w-full gap-x-1.5 px-5 py-3 rounded-full text-sm font-medium text-purple-900 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 border border-purple-300 shadow-md hover:shadow-lg transition-all duration-200 ease-in-out" 
                  onClick={toggleMobileMenu}
                >
                  <UserPlusIcon className="h-5 w-5 mr-1.5" /> Register
                </Link>
                <Link 
                  href="/login" 
                  className="relative z-10 inline-flex items-center justify-center w-full gap-x-1.5 px-5 py-3 rounded-full text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-md hover:shadow-lg transition-all duration-200 ease-in-out" 
                  onClick={toggleMobileMenu}
                >
                  Client Portal <ArrowRightCircleIcon className="h-5 w-5 ml-1.5" />
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
       </AnimatePresence>
    </header>
  );
};

export default React.memo(Header);