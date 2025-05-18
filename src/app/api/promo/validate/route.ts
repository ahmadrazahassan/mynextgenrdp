import { NextRequest, NextResponse } from 'next/server';

// Define a promo code interface
interface PromoCode {
  code: string;
  discount: number; // percentage
  isActive: boolean;
  validUntil?: Date;
}

// Define a single valid promo code
const validPromoCodes: PromoCode[] = [
  {
    code: 'NEXTGEN20',
    discount: 20,
    isActive: true,
    // Optional: add an expiration date
    // validUntil: new Date('2025-12-31')
  }
];

export async function POST(request: NextRequest) {
  console.log('Promo code validation endpoint called');
  
  try {
    // Parse request body
    const body = await request.json();
    const { code } = body;
    
    console.log('Validating promo code:', code);

    // Validate input
    if (!code) {
      console.log('Error: No promo code provided');
      return NextResponse.json(
        { error: 'Promo code is required' },
        { status: 400 }
      );
    }

    // Check if promo code exists
    const promoCode = validPromoCodes.find(
      promo => promo.code.toUpperCase() === code.toUpperCase() && promo.isActive
    );

    // If promo code not found or not active
    if (!promoCode) {
      console.log('Invalid or expired promo code:', code);
      return NextResponse.json(
        { valid: false, message: 'Invalid or expired promo code' },
        { status: 200 }
      );
    }

    // Check if promo code is expired
    if (promoCode.validUntil && new Date() > promoCode.validUntil) {
      console.log('Expired promo code:', code);
      return NextResponse.json(
        { valid: false, message: 'Promo code has expired' },
        { status: 200 }
      );
    }

    // Return valid promo code with discount details
    console.log('Valid promo code found:', promoCode);
    return NextResponse.json({
      valid: true,
      discount: promoCode.discount,
      message: `Promo code applied! ${promoCode.discount}% discount.`
    });
  } catch (error: any) {
    console.error('Error validating promo code:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to validate promo code',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
} 