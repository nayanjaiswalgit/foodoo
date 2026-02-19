import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../services/admin.service';

export function FeatureFlagsPage() {
  const queryClient = useQueryClient();

  const { data: flags, isLoading } = useQuery({
    queryKey: ['featureFlags'],
    queryFn: adminApi.getFeatureFlags,
  });

  const toggleMutation = useMutation({
    mutationFn: adminApi.toggleFeatureFlag,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['featureFlags'] }),
  });

  const flagEntries = flags ? Object.entries(flags as Record<string, boolean>) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Feature Flags</h1>
      <p className="text-gray-500 mb-6">Toggle features on/off for the entire platform.</p>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
          {flagEntries.map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium text-gray-900 capitalize">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-sm text-gray-500">{key}</p>
              </div>
              <button
                onClick={() => toggleMutation.mutate(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  enabled ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
