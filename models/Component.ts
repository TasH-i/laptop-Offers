// models/Component.ts

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IComponent extends Document {
  _id: mongoose.Types.ObjectId
  componentName: string
  filterLabels: string[] // e.g., ["Capacity", "Speed", "Interface"]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ComponentSchema = new Schema<IComponent>(
  {
    componentName: {
      type: String,
      required: [true, 'Component name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Component name must be at least 2 characters'],
      maxlength: [100, 'Component name cannot exceed 100 characters'],
    },
    filterLabels: {
      type: [String],
      required: [true, 'At least one filter label is required'],
      validate: {
        validator: function (val: string[]) {
          return val && val.length > 0 && val.every((label) => label.trim().length > 0)
        },
        message: 'All filter labels must be non-empty strings',
      },
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

const Component: Model<IComponent> =
  mongoose.models.Component || mongoose.model<IComponent>('Component', ComponentSchema)

export default Component