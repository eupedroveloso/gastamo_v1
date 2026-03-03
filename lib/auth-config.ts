import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).id
        token.familyId = (user as any).familyId
      }
      return token
    },
    async session({ session, token }) {
      if (token?.userId) {
        ;(session.user as any).id = token.userId
      }
      if (token?.familyId) {
        ;(session.user as any).familyId = token.familyId
      }
      return session
    },
  },
} satisfies NextAuthConfig

