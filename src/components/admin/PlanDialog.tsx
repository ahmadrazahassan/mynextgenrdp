"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Cpu, Database, HardDrive, Wifi,
  Globe, Star, Plus, X, Loader2, ServerCog
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";

// Define plan interface
interface Plan {
  id: string;
  name: string;
  type: "rdp" | "vps";
  price: number;
  discountedPrice?: number;
  isPopular: boolean;
  active: boolean;
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    bandwidth: string;
    location: string;
    os?: string;
  };
  themeColor?: string;
  duration: number; // in months
  description: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

interface PlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
  onComplete: (plan: Plan, isNew: boolean) => void;
}

export function PlanDialog({
  open,
  onOpenChange,
  plan,
  onComplete
}: PlanDialogProps) {
  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<"rdp" | "vps">("rdp");
  const [price, setPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [description, setDescription] = useState("");
  const [cpu, setCpu] = useState("");
  const [ram, setRam] = useState("");
  const [storage, setStorage] = useState("");
  const [bandwidth, setBandwidth] = useState("");
  const [location, setLocation] = useState("");
  const [os, setOs] = useState("");
  const [themeColor, setThemeColor] = useState("sky");
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Manage feature input reference
  const featureInputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog opens/closes or when plan changes
  useEffect(() => {
    if (open && plan) {
      // Edit mode - populate form with plan data
      setName(plan.name);
      setType(plan.type);
      setPrice(plan.price.toString());
      setDiscountedPrice(plan.discountedPrice ? plan.discountedPrice.toString() : "");
      setDescription(plan.description || "");
      setCpu(plan.specs.cpu);
      setRam(plan.specs.ram);
      setStorage(plan.specs.storage);
      setBandwidth(plan.specs.bandwidth);
      setLocation(plan.specs.location);
      setOs(plan.specs.os || "");
      setThemeColor(plan.themeColor || "sky");
      setIsPopular(plan.isPopular);
      setIsActive(plan.active);
      setFeatures(plan.features);
    } else if (open) {
      // Create mode - reset form
      setName("");
      setType("rdp");
      setPrice("");
      setDiscountedPrice("");
      setDescription("");
      setCpu("");
      setRam("");
      setStorage("");
      setBandwidth("Unmetered");
      setLocation("US East");
      setOs(type === "rdp" ? "Windows Server 2022" : "Windows 10");
      setThemeColor("sky");
      setIsPopular(false);
      setIsActive(true);
      setFeatures([]);
    }
    
    // Always reset these
    setNewFeature("");
    setErrors({});
    setActiveTab("basic");
    setApiError(null);
  }, [open, plan, type]);

  // Handle adding a new feature
  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
      
      // Focus back on the input for easy adding of multiple features
      if (featureInputRef.current) {
        featureInputRef.current.focus();
      }
    }
  };

  // Handle removing a feature
  const handleRemoveFeature = (indexToRemove: number) => {
    setFeatures(features.filter((_, index) => index !== indexToRemove));
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "Plan name is required";
    }
    
    if (!price.trim()) {
      newErrors.price = "Price is required";
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = "Price must be a positive number";
    }
    
    if (!cpu.trim()) {
      newErrors.cpu = "CPU specification is required";
    }
    
    if (!ram.trim()) {
      newErrors.ram = "RAM specification is required";
    }
    
    if (!storage.trim()) {
      newErrors.storage = "Storage specification is required";
    }
    
    if (!bandwidth.trim()) {
      newErrors.bandwidth = "Bandwidth specification is required";
    }
    
    if (!location.trim()) {
      newErrors.location = "Location is required";
    }
    
    if (!os.trim()) {
      newErrors.os = "OS is required";
    }
    
    if (features.length === 0) {
      newErrors.features = "At least one feature is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      // Show the tab with errors
      if (
        errors.name || 
        errors.price || 
        errors.description
      ) {
        setActiveTab("basic");
      } else if (
        errors.cpu || 
        errors.ram || 
        errors.storage || 
        errors.bandwidth || 
        errors.location ||
        errors.os
      ) {
        setActiveTab("specs");
      } else {
        setActiveTab("features");
      }
      return;
    }
    
    // Format the plan data
    const planData = {
      id: plan?.id || uuidv4(),
      name,
      type,
      price: Number(price),
      discountedPrice: discountedPrice ? Number(discountedPrice) : undefined,
      isPopular,
      active: isActive,
      themeColor,
      specs: {
        cpu,
        ram,
        storage,
        bandwidth,
        location,
        os
      },
      description,
      features
    };
    
    setIsSubmitting(true);
    setApiError(null);
    
    try {
      if (plan) {
        // Update existing plan
        const response = await fetch(`/api/admin/plans`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(planData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error: ${response.status}`);
        }
        
        const updatedPlan = await response.json();
        onComplete(updatedPlan, false);
      } else {
        // Create new plan
        const response = await fetch('/api/admin/plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(planData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error: ${response.status}`);
        }
        
        const newPlan = await response.json();
        onComplete(newPlan, true);
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      setApiError(error instanceof Error ? error.message : "Failed to save plan. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white text-gray-900 border border-gray-200 shadow-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ServerCog className="h-5 w-5 text-blue-600" />
            <DialogTitle>{plan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
          </div>
          <DialogDescription className="text-gray-500">
            {plan 
              ? "Update the details of this service plan" 
              : "Configure the details for a new service plan"}
          </DialogDescription>
        </DialogHeader>
        
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {apiError}
          </div>
        )}

        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full mb-4">
            <TabsTrigger 
              value="basic" 
              className={`${errors.name || errors.price || errors.description ? "text-red-600" : ""} data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700`}
            >
              Basic
            </TabsTrigger>
            <TabsTrigger 
              value="specs" 
              className={`${errors.cpu || errors.ram || errors.storage || errors.bandwidth || errors.location || errors.os ? "text-red-600" : ""} data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700`}
            >
              Specifications
            </TabsTrigger>
            <TabsTrigger 
              value="features" 
              className={`${errors.features ? "text-red-600" : ""} data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700`}
            >
              Features
            </TabsTrigger>
            <TabsTrigger 
              value="appearance" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700"
            >
              Appearance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-gray-700">
                  Plan Name <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Windows RDP Premium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`bg-white border-gray-300 text-gray-900 focus:border-blue-500 ${errors.name ? "border-red-500" : ""}`}
                />
                {errors.name && (
                  <p className="text-red-600 text-sm">{errors.name}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-gray-700">
                  Plan Type <span className="text-red-600">*</span>
                </Label>
                <Select 
                  value={type} 
                  onValueChange={(value) => setType(value as "rdp" | "vps")}
                >
                  <SelectTrigger id="type" className="bg-white border-gray-300 text-gray-900 focus:border-blue-500">
                    <SelectValue placeholder="Select plan type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 text-gray-900">
                    <SelectItem value="rdp" className="focus:bg-blue-50 focus:text-blue-700">RDP (Remote Desktop)</SelectItem>
                    <SelectItem value="vps" className="focus:bg-blue-50 focus:text-blue-700">VPS (Virtual Private Server)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className={errors.price ? "text-red-500" : ""}>
                  Price (PKR)
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g. 1999"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={errors.price ? "border-red-500 ring-red-500" : ""}
                />
                {errors.price && (
                  <p className="text-sm text-red-500 mt-1">{errors.price}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discountedPrice" className="flex items-center justify-between">
                  Discounted Price (PKR)
                  <span className="text-xs text-gray-500">(Optional)</span>
                </Label>
                <Input
                  id="discountedPrice"
                  type="number"
                  placeholder="e.g. 1799"
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(e.target.value)}
                />
                {discountedPrice && Number(discountedPrice) >= Number(price) ? (
                  <p className="text-sm text-amber-600 mt-1">
                    Discount price should be lower than regular price
                  </p>
                ) : discountedPrice ? (
                  <p className="text-xs text-gray-500 mt-1">
                    Savings: {price && discountedPrice ? `${Math.round((1 - Number(discountedPrice) / Number(price)) * 100)}%` : '0%'}
                  </p>
                ) : null}
              </div>
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPopular" className="text-gray-700">Mark as Popular</Label>
                <Switch
                  id="isPopular"
                  checked={isPopular}
                  onCheckedChange={setIsPopular}
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <Label htmlFor="isActive" className="text-gray-700">Active Plan</Label>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-gray-700">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the plan and its benefits..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] bg-white border-gray-300 text-gray-900 focus:border-blue-500"
              />
              {errors.description && (
                <p className="text-red-600 text-sm">{errors.description}</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="specs" className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cpu" className="flex items-center gap-2 text-gray-700">
                  <Cpu className="h-4 w-4 text-blue-600" />
                  CPU <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="cpu"
                  placeholder="e.g. 4 vCPU"
                  value={cpu}
                  onChange={(e) => setCpu(e.target.value)}
                  className={`bg-white border-gray-300 text-gray-900 focus:border-blue-500 ${errors.cpu ? "border-red-500" : ""}`}
                />
                {errors.cpu && (
                  <p className="text-red-600 text-sm">{errors.cpu}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="ram" className="flex items-center gap-2 text-gray-700">
                  <Database className="h-4 w-4 text-blue-600" />
                  RAM <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="ram"
                  placeholder="e.g. 8 GB"
                  value={ram}
                  onChange={(e) => setRam(e.target.value)}
                  className={`bg-white border-gray-300 text-gray-900 focus:border-blue-500 ${errors.ram ? "border-red-500" : ""}`}
                />
                {errors.ram && (
                  <p className="text-red-600 text-sm">{errors.ram}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="storage" className="flex items-center gap-2 text-gray-700">
                  <HardDrive className="h-4 w-4 text-blue-600" />
                  Storage <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="storage"
                  placeholder="e.g. 120 GB SSD"
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  className={`bg-white border-gray-300 text-gray-900 focus:border-blue-500 ${errors.storage ? "border-red-500" : ""}`}
                />
                {errors.storage && (
                  <p className="text-red-600 text-sm">{errors.storage}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="bandwidth" className="flex items-center gap-2 text-gray-700">
                  <Wifi className="h-4 w-4 text-blue-600" />
                  Bandwidth <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="bandwidth"
                  placeholder="e.g. Unmetered"
                  value={bandwidth}
                  onChange={(e) => setBandwidth(e.target.value)}
                  className={`bg-white border-gray-300 text-gray-900 focus:border-blue-500 ${errors.bandwidth ? "border-red-500" : ""}`}
                />
                {errors.bandwidth && (
                  <p className="text-red-600 text-sm">{errors.bandwidth}</p>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="location" className="flex items-center gap-2 text-gray-700">
                <Globe className="h-4 w-4 text-blue-600" />
                Location <span className="text-red-600">*</span>
              </Label>
              <Input
                id="location"
                placeholder="e.g. United States"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`bg-white border-gray-300 text-gray-900 focus:border-blue-500 ${errors.location ? "border-red-500" : ""}`}
              />
              {errors.location && (
                <p className="text-red-600 text-sm">{errors.location}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="os" className={cn(errors.os ? "text-red-500" : "")}>
                Operating System
              </Label>
              <Select 
                value={os} 
                onValueChange={setOs}
              >
                <SelectTrigger 
                  id="os" 
                  className={cn(
                    "w-full", 
                    errors.os ? "border-red-500 ring-red-500" : ""
                  )}
                >
                  <SelectValue placeholder="Select OS" />
                </SelectTrigger>
                <SelectContent>
                  {type === 'rdp' ? (
                    <>
                      <SelectItem value="Windows Server 2022">Windows Server 2022</SelectItem>
                      <SelectItem value="Windows Server 2019">Windows Server 2019</SelectItem>
                      <SelectItem value="Windows Server 2016">Windows Server 2016</SelectItem>
                      <SelectItem value="Windows 11">Windows 11</SelectItem>
                      <SelectItem value="Windows 10">Windows 10</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Windows 10">Windows 10</SelectItem>
                      <SelectItem value="Windows Server 2022">Windows Server 2022</SelectItem>
                      <SelectItem value="Windows 11">Windows 11</SelectItem>
                      <SelectItem value="Ubuntu 22.04">Ubuntu 22.04</SelectItem>
                      <SelectItem value="Debian 11">Debian 11</SelectItem>
                      <SelectItem value="CentOS 8">CentOS 8</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {errors.os && (
                <p className="text-sm text-red-500 mt-1">{errors.os}</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="features" className="space-y-4 mt-2">
            <div className="grid gap-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a feature..."
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  ref={featureInputRef}
                  className="bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                />
                <Button 
                  type="button" 
                  onClick={handleAddFeature}
                  disabled={!newFeature.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {errors.features && (
                <p className="text-red-600 text-sm">{errors.features}</p>
              )}
              
              <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-gray-900">
                  <Star className="h-4 w-4 text-amber-500" />
                  Plan Features
                </h4>
                {features.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No features added yet. Add some features to highlight what's included in this plan.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded-md border border-gray-200 shadow-sm">
                        <span className="text-gray-900">{feature}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFeature(index)}
                          className="h-6 w-6 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-medium mb-2">Theme Color</h3>
                <div className="grid grid-cols-5 gap-2">
                  {['sky', 'blue', 'indigo', 'purple', 'green', 'emerald', 'teal', 'orange', 'amber', 'red'].map((color) => (
                    <div
                      key={color}
                      className={`h-10 rounded-md cursor-pointer transform transition-all 
                        ${themeColor === color ? 'ring-2 ring-blue-600 scale-110' : 'hover:scale-105'}`}
                      style={{ 
                        background: getThemeGradient(color),
                      }}
                      onClick={() => setThemeColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isPopular" className="cursor-pointer">
                    Mark as Popular
                  </Label>
                  <Switch
                    id="isPopular"
                    checked={isPopular}
                    onCheckedChange={setIsPopular}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Popular plans get highlighted on the pricing page
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Active
                  </Label>
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Inactive plans won't be visible to customers
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              plan ? "Update Plan" : "Create Plan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getThemeGradient(color: string): string {
  const colors: Record<string, string> = {
    sky: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
    blue: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    indigo: 'linear-gradient(135deg, #4f46e5, #6366f1)',
    purple: 'linear-gradient(135deg, #7e22ce, #a855f7)',
    green: 'linear-gradient(135deg, #16a34a, #4ade80)',
    emerald: 'linear-gradient(135deg, #059669, #34d399)',
    teal: 'linear-gradient(135deg, #0d9488, #2dd4bf)',
    orange: 'linear-gradient(135deg, #ea580c, #fb923c)',
    amber: 'linear-gradient(135deg, #d97706, #fbbf24)',
    red: 'linear-gradient(135deg, #dc2626, #ef4444)'
  };
  
  return colors[color] || colors.sky;
} 