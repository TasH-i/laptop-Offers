// app/api/admin/accessories/route.ts (UPDATED - Unlimited Images)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Accessory from '@/models/Accessory'

// GET — Fetch all accessories
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

    const accessories = await Accessory.find()
      .populate('brand', 'brandName')
      .populate('category', 'categoryName')
      .sort({ createdAt: -1 })

    return NextResponse.json(
      {
        success: true,
        accessories,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get accessories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accessories.' },
      { status: 500 }
    )
  }
}

// POST — Create a new accessory
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
    const {
      accessoryName,
      slug,
      brand,
      category,
      description,
      offerPrice,
      oldPrice,
      mainImage,
      subImages,
      isNewArrival,
    } = body

    // Validation
    if (!accessoryName || !accessoryName.trim()) {
      return NextResponse.json(
        { error: 'Accessory name is required.' },
        { status: 400 }
      )
    }

    if (accessoryName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Accessory name must be at least 2 characters.' },
        { status: 400 }
      )
    }

    if (accessoryName.trim().length > 150) {
      return NextResponse.json(
        { error: 'Accessory name cannot exceed 150 characters.' },
        { status: 400 }
      )
    }

    if (!slug || !slug.trim()) {
      return NextResponse.json(
        { error: 'Slug is required.' },
        { status: 400 }
      )
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugRegex.test(slug.trim())) {
      return NextResponse.json(
        { error: 'Slug must be lowercase with hyphens only (no spaces or special characters).' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingSlug = await Accessory.findOne({
      slug: slug.trim().toLowerCase(),
    })
    if (existingSlug) {
      return NextResponse.json(
        { error: 'This slug is already in use. Please choose a different one.' },
        { status: 409 }
      )
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Description is required.' },
        { status: 400 }
      )
    }

    if (description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Description must be at least 10 characters.' },
        { status: 400 }
      )
    }

    if (description.trim().length > 1500) {
      return NextResponse.json(
        { error: 'Description cannot exceed 1500 characters.' },
        { status: 400 }
      )
    }

    if (offerPrice === undefined || offerPrice === null) {
      return NextResponse.json(
        { error: 'Offer price is required.' },
        { status: 400 }
      )
    }

    if (isNaN(offerPrice) || offerPrice < 0) {
      return NextResponse.json(
        { error: 'Offer price must be a positive number.' },
        { status: 400 }
      )
    }

    if (oldPrice !== null && oldPrice !== undefined) {
      if (isNaN(oldPrice) || oldPrice < 0) {
        return NextResponse.json(
          { error: 'Old price must be a positive number.' },
          { status: 400 }
        )
      }
    }

    if (!mainImage || !mainImage.trim()) {
      return NextResponse.json(
        { error: 'Main image is required.' },
        { status: 400 }
      )
    }

    if (!Array.isArray(subImages)) {
      return NextResponse.json(
        { error: 'Sub images must be an array.' },
        { status: 400 }
      )
    }

    // Create accessory
    const newAccessory = await Accessory.create({
      accessoryName: accessoryName.trim(),
      slug: slug.trim().toLowerCase(),
      brand: brand || null,
      category: category || null,
      description: description.trim(),
      offerPrice: parseFloat(offerPrice),
      oldPrice: oldPrice ? parseFloat(oldPrice) : undefined,
      mainImage: mainImage.trim(),
      subImages: subImages.filter((img: string) => img && img.trim()),
      isNewArrival: isNewArrival || false,
      isActive: true,
    })

    await newAccessory.populate('brand', 'brandName')
    await newAccessory.populate('category', 'categoryName')

    return NextResponse.json(
      {
        success: true,
        message: 'Accessory created successfully!',
        accessory: newAccessory,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Create accessory error:', error)

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: 'An accessory with this slug already exists.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create accessory.' },
      { status: 500 }
    )
  }
}