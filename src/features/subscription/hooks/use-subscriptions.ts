import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import { authClient } from '@/features/auth/lib/auth-client';

export function useSubscriptions() {
	return useQuery({
		queryKey: [QUERY_KEYS.POLAR_SUBSCRIPTIONS],
		queryFn: async () => {
			const { data: subscriptions } = await authClient.customer.subscriptions.list();
			return subscriptions;
		},
	});
}
