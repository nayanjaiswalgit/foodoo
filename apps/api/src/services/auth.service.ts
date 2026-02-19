import jwt from 'jsonwebtoken';
import { type RegisterInput, type LoginInput, type UserRole } from '@food-delivery/shared';
import { User } from '../models/user.model';
import { env } from '../config/env';
import { ApiError } from '../utils/api-error';

const generateTokens = (userId: string, role: UserRole) => {
  const accessToken = jwt.sign({ userId, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as any,
  });
  const refreshToken = jwt.sign({ userId, role }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as any,
  });
  return { accessToken, refreshToken };
};

export const register = async (input: RegisterInput) => {
  const existing = await User.findOne({
    $or: [{ email: input.email }, { phone: input.phone }],
  });
  if (existing) {
    throw ApiError.conflict('Email or phone already registered');
  }

  const user = await User.create({
    name: input.name,
    email: input.email,
    phone: input.phone,
    passwordHash: input.password,
    role: input.role,
  });

  const tokens = generateTokens(user._id.toString(), user.role);
  await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

  return { user: user.toJSON(), tokens };
};

export const login = async (input: LoginInput) => {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  if (!user) throw ApiError.unauthorized('Invalid credentials');

  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) throw ApiError.unauthorized('Invalid credentials');

  if (!user.isActive) throw ApiError.forbidden('Account is deactivated');

  const tokens = generateTokens(user._id.toString(), user.role);
  await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

  return { user: user.toJSON(), tokens };
};

export const sendOtp = async (phone: string) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  await User.findOneAndUpdate(
    { phone },
    { otp, otpExpiry },
    { upsert: false }
  );

  // In production, send OTP via SMS service
  console.log(`OTP for ${phone}: ${otp}`);
  return { message: 'OTP sent successfully' };
};

export const verifyOtp = async (phone: string, otp: string) => {
  const user = await User.findOne({ phone }).select('+otp +otpExpiry');
  if (!user) throw ApiError.notFound('User not found');
  if (!user.otp || !user.otpExpiry) throw ApiError.badRequest('No OTP requested');
  if (user.otpExpiry < new Date()) throw ApiError.badRequest('OTP expired');
  if (user.otp !== otp) throw ApiError.badRequest('Invalid OTP');

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  const tokens = generateTokens(user._id.toString(), user.role);
  await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

  return { user: user.toJSON(), tokens };
};

export const refreshToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as {
      userId: string;
      role: UserRole;
    };

    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const tokens = generateTokens(user._id.toString(), user.role);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return { tokens };
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }
};

export const logout = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { refreshToken: undefined });
};
