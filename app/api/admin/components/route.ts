// app/api/admin/components/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Component from '@/models/Component'

// GET — Fetch all components
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

    const components = await Component.find().sort({ createdAt: -1 })

    return NextResponse.json(
      {
        success: true,
        components,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get components error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch components.' },
      { status: 500 }
    )
  }
}

// POST — Create a new component
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

    // Validate each filter label
    const cleanedLabels = filterLabels
      .filter((label: string) => label && label.trim())
      .map((label: string) => label.trim())

    if (cleanedLabels.length === 0) {
      return NextResponse.json(
        { error: 'All filter labels must be non-empty.' },
        { status: 400 }
      )
    }

    // Check if component name already exists
    const existingComponent = await Component.findOne({
      componentName: componentName.trim(),
    })

    if (existingComponent) {
      return NextResponse.json(
        { error: 'A component with this name already exists.' },
        { status: 409 }
      )
    }

    // Create component
    const newComponent = await Component.create({
      componentName: componentName.trim(),
      filterLabels: cleanedLabels,
      isActive: true,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Component created successfully!',
        component: newComponent,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Create component error:', error)

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
      { error: 'Failed to create component.' },
      { status: 500 }
    )
  }
}