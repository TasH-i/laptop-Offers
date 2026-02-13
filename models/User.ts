// models/User.ts

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  password?: string // Optional for Google-only users (admins)
  contactNumbers: string[]
  addresses: string[]
  birthday?: Date
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  image?: string
  role: 'user' | 'admin'
  provider: 'credentials' | 'google' | 'both'
  googleId?: string
  refreshToken?: string
  refreshTokenExpiry?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    contactNumbers: {
      type: [String],
      validate: {
        validator: function (val: string[]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const doc = this as any
          // Google users sign up without contact numbers — allow it
          if (doc.provider === 'google' || doc.provider === 'both') return true
          // Credential-based users must provide at least one
          return val && val.length >= 1
        },
        message: 'At least one contact number is required',
      },
      default: [],
    },
    addresses: {
      type: [String],
      default: [],
    },
    birthday: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say', null],
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    provider: {
      type: String,
      enum: ['credentials', 'google', 'both'],
      default: 'credentials',
    },
    googleId: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    refreshTokenExpiry: {
      type: Date,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Only index googleId — email already has unique:true which creates an index
UserSchema.index({ googleId: 1 })

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User