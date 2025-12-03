import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PoEApiClient } from '@/lib/poe-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

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
    const filter = await client.getFilter(id);

    return NextResponse.json(filter);
  } catch (error: any) {
    console.error('Error fetching PoE filter:', error);

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

    if (error.message?.includes('404')) {
      return NextResponse.json(
        {
          error: 'Filter not found',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch filter from Path of Exile API',
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

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
    const updatedFilter = await client.updateFilter(id, body);

    return NextResponse.json(updatedFilter);
  } catch (error: any) {
    console.error('Error updating PoE filter:', error);

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

    if (error.message?.includes('404')) {
      return NextResponse.json(
        {
          error: 'Filter not found',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to update filter in Path of Exile API',
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
