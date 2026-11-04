import type { NextAuthConfig } from "next-auth"

/**
 * Lightweight Auth.js configuration for Edge middleware and runtime.
 * Keeps Node-specific libraries (Prisma, bcrypt) isolated in src/auth.ts.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthRoute =
        nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register")
      const isPublicRoute =
        isAuthRoute ||
        nextUrl.pathname === "/" ||
        nextUrl.pathname.startsWith("/api/health") ||
        nextUrl.pathname.startsWith("/api/auth")

      // Authenticated users trying to access login/register -> redirect to /dashboard
      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl))
        }
        return true
      }

      // Unauthenticated users trying to access protected routes -> redirect to /login
      if (!isLoggedIn && !isPublicRoute) {
        return false // Triggers redirect to pages.signIn ("/login")
      }

      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        if (token.email) session.user.email = token.email as string
        if (token.name) session.user.name = token.name as string
        if (token.picture) session.user.image = token.picture as string
      }
      return session
    },
  },
  providers: [], // Populated in src/auth.ts with full node/database dependencies
}

