// components/Layouts/ClientLayout.tsx

'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'

interface Props {
  children: React.ReactNode
}

export default function ClientLayout({ children }: Props) {
  const pathname = usePathname()

  // Routes where header and footer should be hidden
  const hideLayoutRoutes = ['/login', '/register']
  const hideLayoutPatterns = [/^\/admin/] // Hides /admin and all sub-routes like /admin/dashboard

  const shouldHideLayout = 
    hideLayoutRoutes.includes(pathname) ||
    hideLayoutPatterns.some(pattern => pattern.test(pathname))

  return (
    <>
      {!shouldHideLayout && <Header />}
      {children}
      {!shouldHideLayout && <Footer />}
    </>
  )
}