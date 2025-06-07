'use client';

import React, { useState } from 'react';
import { Wallet, Landmark, Phone, Copy, Check, CreditCard, ChevronRight, AlertCircle, BadgeCheck, Shield, ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentMethod {
  id: string;
  name: string;
  Icon: React.ElementType;
  details: Array<{ label: string; value: string; copyable?: boolean }>;
  themeColor: string;
  subtitle?: string;
  processingTime?: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'wise',
    name: 'Wise (TransferWise)',
    subtitle: 'International transfers with low fees',
    Icon: Wallet,
    themeColor: 'green',
    processingTime: '1-2 business days',
    details: [
      { label: 'Email', value: 'minal283636@gmail.com', copyable: true },
      { label: 'Beneficiary Name', value: 'Zaid Umar', copyable: true },
    ],
  },
  {
    id: 'alliedbank',
    name: 'Allied Bank',
    subtitle: 'Domestic bank transfer',
    Icon: Landmark,
    themeColor: 'blue',
    processingTime: 'Same day',
    details: [
      { label: 'Account Number', value: '13860010135378610018', copyable: true },
      { label: 'IBAN', value: 'PK57ABPA0010135378610018', copyable: true },
      { label: 'Account Name', value: 'Ahmad Raza Hassan', copyable: true },
    ],
  },
  {
    id: 'nayapay',
    name: 'NayaPay',
    subtitle: 'Mobile wallet payments',
    Icon: Phone,
    themeColor: 'purple',
    processingTime: 'Instant',
    details: [
      { label: 'NayaPay ID (Email)', value: 'ahmadchz0309@nayapay', copyable: true },
      { label: 'Registered Number', value: '03095782432', copyable: true },
    ],
  },
];

