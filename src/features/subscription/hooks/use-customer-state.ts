import { useQuery } from '@tanstack/react-query';
import type { Session } from 'better-auth';
import { QUERY_KEYS } from '@/constants/query-keys';
import { authClient } from '@/features/auth/lib/auth-client';

export function useCustomerState({ session }: { session: Session }) {
	return useQuery({
		queryKey: [QUERY_KEYS.POLAR_CUSTOMER_STATE],
		queryFn: async () => {
			const { data: customerState } = await authClient.customer.state();
			return customerState;
		},
		enabled: !!session,
	});
}
