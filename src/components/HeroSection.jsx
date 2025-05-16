'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useAnimation, useInView } from 'framer-motion';
import {
  BoltIcon,
  ChatBubbleLeftEllipsisIcon,
  CheckBadgeIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  TagIcon,
  CloudIcon,
  CpuChipIcon,
  GlobeAltIcon,
  CommandLineIcon,
  CubeTransparentIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import {
  ArrowRightIcon,
  CheckBadgeIcon as CheckBadgeSolidIcon,
  SparklesIcon,
  StarIcon
} from '@heroicons/react/24/solid';
import { FaWhatsapp, FaServer, FaRocket, FaShieldAlt, FaDatabase } from 'react-icons/fa';

// Background particles component
const ParticleBackground = () => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    const newParticles = Array.from({ length: 150 }, () => ({
      width: Math.random() * 8 + 2,
      height: Math.random() * 8 + 2,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      xOffset: Math.random() * 20 - 10,
      duration: Math.random() * 5 + 5,
      delay: Math.random() * 5,
      color: Math.random() > 0.66 ? "rgba(14, 165, 233, 0.4)" : 
             Math.random() > 0.33 ? "rgba(34, 197, 94, 0.4)" : 
             "rgba(249, 115, 22, 0.4)"
    }));
    
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: particle.width,
            height: particle.height,
            left: particle.left,
            top: particle.top,
            backgroundColor: particle.color
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, particle.xOffset, 0],
            opacity: [0, 0.7, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Enhanced Typed Text with clean animation
const TypedText = ({ text }) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  
  useEffect(() => {
    let i = 0;
    let forward = true;
    
    const typingInterval = setInterval(() => {
      if (forward) {
        if (i < text.length) {
          setDisplayText(text.substring(0, i + 1));
          i++;
        } else {
          setTimeout(() => {
            forward = false;
          }, 3000);
        }
      } else {
        if (i > 0) {
          i--;
          setDisplayText(text.substring(0, i));
        } else {
          setTimeout(() => {
            forward = true;
          }, 500);
        }
      }
      
      setIsTyping(i < text.length && forward);
    }, 80);
    
    return () => clearInterval(typingInterval);
  }, [text]);

  return (
    <span className="relative">
      {displayText}
      <motion.span 
        className="inline-block w-1 h-8 ml-1 bg-purple-500"
        animate={{ opacity: isTyping ? [1, 0, 1] : 0 }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </span>
  );
};

// Clean, professional design for admin profile
const AdminProfile = ({ name, role }) => {
  return (
    <motion.div 
      className="relative group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      whileHover={{ scale: 1.03 }}
    >
      <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-lg blur-md"></div>
      <div className="relative flex flex-col bg-slate-900/80 backdrop-blur-md p-4 rounded-lg shadow-xl border border-purple-500/10">
        {/* Profile section - horizontal layout */}
        <div className="flex flex-row items-center gap-4">
          {/* Profile image */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10">
              <Image 
                src="https://i.imgur.com/Is0qkjw.jpeg" 
                alt={name} 
                width={64} 
                height={64} 
                className="object-cover"
                unoptimized={true}
              />
            </div>
            <motion.div 
              className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          
          {/* Profile info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-x-1.5">
              <span className="text-lg font-bold text-white">{name}</span>
              <CheckBadgeSolidIcon className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-sm text-slate-200">{role}</span>
            <div className="flex items-center mt-1">
              <span className="inline-flex items-center text-xs font-medium text-green-400">
                <span className="relative flex h-2 w-2 mr-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Online Now
              </span>
            </div>
          </div>
        </div>
        
        {/* Quote section */}
        <div className="mt-3 pt-3 border-t border-purple-500/10 relative px-2">
          <div className="text-indigo-400 absolute -top-2 left-0 text-lg">"</div>
          <p className="text-xs italic text-slate-300 pl-3">
            We are here to provide you Best Solutions to manage complete work load by using our RDP & VPS Services.
          </p>
          <div className="text-indigo-400 absolute bottom-0 right-0 text-lg">"</div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Hero Section Component
const HeroSection = () => {
  const promoCode = "NEXTGEN30";
  const discount = "30%";
  const [cubeHovering, setCubeHovering] = useState(false);
  
  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <section className="relative font-sans overflow-hidden isolate min-h-screen flex items-center py-16 md:py-24 lg:py-32">
      {/* Professional background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"></div>
      
      {/* Professional gradient accent */}
      <div className="absolute top-0 inset-x-0 h-[40vh] bg-gradient-to-b from-purple-900/20 to-transparent"></div>
      <div className="absolute bottom-0 inset-x-0 h-[30vh] bg-gradient-to-t from-indigo-900/20 to-transparent"></div>
      
      {/* Elegant glow effects */}
      <div className="absolute right-1/4 top-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl"></div>
      <div className="absolute left-1/4 bottom-1/4 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl"></div>
      <div className="absolute right-1/3 bottom-1/3 w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl"></div>
      
      {/* Particle background */}
      <ParticleBackground />
      
      {/* Container */}
      <div className="container mx-auto relative px-4 sm:px-6 lg:px-8 z-10">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-8 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Text Content */}
          <div className="lg:col-span-6 text-center lg:text-left">
            {/* Modern badge */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex mb-6"
            >
              <div className="inline-flex items-center gap-x-2 bg-slate-800/80 backdrop-blur-sm rounded-full px-1 pr-4 border border-purple-500/30 shadow-lg">
                <motion.span 
                  className="flex items-center justify-center h-8 w-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full"
                  animate={{ 
                    rotate: [0, 10, 0, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                >
                  <TagIcon className="h-4 w-4 text-white" />
                </motion.span>
                <p className="text-xs font-semibold text-slate-200">
                  Limited Offer: <span className="font-bold text-purple-400">{discount} OFF!</span> Code: <span className="font-bold tracking-wide text-purple-400">{promoCode}</span>
                </p>
              </div>
            </motion.div>
            
            {/* Headline */}
            <motion.h1 
              variants={itemVariants}
              className="font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl !leading-tight"
            >
              <span className="block mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
                  Next Generation
                </span>
              </span>
              <span className="block">
                <TypedText text="RDP & VPS" />
              </span>
            </motion.h1>
            
            {/* Subheading */}
            <motion.p 
              variants={itemVariants}
              className="mt-6 text-lg leading-relaxed text-slate-300 max-w-3xl"
            >
              Experience unparalleled performance with our cutting-edge RDP and VPS solutions. Designed for professionals who demand reliability, speed, and security.
            </motion.p>
            
            {/* Call-to-action buttons */}
            <motion.div 
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.a
                href="#pricing"
                className="relative inline-flex items-center justify-center px-6 py-4 text-base font-medium text-white bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg shadow-lg hover:from-purple-500 hover:to-violet-500 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 group"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center">
                View Plans
                <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" />
                </span>
              </motion.a>
              
              <motion.a
                href="https://wa.link/ty3ydp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-4 text-base font-medium text-slate-300 bg-slate-800/80 backdrop-blur-sm border border-purple-500/20 rounded-lg shadow-lg hover:bg-slate-700/80 hover:text-white transition-all duration-200"
                whileHover={{ scale: 1.05, borderColor: "rgba(139, 92, 246, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                <FaWhatsapp className="mr-2 h-5 w-5 text-green-500" />
                Contact Support
              </motion.a>
            </motion.div>
          </div>
          
          {/* Visual Content - Server Cube */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div 
              className="w-full h-[650px] perspective-[1200px] relative flex items-center justify-center"
              onMouseEnter={() => setCubeHovering(true)}
              onMouseLeave={() => setCubeHovering(false)}
            >
              {/* Background glow */}
              <motion.div 
                className="absolute inset-0 z-5 pointer-events-none"
                initial={{ opacity: 0.3 }}
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                  scale: [0.95, 1.05, 0.95]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
                  filter: 'blur(20px)'
                }}
              />
              
              {/* Server cube with basic animation */}
              <motion.div 
                className="w-[300px] h-[300px] relative z-20"
                initial={{ 
                  rotateY: 0,
                  rotateX: 0,
                  rotateZ: 0,
                  opacity: 0,
                  scale: 0.8
                }}
                animate={{ 
                  opacity: 1,
                  scale: 1
                }}
                transition={{
                  opacity: { duration: 1, ease: "easeOut" },
                  scale: { duration: 1, ease: "easeOut" }
                }}
                style={{
                  transformStyle: "preserve-3d",
                  willChange: "transform"
                }}
              >
                {/* Enhanced data scanning effect */}
                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-30">
                  {/* Horizontal scanning beam */}
                  <motion.div
                    className="absolute left-0 w-full h-[2px]"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.8), rgba(56, 189, 248, 0.8), transparent)",
                      boxShadow: "0 0 10px rgba(139, 92, 246, 0.8), 0 0 20px rgba(56, 189, 248, 0.4)"
                    }}
                    animate={{
                      top: ["-10%", "110%"]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                      repeatDelay: 1
                    }}
                  />
                </div>
                
                {/* Data flow particles */}
                {[...Array(6)].map((_, i) => {
                  const angle = (i / 6) * Math.PI * 2;
                  const distance = 200;
                  const delay = i * 0.8;
                  
                  return (
                    <motion.div 
                      key={`data-flow-${i}`}
                      className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full z-20"
                      style={{
                        backgroundColor: i % 2 === 0 ? 'rgba(139, 92, 246, 0.8)' : 'rgba(16, 185, 129, 0.8)',
                        boxShadow: i % 2 === 0 ? '0 0 8px rgba(139, 92, 246, 0.8)' : '0 0 8px rgba(16, 185, 129, 0.8)'
                      }}
                      animate={{
                        x: [
                          Math.cos(angle) * distance, 
                          0, 
                          Math.cos(angle + Math.PI) * distance
                        ],
                        y: [
                          Math.sin(angle) * distance, 
                          0, 
                          Math.sin(angle + Math.PI) * distance
                        ],
                        opacity: [0, 0.8, 0],
                        scale: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 4 + Math.random(),
                        repeat: Infinity,
                        delay: delay,
                        ease: "easeInOut"
                      }}
                    />
                  );
                })}
                
                {/* Rotation container */}
                <motion.div 
                  className="w-full h-full relative"
                  animate={{
                    rotateY: [0, 360],
                    rotateX: [0, 5, -5, 0],
                    rotateZ: [0, 3, 0, -3, 0],
                  }}
                  transition={{
                    rotateY: { 
                      duration: 30, 
                      repeat: Infinity, 
                      ease: "linear"
                    },
                    rotateX: { 
                      duration: 20, 
                      repeat: Infinity, 
                      ease: "easeInOut"
                    },
                    rotateZ: { 
                      duration: 25, 
                      repeat: Infinity, 
                      ease: "easeInOut"
                    }
                  }}
                  style={{
                    transformStyle: "preserve-3d",
                    willChange: "transform"
                  }}
                >
                  {/* Cube faces */}
                  {[...Array(6)].map((_, index) => {
                    const transforms = [
                      'rotateY(0deg) translateZ(150px)',    // front
                      'rotateY(180deg) translateZ(150px)',  // back
                      'rotateY(90deg) translateZ(150px)',   // right
                      'rotateY(-90deg) translateZ(150px)',  // left
                      'rotateX(90deg) translateZ(150px)',   // top
                      'rotateX(-90deg) translateZ(150px)'   // bottom
                    ];
                    
                    // Server-themed color palette
                    const colors = [
                      'rgb(139, 92, 246)', // Purple
                      'rgb(99, 102, 241)',  // Indigo
                      'rgb(168, 85, 247)', // Violet
                      'rgb(79, 70, 229)',  // Indigo dark
                      'rgb(16, 185, 129)', // Emerald
                      'rgb(56, 189, 248)'  // Light blue
                    ];
                    
                    const color = colors[index];
                    
                    return (
                      <motion.div
                        key={`face-${index}`}
                        className="absolute w-[300px] h-[300px] rounded-lg"
                        style={{
                          transform: transforms[index],
                          transformStyle: "preserve-3d",
                          backfaceVisibility: "visible",
                          background: `linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.8))`,
                          border: `2px solid ${color}`,
                          boxShadow: `0 0 20px ${color}70`,
                          willChange: "transform, box-shadow"
                        }}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          boxShadow: [`0 0 15px ${color}70`, `0 0 25px ${color}80`, `0 0 15px ${color}70`],
                          borderWidth: ["2px", "2.5px", "2px"],
                          borderColor: [color, color, color]
                        }}
                        transition={{
                          opacity: { duration: 1 },
                          boxShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                          borderWidth: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                          borderColor: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                      >
                        {/* Server front rack design */}
                        {(index === 0) && (
                          <div className="absolute inset-0 flex flex-col p-4">
                            {/* Server rack units */}
                            {[...Array(4)].map((_, rackIndex) => (
                              <motion.div
                                key={`rack-${rackIndex}`}
                                className="h-[46px] mb-4 bg-slate-800/80 rounded-md border border-slate-700 relative overflow-hidden"
                                animate={{
                                  borderColor: [
                                    'rgba(51, 65, 85, 0.5)',
                                    `rgba(${color.match(/\d+/g)[0]}, ${color.match(/\d+/g)[1]}, ${color.match(/\d+/g)[2]}, 0.6)`,
                                    'rgba(51, 65, 85, 0.5)'
                                  ]
                                }}
                                transition={{
                                  duration: 4,
                                  repeat: Infinity,
                                  delay: rackIndex * 0.3,
                                  ease: "easeInOut"
                                }}
                              >
                                {/* Server LEDs */}
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center space-x-1.5">
                                  <motion.div 
                                    className="w-1.5 h-1.5 rounded-full bg-green-500"
                                    animate={{ opacity: [0.7, 1, 0.7] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: rackIndex * 0.3 }}
                                  />
                                  <motion.div 
                                    className="w-1.5 h-1.5 rounded-full bg-blue-500"
                                    animate={{ opacity: [0.5, 0.9, 0.5] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: rackIndex * 0.4 + 0.2 }}
                                  />
                                </div>
                                
                                {/* Server rack handles */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-3">
                                  <div className="w-6 h-3 rounded-sm bg-slate-900/60 border border-slate-600"/>
                                  <div className="w-6 h-3 rounded-sm bg-slate-900/60 border border-slate-600"/>
                                </div>
                                
                                {/* Activity lights */}
                                <div className="absolute right-20 top-1/2 -translate-y-1/2 flex space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <motion.div 
                                      key={`light-${i}`}
                                      className="w-1 h-1 rounded-full"
                                      style={{ backgroundColor: i % 2 === 0 ? '#22c55e' : '#3b82f6' }}
                                      animate={{ opacity: [0.4, 1, 0.4] }}
                                      transition={{ 
                                        duration: 0.8, 
                                        repeat: Infinity, 
                                        delay: i * 0.2,
                                        repeatType: 'reverse'
                                      }}
                                    />
                                  ))}
                                </div>
                                
                                {/* Server labels */}
                                {rackIndex === 0 && (
                                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[6px] text-slate-400 font-mono">
                                    SYSTEM CONTROLLER
                                  </div>
                                )}
                                {rackIndex === 1 && (
                                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[6px] text-slate-400 font-mono">
                                    NETWORK GATEWAY
                                  </div>
                                )}
                                {rackIndex === 2 && (
                                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[6px] text-slate-400 font-mono">
                                    STORAGE ARRAY
                                  </div>
                                )}
                                {rackIndex === 3 && (
                                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[6px] text-slate-400 font-mono">
                                    COMPUTE CLUSTER
                                  </div>
                                )}
                              </motion.div>
                            ))}
                            
                            {/* Company logo on front panel */}
                            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center">
                              <motion.div
                                className="font-bold text-xl text-white backdrop-blur-sm px-4 py-2 rounded-lg"
                                style={{ textShadow: `0 0 10px ${color}` }}
                                animate={{ 
                                  textShadow: [
                                    `0 0 10px ${color}`,
                                    `0 0 20px ${color}`,
                                    `0 0 10px ${color}`
                                  ],
                                  scale: [1, 1.05, 1]
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                              >
                                NextGenRDP
                              </motion.div>
                              <motion.div
                                className="text-xs text-slate-300 tracking-wider"
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                ENTERPRISE SERVER
                              </motion.div>
                            </div>
                          </div>
                        )}
                        
                        {/* Back server panel */}
                        {(index === 1) && (
                          <div className="absolute inset-0 p-4">
                            {/* Cooling fans */}
                            <div className="flex justify-center gap-4 mb-4">
                              {[...Array(2)].map((_, fanIndex) => (
                                <div key={`fan-${fanIndex}`} className="relative w-20 h-20 rounded-full bg-slate-900/80 border border-slate-800 overflow-hidden">
                                  <motion.div
                                    className="absolute inset-0 flex items-center justify-center"
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                  >
                                    {[...Array(6)].map((_, bladeIndex) => {
                                      const angle = (bladeIndex / 6) * 360;
                                      return (
                                        <div 
                                          key={`blade-${bladeIndex}`}
                                          className="absolute w-16 h-3 bg-slate-800 rounded-full"
                                          style={{ transform: `rotate(${angle}deg)` }}
                                        />
                                      );
                                    })}
                                    <div className="w-6 h-6 rounded-full bg-slate-700" />
                                  </motion.div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Power and Network connections */}
                            <div className="flex justify-between mt-5">
                              <div className="grid grid-cols-2 gap-2">
                                {[...Array(4)].map((_, portIndex) => (
                                  <div key={`port-${portIndex}`} className="h-6 w-10 bg-slate-800 border border-slate-700 rounded-sm flex items-center justify-center">
                                    <motion.div 
                                      className="w-1.5 h-1.5 rounded-full"
                                      style={{ backgroundColor: portIndex % 2 === 0 ? '#22c55e' : '#3b82f6' }}
                                      animate={{ opacity: [0.5, 1, 0.5] }}
                                      transition={{ duration: 1.5, repeat: Infinity, delay: portIndex * 0.3 }}
                                    />
                                  </div>
                                ))}
                              </div>
                              
                              <div className="h-14 w-20 bg-slate-800 border border-slate-700 rounded-sm relative">
                                <div className="absolute top-1 left-2 text-[6px] text-slate-400 font-mono">POWER</div>
                                <div className="absolute bottom-2 right-2 flex gap-1 items-center">
                                  <motion.div 
                                    className="w-2 h-2 rounded-full bg-green-500"
                                    animate={{ opacity: [0.6, 1, 0.6] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  />
                                  <div className="text-[6px] text-green-400 font-mono">ON</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Side panel with cooling vents */}
                        {(index === 2 || index === 3) && (
                          <div className="absolute inset-0 p-4">
                            <div className="grid grid-cols-4 gap-2 mb-4">
                              {[...Array(16)].map((_, ventIndex) => (
                                <motion.div 
                                  key={`vent-${ventIndex}`}
                                  className="h-8 bg-slate-800/60 rounded-sm"
                                  animate={{ 
                                    backgroundColor: [
                                      'rgba(30, 41, 59, 0.6)',
                                      `rgba(${color.match(/\d+/g)[0]}, ${color.match(/\d+/g)[1]}, ${color.match(/\d+/g)[2]}, 0.2)`,
                                      'rgba(30, 41, 59, 0.6)'
                                    ]
                                  }}
                                  transition={{ 
                                    duration: 3, 
                                    repeat: Infinity, 
                                    delay: (ventIndex % 4) * 0.2,
                                    ease: "easeInOut"
                                  }}
                                />
                              ))}
                            </div>
                            
                            {/* Hardware specs */}
                            <div className="absolute bottom-4 left-4 flex flex-col">
                              <div className="text-[7px] font-mono text-slate-400 mb-1">
                                {index === 2 ? "• E5-2690v4 CPU" : "• 128GB DDR4 ECC"}
                              </div>
                              <div className="text-[7px] font-mono text-slate-400 mb-1">
                                {index === 2 ? "• 8x NVMe SSD" : "• 10GbE Network"}
                              </div>
                              <div className="text-[7px] font-mono text-slate-400">
                                {index === 2 ? "• RAID 10 Array" : "• 1200W PSU"}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Top with circuit board design */}
                        {index === 4 && (
                          <div className="absolute inset-0 bg-slate-900/60">
                            {/* Circuit traces */}
                            {[...Array(8)].map((_, lineIndex) => (
                              <motion.div
                                key={`circuit-h-${lineIndex}`}
                                className="absolute h-[1px] bg-emerald-500/40"
                                style={{
                                  width: '100%',
                                  top: `${Math.random() * 100}%`,
                                  left: 0,
                                }}
                                animate={{ 
                                  opacity: [0.3, 0.7, 0.3],
                                  backgroundColor: [
                                    'rgba(16, 185, 129, 0.3)',
                                    'rgba(16, 185, 129, 0.7)',
                                    'rgba(16, 185, 129, 0.3)'
                                  ]
                                }}
                                transition={{ 
                                  duration: 4, 
                                  repeat: Infinity,
                                  delay: lineIndex * 0.3
                                }}
                              />
                            ))}
                            
                            {[...Array(8)].map((_, lineIndex) => (
                              <motion.div
                                key={`circuit-v-${lineIndex}`}
                                className="absolute w-[1px] bg-purple-500/40"
                                style={{
                                  height: '100%',
                                  left: `${Math.random() * 100}%`,
                                  top: 0,
                                }}
                                animate={{ 
                                  opacity: [0.3, 0.7, 0.3],
                                  backgroundColor: [
                                    'rgba(168, 85, 247, 0.3)',
                                    'rgba(168, 85, 247, 0.7)',
                                    'rgba(168, 85, 247, 0.3)'
                                  ]
                                }}
                                transition={{ 
                                  duration: 4, 
                                  repeat: Infinity,
                                  delay: lineIndex * 0.4
                                }}
                              />
                            ))}
                            
                            {/* CPU component */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70px] h-[70px] bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                              <motion.div
                                animate={{
                                  opacity: [0.7, 1, 0.7],
                                  scale: [1, 1.05, 1]
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                              >
                                <CpuChipIcon className="h-10 w-10 text-blue-400/70" />
                              </motion.div>
                            </div>
                          </div>
                        )}
                        
                        {/* Bottom panel with connectors */}
                        {index === 5 && (
                          <div className="absolute inset-0 bg-slate-800/95">
                            <div className="absolute inset-2 grid grid-cols-6 grid-rows-6 gap-2">
                              {[...Array(36)].map((_, gridIndex) => {
                                const isSpecial = [7, 8, 13, 14, 19, 20, 25, 26].includes(gridIndex);
                                return (
                                  <motion.div
                                    key={`grid-${gridIndex}`}
                                    className={`rounded-sm border ${isSpecial ? 'bg-slate-700 border-slate-600' : 'bg-slate-800/40 border-slate-800/60'}`}
                                    animate={isSpecial ? {
                                      backgroundColor: [
                                        'rgba(51, 65, 85, 0.8)',
                                        `rgba(${color.match(/\d+/g)[0]}, ${color.match(/\d+/g)[1]}, ${color.match(/\d+/g)[2]}, 0.3)`,
                                        'rgba(51, 65, 85, 0.8)'
                                      ]
                                    } : {}}
                                    transition={isSpecial ? {
                                      duration: 3,
                                      repeat: Infinity,
                                      delay: (gridIndex % 8) * 0.2,
                                      ease: "easeInOut"
                                    } : {}}
                                  >
                                    {isSpecial && (
                                      <motion.div
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
                                        style={{ backgroundColor: color }}
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                      />
                                    )}
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Light-emitting edges */}
                        {[...Array(4)].map((_, edgeIndex) => {
                          const edgePositions = [
                            { className: "top-0 left-0 right-0 h-[2px]", gradientDir: "90deg" },
                            { className: "bottom-0 left-0 right-0 h-[2px]", gradientDir: "90deg" },
                            { className: "left-0 top-0 bottom-0 w-[2px]", gradientDir: "180deg" },
                            { className: "right-0 top-0 bottom-0 w-[2px]", gradientDir: "180deg" }
                          ];
                          
                          const { className, gradientDir } = edgePositions[edgeIndex];
                          
                          return (
                            <motion.div
                              key={`edge-${index}-${edgeIndex}`}
                              className={`absolute ${className} rounded-full z-10`}
                              style={{
                                background: `linear-gradient(${gradientDir}, ${color}00, ${color}, ${color}00)`,
                                boxShadow: `0 0 10px ${color}, 0 0 5px ${color}`
                              }}
                              animate={{
                                opacity: [0.6, 1, 0.6],
                                boxShadow: [
                                  `0 0 5px ${color}, 0 0 3px ${color}`,
                                  `0 0 15px ${color}, 0 0 8px ${color}`,
                                  `0 0 5px ${color}, 0 0 3px ${color}`
                                ]
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: edgeIndex * 0.5,
                                ease: "easeInOut"
                              }}
                            />
                          );
                        })}
                      </motion.div>
                    );
                  })}
                  
                  {/* Core energy sphere */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-20 h-20 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-violet-500 to-purple-700 rounded-full shadow-lg z-40"
                    style={{
                      boxShadow: "0 0 30px rgba(139, 92, 246, 0.8)",
                      willChange: "transform, opacity, box-shadow"
                    }}
                    animate={{
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        "0 0 25px 8px rgba(139, 92, 246, 0.7)",
                        "0 0 40px 15px rgba(139, 92, 246, 0.8)",
                        "0 0 25px 8px rgba(139, 92, 246, 0.7)"
                      ]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {/* Inner glow pulse */}
                    <motion.div
                      className="absolute inset-0 rounded-full overflow-hidden bg-gradient-to-br from-purple-300/80 to-fuchsia-600/80"
                      animate={{
                        opacity: [0.7, 0.9, 0.7]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    {/* Energy rings */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <svg width="100%" height="100%" viewBox="0 0 100 100">
                        <defs>
                          <radialGradient id="energyGradient" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
                            <stop offset="70%" stopColor="rgba(255, 255, 255, 0)" />
                          </radialGradient>
                        </defs>
                        <motion.circle 
                          cx="50" 
                          cy="50" 
                          r="35" 
                          fill="none" 
                          stroke="url(#energyGradient)" 
                          strokeWidth="3"
                          animate={{ r: [30, 38, 30], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </svg>
                    </motion.div>
                    
                    {/* Server stack icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ServerStackIcon className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
              
              {/* Enhanced ambient glow */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0.1) 30%, transparent 60%)",
                  filter: "blur(30px)"
                }}
                animate={{
                  opacity: [0.4, 0.5, 0.4],
                  scale: [0.95, 1.05, 0.95]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Digital code floating effect */}
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={`code-${i}`}
                  className="absolute text-[10px] font-mono text-purple-500/70 pointer-events-none z-10"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: `${10 + Math.random() * 80}%`,
                    textShadow: '0 0 3px rgba(139, 92, 246, 0.8)'
                  }}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{
                    opacity: [0, 0.7, 0],
                    y: [0, 30]
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    repeat: Infinity,
                    delay: i * 0.7,
                    repeatDelay: Math.random() * 3
                  }}
                >
                  {["01", "10", "</>", "[]", "{}"][Math.floor(Math.random() * 5)]}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Admin Profile */}
      <div className="hidden lg:block absolute right-8 bottom-8 z-30 w-[320px]">
        <AdminProfile 
          name="Ahmad Ch."
          role="CEO & CTO"
        />
      </div>
    </section>
  );
};

export default HeroSection;