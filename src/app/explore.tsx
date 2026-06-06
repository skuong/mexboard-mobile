import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Button, Pressable, StyleSheet, Text, View } from 'react-native';

export default function App() {
	const [copiedText, setCopiedText] = useState('');

	const copyToClipboard = async () => {
		await Clipboard.setStringAsync('Wait, actually ...');
	};

	const fetchCopiedText = async () => {
		const text = await Clipboard.getStringAsync();
		setCopiedText(text);
	};

	return (
		<View style={styles.container}>
			<Button title="Click here to copy to Clipboard" onPress={copyToClipboard} />
			<Button title="View copied text" onPress={fetchCopiedText} />
			<Text className="text-blue-400">{copiedText}</Text>
			<Pressable onPress={() => setCopiedText('')} className="bg-red-400 p-2 rounded-sm">
				<Text className="text-white">Clear</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	copiedText: {
		marginTop: 10,
		color: 'red',
	},
});
