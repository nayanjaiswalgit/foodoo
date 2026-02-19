import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantApi } from '../services/restaurant.service';
import { type IMenuItem } from '@food-delivery/shared';

export function MenuPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<IMenuItem | null>(null);

  const { data: restaurant } = useQuery({
    queryKey: ['myRestaurant'],
    queryFn: restaurantApi.getMyRestaurant,
  });

  const { data: menu, isLoading } = useQuery({
    queryKey: ['menu', restaurant?._id],
    queryFn: () => restaurantApi.getMenu(restaurant._id),
    enabled: !!restaurant?._id,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: restaurantApi.getCategories,
  });

  const toggleMutation = useMutation({
    mutationFn: restaurantApi.toggleMenuItemAvailability,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: restaurantApi.deleteMenuItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu'] }),
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      price: number;
      category: string;
      isVeg: boolean;
      description: string;
    }) =>
      restaurantApi.createMenuItem(restaurant._id, {
        ...data,
        addons: [],
        variants: [],
        sortOrder: 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      setShowForm(false);
      setEditItem(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; price: number; category: string; isVeg: boolean; description: string };
    }) => restaurantApi.updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      setShowForm(false);
      setEditItem(null);
    },
  });

  const menuItems = (menu ?? []) as IMenuItem[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <button
          onClick={() => {
            setEditItem(null);
            setShowForm(!showForm);
          }}
          className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          + Add Item
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editItem ? 'Edit Item' : 'Add New Item'}</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                name: formData.get('name') as string,
                price: Number(formData.get('price')),
                category: formData.get('category') as string,
                isVeg: formData.get('isVeg') === 'true',
                description: formData.get('description') as string,
              };
              if (editItem) {
                updateMutation.mutate({ id: editItem._id, data });
              } else {
                createMutation.mutate(data);
              }
            }}
            className="grid grid-cols-2 gap-4"
          >
            <input
              name="name"
              placeholder="Item Name"
              required
              className="px-4 py-2 border border-gray-200 rounded-lg"
              defaultValue={editItem?.name}
            />
            <input
              name="price"
              type="number"
              placeholder="Price"
              required
              className="px-4 py-2 border border-gray-200 rounded-lg"
              defaultValue={editItem?.price}
            />
            <select
              name="category"
              required
              className="px-4 py-2 border border-gray-200 rounded-lg"
            >
              {(categories ?? []).map((cat: { _id: string; name: string }) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select name="isVeg" className="px-4 py-2 border border-gray-200 rounded-lg">
              <option value="true">Vegetarian</option>
              <option value="false">Non-Vegetarian</option>
            </select>
            <textarea
              name="description"
              placeholder="Description"
              className="col-span-2 px-4 py-2 border border-gray-200 rounded-lg"
              defaultValue={editItem?.description}
            />
            <div className="col-span-2 flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-200 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading menu...</div>
      ) : menuItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No menu items yet. Add your first item!
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50">
                <th className="px-6 py-3 font-medium">Item</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Available</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => (
                <tr key={item._id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.description}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">₹{item.price}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleMutation.mutate(item._id)}
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        item.isAvailable ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => {
                        setEditItem(item);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${item.name}"? This cannot be undone.`)) {
                          deleteMutation.mutate(item._id);
                        }
                      }}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
