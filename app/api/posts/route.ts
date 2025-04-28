import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {

  try {

    const url = new URL(request.url);
    const isPublished = url.searchParams.get("isPublished");
    const authorId = url.searchParams.get("authorId");
    const publishedfILTER = isPublished === "true" ? true : isPublished === "false" ? false : undefined;
    const posts = await prisma.post.findMany({
      where: {
        published: publishedfILTER,
        ...(authorId && { authorId }),
      },

      include: {
        User: true,
        Category: true,
        Tag: true,
      },
    });
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { title, content, imageUrl, slug, categoryId, tagIds, isPublished } = await request.json();

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  if (!title || !content || !slug || !categoryId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existingPost = await prisma.post.findUnique({ where: { slug } });
  if (existingPost) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        id: crypto.randomUUID(),
        title,
        content,
        imageUrl,
        slug,
        User: { connect: { id: userId } },
        Category: { connect: { id: categoryId } },
        Tag: { connect: tagIds.map((id: string) => ({ id })) },
        updatedAt: new Date(),
        published: isPublished || false,

      },
    });
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}