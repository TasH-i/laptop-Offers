// app/api/admin/categories/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'

// GET — Fetch all categories
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

    const categories = await Category.find().sort({ createdAt: -1 })

    return NextResponse.json(
      {
        success: true,
        categories,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories.' },
      { status: 500 }
    )
  }
}

// POST — Create a new category
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

    // Check if category name already exists
    const existingCategory = await Category.findOne({
      categoryName: categoryName.trim(),
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists.' },
        { status: 409 }
      )
    }

    // Create category
    const newCategory = await Category.create({
      categoryName: categoryName.trim(),
      categoryDescription: categoryDescription.trim(),
      categoryImage: categoryImage.trim(),
      isActive: true,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Category created successfully!',
        category: newCategory,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Create category error:', error)

    // Handle mongoose duplicate key error
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
      { error: 'Failed to create category.' },
      { status: 500 }
    )
  }
}