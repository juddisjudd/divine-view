import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PoEApiClient } from '@/lib/poe-api';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    if (!session?.user?.accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const client = new PoEApiClient(session.user.accessToken);
    await client.deleteFilter(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting PoE filter:', error);
    return NextResponse.json(
      { error: 'Failed to delete filter from Path of Exile API' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    if (!session?.user?.accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const client = new PoEApiClient(session.user.accessToken);
    const filter = await client.getFilter(id);
    
    return NextResponse.json(filter);
  } catch (error) {
    console.error('Error fetching PoE filter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter from Path of Exile API' },
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
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const client = new PoEApiClient(session.user.accessToken);
    const updatedFilter = await client.updateFilter(id, body);
    
    return NextResponse.json(updatedFilter);
  } catch (error) {
    console.error('Error updating PoE filter:', error);
    return NextResponse.json(
      { error: 'Failed to update filter in Path of Exile API' },
      { status: 500 }
    );
  }
}