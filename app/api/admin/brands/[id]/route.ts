// app/api/admin/brands/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Brand from '@/models/Brand'
import mongoose from 'mongoose'
import { deleteFromS3, getS3KeyFromUrl } from '@/lib/s3'

// GET — Fetch a specific brand
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid brand ID.' },
        { status: 400 }
      )
    }

    const brand = await Brand.findById(id)

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        brand,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get brand error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brand.' },
      { status: 500 }
    )
  }
}

// PUT — Update a brand
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid brand ID.' },
        { status: 400 }
      )
    }

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

    // Find existing brand
    const brand = await Brand.findById(id)
    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found.' },
        { status: 404 }
      )
    }

    // Check if new brand name already exists (and is different from current)
    if (brandName.trim() !== brand.brandName) {
      const existingBrand = await Brand.findOne({
        brandName: brandName.trim(),
      })
      if (existingBrand) {
        return NextResponse.json(
          { error: 'A brand with this name already exists.' },
          { status: 409 }
        )
      }
    }

    // Delete old image if new image is different
    if (brandImage !== brand.brandImage && brand.brandImage) {
      const oldKey = getS3KeyFromUrl(brand.brandImage)
      if (oldKey) {
        try {
          await deleteFromS3(oldKey)
        } catch (err) {
          console.warn('Failed to delete old brand image from S3:', err)
        }
      }
    }

    // Update brand
    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      {
        brandName: brandName.trim(),
        brandDescription: brandDescription.trim(),
        brandImage: brandImage.trim(),
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Brand updated successfully!',
        brand: updatedBrand,
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Update brand error:', error)

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
      { error: 'Failed to update brand.' },
      { status: 500 }
    )
  }
}

// DELETE — Delete a brand
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid brand ID.' },
        { status: 400 }
      )
    }

    const brand = await Brand.findById(id)

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found.' },
        { status: 404 }
      )
    }

    // Delete image from S3
    if (brand.brandImage) {
      const s3Key = getS3KeyFromUrl(brand.brandImage)
      if (s3Key) {
        try {
          await deleteFromS3(s3Key)
        } catch (err) {
          console.warn('Failed to delete brand image from S3:', err)
        }
      }
    }

    // Delete brand from database
    await Brand.findByIdAndDelete(id)

    return NextResponse.json(
      {
        success: true,
        message: 'Brand deleted successfully!',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete brand error:', error)
    return NextResponse.json(
      { error: 'Failed to delete brand.' },
      { status: 500 }
    )
  }
}