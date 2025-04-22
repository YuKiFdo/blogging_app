import { PrismaClient } from "@/generated/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);

  const resolvedParams = await Promise.resolve(params);

  const slug = resolvedParams.slug as string;

  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await prisma.post.findUnique({
    where: { id: slug },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId: slug,
        userId: session.user.id,
      },
    },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: {
        postId_userId: {
          postId: slug,
          userId: session.user.id,
        },
      },
    });
    return NextResponse.json({ liked: false });
  } else {
    await prisma.like.create({
      data: {
        id: crypto.randomUUID(),
        postId: slug,
        userId: session.user.id,
      },
    });
    return NextResponse.json({ liked: true });
  }
}

// edit commnet
