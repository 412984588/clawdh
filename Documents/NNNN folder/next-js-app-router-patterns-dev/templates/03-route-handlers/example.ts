// Next.js App Router: Route Handlers
// app/api/[...]/route.ts

import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// ─── Pattern 1: GET handler ───────────────────────────────────────────────────

// app/api/users/route.ts
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "20");

  try {
    // const users = await db.user.findMany({ skip: (page - 1) * limit, take: limit })
    const users = [{ id: "1", name: "Alice" }]; // stub

    return NextResponse.json<ApiResponse<typeof users>>({ data: users }, { status: 200 });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── Pattern 2: POST with body parsing ───────────────────────────────────────

// app/api/users/route.ts
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { name, email } = body as { name: string; email: string };

    if (!name || !email) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "name and email are required" },
        { status: 400 }
      );
    }

    // const user = await db.user.create({ data: { name, email } })
    const user = { id: "new-id", name, email }; // stub

    return NextResponse.json<ApiResponse<typeof user>>({ data: user }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── Pattern 3: Dynamic route — app/api/users/[id]/route.ts ──────────────────

export async function GET_BY_ID(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params; // params is now a Promise in Next.js 15

  // const user = await db.user.findUnique({ where: { id } })
  if (id === "999") {
    return NextResponse.json<ApiResponse<never>>({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ data: { id, name: "Alice" } });
}

// ─── Pattern 4: Authenticated route ──────────────────────────────────────────

async function getSession(request: NextRequest): Promise<{ userId: string } | null> {
  // Check Authorization header or session cookie
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  // return await verifyJWT(token)
  return { userId: "user-123" }; // stub
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  // await db.user.delete({ where: { id } })
  console.log(`Deleting user ${id} by ${session.userId}`);

  return new NextResponse(null, { status: 204 });
}

// ─── Pattern 5: Streaming response ───────────────────────────────────────────

export async function GET_STREAM(): Promise<Response> {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const chunks = ["Hello", " ", "World", "!"];

      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        await new Promise((r) => setTimeout(r, 100));
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// ─── Pattern 6: CORS headers ─────────────────────────────────────────────────

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
