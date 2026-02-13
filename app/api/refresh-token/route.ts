// app/api/refresh-token/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import {
  generateRefreshToken,
  hashToken,
  getRefreshTokenExpiry,
} from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    await connectDB()

    const user = await User.findById(session.user.id).select(
      '+refreshToken +refreshTokenExpiry'
    )

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account has been deactivated.' },
        { status: 403 }
      )
    }

    // Check if current refresh token is still valid
    if (!user.refreshTokenExpiry || new Date(user.refreshTokenExpiry) <= new Date()) {
      return NextResponse.json(
        { error: 'Session expired. Please log in again.' },
        { status: 401 }
      )
    }

    // Generate new refresh token
    const newRefreshToken = generateRefreshToken()
    const hashedToken = hashToken(newRefreshToken)

    await User.findByIdAndUpdate(user._id, {
      refreshToken: hashedToken,
      refreshTokenExpiry: getRefreshTokenExpiry(),
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Token refreshed successfully.',
        expiresAt: getRefreshTokenExpiry().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh token.' },
      { status: 500 }
    )
  }
}