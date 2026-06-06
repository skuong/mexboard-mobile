import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { authClient } from '@/features/auth/lib/auth-client';

export function EmailPasswordSignInForm() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const onSignIn = async () => {
		await authClient.signIn.email(
			{
				email,
				password,
				callbackURL: 'mexboard://',
			},
			{
				headers: {
					platform: 'mobile',
				},
			},
		);
	};

	return (
		<View className="flex flex-col gap-2">
			<TextInput
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				className="text-white placeholder:text-white border border-gray-600"
			/>

			<TextInput
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				className="text-white placeholder:text-white border border-gray-600"
			/>

			<Pressable onPress={onSignIn} className="p-2 border border-gray-600 bg-white">
				<Text className="text-black text-center">Sign in</Text>
			</Pressable>
		</View>
	);
}
