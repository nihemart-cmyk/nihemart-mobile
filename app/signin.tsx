import Colors from "@/constants/colors";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import * as AuthSession from "expo-auth-session";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignInScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await useAuthStore
        .getState()
        .signIn(formData.email, formData.password);
      if (error) {
        Alert.alert("Sign in failed", error);
      } else {
        // Reinitialize auth store to sync session and persist state
        await useAuthStore.getState().initialize();
        // success - navigate to home
        router.replace("/");
      }
    } catch (e: any) {
      Alert.alert(
        "Sign in error",
        e?.message ?? "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Use Expo AuthSession to open the OAuth flow in the system browser / proxy.
      // `makeRedirectUri({ useProxy: true })` works for Expo Go / dev. For a
      // standalone app set a custom scheme in app config and use that instead.
      const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        Alert.alert("Google sign in failed", error.message ?? "");
        return;
      }

      const authUrl = data?.url;
      if (!authUrl) {
        Alert.alert("Google sign in failed", "No auth url returned");
        return;
      }

      // Start the AuthSession; this opens the browser and returns when the
      // redirect back to the app happens (handled by expo-auth-session).
      // We don't strictly need the result here because Supabase client will
      // persist the session (AsyncStorage) on callback, but we trigger a
      // reinitialization to pick up the session immediately.
      await AuthSession.startAsync({ authUrl });

      // Refresh local store state from Supabase to persist session
      await useAuthStore.getState().initialize();

      const signedInUser = useAuthStore.getState().user;
      if (signedInUser) {
        router.replace("/");
      }
    } catch (e: any) {
      Alert.alert("Sign in error", e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6">
            {/* Logo Section */}
            <View className="items-center mt-16 mb-8">
              {/* <Image
                        source={require("@/assets/images/logo.png")}
                        className="w-32 h-32"
                        contentFit="contain"
                     /> */}
              <Text className="text-3xl font-bold text-text mt-4">
                Welcome Back !
              </Text>
            </View>

            {/* Google Sign In Button */}
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              className="flex-row items-center justify-center bg-white border border-gray-300 rounded-xl px-4 py-3 mb-4"
            >
              <Image
                source={{ uri: "https://www.google.com/favicon.ico" }}
                className="w-5 h-5 mr-3"
              />
              <Text className="text-text text-base font-medium">
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-gray-400 text-xs uppercase">OR</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-textSecondary text-sm mb-2">Email</Text>
              <View className="flex-row items-center bg-white border border-gray-400 rounded-xl px-4 py-3">
                <Mail size={20} color={Colors.textSecondary} />
                <TextInput
                  className="flex-1 ml-3 text-base text-text"
                  placeholder="admin@nihemart.com"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-textSecondary text-sm mb-2">Password</Text>
              <View className="flex-row items-center bg-white border border-gray-400 rounded-xl px-4 py-3">
                <Lock size={20} color={Colors.textSecondary} />
                <TextInput
                  className="flex-1 ml-3 text-base text-text"
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={Colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password */}
            <View className="flex-row items-center justify-between mb-6">
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  className={`w-5 h-5 rounded border-2 ${rememberMe ? "bg-primary border-primary" : "bg-white border-gray-400"} items-center justify-center mr-2`}
                >
                  {rememberMe && <Text className="text-white text-xs">✓</Text>}
                </View>
                <Text className="text-textSecondary text-sm">Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/forgot-password" as any)}
              >
                <Text className="text-blue-500 text-sm">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={loading}
              className="bg-[#FF6B35] rounded-xl py-4 items-center mb-4"
            >
              <Text className="text-white text-base font-semibold">
                {loading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <TouchableOpacity
              onPress={() => router.push("/signup" as any)}
              className="items-center"
            >
              <Text className="text-[#FF6B35] text-sm underline">
                Don't have an account? Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
