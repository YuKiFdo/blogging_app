import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PATCH(request: Request, context: { params: any }) {
    try {
        const { slug } = context.params;
        const session = await getServerSession(authOptions);
       const { published } = await request.json();

        if (!slug) {
            return NextResponse.json({ message: "Invalid slug" }, { status: 400 });
        }
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (!session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (!session.user?.role || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const post = await prisma.post.findUnique({
            where: { slug },
            select: { id: true, published:true, User: { select: { id: true } } },
        });

        if (!post) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }

        if (post.published === published) {
            return NextResponse.json({ message: "Post already in this state" }, { status: 400 });
        }

        const updatedPost = await prisma.post.update({
            where: { slug },
            data: { published },
        });


        return NextResponse.json(updatedPost );
    } catch (error) {
        console.error("Error publishing post:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}




