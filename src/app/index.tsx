import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { authClient } from "@/features/auth/lib/auth-client";

export default function HomeScreen() {
  const { data: session } = authClient.useSession();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async () => {
    await authClient.signIn.email({
      email,
      password,
    });
  };
  const handleSignUp = async () => {
    await authClient.signUp.email({
      email,
      password,
      name,
    });
  };

  return (
    <View className="flex justify-center flex-1">
      <SafeAreaView className="flex px-4 gap-2">
        <View className="">
          {!session && (
            <Text className="text-white border border-pink-400 text-center text-4xl">
              Log in
            </Text>
          )}
          {session && (
            <Text className="text-white border border-pink-400 text-center text-2xl">
              Welcome, {session?.user.name}
            </Text>
          )}
        </View>

        <View>
          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            className="text-white placeholder:text-white"
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            className="text-white placeholder:text-white"
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            className="text-white placeholder:text-white"
          />
          <Pressable
            onPress={handleLogin}
            className="p-2 border border-gray-600"
          >
            <Text className="text-white  text-center">Login</Text>
          </Pressable>
          <Button
            title="Sign Up"
            onPress={handleSignUp}
            className="bg-pink-600 font-bold"
          />
        </View>
        <Pressable
          onPress={async () => {
            await authClient.signOut();
          }}
          className="p-2 border border-pink-600"
        >
          <Text className="text-white  text-center">Sign out</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
