// app/api/admin/components/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Component from '@/models/Component'
import mongoose from 'mongoose'

// GET — Fetch a specific component
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
        { error: 'Invalid component ID.' },
        { status: 400 }
      )
    }

    const component = await Component.findById(id)

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        component,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get component error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch component.' },
      { status: 500 }
    )
  }
}

// PUT — Update a component
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
        { error: 'Invalid component ID.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { componentName, filterLabels } = body

    // Validation
    if (!componentName || !componentName.trim()) {
      return NextResponse.json(
        { error: 'Component name is required.' },
        { status: 400 }
      )
    }

    if (componentName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Component name must be at least 2 characters.' },
        { status: 400 }
      )
    }

    if (componentName.trim().length > 100) {
      return NextResponse.json(
        { error: 'Component name cannot exceed 100 characters.' },
        { status: 400 }
      )
    }

    if (!Array.isArray(filterLabels) || filterLabels.length === 0) {
      return NextResponse.json(
        { error: 'At least one filter label is required.' },
        { status: 400 }
      )
    }

    const cleanedLabels = filterLabels
      .filter((label: string) => label && label.trim())
      .map((label: string) => label.trim())

    if (cleanedLabels.length === 0) {
      return NextResponse.json(
        { error: 'All filter labels must be non-empty.' },
        { status: 400 }
      )
    }

    // Find existing component
    const component = await Component.findById(id)
    if (!component) {
      return NextResponse.json(
        { error: 'Component not found.' },
        { status: 404 }
      )
    }

    // Check if new component name already exists (and is different from current)
    if (componentName.trim() !== component.componentName) {
      const existingComponent = await Component.findOne({
        componentName: componentName.trim(),
      })
      if (existingComponent) {
        return NextResponse.json(
          { error: 'A component with this name already exists.' },
          { status: 409 }
        )
      }
    }

    // Update component
    const updatedComponent = await Component.findByIdAndUpdate(
      id,
      {
        componentName: componentName.trim(),
        filterLabels: cleanedLabels,
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Component updated successfully!',
        component: updatedComponent,
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Update component error:', error)

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: 'A component with this name already exists.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update component.' },
      { status: 500 }
    )
  }
}

// DELETE — Delete a component
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
        { error: 'Invalid component ID.' },
        { status: 400 }
      )
    }

    const component = await Component.findById(id)

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found.' },
        { status: 404 }
      )
    }

    // Delete component
    await Component.findByIdAndDelete(id)

    return NextResponse.json(
      {
        success: true,
        message: 'Component deleted successfully!',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete component error:', error)
    return NextResponse.json(
      { error: 'Failed to delete component.' },
      { status: 500 }
    )
  }
}