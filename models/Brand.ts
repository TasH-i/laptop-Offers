// models/Brand.ts

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBrand extends Document {
  _id: mongoose.Types.ObjectId
  brandName: string
  brandDescription: string
  brandImage: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const BrandSchema = new Schema<IBrand>(
  {
    brandName: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Brand name must be at least 2 characters'],
      maxlength: [100, 'Brand name cannot exceed 100 characters'],
    },
    brandDescription: {
      type: String,
      required: [true, 'Brand description is required'],
      trim: true,
      minlength: [10, 'Brand description must be at least 10 characters'],
      maxlength: [500, 'Brand description cannot exceed 500 characters'],
    },
    brandImage: {
      type: String,
      required: [true, 'Brand image is required'],
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

const Brand: Model<IBrand> =
  mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema)

export default Brand