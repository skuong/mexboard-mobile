import { Pressable } from "react-native";

import { useState } from "react";
import { View, TextInput, Text } from "react-native";
import { authClient } from "@/features/auth/lib/auth-client";

export function MagicLinkSignInForm() {
  const [email, setEmail] = useState("");
  const onSignIn = async () => {
    await authClient.signIn.magicLink(
      {
        email,
        callbackURL: "mexboard://",
      },
      {
        headers: {
          platform: "mobile",
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

      <Pressable
        onPress={onSignIn}
        className="p-2 border border-gray-600 bg-white"
      >
        <Text className="text-black text-center">Send a sign in link</Text>
      </Pressable>
    </View>
  );
}
