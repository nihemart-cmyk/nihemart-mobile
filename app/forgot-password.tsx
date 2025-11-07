import Colors from "@/constants/colors";
import { supabase } from "@/integrations/supabase/client";
import { Stack, useRouter } from "expo-router";
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

   const handleSendReset = async () => {
      if (!email) return Alert.alert("Please enter your email");
      setLoading(true);
      try {
         const { error } = await supabase.auth.resetPasswordForEmail(email);
         if (error) {
            Alert.alert("Error", error.message || "Failed to send reset email");
         } else {
            Alert.alert(
               "Check your email",
               "If an account exists for that email, you will receive a password reset link."
            );
            router.back();
         }
      } catch (e: any) {
         Alert.alert("Error", e?.message ?? "Unexpected error");
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
               <View className="flex-1 px-6 items-center justify-center">
                  <Text className="text-2xl font-bold text-text mb-6">
                     Reset your password
                  </Text>

                  <View className="w-full mb-4">
                     <Text className="text-textSecondary text-sm mb-2">
                        Email
                     </Text>
                     <TextInput
                        className="w-full bg-white border border-gray-400 rounded-xl px-4 py-3 text-base text-text"
                        placeholder="you@example.com"
                        placeholderTextColor={Colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                     />
                  </View>

                  <TouchableOpacity
                     onPress={handleSendReset}
                     disabled={loading}
                     className="bg-[#FF6B35] rounded-xl py-4 items-center mb-4 w-full"
                  >
                     <Text className="text-white text-base font-semibold">
                        {loading ? "Sending..." : "Send reset link"}
                     </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => router.back()}>
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
