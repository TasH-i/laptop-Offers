
// models/Category.ts

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId
  categoryName: string
  categoryDescription: string
  categoryImage: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>(
  {
    categoryName: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    categoryDescription: {
      type: String,
      required: [true, 'Category description is required'],
      trim: true,
      minlength: [10, 'Category description must be at least 10 characters'],
      maxlength: [500, 'Category description cannot exceed 500 characters'],
    },
    categoryImage: {
      type: String,
      required: [true, 'Category image is required'],
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

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)

export default Category