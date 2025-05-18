import prisma from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

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

export interface PlanFeature {
  id?: string;
  plan_id: string;
  feature: string;
}

export interface PlanWithFeatures extends Plan {
  features: PlanFeature[];
}

// Stub implementations that will be replaced with actual database calls later

export async function getAllPlans(includeInactive = false): Promise<PlanWithFeatures[]> {
  try {
    // Query for plans with features
    const plans = await prisma.$queryRawUnsafe<Array<any>>(`
      SELECT p.*, array_agg(json_build_object('id', pf.id, 'plan_id', pf.plan_id, 'feature', pf.feature)) as features
      FROM plans p
      LEFT JOIN plan_features pf ON p.id = pf.plan_id
      ${includeInactive ? '' : 'WHERE p.is_active = true'}
      GROUP BY p.id
      ORDER BY p.name ASC
    `);
    
    // Process the results
    return plans.map(plan => {
      // Fix features array - if no features, array_agg returns [null]
      let features = plan.features;
      if (features.length === 1 && features[0] === null) {
        features = [];
      }
      
      return {
        ...plan,
        features
      };
    });
  } catch (error) {
    console.error('Error fetching all plans:', error);
    return [];
  }
}

export async function getPlanById(id: string): Promise<PlanWithFeatures | null> {
  try {
    const plans = await prisma.$queryRawUnsafe<Array<any>>(`
      SELECT p.*, array_agg(json_build_object('id', pf.id, 'plan_id', pf.plan_id, 'feature', pf.feature)) as features
      FROM plans p
      LEFT JOIN plan_features pf ON p.id = pf.plan_id
      WHERE p.id = $1
      GROUP BY p.id
    `, id);
    
    if (plans.length === 0) {
      return null;
    }
    
    const plan = plans[0];
    // Fix features array - if no features, array_agg returns [null]
    let features = plan.features;
    if (features.length === 1 && features[0] === null) {
      features = [];
    }
    
    return {
      ...plan,
      features
    };
  } catch (error) {
    console.error(`Error fetching plan with ID ${id}:`, error);
    return null;
  }
}

export async function getPlansByCategory(categoryId: number, includeInactive = false): Promise<PlanWithFeatures[]> {
  try {
    const plans = await prisma.$queryRawUnsafe<Array<any>>(`
      SELECT p.*, array_agg(json_build_object('id', pf.id, 'plan_id', pf.plan_id, 'feature', pf.feature)) as features
      FROM plans p
      LEFT JOIN plan_features pf ON p.id = pf.plan_id
      WHERE p.category_id = $1 ${includeInactive ? '' : 'AND p.is_active = true'}
      GROUP BY p.id
      ORDER BY p.name ASC
    `, categoryId);
    
    // Process the results
    return plans.map(plan => {
      // Fix features array - if no features, array_agg returns [null]
      let features = plan.features;
      if (features.length === 1 && features[0] === null) {
        features = [];
      }
      
      return {
        ...plan,
        features
      };
    });
  } catch (error) {
    console.error(`Error fetching plans with category ID ${categoryId}:`, error);
    return [];
  }
}

export async function getPlansWithFeaturesByCategory(categoryId: number): Promise<PlanWithFeatures[]> {
  return getPlansByCategory(categoryId);
}

export async function createPlan(data: {
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
  features?: string[];
}): Promise<PlanWithFeatures> {
  try {
    // Start a transaction
    return await prisma.$transaction(async (tx) => {
      // Create the plan
      await prisma.$executeRawUnsafe(`
        INSERT INTO plans (
          id, category_id, name, description, cpu, ram, storage, bandwidth, os, 
          price_pkr, is_active, theme_color, label
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        )
      `, 
      data.id, data.category_id, data.name, data.description || '', 
      data.cpu, data.ram, data.storage, data.bandwidth, data.os || '', 
      data.price_pkr, data.is_active, data.theme_color || 'sky', data.label || ''
      );
      
      // Add features if provided
      if (data.features && data.features.length > 0) {
        for (const feature of data.features) {
          const featureId = uuidv4();
          await prisma.$executeRawUnsafe(`
            INSERT INTO plan_features (id, plan_id, feature)
            VALUES ($1, $2, $3)
          `, featureId, data.id, feature);
        }
      }
      
      // Return the created plan with features
      const plan = await getPlanById(data.id);
      if (!plan) {
        throw new Error('Failed to retrieve created plan');
      }
      
      return plan;
    });
  } catch (error) {
    console.error('Error creating plan:', error);
    throw error;
  }
}

