import { NextRequest, NextResponse } from 'next/server';
import { getAllPlans, createPlan, deletePlan, updatePlan, PlanWithFeatures } from '@/repositories/planRepositoryPrisma';
import { verifyAdmin } from '@/lib/authUtils';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    if (!await verifyAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized or forbidden' },
        { status: 403 }
      );
    }
    
    // Check if force import is requested
    const url = new URL(request.url);
    const forceImport = url.searchParams.get('forceImport') === 'true';
    
    try {
      // First check if plans table exists
      const tableExists = await checkIfTableExists('plans');
      
      if (!tableExists || forceImport) {
        console.log(forceImport ? 'Force importing plans...' : 'Plans table does not exist yet. Creating sample plans.');
        await createSamplePlans();
      }
      
      // Get all plans including inactive ones for admin
      const plans = await getAllPlans(true);
      
      // Check if we have any plans after import
      if (plans.length === 0 && forceImport) {
        console.error('No plans were imported. There may be an issue with the plans.js file.');
        return NextResponse.json(
          { error: 'No plans were imported. There may be an issue with the plans.js file.' },
          { status: 500 }
        );
      }
      
      // Format plans for frontend
      const formattedPlans = plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        type: plan.category_id === 1 ? 'rdp' : 'vps', // Assuming category_id 1 is RDP, 2 is VPS
        price: plan.price_pkr,
        discountedPrice: plan.price_pkr * 0.9, // Example discount calculation, should come from DB
        isPopular: plan.label === 'popular',
        active: plan.is_active,
        themeColor: plan.theme_color || 'sky',
        specs: {
          cpu: plan.cpu,
          ram: plan.ram,
          storage: plan.storage,
          bandwidth: plan.bandwidth,
          location: plan.category_id === 1 ? 'US East' : 'EU Central', // Default location
          os: plan.os || (plan.category_id === 1 ? 'Windows Server 2022' : 'Windows 10')
        },
        duration: 1, // Default to 1 month
        description: plan.description || '',
        features: plan.features.map(f => f.feature),
        createdAt: plan.created_at ? plan.created_at.toISOString() : new Date().toISOString(),
        updatedAt: plan.updated_at ? plan.updated_at.toISOString() : new Date().toISOString()
      }));
      
      return NextResponse.json(formattedPlans);
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      
      // Create sample plans for demonstration
      if (dbError.message && (
        dbError.message.includes('relation "plans" does not exist') ||
        dbError.message.includes('no such table') ||
        dbError.code === '42P01' // PostgreSQL code for undefined_table
      )) {
        console.log('Error with plans table. Creating sample plans.');
        try {
          await createSamplePlans();
          
          // Try again after creating sample plans
          const plans = await getAllPlans(true);
          
          // If we still have no plans after trying to create them
          if (plans.length === 0) {
            return NextResponse.json(
              { error: 'Failed to import plans. Database tables were created but no plans were imported.' },
              { status: 500 }
            );
          }
          
          const formattedPlans = plans.map(plan => ({
            id: plan.id,
            name: plan.name,
            type: plan.category_id === 1 ? 'rdp' : 'vps',
            price: plan.price_pkr,
            discountedPrice: plan.price_pkr * 0.9,
            isPopular: plan.label === 'popular',
            active: plan.is_active,
            themeColor: plan.theme_color || 'sky',
            specs: {
              cpu: plan.cpu,
              ram: plan.ram,
              storage: plan.storage,
              bandwidth: plan.bandwidth,
              location: plan.category_id === 1 ? 'US East' : 'EU Central', // Default location
              os: plan.os || (plan.category_id === 1 ? 'Windows Server 2022' : 'Windows 10')
            },
            duration: 1,
            description: plan.description || '',
            features: plan.features.map(f => f.feature),
            createdAt: plan.created_at ? plan.created_at.toISOString() : new Date().toISOString(),
            updatedAt: plan.updated_at ? plan.updated_at.toISOString() : new Date().toISOString()
          }));
          
          return NextResponse.json(formattedPlans);
        } catch (importError: any) {
          console.error('Error during plan import:', importError);
          return NextResponse.json(
            { 
              error: 'Failed to import plans', 
              details: process.env.NODE_ENV === 'development' ? importError.message : undefined
            },
            { status: 500 }
          );
        }
      }
      
      throw dbError; // Re-throw other errors
    }
  } catch (error: any) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}

