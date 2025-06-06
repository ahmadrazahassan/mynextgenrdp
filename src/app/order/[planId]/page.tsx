'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  AlertCircle, CheckCircle2, Loader2, ArrowLeft, ArrowRight, 
  Info, UserCheck, UserPlus, CreditCard, ShieldCheck,
  MapPin, Globe, Cpu, MemoryStick, HardDrive, Wifi, Server, Gauge, 
  Gift, BadgePercent, Receipt, FileCheck, CreditCard as CardIcon, 
  Wallet, Building2, QrCode, Shield, Lock, Landmark
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Providers & Hooks
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from "@/components/ui/use-toast"; // Use standard shadcn hook

// Components
import LocationSelector, { locations as serverLocations } from '@/components/order/LocationSelector';
import PromoCodeInput from '@/components/order/PromoCodeInput';
import StepIndicator from '@/components/order/StepIndicator';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import UserDisplay from '@/components/auth/UserDisplay';
import PaymentMethodSelector from '@/components/order/PaymentMethodSelector';
import PaymentProofUpload from '@/components/order/PaymentProofUpload';
import ReviewSummary from '@/components/order/ReviewSummary'; // Import ReviewSummary
import HowToOrderGuide from '@/components/order/HowToOrderGuide'; // Import the static guide

// Define the Plan interface based on your plans.js structure
interface Plan {
  id: string;
  name: string;
  cpu: string;
  ram: string;
  storage: string;
  price: number;
  bandwidth: string;
  os: string;
  useCases: string[];
  orderLink: string;
  themeColor: string;
  label: string | null;
  // Add any other fields from your plans.js if necessary
}

// Define types for order steps if you want strong typing for steps
type OrderStepId = 'configure' | 'account' | 'payment' | 'review';

interface StepConfig {
  id: OrderStepId;
  name: string;
}

