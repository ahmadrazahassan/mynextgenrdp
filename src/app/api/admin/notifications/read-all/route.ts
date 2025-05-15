import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/authUtils';
import prisma from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    // Check authentication and authorization
    if (!await verifyAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized or forbidden' },
        { status: 403 }
      );
    }
    
    // Get the admin ID (in a real app, this would come from the auth context)
    const adminId = "admin-1"; // Placeholder, should be replaced with actual adminId
    
    // Since the notification model doesn't exist yet in the schema,
    // we'll mock a successful update
    
    // In a real implementation, this would be:
    // const result = await prisma.notification.updateMany({
    //   where: {
    //     adminId,
    //     read: false
    //   },
    //   data: {
    //     read: true,
    //     updatedAt: new Date()
    //   }
    // });
    
    // Mock successful update of 5 notifications
    const result = {
      count: 5
    };
    
    return NextResponse.json({ 
      success: true,
      message: 'All notifications marked as read',
      count: result.count
    });
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
} 