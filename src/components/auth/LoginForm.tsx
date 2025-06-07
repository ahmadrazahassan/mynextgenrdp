'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertTriangle, CheckCircle2, Eye, EyeOff, Mail, Lock, LogIn, CheckCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'email' | 'password' | 'general' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState<'email' | 'password' | null>(null);
  const { login, error: authError, clearError } = useAuth();
  const { toast } = useToast();

  // Handle any existing auth errors from context
  useEffect(() => {
    if (authError) {
      const { type, message } = parseErrorMessage(authError);
      setFormError(message);
      setErrorType(type);
      setIsLoading(false); // Ensure loading state is reset if there's an error
    }
  }, [authError]);

  const handleFieldChange = (field: 'email' | 'password') => {
    // Always clear all errors when any field changes for a cleaner UI
    if (formError) {
      setFormError(null);
      setErrorType(null);
      setAttemptsRemaining(null);
    }
  };

  // Parse error messages to determine error type
  const parseErrorMessage = (message: string): { type: 'email' | 'password' | 'general', message: string } => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('email') && (lowerMessage.includes('not found') || lowerMessage.includes('invalid email'))) {
      return { type: 'email', message: 'Email address not found. Please check your email or register a new account.' };
    }
    
    if (lowerMessage.includes('password') && lowerMessage.includes('invalid')) {
      return { type: 'password', message: 'Incorrect password. Please try again.' };
    }
    
    if (lowerMessage.includes('attempt')) {
      return { type: 'password', message: 'Too many failed attempts. Please try again later.' };
    }
    
    if (lowerMessage.includes('invalid email or password')) {
      return { type: 'general', message: 'Invalid email or password. Please check your credentials.' };
    }
    
    return { type: 'general', message: message || 'Login failed. Please check your credentials and try again.' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setErrorType(null);
    setAttemptsRemaining(null);
    clearError();
    setIsLoading(true);

    // Email validation
    if (!email) {
      setFormError('Email is required');
      setErrorType('email');
      setIsLoading(false);
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      setErrorType('email');
      setIsLoading(false);
      return;
    }

    // Password validation
    if (!password) {
      setFormError('Password is required');
      setErrorType('password');
      setIsLoading(false);
      return;
    }

    try {
      await login({ email, password, rememberMe });
      
      setIsSuccess(true);
      
      toast({ 
        title: "Login Successful", 
        description: "Welcome back!",
        variant: "default",
        className: "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-800 rounded-2xl",
      });
      
      if (onLoginSuccess) {
        setTimeout(() => {
          onLoginSuccess();
        }, 800);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setIsLoading(false);
      const errorMsg = err.message || 'Login failed. Please check your credentials.';
      const { type, message } = parseErrorMessage(errorMsg);
      setFormError(message);
      setErrorType(type);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AnimatePresence mode="wait">
          {formError && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Alert 
                variant="destructive" 
                className="bg-gradient-to-r from-red-50/90 to-rose-50/90 backdrop-blur-sm border border-red-200/80 rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="p-3">
                  <div className="text-red-700 font-medium text-sm">
                    {formError}
                  </div>
                </div>
              </Alert>
            </motion.div>
          )}

          {isSuccess && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Alert className="bg-gradient-to-r from-emerald-50/90 to-teal-50/90 backdrop-blur-sm border border-emerald-200/80 rounded-2xl shadow-sm">
                <div className="p-3">
                  <AlertDescription className="text-emerald-700 font-medium">
                    Login successful! Redirecting...
                  </AlertDescription>
                </div>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <label htmlFor="email-login" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            Email Address
            {errorType === 'email' && (
              <span className="ml-2 text-xs text-red-500">
                Invalid
              </span>
            )}
          </label>
          <div className="relative group">
  
            <Input
              id="email-login"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); handleFieldChange('email'); }}
              onFocus={() => setIsFocused('email')}
              onBlur={() => setIsFocused(null)}
              className={`pl-10 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm focus:ring-2 rounded-xl shadow-sm transition-all duration-300
                ${errorType === 'email' 
                  ? 'border-red-300/80 focus:border-red-500 focus:ring-red-500/30 dark:border-red-700/80' 
                  : 'border-gray-300/80 dark:border-gray-700/80 focus:border-indigo-500 focus:ring-indigo-500/30 group-hover:border-indigo-300 dark:group-hover:border-indigo-700'}`}
              placeholder="you@example.com"
              disabled={isLoading || isSuccess}
              aria-invalid={errorType === 'email'}
              aria-describedby={errorType === 'email' ? "email-error" : undefined}
            />
            
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className={`h-5 w-5 ${isFocused === 'email' ? 'text-indigo-500' : 'text-gray-400'} transition-colors duration-200`} />
            </div>

            
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 -z-10 transition-opacity duration-300 blur-sm"></div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="password-login" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              Password
              {errorType === 'password' && (
                <span className="ml-2 text-xs text-red-500">
                  Incorrect
                </span>
              )}
            </label>
            <a 
              href="/forgot-password" 
              className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative group">
  
            <Input
              id="password-login"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); handleFieldChange('password'); }}
              onFocus={() => setIsFocused('password')}
              onBlur={() => setIsFocused(null)}
              className={`pl-10 pr-10 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm focus:ring-2 rounded-xl shadow-sm transition-all duration-300
                ${errorType === 'password' 
                  ? 'border-red-300/80 focus:border-red-500 focus:ring-red-500/30 dark:border-red-700/80' 
                  : 'border-gray-300/80 dark:border-gray-700/80 focus:border-purple-500 focus:ring-purple-500/30 group-hover:border-purple-300 dark:group-hover:border-purple-700'}`}
              placeholder="••••••••"
              disabled={isLoading || isSuccess}
              aria-invalid={errorType === 'password'}
              aria-describedby={errorType === 'password' ? "password-error" : undefined}
            />
            
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className={`h-5 w-5 ${isFocused === 'password' ? 'text-purple-500' : 'text-gray-400'} transition-colors duration-200`} />
            </div>
            
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>

            
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl opacity-0 group-hover:opacity-100 -z-10 transition-opacity duration-300 blur-sm"></div>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-1">
          <div className="relative h-5 w-5 cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
            <input
              type="checkbox"
              id="remember-me"
              name="remember-me"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="peer absolute h-5 w-5 cursor-pointer opacity-0"
            />
            <div className={`h-5 w-5 rounded-md border ${rememberMe ? 'bg-indigo-500 border-indigo-500 dark:bg-indigo-600 dark:border-indigo-600' : 'border-gray-300 dark:border-gray-700'} flex items-center justify-center transition-all duration-200`}>

            </div>
          </div>
          <label htmlFor="remember-me" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
            Remember me for 30 days
          </label>
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full flex justify-center items-center py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl text-white text-base font-medium shadow-sm transition-all duration-300 relative overflow-hidden group"
            disabled={isLoading || isSuccess}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mr-2 h-5 w-5"
              >
                <Loader2 className="h-5 w-5" />
              </motion.div>
            ) : isSuccess ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mr-2"
              >
                <CheckCircle className="h-5 w-5" />
              </motion.div>
            ) : (
              <LogIn className="mr-2 h-5 w-5" />
            )}
            
            <span className="relative z-10">
              {isLoading ? 'Signing in...' : isSuccess ? 'Signed in!' : 'Sign In'}
            </span>
          </Button>
        </div>
        

      </form>
    </motion.div>
  );
};

export default LoginForm; 