import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PoEApiClient } from '@/lib/poe-api';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const client = new PoEApiClient(session.user.accessToken);
    const filters = await client.getFilters();
    
    return NextResponse.json(filters);
  } catch (error) {
    console.error('Error fetching PoE filters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filters from Path of Exile API' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const client = new PoEApiClient(session.user.accessToken);
    const newFilter = await client.createFilter(body);
    
    return NextResponse.json(newFilter);
  } catch (error) {
    console.error('Error creating PoE filter:', error);
    return NextResponse.json(
      { error: 'Failed to create filter in Path of Exile API' },
      { status: 500 }
    );
  }
}