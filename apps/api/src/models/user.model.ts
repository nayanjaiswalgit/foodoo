import mongoose, { type Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, USER_ROLES } from '@food-delivery/shared';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: typeof UserRole[keyof typeof UserRole];
  avatar?: string;
  favorites: mongoose.Types.ObjectId[];
  otp?: string;
  otpExpiry?: Date;
  isVerified: boolean;
  isActive: boolean;
  refreshToken?: string;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: UserRole.CUSTOMER },
    avatar: String,
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Restaurant' }],
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.set('toJSON', {
  transform(_doc, ret: any) {
    delete ret.passwordHash;
    delete ret.otp;
    delete ret.otpExpiry;
    delete ret.refreshToken;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model<IUserDocument>('User', userSchema);
