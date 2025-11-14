/**
 * Email utility functions for mobile app
 * Since mobile can't send emails directly, these functions call the backend API
 */

export interface OrderEmailMeta {
   order_id?: string;
   order_number?: string;
   items?: Array<{
      product_name: string;
      variation_name?: string | null;
      quantity: number;
      price: number;
      total?: number;
   }>;
   total?: number;
   currency?: string;
   customer_name?: string;
   customer_phone?: string;
   delivery_address?: string;
   delivery_time?: string;
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
   email: string,
   meta: OrderEmailMeta
): Promise<{ ok: boolean; error?: string }> {
   try {
      const apiUrl =
         process.env.EXPO_PUBLIC_API_URL ||
         process.env.EXPO_PUBLIC_SITE_URL ||
         "";

      // Try new API route first
      const endpoint = apiUrl
         ? `${apiUrl}/api/email/notify`
         : "/api/email/notify";

      const response = await fetch(endpoint, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({
            to: email,
            kind: "order_confirmation",
            meta,
         }),
      });

      if (response.ok) {
         return { ok: true };
      }

      // Fallback to old API route
      const fallbackEndpoint = apiUrl
         ? `${apiUrl}/api/orders/send-confirmation-email`
         : "/api/orders/send-confirmation-email";

      const fallbackResponse = await fetch(fallbackEndpoint, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({
            order: {
               id: meta.order_id,
               order_number: meta.order_number,
               customer_email: email,
               items: meta.items || [],
               total: meta.total || 0,
               currency: meta.currency || "RWF",
               customer_first_name: meta.customer_name,
               customer_name: meta.customer_name,
               delivery_address: meta.delivery_address,
               delivery_time: meta.delivery_time,
            },
         }),
      });

      if (fallbackResponse.ok) {
         return { ok: true };
      }

      const error = await fallbackResponse.json().catch(() => ({
         error: "Failed to send email",
      }));
      return { ok: false, error: error.error || "Failed to send email" };
   } catch (error: any) {
      console.warn("Failed to send order confirmation email:", error);
      return {
         ok: false,
         error: error?.message || "Failed to send email",
      };
   }
}

/**
 * Send order delivered email
 */
export async function sendOrderDeliveredEmail(
   email: string,
   meta: OrderEmailMeta
): Promise<{ ok: boolean; error?: string }> {
   try {
      const apiUrl =
         process.env.EXPO_PUBLIC_API_URL ||
         process.env.EXPO_PUBLIC_SITE_URL ||
         "";

      const endpoint = apiUrl
         ? `${apiUrl}/api/email/notify`
         : "/api/email/notify";

      const response = await fetch(endpoint, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({
            to: email,
            kind: "order_delivered",
            meta,
         }),
      });

      if (response.ok) {
         return { ok: true };
      }

      const error = await response.json().catch(() => ({
         error: "Failed to send email",
      }));
      return { ok: false, error: error.error || "Failed to send email" };
   } catch (error: any) {
      console.warn("Failed to send order delivered email:", error);
      return {
         ok: false,
         error: error?.message || "Failed to send email",
      };
   }
}

/**
 * Send generic email (for custom emails)
 */
export async function sendGenericEmail(
   email: string,
   subject: string,
   html: string
): Promise<{ ok: boolean; error?: string }> {
   try {
      const apiUrl =
         process.env.EXPO_PUBLIC_API_URL ||
         process.env.EXPO_PUBLIC_SITE_URL ||
         "";

      const endpoint = apiUrl
         ? `${apiUrl}/api/email/send-generic`
         : "/api/email/send-generic";

      const response = await fetch(endpoint, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({
            email,
            subject,
            html,
         }),
      });

      if (response.ok) {
         return { ok: true };
      }

      const error = await response.json().catch(() => ({
         error: "Failed to send email",
      }));
      return { ok: false, error: error.error || "Failed to send email" };
   } catch (error: any) {
      console.warn("Failed to send generic email:", error);
      return {
         ok: false,
         error: error?.message || "Failed to send email",
      };
   }
}
