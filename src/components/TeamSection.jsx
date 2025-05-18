 'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { 
  motion, 
  AnimatePresence, 
  useInView, 
  useAnimation, 
  useMotionValue,
  useTransform,
  useDragControls,
  useSpring
} from 'framer-motion';
import { FaLinkedinIn, FaTwitter, FaGithub } from 'react-icons/fa';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { ServerIcon, CogIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useSwipeable } from 'react-swipeable';

// Team members data
const teamMembers = [
  {
    id: 1,
    name: "Ahmad Ch.",
    role: "CEO & CTO",
    image: "https://i.imgur.com/8bAAGUK.png",
    bio: "With over 5 years of experience in cloud infrastructure and virtualization technology, Ahmad leads NextGenRDP's strategic vision and technical innovation. He has pioneered several breakthroughs in virtual desktop optimization and secure remote access solutions that have become industry standards.",
    expertise: ["Infrastructure Architecture", "Enterprise Security"],
    achievements: { value: "5+", label: "Years Experience" },
    social: {
      linkedin: "https://linkedin.com/in/example",
      twitter: "https://twitter.com/example",
      github: "https://github.com/example",
      email: "ahmad@nextgenrdp.com"
    },
    accentColor: "from-blue-500 to-indigo-600",
    themeColor: "#3b82f6",
    icon: ServerIcon
  },
  {
    id: 2,
    name: "Abdul Rehman Ch",
    role: "Dev. Team Lead",
    image: "https://i.imgur.com/R9q8TsQ.jpeg",
    bio: "Abdul Rehman Ch. is a Website Support Engineer with a strong focus on website maintenance, technical troubleshooting, and CMS management. With years of hands-on experience, he ensures smooth website performance, uptime, and a seamless user experience across platforms.",
    expertise: [
      "Website Maintenance",
      "Technical Support"
    ],
    achievements: { value: "99.9%", label: "Uptime Rate" },
    social: {
      linkedin: "https://linkedin.com/in/example",
      twitter: "https://twitter.com/example",
      github: "https://github.com/example",
      email: "abdul@nextgenrdp.com"
    },
    accentColor: "from-emerald-500 to-cyan-500",
    themeColor: "#10b981",
    icon: CogIcon
  },
  {
    id: 3,
    name: "Ahmad Ch.",
    role: "CISO & Infrastructure Lead",
    image: "https://i.imgur.com/hROKZzl.jpeg",
    bio: "Ahmad Raza leads NextGenRDP's security operations with CISSP and CISM certifications, implementing our multi-layered protection framework. His innovative approach to infrastructure has enabled us to deliver enterprise-grade RDP solutions with zero reported security breaches while maintaining exceptional performance metrics.",
    expertise: ["Cybersecurity", "Infrastructure Optimization"],
    achievements: { value: "0", label: "Security Breaches" },
    social: {
      linkedin: "https://linkedin.com/in/example",
      twitter: "https://twitter.com/example",
      github: "https://github.com/example",
      email: "ahmadraza@nextgenrdp.com"
    },
    accentColor: "from-amber-500 to-orange-600",
    themeColor: "#f59e0b",
    icon: ShieldCheckIcon
  }
];

// Dynamic background element
const DynamicBackground = ({ activeThemeColor }) => {
  const springConfig = { stiffness: 100, damping: 30, duration: 0.8 };
  const backgroundColor = useSpring(activeThemeColor, springConfig);
  
  return (
    <motion.div 
      className="absolute inset-0 w-full h-full opacity-5 pointer-events-none z-0"
      style={{ backgroundColor }}
    >
      <div className="absolute inset-0 mix-blend-overlay bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      <motion.div 
        className="absolute left-1/4 bottom-1/4 w-96 h-96 rounded-full filter blur-3xl opacity-20"
        style={{ backgroundColor }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15] 
        }}
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};

