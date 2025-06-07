'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, XCircle, BadgePercent, Sparkles, Ticket, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromoCodeInputProps {
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
  onApplyPromoCode: () => void;
  isApplying?: boolean;
  message?: string | null;
  discount?: number;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  promoCode,
  onPromoCodeChange,
  onApplyPromoCode,
  isApplying = false,
  message = null,
  discount = 0
}) => {
  const isSuccess = message !== null && discount > 0;
  const isError = message !== null && !isSuccess;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Input
            type="text"
            value={promoCode}
            onChange={(e) => onPromoCodeChange(e.target.value)}
            placeholder="Enter promo code"
            className={`pl-10 pr-3 py-2 border-gray-300 bg-white/90 rounded-xl transition-all duration-200 ${
              isSuccess 
                ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500' 
                : isError 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'focus:border-indigo-500 focus:ring-indigo-500 hover:border-indigo-300'
            }`}
            disabled={isApplying || isSuccess}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSuccess ? (
              <Ticket className="h-5 w-5 text-emerald-500" />
            ) : (
              <Tag className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
        <Button
          onClick={onApplyPromoCode}
          disabled={!promoCode.trim() || isApplying || isSuccess}
          className={`whitespace-nowrap px-4 py-2 rounded-xl transition-all duration-300 ${
            isSuccess 
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default'
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white'
          }`}
        >
          {isApplying ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : isSuccess ? (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          ) : (
            <BadgePercent className="h-4 w-4 mr-2" />
          )}
          {isApplying ? 'Applying...' : isSuccess ? 'Applied!' : 'Apply Code'}
        </Button>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`rounded-xl p-3 flex items-start space-x-2 ${
              isSuccess 
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100' 
                : 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-100'
            }`}
          >
            <div className={`p-1 rounded-full flex-shrink-0 ${isSuccess ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {isSuccess ? (
                <Sparkles className="h-4 w-4 text-emerald-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm ${isSuccess ? 'text-emerald-700' : 'text-red-700'}`}>
                {message}
              </p>
              {isSuccess && discount > 0 && (
                <p className="text-sm font-medium text-emerald-700 mt-1">
                  Discount: ${discount.toFixed(2)}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromoCodeInput; 