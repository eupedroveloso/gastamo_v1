import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"
import { authConfig } from "@/lib/auth-config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email ?? "").toString().toLowerCase().trim()
        const password = (credentials?.password ?? "").toString()

        if (!email || !password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) return null

        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          familyId: user.familyId,
        }
      },
    }),
  ],
})

export async function getRequiredFamilyId(): Promise<string> {
  const session = await auth()
  const familyId = (session?.user as any)?.familyId
  if (!familyId) {
    throw new Error("Nao autenticado")
  }
  return familyId as string
}

