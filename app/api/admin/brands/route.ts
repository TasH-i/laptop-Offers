// app/api/admin/brands/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Brand from '@/models/Brand'

// GET — Fetch all brands
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    await connectDB()

    const brands = await Brand.find().sort({ createdAt: -1 })

    return NextResponse.json(
      {
        success: true,
        brands,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get brands error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brands.' },
      { status: 500 }
    )
  }
}

// POST — Create a new brand
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    await connectDB()

    const body = await request.json()
    const { brandName, brandDescription, brandImage } = body

    // Validation
    if (!brandName || !brandName.trim()) {
      return NextResponse.json(
        { error: 'Brand name is required.' },
        { status: 400 }
      )
    }

    if (brandName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Brand name must be at least 2 characters.' },
        { status: 400 }
      )
    }

    if (brandName.trim().length > 100) {
      return NextResponse.json(
        { error: 'Brand name cannot exceed 100 characters.' },
        { status: 400 }
      )
    }

    if (!brandDescription || !brandDescription.trim()) {
      return NextResponse.json(
        { error: 'Brand description is required.' },
        { status: 400 }
      )
    }

    if (brandDescription.trim().length < 10) {
      return NextResponse.json(
        { error: 'Brand description must be at least 10 characters.' },
        { status: 400 }
      )
    }

    if (brandDescription.trim().length > 500) {
      return NextResponse.json(
        { error: 'Brand description cannot exceed 500 characters.' },
        { status: 400 }
      )
    }

    if (!brandImage || !brandImage.trim()) {
      return NextResponse.json(
        { error: 'Brand image URL is required.' },
        { status: 400 }
      )
    }

    // Check if brand name already exists
    const existingBrand = await Brand.findOne({
      brandName: brandName.trim(),
    })

    if (existingBrand) {
      return NextResponse.json(
        { error: 'A brand with this name already exists.' },
        { status: 409 }
      )
    }

    // Create brand
    const newBrand = await Brand.create({
      brandName: brandName.trim(),
      brandDescription: brandDescription.trim(),
      brandImage: brandImage.trim(),
      isActive: true,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Brand created successfully!',
        brand: newBrand,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Create brand error:', error)

    // Handle mongoose duplicate key error
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: 'A brand with this name already exists.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create brand.' },
      { status: 500 }
    )
  }
}