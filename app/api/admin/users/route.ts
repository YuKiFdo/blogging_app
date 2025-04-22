// app/api/admin/users/route.ts
import prisma from '@/lib/prisma';
import { auth } from "@/app/auth";
import { NextResponse } from "next/server";
import type { CustomSession } from "@/types/next-auth";

export async function GET() {
  const session = await auth();

  if (!session || !(session as CustomSession).user?.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = (session as CustomSession).user?.role;
  if (!userRole || userRole !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          comments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

// app/api/admin/users/[id]/route.ts
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session || !(session as CustomSession).user?.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = (session as CustomSession).user?.role;
  if (!userRole || userRole !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = await req.json();

  // Prevent changing own role
  const userId = (session as CustomSession).user?.id;
  if (params.id === userId) {
    return NextResponse.json(
      { error: "Cannot change your own role" },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return NextResponse.json(user);
}