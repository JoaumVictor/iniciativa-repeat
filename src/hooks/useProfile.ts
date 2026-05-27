import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getMyProfile, updateMyProfile } from "@/api/profiles";
import { queryKeys } from "@/api/queryKeys";
import type { UpdateProfileInput } from "@/api/profiles";
import { isSupabaseConfigured } from "@/config/env";

export function useMyProfile() {
  return useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: getMyProfile,
    enabled: isSupabaseConfigured,
  });
}

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateMyProfile(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.me });
    },
  });
}
