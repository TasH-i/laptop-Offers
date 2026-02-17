// app/api/admin/categories/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import mongoose from 'mongoose'
import { deleteFromS3, getS3KeyFromUrl } from '@/lib/s3'

// GET — Fetch a specific category
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
        { error: 'Invalid category ID.' },
        { status: 400 }
      )
    }

    const category = await Category.findById(id)

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        category,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get category error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category.' },
      { status: 500 }
    )
  }
}

// PUT — Update a category
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
        { error: 'Invalid category ID.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { categoryName, categoryDescription, categoryImage } = body

    // Validation
    if (!categoryName || !categoryName.trim()) {
      return NextResponse.json(
        { error: 'Category name is required.' },
        { status: 400 }
      )
    }

    if (categoryName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Category name must be at least 2 characters.' },
        { status: 400 }
      )
    }

    if (categoryName.trim().length > 100) {
      return NextResponse.json(
        { error: 'Category name cannot exceed 100 characters.' },
        { status: 400 }
      )
    }

    if (!categoryDescription || !categoryDescription.trim()) {
      return NextResponse.json(
        { error: 'Category description is required.' },
        { status: 400 }
      )
    }

    if (categoryDescription.trim().length < 10) {
      return NextResponse.json(
        { error: 'Category description must be at least 10 characters.' },
        { status: 400 }
      )
    }

    if (categoryDescription.trim().length > 500) {
      return NextResponse.json(
        { error: 'Category description cannot exceed 500 characters.' },
        { status: 400 }
      )
    }

    if (!categoryImage || !categoryImage.trim()) {
      return NextResponse.json(
        { error: 'Category image URL is required.' },
        { status: 400 }
      )
    }

    // Find existing category
    const category = await Category.findById(id)
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found.' },
        { status: 404 }
      )
    }

    // Check if new category name already exists (and is different from current)
    if (categoryName.trim() !== category.categoryName) {
      const existingCategory = await Category.findOne({
        categoryName: categoryName.trim(),
      })
      if (existingCategory) {
        return NextResponse.json(
          { error: 'A category with this name already exists.' },
          { status: 409 }
        )
      }
    }

    // Delete old image if new image is different
    if (categoryImage !== category.categoryImage && category.categoryImage) {
      const oldKey = getS3KeyFromUrl(category.categoryImage)
      if (oldKey) {
        try {
          await deleteFromS3(oldKey)
        } catch (err) {
          console.warn('Failed to delete old category image from S3:', err)
        }
      }
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        categoryName: categoryName.trim(),
        categoryDescription: categoryDescription.trim(),
        categoryImage: categoryImage.trim(),
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Category updated successfully!',
        category: updatedCategory,
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Update category error:', error)

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: 'A category with this name already exists.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update category.' },
      { status: 500 }
    )
  }
}

// DELETE — Delete a category
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
        { error: 'Invalid category ID.' },
        { status: 400 }
      )
    }

    const category = await Category.findById(id)

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found.' },
        { status: 404 }
      )
    }

    // Delete image from S3
    if (category.categoryImage) {
      const s3Key = getS3KeyFromUrl(category.categoryImage)
      if (s3Key) {
        try {
          await deleteFromS3(s3Key)
        } catch (err) {
          console.warn('Failed to delete category image from S3:', err)
        }
      }
    }

    // Delete category from database
    await Category.findByIdAndDelete(id)

    return NextResponse.json(
      {
        success: true,
        message: 'Category deleted successfully!',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json(
      { error: 'Failed to delete category.' },
      { status: 500 }
    )
  }
}