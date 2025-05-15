// src/repositories/planRepository.ts
// THIS FILE IS DEPRECATED - Use planRepositoryPrisma.ts instead
// Keeping the type definitions for reference

/**
 * Represents a plan in the database
 */
export interface Plan {
  id: string;
  category_id: number;
  name: string;
  description?: string;
  cpu: string;
  ram: string;
  storage: string;
  bandwidth: string;
  os?: string;
  price_pkr: number;
  is_active: boolean;
  theme_color?: string;
  label?: string;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Represents a plan with its features
 */
export interface PlanWithFeatures extends Plan {
  features: string[];
}

/*
 * The implementations below are deprecated - use planRepositoryPrisma.ts instead
 */

export async function getAllPlans(): Promise<Plan[]> {
  throw new Error('This implementation is deprecated - use planRepositoryPrisma.ts instead');
}

export async function getPlanById(id: string): Promise<Plan | null> {
  throw new Error('This implementation is deprecated - use planRepositoryPrisma.ts instead');
}

export async function getPlanWithFeaturesById(id: string): Promise<PlanWithFeatures | null> {
  throw new Error('This implementation is deprecated - use planRepositoryPrisma.ts instead');
}

export async function getPlansByCategory(categorySlug: string): Promise<Plan[]> {
  throw new Error('This implementation is deprecated - use planRepositoryPrisma.ts instead');
}

export async function getPlansWithFeaturesByCategory(categorySlug: string): Promise<PlanWithFeatures[]> {
  throw new Error('This implementation is deprecated - use planRepositoryPrisma.ts instead');
}

export async function createPlan(plan: Omit<Plan, 'created_at' | 'updated_at'>): Promise<Plan> {
  throw new Error('This implementation is deprecated - use planRepositoryPrisma.ts instead');
}

export async function updatePlan(id: string, plan: Partial<Omit<Plan, 'id' | 'created_at' | 'updated_at'>>): Promise<Plan | null> {
  throw new Error('This implementation is deprecated - use planRepositoryPrisma.ts instead');
}

export async function deletePlan(id: string): Promise<boolean> {
  throw new Error('This implementation is deprecated - use planRepositoryPrisma.ts instead');
}

export async function addPlanFeature(planId: string, feature: string): Promise<void> {
  throw new Error('This implementation is deprecated - use planRepositoryPrisma.ts instead');
}

export async function removePlanFeature(planId: string, feature: string): Promise<void> {
  throw new Error('This implementation is deprecated - use planRepositoryPrisma.ts instead');
}

export async function clearPlanFeatures(planId: string): Promise<void> {
  throw new Error('This implementation is deprecated - use planRepositoryPrisma.ts instead');
}