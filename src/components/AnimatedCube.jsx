'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, useReducedMotion, useAnimationControls } from 'framer-motion';

// Memoized component for better performance
const AnimatedCube = React.memo(() => {
  // Refs to access DOM elements
  const cubeRef = useRef(null);
  const containerRef = useRef(null);
  
  // Check if user prefers reduced motion
  const prefersReducedMotion = useReducedMotion();
  
  // Animation controls for more precise control
  const cubeControls = useAnimationControls();
  
  // State to track mouse position and animation settings
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isInView, setIsInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  // Check device type
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    
    // Use ResizeObserver for better performance than resize event
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(checkIsMobile);
      resizeObserver.observe(document.body);
      return () => resizeObserver.disconnect();
    } else {
      // Fallback to resize event if ResizeObserver is not supported
      window.addEventListener('resize', checkIsMobile);
      return () => window.removeEventListener('resize', checkIsMobile);
    }
  }, []);
  
  // Handle mouse movement with optimized performance using debounce
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || prefersReducedMotion) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate normalized mouse position relative to the center with smoother values
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    
    // Apply lerp (linear interpolation) for smoother movement
    setMousePosition(prev => ({
      x: prev.x + (x - prev.x) * 0.1,
      y: prev.y + (y - prev.y) * 0.1
    }));
  }, [prefersReducedMotion]);

  // Apply throttle to mouse move handler for better performance
  const throttledMouseMove = useCallback(() => {
    let lastCallTime = 0;
    const throttleTime = 10; // More frequent updates for smoother feel
    
    return (e) => {
      const now = Date.now();
      if (now - lastCallTime < throttleTime) return;
      lastCallTime = now;
      
      handleMouseMove(e);
    };
  }, [handleMouseMove]);
  
  // Run mouse position animation frame
  useEffect(() => {
    if (prefersReducedMotion || !isInView || !isHovering) return;
    
    let animationFrameId;
    
    const updateRotation = () => {
      if (cubeRef.current) {
        // Apply smooth transitions to cube rotation
        const rotateX = isInView ? (mousePosition.y * 15) : 0;
        const rotateY = isInView ? (-mousePosition.x * 15) : 0;
        
        cubeRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
      
      animationFrameId = requestAnimationFrame(updateRotation);
    };
    
    updateRotation();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePosition, isInView, prefersReducedMotion, isHovering]);
  
  // Set up intersection observer to only animate when in viewport
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
          
          // Start/stop animations based on visibility
          if (entry.isIntersecting) {
            cubeControls.start("visible");
          } else {
            cubeControls.start("hidden");
          }
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
  }, [cubeControls]);
  
  // Memoized cube faces definition with improved colors
  const faces = useMemo(() => [
    { name: 'front', color: 'rgba(124, 58, 237, 0.85)', transform: 'translateZ(100px)' },   // Vibrant purple
    { name: 'back', color: 'rgba(124, 58, 237, 0.85)', transform: 'rotateY(180deg) translateZ(100px)' },
    { name: 'right', color: 'rgba(16, 185, 129, 0.85)', transform: 'rotateY(90deg) translateZ(100px)' },  // Emerald
    { name: 'left', color: 'rgba(16, 185, 129, 0.85)', transform: 'rotateY(-90deg) translateZ(100px)' },
    { name: 'top', color: 'rgba(37, 99, 235, 0.85)', transform: 'rotateX(90deg) translateZ(100px)' },    // Royal blue
    { name: 'bottom', color: 'rgba(37, 99, 235, 0.85)', transform: 'rotateX(-90deg) translateZ(100px)' },
  ], []);

  // Advanced animation variants for smoother transitions
  const cubeAnimationVariants = {
    hidden: { 
      rotateX: 0, 
      rotateY: 0,
      scale: 0.95,
      opacity: 0.7,
    },
    visible: {
      rotateX: [0, 360],
      rotateY: [0, 360],
      scale: 1,
      opacity: 1,
      transition: {
        rotateX: { 
          duration: 25, 
          ease: "linear", 
          repeat: Infinity,
          repeatType: "loop"
        },
        rotateY: { 
          duration: 25, 
          ease: "linear", 
          repeat: Infinity,
          repeatType: "loop"
        },
        scale: { 
          duration: 0.8, 
          ease: "easeOut" 
        },
        opacity: { 
          duration: 0.8, 
          ease: "easeOut" 
        }
      }
    },
    hover: {
      scale: 1.03,
      transition: {
        scale: {
          duration: 0.3,
          ease: [0.34, 1.56, 0.64, 1] // Spring-like bounce effect
        }
      }
    }
  };
  
  // Number of particles based on device for better performance
  const particleCount = useMemo(() => isMobile ? 8 : 16, [isMobile]);
  
  // Optimized glow positions
  const glowVariants = {
    hidden: { opacity: 0.2, scale: 0.8 },
    visible: (i) => ({
      opacity: [0.3, 0.6, 0.3],
      scale: [0.8, 1.1, 0.8],
      transition: {
        duration: 8 + i,
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.5
      }
    })
  };
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-[500px] flex items-center justify-center perspective-[1200px] relative -mt-20" 
      onMouseMove={throttledMouseMove()}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-hidden="true"
    >
      {/* Background glow effects - Optimized with will-change */}
      <div className="absolute w-full h-full overflow-hidden pointer-events-none">
        {/* Purple glow */}
        <motion.div 
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={glowVariants}
          custom={0}
          className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-purple-600/30 blur-3xl -z-10" 
          style={{ 
            x: '-50%', 
            y: '-50%',
            willChange: 'transform, opacity',
          }}
        />
        
        {/* Green glow */}
        <motion.div 
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={glowVariants}
          custom={1}
          className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full bg-emerald-500/30 blur-3xl -z-10" 
          style={{ 
            x: '-50%', 
            y: '-50%',
            willChange: 'transform, opacity',
          }}
        />
        
        {/* Blue glow */}
        <motion.div 
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={glowVariants}
          custom={2}
          className="absolute top-1/2 left-1/2 w-56 h-56 rounded-full bg-blue-600/30 blur-3xl -z-10" 
          style={{ 
            x: '-50%', 
            y: '-50%',
            willChange: 'transform, opacity',
          }}
        />
      </div>
      
      {/* Grid pattern - Optimized with opacity conditions */}
      {!isMobile && (
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
          style={{ 
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), 
              linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            transform: 'translateZ(0)', // hardware acceleration
          }}
        />
      )}
      
      {/* Cube wrapper with optimized animations */}
      <motion.div 
        className="preserve-3d"
        initial="hidden"
        animate={cubeControls}
        whileHover="hover"
        variants={cubeAnimationVariants}
        style={{ 
          willChange: 'transform',
          marginTop: "-60px",
        }}
      >
        {/* Actual 3D cube */}
        <motion.div 
          ref={cubeRef}
          className="relative w-[220px] h-[220px] transform-style-3d"
          style={{ 
            willChange: 'transform',
            transformOrigin: 'center center',
            transition: 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          }}
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
            <motion.div
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
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
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
                
                {/* Additional light refraction effect */}
                <div 
                  className="absolute inset-0 opacity-30" 
                  style={{
                    background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 70%)`,
                  }}
                />
              </div>

              {/* Content for each face - optimized with lighter elements */}
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-white">
                {/* Display logo on front face */}
                {face.name === 'front' && (
                  <>
                    <motion.div 
                      className="text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 pb-1"
                      style={{ textShadow: "0 0 15px rgba(255, 255, 255, 0.3)" }}
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      NextGenRDP
                    </motion.div>
                    <motion.div 
                      className="mt-2 text-sm opacity-80 font-medium"
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 0.8 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      Premium Services
                    </motion.div>
                  </>
                )}
                
                {/* Display website name on back face */}
                {face.name === 'back' && (
                  <>
                    <motion.div 
                      className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-b from-white to-purple-200"
                      style={{ textShadow: "0 0 15px rgba(255, 255, 255, 0.3)" }}
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      RDP & VPS
                    </motion.div>
                    <motion.div 
                      className="mt-2 text-sm opacity-80 font-medium"
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 0.8 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      Solutions
                    </motion.div>
                  </>
                )}
                
                {/* Icon faces with optimized SVGs */}
                {face.name !== 'front' && face.name !== 'back' && (
                  <div className="flex flex-col items-center">
                    {face.name === 'right' && (
                      <>
                        <motion.svg 
                          width="44" 
                          height="44" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-white"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        >
                          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </motion.svg>
                        <motion.div 
                          className="mt-3 text-sm font-medium"
                          initial={{ y: 5, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          High Performance
                        </motion.div>
                      </>
                    )}
                    
                    {face.name === 'left' && (
                      <>
                        <motion.svg 
                          width="44" 
                          height="44" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-white"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        >
                          <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </motion.svg>
                        <motion.div 
                          className="mt-3 text-sm font-medium"
                          initial={{ y: 5, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          Advanced Security
                        </motion.div>
                      </>
                    )}
                    
                    {face.name === 'top' && (
                      <>
                        <motion.svg 
                          width="44" 
                          height="44" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-white"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        >
                          <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M12 3C7.03 3 3 7.03 3 12H5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M21 12C21 7.03 16.97 3 12 3V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </motion.svg>
                        <motion.div 
                          className="mt-3 text-sm font-medium"
                          initial={{ y: 5, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          Ultra-Fast Speed
                        </motion.div>
                      </>
                    )}
                    
                    {face.name === 'bottom' && (
                      <>
                        <motion.svg 
                          width="44" 
                          height="44" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-white"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        >
                          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                          <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                        </motion.svg>
                        <motion.div 
                          className="mt-3 text-sm font-medium"
                          initial={{ y: 5, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          Easy Scalability
                        </motion.div>
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
            </motion.div>
          ))}
        </motion.div>
        
        {/* Enhanced reflective surface below with motion */}
        <motion.div 
          className="mt-28 w-[220px] h-[15px] rounded-full blur-md transform -rotate-x-60"
          style={{ 
            background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent)',
            willChange: 'opacity',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isInView ? [0.2, 0.5, 0.2] : 0 }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </motion.div>
      
      {/* Optimized orbiting particles with animation variants */}
      {!prefersReducedMotion && Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const radius = 180;
        const baseX = Math.cos(angle) * radius;
        const baseY = Math.sin(angle) * radius;
        
        const colors = ['#a855f7', '#10b981', '#3b82f6']; // Purple, emerald, blue
        const color = colors[i % 3];
        
        // Particle animation variants
        const particleVariants = {
          hidden: { 
            x: 0, 
            y: 0, 
            opacity: 0,
            scale: 0
          },
          visible: {
            x: [baseX * 0.8, baseX, baseX * 1.1, baseX],
            y: [baseY * 0.8, baseY, baseY * 1.1, baseY],
            opacity: [0.4, 0.8, 0.6, 0.4],
            scale: [0.8, 1.2, 1, 0.8],
            transition: {
              duration: 5 + (i % 5),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1
            }
          }
        };
        
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: Math.max(3, 5 - (i % 3)), // Varied particle sizes
              height: Math.max(3, 5 - (i % 3)),
              backgroundColor: color,
              boxShadow: `0 0 ${8 + (i % 5)}px ${color}`,
              left: '50%',
              top: '50%',
              marginTop: "-60px",
              willChange: 'transform, opacity',
              opacity: 0, // Start hidden
              zIndex: i % 2 === 0 ? -1 : 1, // Some in front, some behind
            }}
            variants={particleVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
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
        
        .perspective-1200px {
          perspective: 1200px;
        }
        
        .-rotate-x-60 {
          transform: rotateX(-60deg);
        }
        
        @media (prefers-reduced-motion: reduce) {
          .preserve-3d, .transform-style-3d {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
});

// Add display name for better debugging
AnimatedCube.displayName = 'AnimatedCube';

export default AnimatedCube; 