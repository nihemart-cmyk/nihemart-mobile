// lib/utils.ts
export const formatCurrency = (amount: number, currency: string = "RWF") => {
  return new Intl.NumberFormat("en-US", {
    // style: "currency", // This adds the currency symbol, which you might not want
    // currency: "RWF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ` ${currency}`;
};