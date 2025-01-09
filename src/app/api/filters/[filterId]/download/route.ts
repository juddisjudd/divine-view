import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types/api";

export async function POST(
  request: NextRequest,
  context: { params: { filterId: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { params } = context;
    const filterId = (await params).filterId; 

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

    const response = await fetch(filter.githubUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch filter content from GitHub");
    }
    const content = await response.text();

    await prisma.filter.update({
      where: { id: filterId },
      data: {
        downloads: {
          increment: 1,
        },
      },
    });

    const filename = filter.githubUrl.split("/").pop() || `${filter.name}.filter`;

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    console.error("[FILTER_DOWNLOAD]", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
