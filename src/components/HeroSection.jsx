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
  LockClosedIcon,
  MicrophoneIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import {
  ArrowRightIcon,
  CheckBadgeIcon as CheckBadgeSolidIcon,
  SparklesIcon,
  StarIcon
} from '@heroicons/react/24/solid';
import { FaWhatsapp, FaServer, FaRocket, FaShieldAlt, FaDatabase, FaCube, FaMicrophone } from 'react-icons/fa';

// Import the AnimatedCube component
import AnimatedCube from './AnimatedCube';

// Background particles component
const ParticleBackground = () => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    const newParticles = Array.from({ length: 100 }, () => ({
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
  const promoCode = "NEXTGEN20";
  const discount = "20%";
  
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
          
          {/* 3D Animated Cube */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <AnimatedCube />
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