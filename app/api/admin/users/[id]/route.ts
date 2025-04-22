import { PrismaClient } from "@/generated/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !(session).user?.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user?.role;
  if (!userRole || userRole !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = await req.json();

  const id = req.nextUrl.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  const userId = session.user?.id;
  if (id === userId) {
    return NextResponse.json(
      { error: "Cannot change your own role" },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id },
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
