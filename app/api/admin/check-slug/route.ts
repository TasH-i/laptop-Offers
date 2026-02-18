// app/api/admin/check-slug/route.ts (FIXED - Only Implemented Entity Types)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Accessory from '@/models/Accessory'
import Brand from '@/models/Brand'
import Category from '@/models/Category'
import mongoose from 'mongoose'

/**
 * Universal slug checker for all admin entities
 * 
 * Request body:
 * {
 *   slug: "example-slug",
 *   entityType: "accessory" | "brand" | "category",
 *   excludeId?: "id-to-exclude" (optional, for edit mode)
 * }
 * 
 * Response:
 * {
 *   isValid: boolean,
 *   isUnique: boolean,
 *   message: string,
 *   entity: string (the entity that owns the slug if taken),
 *   conflictingEntity?: string (name of conflicting item if taken)
 * }
 */

type EntityType = 'accessory' | 'brand' | 'category'

// Map of entity types to their models
const entityModels: Record<EntityType, any> = {
  accessory: Accessory,
  brand: Brand,
  category: Category,
}

// Map of entity types to their slug field names
const slugFieldNames: Record<EntityType, string> = {
  accessory: 'slug',
  brand: 'brandName', // Brands use brandName as unique identifier
  category: 'categoryName', // Categories use categoryName as unique identifier
}

// Map of entity types to their display names
const entityDisplayNames: Record<EntityType, string> = {
  accessory: 'Accessory',
  brand: 'Brand',
  category: 'Category',
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { slug, entityType, excludeId } = await request.json()

    // Validate inputs
    if (!slug || !slug.trim()) {
      return NextResponse.json(
        {
          isValid: false,
          isUnique: false,
          message: 'Slug cannot be empty',
          entity: entityType,
        },
        { status: 200 }
      )
    }

    if (!entityType || !entityModels[entityType as EntityType]) {
      return NextResponse.json(
        {
          isValid: false,
          isUnique: false,
          message: 'Invalid entity type',
          entity: entityType,
        },
        { status: 400 }
      )
    }

    // Validate slug format based on entity type
    let isValidFormat = false
    let formatMessage = ''

    if (entityType === 'brand' || entityType === 'category') {
      // Brands and categories use names, allow more characters
      // Basic validation: at least 2 characters, no extreme special characters
      isValidFormat = slug.trim().length >= 2 && slug.trim().length <= 150
      formatMessage = slug.trim().length < 2 
        ? 'Must be at least 2 characters' 
        : 'Invalid characters'
    } else {
      // Accessories use slug format
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
      isValidFormat = slugRegex.test(slug.trim())
      formatMessage = 'Must be lowercase, alphanumeric with hyphens only'
    }

    if (!isValidFormat) {
      return NextResponse.json(
        {
          isValid: false,
          isUnique: false,
          message: formatMessage,
          entity: entityType,
        },
        { status: 200 }
      )
    }

    // Length validation
    if (slug.trim().length > 200) {
      return NextResponse.json(
        {
          isValid: false,
          isUnique: false,
          message: 'Slug cannot exceed 200 characters',
          entity: entityType,
        },
        { status: 200 }
      )
    }

    await connectDB()

    const Model = entityModels[entityType as EntityType]
    const slugField = slugFieldNames[entityType as EntityType]

    // Build query for checking uniqueness
    const searchValue = entityType === 'brand' || entityType === 'category' 
      ? slug.trim() 
      : slug.trim().toLowerCase()

    // For case-insensitive search with proper field handling
    const query: any = {}
    
    if (entityType === 'brand' || entityType === 'category') {
      // Exact match for brand/category names (case-insensitive)
      query[slugField] = new RegExp(`^${searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    } else {
      // Exact match for slugs
      query[slugField] = searchValue
    }

    // If editing, exclude the current item from the search
    if (excludeId) {
      // Validate that excludeId is a valid MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(excludeId)) {
        query._id = { $ne: new mongoose.Types.ObjectId(excludeId) }
      }
    }

    const existingItem = await Model.findOne(query)

    // If item exists, get its name for the response
    let conflictingName = null
    if (existingItem) {
      if (entityType === 'brand') {
        conflictingName = existingItem.brandName
      } else if (entityType === 'category') {
        conflictingName = existingItem.categoryName
      } else if (entityType === 'accessory') {
        conflictingName = existingItem.accessoryName
      }
    }

    // Check other entity types for slug conflicts (cross-entity check)
    let slugConflictEntity: EntityType | null = null
    let slugConflictName: string | null = null

    // Only accessories use the 'slug' field, so no cross-entity conflicts possible
    // for brands/categories since they use their own unique fields

    return NextResponse.json(
      {
        isValid: true,
        isUnique: !existingItem && !slugConflictEntity,
        message: existingItem
          ? `This ${entityDisplayNames[entityType as EntityType].toLowerCase()} name/slug is already in use`
          : slugConflictEntity
          ? `This slug is already used by a ${slugConflictEntity}`
          : 'Slug is valid and available',
        entity: entityType,
        conflictingEntity: slugConflictEntity || undefined,
        conflictingName: conflictingName || slugConflictName || undefined,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Check slug error:', error)
    return NextResponse.json(
      { error: 'Failed to validate slug.' },
      { status: 500 }
    )
  }
}