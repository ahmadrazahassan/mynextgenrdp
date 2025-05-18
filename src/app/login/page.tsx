"use client";

import "./login.css";
import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useSession } from "@/components/providers/SessionProvider";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { LuFingerprint, LuShieldCheck, LuShield } from "react-icons/lu";
import { RiShieldKeyholeLine } from "react-icons/ri";
import { isLoggedIn } from "@/lib/clientAuth";
import { cn } from "@/lib/utils";

// Login form schema with validation
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams ? searchParams.get('redirect') || '/dashboard' : '/dashboard';
  const { login } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'biometric' | 'otp'>('password');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const email = watch('email');

  // Check if the user is already logged in
  useEffect(() => {
    if (isLoggedIn()) {
      // User is already logged in, redirect to dashboard or other protected page
      toast.success("Already logged in. Redirecting...");
      
      // Use a timeout to let the toast appear before redirecting
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 1000);
    }
  }, [redirectPath]);

  // Check if biometric authentication is available
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        // This is a simplified check - in a real app, you'd use the Web Authentication API
        if (window.PublicKeyCredential) {
          setBiometricAvailable(true);
        }
      } catch (error) {
        console.error("Error checking biometric availability:", error);
        setBiometricAvailable(false);
      }
    };

    checkBiometricAvailability();
  }, []);

  const handleBiometricLogin = async () => {
    setIsSubmitting(true);
    setFormError(null);
    const loadingToastId = toast.loading("Authenticating with biometrics...");
    
    try {
      // Simulate biometric authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.dismiss(loadingToastId);
      toast.success("Biometric authentication successful!");
      
      // Simulate successful login
      login({
        id: "biometric-user-id",
        email: email || "user@example.com",
        fullName: "Biometric User",
        emailVerified: true,
      });
      
      // Use direct location change for more reliable navigation
      window.location.href = redirectPath;
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Biometric authentication failed. Please try another method.");
      setFormError("Biometric authentication failed. Please try another method.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email || errors.email) {
      toast.error("Please enter a valid email address");
      setFormError("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    const loadingToastId = toast.loading("Sending verification code...");
    
    try {
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.dismiss(loadingToastId);
      toast.success("Verification code sent to your email!");
      setOtpSent(true);
      setShowOtpInput(true);
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Failed to send verification code. Please try again.");
      setFormError("Failed to send verification code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error("Please enter the complete verification code");
      setFormError("Please enter the complete verification code");
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    const loadingToastId = toast.loading("Verifying code...");
    
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.dismiss(loadingToastId);
      toast.success("Verification successful!");
      
      // Simulate successful login
      login({
        id: "otp-user-id",
        email: email,
        fullName: "OTP User",
        emailVerified: true,
      });
      
      // Use direct location change for more reliable navigation
      window.location.href = redirectPath;
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Invalid verification code. Please try again.");
      setFormError("Invalid verification code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setFormError(null);
    const loadingToastId = toast.loading("Signing in...");
    
    try {
      // Log login attempt for debugging
      console.log("[Login] Attempting login with:", { 
        email: data.email, 
        rememberMe: data.rememberMe 
      });
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        // Ensure we're not using a cached response
        cache: "no-store",
      });
      
      // Log response status for debugging
      console.log("[Login] Login response status:", response.status);
      
      // Try to parse the response as JSON
      let responseData;
      try {
        responseData = await response.json();
        console.log("[Login] Login response data:", responseData);
      } catch (parseError) {
        console.error("[Login] Error parsing JSON response:", parseError);
        throw {
          status: response.status,
          message: "Could not parse server response",
          originalError: parseError
        };
      }
      
      if (!response.ok) {
        throw {
          status: response.status,
          message: responseData?.error || "Login failed",
          data: responseData,
        };
      }
      
      toast.dismiss(loadingToastId);
      toast.success("Signed in successfully!");
      
      // Update session context
      if (responseData.user) {
        login(responseData.user);
      }
      
      // Use direct location change for more reliable navigation after login
      window.location.href = redirectPath;
    } catch (error: any) {
      console.error("[Login] Login error:", error);
      toast.dismiss(loadingToastId);
      
      // Extract and display error message
      const errorMessage = error.message || "Failed to sign in. Please try again.";
      toast.error(errorMessage);
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 via-indigo-50/10 to-purple-50/10 relative overflow-hidden">
      {/* Background elements with dynamic glass morphism effect */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Animated gradient background */}
        <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-purple-300/20 via-indigo-400/20 to-blue-300/20 blur-[100px] animate-float-slow"></div>
        <div className="absolute -bottom-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-blue-300/20 via-purple-300/20 to-pink-300/20 blur-[100px] animate-float-medium"></div>
        <div className="absolute top-[20%] left-[30%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-pink-300/10 via-indigo-300/10 to-teal-300/10 blur-[80px] animate-float-fast"></div>
        
        {/* Dynamic mesh grid for futuristic effect */}
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] bg-center opacity-[0.015]"></div>
        
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/50 mix-blend-overlay"
              style={{
                width: Math.random() * 8 + 2,
                height: Math.random() * 8 + 2,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                filter: "blur(1px)",
              }}
              animate={{
                y: [0, Math.random() * -200 - 50],
                x: [0, Math.random() * 40 - 20],
                opacity: [0, 0.7, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-[15%] right-[15%] h-28 w-28 rounded-full border border-indigo-200/30 backdrop-blur-sm"></div>
        <div className="absolute bottom-[20%] right-[20%] h-40 w-40 rounded-full border border-purple-200/20 backdrop-blur-sm"></div>
        <div className="absolute top-[40%] left-[10%] h-24 w-24 rounded-full border border-blue-200/20 backdrop-blur-sm"></div>

        {/* Subtle light effect */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full radial-gradient-light opacity-10"></div>
      </div>
      
      {/* Main content container */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="relative w-full overflow-hidden rounded-[2.5rem] backdrop-blur-sm border border-white/30 bg-gradient-to-b from-white/80 to-white/70 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)]">
            {/* Subtle shine effect on the card */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                animate={{ 
                  x: ["0%", "100%"],
                  opacity: [0, 0.2, 0]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut"
                }}
                className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12"
              />
            </div>

            {/* Card header with logo and brand */}
            <div className="relative px-8 pt-10 pb-6 md:px-12">
              <div className="flex items-center justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 blur-md opacity-70 animate-pulse-slow scale-110"></div>
                  <div className="relative h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                    <LuShield className="h-10 w-10 text-white" />
                  </div>
                </div>
              </div>
              <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
                  Welcome Back
                </span>
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Sign in to access your dashboard
              </p>
            </div>
            
            {/* Login method toggle */}
            <div className="px-8 md:px-12">
              <div className="p-1.5 bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-pink-50/80 rounded-full shadow-inner">
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setLoginMethod('password')}
                    className={cn(
                      "relative py-3 px-4 text-sm font-medium rounded-full transition-all duration-300",
                      loginMethod === 'password' 
                        ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 text-white shadow-lg" 
                        : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                    )}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <FiLock className={loginMethod === 'password' ? "text-white" : "text-indigo-400"} />
                      Password
                    </span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setLoginMethod('otp')}
                    className={cn(
                      "relative py-3 px-4 text-sm font-medium rounded-full transition-all duration-300",
                      loginMethod === 'otp' 
                        ? "bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 text-white shadow-lg" 
                        : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                    )}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <RiShieldKeyholeLine className={loginMethod === 'otp' ? "text-white" : "text-purple-400"} />
                      Email OTP
                    </span>
                  </motion.button>
                </div>
              </div>
            </div>
            
            {/* Error display */}
            <AnimatePresence>
              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 mx-8 md:mx-12 bg-red-50 border-l-4 border-red-500 p-4 rounded-2xl"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{formError}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Form container */}
            <div className="px-8 pt-8 pb-6 md:px-12">
              <AnimatePresence mode="wait">
                {loginMethod === 'password' && (
                  <motion.form
                    key="password-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <div className="space-y-4">
                      <div>
                        <div className="group relative rounded-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:ring-offset-1 bg-white/80 border border-gray-200 hover:border-indigo-400/70 shadow-sm backdrop-blur-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <FiMail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500" />
                          </div>
                          <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="Email address"
                            {...register("email")}
                            className={cn(
                              "block w-full appearance-none rounded-2xl border-0 bg-transparent pl-12 pr-3 py-4 text-gray-900 placeholder-gray-400 focus:outline-none sm:text-sm",
                              errors.email ? "text-red-900 placeholder-red-300" : ""
                            )}
                          />
                        </div>
                        {errors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-sm text-red-600 pl-2"
                          >
                            {errors.email.message}
                          </motion.p>
                        )}
                      </div>
                      
                      <div>
                        <div className="group relative rounded-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:ring-offset-1 bg-white/80 border border-gray-200 hover:border-indigo-400/70 shadow-sm backdrop-blur-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <FiLock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500" />
                          </div>
                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="Password"
                            {...register("password")}
                            className={cn(
                              "block w-full appearance-none rounded-2xl border-0 bg-transparent pl-12 pr-12 py-4 text-gray-900 placeholder-gray-400 focus:outline-none sm:text-sm",
                              errors.password ? "text-red-900 placeholder-red-300" : ""
                            )}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                              {showPassword ? (
                                <FiEyeOff className="h-5 w-5" />
                              ) : (
                                <FiEye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        {errors.password && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-sm text-red-600 pl-2"
                          >
                            {errors.password.message}
                          </motion.p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="relative">
                          <input
                            id="remember-me"
                            type="checkbox"
                            {...register("rememberMe")}
                            className="h-5 w-5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 opacity-0 absolute"
                          />
                          <div className="h-5 w-5 rounded-md border border-gray-300 bg-white flex items-center justify-center">
                            <motion.div 
                              animate={watch("rememberMe") ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="h-3 w-3 rounded-sm bg-indigo-600"
                            />
                          </div>
                        </div>
                        <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-700">
                          Remember me
                        </label>
                      </div>
                      
                      <Link 
                        href="/forgot-password" 
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline transition-all duration-200"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    
                    <div className="pt-3">
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02, boxShadow: "0 15px 30px -5px rgba(99, 102, 241, 0.5)" }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSubmitting}
                        className="group relative flex w-full justify-center rounded-full border border-transparent py-4 px-4 text-sm font-medium text-white shadow-xl disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                      >
                        {/* Gradient background with animation on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-200 bg-pos-0 group-hover:bg-pos-100 transition-all duration-500"></div>
                        
                        {/* Glass effect */}
                        <div className="absolute inset-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent"></div>
                        
                        {/* Animated shine effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300">
                          <div className="absolute inset-0 -translate-x-full animate-[shine_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                        </div>
                        
                        <span className="relative flex items-center justify-center font-medium">
                          {isSubmitting && (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          {isSubmitting ? "Signing in..." : "Sign in"}
                        </span>
                      </motion.button>
                    </div>
                  </motion.form>
                )}
                
                {loginMethod === 'otp' && (
                  <motion.div
                    key="otp-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <div className="space-y-4">
                      <div className="group relative rounded-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:ring-offset-1 bg-white/80 border border-gray-200 hover:border-purple-400/70 shadow-sm backdrop-blur-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                          <FiMail className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500" />
                        </div>
                        <input
                          type="email"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setValue('email', e.target.value)}
                          className="block w-full appearance-none rounded-2xl border-0 bg-transparent pl-12 pr-3 py-4 text-gray-900 placeholder-gray-400 focus:outline-none sm:text-sm"
                        />
                      </div>
                    </div>
                    
                    {!showOtpInput ? (
                      <div className="pt-3">
                        <motion.button
                          whileHover={{ scale: 1.02, boxShadow: "0 15px 30px -5px rgba(124, 58, 237, 0.5)" }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          disabled={isSubmitting || !email}
                          onClick={handleSendOtp}
                          className="group relative flex w-full justify-center rounded-full border border-transparent py-4 px-4 text-sm font-medium text-white shadow-xl disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                        >
                          {/* Gradient background with animation on hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 bg-size-200 bg-pos-0 group-hover:bg-pos-100 transition-all duration-500"></div>
                          
                          {/* Glass effect */}
                          <div className="absolute inset-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent"></div>
                          
                          {/* Animated shine effect */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300">
                            <div className="absolute inset-0 -translate-x-full animate-[shine_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                          </div>
                          
                          <span className="relative flex items-center justify-center font-medium">
                            {isSubmitting && (
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            )}
                            {isSubmitting ? "Sending..." : "Send Verification Code"}
                          </span>
                        </motion.button>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100/50 shadow-inner">
                          <p className="text-sm text-center text-purple-700">
                            We've sent a 6-digit verification code to 
                            <span className="font-semibold"> {email}</span>
                          </p>
                        </div>
                        
                        <div className="flex justify-center space-x-2 py-3">
                          {otp.map((digit, index) => (
                            <motion.div
                              key={index}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                              <input
                                id={`otp-${index}`}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                className="w-11 h-14 text-center text-lg font-semibold rounded-xl bg-white/90 border border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-sm backdrop-blur-sm"
                                style={{ aspectRatio: "1" }}
                              />
                            </motion.div>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <button
                            type="button"
                            onClick={() => {
                              setOtp(['', '', '', '', '', '']);
                              handleSendOtp();
                            }}
                            className="text-sm text-purple-600 hover:text-purple-500 hover:underline"
                          >
                            Resend code
                          </button>
                          <p className="text-xs text-gray-500">
                            Code valid for 10 minutes
                          </p>
                        </div>
                        
                        <div className="pt-1">
                          <motion.button
                            whileHover={{ scale: 1.02, boxShadow: "0 15px 30px -5px rgba(124, 58, 237, 0.5)" }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            disabled={isSubmitting || otp.join('').length !== 6}
                            onClick={handleVerifyOtp}
                            className="group relative flex w-full justify-center rounded-full border border-transparent py-4 px-4 text-sm font-medium text-white shadow-xl disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                          >
                            {/* Gradient background with animation on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 bg-size-200 bg-pos-0 group-hover:bg-pos-100 transition-all duration-500"></div>
                            
                            {/* Glass effect */}
                            <div className="absolute inset-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent"></div>
                            
                            {/* Animated shine effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300">
                              <div className="absolute inset-0 -translate-x-full animate-[shine_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                            </div>
                            
                            <span className="relative flex items-center justify-center font-medium">
                              {isSubmitting && (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              )}
                              {isSubmitting ? "Verifying..." : "Verify Code"}
                            </span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link 
                    href="/register" 
                    className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline transition-colors duration-200"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
            
            {/* Footer with security info */}
            <div className="py-4 px-8 md:px-12 bg-gradient-to-b from-gray-50/90 to-gray-100/90 border-t border-gray-200/50 flex items-center justify-center rounded-b-[2.5rem]">
              <LuShieldCheck className="w-4 h-4 mr-1.5 text-green-500" />
              <span className="text-xs text-gray-500">Secure, encrypted connection</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}

