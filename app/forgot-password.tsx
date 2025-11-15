import Colors from "@/constants/colors";
import { useAuthStore } from "@/store/auth.store";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { Mail } from "lucide-react-native";
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

export default function ForgotPasswordScreen() {
   const router = useRouter();
   const [email, setEmail] = useState("");
   const [loading, setLoading] = useState(false);
   const [successMessage, setSuccessMessage] = useState("");

   const handleSendReset = async () => {
      if (!email.trim()) {
         Alert.alert("Email required", "Please enter your email address");
         return;
      }

      setLoading(true);
      setSuccessMessage("");
      try {
         // Use the same API endpoint as web for consistency
         const { error } = await useAuthStore
            .getState()
            .requestPasswordReset(email);

         if (error) {
            Alert.alert("Request failed", error);
            return;
         }

         // Show success message
         setSuccessMessage(
            "Password reset email sent! Check your inbox and spam folder."
         );
         setEmail("");

         // Auto-navigate after 3 seconds
         setTimeout(() => {
            router.replace("/signin" as any);
         }, 3000);
      } catch (e: any) {
         Alert.alert("Error", e?.message ?? "An unexpected error occurred");
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
                     <Image
                        source={require("@/assets/images/logo.png")}
                        className="w-32 h-32"
                        contentFit="contain"
                     />
                     <Text className="text-3xl font-bold text-text mt-4">
                        Reset Password
                     </Text>
                     <Text className="text-textSecondary text-sm mt-2 text-center">
                        Enter your email to receive a password reset link
                     </Text>
                  </View>

                  {successMessage ? (
                     <View className="bg-green-50 border border-green-200 rounded-xl px-4 py-4 mb-6">
                        <Text className="text-green-700 font-semibold mb-2">
                           Success!
                        </Text>
                        <Text className="text-green-600 text-sm">
                           {successMessage}
                        </Text>
                        <Text className="text-green-600 text-xs mt-2">
                           Redirecting to sign in...
                        </Text>
                     </View>
                  ) : (
                     <>
                        {/* Email Input */}
                        <View className="mb-6">
                           <Text className="text-textSecondary text-sm mb-2">
                              Email Address
                           </Text>
                           <View className="flex-row items-center bg-white border border-gray-400 rounded-xl px-4 py-3">
                              <Mail
                                 size={20}
                                 color={Colors.textSecondary}
                              />
                              <TextInput
                                 className="flex-1 ml-3 text-base text-text"
                                 placeholder="your@email.com"
                                 placeholderTextColor={Colors.textSecondary}
                                 value={email}
                                 onChangeText={setEmail}
                                 keyboardType="email-address"
                                 autoCapitalize="none"
                                 editable={!loading}
                              />
                           </View>
                        </View>

                        {/* Send Reset Email Button */}
                        <TouchableOpacity
                           onPress={handleSendReset}
                           disabled={loading}
                           className="bg-[#FF6B35] rounded-xl py-4 items-center mb-4"
                        >
                           <Text className="text-white text-base font-semibold">
                              {loading ? "Sending..." : "Send Reset Email"}
                           </Text>
                        </TouchableOpacity>

                        {/* Additional Info */}
                        <View className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-4 mb-6">
                           <Text className="text-blue-900 text-sm font-semibold mb-2">
                              💡 Email Tips
                           </Text>
                           <Text className="text-blue-800 text-xs leading-5">
                              {`• Check your inbox for a password reset email\n• If you don't see it, check your spam folder\n• The reset link expires in 24 hours\n• Click the link to create a new password`}
                           </Text>
                        </View>
                     </>
                  )}

                  {/* Back to Sign In Link */}
                  <TouchableOpacity
                     onPress={() => router.replace("/signin" as any)}
                     className="items-center"
                  >
                     <Text className="text-[#FF6B35] text-sm underline">
                        Back to sign in
                     </Text>
                  </TouchableOpacity>
               </View>
            </ScrollView>
         </KeyboardAvoidingView>
      </>
   );
}