// Advanced Glowing Accent
const GlowingAccent = ({ color, active, intensity = 0.2 }) => {
  const pulseIntensity = useMotionValue(intensity);
  
  useEffect(() => {
    if (active) {
      const interval = setInterval(() => {
        pulseIntensity.set(Math.random() * 0.1 + intensity);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [active, intensity, pulseIntensity]);

  const opacity = useTransform(pulseIntensity, [0, 0.3], [0, 0.3]);
  
  return (
    <motion.div 
      className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur-xl transition-opacity duration-1000`}
      style={{ opacity }}
      animate={active ? { scale: [0.98, 1.01, 0.98] } : { scale: 1 }}
      transition={{
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse"
      }}
    />
  );
};

// Expertise Pill Component with animation
const ExpertisePill = ({ skill, delay, themeColor }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay }
      });
    }
  }, [controls, isInView, delay]);
  
  return (
  <motion.span 
      ref={ref}
    initial={{ opacity: 0, y: 20 }}
      animate={controls}
      whileHover={{ y: -2, scale: 1.05, backgroundColor: themeColor, color: "#fff" }}
      className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600 border border-gray-200 shadow-sm hover:shadow-md transition-all"
  >
    {skill}
  </motion.span>
);
};

// Enhanced Social Icon Component with ripple effect
const SocialIcon = ({ platform, url, delay, themeColor }) => {
  const [isRippling, setIsRippling] = useState(false);
  const rippleRef = useRef(null);
  
  const getIcon = () => {
    switch (platform) {
      case 'linkedin':
        return <FaLinkedinIn className="h-4 w-4 text-blue-500 group-hover:text-white transition-colors" />;
      case 'twitter':
        return <FaTwitter className="h-4 w-4 text-sky-500 group-hover:text-white transition-colors" />;
      case 'github':
        return <FaGithub className="h-4 w-4 text-gray-700 group-hover:text-white transition-colors" />;
      default:
        return null;
    }
  };
  
  const getHoverColor = () => {
    switch (platform) {
      case 'linkedin':
        return "group-hover:bg-blue-500";
      case 'twitter':
        return "group-hover:bg-sky-500";
      case 'github':
        return "group-hover:bg-gray-700";
      default:
        return "group-hover:bg-blue-500";
    }
  };
  
  const handleClick = (e) => {
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 500);
  };
  
  return (
    <motion.a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`group p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all ${getHoverColor()} relative overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        y: -3, 
        scale: 1.1,
        boxShadow: `0 0 10px 2px ${themeColor}40` 
      }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
    >
      {getIcon()}
      {isRippling && (
        <motion.span
          ref={rippleRef}
          className="absolute inset-0 rounded-full bg-white/30"
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.a>
  );
};

// Interactive 3D Card Component with parallax effect
const Card3D = ({ member, isActive, index, activeIndex, total, position, mouseX, mouseY }) => {
  // Card refs for interactions
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);
  
  // Parallax calculations
  const rotateX = useTransform(mouseY, [-300, 300], isActive ? [5, -5] : [0, 0]);
  const rotateY = useTransform(mouseX, [-300, 300], isActive ? [-5, 5] : [0, 0]);
  
  // For image parallax
  const imageX = useTransform(mouseX, [-300, 300], isActive ? [-10, 10] : [0, 0]);
  const imageY = useTransform(mouseY, [-300, 300], isActive ? [-10, 10] : [0, 0]);
  
  // Calculate position for card based on position prop
  const getFrontVariants = () => {
    if (position === 'front') {
      return {
        initial: { 
          rotateY: 0, 
          opacity: 0, 
          scale: 0.85, 
          z: -100 
        },
        animate: { 
          rotateY: 0, 
          opacity: 1, 
          scale: 1, 
          z: 0,
          transition: { 
            duration: 0.6, 
            type: "spring",
            stiffness: 300,
            damping: 25
          }
        },
        exit: { 
          rotateY: 180, 
          opacity: 0, 
          scale: 0.85, 
          z: -100,
          transition: { 
            duration: 0.5, 
            ease: "easeIn" 
          }
        }
      };
    } else if (position === 'back') {
      return {
        initial: { 
          rotateY: -180, 
          opacity: 0, 
          scale: 0.85, 
          z: -100 
        },
        animate: { 
          rotateY: 0, 
          opacity: 1, 
          scale: 1, 
          z: 0,
          transition: { 
            duration: 0.6, 
            type: "spring",
            stiffness: 300,
            damping: 25
          }
        },
        exit: { 
          rotateY: 180, 
          opacity: 0, 
          scale: 0.85, 
          z: -100,
          transition: { 
            duration: 0.5, 
            ease: "easeIn" 
          }
        }
      };
    } else if (position === 'next') {
      return {
        initial: { 
          rotateY: 0, 
          opacity: 0, 
          scale: 0.85, 
          x: '75%', 
          z: -50 
        },
        animate: { 
          rotateY: 10, 
          opacity: 0.7, 
          scale: 0.9, 
          x: '60%', 
          z: -30,
          transition: { 
            duration: 0.5, 
            type: "spring",
            stiffness: 300,
            damping: 30
          }
        },
        exit: { 
          rotateY: 0, 
          opacity: 0, 
          scale: 0.85, 
          x: '100%', 
          z: -50,
          transition: { 
            duration: 0.5, 
            ease: "easeIn" 
          }
        }
      };
    } else if (position === 'prev') {
      return {
        initial: { 
          rotateY: 0, 
          opacity: 0, 
          scale: 0.85, 
          x: '-75%', 
          z: -50 
        },
        animate: { 
          rotateY: -10, 
          opacity: 0.7, 
          scale: 0.9, 
          x: '-60%', 
          z: -30,
          transition: { 
            duration: 0.5, 
            type: "spring",
            stiffness: 300,
            damping: 30
          }
        },
        exit: { 
          rotateY: 0, 
          opacity: 0, 
          scale: 0.85, 
          x: '-100%', 
          z: -50,
          transition: { 
            duration: 0.5, 
            ease: "easeIn" 
          }
        }
      };
    }
    return {};
  };
  
  const frontVariants = getFrontVariants();
  
  return (
    <motion.div
      ref={cardRef}
      className={`absolute inset-0 ${isActive ? 'z-30' : 'z-20'}`}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={frontVariants}
      style={{ 
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        rotateX: isActive ? rotateX : 0,
        rotateY: isActive ? rotateY : 0,
      }}

    >
      <div className={`relative bg-white rounded-2xl shadow-xl overflow-hidden h-full w-full
                     ${!isActive && 'opacity-70 pointer-events-none'}`}>
        <GlowingAccent color={member.accentColor} active={isActive} intensity={isActive ? 0.2 : 0.1} />
        
        {/* Card Content */}
        <div className="h-full flex flex-col md:flex-row bg-white">
          {/* Left section with image - Mobile optimized with parallax */}
          <div className="md:w-5/12 h-80 sm:h-96 md:h-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/20 to-gray-900/0 z-10"></div>
            <motion.div 
              ref={imageRef}
              className="absolute inset-0" 
              style={{ 
                x: isActive ? imageX : 0, 
                y: isActive ? imageY : 0 
              }}
            >
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={isActive}
                quality={90}
                unoptimized={true}
              />
            </motion.div>
            
            {/* Overlay gradient and name on mobile */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white to-transparent md:hidden">
              <h3 className="text-2xl font-bold text-gray-900">{member.name}</h3>
              <motion.p 
                className="text-base font-medium mt-1"
                style={{ color: member.themeColor }}
              >
                {member.role}
              </motion.p>
            </div>
          </div>
          
          {/* Right section with content */}
          <motion.div 
            ref={contentRef}
            className="md:w-7/12 p-6 md:p-8 flex flex-col justify-center overflow-y-auto"
          >
            {/* Name and role - visible only on desktop */}
            <div className="hidden md:block mb-4">
              <motion.h3 
                className="text-2xl font-bold text-gray-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {member.name}
              </motion.h3>
              <motion.div 
                className="text-lg font-medium mt-0.5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <span style={{ color: member.themeColor }}>
                  {member.role}
                </span>
              </motion.div>
            </div>
            
            <motion.p 
              className="text-gray-600 mb-4 leading-relaxed text-sm md:text-base"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {member.bio}
            </motion.p>
            
            {/* Achievement visualization */}
            {member.achievements && (
              <motion.div 
                className="mb-4 flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 border border-gray-100 mr-3">
                  <span className="text-xl font-bold" style={{ color: member.themeColor }}>
                    {member.achievements.value}
                  </span>
                  <span className="text-xs text-gray-500">{member.achievements.label}</span>
                </div>
              </motion.div>
            )}
            
            {/* Expertise */}
            <div className="mb-4">
              <motion.h4 
                className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Areas of Expertise
              </motion.h4>
              <div className="flex flex-wrap gap-1.5">
                {member.expertise.map((skill, idx) => (
                  <ExpertisePill 
                    key={idx} 
                    skill={skill} 
                    delay={0.4 + idx * 0.1} 
                    themeColor={member.themeColor}
                  />
                ))}
              </div>
            </div>
            
            {/* Social Links */}
            <div>
              <motion.h4 
                className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                Connect
              </motion.h4>
              <div className="flex space-x-2">
                <SocialIcon 
                  platform="linkedin" 
                  url={member.social.linkedin} 
                  delay={0.7} 
                  themeColor={member.themeColor}
                />
                <SocialIcon 
                  platform="twitter" 
                  url={member.social.twitter} 
                  delay={0.8} 
                  themeColor={member.themeColor}
                />
                <SocialIcon 
                  platform="github" 
                  url={member.social.github} 
                  delay={0.9} 
                  themeColor={member.themeColor}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// Custom navigation button with ripple effect
const NavigationButton = ({ direction, onClick, disabled, themeColor }) => {
  const [isRippling, setIsRippling] = useState(false);
  
  const handleClick = (e) => {
    if (disabled) return;
    
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 500);
    onClick();
  };
  
  return (
    <motion.button
      onClick={handleClick}
      className={`w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center z-40
                hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all
                disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden`}
      style={{ 
        boxShadow: `0 10px 25px -5px ${themeColor}30` 
      }}
      whileHover={!disabled ? { scale: 1.1, x: direction === 'left' ? -5 : 5 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      disabled={disabled}
      aria-label={direction === 'left' ? 'Previous' : 'Next'}
    >
      {direction === 'left' ? (
        <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
      ) : (
        <ChevronRightIcon className="h-6 w-6 text-gray-800" />
      )}
      
      {isRippling && (
        <motion.span
          className="absolute inset-0"
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ 
            scale: 4, 
            opacity: 0,
            backgroundColor: `${themeColor}30`
          }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.button>
  );
};

// Progress indicator with dynamic theming
const ProgressIndicator = ({ currentIndex, totalItems, goToIndex, isAnimating, activeThemeColor }) => {
  return (
    <div className="flex justify-center space-x-3 z-40">
      {Array.from({ length: totalItems }).map((_, index) => (
        <motion.button
          key={index}
          className="w-12 h-1.5 rounded-full focus:outline-none"
          style={{ 
            backgroundColor: index === currentIndex ? activeThemeColor : '#d1d5db'
          }}
          initial={{ opacity: 0.5, scaleX: 0.7 }}
          animate={{ 
            opacity: index === currentIndex ? 1 : 0.5,
            scaleX: index === currentIndex ? 1 : 0.7
          }}
          transition={{ duration: 0.3 }}
          onClick={() => {
            if (isAnimating || index === currentIndex) return;
            goToIndex(index);
          }}
          disabled={isAnimating}
          aria-label={`Go to slide ${index + 1}`}
          whileHover={!isAnimating && index !== currentIndex ? { 
            scaleY: 1.5, 
            backgroundColor: activeThemeColor,
            opacity: 0.8
          } : {}}
        />
      ))}
    </div>
  );
};

// Team Section Component
const TeamSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardPosition, setCardPosition] = useState('front');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const sectionRef = useRef(null);
  const carouselRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });
  const controls = useAnimation();
  
  // Get current theme color from active member
  const activeThemeColor = teamMembers[activeIndex].themeColor;
  
  // Handle mouse movement for 3D effect
  const handleMouseMove = useCallback((e) => {
    if (!carouselRef.current || !isInView) return;
    
    const rect = carouselRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    mouseX.set(x);
    mouseY.set(y);
    setMousePosition({ x, y });
  }, [mouseX, mouseY, isInView]);
  
  // Reset mouse position when mouse leaves
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };
  
  // Handle swipe gestures
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => !isAnimating && goToNext(),
    onSwipedRight: () => !isAnimating && goToPrevious(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [isInView, controls]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isInView) return;
      
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInView, isAnimating]);
  
  // Determine card position (front, next, prev, or hidden)
  const getPosition = (index) => {
    if (index === activeIndex) return 'front';
    
    const prevIndex = activeIndex === 0 ? teamMembers.length - 1 : activeIndex - 1;
    const nextIndex = activeIndex === teamMembers.length - 1 ? 0 : activeIndex + 1;
    
    if (index === prevIndex) return 'prev';
    if (index === nextIndex) return 'next';
    
    return 'hidden';
  };
  
  // Navigation handlers with advanced animation sequences
  const goToPrevious = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsAutoPlaying(false);
    setCardPosition('back');
    
    setTimeout(() => {
    setActiveIndex(prev => (prev === 0 ? teamMembers.length - 1 : prev - 1));
      setCardPosition('front');
      setIsAnimating(false);
    }, 500);
  };
  
  const goToNext = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCardPosition('back');
    
    setTimeout(() => {
    setActiveIndex(prev => (prev === teamMembers.length - 1 ? 0 : prev + 1));
      setCardPosition('front');
      setIsAnimating(false);
    }, 500);
  };
  
  const goToIndex = (index) => {
    if (isAnimating || index === activeIndex) return;
    
    setIsAnimating(true);
    setIsAutoPlaying(false);
    setCardPosition('back');
    
    setTimeout(() => {
      setActiveIndex(index);
      setCardPosition('front');
      setIsAnimating(false);
    }, 500);
  };
  
  // Auto-rotation with dynamic timing based on content length
  useEffect(() => {
    let timer;
    
    if (isAutoPlaying && !isAnimating) {
      // Calculate reading time based on content length (longer bio = more time)
      const contentLength = teamMembers[activeIndex].bio.length;
      const baseTime = 5000; // Base 5 seconds
      const readingTime = baseTime + (contentLength / 10) * 50; // Add time based on content length
      
      timer = setTimeout(() => {
        goToNext();
      }, readingTime);
    }
    
    return () => clearTimeout(timer);
  }, [isAutoPlaying, isAnimating, activeIndex]);
  
  // Reset auto-play after user interaction with exponential backoff
  useEffect(() => {
    if (!isAutoPlaying) {
      const timer = setTimeout(() => {
        setIsAutoPlaying(true);
      }, 15000); // 15 seconds pause after interaction
      
      return () => clearTimeout(timer);
    }
  }, [isAutoPlaying]);

  // Section variants for scroll animation
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.2
      }
    }
  };

  // Children elements variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="py-16 overflow-hidden relative"
      style={{ backgroundColor: "#fafafa" }}
    >
      <DynamicBackground activeThemeColor={activeThemeColor} />
      
      <motion.div 
        className="container mx-auto px-4 sm:px-6 lg:px-8"
        variants={sectionVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Section header */}
        <motion.div 
          variants={itemVariants}
          className="text-center mb-12 max-w-3xl mx-auto"
        >
          <motion.span 
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4 border shadow-sm"
            style={{ 
              backgroundColor: `${activeThemeColor}10`,
              borderColor: `${activeThemeColor}30`,
              color: activeThemeColor
            }}
            whileHover={{ scale: 1.05, y: -2 }}
          >
            Our Leadership
          </motion.span>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Meet the Team
          </h2>
          
          <p className="text-lg text-gray-600">
            Our experts bring decades of combined experience in cloud architecture, 
            security, and infrastructure optimization to deliver industry-leading solutions.
          </p>
        </motion.div>
        
        {/* Team cards 3D carousel */}
        <motion.div 
          variants={itemVariants}
          className="relative max-w-5xl mx-auto mb-16"
        >
          {/* Auto-rotate progress indicator */}
          {isAutoPlaying && !isAnimating && (
            <div className="absolute -top-6 left-0 right-0 z-10 flex items-center justify-center">
              <motion.div
                className="h-1.5 rounded-full"
                style={{ backgroundColor: activeThemeColor }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ 
                  duration: 5,
                  ease: "linear"
                }}
              />
            </div>
          )}
        
          {/* 3D Card Stack */}
          <div
            ref={carouselRef}
            className="relative h-[600px] sm:h-[650px] md:h-[480px] lg:h-[450px] w-full mx-auto"
            style={{ perspective: "2000px" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            {...swipeHandlers}
          >
            <AnimatePresence mode="sync">
              {teamMembers.map((member, index) => {
                const position = getPosition(index);
                if (position === 'hidden') return null;
                
                return (
                  <Card3D
                    key={`${member.id}-${position}`}
                    member={member}
                    isActive={index === activeIndex}
                    index={index}
                    activeIndex={activeIndex}
                    total={teamMembers.length}
                    position={position}
                    mouseX={mouseX}
                    mouseY={mouseY}
                  />
                );
              })}
            </AnimatePresence>
            
            {/* Card reflection effect */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/30 to-transparent pointer-events-none z-50 opacity-70" />
            
            {/* Floating arrows responsive positioning */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-6 z-40 hidden md:block">
              <NavigationButton 
                direction="left"
                onClick={goToPrevious}
                disabled={isAnimating}
                themeColor={activeThemeColor}
              />
                    </div>
                    
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-6 z-40 hidden md:block">
              <NavigationButton 
                direction="right"
                onClick={goToNext}
                disabled={isAnimating}
                themeColor={activeThemeColor}
              />
                </div>
          </div>
          
          {/* Mobile Navigation Controls */}
          <div className="flex justify-center space-x-4 mt-6 md:hidden">
            <NavigationButton 
              direction="left"
            onClick={goToPrevious}
              disabled={isAnimating}
              themeColor={activeThemeColor}
            />
            <NavigationButton 
              direction="right"
            onClick={goToNext}
              disabled={isAnimating}
              themeColor={activeThemeColor}
            />
          </div>
          
          {/* Enhanced indicators */}
          <div className="absolute -bottom-12 left-0 right-0 flex justify-center space-x-3 z-40">
            <ProgressIndicator 
              currentIndex={activeIndex}
              totalItems={teamMembers.length}
              goToIndex={goToIndex}
              isAnimating={isAnimating}
              activeThemeColor={activeThemeColor}
            />
          </div>
          
          {/* Accessibility instructions */}
          <div className="sr-only" aria-live="polite">
            {`Currently viewing ${teamMembers[activeIndex].name}, ${teamMembers[activeIndex].role}. Use arrow keys to navigate.`}
          </div>
          
          {/* Additional keyboard instructions */}
          <motion.div 
            className="text-center mt-12 text-xs text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 1 }}
          >
            <span>Use ← → arrow keys to navigate</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default TeamSection; 