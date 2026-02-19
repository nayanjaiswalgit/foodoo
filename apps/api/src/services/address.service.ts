import { type CreateAddressInput, type UpdateAddressInput } from '@food-delivery/shared';
import { Address } from '../models/address.model';
import { ApiError } from '../utils/api-error';

export const getUserAddresses = async (userId: string) => {
  return Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
};

export const createAddress = async (userId: string, data: CreateAddressInput) => {
  if (data.isDefault) {
    await Address.updateMany({ user: userId }, { isDefault: false });
  }
  return Address.create({ ...data, user: userId });
};

export const updateAddress = async (
  userId: string,
  addressId: string,
  data: UpdateAddressInput
) => {
  if (data.isDefault) {
    await Address.updateMany({ user: userId }, { isDefault: false });
  }
  const address = await Address.findOneAndUpdate(
    { _id: addressId, user: userId },
    data,
    { new: true }
  );
  if (!address) throw ApiError.notFound('Address not found');
  return address;
};

export const deleteAddress = async (userId: string, addressId: string) => {
  const result = await Address.findOneAndDelete({ _id: addressId, user: userId });
  if (!result) throw ApiError.notFound('Address not found');
};

export const setDefault = async (userId: string, addressId: string) => {
  await Address.updateMany({ user: userId }, { isDefault: false });
  const address = await Address.findOneAndUpdate(
    { _id: addressId, user: userId },
    { isDefault: true },
    { new: true }
  );
  if (!address) throw ApiError.notFound('Address not found');
  return address;
};
