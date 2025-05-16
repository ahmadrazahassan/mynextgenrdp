'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Memoized component for better performance
const AnimatedCube = React.memo(() => {
  // Refs to access DOM elements
  const cubeRef = useRef(null);
  const containerRef = useRef(null);
  
  // Check if user prefers reduced motion
  const prefersReducedMotion = useReducedMotion();
  
  // State to track mouse position and animation settings
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isInView, setIsInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check device type
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);
  
  // Handle mouse movement for interactive rotation (throttled for performance)
  const handleMouseMove = useMemo(() => {
    let lastCallTime = 0;
    const throttleTime = 16; // limit to ~60fps
    
    return (e) => {
      const now = Date.now();
      if (now - lastCallTime < throttleTime) return;
      lastCallTime = now;
      
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate normalized mouse position relative to the center
      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);
      
      setMousePosition({ x, y });
    };
  }, []);
  
  // Set up intersection observer to only animate when in viewport
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    
    observer.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);
  
  // Memoized cube faces definition with improved colors
  const faces = useMemo(() => [
    { name: 'front', color: 'rgba(124, 58, 237, 0.85)', transform: 'translateZ(100px)' },   // Vibrant purple
    { name: 'back', color: 'rgba(124, 58, 237, 0.85)', transform: 'rotateY(180deg) translateZ(100px)' },
    { name: 'right', color: 'rgba(16, 185, 129, 0.85)', transform: 'rotateY(90deg) translateZ(100px)' },  // Emerald
    { name: 'left', color: 'rgba(16, 185, 129, 0.85)', transform: 'rotateY(-90deg) translateZ(100px)' },
    { name: 'top', color: 'rgba(37, 99, 235, 0.85)', transform: 'rotateX(90deg) translateZ(100px)' },    // Royal blue
    { name: 'bottom', color: 'rgba(37, 99, 235, 0.85)', transform: 'rotateX(-90deg) translateZ(100px)' },
  ], []);

  // Calculate rotation based on mouse position or use automatic rotation when not interacting
  const rotateX = isInView && !prefersReducedMotion ? (mousePosition.y * 15) : 0;
  const rotateY = isInView && !prefersReducedMotion ? (-mousePosition.x * 15) : 0;
  
  // Number of particles based on device for better performance
  const particleCount = useMemo(() => isMobile ? 8 : 12, [isMobile]);
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-[500px] flex items-center justify-center perspective-[1000px] relative -mt-20" 
      onMouseMove={!prefersReducedMotion ? handleMouseMove : undefined}
      aria-hidden="true"
    >
      {/* Background glow effects - Optimized with will-change */}
      <div className="absolute w-full h-full overflow-hidden">
        {/* Purple glow */}
        <motion.div 
          className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-purple-600/30 blur-3xl -z-10" 
          style={{ 
            x: '-50%', 
            y: '-50%',
            willChange: 'opacity, transform',
          }}
          animate={!prefersReducedMotion ? { 
            opacity: [0.3, 0.6, 0.3],
            scale: [0.8, 1.1, 0.8],
          } : {}}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Green glow */}
        <motion.div 
          className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full bg-emerald-500/30 blur-3xl -z-10" 
          style={{ 
            x: '-50%', 
            y: '-50%',
            willChange: 'opacity, transform',
          }}
          animate={!prefersReducedMotion ? { 
            opacity: [0.3, 0.5, 0.3],
            scale: [1.1, 0.9, 1.1],
          } : {}}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Blue glow */}
        <motion.div 
          className="absolute top-1/2 left-1/2 w-56 h-56 rounded-full bg-blue-600/30 blur-3xl -z-10" 
          style={{ 
            x: '-50%', 
            y: '-50%',
            willChange: 'opacity, transform',
          }}
          animate={!prefersReducedMotion ? { 
            opacity: [0.3, 0.5, 0.3],
            scale: [0.9, 1.2, 0.9],
          } : {}}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Grid pattern - Optimized with opacity conditions */}
      {!isMobile && (
        <div className="absolute inset-0 opacity-5" 
          style={{ 
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), 
              linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />
      )}
      
      {/* Cube wrapper with optimized animations */}
      <motion.div 
        className="preserve-3d"
        animate={isInView && !prefersReducedMotion ? {
          rotateX: [0, 360],
          rotateY: [0, 360],
        } : {}}
        transition={{ 
          duration: 20,
          ease: "linear",
          repeat: Infinity,
        }}
        style={{ 
          rotateX: rotateX, 
          rotateY: rotateY,
          willChange: 'transform',
          marginTop: "-60px",
        }}
      >
        {/* Actual 3D cube */}
        <div 
          ref={cubeRef}
          className="relative w-[220px] h-[220px] transform-style-3d"
          style={{ willChange: 'transform' }}
        >
          {/* Enhanced cube glow effect */}
          <div 
            className="absolute w-[220px] h-[220px] rounded-[14px] opacity-20"
            style={{
              boxShadow: "0 0 40px 5px rgba(124, 58, 237, 0.6), 0 0 30px 10px rgba(16, 185, 129, 0.4), 0 0 20px 15px rgba(37, 99, 235, 0.4)",
              transform: "translateZ(0px)",
            }}
          />

          {/* Render each face of the cube with optimized corner effects */}
          {faces.map((face, index) => (
            <div
              key={face.name}
              className="absolute w-full h-full border border-white/30 backdrop-blur-sm"
              style={{
                transform: face.transform,
                backgroundColor: face.color,
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d',
                borderRadius: "14px", // More perfect corner radius
                boxShadow: "0 0 30px rgba(255, 255, 255, 0.15) inset",
                willChange: 'transform',
                overflow: 'hidden',
              }}
            >
              {/* Enhanced corner effects - perfect corners */}
              <div className="absolute inset-0 rounded-[14px] overflow-hidden">
                {/* Corner highlight - top left */}
                <div className="absolute -top-1 -left-1 w-12 h-12 rounded-br-3xl bg-white/10" />
                
                {/* Corner highlight - bottom right */}
                <div className="absolute -bottom-1 -right-1 w-12 h-12 rounded-tl-3xl bg-white/10" />
                
                {/* Edge glow - optimized for better appearance */}
                <div 
                  className="absolute inset-0 rounded-[14px] opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${face.color.replace('0.85', '1')} 0%, transparent 60%)`,
                    boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.2)",
                  }}
                />
              </div>

              {/* Content for each face - optimized with lighter elements */}
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-white">
                {/* Display logo on front face */}
                {face.name === 'front' && (
                  <>
                    <div 
                      className="text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 pb-1"
                      style={{ textShadow: "0 0 15px rgba(255, 255, 255, 0.3)" }}
                    >
                      NameGenRDP
                    </div>
                    <div className="mt-2 text-sm opacity-80 font-medium">Premium Services</div>
                  </>
                )}
                
                {/* Display website name on back face */}
                {face.name === 'back' && (
                  <>
                    <div 
                      className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-b from-white to-purple-200"
                      style={{ textShadow: "0 0 15px rgba(255, 255, 255, 0.3)" }}
                    >
                      RDP & VPS
                    </div>
                    <div className="mt-2 text-sm opacity-80 font-medium">Solutions</div>
                  </>
                )}
                
                {/* Icon faces with optimized SVGs */}
                {face.name !== 'front' && face.name !== 'back' && (
                  <div className="flex flex-col items-center">
                    {face.name === 'right' && (
                      <>
                        <svg 
                          width="44" 
                          height="44" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-white"
                        >
                          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="mt-3 text-sm font-medium">High Performance</div>
                      </>
                    )}
                    
                    {face.name === 'left' && (
                      <>
                        <svg 
                          width="44" 
                          height="44" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-white"
                        >
                          <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="mt-3 text-sm font-medium">Advanced Security</div>
                      </>
                    )}
                    
                    {face.name === 'top' && (
                      <>
                        <svg 
                          width="44" 
                          height="44" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-white"
                        >
                          <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M12 3C7.03 3 3 7.03 3 12H5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M21 12C21 7.03 16.97 3 12 3V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <div className="mt-3 text-sm font-medium">Ultra-Fast Speed</div>
                      </>
                    )}
                    
                    {face.name === 'bottom' && (
                      <>
                        <svg 
                          width="44" 
                          height="44" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-white"
                        >
                          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                          <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                        <div className="mt-3 text-sm font-medium">Easy Scalability</div>
                      </>
                    )}
                  </div>
                )}
                
                {/* Subtle glow effect on text content */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0" style={{ 
                    background: `radial-gradient(circle at center, ${face.color.replace('0.85', '0.95')} 0%, ${face.color} 80%)`,
                    mixBlendMode: 'overlay',
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Enhanced reflective surface below */}
        <div 
          className="mt-28 w-[220px] h-[15px] rounded-full blur-md transform -rotate-x-60"
          style={{ 
            background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent)',
            willChange: 'opacity',
          }}
        />
      </motion.div>
      
      {/* Optimized orbiting particles - render conditionally based on device capabilities */}
      {!prefersReducedMotion && Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const radius = 180;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        const colors = ['#a855f7', '#10b981', '#3b82f6']; // Purple, emerald, blue
        const color = colors[i % 3];
        
        // Optimize particle rendering with memoized properties
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: '4px',
              height: '4px',
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}`,
              left: '50%',
              top: '50%',
              marginTop: "-60px",
              willChange: 'transform, opacity',
            }}
            animate={{
              x: [x * 0.8, x, x * 0.8],
              y: [y * 0.8, y, y * 0.8],
              opacity: [0.4, 0.8, 0.4],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
      
      {/* Add necessary CSS for 3D transforms */}
      <style jsx global>{`
        .preserve-3d {
          transform-style: preserve-3d;
          will-change: transform;
        }
        
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .-rotate-x-60 {
          transform: rotateX(-60deg);
        }
      `}</style>
    </div>
  );
});

// Add display name for better debugging
AnimatedCube.displayName = 'AnimatedCube';

export default AnimatedCube; 