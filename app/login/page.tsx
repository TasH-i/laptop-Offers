// app/login/page.tsx
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const LoginContent = dynamic(() => import('@/components/Auth/LoginContent'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="animate-spin">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-brand-red rounded-full"></div>
      </div>
    </div>
  ),
})

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginContent />
    </Suspense>
  )
}