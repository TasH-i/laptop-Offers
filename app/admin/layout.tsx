// app/admin/layout.tsx
// This layout wraps ALL /admin/* routes.
// It hides the default site Header & Footer and provides its own AdminHeader + AdminSidebar.
// Only users with role === 'admin' can access these pages.

'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import AdminSidebar from '@/components/Admin/AdminSidebar'
import AdminHeader from '@/components/Admin/AdminHeader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
        if (status === 'loading') return

        if (status === 'unauthenticated') {
            toast.error('Please sign in to access the admin panel.')
            router.push('/login')
            return
        }

        if (session?.user?.role !== 'admin') {
            toast.error('Access denied. Admin privileges required.')
            router.push('/')
            return
        }

        setAuthorized(true)
    }, [status, session, router])

    // Loading state
    if (status === 'loading' || !authorized) {
        return (
            <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-red" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">Admin Panel</p>
                        <p className="text-[12px] text-gray-400 mt-0.5">Verifying access...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f8f9fb] flex">
            {/* Sidebar */}
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main area */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
                <AdminHeader
                    onMenuClick={() => setSidebarOpen(true)}
                    user={session!.user}
                />
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}
        </div>
    )
}