// app/api/auth/[...nextauth]/route.ts

import NextAuth, { NextAuthOptions, User } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import UserModel from '@/models/User'
import {
  generateRefreshToken,
  hashToken,
  getRefreshTokenExpiry,
  isAdminEmail,
} from '@/lib/auth-utils'

export const authOptions: NextAuthOptions = {
  providers: [
    // Credentials Provider (email + password)
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password')
        }

        await connectDB()

        // Find user with password field included
        const user = await UserModel.findOne({
          email: credentials.email.toLowerCase(),
        }).select('+password')

        if (!user) {
          throw new Error('No account found with this email. Please register first.')
        }

        if (!user.isActive) {
          throw new Error('Your account has been deactivated. Please contact support.')
        }

        // Admin accounts can only login via Google
        if (user.role === 'admin' && user.provider === 'google') {
          throw new Error('Admin accounts must sign in with Google.')
        }

        // Check if user has a password (might be Google-only user)
        if (!user.password) {
          throw new Error('This account uses Google sign-in. Please sign in with Google.')
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Incorrect password. Please try again.')
        }

        // Generate refresh token
        const refreshToken = generateRefreshToken()
        const hashedRefreshToken = hashToken(refreshToken)

        await UserModel.findByIdAndUpdate(user._id, {
          refreshToken: hashedRefreshToken,
          refreshTokenExpiry: getRefreshTokenExpiry(),
        })

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image || null,
          role: user.role,
          provider: user.provider,
        }
      },
    }),

    // Google Provider
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB()

          const existingUser = await UserModel.findOne({
            email: user.email!.toLowerCase(),
          })

          if (existingUser) {
            // Update existing user's Google info
            const updateData: Record<string, unknown> = {
              googleId: account.providerAccountId,
              image: user.image || existingUser.image,
            }

            // If user registered with credentials and now also uses Google
            if (existingUser.provider === 'credentials') {
              updateData.provider = 'both'
            }

            // Check if this email is an admin
            if (isAdminEmail(user.email!)) {
              updateData.role = 'admin'
            }

            // Generate refresh token
            const refreshToken = generateRefreshToken()
            updateData.refreshToken = hashToken(refreshToken)
            updateData.refreshTokenExpiry = getRefreshTokenExpiry()

            await UserModel.findByIdAndUpdate(existingUser._id, updateData)

            // Attach user info for JWT
            user.id = existingUser._id.toString()
            user.role = isAdminEmail(user.email!)
              ? 'admin'
              : existingUser.role
            user.provider = existingUser.provider === 'credentials'
              ? 'both'
              : existingUser.provider
          } else {
            // Create new user from Google sign-in
            const isAdmin = isAdminEmail(user.email!)
            const refreshToken = generateRefreshToken()

            const newUser = await UserModel.create({
              name: user.name,
              email: user.email!.toLowerCase(),
              image: user.image,
              googleId: account.providerAccountId,
              provider: 'google',
              role: isAdmin ? 'admin' : 'user',
              contactNumbers: [],
              addresses: [],
              refreshToken: hashToken(refreshToken),
              refreshTokenExpiry: getRefreshTokenExpiry(),
              isActive: true,
            })

            user.id = newUser._id.toString()
            user.role = isAdmin ? 'admin' : 'user'
            user.provider = 'google'
          }

          return true
        } catch (error) {
          console.error('Google sign-in error:', error)
          return false
        }
      }

      return true
    },

    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.provider = user.provider
        // Session expires after 24 hours
        token.accessTokenExpires = Date.now() + 24 * 60 * 60 * 1000
      }

      // Handle session update
      if (trigger === 'update' && session) {
        token.name = session.user?.name || token.name
        token.picture = session.user?.image || token.picture
      }

      // Check if session has expired (24 hours)
      if (token.accessTokenExpires && Date.now() > (token.accessTokenExpires as number)) {
        // Session expired - try refresh
        try {
          await connectDB()
          const dbUser = await UserModel.findById(token.id).select(
            '+refreshToken +refreshTokenExpiry'
          )

          if (
            dbUser &&
            dbUser.refreshTokenExpiry &&
            new Date(dbUser.refreshTokenExpiry) > new Date()
          ) {
            // Refresh token still valid, extend session
            const newRefreshToken = generateRefreshToken()
            await UserModel.findByIdAndUpdate(dbUser._id, {
              refreshToken: hashToken(newRefreshToken),
              refreshTokenExpiry: getRefreshTokenExpiry(),
            })

            token.accessTokenExpires = Date.now() + 24 * 60 * 60 * 1000
            return token
          }
        } catch (error) {
          console.error('Token refresh error:', error)
        }

        // Force sign out if refresh failed
        return { ...token, error: 'SessionExpired' }
      }

      return token
    },

    async session({ session, token }) {
      if (token.error === 'SessionExpired') {
        // Return empty session to trigger sign out on client
        return { ...session, error: 'SessionExpired' } as typeof session & { error: string }
      }

      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'user' | 'admin'
        session.user.provider = token.provider as 'credentials' | 'google' | 'both'
        session.user.image = token.picture as string | null
      }

      session.accessTokenExpires = token.accessTokenExpires as number

      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }