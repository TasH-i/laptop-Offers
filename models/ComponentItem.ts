// models/ComponentItem.ts

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISpecification {
  label: string
  value: string
}

export interface IFilterValue {
  filterLabel: string
  filterValue: string
}

export interface IComponentItem extends Document {
  _id: mongoose.Types.ObjectId
  itemName: string
  slug: string
  component: mongoose.Types.ObjectId // Reference to Component
  filterValues: IFilterValue[] // e.g., [{ filterLabel: "Capacity", filterValue: "512GB" }]
  brand?: mongoose.Types.ObjectId
  model: string
  unitPrice: number
  availability: 'InStock' | 'OutOfStock' | 'PreOrder'
  description: string
  specifications: ISpecification[] // e.g., [{ label: "Interface", value: "NVMe" }, ...]
  mainImage: string
  subImages: string[]
  isNewArrival: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const FilterValueSchema = new Schema<IFilterValue>(
  {
    filterLabel: {
      type: String,
      required: [true, 'Filter label is required'],
      trim: true,
    },
    filterValue: {
      type: String,
      required: [true, 'Filter value is required'],
      trim: true,
    },
  },
  { _id: false }
)

const SpecificationSchema = new Schema<ISpecification>(
  {
    label: {
      type: String,
      required: [true, 'Specification label is required'],
      trim: true,
    },
    value: {
      type: String,
      required: [true, 'Specification value is required'],
      trim: true,
    },
  },
  { _id: false }
)

const ComponentItemSchema = new Schema<IComponentItem>(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      minlength: [2, 'Item name must be at least 2 characters'],
      maxlength: [150, 'Item name cannot exceed 150 characters'],
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
    component: {
      type: mongoose.Types.ObjectId,
      ref: 'Component',
      required: [true, 'Component is required'],
    },
    filterValues: {
      type: [FilterValueSchema],
      required: [true, 'At least one filter value is required'],
      validate: {
        validator: function (val: IFilterValue[]) {
          return val && val.length > 0
        },
        message: 'At least one filter value is required',
      },
    },
    brand: {
      type: mongoose.Types.ObjectId,
      ref: 'Brand',
      default: null,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
      minlength: [2, 'Model must be at least 2 characters'],
      maxlength: [100, 'Model cannot exceed 100 characters'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price must be a positive number'],
    },
    availability: {
      type: String,
      enum: ['InStock', 'OutOfStock', 'PreOrder'],
      default: 'InStock',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    specifications: {
      type: [SpecificationSchema],
      default: [],
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

// Create indexes
ComponentItemSchema.index({ slug: 1 })
ComponentItemSchema.index({ component: 1 })

const ComponentItem: Model<IComponentItem> =
  mongoose.models.ComponentItem || mongoose.model<IComponentItem>('ComponentItem', ComponentItemSchema)

export default ComponentItem