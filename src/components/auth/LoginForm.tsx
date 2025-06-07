'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Loader2, AlertTriangle, CheckCircle2, Eye, EyeOff, ShieldCheck, XCircle, AlertCircle, Info } from 'lucide-react';
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
                <div className="flex items-start gap-2.5">
                  <div className="p-1 bg-red-100/70 backdrop-blur-sm rounded-full flex-shrink-0 mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-red-700 font-medium text-sm">
                      {formError}
                    </div>
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
                <div className="flex items-center gap-2.5">
                  <div className="p-1 bg-emerald-100/70 backdrop-blur-sm rounded-full">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <AlertDescription className="text-emerald-700 font-medium">
                    Login successful! Redirecting...
                  </AlertDescription>
                </div>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <label htmlFor="email-login" className="block text-sm font-medium text-gray-700 flex items-center">
            Email Address
            {errorType === 'email' && (
              <span className="ml-2 text-xs text-red-500 flex items-center">
                <XCircle className="h-3 w-3 mr-1" />Invalid
              </span>
            )}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className={`h-5 w-5 ${errorType === 'email' ? 'text-red-400' : isFocused === 'email' ? 'text-indigo-500' : 'text-gray-400'} transition-colors duration-200`} />
            </div>
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
              className={`pl-10 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm focus:ring-2 rounded-2xl shadow-sm transition-all duration-200
                ${errorType === 'email' 
                  ? 'border-red-300/80 focus:border-red-500 focus:ring-red-500 dark:border-red-700/80' 
                  : 'border-gray-300/80 dark:border-gray-700/80 focus:border-indigo-500 focus:ring-indigo-500 group-hover:border-indigo-300 dark:group-hover:border-indigo-700'}`}
              placeholder="you@example.com"
              disabled={isLoading || isSuccess}
              aria-invalid={errorType === 'email'}
              aria-describedby={errorType === 'email' ? "email-error" : undefined}
            />
            {errorType === 'email' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <div className="p-0.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <XCircle className="h-4 w-4 text-red-500" />
                </div>
              </motion.div>
            )}
            
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[18px] opacity-0 group-hover:opacity-100 -z-10 transition-opacity duration-300 blur-sm"></div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="password-login" className="block text-sm font-medium text-gray-700 flex items-center">
              Password
              {errorType === 'password' && (
                <span className="ml-2 text-xs text-red-500 flex items-center">
                  <XCircle className="h-3 w-3 mr-1" />Incorrect
                </span>
              )}
            </label>
            <a 
              href="/forgot-password" 
              className="text-xs font-medium text-indigo-600 hover:text-indigo-500 transition-colors hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className={`h-5 w-5 ${errorType === 'password' ? 'text-red-400' : isFocused === 'password' ? 'text-indigo-500' : 'text-gray-400'} transition-colors duration-200`} />
            </div>
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
              className={`pl-10 pr-10 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm focus:ring-2 rounded-2xl shadow-sm transition-all duration-200
                ${errorType === 'password' 
                  ? 'border-red-300/80 focus:border-red-500 focus:ring-red-500 dark:border-red-700/80' 
                  : 'border-gray-300/80 dark:border-gray-700/80 focus:border-indigo-500 focus:ring-indigo-500 group-hover:border-indigo-300 dark:group-hover:border-indigo-700'}`}
              placeholder="••••••••"
              disabled={isLoading || isSuccess}
              aria-invalid={errorType === 'password'}
              aria-describedby={errorType === 'password' ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            {errorType === 'password' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-10 top-1/2 transform -translate-y-1/2"
              >
                <div className="p-0.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <XCircle className="h-4 w-4 text-red-500" />
                </div>
              </motion.div>
            )}
            
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[18px] opacity-0 group-hover:opacity-100 -z-10 transition-opacity duration-300 blur-sm"></div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="relative">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300/80 rounded-md appearance-none checked:bg-indigo-600 transition-colors duration-200 relative z-10"
              disabled={isLoading || isSuccess}
            />
            <motion.div
              initial={false}
              animate={rememberMe ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              className="absolute -top-1 -left-1 w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full"
              style={{ zIndex: -1 }}
            />
            <svg 
              className={`absolute h-4 w-4 top-0 left-0 text-white pointer-events-none transition-opacity duration-200 ${rememberMe ? 'opacity-100' : 'opacity-0'}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            Remember me for 30 days
          </label>
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            className={`w-full flex justify-center items-center rounded-2xl py-2.5 text-base font-medium shadow-sm transition-all duration-300 ${
              isSuccess 
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white relative overflow-hidden"
            }`}
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
                <CheckCircle2 className="h-5 w-5" />
              </motion.div>
            ) : null}
            
            <span className="relative z-10">
              {isLoading ? 'Logging in...' : isSuccess ? 'Logged In!' : 'Log In'}
            </span>
            
            {!isLoading && !isSuccess && (
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 hover:opacity-30 transition-opacity duration-300 rounded-2xl"></div>
            )}
          </Button>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center items-center mt-4 gap-2.5"
        >
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50/80 dark:bg-gray-800/50 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
            <span>Secure, encrypted login</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50/80 dark:bg-gray-800/50 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm">
            <Info className="h-3.5 w-3.5 text-indigo-500" />
            <span>24/7 Support</span>
          </div>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default LoginForm; 