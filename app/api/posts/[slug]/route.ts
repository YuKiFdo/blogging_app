import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: Request, context: { params: any }) {
  try {
    const { slug } = context.params;

    if (!slug) {
      return NextResponse.json({ message: "Invalid slug" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        Category: true,
        Tag: true,
        Comment: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        Like: {
          select: {
            id: true,
            userId: true,
          },
        },
        SavedPost: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PATCH(request: Request, context: { params: any }) {
  try {
    const { slug } = context.params;
    const session = await getServerSession(authOptions);

    if (!slug) {
      return NextResponse.json({ message: "Invalid slug" }, { status: 400 });
    }

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, User: { select: { id: true } } },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    if (post.User.id !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { title, content, imageUrl, categoryIds, tagIds } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { message: "Title and content are required" },
        { status: 400 }
      );
    }

    const updatedPost = await prisma.post.update({
      where: { slug },
      data: {
        title,
        slug,
        content,
        imageUrl,
        updatedAt: new Date(),
        Category: categoryIds
          ? {
              set: categoryIds.map((id: string) => ({ id })),
            }
          : undefined,
        Tag: tagIds
          ? {
              set: tagIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        Category: true,
        Tag: true,
        // 🐢 Optional heavy data – uncomment only if needed
        // Comment: {
        //   include: {
        //     User: { select: { id: true, name: true, image: true } },
        //   },
        //   orderBy: { createdAt: "desc" },
        // },
        // Like: { select: { id: true, userId: true } },
        // SavedPost: { select: { id: true, userId: true } },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


//delete

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(request: Request, context: { params: any }) {
  try {
    const { slug } = context.params;
    const session = await getServerSession(authOptions);

    if (!slug) {
      return NextResponse.json({ message: "Invalid slug" }, { status: 400 });
    }

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        User: true,
      },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    if (post.User.id !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await prisma.post.delete({
      where: { slug },
    });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
