// app/api/admin/component-items/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import ComponentItem from '@/models/ComponentItem'
import mongoose from 'mongoose'
import { deleteFromS3, getS3KeyFromUrl } from '@/lib/s3'

// GET — Fetch a specific component item
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
        { error: 'Invalid component item ID.' },
        { status: 400 }
      )
    }

    const item = await ComponentItem.findById(id)
      .populate('component', 'componentName filterLabels')
      .populate('brand', 'brandName')

    if (!item) {
      return NextResponse.json(
        { error: 'Component item not found.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        item,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get component item error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch component item.' },
      { status: 500 }
    )
  }
}

// PUT — Update a component item
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
        { error: 'Invalid component item ID.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      itemName,
      slug,
      component,
      filterValues,
      brand,
      model,
      unitPrice,
      availability,
      description,
      specifications,
      mainImage,
      subImages,
      isNewArrival,
    } = body

    // Validation (same as POST)
    if (!itemName || !itemName.trim()) {
      return NextResponse.json(
        { error: 'Item name is required.' },
        { status: 400 }
      )
    }

    if (itemName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Item name must be at least 2 characters.' },
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

    // Find existing item
    const item = await ComponentItem.findById(id)
    if (!item) {
      return NextResponse.json(
        { error: 'Component item not found.' },
        { status: 404 }
      )
    }

    // Check if new slug already exists (and is different from current)
    if (slug.trim().toLowerCase() !== item.slug) {
      const existingSlug = await ComponentItem.findOne({
        slug: slug.trim().toLowerCase(),
      })
      if (existingSlug) {
        return NextResponse.json(
          { error: 'This slug is already in use. Please choose a different one.' },
          { status: 409 }
        )
      }
    }

    if (!component) {
      return NextResponse.json(
        { error: 'Component is required.' },
        { status: 400 }
      )
    }

    if (!Array.isArray(filterValues) || filterValues.length === 0) {
      return NextResponse.json(
        { error: 'At least one filter value is required.' },
        { status: 400 }
      )
    }

    if (!model || !model.trim()) {
      return NextResponse.json(
        { error: 'Model is required.' },
        { status: 400 }
      )
    }

    if (unitPrice === undefined || unitPrice === null) {
      return NextResponse.json(
        { error: 'Unit price is required.' },
        { status: 400 }
      )
    }

    if (isNaN(unitPrice) || unitPrice < 0) {
      return NextResponse.json(
        { error: 'Unit price must be a positive number.' },
        { status: 400 }
      )
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Description is required.' },
        { status: 400 }
      )
    }

    if (!mainImage || !mainImage.trim()) {
      return NextResponse.json(
        { error: 'Main image is required.' },
        { status: 400 }
      )
    }

    // Delete old main image if changed
    if (mainImage !== item.mainImage && item.mainImage) {
      const oldKey = getS3KeyFromUrl(item.mainImage)
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
      const oldSubImages = item.subImages || []
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

    // Update component item
    const updatedItem = await ComponentItem.findByIdAndUpdate(
      id,
      {
        itemName: itemName.trim(),
        slug: slug.trim().toLowerCase(),
        component,
        filterValues,
        brand: brand || null,
        model: model.trim(),
        unitPrice: parseFloat(unitPrice),
        availability: availability || 'InStock',
        description: description.trim(),
        specifications: specifications || [],
        mainImage: mainImage.trim(),
        subImages: subImages.filter((img: string) => img && img.trim()),
        isNewArrival: isNewArrival || false,
      },
      { new: true, runValidators: true }
    )
      .populate('component', 'componentName filterLabels')
      .populate('brand', 'brandName')

    return NextResponse.json(
      {
        success: true,
        message: 'Component item updated successfully!',
        item: updatedItem,
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Update component item error:', error)

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: 'An item with this slug already exists.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update component item.' },
      { status: 500 }
    )
  }
}

// DELETE — Delete a component item
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
        { error: 'Invalid component item ID.' },
        { status: 400 }
      )
    }

    const item = await ComponentItem.findById(id)

    if (!item) {
      return NextResponse.json(
        { error: 'Component item not found.' },
        { status: 404 }
      )
    }

    // Delete main image from S3
    if (item.mainImage) {
      const s3Key = getS3KeyFromUrl(item.mainImage)
      if (s3Key) {
        try {
          await deleteFromS3(s3Key)
        } catch (err) {
          console.warn('Failed to delete main image from S3:', err)
        }
      }
    }

    // Delete all sub images from S3
    if (item.subImages && Array.isArray(item.subImages)) {
      for (const subImage of item.subImages) {
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

    // Delete component item from database
    await ComponentItem.findByIdAndDelete(id)

    return NextResponse.json(
      {
        success: true,
        message: 'Component item deleted successfully!',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete component item error:', error)
    return NextResponse.json(
      { error: 'Failed to delete component item.' },
      { status: 500 }
    )
  }
}