import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req: Request, context: { params: any }) {
  const session = await getServerSession(authOptions);

  const slug = context.params.slug as string;

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
