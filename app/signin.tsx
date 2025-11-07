import Colors from "@/constants/colors";
import { useAuthStore } from "@/store/auth.store";
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
      // Add Google sign-in logic here
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
                     <Image
                        source={require("@/assets/images/logo.png")}
                        className="w-32 h-32"
                        contentFit="contain"
                     />
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
                     <Text className="mx-4 text-gray-400 text-xs uppercase">
                        OR
                     </Text>
                     <View className="flex-1 h-px bg-gray-200" />
                  </View>

                  {/* Email Input */}
                  <View className="mb-4">
                     <Text className="text-textSecondary text-sm mb-2">
                        Email
                     </Text>
                     <View className="flex-row items-center bg-white border border-gray-400 rounded-xl px-4 py-3">
                        <Mail
                           size={20}
                           color={Colors.textSecondary}
                        />
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
                     <Text className="text-textSecondary text-sm mb-2">
                        Password
                     </Text>
                     <View className="flex-row items-center bg-white border border-gray-400 rounded-xl px-4 py-3">
                        <Lock
                           size={20}
                           color={Colors.textSecondary}
                        />
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
                              <EyeOff
                                 size={20}
                                 color={Colors.textSecondary}
                              />
                           ) : (
                              <Eye
                                 size={20}
                                 color={Colors.textSecondary}
                              />
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
                           {rememberMe && (
                              <Text className="text-white text-xs">✓</Text>
                           )}
                        </View>
                        <Text className="text-textSecondary text-sm">
                           Remember me
                        </Text>
                     </TouchableOpacity>
                     <TouchableOpacity
                        onPress={() => router.push("/forgot-password" as any)}
                     >
                        <Text className="text-blue-500 text-sm">
                           Forgot Password?
                        </Text>
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
