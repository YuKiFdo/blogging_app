// app/api/posts/[postId]/save/route.ts
import { PrismaClient } from "@/generated/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await prisma.post.findUnique({
    where: { id: slug },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const existingSave = await prisma.savedPost.findUnique({
    where: {
      postId_userId: {
        postId: slug,
        userId: session.user.id,
      },
    },
  });

  if (existingSave) {
    await prisma.savedPost.delete({
      where: {
        postId_userId: {
          postId: slug,
          userId: session.user.id,
        },
      },
    });
    return NextResponse.json({ saved: false });
  } else {
    await prisma.savedPost.create({
      data: {
        id: crypto.randomUUID(),
        postId: slug,
        userId: session.user.id,
      },
    });
    return NextResponse.json({ saved: true });
  }
}