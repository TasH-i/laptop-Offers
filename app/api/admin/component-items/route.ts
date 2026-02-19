// app/api/admin/component-items/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import ComponentItem from '@/models/ComponentItem'
import Component from '@/models/Component'

// GET — Fetch all component items
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

    const items = await ComponentItem.find()
      .populate('component', 'componentName filterLabels')
      .populate('brand', 'brandName')
      .sort({ createdAt: -1 })

    return NextResponse.json(
      {
        success: true,
        items,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get component items error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch component items.' },
      { status: 500 }
    )
  }
}

// POST — Create a new component item
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

    // Validation
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

    // Check if slug already exists
    const existingSlug = await ComponentItem.findOne({
      slug: slug.trim().toLowerCase(),
    })
    if (existingSlug) {
      return NextResponse.json(
        { error: 'This slug is already in use. Please choose a different one.' },
        { status: 409 }
      )
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

    if (description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Description must be at least 10 characters.' },
        { status: 400 }
      )
    }

    if (!mainImage || !mainImage.trim()) {
      return NextResponse.json(
        { error: 'Main image is required.' },
        { status: 400 }
      )
    }

    // Create component item
    const newItem = await ComponentItem.create({
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
      subImages: Array.isArray(subImages) ? subImages.filter((img: string) => img && img.trim()) : [],
      isNewArrival: isNewArrival || false,
      isActive: true,
    })

    await newItem.populate('component', 'componentName filterLabels')
    await newItem.populate('brand', 'brandName')

    return NextResponse.json(
      {
        success: true,
        message: 'Component item created successfully!',
        item: newItem,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Create component item error:', error)

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
      { error: 'Failed to create component item.' },
      { status: 500 }
    )
  }
}