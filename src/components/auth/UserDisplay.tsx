'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { LogOut, UserCircle, CheckCircle, Loader2, Mail, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

// Extend the User type to include optional createdAt
interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  fullName?: string;
  role: string;
  emailVerified?: boolean;
  isAdmin?: boolean;
  createdAt?: string | Date;
  lastLogin?: string | Date;
}

const UserDisplay: React.FC = () => {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) {
    return null; // Or a fallback if this component is rendered when no user (should not happen in intended flow)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    // AuthProvider will clear user, OrderPage will re-render based on isAuthenticated
  };
  
  // Cast user to ExtendedUser type
  const extendedUser = user as ExtendedUser;
  
  // Format the registration date if available
  const formattedDate = extendedUser.createdAt 
    ? format(new Date(extendedUser.createdAt), 'MMM d, yyyy')
    : 'N/A';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* User info card */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 border-2 border-indigo-200 dark:border-indigo-700/40 flex items-center justify-center shadow-md">
            <UserCircle className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="absolute bottom-0 right-0 p-1 bg-green-100 dark:bg-green-900/40 rounded-full border-2 border-white dark:border-gray-800">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start mb-1.5">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full mr-2">
              <UserCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-violet-700 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              {user.name || user.fullName || 'Account Holder'}
            </h3>
          </div>
          
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start text-gray-600 dark:text-gray-400">
              <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mr-2">
                <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-sm">{user.email}</span>
            </div>
            
            {extendedUser.createdAt && (
              <div className="flex items-center justify-center sm:justify-start text-gray-600 dark:text-gray-400">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mr-2">
                  <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm">Member since {formattedDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Status indicator */}
      <div className="flex items-center justify-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Account verified and ready to proceed
          </p>
        </div>
      </div>
      
      {/* Logout button */}
      <div className="pt-2">
      <Button
        onClick={handleLogout}
        disabled={isAuthLoading || isLoggingOut}
        className="w-full flex justify-center items-center rounded-xl py-2.5 text-base font-medium shadow-sm transition-all duration-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
      >
        {isLoggingOut ? (
          <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-full mr-2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-600 dark:text-gray-300" />
          </div>
        ) : (
          <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded-full mr-2">
            <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
        )}
        {isLoggingOut ? 'Logging out...' : 'Log Out'}
      </Button>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          Not you? Log out to switch account.
        </p>
    </div>
    </motion.div>
  );
};

export default UserDisplay; 