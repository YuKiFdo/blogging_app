import { PrismaClient } from "@/generated/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { NextRequest } from "next/server";

const prisma = new PrismaClient();

type RouteParams = {
  params: {
    slug: string;
    commentId: string;
  };
};

export async function PATCH(
  req: NextRequest,
  context: RouteParams
) {
  const session = await getServerSession(authOptions);
  const { slug, commentId } = context.params;

  if (!slug || !commentId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await prisma.post.findUnique({ where: { id: slug } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const existingComment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!existingComment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const { content } = await req.json();
  if (!content) {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }

  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: { content },
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

  return NextResponse.json(updatedComment, { status: 200 });
}

export async function DELETE(
  req: NextRequest,
  context: RouteParams
) {
  const { slug, commentId } = context.params;
  const session = await getServerSession(authOptions);

  if (!slug || !commentId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await prisma.post.findUnique({ where: { id: slug } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  await prisma.comment.delete({ where: { id: commentId } });

  return NextResponse.json({ message: "Comment deleted successfully" }, { status: 200 });
}
