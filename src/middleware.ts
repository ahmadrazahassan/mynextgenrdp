// File: src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // Use jose instead of jsonwebtoken

// Define public routes that don't require authentication
const publicRoutes = [
  '/',                 // Homepage
  '/plans',
  '/pricing',
  '/support',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/about',
  '/contact',
  '/pricing',
  '/features',
  '/faq',
  '/terms',
  '/privacy',
  '/help',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/check',
  '/api/auth/me',
  '/api/auth/admin/check',
  '/images/',
  '/favicon.ico',
  '/_next', // Add Next.js internal routes as public
  '/public/',
  // Add admin login to public routes
  '/admin/login'
];

// Define admin-only routes
const adminRoutes = [
  '/admin'
];

// Routes that REQUIRE authentication
const protectedRoutes = [
  '/dashboard',
  '/account',
  '/orders',
  '/billing',
  '/profile',
  '/settings'
];

// JWT Secret (should match the one used to sign tokens)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;
  
  console.log(`[Middleware] Processing request for: ${pathname}`);
  
  // Check if the path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );
  
  // Check if the path is a protected route that requires authentication
  const requiresAuth = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );
  
  // Check if the path is an admin-only route
  const isAdminRoute = adminRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );
  
  // If it's a public route, allow access without authentication
  if (isPublicRoute) {
    console.log(`[Middleware] Public route access granted: ${pathname}`);
    return NextResponse.next();
  }
  
  // If it's not a protected route and not an admin route, allow access without authentication
  if (!requiresAuth && !isAdminRoute) {
    console.log(`[Middleware] Non-protected route access granted: ${pathname}`);
    return NextResponse.next();
  }
  
  // Get the auth token from cookies
  const token = request.cookies.get('auth_token')?.value;
  
  // Check if the user is authenticated (only for routes that require auth)
  if (!token) {
    // Not authenticated, redirect to appropriate login page
    if (isAdminRoute) {
      // For admin routes, redirect to admin login
      console.log(`[Middleware] Access denied. No token found. Redirecting to admin login from: ${pathname}`);
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname); // Store the original destination
      return NextResponse.redirect(loginUrl);
    } else if (!pathname.startsWith('/api/')) {
      // For non-admin protected routes, redirect to main login
      console.log(`[Middleware] Access denied. No token found. Redirecting to login from: ${pathname}`);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname); // Store the original destination
      return NextResponse.redirect(loginUrl);
    }
    
    // For API routes, return 401 Unauthorized
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Authentication required' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }
  
  try {
    // Verify the token using jose instead of jsonwebtoken
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }
    
    // Get the user ID from the token
    const userId = payload.sub || payload.id;
    
    if (!userId) {
      throw new Error('Invalid token: No user ID found');
    }
    
    // For admin routes, check if the user is an admin
    if (isAdminRoute && !payload.isAdmin) {
      console.log(`[Middleware] Admin access denied for user ${userId} to route: ${pathname}`);
      // Redirect non-admin users to admin login with a message
      const adminLoginUrl = new URL('/admin/login', request.url);
      adminLoginUrl.searchParams.set('error', 'admin_required');
      return NextResponse.redirect(adminLoginUrl);
    }
    
    // User is authenticated, allow access
    console.log(`[Middleware] Access granted for user ${userId} to route: ${pathname}`);
    
    // Set a custom header with user info for backend routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', userId.toString());
    
    // Continue with the request, passing the user ID to the backend
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // Token verification failed
    console.error(`[Middleware] Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    // For admin routes, redirect to admin login
    if (isAdminRoute) {
      const adminLoginUrl = new URL('/admin/login', request.url);
      const response = NextResponse.redirect(adminLoginUrl);
      response.cookies.delete('auth_token');
      return response;
    }
    
    // For protected routes, redirect to main login
    if (requiresAuth) {
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth_token');
      return response;
    }
    
    // For non-protected routes, still allow access even with invalid token
    console.log(`[Middleware] Non-critical token verification failed for non-protected route: ${pathname}`);
    return NextResponse.next();
  }
}

// Configure the middleware to match specific routes but exclude API routes during build
export const config = {
  matcher: [
    // Match all pages routes but not API routes
    '/((?!_next|api/|favicon.ico).*)',
    // Only match specific API routes that don't use cookies
    '/api/public/:path*'
  ],
};