import crypto from 'crypto';
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

/** Hash a refresh token before storing in DB so a DB breach doesn't leak usable tokens */
const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
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
  await User.findByIdAndUpdate(user._id, { refreshToken: hashToken(tokens.refreshToken) });

  return { user: user.toJSON(), tokens };
};

export const login = async (input: LoginInput) => {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  if (!user) throw ApiError.unauthorized('Invalid credentials');

  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) throw ApiError.unauthorized('Invalid credentials');

  if (!user.isActive) throw ApiError.forbidden('Account is deactivated');

  const tokens = generateTokens(user._id.toString(), user.role);
  await User.findByIdAndUpdate(user._id, { refreshToken: hashToken(tokens.refreshToken) });

  return { user: user.toJSON(), tokens };
};

export const sendOtp = async (phone: string) => {
  const user = await User.findOne({ phone });
  if (!user) throw ApiError.notFound('User not found');

  // Check OTP rate limit: don't allow another OTP if last one was sent <60s ago
  if (user.otpExpiry && user.otpExpiry.getTime() - 4 * 60 * 1000 > Date.now()) {
    throw ApiError.badRequest('Please wait before requesting another OTP');
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  await User.findByIdAndUpdate(user._id, { otp, otpExpiry, otpAttempts: 0 });

  if (env.NODE_ENV === 'development') {
    console.log(`OTP for ${phone}: ${otp}`);
  }
  // In production, send OTP via SMS service (Twilio, etc.)

  return { message: 'OTP sent successfully' };
};

export const verifyOtp = async (phone: string, otp: string) => {
  const user = await User.findOne({ phone }).select('+otp +otpExpiry +otpAttempts');
  if (!user) throw ApiError.notFound('User not found');
  if (!user.otp || !user.otpExpiry) throw ApiError.badRequest('No OTP requested');
  if (user.otpExpiry < new Date()) {
    // Clear expired OTP
    await User.findByIdAndUpdate(user._id, { otp: undefined, otpExpiry: undefined, otpAttempts: 0 });
    throw ApiError.badRequest('OTP expired');
  }

  // Rate limit OTP verification attempts
  const attempts = (user as any).otpAttempts ?? 0;
  if (attempts >= 5) {
    await User.findByIdAndUpdate(user._id, { otp: undefined, otpExpiry: undefined, otpAttempts: 0 });
    throw ApiError.badRequest('Too many failed attempts. Request a new OTP.');
  }

  if (user.otp !== otp) {
    await User.findByIdAndUpdate(user._id, { $inc: { otpAttempts: 1 } });
    throw ApiError.badRequest('Invalid OTP');
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  const tokens = generateTokens(user._id.toString(), user.role);
  await User.findByIdAndUpdate(user._id, { refreshToken: hashToken(tokens.refreshToken) });

  return { user: user.toJSON(), tokens };
};

export const refreshToken = async (token: string) => {
  let decoded: { userId: string; role: UserRole };
  try {
    decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as typeof decoded;
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const user = await User.findById(decoded.userId).select('+refreshToken role');
  if (!user) throw ApiError.unauthorized('Invalid refresh token');

  // Compare hashed tokens
  const hashedIncoming = hashToken(token);
  if (user.refreshToken !== hashedIncoming) {
    // Possible token reuse attack — invalidate all sessions
    await User.findByIdAndUpdate(user._id, { refreshToken: undefined });
    throw ApiError.unauthorized('Invalid refresh token');
  }

  // Use the CURRENT role from DB, not the stale role from the old JWT
  const tokens = generateTokens(user._id.toString(), user.role);
  user.refreshToken = hashToken(tokens.refreshToken);
  await user.save();

  return { tokens };
};

export const logout = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { refreshToken: undefined });
};
