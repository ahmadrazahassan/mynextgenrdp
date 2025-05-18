/**
 * Script to test the promo code validation API
 * 
 * Run with: node test-promo-code.js
 */

// For Node.js compatibility (Node 18+)
const fetch = globalThis.fetch || require('node-fetch');

async function testPromoCode() {
  try {
    const validCode = 'NEXTGEN20';
    const invalidCode = 'INVALID123';
    
    console.log(`Testing valid promo code: ${validCode}`);
    const validResponse = await fetch('http://localhost:3000/api/promo/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: validCode }),
    });
    
    const validResult = await validResponse.json();
    console.log('Result for valid code:', validResult);
    console.log('Status:', validResponse.status, validResponse.ok ? 'Success' : 'Failed');
    
    console.log(`\nTesting invalid promo code: ${invalidCode}`);
    const invalidResponse = await fetch('http://localhost:3000/api/promo/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: invalidCode }),
    });
    
    const invalidResult = await invalidResponse.json();
    console.log('Result for invalid code:', invalidResult);
    console.log('Status:', invalidResponse.status, invalidResponse.ok ? 'Success' : 'Failed');
    
    // Testing calculation
    if (validResult.valid && validResult.discount) {
      const price = 1000; // Example price
      const discountAmount = Math.round((price * validResult.discount) / 100);
      console.log(`\nCalculation test with price ${price}:`);
      console.log(`Discount percentage: ${validResult.discount}%`);
      console.log(`Discount amount: ${discountAmount}`);
      console.log(`Final price: ${price - discountAmount}`);
    }
    
  } catch (error) {
    console.error('Error testing promo code API:', error);
  }
}

// Run the test
testPromoCode(); 