import Colors from "@/constants/colors";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import * as AuthSession from "expo-auth-session";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
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

export default function SignUpScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });

  const handleSignUp = async () => {
    if (formData.password !== formData.confirmPassword) {
      Alert.alert(
        "Password mismatch",
        "Password and confirm password do not match"
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await useAuthStore
        .getState()
        .signUp(formData.fullName, formData.email, formData.password);
      if (error) {
        Alert.alert("Sign up failed", error);
      } else {
        // Mark onboarding as complete since user is signing up
        const AsyncStorage = (
          await import("@react-native-async-storage/async-storage")
        ).default;
        await AsyncStorage.setItem("hasCompletedOnboarding", "true");

        Alert.alert(
          "Sign up",
          "Account created. Please sign in with your credentials."
        );
        // Navigate to signin to allow user to sign in and persist session
        router.replace("/signin" as any);
      }
    } catch (e: any) {
      Alert.alert(
        "Sign up error",
        e?.message ?? "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
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
        Alert.alert("Google sign up failed", error.message ?? "");
        return;
      }

      const authUrl = data?.url;
      if (!authUrl) {
        Alert.alert("Google sign up failed", "No auth url returned");
        return;
      }

      await AuthSession.startAsync({ authUrl });

      // Refresh local store state from Supabase to persist session
      await useAuthStore.getState().initialize();

      // Mark onboarding as complete on successful sign up
      const AsyncStorage = (
        await import("@react-native-async-storage/async-storage")
      ).default;
      await AsyncStorage.setItem("hasCompletedOnboarding", "true");

      const signedInUser = useAuthStore.getState().user;
      if (signedInUser) {
        router.replace("/");
      }
    } catch (e: any) {
      Alert.alert("Sign up error", e?.message ?? String(e));
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
            <View className="items-center my-5">
              {/* <Image
                        source={require("@/assets/images/logo.png")}
                        className="w-28 h-28"
                        contentFit="contain"
                     /> */}
              <Text className="text-2xl font-bold text-text mt-4">
                Welcome To Nihemart!
              </Text>
            </View>

            {/* Google Sign Up Button */}
            <TouchableOpacity
              onPress={handleGoogleSignUp}
              className="flex-row items-center justify-center bg-white border border-gray-300 rounded-xl px-4 py-2 mb-4"
            >
              <Image
                source={{ uri: "https://www.google.com/favicon.ico" }}
                className="w-5 h-5 mr-3"
              />
              <Text className="text-text text-base font-medium">
                Sign up with Google
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-2">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-gray-400 text-xs uppercase">OR</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Email Input */}
            <View className="mb-2">
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

            {/* Full Name Input */}
            <View className="mb-2">
              <Text className="text-textSecondary text-sm mb-2">Username</Text>
              <View className="flex-row items-center bg-white border border-gray-400 rounded-xl px-4 py-3">
                <User size={20} color={Colors.textSecondary} />
                <TextInput
                  className="flex-1 ml-3 text-base text-text"
                  placeholder="John Doe"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.fullName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, fullName: text })
                  }
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-2">
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

            {/* Confirm Password Input */}
            <View className="mb-6">
              <Text className="text-textSecondary text-sm mb-2">
                Confirm Password
              </Text>
              <View className="flex-row items-center bg-white border border-gray-400 rounded-xl px-4 py-3">
                <Lock size={20} color={Colors.textSecondary} />
                <TextInput
                  className="flex-1 ml-3 text-base text-text"
                  placeholder="Confirm your password"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.confirmPassword}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      confirmPassword: text,
                    })
                  }
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={Colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              className="bg-[#FF6B35] rounded-xl py-4 items-center mb-2"
            >
              <Text className="text-white text-base font-semibold">
                {loading ? "Signing Up..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <TouchableOpacity
              onPress={() => router.push("/signin" as any)}
              className="items-center mb-4"
            >
              <Text className="text-[#FF6B35] text-sm underline">
                Have an account? Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
