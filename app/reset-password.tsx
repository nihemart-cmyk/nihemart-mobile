import Colors from "@/constants/colors";
import useRequireAuth from "@/hooks/useRequireAuth";
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

export default function ResetPasswordScreen() {
   const router = useRouter();
   const { loading: authLoading, user } = useRequireAuth();
   const [password, setPassword] = useState("");
   const [confirm, setConfirm] = useState("");
   const [loading, setLoading] = useState(false);

   const handleUpdate = async () => {
      if (!password || password.length < 6)
         return Alert.alert("Password must be at least 6 characters");
      if (password !== confirm) return Alert.alert("Passwords do not match");
      setLoading(true);
      try {
         // Only possible if the user has an active session (e.g., followed the reset link and is logged in)
         const { data, error } = await supabase.auth.updateUser({ password });
         if (error) {
            Alert.alert("Error", error.message || "Failed to update password");
         } else {
            Alert.alert("Success", "Your password has been updated.", [
               { text: "OK", onPress: () => router.replace("/") },
            ]);
         }
      } catch (e: any) {
         Alert.alert("Error", e?.message ?? "Unexpected error");
      } finally {
         setLoading(false);
      }
   };

   if (authLoading) return null;

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
                     Reset Password
                  </Text>

                  {!user ? (
                     <View className="w-full">
                        <Text className="text-text mb-3">
                           To change your password you must follow the link we
                           emailed to you and open it in the app (the link will
                           sign you in). If you don't get an in-app session,
                           open the link in a browser and follow the
                           instructions.
                        </Text>
                        <TouchableOpacity
                           onPress={() => router.push("/signin" as any)}
                           className="mt-4"
                        >
                           <Text className="text-[#FF6B35] underline">
                              Back to sign in
                           </Text>
                        </TouchableOpacity>
                     </View>
                  ) : (
                     <View className="w-full">
                        <Text className="text-textSecondary text-sm mb-2">
                           New password
                        </Text>
                        <TextInput
                           className="w-full bg-white border border-gray-400 rounded-xl px-4 py-3 text-base text-text mb-3"
                           placeholder="Enter new password"
                           placeholderTextColor={Colors.textSecondary}
                           value={password}
                           onChangeText={setPassword}
                           secureTextEntry
                        />

                        <Text className="text-textSecondary text-sm mb-2">
                           Confirm password
                        </Text>
                        <TextInput
                           className="w-full bg-white border border-gray-400 rounded-xl px-4 py-3 text-base text-text mb-3"
                           placeholder="Confirm new password"
                           placeholderTextColor={Colors.textSecondary}
                           value={confirm}
                           onChangeText={setConfirm}
                           secureTextEntry
                        />

                        <TouchableOpacity
                           onPress={handleUpdate}
                           disabled={loading}
                           className="bg-[#FF6B35] rounded-xl py-4 items-center mb-4"
                        >
                           <Text className="text-white text-base font-semibold">
                              {loading ? "Updating..." : "Update password"}
                           </Text>
                        </TouchableOpacity>
                     </View>
                  )}
               </View>
            </ScrollView>
         </KeyboardAvoidingView>
      </>
   );
}
