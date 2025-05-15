import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/authUtils';
import prisma from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Define the report types for type safety
type ReportType = 'financial' | 'analytics' | 'operational' | 'customer' | 'technical' | 'comprehensive';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    if (!await verifyAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized or forbidden' },
        { status: 403 }
      );
    }
    
    // Since the report model doesn't exist yet in the schema,
    // we'll return mock data
    
    // In a real implementation, this would be:
    // const reports = await prisma.report.findMany({
    //   orderBy: {
    //     createdAt: 'desc'
    //   },
    //   select: {
    //     id: true,
    //     title: true,
    //     description: true,
    //     createdAt: true,
    //     type: true,
    //     status: true,
    //     chartCount: true,
    //     fileSize: true
    //   }
    // });
    
    // Mock reports data
    const mockReports = [
      {
        id: 'rep-001',
        title: 'Monthly Revenue Report',
        description: 'Detailed breakdown of revenue streams and sources',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        type: 'financial',
        status: 'available',
        chartCount: 5,
        fileSize: '2.3 MB'
      },
      {
        id: 'rep-002',
        title: 'User Acquisition Report',
        description: 'Analysis of new user registration and sources',
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        type: 'analytics',
        status: 'available',
        chartCount: 4,
        fileSize: '1.8 MB'
      },
      {
        id: 'rep-003',
        title: 'Service Utilization Report',
        description: 'Overview of services usage and performance metrics',
        createdAt: new Date(Date.now() - 259200000), // 3 days ago
        type: 'operational',
        status: 'available',
        chartCount: 6,
        fileSize: '3.1 MB'
      },
      {
        id: 'rep-004',
        title: 'System Performance Audit',
        description: 'Technical performance and infrastructure analysis',
        createdAt: new Date(Date.now() - 345600000), // 4 days ago
        type: 'technical',
        status: 'available',
        chartCount: 3,
        fileSize: '1.5 MB'
      },
      {
        id: 'rep-005',
        title: 'New Report',
        description: 'This report is still being generated',
        createdAt: new Date(),
        type: 'comprehensive',
        status: 'generating',
        chartCount: 0,
        fileSize: '0 KB'
      }
    ];
    
    // Format the reports for the frontend
    const formattedReports = mockReports.map(report => {
      return {
        id: report.id,
        title: report.title,
        description: report.description,
        date: new Date(report.createdAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        type: report.type,
        status: report.status,
        charts: report.chartCount,
        fileSize: report.fileSize
      };
    });
    
    return NextResponse.json(formattedReports);
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    
    // Return empty array instead of error to prevent frontend issues
    return NextResponse.json([]);
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
    
    // Get request body
    const body = await request.json();
    const { type } = body;
    
    if (!type) {
      return NextResponse.json(
        { error: 'Report type is required' },
        { status: 400 }
      );
    }
    
    // Generate a unique ID for the new report if needed
    const reportId = `rep-${uuidv4()}`;
    
    // Map report types to titles and descriptions
    const reportMeta: Record<ReportType, { title: string; description: string }> = {
      financial: {
        title: "Monthly Revenue Report",
        description: "Detailed breakdown of revenue streams and sources"
      },
      analytics: {
        title: "User Acquisition Report",
        description: "Analysis of new user registration and sources" 
      },
      operational: {
        title: "Service Utilization Report",
        description: "Overview of services usage and performance metrics"
      },
      customer: {
        title: "Customer Satisfaction Analysis",
        description: "Survey results and satisfaction metrics analysis"
      },
      technical: {
        title: "System Performance Audit",
        description: "Technical performance and infrastructure analysis"
      },
      comprehensive: {
        title: "Comprehensive System Report",
        description: "Complete analysis of all system metrics and operations"
      }
    };
    
    // Default values if type is not recognized
    const reportType = type as string;
    const title = reportMeta[reportType as ReportType]?.title || 
                  `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
    const description = reportMeta[reportType as ReportType]?.description || 
                        `Detailed ${reportType} analysis and metrics`;
    
    // Since the report model doesn't exist yet in the schema,
    // we'll mock a successful creation
    
    // In a real implementation, this would be:
    // const newReport = await prisma.report.create({
    //   data: {
    //     id: reportId,
    //     title,
    //     description,
    //     type,
    //     status: 'generating',
    //     chartCount: Math.floor(Math.random() * 6) + 1, // This would be determined by the actual report generator
    //     fileSize: '0 KB', // This would be updated after generation
    //     createdAt: new Date()
    //   }
    // });
    
    // Mock successful report creation
    const newReport = {
        id: reportId,
        title,
        description,
      type: reportType,
        status: 'generating',
      chartCount: Math.floor(Math.random() * 6) + 1,
      fileSize: '0 KB',
        createdAt: new Date()
    };
    
    // In a real implementation, we would schedule a background job to generate the report
    // For demo purposes, we'll just simulate the success response
    
    return NextResponse.json({
      id: newReport.id,
      status: newReport.status,
      type: newReport.type,
      message: `${reportType} report generation started`
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
} 