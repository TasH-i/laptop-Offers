// app/api/register/route.ts

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import {
  validatePassword,
  validatePhoneNumber,
  isAdminEmail,
} from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name,
      email,
      password,
      confirmPassword,
      contactNumbers,
      addresses,
      birthday,
      gender,
    } = body

    // ── Validation ──────────────────────────────────────────

    // Required fields
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Name, email, password, and confirm password are required.' },
        { status: 400 }
      )
    }

    // Name validation
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long.' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    // Check if email is reserved for admin (admin must use Google)
    if (isAdminEmail(email)) {
      return NextResponse.json(
        { error: 'This email is reserved for admin access. Admins must sign in with Google.' },
        { status: 400 }
      )
    }

    // Password validation
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      )
    }

    // Confirm password
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match.' },
        { status: 400 }
      )
    }

    // Contact numbers validation (at least one required)
    if (!contactNumbers || !Array.isArray(contactNumbers) || contactNumbers.length === 0) {
      return NextResponse.json(
        { error: 'At least one contact number is required.' },
        { status: 400 }
      )
    }

    // Validate each phone number
    for (const phone of contactNumbers) {
      if (!phone || !phone.trim()) {
        return NextResponse.json(
          { error: 'Contact number cannot be empty.' },
          { status: 400 }
        )
      }
      if (!validatePhoneNumber(phone)) {
        return NextResponse.json(
          { error: `Invalid phone number: ${phone}. Please enter a valid Sri Lankan number.` },
          { status: 400 }
        )
      }
    }

    // Gender validation (optional but must be valid if provided)
    const validGenders = ['male', 'female', 'other', 'prefer-not-to-say']
    if (gender && !validGenders.includes(gender)) {
      return NextResponse.json(
        { error: 'Invalid gender selection.' },
        { status: 400 }
      )
    }

    // Birthday validation (optional but must be valid if provided)
    if (birthday) {
      const birthDate = new Date(birthday)
      if (isNaN(birthDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid birthday date.' },
          { status: 400 }
        )
      }
      // Must be at least 13 years old
      const thirteenYearsAgo = new Date()
      thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13)
      if (birthDate > thirteenYearsAgo) {
        return NextResponse.json(
          { error: 'You must be at least 13 years old to register.' },
          { status: 400 }
        )
      }
    }

    // ── Database operations ─────────────────────────────────

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please login instead.' },
        { status: 409 }
      )
    }

    // Hash password
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      contactNumbers: contactNumbers.map((c: string) => c.trim()),
      addresses: addresses
        ? addresses.filter((a: string) => a && a.trim()).map((a: string) => a.trim())
        : [],
      birthday: birthday ? new Date(birthday) : null,
      gender: gender || null,
      role: 'user',
      provider: 'credentials',
      isActive: true,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! You can now log in.',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Registration error:', error)

    // Handle mongoose duplicate key error
    if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 11000) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}