// Helper function to check if a table exists
async function checkIfTableExists(tableName: string): Promise<boolean> {
  try {
    // For PostgreSQL
    const result = await prisma.$queryRawUnsafe<Array<{exists: boolean}>>(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
      );
    `);
    
    return result[0].exists;
  } catch (error: any) {
    console.error('Error checking if table exists:', error);
    return false;
  }
}

// Create sample plans for demonstration
async function createSamplePlans() {
  try {
    // Check if tables already exist
    const plansTableExists = await checkIfTableExists('plans');
    const featuresTableExists = await checkIfTableExists('plan_features');
    
    // If tables exist, clear them to reimport plans
    if (plansTableExists && featuresTableExists) {
      console.log('Tables already exist. Clearing plan_features table for reimport...');
      // First delete from plan_features due to foreign key constraints
      await prisma.$executeRawUnsafe('DELETE FROM plan_features');
      
      console.log('Clearing plans table for reimport...');
      await prisma.$executeRawUnsafe('DELETE FROM plans');
      
      console.log('Tables cleared. Proceeding with import...');
    } else {
      // Create plans table if it doesn't exist
      console.log('Creating tables if they do not exist...');
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS plans (
          id TEXT PRIMARY KEY,
          category_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          cpu TEXT NOT NULL,
          ram TEXT NOT NULL,
          storage TEXT NOT NULL,
          bandwidth TEXT NOT NULL,
          os TEXT,
          price_pkr DOUBLE PRECISION NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT true,
          theme_color TEXT DEFAULT 'sky',
          label TEXT,
          created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS plan_features (
          id TEXT PRIMARY KEY,
          plan_id TEXT NOT NULL,
          feature TEXT NOT NULL,
          FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
        );
      `);
    }
    
    // Import plans from the plans.ts file
    const plansModule = await import('@/data/plans');
    
    // Access the exported plans
    const rdpPlans = plansModule.rdpPlans || [];
    const vpsPlans = plansModule.vpsPlans || [];
    
    // Count of plans imported
    let importedCount = 0;
    
    // Import RDP plans
    for (const plan of rdpPlans) {
      try {
        // Generate description if not provided
        const description = `Premium Remote Desktop Plan with ${plan.cpu} and ${plan.ram}`;
        
        // Set popular label
        const isPopular = plan.label === 'Recommended' || plan.label === 'Most Selling';
        
        // Insert the plan
        await prisma.$executeRawUnsafe(`
          INSERT INTO plans (
            id, category_id, name, description, cpu, ram, storage, bandwidth, os,
            price_pkr, is_active, theme_color, label
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
          )
        `,
          plan.id,
          1, // RDP category
          plan.name,
          description,
          plan.cpu,
          plan.ram,
          plan.storage,
          plan.bandwidth || 'Unmetered',
          plan.os || 'Windows Server 2022',
          plan.price,
          true, // is_active
          plan.themeColor || 'sky',
          isPopular ? 'popular' : (plan.label || '')
        );
        
        // Insert features from useCases
        if (plan.useCases && plan.useCases.length > 0) {
          for (const useCase of plan.useCases) {
            const featureId = uuidv4();
            await prisma.$executeRawUnsafe(`
              INSERT INTO plan_features (id, plan_id, feature)
              VALUES ($1, $2, $3)
            `, featureId, plan.id, useCase);
          }
          
          // Add additional standard features
          const standardFeatures = [
            '24/7 Support',
            'Admin RDP Access',
            'Fast NVMe Storage',
            'DDoS Protection',
            'Multiple Locations'
          ];
          
          for (const feature of standardFeatures) {
            const featureId = uuidv4();
            await prisma.$executeRawUnsafe(`
              INSERT INTO plan_features (id, plan_id, feature)
              VALUES ($1, $2, $3)
            `, featureId, plan.id, feature);
          }
        }
        
        importedCount++;
      } catch (err) {
        console.error(`Error importing RDP plan ${plan.id}:`, err);
      }
    }
    
    // Import VPS plans
    for (const plan of vpsPlans) {
      try {
        // Generate description if not provided
        const description = `High-Performance VPS with ${plan.cpu} and ${plan.ram}`;
        
        // Set popular label
        const isPopular = plan.label === 'Recommended' || plan.label === 'Most Selling';
        
        // Insert the plan
        await prisma.$executeRawUnsafe(`
          INSERT INTO plans (
            id, category_id, name, description, cpu, ram, storage, bandwidth, os,
            price_pkr, is_active, theme_color, label
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
          )
        `,
          plan.id,
          2, // VPS category
          plan.name,
          description,
          plan.cpu,
          plan.ram,
          plan.storage,
          plan.bandwidth || 'Unmetered',
          plan.os || 'Windows 10',
          plan.price,
          true, // is_active
          plan.themeColor || 'sky',
          isPopular ? 'popular' : (plan.label || '')
        );
        
        // Insert features from useCases
        if (plan.useCases && plan.useCases.length > 0) {
          for (const useCase of plan.useCases) {
            const featureId = uuidv4();
            await prisma.$executeRawUnsafe(`
              INSERT INTO plan_features (id, plan_id, feature)
              VALUES ($1, $2, $3)
            `, featureId, plan.id, useCase);
          }
          
          // Add additional standard features
          const standardFeatures = [
            '24/7 Support',
            'Administrator Access',
            'High-Speed Network',
            'DDoS Protection',
            'Global Datacenters'
          ];
          
          for (const feature of standardFeatures) {
            const featureId = uuidv4();
            await prisma.$executeRawUnsafe(`
              INSERT INTO plan_features (id, plan_id, feature)
              VALUES ($1, $2, $3)
            `, featureId, plan.id, feature);
          }
        }
        
        importedCount++;
      } catch (err) {
        console.error(`Error importing VPS plan ${plan.id}:`, err);
      }
    }
    
    console.log(`Successfully imported ${importedCount} plans`);
    
    if (importedCount === 0) {
      throw new Error('No plans were imported.');
    }
  } catch (error) {
    console.error('Error creating sample plans:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    if (!await verifyAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized or forbidden' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const {
      name,
      type,
      price,
      specs,
      isPopular,
      active,
      description,
      features
    } = body;
    
    // Validate required fields
    if (!name || !type || !price || !specs) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create new plan
    const newPlan = await createPlan({
      id: uuidv4(),
      category_id: type === 'rdp' ? 1 : 2, // Map type to category_id
      name,
      description,
      cpu: specs.cpu,
      ram: specs.ram,
      storage: specs.storage,
      bandwidth: specs.bandwidth,
      os: specs.location,
      price_pkr: price,
      is_active: active !== false,
      label: isPopular ? 'popular' : undefined,
      features: features || []
    });
    
    // Format the response
    const formattedPlan = {
      id: newPlan.id,
      name: newPlan.name,
      type: newPlan.category_id === 1 ? 'rdp' : 'vps',
      price: newPlan.price_pkr,
      discountedPrice: undefined,
      isPopular: newPlan.label === 'popular',
      active: newPlan.is_active,
      themeColor: newPlan.theme_color || 'sky',
      specs: {
        cpu: newPlan.cpu,
        ram: newPlan.ram,
        storage: newPlan.storage,
        bandwidth: newPlan.bandwidth,
        location: newPlan.os || 'Default Location'
      },
      duration: 1,
      description: newPlan.description || '',
      features: newPlan.features.map(f => f.feature),
      createdAt: newPlan.created_at ? newPlan.created_at.toISOString() : new Date().toISOString(),
      updatedAt: newPlan.updated_at ? newPlan.updated_at.toISOString() : new Date().toISOString()
    };
    
    return NextResponse.json(formattedPlan);
  } catch (error: any) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: 'Failed to create plan', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check authentication and authorization
    if (!await verifyAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized or forbidden' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const {
      id,
      name,
      type,
      price,
      specs,
      isPopular,
      active,
      description,
      features
    } = body;
    
    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Missing plan ID' },
        { status: 400 }
      );
    }
    
    // Update plan using the repository function
    try {
      const updatedPlan = await updatePlan(id, {
        name,
        category_id: type ? (type === 'rdp' ? 1 : 2) : undefined,
        price_pkr: price,
        cpu: specs?.cpu,
        ram: specs?.ram,
        storage: specs?.storage,
        bandwidth: specs?.bandwidth,
        os: specs?.location,
        is_active: active,
        label: isPopular !== undefined ? (isPopular ? 'popular' : '') : undefined,
        description,
        features: features
      });
      
      if (!updatedPlan) {
        return NextResponse.json(
          { error: 'Plan not found' },
          { status: 404 }
        );
      }
      
      // Format the response
      const formattedPlan = {
        id: updatedPlan.id,
        name: updatedPlan.name,
        type: updatedPlan.category_id === 1 ? 'rdp' : 'vps',
        price: updatedPlan.price_pkr,
        discountedPrice: updatedPlan.price_pkr * 0.9, // Example discount calculation
        isPopular: updatedPlan.label === 'popular',
        active: updatedPlan.is_active,
        themeColor: updatedPlan.theme_color || 'sky',
        specs: {
          cpu: updatedPlan.cpu,
          ram: updatedPlan.ram,
          storage: updatedPlan.storage,
          bandwidth: updatedPlan.bandwidth,
          location: updatedPlan.os || 'Default Location'
        },
        duration: 1,
        description: updatedPlan.description || '',
        features: updatedPlan.features.map((f) => f.feature),
        createdAt: updatedPlan.created_at?.toISOString() || new Date().toISOString(),
        updatedAt: updatedPlan.updated_at?.toISOString() || new Date().toISOString()
      };
      
      return NextResponse.json(formattedPlan);
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: 'Failed to update plan', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication and authorization
    if (!await verifyAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized or forbidden' },
        { status: 403 }
      );
    }
    
    // Get the plan ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing plan ID' },
        { status: 400 }
      );
    }
    
    // Delete the plan
    await deletePlan(id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
} 