import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import * as bcrypt from "bcryptjs"

// Validate NEXTAUTH_URL is set in production
if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_URL) {
  throw new Error(
    "NEXTAUTH_URL environment variable is required in production. " +
    "Please set it to your application URL (e.g., https://your-app.vercel.app)"
  )
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const timestamp = new Date().toISOString()
        console.log(`[${timestamp}] 🔐 Authorize called`)
        console.log(`[${timestamp}]   Email: ${credentials?.email || 'MISSING'}`)
        console.log(`[${timestamp}]   Password length: ${credentials?.password?.length || 0} chars`)
        
        if (!credentials?.email || !credentials?.password) {
          console.log(`[${timestamp}] ❌ Missing credentials - email: ${!!credentials?.email}, password: ${!!credentials?.password}`)
          return null
        }

        try {
          console.log(`[${timestamp}] 🔍 Looking up user in database for: ${credentials.email}`)
          const user = await prisma.users.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              status: true,
              teamId: true,
              playerId: true,
            }
          })

          if (!user) {
            console.log(`[${timestamp}] ❌ User not found in database: ${credentials.email}`)
            return null
          }

          console.log(`[${timestamp}] ✅ User found in database`)
          console.log(`[${timestamp}]   User ID: ${user.id}`)
          console.log(`[${timestamp}]   Email: ${user.email}`)
          console.log(`[${timestamp}]   Name: ${user.name}`)
          console.log(`[${timestamp}]   Role: ${user.role}`)
          console.log(`[${timestamp}]   Status: ${user.status}`)
          // Don't log password hash in production
          if (process.env.NODE_ENV === 'development') {
            console.log(`[${timestamp}]   Password hash: ${user.password.substring(0, 20)}...`)
          }

          // Block pending/rejected users
          if (user.status === "PENDING") {
            console.log(`[${timestamp}] ⏳ User is pending approval - blocking login`)
            throw new Error("Your account is pending approval. Please wait for an admin to approve your registration.")
          }
          if (user.status === "REJECTED") {
            console.log(`[${timestamp}] 🚫 User is rejected - blocking login`)
            throw new Error("Your account registration was not approved.")
          }

          // Verify password
          console.log(`[${timestamp}] 🔐 Verifying password...`)
          console.log(`[${timestamp}]   Comparing provided password with stored hash`)
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )
          console.log(`[${timestamp}]   Password verification result: ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`)

          if (!isPasswordValid) {
            console.log(`[${timestamp}] ❌ Password verification failed`)
            console.log(`[${timestamp}]   This could mean:`)
            console.log(`[${timestamp}]   - Password is incorrect`)
            console.log(`[${timestamp}]   - Password hash in database doesn't match`)
            return null
          }

          console.log(`[${timestamp}] ✅ Password is valid!`)
          console.log(`[${timestamp}] 📤 Returning user object to NextAuth:`)
          console.log(`[${timestamp}]   - ID: ${user.id}`)
          console.log(`[${timestamp}]   - Email: ${user.email}`)
          console.log(`[${timestamp}]   - Role: ${user.role}`)
          
          // Return user object for NextAuth
          const userObject = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            teamId: user.teamId,
            playerId: user.playerId,
          }
          console.log(`[${timestamp}] ✅ Authorization successful - user object returned`)
          return userObject
        } catch (error: any) {
          // Log errors for debugging
          console.error(`[${timestamp}] 🚨 Auth error occurred:`)
          console.error(`[${timestamp}]   Error message: ${error.message}`)
          console.error(`[${timestamp}]   Error code: ${error.code || 'N/A'}`)
          if (error.stack) {
            console.error(`[${timestamp}]   Stack trace: ${error.stack.split('\n').slice(0, 3).join('\n')}`)
          }
          
          // For user status errors (pending/rejected), throw to show message
          if (error.message?.includes("pending approval") || error.message?.includes("not approved")) {
            console.log(`[${timestamp}]   Throwing error to show user-friendly message`)
            throw error
          }
          
          // For database/Prisma errors, provide helpful message
          if (error.code === 'P2021' || error.message?.includes('does not exist') || error.message?.includes('Unknown model')) {
            console.error(`[${timestamp}]   Database error detected - throwing connection error`)
            throw new Error("Database connection error. Please ensure the database is properly configured.")
          }
          
          // For Prisma connection errors
          if (error.code === 'P1001' || error.message?.includes('Can\'t reach database') || error.message?.includes('Connection')) {
            console.error(`[${timestamp}]   Database connection failed - DATABASE_URL might be missing or incorrect`)
            throw new Error("Database connection error. Please check DATABASE_URL environment variable.")
          }
          
          // For other errors, log and throw to show error message
          console.error(`[${timestamp}]   Unexpected error: ${error.message}`)
          throw new Error(`Authentication error: ${error.message || 'Unknown error occurred'}`)
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.teamId = (user as any).teamId
        token.playerId = (user as any).playerId
      }
      return token
    },
    async session({ session, token }) {
      // NextAuth expects session to always be defined
      // If no user is logged in, session.user will be null/undefined
      if (session?.user && token) {
        const user = session.user as any
        user.role = (token.role as string) || "VIEWER"
        user.id = token.sub || ""
        user.teamId = (token.teamId as string | null | undefined) || null
        user.playerId = (token.playerId as string | null | undefined) || null
      }
      // Always return the session object (even if user is null)
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/error", // Redirect errors to error page
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-only",
  debug: process.env.NODE_ENV === "development",
  // Cookies configuration - secure flag based on URL (HTTPS detection)
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        // Use URL-based detection for secure flag - ensures cookies work correctly in Vercel HTTPS environment
        secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? true,
      },
    },
  },
}

