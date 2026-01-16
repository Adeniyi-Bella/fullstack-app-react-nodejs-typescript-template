import { Schema, model, Document } from 'mongoose';
import { ProductCategory, ProductStatus } from '@/types';

export interface IProduct extends Document {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  stock: number;
  status: ProductStatus;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: 'text',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(ProductCategory),
      required: true,
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.ACTIVE,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
productSchema.index({ userId: 1, status: 1, createdAt: -1 });
productSchema.index({ category: 1, status: 1, price: 1 });
productSchema.index({ status: 1, stock: 1 });

export default model<IProduct>('Product', productSchema);