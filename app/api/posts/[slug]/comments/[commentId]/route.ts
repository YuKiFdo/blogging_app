import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PATCH(request: NextRequest, context: { params: any}) {
  try {
    const session = await getServerSession(authOptions);
    const { slug, commentId } = context.params;

    if (!slug || !commentId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [post, existingComment] = await Promise.all([
      prisma.post.findUnique({ where: { id: slug } }),
      prisma.comment.findUnique({ where: { id: commentId } })
    ]);

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (!existingComment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    const { content } = await request.json();
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

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(request: NextRequest, context: { params: any}) {
  try {
    const { slug, commentId } = context.params;
    const session = await getServerSession(authOptions);

    if (!slug || !commentId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [post, comment] = await Promise.all([
      prisma.post.findUnique({ where: { id: slug } }),
      prisma.comment.findUnique({ where: { id: commentId } })
    ]);

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    await prisma.comment.delete({ where: { id: commentId } });

    return NextResponse.json(
      { message: "Comment deleted successfully" }
    );
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}