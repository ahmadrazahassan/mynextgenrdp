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
    
    // Get time range from query params
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get('range') || '30days';
    
    // Calculate the date range based on the parameter
    const now = new Date();
    let dayCount = 30;
    
    switch (rangeParam) {
      case '7days':
        dayCount = 7;
        break;
      case '30days':
        dayCount = 30;
        break;
      case '90days':
        dayCount = 90;
        break;
      case 'year':
        dayCount = 365;
        break;
      default:
        dayCount = 30;
    }
    
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - dayCount);
    
    // Since the required models don't exist in the schema yet,
    // we'll use mock data for now, but structure it properly
    
    // Mock page views data
    const pageViews = [];
    for (let i = 0; i < dayCount; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (dayCount - 1 - i));
      const formattedDate = date.toISOString().split('T')[0];
      pageViews.push({
        date: formattedDate,
        count: Math.floor(Math.random() * 1000) + 100 // Random page views between 100-1100
      });
    }
    
    // Mock visitor data
    const uniqueVisitors = pageViews.map(view => ({
      date: view.date,
      count: Math.floor(view.count * 0.7) // About 70% of page views
    }));
    
    // Mock traffic sources
    const sources = [
      { source: 'Direct', percentage: 35, count: 1050 },
      { source: 'Organic Search', percentage: 25, count: 750 },
      { source: 'Social Media', percentage: 20, count: 600 },
      { source: 'Referral', percentage: 15, count: 450 },
      { source: 'Email', percentage: 5, count: 150 }
    ];
    
    // Mock user activity by hour
    const userActivity = Array.from({ length: 24 }, (_, hour) => {
      // Higher activity during business hours
      let percentage = 2; // Base percentage
      
      if (hour >= 9 && hour <= 17) {
        percentage = 6 + Math.random() * 4; // 6-10% during business hours
      } else if ((hour >= 18 && hour <= 22) || (hour >= 7 && hour <= 8)) {
        percentage = 3 + Math.random() * 3; // 3-6% during morning/evening
      }
      
      return { hour, percentage };
    });
    
    // Mock page conversion rates
    const pageRates = [
      { page: 'Homepage', rate: 3.2 },
      { page: 'Plans', rate: 5.1 },
      { page: 'Dashboard', rate: 12.4 },
      { page: 'Checkout', rate: 28.7 },
      { page: 'Product Details', rate: 7.9 }
    ];
    
    // Real orders data from the database
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate
        },
        status: {
          not: 'cancelled'
        }
      },
      select: {
        total: true
      }
    });
    
    const totalOrderAmount = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = orders.length > 0 ? totalOrderAmount / orders.length : 0;
    
    // Construct complete analytics data
    const analyticsData = {
      pageViews,
      uniqueVisitors,
      sources,
      userActivity,
      conversionRates: {
        overall: 3.8,
        change: 0.5,
        avgOrderValue,
        pageRates
      }
    };
    
    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    
    // If database error, fall back to a minimal but valid data structure
    const fallbackData = {
      pageViews: [],
      uniqueVisitors: [],
      sources: [],
      userActivity: Array.from({ length: 24 }, (_, hour) => ({ hour, percentage: 0 })),
      conversionRates: {
        overall: 0,
        change: 0,
        avgOrderValue: 0,
        pageRates: []
      }
    };
    
    return NextResponse.json(
      fallbackData,
      { status: 200 }
    );
  }
} 