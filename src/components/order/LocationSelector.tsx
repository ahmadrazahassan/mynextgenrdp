'use client';

import React from 'react';
import { MapPin, Check, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
// Assuming you have flags as separate components or images later
// Using emoji flags for now

interface Location {
  id: string;
  name: string;
  flag: string; 
  city?: string;
}

export const locations: Location[] = [
  { id: 'us-dal', name: 'USA', city: 'Dallas', flag: '🇺🇸' },
  { id: 'us-nyc', name: 'USA', city: 'New York', flag: '🇺🇸' },
  { id: 'uk-lon', name: 'UK', city: 'London', flag: '🇬🇧' },
  { id: 'in', name: 'India', flag: '🇮🇳' },
  { id: 'de', name: 'Germany', flag: '🇩🇪' },
  { id: 'fr', name: 'France', flag: '🇫🇷' },
  { id: 'sg', name: 'Singapore', flag: '🇸🇬' },
  { id: 'hk', name: 'Hong Kong', flag: '🇭🇰' },
  { id: 'sa', name: 'Saudi Arabia', flag: '🇸🇦' },
];

interface LocationSelectorProps {
  selectedLocation: string | null;
  onLocationChange: (locationId: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ selectedLocation, onLocationChange }) => {
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {locations.map((location) => (
          <motion.button
            key={location.id}
            type="button"
            onClick={() => onLocationChange(location.id)}
            className={`
              relative p-4 rounded-xl transition-all duration-300 ease-in-out 
              flex flex-col items-center justify-center space-y-2 overflow-hidden
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              group
              ${selectedLocation === location.id 
                ? 'bg-gradient-to-br from-indigo-50 to-indigo-100/70 border border-indigo-200 shadow-md' 
                : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-indigo-200'
              }
            `}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {selectedLocation === location.id && (
              <div className="absolute top-2 right-2 bg-indigo-100 p-1 rounded-full">
                <Check className="h-3 w-3 text-indigo-600" />
              </div>
            )}
            <div className="relative">
              <span className="text-3xl md:text-4xl filter drop-shadow-sm" role="img" aria-label={location.name}>
                {location.flag}
              </span>
              {selectedLocation === location.id && (
                <motion.div 
                  className="absolute -inset-3 rounded-full border-2 border-indigo-400/30"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-gray-800">
                {location.name}
              </span>
              {location.city && (
                <span className="block text-xs text-gray-500 mt-0.5">
                  {location.city}
                </span>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/5 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default LocationSelector; 