import { Schema, model, Document } from 'mongoose';
import { UserRole, SubscriptionPlan, ILimits } from '@/types';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  userId: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  plan: SubscriptionPlan;
  limits: ILimits;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const limitsSchema = new Schema(
  {
    products: {
      type: {
        max: { type: Number, default: 0 },
        min: { type: Number, default: 0 },
        current: { type: Number, default: 0 },
      },
      default: { max: 10, min: 0, current: 10 },
    },
    orders: {
      type: {
        max: { type: Number, default: 0 },
        min: { type: Number, default: 0 },
        current: { type: Number, default: 0 },
      },
      default: { max: 20, min: 0, current: 20 },
    },
    apiCalls: {
      type: {
        max: { type: Number, default: 0 },
        min: { type: Number, default: 0 },
        current: { type: Number, default: 0 },
      },
      default: { max: 1000, min: 0, current: 1000 },
    },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    plan: {
      type: String,
      enum: Object.values(SubscriptionPlan),
      default: SubscriptionPlan.FREE,
      index: true,
    },
    limits: {
      type: limitsSchema,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password as string);
};

// Indexes for performance
userSchema.index({ createdAt: -1 });
userSchema.index({ email: 1, isActive: 1 });

export default model<IUser>('User', userSchema);
