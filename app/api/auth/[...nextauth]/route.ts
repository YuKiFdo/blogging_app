// import NextAuth from "next-auth"
// import GithubProvider from "next-auth/providers/github"
// import GoogleProvider from "next-auth/providers/google"
// import { JWT } from "next-auth/jwt"
// import { User, Session } from "next-auth"
// import { DefaultSession } from "next-auth"
// import { PrismaClient } from "@/generated/prisma"

// declare module "next-auth" {
//     interface Session {
//         user: {
//             role: string
//             id: string
//         } & DefaultSession["user"]
//         token: JWT
//     }
//     interface User {
//         role?: string
//     }
// }

// declare module "next-auth/jwt" {
//     interface JWT {
//         role: string
//     }
// }

// const prisma = new PrismaClient()

// export const authOptions = {
//     providers: [
//         GithubProvider({
//             clientId: process.env.GITHUB_ID as string,
//             clientSecret: process.env.GITHUB_SECRET as string,
//         }),
//         GoogleProvider({
//             clientId: process.env.GOOGLE_ID as string,
//             clientSecret: process.env.GOOGLE_SECRET as string,
//             authorization: {
//                 params: {
//                     prompt: "consent",
//                     access_type: "offline",
//                     response_type: "code",
//                 },
//             },
//         }),
//     ],
//     pages: {
//         signIn: "/auth/login",
//     },
//     session: {
//         strategy: "jwt" as const,
//     },
//     callbacks: {
//         async signIn({ user }: { user: User }) {
//             const existingUser = await prisma.user.findUnique({
//                 where: { email: user.email as string },
//             })
//             if (!existingUser) {
//                 await prisma.user.create({
//                     data: {
//                         id : user.id,
//                         name: user.name,
//                         email: user.email,
//                         image: user.image,
//                         updatedAt: new Date(),
//                     },
//                 });
//             }

//             return true;

//         },

//         async jwt({ token, user }: { token: JWT, user: User | undefined }) {
//             if (user) {
//                 token.role = user.role || "READER"
//             }
//             return token
//         },

//         async session({ session, token }: { session: Session; token: JWT , user: User | undefined}) {
//             if (token) {
//                 const user = await prisma.user.findUnique({
//                     where: { id: token.sub as string },
//                 })
//                 if (user) {
//                     session.user.role = user.role || "READER"
//                 } else {
//                     session.user.role = "READER"
//                 }

//                 session.user.id = token.sub as string
//                         }
//             return session
//         },
//     },
//     secret: process.env.NEXTAUTH_SECRET,
// }

// const handler = NextAuth(authOptions)

// export { handler as GET, handler as POST }


import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

