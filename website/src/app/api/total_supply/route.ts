import { NextResponse } from 'next/server';
import { calculateTotalSupply, getCachedValue } from '@/app/api/shared';

// Cache configuration - revalidate after 1 hour (3600 seconds)
export const revalidate = 3600;

export async function GET() {
  try {
    const totalSupply = await calculateTotalSupply();
    
    // Return plain text response
    const response = new NextResponse(totalSupply, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
      }
    });
    
    return response;
    
  } catch (error) {
    console.error('Error calculating total supply:', error);
    
    // Try to get cached value
    const cachedValue = getCachedValue('total_supply');
    if (cachedValue) {
      return new NextResponse(cachedValue, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Cached-Fallback': 'true'
        }
      });
    }
    
    // No cached value available, return 500
    return new NextResponse('Service temporarily unavailable', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}
