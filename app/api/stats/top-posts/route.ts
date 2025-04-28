import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const mostLikedPosts = await prisma.post.findMany({
      where: {
        published: true,
      },
      select: {
        id: true,
        title: true,
        content: true,
        slug: true,
        imageUrl: true,
        createdAt: true,
        authorId: true,
        User: {
          select: {
            name: true,
            image: true,
          }
        },
        _count: {
          select: {
            Like: true,
          }
        }
      },
      orderBy: {
        Like: {
          _count: 'desc'
        }
      },
      take: 1
    });

    const mostCommentedPosts = await prisma.post.findMany({
      where: {
        published: true,
      },
      select: {
        id: true,
        title: true,
        content: true,
        slug: true,
        imageUrl: true,
        createdAt: true,
        authorId: true,
        User: {
          select: {
            name: true,
            image: true,
          }
        },
        _count: {
          select: {
            Comment: true,
          }
        }
      },
      orderBy: {
        Comment: {
          _count: 'desc'
        }
      },
      take: 1
    });

    const mostLiked = mostLikedPosts.length > 0 ? {
      ...mostLikedPosts[0],
      likeCount: mostLikedPosts[0]._count.Like,
      excerpt: mostLikedPosts[0].content.length > 150 
        ? mostLikedPosts[0].content.substring(0, 150) + '...'
        : mostLikedPosts[0].content
    } : null;

    const mostCommented = mostCommentedPosts.length > 0 ? {
      ...mostCommentedPosts[0],
      commentCount: mostCommentedPosts[0]._count.Comment,
      excerpt: mostCommentedPosts[0].content.length > 150 
        ? mostCommentedPosts[0].content.substring(0, 150) + '...'
        : mostCommentedPosts[0].content
    } : null;

    return NextResponse.json({
      mostLiked,
      mostCommented
    });
  } catch (error) {
    console.error("Error fetching top posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch top posts" },
      { status: 500 }
    );
  }
}