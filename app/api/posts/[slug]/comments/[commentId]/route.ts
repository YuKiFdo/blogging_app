// app/api/posts/[postId]/comments/route.ts
import { PrismaClient } from "@/generated/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  { params }: { params: { slug: string, commentId: string } }
) {
  const session = await getServerSession(authOptions);

  const resolvedParams = await Promise.resolve(params);

  const {slug, commentId} = resolvedParams as { slug: string, commentId: string };

  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  if (!commentId) {
    return NextResponse.json({ error: "Invalid commentId" }, { status: 400 });
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

  const commentss = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!commentss) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const { content } = await req.json();

  if (!content) {
    return NextResponse.json(
      { error: "Comment content is required" },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: {
      content,
    },
  });

  if (!comment) {
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
  const commentwithAuther = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      User: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
  return NextResponse.json(commentwithAuther, { status: 200 });
}

export async function DELETE(
  req: Request,
  { params }: { params: { slug: string, commentId: string } }
) {
  const session = await getServerSession(authOptions);

  const resolvedParams = await Promise.resolve(params);

  const {slug, commentId} = resolvedParams as { slug: string, commentId: string };

  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  if (!commentId) {
    return NextResponse.json({ error: "Invalid commentId" }, { status: 400 });
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

  const commentss = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!commentss) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const comment = await prisma.comment.delete({
    where: { id: commentId },
  });

  if (!comment) {
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
  return NextResponse.json({ message: "Comment deleted successfully" }, { status: 200 });
}