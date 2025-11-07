import {
   createRider,
   deleteRider,
   fetchRiderByUserId,
   fetchRiders,
   getAssignmentsForRider,
   updateRider,
   type Rider,
} from "@/integrations/supabase/riders";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const riderKeys = {
   all: ["riders"] as const,
   lists: () => [...riderKeys.all, "list"] as const,
   list: (activeOnly = false) =>
      [...riderKeys.lists(), { activeOnly }] as const,
   byUser: (userId = "") => [...riderKeys.all, "byUser", userId] as const,
   assignments: (riderId = "") =>
      [...riderKeys.all, "assignments", riderId] as const,
};

export function useRiders(activeOnly = false) {
   return useQuery({
      queryKey: riderKeys.list(activeOnly),
      queryFn: () => fetchRiders(activeOnly),
      staleTime: 0,
      refetchOnMount: "always",
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
   });
}

export function useRiderByUserId(userId?: string) {
   return useQuery({
      queryKey: riderKeys.byUser(userId || ""),
      queryFn: async () => {
         if (!userId) return null;
         return fetchRiderByUserId(userId);
      },
      enabled: Boolean(userId),
      staleTime: 1000 * 10,
   });
}

export function useCreateRider() {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: (payload: Partial<Rider>) => createRider(payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: riderKeys.lists() }),
   });
}

export function useUpdateRider() {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: ({ riderId, updates }: any) => updateRider(riderId, updates),
      onSuccess: () => qc.invalidateQueries({ queryKey: riderKeys.lists() }),
   });
}

export function useDeleteRider() {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: (riderId: string) => deleteRider(riderId),
      onSuccess: () => qc.invalidateQueries({ queryKey: riderKeys.lists() }),
   });
}

export function useRiderAssignments(riderId?: string) {
   return useQuery({
      queryKey: riderKeys.assignments(riderId || ""),
      queryFn: () => (riderId ? getAssignmentsForRider(riderId) : []),
      enabled: Boolean(riderId),
      staleTime: 1000 * 10,
   });
}