export async function updatePlan(id: string, data: Partial<{
  category_id: number;
  name: string;
  description: string | null;
  cpu: string;
  ram: string;
  storage: string;
  bandwidth: string;
  os: string | null;
  price_pkr: number;
  is_active: boolean;
  theme_color: string;
  label: string | null;
  features: string[];
}>): Promise<PlanWithFeatures | null> {
  try {
    // Start a transaction
    return await prisma.$transaction(async (tx) => {
      // Build SET clause dynamically based on provided fields
      let setClauses = [];
      let params: any[] = [id]; // Use any[] type to handle different parameter types
      let paramIndex = 2; // Starting from $2 as $1 is id
      
      if (data.category_id !== undefined) {
        setClauses.push(`category_id = $${paramIndex++}`);
        params.push(data.category_id); // Number type
      }
      
      if (data.name !== undefined) {
        setClauses.push(`name = $${paramIndex++}`);
        params.push(data.name);
      }
      
      if (data.description !== undefined) {
        setClauses.push(`description = $${paramIndex++}`);
        params.push(data.description || '');
      }
      
      if (data.cpu !== undefined) {
        setClauses.push(`cpu = $${paramIndex++}`);
        params.push(data.cpu);
      }
      
      if (data.ram !== undefined) {
        setClauses.push(`ram = $${paramIndex++}`);
        params.push(data.ram);
      }
      
      if (data.storage !== undefined) {
        setClauses.push(`storage = $${paramIndex++}`);
        params.push(data.storage);
      }
      
      if (data.bandwidth !== undefined) {
        setClauses.push(`bandwidth = $${paramIndex++}`);
        params.push(data.bandwidth);
      }
      
      if (data.os !== undefined) {
        setClauses.push(`os = $${paramIndex++}`);
        params.push(data.os || '');
      }
      
      if (data.price_pkr !== undefined) {
        setClauses.push(`price_pkr = $${paramIndex++}`);
        params.push(data.price_pkr); // Number type
      }
      
      if (data.is_active !== undefined) {
        setClauses.push(`is_active = $${paramIndex++}`);
        params.push(data.is_active); // Boolean type
      }
      
      if (data.theme_color !== undefined) {
        setClauses.push(`theme_color = $${paramIndex++}`);
        params.push(data.theme_color || 'sky');
      }
      
      if (data.label !== undefined) {
        setClauses.push(`label = $${paramIndex++}`);
        params.push(data.label || '');
      }
      
      // Always update the updated_at timestamp
      setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
      
      // If there are fields to update
      if (setClauses.length > 0) {
        await prisma.$executeRawUnsafe(`
          UPDATE plans
          SET ${setClauses.join(', ')}
          WHERE id = $1
        `, ...params);
      }
      
      // Update features if provided
      if (data.features !== undefined) {
        // Clear existing features
        await clearPlanFeatures(id);
        
        // Add new features
        for (const feature of data.features) {
          const featureId = uuidv4();
          await prisma.$executeRawUnsafe(`
            INSERT INTO plan_features (id, plan_id, feature)
            VALUES ($1, $2, $3)
          `, featureId, id, feature);
        }
      }
      
      // Return the updated plan with features
      const plan = await getPlanById(id);
      return plan;
    });
  } catch (error) {
    console.error(`Error updating plan with ID ${id}:`, error);
    return null;
  }
}

export async function deletePlan(id: string): Promise<boolean> {
  try {
    // Delete the plan (cascading delete will remove features due to foreign key)
    const result = await prisma.$executeRawUnsafe(`
      DELETE FROM plans
      WHERE id = $1
    `, id);
    
    return result > 0;
  } catch (error) {
    console.error(`Error deleting plan with ID ${id}:`, error);
    return false;
  }
}

export async function addPlanFeature(planId: string, feature: string): Promise<PlanFeature> {
  const id = uuidv4();
  
  await prisma.$executeRawUnsafe(`
    INSERT INTO plan_features (id, plan_id, feature)
    VALUES ($1, $2, $3)
  `, id, planId, feature);
  
  return {
    id,
    plan_id: planId,
    feature
  };
}

export async function removePlanFeature(planId: string, featureId: string): Promise<number> {
  const result = await prisma.$executeRawUnsafe(`
    DELETE FROM plan_features
    WHERE plan_id = $1 AND id = $2
  `, planId, featureId);
  
  return result;
}

export async function clearPlanFeatures(planId: string): Promise<number> {
  const result = await prisma.$executeRawUnsafe(`
    DELETE FROM plan_features
    WHERE plan_id = $1
  `, planId);
  
  return result;
} 