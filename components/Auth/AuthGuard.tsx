// components/Auth/AuthGuard.tsx

'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect } from 'react'
import { toast } from 'sonner'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  useEffect(() => {
    // Check if session has expired
    if (session && (session as typeof session & { error?: string }).error === 'SessionExpired') {
      toast.error('Your session has expired. Please log in again.')
      signOut({ callbackUrl: '/login' })
    }

    // Check access token expiry on client side
    if (session?.accessTokenExpires && Date.now() > session.accessTokenExpires) {
      toast.info('Your session has expired. Redirecting to login...')
      signOut({ callbackUrl: '/login' })
    }
  }, [session])

  return <>{children}</>
}