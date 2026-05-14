import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { polarClient } from "@polar-sh/better-auth/client";
import { magicLinkClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
    baseURL: process.env.EXPO_PUBLIC_BETTER_AUTH_URL,
    plugins: [
        expoClient({
            scheme: "mexboard",
            storagePrefix: "mexboard",
            storage: SecureStore,
        }),
      polarClient(),
      magicLinkClient()
    ]
});
