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

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await req.json();

  if (!content) {
    return NextResponse.json(
      { error: "Comment content is required" },
      { status: 400 }
    );
  }

  const post = await prisma.post.findUnique({
    where: { id: slug },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: {
      id: crypto.randomUUID(),
      content,
      Post: {
        connect: { id: slug },
      },
      User: {
        connect: { id: session.user.id },
      },
      updatedAt: new Date(),
    },
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

  return NextResponse.json(comment, { status: 201 });
}
