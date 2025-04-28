import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma";
import { NextAuthOptions } from "next-auth"
import { JWT } from "next-auth/jwt"
import { User, Session } from "next-auth"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            role: string
            id: string
        } & DefaultSession["user"]
        token: JWT
    }
    interface User {
        role?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],
    pages: {
        signIn: "/auth/login",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user }: { user: User }) {
            const existingUser = await prisma.user.findUnique({
                where: { email: user.email! },
            })

            if (!existingUser) {
                await prisma.user.create({
                    data: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        updatedAt: new Date(),
                    },
                })
            }

            return true
        },

        async jwt({ token }: { token: JWT }) {
            const dbUser = await prisma.user.findUnique({
                where: { id: token.sub! },
            })
            if (dbUser) {
                token.role = dbUser.role || "READER"
            } else {
                token.role = "READER"
            }
            return token
        },

        async session({ session, token }: { session: Session; token: JWT , user: User | undefined}) {
            const dbUser = await prisma.user.findUnique({
                where: { id: token.sub! },
            })

            if (dbUser) {
                session.user.role = dbUser.role || "READER"
            } else {
                session.user.role = "READER"
            }

            session.user.id = token.sub!

            return session
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
}