interface PaymentMethodSelectorProps {
  selectedMethodId: string | null;
  onMethodSelect: (methodId: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ selectedMethodId, onMethodSelect }) => {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedValue(text);
      toast({ 
        title: "Copied to clipboard", 
        description: `${label} has been copied`,
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800 rounded-xl" 
      });
      setTimeout(() => setCopiedValue(null), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({ 
        title: "Copy Failed", 
        description: "Could not copy text to clipboard.", 
        variant: "destructive" 
      });
    });
  };

  // Get method by ID
  const getSelectedMethod = (id: string | null) => {
    if (!id) return null;
    return paymentMethods.find(method => method.id === id) || null;
  };

  const selectedMethod = getSelectedMethod(selectedMethodId);

  // Define theme classes for light mode
  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'green': return 'border-gray-200 group-hover:border-green-400/80 group-hover:bg-green-50/80';
      case 'blue': return 'border-gray-200 group-hover:border-blue-400/80 group-hover:bg-blue-50/80';
      case 'purple': return 'border-gray-200 group-hover:border-purple-400/80 group-hover:bg-purple-50/80';
      default: return 'border-gray-200 group-hover:border-gray-400 group-hover:bg-gray-50';
    }
  };

  const getSelectedThemeClasses = (theme: string) => {
     switch (theme) {
      case 'green': return 'border-green-400 shadow-[0_0_0_1px_rgba(74,222,128,0.6)] bg-gradient-to-br from-green-50 to-emerald-50/60';
      case 'blue': return 'border-blue-400 shadow-[0_0_0_1px_rgba(96,165,250,0.6)] bg-gradient-to-br from-blue-50 to-indigo-50/60';
      case 'purple': return 'border-purple-400 shadow-[0_0_0_1px_rgba(192,132,252,0.6)] bg-gradient-to-br from-purple-50 to-violet-50/60';
      default: return 'border-gray-400 shadow-[0_0_0_1px_rgba(156,163,175,0.6)] bg-gradient-to-br from-gray-50 to-slate-50/60';
    }
  };

  const getIconWrapperClass = (theme: string, isSelected: boolean) => {
    if (isSelected) {
      switch (theme) {
        case 'green': return 'bg-green-100 text-green-600 border-green-200';
        case 'blue': return 'bg-blue-100 text-blue-600 border-blue-200';
        case 'purple': return 'bg-purple-100 text-purple-600 border-purple-200';
        default: return 'bg-gray-100 text-gray-600 border-gray-200';
      }
    }
    return 'bg-gray-100 text-gray-500 border-gray-200';
  };

  const getIconColor = (theme: string, isSelected: boolean) => {
    if (isSelected) {
      switch (theme) {
        case 'green': return 'text-green-600';
        case 'blue': return 'text-blue-600';
        case 'purple': return 'text-purple-600';
        default: return 'text-gray-600';
      }
    }
    return 'text-gray-500';
  };

  const getDetailColor = (theme: string, isSelected: boolean) => {
    if (isSelected) {
      switch (theme) {
        case 'green': return 'bg-green-50/60 border-green-100';
        case 'blue': return 'bg-blue-50/60 border-blue-100';
        case 'purple': return 'bg-purple-50/60 border-purple-100';
        default: return 'bg-gray-50/60 border-gray-100';
      }
    }
    return 'bg-white/80 border-gray-100';
  };

  const getBadgeClass = (theme: string) => {
    switch (theme) {
      case 'green': return 'bg-green-100 text-green-700 border-green-200';
      case 'blue': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'purple': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
        <CreditCard className="h-5 w-5 mr-2 text-indigo-600" />
        Select Payment Method
      </h3>
      <p className="text-sm text-gray-500 mb-5 flex items-center">
        <AlertCircle className="h-4 w-4 mr-1.5 text-amber-500" />
        Choose one of the following methods for manual payment. You'll upload proof in the next step.
      </p>
      
      <div className="grid grid-cols-1 gap-6">
        {paymentMethods.map((method) => {
          const isSelected = selectedMethodId === method.id;
          const isHovered = hoveredMethod === method.id;
          
          return (
            <motion.div
              key={method.id}
              whileHover={{ scale: 1.005 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="relative group"
              onMouseEnter={() => setHoveredMethod(method.id)}
              onMouseLeave={() => setHoveredMethod(null)}
            >
              <div 
                onClick={() => onMethodSelect(method.id)}
                className={`relative p-6 rounded-xl border cursor-pointer transition-all duration-200 backdrop-blur-sm shadow-sm
                  ${isSelected 
                    ? getSelectedThemeClasses(method.themeColor) 
                    : getThemeClasses(method.themeColor)
                  }`}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2 p-1 bg-white rounded-full z-10 border-2 border-green-400 shadow-sm">
                    <BadgeCheck className="h-4 w-4 text-green-500" />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Method Info Section */}
                  <div className="md:col-span-1">
                    <div className="flex items-start">
                      <div className={`p-2.5 rounded-lg ${getIconWrapperClass(method.themeColor, isSelected)} border`}>
                        <method.Icon className={`h-6 w-6 ${getIconColor(method.themeColor, isSelected)}`} />
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className={`text-base font-semibold ${getIconColor(method.themeColor, isSelected)}`}>
                          {method.name}
                        </h4>
                        {method.subtitle && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {method.subtitle}
                          </p>
                        )}
                        {method.processingTime && (
                          <div className="mt-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getBadgeClass(method.themeColor)}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                              </svg>
                              {method.processingTime}
                            </span>
                          </div>
                        )}
                        
                        <div className="mt-4 flex items-center gap-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`rounded-full text-xs py-0 h-7 border-gray-200 ${isSelected ? 'bg-white' : ''}`}
                            onClick={(e) => {e.stopPropagation(); onMethodSelect(method.id);}}
                          >
                            {isSelected ? (
                              <>
                                <Check className="h-3 w-3 mr-1 text-green-500" />
                                Selected
                              </>
                            ) : (
                              <>
                                <Shield className="h-3 w-3 mr-1" />
                                Select Method
                              </>
                            )}
                          </Button>
                          
                          <a 
                            href="#" 
                            onClick={(e) => e.preventDefault()}
                            className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Help
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Details Section */}
                  <div className="md:col-span-2">
                    <div className={`rounded-lg border ${getDetailColor(method.themeColor, isSelected)} p-4`}>
                      <div className="space-y-3">
                        <h5 className="text-sm font-medium text-gray-700 flex items-center">
                          <Shield className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
                          Payment Details
                        </h5>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {method.details.map((detail) => (
                            <div 
                              key={detail.label} 
                              className="p-3 bg-white/90 border border-gray-100 rounded-lg shadow-sm"
                            >
                              <div className="text-xs text-gray-500 font-medium mb-1">{detail.label}:</div>
                              <div className="flex items-center justify-between gap-2 relative group/copy">
                                <span className="text-gray-800 break-words font-mono text-sm select-all truncate flex-1">
                                  {detail.value}
                                </span>
                                {detail.copyable && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={(e) => { e.stopPropagation(); handleCopy(detail.value, detail.label); }}
                                    className={`text-gray-400 hover:text-indigo-600 h-7 w-7 shrink-0 rounded-full 
                                      ${copiedValue === detail.value ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'}`}
                                    aria-label={`Copy ${detail.label}`}
                                  >
                                    {copiedValue === detail.value ? (
                                      <Check size={14} className="text-green-600"/>
                                    ) : (
                                      <Copy size={14} />
                                    )}
                                  </Button>
                                )}
                                {detail.copyable && (
                                  <span className="absolute right-0 -top-8 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover/copy:opacity-100 transition-opacity pointer-events-none z-10">
                                    Click to copy
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center mt-1 text-xs text-amber-600 bg-amber-50/70 p-2 rounded-lg border border-amber-100">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-500 mr-1.5 flex-shrink-0" />
                          <span>Ensure all details match when making the payment. Double-check account numbers.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Background gradient effect on hover/selected */}
              {(isHovered || isSelected) && (
                <div className={`absolute -inset-0.5 rounded-xl opacity-60 blur-sm -z-10 ${
                  method.themeColor === 'green' ? 'bg-gradient-to-r from-green-400 to-emerald-400' :
                  method.themeColor === 'blue' ? 'bg-gradient-to-r from-blue-400 to-indigo-400' :
                  'bg-gradient-to-r from-purple-400 to-violet-400'
                }`} />
              )}
            </motion.div>
          );
        })}
      </div>
      
      {selectedMethod && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100"
        >
          <div className="flex items-center">
            <BadgeCheck className="h-5 w-5 text-indigo-600 mr-2" />
            <p className="text-sm font-medium text-indigo-800">
              You've selected <span className="font-semibold">{selectedMethod.name}</span>. Please use the details above to make your payment.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PaymentMethodSelector; 