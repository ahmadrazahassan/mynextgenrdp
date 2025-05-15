import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/authUtils';
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
    
    // Since the notification model doesn't exist yet in the schema,
    // we'll return mock data
    
    // In a real implementation, this would be:
    // const notifications = await prisma.notification.findMany({
    //   orderBy: {
    //     createdAt: 'desc'
    //   },
    //   select: {
    //     id: true,
    //     title: true,
    //     message: true,
    //     createdAt: true,
    //     type: true,
    //     priority: true,
    //     read: true,
    //     source: true
    //   }
    // });
    
    // Mock notifications data
    const now = new Date();
    const mockNotifications = [
      {
        id: "notif-1",
        title: "System Update",
        message: "System maintenance scheduled for tonight at 2 AM UTC",
        createdAt: new Date(now.getTime() - 20 * 60000), // 20 minutes ago
        type: "system",
        priority: "high",
        read: false,
        source: "system"
      },
      {
        id: "notif-2",
        title: "New User Registration",
        message: "A new user has registered: john.doe@example.com",
        createdAt: new Date(now.getTime() - 2 * 3600000), // 2 hours ago
        type: "user",
        priority: "medium",
        read: true,
        source: "users"
      },
      {
        id: "notif-3",
        title: "Payment Received",
        message: "Payment of $199.99 received for order #12345",
        createdAt: new Date(now.getTime() - 5 * 3600000), // 5 hours ago
        type: "order",
        priority: "medium",
        read: false,
        source: "billing"
      },
      {
        id: "notif-4",
        title: "Security Alert",
        message: "Multiple failed login attempts detected from IP 192.168.1.1",
        createdAt: new Date(now.getTime() - 24 * 3600000), // 1 day ago
        type: "security",
        priority: "high",
        read: false,
        source: "security"
      },
      {
        id: "notif-5",
        title: "Server Status",
        message: "All servers operating at normal capacity",
        createdAt: new Date(now.getTime() - 3 * 24 * 3600000), // 3 days ago
        type: "system",
        priority: "low",
        read: true,
        source: "monitoring"
      }
    ];
    
    // Format notifications for the frontend
    const formattedNotifications = mockNotifications.map(notification => {
      // Format the timestamp as a relative time string
      const timestamp = formatRelativeTime(notification.createdAt);
      
      return {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        timestamp,
        type: notification.type,
        priority: notification.priority,
        read: notification.read,
        source: notification.source
      };
    });
    
    return NextResponse.json(formattedNotifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    
    // Return empty array instead of error to prevent frontend issues
    return NextResponse.json([]);
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
    
    // Get the admin ID (in a real app, this would come from the auth context)
    const adminId = "admin-1"; // Placeholder, should be replaced with the actual adminId
    
    // Since the notification model doesn't exist yet in the schema,
    // we'll mock a successful delete operation
    
    // In a real implementation, this would be:
    // await prisma.notification.deleteMany({
    //   where: {
    //     adminId
    //   }
    // });
    
    return NextResponse.json({ 
      success: true,
      message: 'All notifications cleared'
    });
  } catch (error: any) {
    console.error('Error clearing notifications:', error);
    return NextResponse.json(
      { error: 'Failed to clear notifications' },
      { status: 500 }
    );
  }
}

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffMinutes < 24 * 60) {
    const hours = Math.floor(diffMinutes / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffMinutes / (24 * 60));
    return days === 1 ? 'Yesterday' : `${days} days ago`;
  }
} 