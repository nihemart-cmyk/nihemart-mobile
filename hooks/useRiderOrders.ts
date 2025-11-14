import {
   acceptRiderAssignment,
   completeRiderAssignment,
   fetchRiderAssignments,
   rejectRiderAssignment,
} from "@/integrations/supabase/rider-orders";
import { useAuthStore } from "@/store/auth.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query Keys
export const riderOrderKeys = {
   all: ["rider-orders"] as const,
   lists: () => [...riderOrderKeys.all, "list"] as const,
   list: (riderId: string) => [...riderOrderKeys.lists(), riderId] as const,
   assignment: (assignmentId: string) =>
      [...riderOrderKeys.all, "assignment", assignmentId] as const,
};

// Hook for fetching rider's assigned orders
export function useRiderOrders(riderId?: string) {
   return useQuery({
      queryKey: riderOrderKeys.list(riderId || ""),
      queryFn: async () => {
         if (!riderId) return { data: [], count: 0 };
         return fetchRiderAssignments(riderId);
      },
      enabled: Boolean(riderId),
      staleTime: 1000 * 60 * 2, // 2 minutes
      refetchOnMount: "always",
      refetchOnReconnect: true,
   });
}

// Hook for accepting an assignment
export function useAcceptRiderAssignment() {
   const queryClient = useQueryClient();
   const user = useAuthStore((s) => s.user);

   return useMutation({
      mutationFn: (assignmentId: string) => acceptRiderAssignment(assignmentId),
      onSuccess: () => {
         if (user?.id) {
            queryClient.invalidateQueries({
               queryKey: riderOrderKeys.list(user.id),
            });
         }
      },
   });
}

// Hook for rejecting an assignment
export function useRejectRiderAssignment() {
   const queryClient = useQueryClient();
   const user = useAuthStore((s) => s.user);

   return useMutation({
      mutationFn: (assignmentId: string) => rejectRiderAssignment(assignmentId),
      onSuccess: () => {
         if (user?.id) {
            queryClient.invalidateQueries({
               queryKey: riderOrderKeys.list(user.id),
            });
         }
      },
   });
}

// Hook for completing a delivery
export function useCompleteRiderAssignment() {
   const queryClient = useQueryClient();
   const user = useAuthStore((s) => s.user);

   return useMutation({
      mutationFn: (assignmentId: string) =>
         completeRiderAssignment(assignmentId),
      onSuccess: () => {
         if (user?.id) {
            queryClient.invalidateQueries({
               queryKey: riderOrderKeys.list(user.id),
            });
         }
      },
   });
}
