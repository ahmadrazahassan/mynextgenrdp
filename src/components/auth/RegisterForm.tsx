'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User as UserIcon, Mail, Lock, Loader2, AlertTriangle, CheckCircle2, Eye, EyeOff, ShieldCheck, Info, XCircle, Check, ArrowRight, AlertCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface RegisterFormProps {
  onRegisterSuccess?: () => void;
}

type FieldError = {
  field: 'fullName' | 'email' | 'password' | 'confirmPassword';
  message: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const { register, login, error: authError, clearError } = useAuth();
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);

  const hasFieldError = (field: FieldError['field']) => {
    return fieldErrors.some(error => error.field === field);
  };

  const getFieldError = (field: FieldError['field']) => {
    return fieldErrors.find(error => error.field === field)?.message || null;
  };

  const handleFieldChange = (field: FieldError['field']) => {
    if (formError) setFormError(null);
    
    // Remove error for this specific field
    setFieldErrors(prev => prev.filter(error => error.field !== field));
  };

  // Calculate password strength
  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) {
      setPasswordStrength(0);
      setPasswordFeedback([]);
      return;
    }

    let strength = 0;
    const feedback: string[] = [];

    // Length check
    if (pwd.length < 8) {
      feedback.push('Use at least 8 characters');
    } else {
      strength += 1;
    }

    // Complexity checks
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSpecialChars = /[^A-Za-z0-9]/.test(pwd);

    // Add feedback for missing criteria
    if (!hasUppercase) feedback.push('Add uppercase letters');
    if (!hasLowercase) feedback.push('Add lowercase letters');
    if (!hasNumbers) feedback.push('Add numbers');
    if (!hasSpecialChars) feedback.push('Add special characters (!@#$%, etc.)');

    // Increment strength based on complexity
    let complexityCount = 0;
    if (hasUppercase) complexityCount++;
    if (hasLowercase) complexityCount++;
    if (hasNumbers) complexityCount++;
    if (hasSpecialChars) complexityCount++;

    // Adjust strength based on complexity
    if (complexityCount >= 3) strength += 1;
    if (complexityCount >= 4) strength += 1;

    // Length bonus
    if (pwd.length >= 12) strength += 1;

    // Update state
    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  };

  const validateField = (field: string, value: string) => {
    if (field === 'password') {
      calculatePasswordStrength(value);
      
      if (confirmPassword) {
        // Also validate confirmPassword if it exists
        if (value !== confirmPassword) {
          setErrorType('confirmPassword');
        } else {
          // Clear error if passwords now match
          if (errorType === 'confirmPassword') {
            setErrorType(null);
          }
        }
      }
    } else if (field === 'confirmPassword') {
      if (value !== password) {
        setErrorType('confirmPassword');
      } else {
        if (errorType === 'confirmPassword') {
          setErrorType(null);
        }
      }
    } else if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        setErrorType('email');
      } else {
        if (errorType === 'email') {
          setErrorType(null);
        }
      }
    }
  };

  const getPasswordStrengthLabel = () => {
    if (!password) return { text: "Password Strength", color: "text-gray-400" };
    
    if (passwordStrength === 0) return { text: "Very Weak", color: "text-gray-400" };
    if (passwordStrength === 1) return { text: "Weak", color: "text-red-500" };
    if (passwordStrength === 2) return { text: "Moderate", color: "text-orange-500" };
    if (passwordStrength === 3) return { text: "Strong", color: "text-emerald-500" };
    return { text: "Very Strong", color: "text-green-500" };
  };
  
  const getPasswordStrengthColor = (): string => {
    if (passwordStrength === 4) return 'bg-green-500';
    if (passwordStrength === 3) return 'bg-emerald-500';
    if (passwordStrength === 2) return 'bg-orange-500';
    if (passwordStrength === 1) return 'bg-red-500';
    return 'bg-gray-400';
  };

  // Validate form fields
  const validateFields = (): boolean => {
    const errors: FieldError[] = [];
    
    // Full Name validation
    if (!fullName.trim()) {
      errors.push({ field: 'fullName', message: 'Full name is required' });
    } else if (fullName.trim().length < 2) {
      errors.push({ field: 'fullName', message: 'Full name must be at least 2 characters' });
    }
    
    // Email validation
    if (!email) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' });
      }
    }
    
    // Password validation
    if (!password) {
      errors.push({ field: 'password', message: 'Password is required' });
    } else if (passwordStrength < 2) {
      errors.push({ 
        field: 'password', 
        message: 'Password is too weak. Include uppercase, lowercase, numbers, and special characters'
      });
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Please confirm your password' });
    } else if (password !== confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    }
    
    setFieldErrors(errors);
    return errors.length === 0;
  };

  const handleNextStep = () => {
    // Validate first step fields
    const errors: FieldError[] = [];
    
    if (!fullName.trim()) {
      errors.push({ field: 'fullName', message: 'Full name is required' });
    }
    
    if (!email) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' });
      }
    }
    
    setFieldErrors(errors);
    
    if (errors.length === 0) {
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();
    
    // Final validation
    if (!validateFields()) {
      return;
    }
    
    setIsLoading(true);

    try {
      // Register the user
      await register({ fullName, email, password });
      
      // After successful registration, also log them in
      try {
        await login({ email, password });
      } catch (loginErr) {
        console.error("Auto-login after registration failed:", loginErr);
        // Continue with success flow even if auto-login fails
      }
      
      setIsSuccess(true);
      
      toast({ 
        title: "Registration Successful", 
        description: "Your account has been created successfully.",
        variant: "default",
        className: "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-800 rounded-2xl",
      });
      
      // Call the success callback with a small delay to ensure state updates
      if (onRegisterSuccess) {
        setTimeout(() => {
          onRegisterSuccess();
        }, 800);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Registration failed. Please try again.';
      
      // Check for specific error messages to set field errors
      const lowerMsg = errorMsg.toLowerCase();
      if (lowerMsg.includes('email') && lowerMsg.includes('exists')) {
        setFieldErrors([{ field: 'email', message: 'This email is already registered' }]);
      } else {
        setFormError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset step to 1 when form is loaded
  useEffect(() => {
    setCurrentStep(1);
  }, []);

  // If there's an error, handle it professionally
  useEffect(() => {
    if (authError) {
      setErrorMessage(authError);
      
      // Try to determine error type from the error message
      const lowerMsg = authError.toLowerCase();
      if (lowerMsg.includes('email') && (lowerMsg.includes('exists') || lowerMsg.includes('taken') || lowerMsg.includes('already'))) {
        setErrorType('email');
        setCurrentStep(1); // Go to email step if email error
      } else if (lowerMsg.includes('password')) {
        setErrorType('password');
      } else {
        setErrorType('general');
      }
    }
  }, [authError]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AnimatePresence mode="wait">
          {errorMessage && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Alert 
                variant="destructive" 
                className="bg-gradient-to-r from-red-50/90 to-rose-50/90 backdrop-blur-sm border border-red-200/80 rounded-2xl shadow-sm mb-4"
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1 bg-red-100/70 backdrop-blur-sm rounded-full flex-shrink-0 mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-red-700 font-medium text-sm">
                      {errorMessage}
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
              <Alert className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-emerald-100 rounded-full">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <AlertDescription className="text-emerald-700 font-medium">
                    Registration successful! Redirecting...
                  </AlertDescription>
                </div>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <motion.div 
                animate={{ 
                  backgroundColor: currentStep === 1 ? 'rgb(79, 70, 229)' : 'rgb(99, 102, 241)',
                  scale: currentStep === 1 ? 1 : 0.9
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
              >
                {currentStep > 1 ? <Check className="h-5 w-5" /> : "1"}
              </motion.div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${currentStep === 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                  Account Info
                </p>
              </div>
            </div>
            
            <div className="hidden sm:block w-16 h-0.5 bg-gray-200"></div>
            
            <div className="flex items-center">
              <motion.div 
                animate={{ 
                  backgroundColor: currentStep === 2 ? 'rgb(79, 70, 229)' : 'rgb(209, 213, 219)',
                  scale: currentStep === 2 ? 1 : 0.9
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
              >
                2
              </motion.div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${currentStep === 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                  Security
                </p>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 flex items-center">
                  Full Name
                  {hasFieldError('fullName') && (
                    <span className="ml-2 text-xs text-red-500 flex items-center">
                      <XCircle className="h-3 w-3 mr-1" />
                      {getFieldError('fullName')}
                    </span>
                  )}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <UserIcon className={`h-5 w-5 ${hasFieldError('fullName') ? 'text-red-400' : isFocused === 'fullName' ? 'text-indigo-500' : 'text-gray-400'} transition-colors duration-200`} />
                  </div>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); handleFieldChange('fullName'); }}
                    onFocus={() => setIsFocused('fullName')}
                    onBlur={() => setIsFocused(null)}
                    className={`pl-10 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm focus:ring-2 rounded-2xl shadow-sm transition-all duration-200
                      ${hasFieldError('fullName') 
                        ? 'border-red-300/80 focus:border-red-500 focus:ring-red-500 dark:border-red-700/80' 
                        : 'border-gray-300/80 dark:border-gray-700/80 focus:border-indigo-500 focus:ring-indigo-500 group-hover:border-indigo-300 dark:group-hover:border-indigo-700'}`}
                    placeholder="John Doe"
                    disabled={isLoading || isSuccess}
                  />
                  
                  {hasFieldError('fullName') && (
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
                
                {hasFieldError('fullName') && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <p id="fullName-error" className="mt-1.5 text-xs text-red-500 flex items-start pl-2 pr-3 py-1.5 bg-red-50/50 dark:bg-red-900/10 rounded-xl">
                      <AlertCircle className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                      <span>{getFieldError('fullName')}</span>
                    </p>
                  </motion.div>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email-register" className="block text-sm font-medium text-gray-700 flex items-center">
                  Email Address
                  {hasFieldError('email') && (
                    <span className="ml-2 text-xs text-red-500 flex items-center">
                      <XCircle className="h-3 w-3 mr-1" />
                      {getFieldError('email')}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className={`h-5 w-5 ${hasFieldError('email') ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <Input
                    id="email-register"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); handleFieldChange('email'); }}
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
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <p id="email-error" className="mt-1.5 text-xs text-red-500 flex items-start pl-2 pr-3 py-1.5 bg-red-50/50 dark:bg-red-900/10 rounded-xl">
                        <AlertCircle className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                        {email.includes('@') ? 
                          <span>This email is already registered. Try logging in instead.</span> : 
                          <span>Please enter a valid email address.</span>
                        }
                      </p>
                    </motion.div>
                  )}
                  
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[18px] opacity-0 group-hover:opacity-100 -z-10 transition-opacity duration-300 blur-sm"></div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  type="button"
                  onClick={handleNextStep}
                  className="w-full flex justify-center items-center rounded-2xl py-2.5 text-base font-medium shadow-sm transition-all duration-300 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
                  disabled={isLoading || isSuccess}
                >
                  Continue <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}
          
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password-register" className="block text-sm font-medium text-gray-700 flex items-center">
                    Password
                    {errorType === 'password' && (
                      <span className="ml-2 text-xs text-red-500 flex items-center">
                        <XCircle className="h-3 w-3 mr-1" />Too Weak
                      </span>
                    )}
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className={`h-5 w-5 ${errorType === 'password' ? 'text-red-400' : isFocused === 'password' ? 'text-indigo-500' : 'text-gray-400'} transition-colors duration-200`} />
                  </div>
                  <Input
                    id="password-register"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => { 
                      setPassword(e.target.value); 
                      validateField('password', e.target.value);
                    }}
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
                
                                  {errorType === 'password' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <p id="password-error" className="mt-1.5 text-xs text-red-500 flex items-start pl-2 pr-3 py-1.5 bg-red-50/50 dark:bg-red-900/10 rounded-xl">
                        <AlertCircle className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                        <span>Your password isn't strong enough. Try adding uppercase letters, numbers, and special characters.</span>
                      </p>
                    </motion.div>
                  )}
                  
                  {/* Password strength meter with improved styling */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <ShieldCheck className={`h-3.5 w-3.5 ${
                          passwordStrength === 0 ? 'text-gray-400' :
                          passwordStrength === 1 ? 'text-red-500' :
                          passwordStrength === 2 ? 'text-orange-500' :
                          passwordStrength === 3 ? 'text-emerald-500' :
                          'text-green-500'
                        }`} />
                        <span className="text-xs font-medium text-gray-600">
                          {password ? getPasswordStrengthLabel().text : 'Password Strength'}
                        </span>
                      </div>
                      
                      {password && passwordStrength < 3 && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <Info className="h-3 w-3 mr-1 text-amber-500" />
                          Make it stronger
                        </span>
                      )}
                    </div>
                    
                    <div className="flex h-1.5 w-full rounded-full bg-gray-200/70 backdrop-blur-sm overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(passwordStrength + 1) * 20}%` }}
                        transition={{ duration: 0.3 }}
                        className={`h-full ${
                          passwordStrength === 0 ? 'bg-gray-400' :
                          passwordStrength === 1 ? 'bg-red-500' :
                          passwordStrength === 2 ? 'bg-orange-500' :
                          passwordStrength === 3 ? 'bg-emerald-500' :
                          'bg-green-500'
                        }`}
                      />
                    </div>
                    
                    {passwordFeedback.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className="mt-2 text-xs text-amber-600 space-y-1.5 px-3 py-2 bg-amber-50/60 dark:bg-amber-900/10 rounded-xl"
                      >
                        {passwordFeedback.slice(0, 2).map((feedback, idx) => (
                          <div key={idx} className="flex items-start">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-500 mr-1.5 mt-0.5 flex-shrink-0" />
                            <span>{feedback}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="confirm-password-register" className="block text-sm font-medium text-gray-700 flex items-center">
                    Confirm Password
                    {errorType === 'confirmPassword' && (
                      <span className="ml-2 text-xs text-red-500 flex items-center">
                        <XCircle className="h-3 w-3 mr-1" />Don't Match
                      </span>
                    )}
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className={`h-5 w-5 ${errorType === 'confirmPassword' ? 'text-red-400' : isFocused === 'confirmPassword' ? 'text-indigo-500' : 'text-gray-400'} transition-colors duration-200`} />
                  </div>
                  <Input
                    id="confirm-password-register"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); validateField('confirmPassword', e.target.value); }}
                    onFocus={() => setIsFocused('confirmPassword')}
                    onBlur={() => setIsFocused(null)}
                    className={`pl-10 pr-10 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm focus:ring-2 rounded-2xl shadow-sm transition-all duration-200
                      ${errorType === 'confirmPassword' 
                        ? 'border-red-300/80 focus:border-red-500 focus:ring-red-500 dark:border-red-700/80' 
                        : 'border-gray-300/80 dark:border-gray-700/80 focus:border-indigo-500 focus:ring-indigo-500 group-hover:border-indigo-300 dark:group-hover:border-indigo-700'}`}
                    placeholder="••••••••"
                    disabled={isLoading || isSuccess}
                    aria-invalid={errorType === 'confirmPassword'}
                    aria-describedby={errorType === 'confirmPassword' ? "confirm-password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>

                  {errorType === 'confirmPassword' && (
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
                
                {errorType === 'confirmPassword' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <p id="confirm-password-error" className="mt-1.5 text-xs text-red-500 flex items-start pl-2 pr-3 py-1.5 bg-red-50/50 dark:bg-red-900/10 rounded-xl">
                      <AlertCircle className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                      <span>The passwords don't match. Please make sure both passwords are identical.</span>
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button"
                  onClick={handlePreviousStep}
                  className="flex-1 flex justify-center items-center rounded-2xl py-2.5 text-base font-medium shadow-sm transition-all duration-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  disabled={isLoading || isSuccess}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className={`flex-1 flex justify-center items-center rounded-2xl py-2.5 text-base font-medium shadow-sm transition-all duration-300 ${
                    isSuccess 
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                      : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
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
                  
                  <span>
                    {isLoading ? 'Creating...' : isSuccess ? 'Created!' : 'Create Account'}
                  </span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <p className="text-xs text-center text-gray-500 mt-4">
          By creating an account, you agree to our{' '}
          <a href="/terms" className="text-indigo-600 hover:text-indigo-500 font-medium hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-indigo-600 hover:text-indigo-500 font-medium hover:underline">
            Privacy Policy
          </a>
        </p>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center items-center mt-2"
        >
          <div className="p-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
          </div>
          <span className="text-xs text-gray-500 ml-1.5">Secure, encrypted registration</span>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default RegisterForm; 