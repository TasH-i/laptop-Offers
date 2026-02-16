// app/admin/page.tsx

'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  Eye,
} from 'lucide-react'

const stats = [
  {
    label: 'Total Revenue',
    value: 'LKR 2.4M',
    change: '+12.5%',
    trend: 'up' as const,
    icon: DollarSign,
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    label: 'Total Orders',
    value: '1,248',
    change: '+8.2%',
    trend: 'up' as const,
    icon: ShoppingCart,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    label: 'Customers',
    value: '3,672',
    change: '+15.3%',
    trend: 'up' as const,
    icon: Users,
    color: 'bg-violet-500',
    lightColor: 'bg-violet-50',
    textColor: 'text-violet-600',
  },
  {
    label: 'Products',
    value: '184',
    change: '-2.1%',
    trend: 'down' as const,
    icon: Package,
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
]

const recentOrders = [
  { id: 'ORD-2401', customer: 'Kamal Perera', product: 'ASUS ROG Strix G16', amount: 'LKR 485,000', status: 'Delivered', time: '2 hours ago' },
  { id: 'ORD-2400', customer: 'Nimali Silva', product: 'HP Pavilion 15', amount: 'LKR 198,500', status: 'Processing', time: '4 hours ago' },
  { id: 'ORD-2399', customer: 'Ruwan Fernando', product: 'Lenovo ThinkPad X1', amount: 'LKR 625,000', status: 'Shipped', time: '6 hours ago' },
  { id: 'ORD-2398', customer: 'Dilani Jayawardena', product: 'Dell Inspiron 14', amount: 'LKR 175,000', status: 'Pending', time: '8 hours ago' },
  { id: 'ORD-2397', customer: 'Ashan Bandara', product: 'MacBook Air M3', amount: 'LKR 545,000', status: 'Delivered', time: '12 hours ago' },
]

const topProducts = [
  { name: 'ASUS ROG Strix G16', sales: 42, revenue: 'LKR 20.3M' },
  { name: 'HP Pavilion 15', sales: 38, revenue: 'LKR 7.5M' },
  { name: 'Lenovo IdeaPad Slim 5', sales: 35, revenue: 'LKR 5.9M' },
  { name: 'Dell Inspiron 14', sales: 31, revenue: 'LKR 5.4M' },
  { name: 'MacBook Air M3', sales: 28, revenue: 'LKR 15.2M' },
]

const statusColors: Record<string, string> = {
  Delivered: 'bg-emerald-50 text-emerald-600',
  Processing: 'bg-blue-50 text-blue-600',
  Shipped: 'bg-violet-50 text-violet-600',
  Pending: 'bg-amber-50 text-amber-600',
  Cancelled: 'bg-red-50 text-red-600',
}

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const firstName = session?.user?.name?.split(' ')[0] || 'Admin'

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl ${stat.lightColor} flex items-center justify-center`}>
                <stat.icon size={20} className={stat.textColor} />
              </div>
              <div className={`flex items-center gap-0.5 text-[12px] font-semibold px-2 py-0.5 rounded-full ${
                stat.trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'
              }`}>
                {stat.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-[12px] text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - Takes 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">Recent Orders</h2>
              <p className="text-[12px] text-gray-400 mt-0.5">Latest customer orders</p>
            </div>
            <button className="flex items-center gap-1 text-[12px] font-semibold text-brand-red hover:underline">
              View All <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Order</th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Customer</th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Product</th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="text-[13px] font-semibold text-gray-800">{order.id}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] text-gray-600">{order.customer}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-[13px] text-gray-500 truncate max-w-[180px] block">{order.product}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] font-semibold text-gray-800">{order.amount}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right hidden sm:table-cell">
                      <span className="text-[12px] text-gray-400 flex items-center justify-end gap-1">
                        <Clock size={11} /> {order.time}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products - Takes 1 col */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">Top Products</h2>
              <p className="text-[12px] text-gray-400 mt-0.5">Best selling this month</p>
            </div>
            <button className="flex items-center gap-1 text-[12px] font-semibold text-brand-red hover:underline">
              <Eye size={13} />
            </button>
          </div>

          <div className="p-4">
            <div className="space-y-3">
              {topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[12px] font-bold ${
                    i === 0 ? 'bg-amber-50 text-amber-600' :
                    i === 1 ? 'bg-gray-100 text-gray-500' :
                    i === 2 ? 'bg-orange-50 text-orange-500' :
                    'bg-gray-50 text-gray-400'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-800 truncate">{product.name}</p>
                    <p className="text-[11px] text-gray-400">{product.sales} sales</p>
                  </div>
                  <p className="text-[12px] font-semibold text-gray-600 shrink-0">{product.revenue}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue chart placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[15px] font-bold text-gray-900">Revenue Overview</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">Monthly revenue for 2026</p>
          </div>
          <div className="flex items-center gap-2">
            {['7D', '1M', '3M', '1Y'].map((period) => (
              <button key={period}
                className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                  period === '1M' ? 'bg-brand-red text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`}>
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Chart placeholder */}
        <div className="h-64 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={22} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">Revenue Chart</p>
            <p className="text-[12px] text-gray-400 mt-0.5">Connect your analytics to see live data</p>
          </div>
        </div>
      </div>
    </div>
  )
}