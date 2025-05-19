import { rdpPlans, vpsPlans } from '@/data/plans';
import { MetadataRoute } from 'next';

export async function GET() {
  // Base URL for the site
  const baseUrl = 'https://nextgenweb.com';
  
  // Current date for lastModified
  const currentDate = new Date().toISOString();
  
  // Core static pages with enhanced SEO priority
  const staticPages = [
    { url: '', priority: 1.0, changefreq: 'weekly' }, // Homepage
    { url: '/plans', priority: 0.9, changefreq: 'weekly' }, // Plans page (high priority)
    { url: '/rdp', priority: 0.9, changefreq: 'weekly' }, // RDP page (high priority)
    { url: '/vps', priority: 0.9, changefreq: 'weekly' }, // VPS page (high priority)
    { url: '/about', priority: 0.8, changefreq: 'monthly' },
    { url: '/pricing', priority: 0.9, changefreq: 'weekly' },
    { url: '/contact', priority: 0.8, changefreq: 'monthly' },
    { url: '/blog', priority: 0.8, changefreq: 'daily' }, // Blog index (frequent updates)
    { url: '/documentation', priority: 0.7, changefreq: 'monthly' },
    { url: '/faq', priority: 0.8, changefreq: 'monthly' },
    { url: '/support', priority: 0.7, changefreq: 'monthly' },
    { url: '/login', priority: 0.6, changefreq: 'monthly' },
    { url: '/register', priority: 0.6, changefreq: 'monthly' },
    { url: '/terms', priority: 0.5, changefreq: 'yearly' },
    { url: '/privacy', priority: 0.5, changefreq: 'yearly' },
  ];

  // Generate URLs for each RDP plan with improved SEO
  const rdpPlanUrls = rdpPlans.map(plan => ({
    url: `/order/${plan.id}`,
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: 0.8,
  }));

  // Generate URLs for each VPS plan with improved SEO
  const vpsPlanUrls = vpsPlans.map(plan => ({
    url: `/order/${plan.id}`,
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: 0.8,
  }));

  // Sample blog posts (using the same as in your sitemap.js)
  const blogPosts = [
    { slug: 'windows-rdp-vs-vps', date: '2023-06-15' },
    { slug: 'optimize-windows-server', date: '2023-07-22' },
    { slug: 'secure-rdp', date: '2023-08-05' },
    { slug: 'business-hosting', date: '2023-09-10' },
    { slug: 'windows-server-2022', date: '2023-10-03' },
    { slug: 'hosting-ecommerce', date: '2023-11-12' },
  ].map(post => ({
    url: `/blog/${post.slug}`,
    lastmod: new Date(post.date).toISOString(),
    changefreq: 'monthly',
    priority: 0.7,
  }));

  // Build the XML manually for finer control over format
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add static pages
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  // Add RDP plans
  rdpPlanUrls.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  // Add VPS plans
  vpsPlanUrls.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  // Add blog posts
  blogPosts.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  // Return the XML with content type set to application/xml
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 