import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ICoupon, type CreateCouponInput } from '@food-delivery/shared';
import { couponApi } from '../services/coupon.service';

interface CouponFormData {
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: string;
  minOrderAmount: string;
  maxDiscount: string;
  validFrom: string;
  validUntil: string;
  usageLimit: string;
  maxUsagePerUser: string;
  restaurant: string;
}

const emptyForm: CouponFormData = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderAmount: '0',
  maxDiscount: '',
  validFrom: '',
  validUntil: '',
  usageLimit: '',
  maxUsagePerUser: '0',
  restaurant: '',
};

function toISOString(localDatetime: string): string {
  return new Date(localDatetime).toISOString();
}

function toLocalDatetime(isoOrDate: string): string {
  const d = new Date(isoOrDate);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function CouponsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponFormData>(emptyForm);
  const [error, setError] = useState('');

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => couponApi.getAvailable(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCouponInput) => couponApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      closeModal();
    },
    onError: (err: Error) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCouponInput> }) =>
      couponApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      closeModal();
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (coupon: ICoupon) => {
    setForm({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrderAmount: String(coupon.minOrderAmount),
      maxDiscount: String(coupon.maxDiscount),
      validFrom: toLocalDatetime(coupon.validFrom),
      validUntil: toLocalDatetime(coupon.validUntil),
      usageLimit: String(coupon.usageLimit),
      maxUsagePerUser: String(coupon.maxUsagePerUser),
      restaurant: coupon.restaurant ?? '',
    });
    setEditingId(coupon._id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload: CreateCouponInput = {
      code: form.code,
      description: form.description,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount),
      maxDiscount: Number(form.maxDiscount),
      validFrom: toISOString(form.validFrom),
      validUntil: toISOString(form.validUntil),
      usageLimit: Number(form.usageLimit),
      maxUsagePerUser: Number(form.maxUsagePerUser),
      ...(form.restaurant && { restaurant: form.restaurant }),
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const updateField = (field: keyof CouponFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isExpired = (coupon: ICoupon) => new Date(coupon.validUntil) < new Date();
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          + Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Discount</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Min Order</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Usage</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Per User</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Valid Until</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No coupons found. Create one to get started.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-gray-900">{coupon.code}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{coupon.description}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}% (max ₹${coupon.maxDiscount})`
                      : `₹${coupon.discountValue}`}
                  </td>
                  <td className="px-4 py-3 text-gray-700">₹{coupon.minOrderAmount}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {coupon.usedCount}/{coupon.usageLimit}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {coupon.maxUsagePerUser > 0 ? coupon.maxUsagePerUser : 'Unlimited'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {new Date(coupon.validUntil).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {!coupon.isActive ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Inactive
                      </span>
                    ) : isExpired(coupon) ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
                        Expired
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(coupon)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(coupon._id)}
                        disabled={deleteMutation.isPending}
                        className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Coupon' : 'Create Coupon'}
            </h2>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="SAVE20"
                    required
                    disabled={!!editingId}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) => updateField('discountType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat Amount</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Get 20% off on your order"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {form.discountType === 'percentage' ? 'Discount %' : 'Discount ₹'}
                  </label>
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={(e) => updateField('discountValue', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Discount ₹
                  </label>
                  <input
                    type="number"
                    value={form.maxDiscount}
                    onChange={(e) => updateField('maxDiscount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Order ₹
                  </label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => updateField('minOrderAmount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                  <input
                    type="datetime-local"
                    value={form.validFrom}
                    onChange={(e) => updateField('validFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="datetime-local"
                    value={form.validUntil}
                    onChange={(e) => updateField('validUntil', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    value={form.usageLimit}
                    onChange={(e) => updateField('usageLimit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Per-User Limit
                  </label>
                  <input
                    type="number"
                    value={form.maxUsagePerUser}
                    onChange={(e) => updateField('maxUsagePerUser', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    min="0"
                    placeholder="0 = unlimited"
                  />
                  <p className="text-xs text-gray-400 mt-1">0 = unlimited</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant ID (optional)
                </label>
                <input
                  type="text"
                  value={form.restaurant}
                  onChange={(e) => updateField('restaurant', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Leave empty for all restaurants"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Leave empty to apply to all restaurants
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {isPending ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
