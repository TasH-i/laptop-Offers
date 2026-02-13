// app/api/account/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { validatePhoneNumber } from '@/lib/auth-utils'

// GET — Fetch current user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Please log in to view your account.' },
        { status: 401 }
      )
    }

    await connectDB()

    const user = await User.findById(session.user.id).select(
      'name email contactNumbers addresses birthday gender image role provider createdAt'
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Account not found.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          contactNumbers: user.contactNumbers || [],
          addresses: user.addresses || [],
          birthday: user.birthday
            ? user.birthday.toISOString().split('T')[0]
            : null,
          gender: user.gender || null,
          image: user.image || null,
          role: user.role,
          provider: user.provider,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get account error:', error)
    return NextResponse.json(
      { error: 'Failed to load account details.' },
      { status: 500 }
    )
  }
}

// PUT — Update user profile (email is NOT editable)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Please log in to update your account.' },
        { status: 401 }
      )
    }

    await connectDB()

    const body = await request.json()
    const { name, contactNumbers, addresses, birthday, gender } = body

    // ── Validation ──────────────────────────────────────────

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required.' },
        { status: 400 }
      )
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters.' },
        { status: 400 }
      )
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { error: 'Name cannot exceed 100 characters.' },
        { status: 400 }
      )
    }

    // Contact numbers — at least one required for credential users
    const existingUser = await User.findById(session.user.id).select('provider role')
    if (!existingUser) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 })
    }

    const isGoogleOnlyAdmin =
      existingUser.role === 'admin' && existingUser.provider === 'google'

    if (!isGoogleOnlyAdmin) {
      if (
        !contactNumbers ||
        !Array.isArray(contactNumbers) ||
        contactNumbers.filter((c: string) => c && c.trim()).length === 0
      ) {
        return NextResponse.json(
          { error: 'At least one contact number is required.' },
          { status: 400 }
        )
      }
    }

    // Validate each phone number
    if (contactNumbers && Array.isArray(contactNumbers)) {
      const validNumbers = contactNumbers.filter((c: string) => c && c.trim())
      for (const phone of validNumbers) {
        if (!validatePhoneNumber(phone)) {
          return NextResponse.json(
            {
              error: `Invalid phone number: ${phone}. Please enter a valid Sri Lankan number.`,
            },
            { status: 400 }
          )
        }
      }
    }

    // Gender validation
    const validGenders = ['male', 'female', 'other', 'prefer-not-to-say']
    if (gender && !validGenders.includes(gender)) {
      return NextResponse.json(
        { error: 'Invalid gender selection.' },
        { status: 400 }
      )
    }

    // Birthday validation
    if (birthday) {
      const birthDate = new Date(birthday)
      if (isNaN(birthDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid birthday date.' },
          { status: 400 }
        )
      }
      const thirteenYearsAgo = new Date()
      thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13)
      if (birthDate > thirteenYearsAgo) {
        return NextResponse.json(
          { error: 'You must be at least 13 years old.' },
          { status: 400 }
        )
      }
    }

    // ── Update ──────────────────────────────────────────────

    const updateData: Record<string, unknown> = {
      name: name.trim(),
      contactNumbers: contactNumbers
        ? contactNumbers
            .filter((c: string) => c && c.trim())
            .map((c: string) => c.trim())
        : [],
      addresses: addresses
        ? addresses
            .filter((a: string) => a && a.trim())
            .map((a: string) => a.trim())
        : [],
      birthday: birthday ? new Date(birthday) : null,
      gender: gender || null,
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select(
      'name email contactNumbers addresses birthday gender image role provider createdAt'
    )

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update account.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully!',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          contactNumbers: updatedUser.contactNumbers || [],
          addresses: updatedUser.addresses || [],
          birthday: updatedUser.birthday
            ? updatedUser.birthday.toISOString().split('T')[0]
            : null,
          gender: updatedUser.gender || null,
          image: updatedUser.image || null,
          role: updatedUser.role,
          provider: updatedUser.provider,
          createdAt: updatedUser.createdAt,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update account error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}