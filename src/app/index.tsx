import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

export default function App() {
	const [copiedText, setCopiedText] = useState('');
	const [clipboards, setClipboards] = useState<string[]>([]);

	const copyToClipboard = async () => {
		const text = await Clipboard.getStringAsync();
		setCopiedText(text);
	};

	useEffect(() => {
		const subscription = Clipboard.addClipboardListener(async (event) => {
			if (event.contentTypes.includes(Clipboard.ContentType.PLAIN_TEXT)) {
				const text = await Clipboard.getStringAsync();

				setClipboards((prev) => {
					if (prev.includes(text)) return prev;
					return [text, ...prev];
				});
			}
		});

		return () => subscription.remove();
	}, []);

	return (
		<View className="flex justify-center items-center h-full">
			<Button title="Click here to copy to Clipboard" onPress={copyToClipboard} />
			<Text className="text-blue-400">{copiedText}</Text>

			<View>
				{clipboards.map((clipboard) => (
					<View key={clipboard}>
						<Text className="text-white">{clipboard}</Text>
					</View>
				))}
			</View>
		</View>
	);
}
