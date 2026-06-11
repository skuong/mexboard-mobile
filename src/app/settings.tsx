import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmailPasswordSignInSignUpForm } from '@/features/auth/components/email-password-sign-in-sign-up-form';
import { MagicLinkSignInForm } from '@/features/auth/components/magic-link-sign-in-form';
import { authClient } from '@/features/auth/lib/auth-client';

export default function Settings() {
	const { data: session } = authClient.useSession();

	return (
		<View className="flex justify-center flex-1">
			<SafeAreaView className="flex px-4 gap-2">
				<View className="mb-16">
					{!session && <Text className="text-white text-center text-4xl">Sign In</Text>}
					{session && (
						<Text className="text-white text-center text-2xl">
							Welcome, {session?.user.email.split('@')[0]}
						</Text>
					)}
				</View>

				{!session && (
					<View className="flex flex-col gap-5">
						<MagicLinkSignInForm />

						<View>
							<Text className="text-white"> -------------- OR</Text>
						</View>

						<EmailPasswordSignInSignUpForm />
					</View>
				)}

				{session && (
					<Pressable
						onPress={async () => {
							await authClient.signOut();
						}}
						className="p-2 border border-pink-600 my-6"
					>
						<Text className="text-white  text-center">Sign out</Text>
					</Pressable>
				)}
			</SafeAreaView>
		</View>
	);
}
