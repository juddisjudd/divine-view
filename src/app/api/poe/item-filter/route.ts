import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PoEApiClient } from '@/lib/poe-api';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accessToken) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }

    const client = new PoEApiClient(session.user.accessToken);
    const filters = await client.getFilters();

    return NextResponse.json(filters);
  } catch (error: any) {
    console.error('Error fetching PoE filters:', error);

    // Check if the error is from PoE API (contains status)
    if (error.message?.includes('401')) {
      return NextResponse.json(
        {
          error: 'Authentication expired',
          code: 'AUTH_EXPIRED'
        },
        { status: 401 }
      );
    }

    if (error.message?.includes('403')) {
      return NextResponse.json(
        {
          error: 'Access forbidden',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch filters from Path of Exile API',
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accessToken) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const client = new PoEApiClient(session.user.accessToken);
    const newFilter = await client.createFilter(body);

    return NextResponse.json(newFilter);
  } catch (error: any) {
    console.error('Error creating PoE filter:', error);

    // Check if the error is from PoE API (contains status)
    if (error.message?.includes('401')) {
      return NextResponse.json(
        {
          error: 'Authentication expired',
          code: 'AUTH_EXPIRED'
        },
        { status: 401 }
      );
    }

    if (error.message?.includes('403')) {
      return NextResponse.json(
        {
          error: 'Access forbidden',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create filter in Path of Exile API',
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}