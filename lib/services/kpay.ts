/**
 * KPay Payment Gateway Service Constants
 *
 * This file provides payment method constants and utilities for mobile app
 * Supports multiple payment methods: Mobile Money (MTN, Airtel), Cards (Visa, MasterCard), SPENN
 */

export const BANK_CODES = {
   // Mobile Money
   MTN_MOMO: "63510",
   AIRTEL_MONEY: "63514",
   // Cards
   VISA_MASTERCARD: "000",
   // Digital Wallets
   SPENN: "63502",
   MOBICASH: "63501",
   // Banks
   BK: "040",
   EQUITY: "192",
   KCB: "160",
   BOA: "900",
} as const;

/**
 * Payment method configurations
 */
export const PAYMENT_METHODS = {
   mtn_momo: {
      code: "momo",
      name: "MTN Mobile Money",
      bankId: BANK_CODES.MTN_MOMO,
      icon: "📱",
   },
   airtel_money: {
      code: "momo",
      name: "Airtel Money",
      bankId: BANK_CODES.AIRTEL_MONEY,
      icon: "📱",
   },
   visa_card: {
      code: "cc",
      name: "Visa Card",
      bankId: BANK_CODES.VISA_MASTERCARD,
      icon: "💳",
   },
   mastercard: {
      code: "cc",
      name: "MasterCard",
      bankId: BANK_CODES.VISA_MASTERCARD,
      icon: "💳",
   },
   spenn: {
      code: "spenn",
      name: "SPENN",
      bankId: BANK_CODES.SPENN,
      icon: "💰",
   },
} as const;

/**
 * Format phone number for KPay API (prefers 07XXXXXXXX format)
 */
export function formatPhoneNumber(phone: string): string {
   // Remove all non-digit characters except +
   const cleaned = phone.replace(/[^\d+]/g, "");

   // If already in 07XXXXXXXX format, return as is
   if (/^07\d{8}$/.test(cleaned)) {
      return cleaned;
   }

   // If starts with +250, convert to 07XXXXXXXX
   if (cleaned.startsWith("+250")) {
      const digits = cleaned.substring(4);
      if (digits.length === 9 && digits.startsWith("7")) {
         return `0${digits}`;
      }
   }

   // If starts with 250, convert to 07XXXXXXXX
   if (cleaned.startsWith("250")) {
      const digits = cleaned.substring(3);
      if (digits.length === 9 && digits.startsWith("7")) {
         return `0${digits}`;
      }
   }

   // If 9 digits starting with 7, add 0 prefix
   if (cleaned.length === 9 && cleaned.startsWith("7")) {
      return `0${cleaned}`;
   }

   return cleaned;
}
