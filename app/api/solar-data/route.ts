import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing latitude or longitude' }, { status: 400 });
  }

  const solcastApiKey = process.env.NEXT_PUBLIC_SOLCAST_API_KEY;

  if (!solcastApiKey) {
    console.error('Solcast API key is not set');
    return NextResponse.json({ error: 'Solcast API key is not configured' }, { status: 500 });
  }

  try {
    // Fetch Solar Radiation Data from Solcast API
    const solcastResponse = await axios.get('https://api.solcast.com.au/radiation/estimated_actuals', {
      params: {
        latitude: lat,
        longitude: lon,
        api_key: solcastApiKey,
        format: 'json',
        hours: 168, // Get data for the past week (168 hours)
      },
    });

    const solarData = solcastResponse.data;

    return NextResponse.json({
      solarData,
    });
  } catch (error: any) {
    console.error('Error fetching data:', error.response?.data || error.message);
    if (axios.isAxiosError(error)) {
      // Check if the error is due to exceeding the API limit
      if (error.response?.status === 429) {
        return NextResponse.json(
          { error: 'You have exceeded your free daily limit. Please try again later.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch data: ${JSON.stringify(error.response?.data) || error.message}` },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
