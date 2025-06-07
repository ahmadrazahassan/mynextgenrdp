'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuth } from '@/components/providers/AuthProvider';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

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
    <div className="w-full max-w-md mx-auto relative">
      {animatedBackground && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div 
            className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
            animate={{ 
              x: [0, 20, -20, 0], 
              y: [0, -20, 20, 0],
              scale: [1, 1.05, 0.95, 1]
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity,
              repeatType: 'mirror'
            }}
          />
          <motion.div 
            className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
            animate={{ 
              x: [0, -20, 20, 0], 
              y: [0, 20, -20, 0],
              scale: [1, 0.95, 1.05, 1]
            }}
            transition={{ 
              duration: 17, 
              repeat: Infinity,
              repeatType: 'mirror',
              delay: 1
            }}
          />
        </div>
      )}

      <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-md shadow-lg rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl z-0"></div>
        <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl z-0"></div>
        
        <div className="mb-6 text-center relative z-10">
          <div className="flex justify-center mb-2">
            <motion.div
              whileHover={{ rotate: 10 }}
              className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md"
            >
              <Shield className="h-5 w-5 text-white" />
            </motion.div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            {activeTab === 'login' 
              ? 'Sign in to your account to continue' 
              : 'Create a new account to get started'}
          </p>
        </div>

        <Tabs 
          defaultValue={defaultTab} 
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full relative z-10"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger 
              value="login" 
              className="text-sm py-2.5 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              Log in
            </TabsTrigger>
            <TabsTrigger 
              value="register" 
              className="text-sm py-2.5 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              Register
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="space-y-6">
            <LoginForm onLoginSuccess={onSuccess} />
          </TabsContent>
          <TabsContent value="register" className="space-y-6">
            <RegisterForm onRegisterSuccess={onSuccess} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthTabs; 