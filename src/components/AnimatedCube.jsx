'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, useReducedMotion, useAnimationControls } from 'framer-motion';

// Highly optimized component with React.memo to prevent unnecessary re-renders
const AnimatedCube = React.memo(() => {
  // Essential refs
  const cubeRef = useRef(null);
  const containerRef = useRef(null);
  
  // User preferences
  const prefersReducedMotion = useReducedMotion();
  
  // Animation controls with better performance
  const cubeControls = useAnimationControls();
  
  // Optimized state management
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isInView, setIsInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  // Optimized device detection with fewer re-renders
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    
    // Use ResizeObserver with dedicated options for better performance
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(entries => {
        if (!entries.length) return;
        requestAnimationFrame(checkIsMobile);
      });
      
      resizeObserver.observe(document.body, { box: 'border-box' });
      return () => resizeObserver.disconnect();
    } else {
      // Optimize the resize event with passive flag
      window.addEventListener('resize', checkIsMobile, { passive: true });
      return () => window.removeEventListener('resize', checkIsMobile);
    }
  }, []);
  
  // Optimized mouse movement handler with better physics
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || prefersReducedMotion) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // More efficient position calculation with damping for smoother motion
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    
    setMousePosition(prev => ({
      x: prev.x + (x - prev.x) * 0.08, // Smoother damping factor
      y: prev.y + (y - prev.y) * 0.08
    }));
  }, [prefersReducedMotion]);

  // High-performance throttling for mouse events using requestAnimationFrame
  const optimizedMouseMove = useCallback(() => {
    let ticking = false;
    
    return (e) => {
      if (ticking) return;
      
      ticking = true;
      requestAnimationFrame(() => {
        handleMouseMove(e);
        ticking = false;
      });
    };
  }, [handleMouseMove]);
  
  // More efficient animation loop with optimized render cycles
  useEffect(() => {
    if (prefersReducedMotion || !isInView) return;
    
    let animationFrameId;
    
    const updateRotation = () => {
      if (cubeRef.current) {
        // Smoother rotation with acceleration and damping
        const rotateX = isHovering ? (mousePosition.y * 12) : 0;
        const rotateY = isHovering ? (-mousePosition.x * 12) : 0;
        
        // Use transform with will-change for GPU acceleration
        cubeRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
      
      animationFrameId = requestAnimationFrame(updateRotation);
    };
    
    updateRotation();
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [mousePosition, isInView, prefersReducedMotion, isHovering]);
  
  // High-performance intersection observer with optimized options
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const isNowInView = entry.isIntersecting;
        
        if (isNowInView !== isInView) {
          setIsInView(isNowInView);
          
          if (isNowInView) {
            cubeControls.start("visible");
          } else {
            cubeControls.start("hidden");
          }
        }
      },
      { 
        threshold: 0.1, 
        rootMargin: '100px',
        trackVisibility: true,
        delay: 100 // Slight delay for more efficient processing
      }
    );
    
    observer.observe(containerRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [cubeControls, isInView]);
  
  // Optimized and memoized cube faces with vibrant colors
  const faces = useMemo(() => [
    { name: 'front', color: 'rgba(124, 58, 237, 0.9)', transform: 'translateZ(100px)' },       // Vibrant purple
    { name: 'back', color: 'rgba(124, 58, 237, 0.9)', transform: 'rotateY(180deg) translateZ(100px)' },
    { name: 'right', color: 'rgba(16, 185, 129, 0.9)', transform: 'rotateY(90deg) translateZ(100px)' },    // Emerald
    { name: 'left', color: 'rgba(16, 185, 129, 0.9)', transform: 'rotateY(-90deg) translateZ(100px)' },
    { name: 'top', color: 'rgba(37, 99, 235, 0.9)', transform: 'rotateX(90deg) translateZ(100px)' },      // Royal blue
    { name: 'bottom', color: 'rgba(37, 99, 235, 0.9)', transform: 'rotateX(-90deg) translateZ(100px)' },
  ], []);

  // High-performance animation variants with optimized timing
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
          duration: 30, 
          ease: "linear", 
          repeat: Infinity,
          repeatType: "loop"
        },
        rotateY: { 
          duration: 30, 
          ease: "linear", 
          repeat: Infinity,
          repeatType: "loop"
        },
        scale: { 
          duration: 0.6, 
          ease: [0.34, 1.56, 0.64, 1] // Spring physics for smoother motion
        },
        opacity: { 
          duration: 0.6, 
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
  
  // Dynamically adjust particle count based on device capability
  const particleCount = useMemo(() => isMobile ? 5 : 12, [isMobile]);
  
  // Optimized glow animations with staggered timings for better performance
  const glowVariants = {
    hidden: { opacity: 0.2, scale: 0.8 },
    visible: (i) => ({
      opacity: [0.3, 0.7, 0.3],
      scale: [0.8, 1.1, 0.8],
      transition: {
        duration: 6 + i * 0.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.7
      }
    })
  };
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-[500px] flex items-center justify-center perspective-[1200px] relative -mt-20" 
      onMouseMove={optimizedMouseMove()}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-hidden="true"
    >
      {/* Performance-optimized background effects with controlled re-renders */}
      <div className="absolute w-full h-full overflow-hidden pointer-events-none">
        {/* Optimized glow effects - only animate when in view */}
        {isInView && (
          <>
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={glowVariants}
              custom={0}
              className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-purple-600/30 blur-3xl -z-10" 
              style={{ 
                x: '-50%', 
                y: '-50%',
                willChange: 'transform, opacity',
                transform: 'translate3d(-50%, -50%, 0)',
              }}
            />
            
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={glowVariants}
              custom={1}
              className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full bg-emerald-500/30 blur-3xl -z-10" 
              style={{ 
                x: '-50%', 
                y: '-50%',
                willChange: 'transform, opacity',
                transform: 'translate3d(-50%, -50%, 0)',
              }}
            />
            
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={glowVariants}
              custom={2}
              className="absolute top-1/2 left-1/2 w-56 h-56 rounded-full bg-blue-600/30 blur-3xl -z-10" 
              style={{ 
                x: '-50%', 
                y: '-50%',
                willChange: 'transform, opacity',
                transform: 'translate3d(-50%, -50%, 0)',
              }}
            />
          </>
        )}
      </div>
      
      {/* Optimized grid pattern - only render when necessary */}
      {!isMobile && isInView && (
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
          style={{ 
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px), 
              linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            transform: 'translate3d(0, 0, 0)', // Force GPU acceleration
            backfaceVisibility: 'hidden',
          }}
        />
      )}
      
      {/* Cube wrapper with hardware-accelerated animations */}
      <motion.div 
        className="preserve-3d"
        initial="hidden"
        animate={cubeControls}
        whileHover="hover"
        variants={cubeAnimationVariants}
        style={{ 
          willChange: 'transform, opacity',
          marginTop: "-60px",
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* Actual 3D cube with improved rendering performance */}
        <motion.div 
          ref={cubeRef}
          className="relative w-[220px] h-[220px] transform-style-3d"
          style={{ 
            willChange: 'transform',
            transformOrigin: 'center center',
            transform: 'translate3d(0, 0, 0) rotateX(0) rotateY(0)',
            backfaceVisibility: 'hidden',
            transition: 'transform 0.08s cubic-bezier(0.25, 0.46, 0.45, 0.94)' // Smoother transition
          }}
        >
          {/* Enhanced cube glow effect with performance optimizations */}
          <div 
            className="absolute w-[220px] h-[220px] rounded-[14px] opacity-30"
            style={{
              boxShadow: "0 0 40px 5px rgba(124, 58, 237, 0.5), 0 0 30px 10px rgba(16, 185, 129, 0.3), 0 0 20px 15px rgba(37, 99, 235, 0.3)",
              transform: "translateZ(0)",
            }}
          />

          {/* Render each face of the cube with optimized rendering */}
          {faces.map((face) => (
            <motion.div
              key={face.name}
              className="absolute w-full h-full border border-white/30 backdrop-blur-sm"
              style={{
                transform: face.transform,
                backgroundColor: face.color,
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d',
                borderRadius: "14px",
                boxShadow: "0 0 30px rgba(255, 255, 255, 0.1) inset",
                willChange: 'transform, opacity',
                overflow: 'hidden',
                perspective: 1000, // Boost 3D rendering
              }}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {/* High-performance corner effects */}
              <div className="absolute inset-0 rounded-[14px] overflow-hidden">
                {/* Optimized corner highlights */}
                <div className="absolute -top-1 -left-1 w-12 h-12 rounded-br-3xl bg-white/15" />
                <div className="absolute -bottom-1 -right-1 w-12 h-12 rounded-tl-3xl bg-white/15" />
                
                {/* Optimized edge glow with better GPU utilization */}
                <div 
                  className="absolute inset-0 rounded-[14px] opacity-60"
                  style={{
                    background: `linear-gradient(135deg, ${face.color.replace('0.9', '1')} 0%, transparent 60%)`,
                    boxShadow: "inset 0 0 20px rgba(255, 255, 255, 0.15)",
                    transform: 'translate3d(0, 0, 0)',
                  }}
                />
                
                {/* Optimized light effect with better performance */}
                <div 
                  className="absolute inset-0 opacity-25" 
                  style={{
                    background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5) 0%, transparent 70%)`,
                    transform: 'translate3d(0, 0, 0)',
                  }}
                />
              </div>

              {/* Optimized content for each face */}
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-white">
                {/* Front face content - simplified for better performance */}
                {face.name === 'front' && (
                  <>
                    <motion.div 
                      className="text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 pb-1"
                      style={{ 
                        textShadow: "0 0 15px rgba(255, 255, 255, 0.3)",
                        transform: 'translate3d(0, 0, 0)',
                      }}
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
                
                {/* Back face content - simplified for better performance */}
                {face.name === 'back' && (
                  <>
                    <motion.div 
                      className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-b from-white to-purple-200"
                      style={{ 
                        textShadow: "0 0 15px rgba(255, 255, 255, 0.3)",
                        transform: 'translate3d(0, 0, 0)',
                      }}
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
                
                {/* Icon faces - optimized SVGs */}
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
                          style={{ transform: 'translate3d(0, 0, 0)' }}
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
                          style={{ transform: 'translate3d(0, 0, 0)' }}
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
                          style={{ transform: 'translate3d(0, 0, 0)' }}
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
                          style={{ transform: 'translate3d(0, 0, 0)' }}
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
                          Scalable Solutions
                        </motion.div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Floating particles - optimized for performance with reduced count */}
      {isInView && !prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: particleCount }).map((_, index) => {
            const size = Math.random() * 4 + 2;
            const offsetX = (Math.random() - 0.5) * 400;
            const offsetY = (Math.random() - 0.5) * 400;
            const duration = Math.random() * 10 + 15;
            const delay = Math.random() * 5;
            
            const colors = [
              'rgba(124, 58, 237, 0.6)',  // Purple
              'rgba(16, 185, 129, 0.6)',  // Emerald
              'rgba(37, 99, 235, 0.6)',   // Blue
            ];
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            return (
              <motion.div
                key={index}
                className="absolute rounded-full"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: color,
                  top: '50%',
                  left: '50%',
                  x: offsetX,
                  y: offsetY,
                  opacity: 0,
                  willChange: 'transform, opacity',
                  transform: 'translate3d(0, 0, 0)',
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 0.8, 0],
                  x: [offsetX, offsetX + (Math.random() - 0.5) * 100],
                  y: [offsetY, offsetY + (Math.random() - 0.5) * 100],
                }}
                transition={{
                  duration: duration,
                  delay: delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
});

AnimatedCube.displayName = 'AnimatedCube';

export default AnimatedCube; 