import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const stats = await prisma.$transaction([
            prisma.post.count(),
            prisma.user.count(),
            prisma.comment.count(),
            prisma.like.count(),
            prisma.post.count({
              where: {
                published: true,
              },
            }),
            prisma.post.count({
              where: {
                published: false,
              },
            }),
        ]);

        const [totalPosts, totalUsers, totalComments, totalLikes, publishedPosts, unpublishedPosts] = stats;
        return NextResponse.json({
            totalPosts,
            totalUsers,
            totalComments,
            totalLikes,
            publishedPosts,
            unpublishedPosts
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
} 