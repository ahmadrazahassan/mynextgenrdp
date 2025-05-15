import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";

export async function GET(request: NextRequest) {
  try {
    // Get the token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ isAdmin: false, isAuthenticated: false }, { status: 200 });
    }
    
    // Verify the token
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    // Check if user is admin
    const isAdmin = Boolean(payload.isAdmin);
    
    return NextResponse.json({ 
      isAdmin, 
      isAuthenticated: true,
      user: {
        id: payload.sub,
        email: payload.email,
        fullName: payload.fullName || null
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json({ isAdmin: false, isAuthenticated: false }, { status: 200 });
  }
} 