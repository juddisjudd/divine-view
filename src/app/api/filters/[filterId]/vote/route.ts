import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { ApiResponse, VoteInput } from "@/types/api";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ filterId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { filterId } = await context.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const json = await request.json();
    const { value } = json as VoteInput;

    if (value !== 1 && value !== -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid vote value",
        },
        { status: 400 }
      );
    }

    const filter = await prisma.filter.findUnique({
      where: { id: filterId },
    });

    if (!filter) {
      return NextResponse.json(
        {
          success: false,
          message: "Filter not found",
        },
        { status: 404 }
      );
    }

    await prisma.vote.upsert({
      where: {
        filterId_userId: {
          filterId,
          userId: session.user.id,
        },
      },
      create: {
        filterId,
        userId: session.user.id,
        value,
      },
      update: {
        value,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    console.error("[FILTER_VOTE]", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ filterId: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { filterId } = await context.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await prisma.vote.delete({
      where: {
        filterId_userId: {
          filterId,
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          message: "Vote not found",
        },
        { status: 404 }
      );
    }

    console.error("[FILTER_VOTE_DELETE]", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
