// app/api/upload-profile-image/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { uploadToS3, deleteFromS3, getS3KeyFromUrl } from '@/lib/s3'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Please log in to upload a profile image.' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File | null

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

    await connectDB()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json(
        { error: 'Account not found.' },
        { status: 404 }
      )
    }

    // Delete previous S3 image if it exists and is an S3 URL
    if (user.image) {
      const bucketDomain = `${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`
      if (user.image.includes(bucketDomain)) {
        const oldKey = getS3KeyFromUrl(user.image)
        if (oldKey) {
          try {
            await deleteFromS3(oldKey)
          } catch (err) {
            console.warn('Failed to delete old profile image from S3:', err)
          }
        }
      }
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique S3 key
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const timestamp = Date.now()
    const s3Key = `profile-images/${session.user.id}/${timestamp}.${fileExtension}`

    // Upload to S3
    const imageUrl = await uploadToS3(buffer, s3Key, file.type)

    // Update user's image URL in database
    await User.findByIdAndUpdate(session.user.id, { image: imageUrl })

    return NextResponse.json(
      {
        success: true,
        message: 'Profile image updated successfully!',
        imageUrl,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Upload profile image error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image. Please try again.' },
      { status: 500 }
    )
  }
}

// DELETE — Remove profile image
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Please log in to manage your profile image.' },
        { status: 401 }
      )
    }

    await connectDB()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json(
        { error: 'Account not found.' },
        { status: 404 }
      )
    }

    // Delete from S3 if it's an S3 image
    if (user.image) {
      const bucketDomain = `${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`
      if (user.image.includes(bucketDomain)) {
        const oldKey = getS3KeyFromUrl(user.image)
        if (oldKey) {
          try {
            await deleteFromS3(oldKey)
          } catch (err) {
            console.warn('Failed to delete image from S3:', err)
          }
        }
      }
    }

    // If user logged in via Google, revert to Google image; otherwise null
    let fallbackImage: string | null = null
    if (
      user.provider === 'google' ||
      user.provider === 'both'
    ) {
      // We don't store the original Google image separately,
      // so we set to null — the UI will show an avatar fallback.
      // If you want to restore the Google image, you'd need to
      // store it separately on first Google login.
      fallbackImage = null
    }

    await User.findByIdAndUpdate(session.user.id, { image: fallbackImage })

    return NextResponse.json(
      {
        success: true,
        message: 'Profile image removed.',
        imageUrl: fallbackImage,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete profile image error:', error)
    return NextResponse.json(
      { error: 'Failed to remove image. Please try again.' },
      { status: 500 }
    )
  }
}