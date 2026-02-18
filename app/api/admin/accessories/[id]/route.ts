// app/api/admin/accessories/[id]/route.ts (UPDATED - Unlimited Images)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Accessory from '@/models/Accessory'
import mongoose from 'mongoose'
import { deleteFromS3, getS3KeyFromUrl } from '@/lib/s3'

// GET — Fetch a specific accessory
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
        { error: 'Invalid accessory ID.' },
        { status: 400 }
      )
    }

    const accessory = await Accessory.findById(id)
      .populate('brand', 'brandName')
      .populate('category', 'categoryName')

    if (!accessory) {
      return NextResponse.json(
        { error: 'Accessory not found.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        accessory,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get accessory error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accessory.' },
      { status: 500 }
    )
  }
}

// PUT — Update an accessory
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
        { error: 'Invalid accessory ID.' },
        { status: 400 }
      )
    }

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
        { error: 'Slug must be lowercase with hyphens only.' },
        { status: 400 }
      )
    }

    // Find existing accessory
    const accessory = await Accessory.findById(id)
    if (!accessory) {
      return NextResponse.json(
        { error: 'Accessory not found.' },
        { status: 404 }
      )
    }

    // Check if new slug already exists (and is different from current)
    if (slug.trim().toLowerCase() !== accessory.slug) {
      const existingSlug = await Accessory.findOne({
        slug: slug.trim().toLowerCase(),
      })
      if (existingSlug) {
        return NextResponse.json(
          { error: 'This slug is already in use. Please choose a different one.' },
          { status: 409 }
        )
      }
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

    // Delete old main image if changed
    if (mainImage !== accessory.mainImage && accessory.mainImage) {
      const oldKey = getS3KeyFromUrl(accessory.mainImage)
      if (oldKey) {
        try {
          await deleteFromS3(oldKey)
        } catch (err) {
          console.warn('Failed to delete old main image from S3:', err)
        }
      }
    }

    // Delete old sub images if changed
    if (Array.isArray(subImages)) {
      const oldSubImages = accessory.subImages || []
      const newSubImages = subImages.filter((img: string) => img && img.trim())
      const imagesToDelete = oldSubImages.filter(
        (oldImg) => !newSubImages.includes(oldImg)
      )

      for (const oldImg of imagesToDelete) {
        const oldKey = getS3KeyFromUrl(oldImg)
        if (oldKey) {
          try {
            await deleteFromS3(oldKey)
          } catch (err) {
            console.warn('Failed to delete old sub image from S3:', err)
          }
        }
      }
    }

    // Update accessory
    const updatedAccessory = await Accessory.findByIdAndUpdate(
      id,
      {
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
      },
      { new: true, runValidators: true }
    )
      .populate('brand', 'brandName')
      .populate('category', 'categoryName')

    return NextResponse.json(
      {
        success: true,
        message: 'Accessory updated successfully!',
        accessory: updatedAccessory,
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Update accessory error:', error)

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
      { error: 'Failed to update accessory.' },
      { status: 500 }
    )
  }
}

// DELETE — Delete an accessory
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
        { error: 'Invalid accessory ID.' },
        { status: 400 }
      )
    }

    const accessory = await Accessory.findById(id)

    if (!accessory) {
      return NextResponse.json(
        { error: 'Accessory not found.' },
        { status: 404 }
      )
    }

    // Delete main image from S3
    if (accessory.mainImage) {
      const s3Key = getS3KeyFromUrl(accessory.mainImage)
      if (s3Key) {
        try {
          await deleteFromS3(s3Key)
        } catch (err) {
          console.warn('Failed to delete main image from S3:', err)
        }
      }
    }

    // Delete all sub images from S3
    if (accessory.subImages && Array.isArray(accessory.subImages)) {
      for (const subImage of accessory.subImages) {
        const s3Key = getS3KeyFromUrl(subImage)
        if (s3Key) {
          try {
            await deleteFromS3(s3Key)
          } catch (err) {
            console.warn('Failed to delete sub image from S3:', err)
          }
        }
      }
    }

    // Delete accessory from database
    await Accessory.findByIdAndDelete(id)

    return NextResponse.json(
      {
        success: true,
        message: 'Accessory deleted successfully!',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete accessory error:', error)
    return NextResponse.json(
      { error: 'Failed to delete accessory.' },
      { status: 500 }
    )
  }
}