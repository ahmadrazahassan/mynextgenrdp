import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/authUtils';
import prisma from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { notificationId: string } }
) {
  try {
    // Check authentication and authorization
    if (!await verifyAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized or forbidden' },
        { status: 403 }
      );
    }
    
    const notificationId = params.notificationId;
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }
    
    // Get the admin ID (in a real app, this would come from the auth context)
    const adminId = "admin-1"; // Placeholder, should be replaced with actual adminId
    
    // Update the notification in the database
    const body = await request.json();
    
    // Since the notification model doesn't exist yet in the schema,
    // we'll mock a successful update
    
    // In a real implementation, this would be:
    // const updatedNotification = await prisma.notification.update({
    //   where: {
    //     id: notificationId,
    //     adminId
    //   },
    //   data: {
    //     ...body,
    //     updatedAt: new Date()
    //   }
    // });
    
    // Mock successful update
    const updatedNotification = {
      id: notificationId,
      adminId,
      ...body,
      updatedAt: new Date()
    };
    
    if (!updatedNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      id: notificationId,
      message: 'Notification updated'
    });
  } catch (error: any) {
    console.error('Error updating notification:', error);
    
    // Check if it's a Prisma error
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { notificationId: string } }
) {
  try {
    // Check authentication and authorization
    if (!await verifyAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized or forbidden' },
        { status: 403 }
      );
    }
    
    const notificationId = params.notificationId;
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }
    
    // Get the admin ID (in a real app, this would come from the auth context)
    const adminId = "admin-1"; // Placeholder, should be replaced with actual adminId
    
    // Since the notification model doesn't exist yet in the schema,
    // we'll mock a successful delete
    
    // In a real implementation, this would be:
    // const deletedNotification = await prisma.notification.delete({
    //   where: {
    //     id: notificationId,
    //     adminId
    //   }
    // });
    
    // Mock successful delete
    const deletedNotification = {
      id: notificationId,
      adminId,
      message: "This notification has been deleted"
    };
    
    if (!deletedNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      id: notificationId,
      message: 'Notification deleted'
    });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    
    // Check if it's a Prisma error
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
} 