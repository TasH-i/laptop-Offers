// models/Accessory.ts (UPDATED - Unlimited Sub Images)

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAccessory extends Document {
  _id: mongoose.Types.ObjectId
  accessoryName: string
  slug: string
  brand?: mongoose.Types.ObjectId
  category?: mongoose.Types.ObjectId
  description: string
  offerPrice: number
  oldPrice?: number
  mainImage: string
  subImages: string[]
  isNewArrival: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const AccessorySchema = new Schema<IAccessory>(
  {
    accessoryName: {
      type: String,
      required: [true, 'Accessory name is required'],
      trim: true,
      minlength: [2, 'Accessory name must be at least 2 characters'],
      maxlength: [150, 'Accessory name cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'],
      minlength: [2, 'Slug must be at least 2 characters'],
      maxlength: [200, 'Slug cannot exceed 200 characters'],
    },
    brand: {
      type: mongoose.Types.ObjectId,
      ref: 'Brand',
      default: null,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1500, 'Description cannot exceed 1500 characters'],
    },
    offerPrice: {
      type: Number,
      required: [true, 'Offer price is required'],
      min: [0, 'Offer price must be a positive number'],
    },
    oldPrice: {
      type: Number,
      min: [0, 'Old price must be a positive number'],
      default: null,
    },
    mainImage: {
      type: String,
      required: [true, 'Main image is required'],
    },
    subImages: {
      type: [String],
      default: [],
    },
    isNewArrival: {
      type: Boolean,
      default: false,
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

// Create index for slug to optimize unique lookups
AccessorySchema.index({ slug: 1 })

const Accessory: Model<IAccessory> =
  mongoose.models.Accessory || mongoose.model<IAccessory>('Accessory', AccessorySchema)

export default Accessory