import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../services/admin.service';
import { USER_ROLES } from '@food-delivery/shared';

export function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, roleFilter],
    queryFn: () => adminApi.getUsers(page, 20, roleFilter || undefined),
  });

  const toggleMutation = useMutation({
    mutationFn: adminApi.toggleUserActive,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const users = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setRoleFilter(''); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${!roleFilter ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
          >
            All
          </button>
          {USER_ROLES.map((role) => (
            <button
              key={role}
              onClick={() => { setRoleFilter(role); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${roleFilter === role ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
            >
              {role.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: Record<string, unknown>) => (
                <tr key={user._id as string} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{user.name as string}</td>
                  <td className="px-6 py-4 text-gray-500">{user.email as string}</td>
                  <td className="px-6 py-4 text-gray-500">{user.phone as string}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 capitalize">
                      {(user.role as string).replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleMutation.mutate(user._id as string)}
                      className={`text-xs font-medium ${user.isActive ? 'text-red-600' : 'text-green-600'} hover:underline`}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data?.pagination && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={!data.pagination.hasPrev} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50">Previous</button>
          <span className="px-4 py-2 text-sm text-gray-500">Page {data.pagination.page} of {data.pagination.totalPages}</span>
          <button disabled={!data.pagination.hasNext} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