const orderSteps: StepConfig[] = [
  { id: 'configure', name: 'Configuration' },
  { id: 'account', name: 'Account Details' },
  { id: 'payment', name: 'Payment Method' },
  { id: 'review', name: 'Review & Confirm' },
];

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast(); // Use toast for notifications
  const planId = params?.planId as string;

  const { user, isAuthenticated, isLoading: isAuthLoading, error: authError } = useAuth();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [planError, setPlanError] = useState<string | null>(null);
  
  const [currentStep, setCurrentStep] = useState<OrderStepId>(orderSteps[0].id);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(serverLocations.length > 0 ? serverLocations[0].id : null);
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeMessage, setPromoCodeMessage] = useState<string | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState<number>(0);

  const [authFormMode, setAuthFormMode] = useState<'login' | 'register'>('login');

  // Payment Step State
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
  const [paymentProofFilename, setPaymentProofFilename] = useState<string | null>(null);
  const [paymentStepError, setPaymentStepError] = useState<string | null>(null);

  // Submission State
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSubmissionError, setOrderSubmissionError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (planId) {
      const fetchPlanDetails = async () => {
        setIsLoadingPlan(true);
        setPlanError(null);
        try {
          const response = await fetch(`/api/plans/${planId}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch plan: ${response.statusText}`);
          }
          const data: Plan = await response.json();
          setPlan(data);
        } catch (err: any) {
          setPlanError(err.message || 'An unexpected error occurred.');
        }
        setIsLoadingPlan(false);
      };
      fetchPlanDetails();
    }
  }, [planId]);

  const handleLocationChange = (locationId: string) => {
    setSelectedLocation(locationId);
  };

  const handlePromoCodeChange = (code: string) => {
    setPromoCode(code);
    if (promoCodeMessage) setPromoCodeMessage(null); // Clear message on new input
    if (promoDiscount > 0) setPromoDiscount(0); // Clear discount if code changes
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setIsApplyingPromo(true);
    setPromoCodeMessage(null);
    
    try {
      // Call the promo code validation API directly
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: promoCode, planId: plan?.id }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to validate promo code');
      }
      
      if (result.valid) {
        setPromoCodeMessage(result.message);
        // Calculate the discount amount directly
        const discountAmount = plan ? Math.round((plan.price * result.discount) / 100) : 0;
        setPromoDiscount(discountAmount);
      } else {
        setPromoCodeMessage(result.message || 'Invalid or expired promo code.');
        setPromoDiscount(0);
      }
    } catch (error: any) {
      console.error('Error validating promo code:', error);
      setPromoCodeMessage(`Error: ${error.message || 'Failed to validate promo code'}`);
      setPromoDiscount(0);
    } finally {
      setIsApplyingPromo(false);
    }
  };
  
  const currentStepIndex = orderSteps.findIndex(s => s.id === currentStep);

  const goToNextStep = () => {
    let canProceed = true;
    // Add validation checks for the current step before proceeding
    if (currentStep === 'payment') {
        if (!isAuthenticated) {
            setPaymentStepError("Please log in or register first.");
            setCurrentStep('account'); 
            canProceed = false;
        }
        else if (!selectedPaymentMethodId) {
            setPaymentStepError("Please select a payment method.");
            canProceed = false;
        }
        else if (!paymentProofUrl) {
            setPaymentStepError("Please upload your payment proof.");
            canProceed = false;
        }
        if (canProceed) setPaymentStepError(null);
    }
    
    if (canProceed && currentStepIndex < orderSteps.length - 1) {
      setCurrentStep(orderSteps[currentStepIndex + 1].id);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(orderSteps[currentStepIndex - 1].id);
    }
  };

  const calculatedTotal = plan ? plan.price - promoDiscount : 0;

  // Render loading/error/not found states
  if (!params || !planId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }
  if (isLoadingPlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-700 p-8">
        <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mb-4" />
        <p className="text-xl font-medium">Loading plan details...</p>
      </div>
    );
  }
  if (planError) { 
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-700 p-8">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <p className="text-xl font-semibold">Error Loading Plan</p>
        <p className="text-center mt-1">{planError}</p>
        <Button variant="outline" className="mt-6" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }
  if (!plan) { 
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50 text-yellow-700 p-8">
        <AlertCircle className="h-16 w-16 text-yellow-500 mb-4" />
        <p className="text-xl font-semibold">Plan Not Found</p>
        <p className="text-center mt-1">The plan ID specified does not exist.</p>
         <Button variant="outline" className="mt-6" onClick={() => router.push('/pricing')}>View Plans</Button>
      </div>
    );
  }

  const selectedLocationDetails = serverLocations.find(loc => loc.id === selectedLocation);

  // Function to handle successful login/registration for the order page
  const handleAuthSuccess = () => {
    // If user logs in/registers successfully on the account page, move them to payment
    if (currentStep === 'account') {
      // Add a small delay to ensure auth state is updated before proceeding
      setTimeout(() => {
        if (isAuthenticated) {
          toast({
            title: "Authentication Successful",
            description: "Proceeding to payment information...",
            duration: 3000
          });
          goToNextStep();
        }
      }, 500); // Give time for auth state to update
    }
  }

  // Payment Step Handlers
  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethodId(methodId);
    setPaymentStepError(null); // Clear error when method changes
  };

  const handleProofUploadSuccess = (url: string, name: string) => {
    setPaymentProofUrl(url);
    setPaymentProofFilename(name);
    setPaymentStepError(null); // Clear error on successful upload
  };

  const handleProofUploadError = (errorMessage: string) => {
    setPaymentStepError(`Upload Error: ${errorMessage}`);
    setPaymentProofUrl(null); // Clear proof URL on error
    setPaymentProofFilename(null);
  };

  // Order Submission Handler
  const handlePlaceOrder = async () => {
      if (!isAuthenticated || !user || !plan || !selectedLocation || !selectedPaymentMethodId || !paymentProofUrl) {
          setOrderSubmissionError("Missing required information to place order. Please review all steps.");
          // Attempt to navigate back to the first step with missing info (optional)
          if (!isAuthenticated || !user) setCurrentStep('account');
          else if (!selectedPaymentMethodId || !paymentProofUrl) setCurrentStep('payment');
          else if (!selectedLocation) setCurrentStep('configure');
          return;
      }

      setIsSubmittingOrder(true);
      setOrderSubmissionError(null);
      setIsRedirecting(false);

      const orderData = {
          planId: plan.id,
          planName: plan.name,
          location: selectedLocation, // Assuming location ID is sufficient
          paymentMethod: selectedPaymentMethodId,
          paymentProofUrl: paymentProofUrl,
          subtotal: plan.price,
          total: calculatedTotal,
          // Add quantity, duration if implemented
      };

      try {
          const response = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderData)
          });

          const result = await response.json();

          if (!response.ok) {
              throw new Error(result.error || 'Failed to place order.');
          }

          // Order placed successfully!
          toast({ 
              title: "Order Placed!", 
              description: `Order #${result.order?.orderId} received. Verifying payment...`,
              variant: "default",
              duration: 4000 // Give slightly longer for first toast
          });
          
          setIsRedirecting(true);

          // Redirect to dashboard after a delay
          setTimeout(() => {
              router.push('/dashboard/orders'); 
          }, 3000); // Adjust delay as needed
          
      } catch (err: any) {
          console.error("Order submission failed:", err);
          setOrderSubmissionError(err.message || "An unexpected error occurred while placing your order.");
          toast({ title: "Order Failed", description: err.message || "Could not place order.", variant: "destructive" });
          setIsSubmittingOrder(false);
          setIsRedirecting(false);
      }
  };

  // Add this new section in the configure step to display plan details with icons
  const renderPlanFeatures = () => {
    if (!plan) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="flex items-center space-x-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
          <div className="flex-shrink-0 p-2 bg-indigo-100 rounded-lg">
            <Cpu className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">CPU</div>
            <div className="text-base font-semibold">{plan.cpu}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
          <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
            <MemoryStick className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">RAM</div>
            <div className="text-base font-semibold">{plan.ram}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-purple-50/50 rounded-lg border border-purple-100">
          <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg">
            <HardDrive className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Storage</div>
            <div className="text-base font-semibold">{plan.storage}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
          <div className="flex-shrink-0 p-2 bg-emerald-100 rounded-lg">
            <Wifi className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Bandwidth</div>
            <div className="text-base font-semibold">{plan.bandwidth}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
          <div className="flex-shrink-0 p-2 bg-amber-100 rounded-lg">
            <Server className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">OS</div>
            <div className="text-base font-semibold">{plan.os}</div>
          </div>
        </div>
      </div>
    );
  };

  // Replace the location selector section with this enhanced version
  const renderLocationSelector = () => {
    return (
      <div className="mt-6">
        <div className="flex items-center mb-3">
          <MapPin className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Server Location</h3>
        </div>
        <LocationSelector 
          selectedLocation={selectedLocation}
          onLocationChange={handleLocationChange}
        />
      </div>
    );
  };

  // Update the promo code section
  const renderPromoCodeSection = () => {
    return (
      <div className="mt-6">
        <div className="flex items-center mb-3">
          <BadgePercent className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Promotional Code</h3>
        </div>
        <PromoCodeInput
          promoCode={promoCode}
          onPromoCodeChange={handlePromoCodeChange}
          onApplyPromoCode={handleApplyPromoCode}
          isApplying={isApplyingPromo}
          message={promoCodeMessage}
          discount={promoDiscount}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 text-gray-900 p-4 md:p-8 lg:p-12 selection:bg-indigo-100">
      <div className="max-w-7xl mx-auto">
         
         {/* Conditionally render Redirecting message or Order Steps */}
         {isRedirecting ? (
             <div className="flex flex-col items-center justify-center text-center py-20 md:py-32">
                 <CheckCircle2 size={64} className="text-green-500 mb-6 animate-pulse" />
                 <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Order Placed Successfully!</h1>
                 <p className="text-lg text-gray-600 mb-8">Your order is being processed. Please wait while we redirect you to your dashboard...</p>
                 <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
             </div>
         ) : (
            <> { /* Original Order Page Content */ }
                 <header className="mb-8 md:mb-12 text-center">
                    {/* <div className="absolute top-0 right-0"> <HowToOrderModal /> </div> */}
                    {/* Rest of header */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                        Order: <span className="text-indigo-600">{plan.name}</span>
                    </h1>
                     <p className="text-md md:text-lg text-gray-600 mt-3 max-w-2xl mx-auto">Complete the steps below to configure and place your order.</p>
                 </header>

                 <StepIndicator steps={orderSteps} currentStepId={currentStep} />

                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
                    {/* Main Content Area (Steps) */}
                    <main className="lg:col-span-7 xl:col-span-8 space-y-8">
                         {/* --- Step 1: Configuration --- */}
                         {currentStep === 'configure' && (
                           <Card>
                             <CardHeader className="pb-4">
                               <div className="flex items-center space-x-2">
                                 <Server className="h-6 w-6 text-indigo-600" />
                                 <CardTitle>Configure Your {plan.name}</CardTitle>
                               </div>
                               <CardDescription>Select your preferred server location and apply any promotional codes</CardDescription>
                             </CardHeader>
                             <CardContent>
                               {renderPlanFeatures()}
                               {renderLocationSelector()}
                               {renderPromoCodeSection()}
                             </CardContent>
                             <CardFooter className="flex justify-between border-t pt-6">
                               <Button variant="outline" onClick={() => router.push('/pricing')}>
                                 <ArrowLeft className="mr-2 h-4 w-4" />
                                 Back to Plans
                               </Button>
                               <Button onClick={goToNextStep} className="bg-gradient-to-r from-indigo-600 to-violet-600">
                                 Continue
                                 <ArrowRight className="ml-2 h-4 w-4" />
                               </Button>
                             </CardFooter>
                           </Card>
                         )}

                         {/* --- Step 2: Account --- */}
                         {currentStep === 'account' && (
                            <Card className="shadow-xl border-gray-200 overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md">
                             <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border-b border-gray-100 dark:border-gray-800 px-6 py-5">
                               <CardTitle className="text-2xl flex items-center gap-3">
                                 <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl text-white shadow-md">
                                   <UserCheck size={20} className="text-white" />
                                 </div>
                                 <span className="bg-gradient-to-r from-indigo-700 to-violet-700 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                                   Account Details
                                 </span>
                               </CardTitle>
                               <CardDescription className="text-gray-600 dark:text-gray-400 mt-1.5 ml-1">Log in or create an account to associate this order.</CardDescription>
                             </CardHeader>
                             <CardContent className="p-8 bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-950 dark:to-indigo-950/10">
                                {isAuthLoading ? (
                                  <div className="flex flex-col justify-center items-center py-16">
                                    <div className="relative">
                                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 blur-lg opacity-30 animate-pulse"></div>
                                      <div className="relative h-20 w-20 rounded-full bg-gradient-to-r from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                                        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                                      </div>
                                    </div>
                                    <span className="mt-6 text-gray-600 font-medium text-lg">Verifying authentication...</span>
                                    <p className="text-gray-500 text-sm mt-2">Please wait while we check your account status</p>
                                  </div>
                                ) : isAuthenticated ? (
                                  // If user is authenticated, show their info with enhanced styling
                                  <div className="p-8 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
                                    <UserDisplay />
                                    <div className="mt-6 flex justify-center">
                                      <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center shadow-sm">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2" />
                                        <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">You're signed in and ready to proceed</span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  // If user is NOT authenticated, show enhanced login/register options
                                  <div className="space-y-8">
                                    {/* Modern tab design */}
                                    <div className="flex justify-center mb-8">
                                      <div className="bg-gradient-to-r from-indigo-50/80 to-violet-50/80 dark:from-gray-800/40 dark:to-gray-900/40 backdrop-blur-sm p-2 rounded-3xl flex w-full max-w-xs shadow-lg border border-indigo-100/50 dark:border-indigo-900/30">
                                        <button 
                                          onClick={() => setAuthFormMode('login')} 
                                          className={`relative py-3.5 px-6 text-sm font-medium rounded-2xl flex-1 transition-all duration-300 ${
                                            authFormMode === 'login' 
                                              ? 'bg-white/90 dark:bg-gray-800/90 text-indigo-600 dark:text-indigo-400 shadow-lg backdrop-blur-sm border border-indigo-100/50 dark:border-indigo-900/30 z-10' 
                                              : 'text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-300'
                                          }`}
                                        >
                                          {authFormMode === 'login' && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl -z-10 overflow-hidden">
                                              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-xl"></div>
                                            </div>
                                          )}
                                          <span className="relative">Log In</span>
                                        </button>
                                        <button 
                                          onClick={() => setAuthFormMode('register')} 
                                          className={`relative py-3.5 px-6 text-sm font-medium rounded-2xl flex-1 transition-all duration-300 ${
                                            authFormMode === 'register' 
                                              ? 'bg-white/90 dark:bg-gray-800/90 text-indigo-600 dark:text-indigo-400 shadow-lg backdrop-blur-sm border border-indigo-100/50 dark:border-indigo-900/30 z-10' 
                                              : 'text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-300'
                                          }`}
                                        >
                                          {authFormMode === 'register' && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl -z-10 overflow-hidden">
                                              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-xl"></div>
                                            </div>
                                          )}
                                          <span className="relative">Create Account</span>
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {/* Form container with enhanced styling */}
                                    <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl p-10 shadow-xl border border-indigo-100/50 dark:border-indigo-900/30 overflow-hidden group">
                                      {/* Decorative elements */}
                                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-full blur-xl group-hover:opacity-70 transition-opacity duration-500"></div>
                                      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-tr from-violet-500/20 to-indigo-500/20 rounded-full blur-xl group-hover:opacity-70 transition-opacity duration-500"></div>
                                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 via-indigo-50/5 to-white/5 dark:from-gray-900/5 dark:via-indigo-950/5 dark:to-gray-900/5 mix-blend-overlay pointer-events-none"></div>
                                      
                                      {/* Animated border effect */}
                                      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                                        <div className="absolute inset-x-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
                                        <div className="absolute inset-x-0 bottom-0 h-px w-full bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
                                        <div className="absolute inset-y-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent"></div>
                                        <div className="absolute inset-y-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-purple-500/30 to-transparent"></div>
                                      </div>
                                      
                                      {/* Login/Register title */}
                                      <div className="relative z-10 mb-6 text-center">
                                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                                          {authFormMode === 'login' ? 'Welcome Back' : 'Create Your Account'}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                          {authFormMode === 'login' 
                                            ? 'Sign in to access your account and services' 
                                            : 'Join us to get started with our services'}
                                        </p>
                                      </div>

                                      {/* Auth forms with animation */}
                                      <div className="relative z-10">
                                        {authFormMode === 'login' ? 
                                          <LoginForm onLoginSuccess={handleAuthSuccess} /> : 
                                          <RegisterForm onRegisterSuccess={handleAuthSuccess} />
                                        }
                                      </div>
                                    </div>
                                    

                                  </div>
                                )}
                             </CardContent>
                           </Card>
                         )}
                         
                        {/* --- Step 3: Payment --- */}
                        {currentStep === 'payment' && (
                            <Card className="shadow-lg border-gray-200">
                             <CardHeader>
                               <CardTitle className="text-2xl flex items-center gap-2"><CreditCard size={24} className="text-indigo-500"/> Payment Information</CardTitle>
                               <CardDescription>Select a manual payment method and upload your proof of transaction.</CardDescription>
                             </CardHeader>
                             <CardContent>
                                 {!isAuthenticated ? (
                                    <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md flex items-center space-x-3 mb-6">
                                        <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0"/>
                                        <div className="flex-grow">
                                            <p className="text-yellow-800 font-medium">Authentication Required</p>
                                            <p className="text-sm text-yellow-700">Please log in or create an account first.</p>
                                        </div>
                                         <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100" onClick={() => setCurrentStep('account')}>
                                            Go to Account
                                        </Button>
                                    </div>
                                 ) : (
                                    <div className="space-y-6">
                                      <PaymentMethodSelector 
                                        selectedMethodId={selectedPaymentMethodId} 
                                        onMethodSelect={handlePaymentMethodSelect} 
                                      />
                                      <PaymentProofUpload 
                                        onUploadSuccess={handleProofUploadSuccess} 
                                        onUploadError={handleProofUploadError}
                                        userId={user?.id}
                                      />
                                      {paymentStepError && (
                                        <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-md flex items-start space-x-2 text-red-700">
                                            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm font-medium">{paymentStepError}</p>
                                        </div>
                                      )}
                                    </div>
                                 )}
                              </CardContent>
                           </Card>
                        )}

                        {/* --- Step 4: Review --- */}
                        {currentStep === 'review' && (
                            <Card className="shadow-lg border-gray-200">
                             <CardHeader>
                               <CardTitle className="text-2xl flex items-center gap-2"><ShieldCheck size={24} className="text-indigo-500"/> Review & Confirm Order</CardTitle>
                               <CardDescription>Please review all your order details carefully before placing the order.</CardDescription>
                             </CardHeader>
                             <CardContent>
                                {/* Add checks similar to payment step, but render ReviewSummary if all good */ 
                                }
                                {!isAuthenticated ? (
                                    <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md flex items-center space-x-3 mb-6">
                                       {/* ... Auth required message ... */} 
                                       <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0"/>
                                        <div className="flex-grow">
                                            <p className="text-yellow-800 font-medium">Authentication Required</p>
                                            <p className="text-sm text-yellow-700">Log in to review your order.</p>
                                        </div>
                                         <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100" onClick={() => setCurrentStep('account')}>
                                            Go to Account
                                        </Button>
                                    </div>
                                ) : !paymentProofUrl || !selectedPaymentMethodId || !selectedLocation ? (
                                    <div className="p-4 bg-orange-50 border border-orange-300 rounded-md flex items-center space-x-3 mb-6">
                                      {/* ... Missing info message ... */} 
                                      <AlertCircle className="h-6 w-6 text-orange-500 flex-shrink-0"/>
                                        <div className="flex-grow">
                                            <p className="text-orange-800 font-medium">Order Incomplete</p>
                                            <p className="text-sm text-orange-700">Please ensure all previous steps are completed.</p>
                                        </div>
                                         <Button size="sm" variant="outline" className="border-orange-600 text-orange-700 hover:bg-orange-100" onClick={() => setCurrentStep('payment')}>
                                            Go Back
                                        </Button>
                                    </div>
                                ) : (
                                   <ReviewSummary 
                                        plan={plan} 
                                        location={selectedLocationDetails || null}
                                        userEmail={user?.email}
                                        paymentMethodId={selectedPaymentMethodId}
                                        paymentProofFilename={paymentProofFilename}
                                        promoCode={promoDiscount > 0 ? promoCode : null}
                                        basePrice={plan.price}
                                        discount={promoDiscount}
                                        totalPrice={calculatedTotal}
                                    />
                                )
                                }
                                {orderSubmissionError && (
                                    <div className="mt-6 p-3 bg-red-50 border border-red-300 rounded-md flex items-start space-x-2 text-red-700">
                                        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm font-medium">Error placing order: {orderSubmissionError}</p>
                                    </div>
                                 )}
                              </CardContent>
                           </Card>
                        )}

                        {/* --- Step Navigation --- */}
                        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                            <Button 
                            variant="outline" 
                            onClick={goToPreviousStep} 
                            disabled={currentStepIndex === 0 || isSubmittingOrder}
                            className="disabled:opacity-50"
                            >
                            <ArrowLeft size={18} className="mr-2" /> Previous
                            </Button>
                            {currentStepIndex < orderSteps.length - 1 ? (
                            <Button 
                                onClick={goToNextStep} 
                                disabled={isSubmittingOrder}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                            >
                                Next <ArrowRight size={18} className="ml-2" />
                            </Button>
                            ) : (
                            <Button 
                                onClick={handlePlaceOrder} 
                                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                                disabled={!isAuthenticated || !paymentProofUrl || !selectedPaymentMethodId || !selectedLocation || isSubmittingOrder || isLoadingPlan || isAuthLoading } 
                            >
                                { isSubmittingOrder ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" /> }
                                { isSubmittingOrder ? 'Placing Order...' : 'Confirm & Place Order' }
                            </Button>
                            )}
                        </div>

                        {/* --- Static How-to Guide --- */}
                        <HowToOrderGuide />
                    </main>

                    {/* --- Order Summary Sidebar --- */}
                    <aside className="lg:col-span-5 xl:col-span-4 h-fit lg:sticky lg:top-8">
                       <Card className="shadow-lg border-gray-200">
                          <CardHeader>
                              <CardTitle className="text-xl">Order Summary</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4 text-sm">
                              {/* Plan details */}
                               <div className="flex justify-between"><span className="text-gray-500">Plan:</span> <span className="font-medium text-right">{plan.name}</span></div>
                               <div className="flex justify-between"><span className="text-gray-500">CPU:</span> <span className="font-medium text-right">{plan.cpu}</span></div>
                               <div className="flex justify-between"><span className="text-gray-500">RAM:</span> <span className="font-medium text-right">{plan.ram}</span></div>
                               <div className="flex justify-between"><span className="text-gray-500">Storage:</span> <span className="font-medium text-right">{plan.storage}</span></div>
                               
                               {/* Location */} 
                               {selectedLocationDetails && (
                                  <div className="flex justify-between">
                                      <span className="text-gray-500">Location:</span>
                                      <span className="font-medium text-right">
                                          {selectedLocationDetails.flag} {selectedLocationDetails.name} {selectedLocationDetails.city ? `(${selectedLocationDetails.city})` : ''}
                                      </span>
                                  </div>
                               )}
                               
                              {/* Payment Info */} 
                              {selectedPaymentMethodId && (
                                  <div className="flex justify-between">
                                      <span className="text-gray-500">Method:</span>
                                      <span className="font-medium capitalize">{selectedPaymentMethodId}</span>
                                  </div>
                              )}
                              {paymentProofFilename && (
                                  <div className="flex justify-between items-center">
                                      <span className="text-gray-500">Proof:</span>
                                      <span className="font-medium text-green-600 text-xs truncate max-w-[120px] sm:max-w-[150px]" title={paymentProofFilename}>{paymentProofFilename}</span>
                                  </div>
                              )}

                              {/* Pricing */} 
                              <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
                                  <div className="flex justify-between">
                                      <span className="text-gray-500">Base Price:</span>
                                      <span className="font-medium">{plan.price.toFixed(2)} PKR</span>
                                  </div>
                                  {promoDiscount > 0 && (
                                      <div className="flex justify-between text-green-600">
                                      <span className="text-gray-500">Promo ({promoCode}):</span>
                                      <span className="font-medium">- {promoDiscount.toFixed(2)} PKR</span>
                                      </div>
                                  )}
                                  <div className="flex justify-between text-lg font-bold mt-2 pt-3 border-t border-gray-300">
                                      <span className="text-gray-800">Total:</span>
                                      <span className="text-indigo-700">{calculatedTotal.toFixed(2)} PKR</span>
                                  </div>
                              </div>
                              {/* User Info */} 
                              {user && (
                                  <div className="mt-4 pt-3 border-t border-gray-200">
                                      <p className="text-xs text-gray-500">Order will be placed for: <span className="font-medium text-gray-700">{user.email}</span></p>
                                  </div>
                              )}

                               <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => router.push('/pricing')} 
                                  className="w-full mt-4 text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                                  >
                                  Change Plan
                              </Button>
                          </CardContent>
                       </Card>
                    </aside>
                 </div>
            </> 
         )}
      </div>
    </div>
  );
}
