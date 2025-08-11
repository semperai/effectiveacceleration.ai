import { NextResponse } from 'next/server';

// Cache configuration - revalidate after 1 hour (3600 seconds)
export const revalidate = 3600;

// CoinGecko API configuration
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const COINGECKO_COIN_ID = 'eacctoken';

// Fixed total supply
const TOTAL_SUPPLY = 6_969_696_969;

// Price cache with 1 hour TTL
interface PriceCache {
  price: number;
  timestamp: number;
}

let priceCache: PriceCache | null = null;
const PRICE_CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

// Fetch token price from CoinGecko
async function getTokenPrice(): Promise<number> {
  // Check if we have a valid cached price (within 1 hour)
  if (priceCache && Date.now() - priceCache.timestamp < PRICE_CACHE_TTL) {
    console.log('Returning cached token price');
    return priceCache.price;
  }

  try {
    // Fetch from CoinGecko
    const response = await fetch(
      `${COINGECKO_API_URL}?ids=${COINGECKO_COIN_ID}&vs_currencies=usd`,
      {
        headers: {
          Accept: 'application/json',
        },
        // Set a timeout for the fetch
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API returned status ${response.status}`);
    }

    const data = await response.json();

    // Extract price from response
    const price = data[COINGECKO_COIN_ID]?.usd;

    if (typeof price !== 'number' || price <= 0) {
      throw new Error('Invalid price data from CoinGecko');
    }

    // Update cache
    priceCache = {
      price,
      timestamp: Date.now(),
    };

    console.log(`Fetched token price from CoinGecko: $${price}`);
    return price;
  } catch (error) {
    console.error('Error fetching token price from CoinGecko:', error);

    // If we have ANY cached price (even if expired), use it as fallback
    if (priceCache) {
      console.log('Using old cached price due to CoinGecko API error');
      return priceCache.price;
    }

    throw error;
  }
}

// Calculate market cap (FDV)
async function calculateMarketCap(): Promise<string> {
  try {
    const tokenPrice = await getTokenPrice();

    // Calculate market cap (FDV) using fixed total supply
    const marketCap = TOTAL_SUPPLY * tokenPrice;

    // Format to 2 decimal places
    return marketCap.toFixed(2);
  } catch (error) {
    console.error('Error calculating market cap:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const marketCap = await calculateMarketCap();

    // Return plain text response with the market cap value
    const response = new NextResponse(marketCap, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 hour cache, 2 hours stale
      },
    });

    return response;
  } catch (error) {
    console.error('Error in market cap endpoint:', error);

    // Return 503 Service Unavailable
    return new NextResponse('Service temporarily unavailable', {
      status: 503,
      headers: {
        'Content-Type': 'text/plain',
        'Retry-After': '300', // Suggest retry after 5 minutes
      },
    });
  }
}
