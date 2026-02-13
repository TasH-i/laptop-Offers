// components/Auth/SessionProvider.tsx

'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

interface Props {
  children: React.ReactNode
}

export default function SessionProvider({ children }: Props) {
  return (
    <NextAuthSessionProvider
      refetchInterval={5 * 60} // Re-check session every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </NextAuthSessionProvider>
  )
}