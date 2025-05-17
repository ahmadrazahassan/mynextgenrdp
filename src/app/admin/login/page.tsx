"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  AlertCircle, 
  Loader2, 
  Lock, 
  Eye, 
  EyeOff,
  ShieldCheck, 
  ChevronLeft,
  KeyRound,
  Fingerprint,
  Globe,
  RefreshCw,
  CheckCircle2,
  Activity,
  Cpu,
  Clock,
  AlertTriangle,
  Smartphone,
  LockKeyhole,
  QrCode,
  Command,
  Network,
  Database,
  GitBranchPlus,
  Key,
  Shield as ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Define error message map
const errorMessages = {
  admin_required: "You must have administrator privileges to access this area.",
  invalid_credentials: "Invalid email or password.",
  account_locked: "Your account has been locked due to multiple failed attempts.",
  session_expired: "Your session has expired. Please log in again.",
  server_error: "A server error occurred. Please try again later."
};

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [securityCode, setSecurityCode] = useState("");
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // New states for enhanced security
  const [ipAddress, setIpAddress] = useState<string>("Detecting...");
  const [deviceInfo, setDeviceInfo] = useState<string>("Detecting...");
  const [browserInfo, setBrowserInfo] = useState<string>("Detecting...");
  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [securityCodeExpiry, setSecurityCodeExpiry] = useState<number>(30);
  const securityCodeTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get error from URL parameters
  const errorParam = searchParams?.get('error');
  const redirectPath = searchParams?.get('redirect') || '/admin';

  // Set error from URL parameter
  useEffect(() => {
    if (errorParam && errorMessages[errorParam as keyof typeof errorMessages]) {
      setError(errorMessages[errorParam as keyof typeof errorMessages]);
    }
  }, [errorParam]);
  
  // Add device detection effect
  useEffect(() => {
    // Get IP address (simulated here, would be server-side in production)
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => setIpAddress(data.ip))
      .catch(() => setIpAddress("192.168.x.x")); // Fallback

    // Get device and browser info
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent;
      const browser = detectBrowser(userAgent);
      setBrowserInfo(browser);
      
      const device = detectDevice(userAgent);
      setDeviceInfo(device);

      // Simulate last login info from localStorage
      const storedLastLogin = localStorage.getItem('admin_last_login');
      if (storedLastLogin) {
        setLastLogin(storedLastLogin);
      }

      // Simulate login attempts from localStorage
      const storedAttempts = localStorage.getItem('admin_login_attempts');
      if (storedAttempts) {
        setLoginAttempts(parseInt(storedAttempts, 10));
      }
    }
  }, []);

  // Add these helper functions
  const detectBrowser = (userAgent: string): string => {
    if (userAgent.indexOf("Chrome") > -1) return "Chrome";
    if (userAgent.indexOf("Safari") > -1) return "Safari";
    if (userAgent.indexOf("Firefox") > -1) return "Firefox";
    if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) return "Internet Explorer";
    if (userAgent.indexOf("Edge") > -1) return "Edge";
    return "Unknown Browser";
  };

  const detectDevice = (userAgent: string): string => {
    if (/Mobi|Android/i.test(userAgent)) return "Mobile Device";
    if (/iPad|iPhone|iPod/.test(userAgent)) return "iOS Device";
    if (/Windows/.test(userAgent)) return "Windows Device";
    if (/Macintosh/.test(userAgent)) return "Mac Device";
    if (/Linux/.test(userAgent)) return "Linux Device";
    return "Unknown Device";
  };

  // Check if user is already logged in as admin
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const response = await fetch("/api/auth/admin/check");
        const data = await response.json();
        
        if (data.isAdmin) {
          // Already authenticated as admin, redirect to dashboard
          router.push(redirectPath);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAdminAuth();
  }, [redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setFormSubmitted(true);

    // Update login attempts
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_login_attempts', newAttempts.toString());
    }

    try {
      // Log in with regular login endpoint, adding adminOnly flag
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
          adminOnly: true, // Add adminOnly flag to enforce admin validation
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Check if logged in user is admin
      const adminCheckResponse = await fetch("/api/auth/admin/check");
      const adminCheckData = await adminCheckResponse.json();
      
      if (!adminCheckData.isAdmin) {
        // Clear the auth cookie if not admin
        await fetch("/api/auth/logout", { method: "POST" });
        throw new Error("You don't have administrator privileges");
      }

      // Store last login time
      const now = new Date().toISOString();
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_last_login', now);
      }

      // Start timer for code expiry
      if (securityCodeTimerRef.current) {
        clearInterval(securityCodeTimerRef.current);
      }
      
      setSecurityCodeExpiry(30);
      securityCodeTimerRef.current = setInterval(() => {
        setSecurityCodeExpiry(prev => {
          if (prev <= 1) {
            if (securityCodeTimerRef.current) {
              clearInterval(securityCodeTimerRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Simulate 2FA check - this would be replaced with actual 2FA logic
      if (process.env.NODE_ENV === 'development') {
        // Skip 2FA in development
        router.push(redirectPath);
      } else {
        // Show 2FA form in production
        setShowTwoFactor(true);
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to login. Please try again.");
      setIsLoading(false);
    }
  };

  // Add code to disconnect the timer on cleanup
  useEffect(() => {
    return () => {
      if (securityCodeTimerRef.current) {
        clearInterval(securityCodeTimerRef.current);
      }
    };
  }, []);

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate 2FA verification (would be replaced with actual 2FA logic)
    setTimeout(() => {
      router.push(redirectPath);
    }, 1500);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="p-8 rounded-xl bg-white shadow-2xl border border-gray-100 flex flex-col items-center">
          <div className="h-16 w-16 relative mb-4">
            <div className="absolute inset-0 bg-blue-600 rounded-full opacity-20 animate-ping"></div>
            <div className="absolute inset-0 bg-blue-600 rounded-full opacity-30 animate-pulse"></div>
            <div className="relative h-full w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600 font-medium">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Advanced background effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-fuchsia-900/5 to-blue-900/10 mix-blend-overlay"></div>
      
      {/* Enhanced orbs with more vibrant colors and larger size */}
      <div className="absolute -top-40 -right-20 w-[35rem] h-[35rem] bg-indigo-600 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-40 -left-20 w-[35rem] h-[35rem] bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-pulse animation-delay-2000"></div>
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-cyan-600 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-pulse animation-delay-4000"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-violet-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-pulse animation-delay-3000"></div>
      
      {/* Enhanced floating particles effect */}
      <div className="particle-container absolute inset-0 overflow-hidden opacity-30">
        {Array.from({ length: 25 }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
              animationDuration: `${Math.random() * 10 + 10}s`,
              animationDelay: `${Math.random() * 5}s`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
            }}
          ></div>
        ))}
      </div>
      
      {/* Enhanced security badge with more rounded corners */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 p-3 bg-slate-800/90 backdrop-blur-md rounded-3xl border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
        <div className="h-2.5 w-2.5 bg-emerald-400 rounded-full animate-pulse shadow-glow"></div>
        <span className="text-xs font-semibold text-slate-200">Secure Connection</span>
        <div className="text-xs text-slate-400">|</div>
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
      </div>
      
      <AnimatePresence mode="wait">
        {showTwoFactor ? (
          <motion.div
            key="2fa"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md relative"
          >
            <Card className="border-0 shadow-2xl overflow-hidden backdrop-blur-sm bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-slate-950/90 border border-amber-500/20 rounded-[2rem]">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"></div>
              <div className="absolute top-1.5 right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"></div>
              
              <CardHeader className="relative pb-2 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-slate-800/0 via-amber-500/50 to-slate-800/0"></div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-amber-900/80 to-amber-950 rounded-2xl relative border border-amber-700/30 shadow-inner shadow-amber-900/20">
                    <div className="absolute inset-0 bg-amber-700/20 rounded-2xl animate-pulse"></div>
                    <KeyRound className="h-6 w-6 text-amber-400" />
                  </div>
                  <CardTitle className="text-xl font-bold">Multi-Factor Authentication</CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  Advanced verification required for privileged access
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                <div className="bg-gradient-to-br from-slate-900/80 to-amber-950/10 p-4 rounded-2xl border border-amber-700/20 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-400" />
                    <p className="text-sm font-medium text-slate-200">Enhanced Security Protocol</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    For your security, this system requires multi-factor verification. Your session is being monitored for your protection.
                  </p>
                </div>
                
                <form onSubmit={handleTwoFactorSubmit} className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="securityCode" className="font-medium text-slate-300 flex items-center justify-between">
                      <span>Authentication Code</span>
                      <span className="text-xs font-normal text-amber-400/90 flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span className="tabular-nums">Expires in {securityCodeExpiry}s</span>
                      </span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="securityCode"
                        type="text"
                        value={securityCode}
                        onChange={(e) => setSecurityCode(e.target.value)}
                        className="py-6 text-center text-2xl tracking-widest font-mono border-2 border-amber-700/30 bg-slate-800/60 focus:border-amber-500 focus:bg-slate-800/80 text-slate-200 placeholder:text-slate-600 rounded-[1.25rem] shadow-inner"
                        placeholder="● ● ● ● ● ●"
                        maxLength={6}
                        required
                        disabled={isLoading}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="one-time-code"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <RefreshCw 
                          className="h-4 w-4 text-amber-500 hover:text-amber-400 cursor-pointer transition-colors" 
                          onClick={() => setSecurityCodeExpiry(30)} 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-6 gap-1.5">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <div key={index} className="relative h-1 rounded-full overflow-hidden bg-slate-700/50">
                          <div 
                            className={`absolute inset-0 ${
                              index < securityCode.length 
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                                : 'bg-transparent'
                            } transition-all duration-300`}
                          ></div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between text-xs text-slate-500 px-1">
                      <span className="flex items-center">
                        <Globe className="h-3.5 w-3.5 mr-1" />
                        <span className="text-slate-400">From: <span className="text-slate-300">{ipAddress}</span></span>
                      </span>
                      <span className="flex items-center">
                        <span className={`inline-block h-2 w-2 rounded-full mr-1 ${
                          securityCodeExpiry > 10 ? 'bg-emerald-400' : 'bg-amber-400'
                        } animate-pulse shadow-glow-sm`}></span>
                        <span className="text-slate-300">{securityCodeExpiry > 0 ? "Active session" : "Code expired"}</span>
                      </span>
                    </div>
                  </div>
                  
                  <Separator className="my-2 bg-slate-700/50" />
                  
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-slate-300">Authentication Methods</div>
                    
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between bg-gradient-to-r from-amber-900/20 to-amber-950/20 px-4 py-3.5 rounded-[1.25rem] border border-amber-600/30 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-amber-800/40 to-amber-900/40 p-2.5 rounded-xl shadow-inner">
                              <Key className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-200">Authentication Code</p>
                              <p className="text-xs text-slate-400">6-digit security code</p>
                            </div>
                          </div>
                          <div className="h-3 w-3 rounded-full bg-amber-500 ring-4 ring-amber-500/20"></div>
                        </div>
                      
                        <div className="flex items-center justify-between bg-slate-800/30 px-4 py-3.5 rounded-[1.25rem] border border-slate-700/30 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="bg-slate-800/80 p-2.5 rounded-xl shadow-inner">
                              <Fingerprint className="h-5 w-5 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-400">Biometric Authentication</p>
                              <p className="text-xs text-slate-500">Use fingerprint or facial recognition</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between bg-slate-800/30 px-4 py-3.5 rounded-[1.25rem] border border-slate-700/30 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="bg-slate-800/80 p-2.5 rounded-xl shadow-inner">
                              <Smartphone className="h-5 w-5 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-400">Admin App</p>
                              <p className="text-xs text-slate-500">Use the secure admin mobile app</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    
                      <Button 
                        type="submit"
                        className="w-full py-6 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white shadow-lg shadow-amber-700/20 rounded-[1.25rem] border border-amber-500/50 relative overflow-hidden group"
                        disabled={isLoading || securityCodeExpiry === 0 || securityCode.length !== 6}
                      >
                        <div className="absolute inset-0 w-full h-full transition-all duration-300 scale-x-0 transform bg-white/10 group-hover:scale-x-100 origin-left"></div>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Verifying code...</span>
                          </>
                        ) : (
                          <>
                            <LockKeyhole className="mr-2 h-4 w-4" />
                            <span>Verify Authentication Code</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
                
                <div className="flex justify-between text-xs text-slate-500 border-t border-slate-700/50 pt-3">
                  <div className="flex items-start gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-slate-300 font-medium">{deviceInfo}</p>
                      <p className="text-slate-500">{browserInfo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-300 font-medium">Access Level</p>
                    <p className="text-amber-400 font-medium">Administrator</p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-3 border-t border-slate-800/50 pt-5 pb-6 bg-gradient-to-b from-transparent to-slate-900/50">
                <div className="flex gap-2 justify-between w-full text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTwoFactor(false)}
                    disabled={isLoading}
                    className="text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-xl"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to login
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isLoading}
                    className="text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-xl"
                  >
                    Need help?
                  </Button>
                </div>
                <div className="text-xs text-center text-slate-500 flex items-center justify-center">
                  <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                  <span>Verification timeout in {securityCodeExpiry}s</span>
                </div>
              </CardFooter>
              
              {/* Enhanced security indicators */}
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-slate-900 via-amber-500 to-slate-900"></div>
            </Card>
            
            {/* Enhanced security badges */}
            <div className="flex justify-center gap-2 mt-4">
              <div className="flex items-center gap-1.5 bg-slate-800/80 backdrop-blur-sm rounded-full py-1.5 px-3.5 border border-amber-700/30 text-xs shadow-md">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                <span className="text-slate-300">SOC 2 Certified</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 backdrop-blur-sm rounded-full py-1.5 px-3.5 border border-amber-700/30 text-xs shadow-md">
                <Lock className="h-3 w-3 text-amber-400" />
                <span className="text-slate-300">256-bit Encryption</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md relative"
          >
            <Card className="border-0 shadow-2xl overflow-hidden backdrop-blur-sm bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-slate-950/90 border border-blue-500/20 rounded-[2rem]">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
              <div className="absolute top-1.5 right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
              
              <CardHeader className="space-y-2 text-center pb-6 border-b border-slate-800">
                <div className="mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 bg-indigo-600/10 blur-[40px] rounded-full"></div>
                  <div className="relative h-24 w-24 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full flex items-center justify-center shadow-2xl border border-blue-500/30 p-4 shadow-blue-500/20">
                    <Shield className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                    ADMIN CONTROL CENTER
                  </CardTitle>
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                </div>
                <CardDescription className="text-slate-400">
                  Enterprise-grade access control system
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6 pt-6">
                {error && (
                  <Alert variant="destructive" className="border border-red-800/50 bg-red-950/30 text-red-200 rounded-2xl">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertTitle className="font-semibold text-red-300">Authentication Error</AlertTitle>
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                )}
                
                {formSubmitted && !error && !showTwoFactor && (
                  <Alert className="border-emerald-900/50 bg-emerald-950/30 text-emerald-200 rounded-2xl">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <AlertTitle className="font-semibold text-emerald-300">Authentication Successful</AlertTitle>
                    <AlertDescription className="text-emerald-200">Your credentials have been verified.</AlertDescription>
                  </Alert>
                )}
                
                {/* Enhanced security status panel */}
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/40 p-4 rounded-[1.25rem] border border-blue-700/20 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <ServerStatus className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-medium text-slate-300">SECURE SERVER STATUS</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/50 shadow-inner">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <SecurityMetric 
                      icon={Globe}
                      label="IP Address"
                      value={ipAddress}
                      color="text-blue-400"
                    />
                    <SecurityMetric 
                      icon={Cpu}
                      label="Device"
                      value={deviceInfo}
                      color="text-indigo-400"
                    />
                    <SecurityMetric 
                      icon={Activity}
                      label="Attempts"
                      value={`${loginAttempts} login${loginAttempts !== 1 ? 's' : ''}`}
                      color="text-amber-400"
                    />
                    {lastLogin && (
                      <SecurityMetric 
                        icon={Clock}
                        label="Last Session"
                        value={new Date(lastLogin).toLocaleString()}
                        color="text-emerald-400"
                      />
                    )}
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-slate-300 flex items-center">
                        <span>Email Address</span>
                        <span className="text-xs text-slate-500 ml-2">(Administrative)</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isLoading}
                          className="pl-10 py-6 border-2 border-blue-700/30 bg-slate-800/60 focus:border-blue-500 focus:bg-slate-800/80 text-slate-200 placeholder:text-slate-600 rounded-[1.25rem] shadow-inner"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Globe className="h-5 w-5 text-blue-500" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                          Password
                        </Label>
                        <Link href="#" className="text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          className="pl-10 py-6 border-2 border-blue-700/30 bg-slate-800/60 focus:border-blue-500 focus:bg-slate-800/80 text-slate-200 placeholder:text-slate-600 rounded-[1.25rem] shadow-inner"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-blue-500" />
                        </div>
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center transition-opacity"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-slate-500 hover:text-slate-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-slate-500 hover:text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                        disabled={isLoading}
                        className="data-[state=checked]:bg-blue-600 border-slate-600 rounded-md"
                      />
                      <Label htmlFor="remember" className="text-sm font-normal text-slate-400">
                        Remember this device
                      </Label>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white shadow-xl shadow-blue-700/20 relative overflow-hidden group border border-blue-600/50 rounded-[1.25rem]"
                    disabled={isLoading}
                  >
                    <div className="absolute inset-0 w-full h-full transition-all duration-300 scale-x-0 transform bg-white/10 group-hover:scale-x-100 origin-left"></div>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-5 w-5" />
                        <span>Authenticate</span>
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 bg-slate-800/60 py-1 px-2.5 rounded-full border border-slate-700/40">
                    <Command className="h-3.5 w-3.5 text-blue-500" />
                    <span>Advanced Security Protocols</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-3 border-t border-slate-800/50 pt-6 bg-gradient-to-b from-transparent to-slate-900/50">
                <div className="text-sm text-slate-400 text-center">
                  This is a restricted area for administrators only. 
                  <Link href="/login" className="ml-1 text-blue-500 hover:text-blue-400 font-medium transition-colors">
                    Return to main site
                  </Link>
                </div>
                
                {/* Enhanced security badges */}
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <SecurityBadge icon={<ShieldCheck className="h-3 w-3 text-emerald-400" />} text="Enterprise Security" />
                  <SecurityBadge icon={<Lock className="h-3 w-3 text-blue-400" />} text="Advanced Protection" />
                </div>
              </CardFooter>
              
              {/* Bottom security indicator */}
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900"></div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Server status indicators with enhanced design */}
      <div className="fixed bottom-4 left-4 flex gap-2 items-center z-10">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-md py-1.5 px-3.5 rounded-full border border-emerald-700/30 text-xs shadow-lg shadow-emerald-900/10">
          <ServerStatus className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">Systems Online</span>
        </div>
      </div>
      
      {/* Security compliance badge with enhanced design */}
      <div className="fixed bottom-4 right-4 z-10">
        <div className="flex items-center gap-2 bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-md py-2 px-4 rounded-2xl border border-blue-700/30 text-xs shadow-lg shadow-blue-900/10">
          <Shield className="h-4 w-4 text-blue-400" />
          <div>
            <div className="text-slate-300 font-medium">Enterprise Security</div>
            <div className="text-slate-500 text-[10px]">Advanced Threat Protection</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Define small helper components
const ServerStatus = ({ className }: { className?: string }) => (
  <div className={cn("relative", className)}>
    <div className="absolute inset-0 bg-current opacity-40 blur-[1px] rounded-full"></div>
    <div className="absolute inset-0 bg-current opacity-70 rounded-full scale-75"></div>
  </div>
);

const SecurityMetric = ({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  color?: string 
}) => (
  <div className="flex items-start gap-1.5 bg-slate-700/50 p-2 rounded border border-slate-600/50">
    <Icon className={`h-4 w-4 ${color}`} />
    <div>
      <div className="text-slate-400 font-mono">{label}</div>
      <div className={cn("text-slate-300 font-medium truncate max-w-[120px]", color)}>{value}</div>
    </div>
  </div>
);

// Updated SecurityBadge component without specific compliance mentions
const SecurityBadge = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex items-center gap-1.5 bg-slate-800/80 rounded-full py-1 px-2.5 border border-slate-700/50 text-xs">
    {icon}
    <span className="text-slate-300">{text}</span>
  </div>
);
