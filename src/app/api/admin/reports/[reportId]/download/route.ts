import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/authUtils';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    // Check authentication and authorization
    if (!await verifyAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized or forbidden' },
        { status: 403 }
      );
    }
    
    const reportId = params.reportId;
    
    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }
    
    // Since the report model doesn't exist yet in the schema,
    // we'll create mock report data
    
    // In a real implementation, this would be:
    // const report = await prisma.report.findUnique({
    //   where: {
    //     id: reportId
    //   }
    // });
    
    // Mock report data based on the reportId
    let reportType = 'financial';
    let reportTitle = 'Monthly Financial Summary';
    
    if (reportId.includes('analytics')) {
      reportType = 'analytics';
      reportTitle = 'Website Analytics Report';
    } else if (reportId.includes('user')) {
      reportType = 'user';
      reportTitle = 'User Activity Report';
    } else if (reportId.includes('security')) {
      reportType = 'security';
      reportTitle = 'Security Audit Report';
    }
    
    const report = {
      id: reportId,
      title: reportTitle,
      type: reportType,
      status: 'available',
      downloadCount: 5,
      lastDownloaded: new Date(Date.now() - 86400000), // Yesterday
      createdAt: new Date(Date.now() - 604800000) // 7 days ago
    };
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    // Check if the report is available
    if (report.status !== 'available') {
      return NextResponse.json(
        { error: 'Report is not available for download yet' },
        { status: 400 }
      );
    }
    
    // In a real implementation, you would fetch the actual report data from a file storage
    // or generate it dynamically based on stored parameters
    
    // For this implementation, we'll create a simple text report
    const reportDate = new Date().toLocaleDateString();
    const reportTime = new Date().toLocaleTimeString();
    
    // Create mock data based on report type
    let reportData = '';
    
    switch (report.type) {
      case 'financial':
        // Mock orders data instead of querying the database
        const mockOrders = [
          { id: 'ord-001', totalAmount: 199.99, status: 'completed', createdAt: new Date(Date.now() - 86400000) },
          { id: 'ord-002', totalAmount: 299.99, status: 'completed', createdAt: new Date(Date.now() - 172800000) },
          { id: 'ord-003', totalAmount: 149.99, status: 'processing', createdAt: new Date(Date.now() - 259200000) },
          { id: 'ord-004', totalAmount: 499.99, status: 'completed', createdAt: new Date(Date.now() - 345600000) },
          { id: 'ord-005', totalAmount: 99.99, status: 'completed', createdAt: new Date(Date.now() - 432000000) }
        ];
        
        reportData = `Financial Summary:\n\n`;
        reportData += `Total Orders: ${mockOrders.length}\n`;
        reportData += `Total Revenue: $${mockOrders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}\n\n`;
        reportData += `Recent Orders:\n`;
        
        mockOrders.forEach(order => {
          reportData += `- Order ${order.id}: $${order.totalAmount.toFixed(2)} (${order.status}) - ${new Date(order.createdAt).toLocaleDateString()}\n`;
        });
        break;
        
      case 'analytics':
        // Mock analytics data
        const visitors = 12345;
        const mockConversions = [
          { date: new Date(Date.now() - 86400000), attempts: 250, conversions: 45 },
          { date: new Date(Date.now() - 172800000), attempts: 300, conversions: 62 },
          { date: new Date(Date.now() - 259200000), attempts: 280, conversions: 51 },
          { date: new Date(Date.now() - 345600000), attempts: 320, conversions: 58 },
          { date: new Date(Date.now() - 432000000), attempts: 290, conversions: 49 }
        ];
        
        const totalAttempts = mockConversions.reduce((sum, conv) => sum + conv.attempts, 0);
        const totalConversions = mockConversions.reduce((sum, conv) => sum + conv.conversions, 0);
        const conversionRate = totalAttempts > 0 ? (totalConversions / totalAttempts) * 100 : 0;
        
        reportData = `Analytics Summary:\n\n`;
        reportData += `Total Visitors: ${visitors}\n`;
        reportData += `Conversion Rate: ${conversionRate.toFixed(2)}%\n\n`;
        reportData += `Recent Conversion Data:\n`;
        
        mockConversions.forEach(conv => {
          reportData += `- Date ${new Date(conv.date).toLocaleDateString()}: ${conv.conversions} conversions out of ${conv.attempts} attempts (${((conv.conversions / conv.attempts) * 100).toFixed(2)}%)\n`;
        });
        break;
        
      default:
        reportData = `${report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report\n\n`;
        reportData += `This is a generated report based on the ${report.type} type.\n`;
        reportData += `More specific data would be included in a real implementation.\n`;
    }
    
    const reportContent = `
Report ID: ${reportId}
Title: ${report.title}
Type: ${report.type}
Generated: ${reportDate} at ${reportTime}
---------------------------------------------

${reportData}

---------------------------------------------
Report generated by NextGenRDP Admin System
    `;
    
    // Create headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'text/plain');
    headers.set('Content-Disposition', `attachment; filename="report-${reportId}.txt"`);
    
    // In a real implementation, this would update the report download count:
    // await prisma.report.update({
    //   where: { id: reportId },
    //   data: {
    //     downloadCount: {
    //       increment: 1
    //     },
    //     lastDownloaded: new Date()
    //   }
    // });
    
    return new NextResponse(reportContent, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Error downloading report:', error);
    
    return NextResponse.json(
      { error: 'Failed to download report' },
      { status: 500 }
    );
  }
} 