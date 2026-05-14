import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useState } from "react";
import { View, TextInput, Text } from "react-native";
import { authClient } from "@/features/auth/lib/auth-client";

export default function HomeScreen() {
  const { data: session } = authClient.useSession();

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
    <View className="flex justify-center flex-1">
      <SafeAreaView className="flex px-4 gap-2">
        <View className="">
          {!session && (
            <Text className="text-white text-center text-4xl">Sign In</Text>
          )}
          {session && (
            <Text className="text-white text-center text-2xl">
              Welcome, {session?.user.email.split("@")[0]}
            </Text>
          )}
        </View>

        <View className="flex flex-col gap-2 mt-16">
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
