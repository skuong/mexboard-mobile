import '@/global.css';

import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { addNetworkStateListener } from 'expo-network';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

onlineManager.setEventListener((setOnline) => {
	return () =>
		addNetworkStateListener(({ isConnected }) => {
			setOnline(!!isConnected);
		});
});
const queryClient = new QueryClient();

export default function TabLayout() {
	const colorScheme = useColorScheme();

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
				<SafeAreaProvider>
					<AnimatedSplashOverlay />
					<AppTabs />
				</SafeAreaProvider>
			</ThemeProvider>
		</QueryClientProvider>
	);
}
