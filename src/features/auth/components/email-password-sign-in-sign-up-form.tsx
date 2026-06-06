import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { authClient } from '@/features/auth/lib/auth-client';

export function EmailPasswordSignInSignUpForm() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const onSignIn = async () => {
		await authClient.signIn.email(
			{
				email,
				password,
			},
			{
				headers: {
					platform: 'mobile',
				},
			},
		);
	};

	const onSignUp = async () => {
		await authClient.signUp.email(
			{
				name,
				email,
				password,
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
				placeholder="Name"
				value={name}
				onChangeText={setName}
				className="text-white placeholder:text-white border border-gray-600"
			/>

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

			<View className="flex gap-4 flex-row">
				<Pressable onPress={onSignIn} className="p-2 border border-gray-600 bg-white rounded-sm">
					<Text className="text-black text-center">Sign in</Text>
				</Pressable>

				<Pressable onPress={onSignUp} className="p-2 border border-gray-600 bg-white rounded-sm">
					<Text className="text-black text-center">Sign up</Text>
				</Pressable>
			</View>
		</View>
	);
}
