// app/api/admin/upload-image/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { uploadToS3, deleteFromS3, getS3KeyFromUrl } from '@/lib/s3'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface UploadImageRequest {
  folder?: string // e.g., 'brands', 'categories', 'products', 'profile-images'
  deleteUrl?: string // Existing image URL to delete (optional)
}

/**
 * POST - Upload image to S3
 * 
 * Query Parameters:
 * - folder: S3 folder path (optional, default: 'uploads')
 * 
 * Request Body (FormData):
 * - image: File (required)
 * 
 * Response:
 * {
 *   success: true,
 *   imageUrl: "https://bucket.s3.region.amazonaws.com/folder/timestamp.jpg",
 *   s3Key: "folder/timestamp.jpg"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check admin authentication
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File | null
    const folder = (formData.get('folder') as string) || 'uploads'
    const deleteUrl = formData.get('deleteUrl') as string | null

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided.' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'Invalid file type. Please upload a JPG, PNG, or WebP image.',
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Image is too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Validate folder name (prevent directory traversal)
    if (!isValidFolderName(folder)) {
      return NextResponse.json(
        { error: 'Invalid folder name.' },
        { status: 400 }
      )
    }

    // Delete old image if URL provided
    if (deleteUrl) {
      try {
        const oldKey = getS3KeyFromUrl(deleteUrl)
        if (oldKey) {
          await deleteFromS3(oldKey)
        }
      } catch (err) {
        console.warn('Failed to delete old image:', err)
        // Don't fail the upload if deletion fails
      }
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique S3 key
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const s3Key = `${folder}/${timestamp}-${randomString}.${fileExtension}`

    // Upload to S3
    const imageUrl = await uploadToS3(buffer, s3Key, file.type)

    return NextResponse.json(
      {
        success: true,
        message: 'Image uploaded successfully!',
        imageUrl,
        s3Key,
        folder,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Upload image error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image. Please try again.' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Delete image from S3
 * 
 * Request Body (JSON):
 * {
 *   imageUrl: "https://bucket.s3.region.amazonaws.com/folder/image.jpg"
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Image deleted successfully.",
 *   s3Key: "folder/image.jpg"
 * }
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check admin authentication
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required.' },
        { status: 400 }
      )
    }

    // Extract S3 key from URL
    const s3Key = getS3KeyFromUrl(imageUrl)
    if (!s3Key) {
      return NextResponse.json(
        { error: 'Invalid image URL.' },
        { status: 400 }
      )
    }

    // Delete from S3
    await deleteFromS3(s3Key)

    return NextResponse.json(
      {
        success: true,
        message: 'Image deleted successfully.',
        s3Key,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json(
      { error: 'Failed to delete image. Please try again.' },
      { status: 500 }
    )
  }
}

/**
 * Validate folder name to prevent directory traversal attacks
 * Allowed: alphanumeric, hyphens, underscores only
 */
function isValidFolderName(folder: string): boolean {
  if (!folder || folder.length === 0 || folder.length > 50) {
    return false
  }
  // Match: letters, numbers, hyphens, underscores only
  return /^[a-zA-Z0-9_-]+$/.test(folder)
}