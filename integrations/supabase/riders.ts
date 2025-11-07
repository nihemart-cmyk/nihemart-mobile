import { supabase } from "@/integrations/supabase/client";

export interface Rider {
   id: string;
   user_id?: string | null;
   full_name?: string | null;
   phone?: string | null;
   vehicle?: string | null;
   active?: boolean;
   image_url?: string | null;
   location?: string | null;
   created_at?: string;
   updated_at?: string;
}

export async function fetchRiders(activeOnly = false) {
   let q = supabase.from("riders").select("*");
   if (activeOnly) q = q.eq("active", true);
   const { data, error } = await q.order("created_at", { ascending: false });
   if (error) throw error;
   return (data || []) as Rider[];
}

export async function fetchRiderByUserId(userId: string) {
   if (!userId) return null;
   const { data, error } = await supabase
      .from("riders")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
   if (error) throw error;
   return (data as Rider) || null;
}

export async function createRider(payload: Partial<Rider>) {
   const { data, error } = await supabase
      .from("riders")
      .insert([payload])
      .select()
      .single();
   if (error) throw error;
   return data as Rider;
}

export async function updateRider(riderId: string, updates: Partial<Rider>) {
   const { data, error } = await supabase
      .from("riders")
      .update(updates)
      .eq("id", riderId)
      .select()
      .single();
   if (error) throw error;
   return data as Rider;
}

export async function deleteRider(riderId: string) {
   const { data, error } = await supabase
      .from("riders")
      .delete()
      .eq("id", riderId)
      .select()
      .maybeSingle();
   if (error) throw error;
   return data as any;
}

export async function getAssignmentsForRider(riderId: string) {
   const { data, error } = await supabase
      .from("order_assignments")
      .select("*, orders:orders(*, items:order_items(*))")
      .eq("rider_id", riderId)
      .order("assigned_at", { ascending: false });
   if (error) throw error;
   return data as any[];
}
