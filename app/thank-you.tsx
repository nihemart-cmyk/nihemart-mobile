import Colors from "@/constants/colors";
import Fonts from "@/constants/fonts";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react-native";

export default function ThankYouScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const phoneNumber = t("thankYou.contact.number") || "0792412177";

  const handleCall = () => {
    const raw = phoneNumber.replace(/\s/g, "");
    const normalized = raw.startsWith("0") ? `+25${raw}` : raw;
    Linking.openURL(`tel:${normalized}`).catch(() => {
      // ignore
    });
  };

  const handleWhatsapp = () => {
    const raw = phoneNumber.replace(/\s/g, "");
    const normalized = raw.startsWith("0") ? `250${raw.slice(1)}` : raw;
    const url = `https://wa.me/${normalized}`;
    Linking.openURL(url).catch(() => {
      // ignore
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-[#F3F4F6]">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Outer card */}
          <View className="bg-white rounded-3xl p-6 shadow-sm mt-8">
            {/* Gradient background + hero */}
            <View className="items-center mb-6">
              <View className="w-28 h-28 rounded-full bg-gradient-to-br from-sky-500 to-orange-500 items-center justify-center relative">
                {/* Floating glow ring */}
                <View className="absolute inset-0 rounded-full border-4 border-sky-300 opacity-40" />
                <View className="absolute inset-1 rounded-full border-2 border-orange-300 opacity-30" />
                <View className="w-20 h-20 rounded-full bg-white items-center justify-center">
                  <CheckCircle2 size={42} color={Colors.success} />
                </View>
              </View>
            </View>

            {/* Logo */}
            <View className="flex-row justify-center mb-3">
              <Text
                className="text-2xl font-bold text-sky-500"
                style={{ fontFamily: Fonts.bold }}
              >
                Nihe
              </Text>
              <Text
                className="text-2xl font-bold text-orange-500 ml-1"
                style={{ fontFamily: Fonts.bold }}
              >
                Mart
              </Text>
            </View>

            {/* Thank you text */}
            <Text
              className="text-2xl text-center mb-2"
              style={{
                fontFamily: Fonts.bold,
                backgroundColor: "transparent",
              }}
            >
              {t("thankYou.title")}
            </Text>
            <Text
              className="text-sm text-center text-gray-700 mb-5"
              style={{ fontFamily: Fonts.regular }}
            >
              {t("thankYou.orderReceived")}
            </Text>

            {/* Contact pill */}
            <View className="bg-white/60 px-4 py-3 rounded-2xl border border-sky-100 mb-6">
              <Text
                className="text-xs text-gray-600 text-center mb-2"
                style={{ fontFamily: Fonts.regular }}
              >
                {t("thankYou.contactPrompt")}
              </Text>
              <View className="flex-row items-center justify-center space-x-4">
                <TouchableOpacity onPress={handleCall} activeOpacity={0.85}>
                  <Text
                    className="text-sky-600 font-semibold text-sm"
                    style={{ fontFamily: Fonts.semiBold }}
                  >
                    {t("thankYou.contact.number")}
                  </Text>
                </TouchableOpacity>
                <Text className="text-gray-300">|</Text>
                <TouchableOpacity onPress={handleWhatsapp} activeOpacity={0.85}>
                  <Text
                    className="text-green-600 font-semibold text-sm"
                    style={{ fontFamily: Fonts.semiBold }}
                  >
                    {t("thankYou.contact.whatsapp")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Order status visual */}
            <View className="bg-gradient-to-r from-sky-50 to-orange-50 rounded-2xl p-4 mb-6 border border-sky-100">
              <View className="flex-row items-center justify-center space-x-4">
                <View className="flex-row items-center space-x-2">
                  <View className="w-3 h-3 rounded-full bg-sky-400" />
                  <Text
                    className="text-xs text-gray-700"
                    style={{ fontFamily: Fonts.medium }}
                  >
                    {t("thankYou.orderPlaced")}
                  </Text>
                </View>
                <View className="h-px w-6 bg-gradient-to-r from-sky-300 to-orange-300" />
                <View className="flex-row items-center space-x-2">
                  <View className="w-3 h-3 rounded-full bg-orange-300" />
                  <Text
                    className="text-xs text-gray-500"
                    style={{ fontFamily: Fonts.regular }}
                  >
                    {t("thankYou.processing")}
                  </Text>
                </View>
                <View className="h-px w-6 bg-gray-200" />
                <View className="flex-row items-center space-x-2">
                  <View className="w-3 h-3 rounded-full bg-gray-200" />
                  <Text
                    className="text-xs text-gray-400"
                    style={{ fontFamily: Fonts.regular }}
                  >
                    {t("thankYou.delivered")}
                  </Text>
                </View>
              </View>
            </View>

            {/* Create account / benefits */}
            <View className="bg-white/70 rounded-2xl p-4 mb-6 border border-sky-50">
              <Text
                className="text-base font-semibold text-sky-600 mb-1"
                style={{ fontFamily: Fonts.semiBold }}
              >
                {t("thankYou.createAccount.title")}
              </Text>
              <Text
                className="text-xs text-gray-600 mb-2"
                style={{ fontFamily: Fonts.regular }}
              >
                {t("thankYou.createAccount.intro")}
              </Text>
              <Text
                className="text-xs font-semibold text-gray-700 mb-1"
                style={{ fontFamily: Fonts.medium }}
              >
                {t("thankYou.createAccount.benefits.title")}
              </Text>
              <View className="mb-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Text
                    key={i}
                    className="text-xs text-gray-600 mb-1"
                    style={{ fontFamily: Fonts.regular }}
                  >
                    • {t(`thankYou.createAccount.benefits.${i}`)}
                  </Text>
                ))}
              </View>
              <View className="flex-row justify-center space-x-3">
                <TouchableOpacity
                  onPress={() => router.push("/signup" as any)}
                  activeOpacity={0.9}
                  className="px-4 py-2 rounded-lg bg-sky-500"
                >
                  <Text
                    className="text-white text-xs font-semibold"
                    style={{ fontFamily: Fonts.semiBold }}
                  >
                    {t("thankYou.createAccount.cta")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/signin" as any)}
                  activeOpacity={0.9}
                  className="px-4 py-2 rounded-lg border border-sky-200"
                >
                  <Text
                    className="text-sky-600 text-xs font-semibold"
                    style={{ fontFamily: Fonts.semiBold }}
                  >
                    {t("thankYou.createAccount.registerLink")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Refund policy */}
            <View className="mb-4">
              <Text
                className="text-xs text-gray-700 text-center font-semibold mb-1"
                style={{ fontFamily: Fonts.semiBold }}
              >
                {t("thankYou.refundPolicy.title")}
              </Text>
              <Text
                className="text-xs text-gray-600 text-center"
                style={{ fontFamily: Fonts.regular }}
              >
                {t("thankYou.refundPolicy.text")}
              </Text>
            </View>

            {/* Continue shopping button */}
            <TouchableOpacity
              onPress={() => router.push("/(tabs)" as any)}
              activeOpacity={0.92}
              className="w-full rounded-2xl overflow-hidden bg-gradient-to-r from-sky-500 to-sky-600"
            >
              <View className="px-6 py-3 items-center justify-center flex-row space-x-2">
                <Text
                  className="text-white text-sm font-semibold"
                  style={{ fontFamily: Fonts.semiBold }}
                >
                  {t("thankYou.continueShopping")}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

