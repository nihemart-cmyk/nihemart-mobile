import { supabase } from "@/integrations/supabase/client";

export interface RiderOrder {
   id: string;
   assignment_id: string;
   order_id: string;
   rider_id: string;
   order_number: string;
   customer_first_name: string;
   customer_last_name: string;
   customer_phone: string;
   customer_email: string;
   delivery_address: string;
   delivery_city: string;
   total: number;
   status: "pending" | "accepted" | "completed" | "rejected";
   assignment_status: "assigned" | "accepted" | "completed" | "rejected";
   items_count: number;
   assigned_at: string;
   accepted_at?: string;
   completed_at?: string;
   rejected_at?: string;
   items?: Array<{
      id: string;
      product_name: string;
      quantity: number;
      price: number;
   }>;
}

// Fetch all assignments for a rider with order details
export async function fetchRiderAssignments(riderId: string) {
   try {
      const { data, error, count } = await supabase
         .from("order_assignments")
         .select(
            `
            id as assignment_id,
            status as assignment_status,
            assigned_at,
            accepted_at,
            completed_at,
            rejected_at,
            order:orders(
               id,
               order_number,
               customer_first_name,
               customer_last_name,
               customer_phone,
               customer_email,
               delivery_address,
               delivery_city,
               total,
               status,
               items:order_items(id, product_name, quantity, price)
            )
         `,
            { count: "exact" }
         )
         .eq("rider_id", riderId)
         .order("assigned_at", { ascending: false });

      if (error) throw error;

      // Transform data to flat structure
      const transformedData = (data || []).map((assignment: any) => ({
         id: assignment.order?.id,
         assignment_id: assignment.assignment_id,
         order_id: assignment.order?.id,
         rider_id: riderId,
         order_number: assignment.order?.order_number,
         customer_first_name: assignment.order?.customer_first_name,
         customer_last_name: assignment.order?.customer_last_name,
         customer_phone: assignment.order?.customer_phone,
         customer_email: assignment.order?.customer_email,
         delivery_address: assignment.order?.delivery_address,
         delivery_city: assignment.order?.delivery_city,
         delivery_latitude: assignment.order?.delivery_latitude,
         delivery_longitude: assignment.order?.delivery_longitude,
         total: assignment.order?.total,
         status: assignment.order?.status,
         assignment_status: assignment.assignment_status,
         items_count: assignment.order?.items?.length || 0,
         assigned_at: assignment.assigned_at,
         accepted_at: assignment.accepted_at,
         completed_at: assignment.completed_at,
         rejected_at: assignment.rejected_at,
         items: assignment.order?.items || [],
      })) as RiderOrder[];

      return {
         data: transformedData,
         count: count || 0,
      };
   } catch (error) {
      console.error("Failed to fetch rider assignments:", error);
      throw error;
   }
}

// Accept an assignment
export async function acceptRiderAssignment(assignmentId: string) {
   try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
         .from("order_assignments")
         .update({
            status: "accepted",
            accepted_at: now,
         })
         .eq("id", assignmentId)
         .select()
         .single();

      if (error) throw error;

      // Also update the order status if needed
      if (data?.order_id) {
         await supabase
            .from("orders")
            .update({ status: "in_progress" })
            .eq("id", data.order_id);
      }

      return data;
   } catch (error) {
      console.error("Failed to accept assignment:", error);
      throw error;
   }
}

// Reject an assignment
export async function rejectRiderAssignment(assignmentId: string) {
   try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
         .from("order_assignments")
         .update({
            status: "rejected",
            rejected_at: now,
         })
         .eq("id", assignmentId)
         .select()
         .single();

      if (error) throw error;

      // Reset order status back to pending so it can be reassigned
      if (data?.order_id) {
         await supabase
            .from("orders")
            .update({ status: "pending" })
            .eq("id", data.order_id);
      }

      return data;
   } catch (error) {
      console.error("Failed to reject assignment:", error);
      throw error;
   }
}

// Complete a delivery
export async function completeRiderAssignment(assignmentId: string) {
   try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
         .from("order_assignments")
         .update({
            status: "completed",
            completed_at: now,
         })
         .eq("id", assignmentId)
         .select()
         .single();

      if (error) throw error;

      // Update order status to delivered
      if (data?.order_id) {
         await supabase
            .from("orders")
            .update({ status: "delivered", delivered_at: now })
            .eq("id", data.order_id);
      }

      return data;
   } catch (error) {
      console.error("Failed to complete assignment:", error);
      throw error;
   }
}

// Get rider statistics
export async function getRiderStats(riderId: string) {
   try {
      // Get total deliveries
      const { count: totalDeliveries, error: totalError } = await supabase
         .from("order_assignments")
         .select("id", { count: "exact", head: true })
         .eq("rider_id", riderId)
         .eq("status", "completed");

      if (totalError) throw totalError;

      // Get pending assignments
      const { count: pending, error: pendingError } = await supabase
         .from("order_assignments")
         .select("id", { count: "exact", head: true })
         .eq("rider_id", riderId)
         .eq("status", "assigned");

      if (pendingError) throw pendingError;

      // Get accepted assignments
      const { count: inProgress, error: progressError } = await supabase
         .from("order_assignments")
         .select("id", { count: "exact", head: true })
         .eq("rider_id", riderId)
         .eq("status", "accepted");

      if (progressError) throw progressError;

      return {
         totalDeliveries: totalDeliveries || 0,
         pending: pending || 0,
         inProgress: inProgress || 0,
      };
   } catch (error) {
      console.error("Failed to get rider stats:", error);
      return {
         totalDeliveries: 0,
         pending: 0,
         inProgress: 0,
      };
   }
}
