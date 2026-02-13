// types/next-auth.d.ts

import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string | null
      role: 'user' | 'admin'
      provider: 'credentials' | 'google' | 'both'
    }
    accessTokenExpires?: number
  }

  interface User {
    id: string
    name: string
    email: string
    image?: string | null
    role: 'user' | 'admin'
    provider: 'credentials' | 'google' | 'both'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'user' | 'admin'
    provider: 'credentials' | 'google' | 'both'
    accessTokenExpires?: number
    refreshToken?: string
  }
}