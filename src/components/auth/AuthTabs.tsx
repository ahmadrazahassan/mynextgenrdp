'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuth } from '@/components/providers/AuthProvider';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Shield, LogIn, UserPlus } from 'lucide-react';

interface AuthTabsProps {
  defaultTab?: 'login' | 'register';
  onSuccess?: () => void;
  animatedBackground?: boolean;
}

const AuthTabs: React.FC<AuthTabsProps> = ({ 
  defaultTab = 'login', 
  onSuccess,
  animatedBackground = true
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const { error: authError, clearError } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values for 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smooth springs for more natural motion
  const xSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 150, damping: 20 });
  
  // Transform mouse position into rotation values
  const rotateX = useTransform(ySpring, [-100, 100], [5, -5]);
  const rotateY = useTransform(xSpring, [-100, 100], [-5, 5]);
  
  // Subtle scale and shadow animations
  const scale = useTransform(xSpring, [-100, 100], [0.98, 1.02]);
  const boxShadow = useTransform(
    scale,
    [0.98, 1.02],
    [
      "0 10px 30px -15px rgba(59, 130, 246, 0.15)",
      "0 30px 60px -15px rgba(59, 130, 246, 0.3)"
    ]
  );

  // Handle mouse move for tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    x.set(mouseX);
    y.set(mouseY);
  };
  
  // Reset position on mouse leave
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Clear any errors when switching tabs for a clean state
  const handleTabChange = (value: string) => {
    clearError(); // Clear any authentication errors
    setActiveTab(value as 'login' | 'register');
  };

  // If there's an authentication error, switch to the appropriate tab
  useEffect(() => {
    if (authError) {
      const errorMsg = authError.toLowerCase();
      
      if ((errorMsg.includes('email') && errorMsg.includes('exists')) || 
          errorMsg.includes('register') || 
          errorMsg.includes('sign up') || 
          errorMsg.includes('create account')) {
        setActiveTab('register');
      }
      
      if (errorMsg.includes('invalid credentials') || 
          errorMsg.includes('password') || 
          errorMsg.includes('not found') ||
          errorMsg.includes('login') || 
          errorMsg.includes('sign in')) {
        setActiveTab('login');
      }
    }
  }, [authError]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div 
        className="mb-6 mt-2 flex items-center justify-center"
        style={{ perspective: "1000px" }}
      >
        <motion.div 
          className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-gray-200/50 dark:border-gray-800/50"
          animate={{
            rotateX: activeTab === 'login' ? [0, -3, 0] : [0, 3, 0],
            y: activeTab === 'login' ? [0, -3, 0] : [0, 3, 0]
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <nav className="flex" aria-label="Tabs">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`relative w-1/2 py-3.5 px-4 text-sm font-medium text-center transition-all duration-300 
                ${activeTab === 'login' 
                  ? 'text-indigo-600 dark:text-indigo-400 overflow-hidden z-10' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              <span className="relative z-10 flex items-center justify-center">
                <LogIn className={`w-4 h-4 mr-2 ${activeTab === 'login' ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400'}`} />
                Sign In
              </span>
              {activeTab === 'login' && (
                <motion.div
                  layoutId="tab-highlight"
                  className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 z-0"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`relative w-1/2 py-3.5 px-4 text-sm font-medium text-center transition-all duration-300 
                ${activeTab === 'register' 
                  ? 'text-indigo-600 dark:text-indigo-400 overflow-hidden z-10' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              <span className="relative z-10 flex items-center justify-center">
                <UserPlus className={`w-4 h-4 mr-2 ${activeTab === 'register' ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400'}`} />
                Sign Up
              </span>
              {activeTab === 'register' && (
                <motion.div
                  layoutId="tab-highlight"
                  className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 z-0"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
            <div 
              className="absolute bottom-0 w-1/2 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transition-transform duration-300 ease-out"
              style={{ 
                transform: `translateX(${activeTab === 'login' ? '0%' : '100%'})`,
                boxShadow: '0 0 8px rgba(129, 140, 248, 0.5)'
              }}
            />
          </nav>
        </motion.div>
      </div>

      <motion.div
        className="relative"
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          ref={cardRef}
          className="relative p-6 sm:p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800/50"
          style={{ 
            rotateX,
            rotateY,
            scale,
            boxShadow,
            transformStyle: "preserve-3d",
            transformPerspective: "1000px",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
                    whileHover={{ scale: 1.02 }}
        >
          <div 
            className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-2xl pointer-events-none z-0"
          />
          
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-[18px] opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500 animate-gradient-x pointer-events-none"></div>
          
          {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthTabs; 