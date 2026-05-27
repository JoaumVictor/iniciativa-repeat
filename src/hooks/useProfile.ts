import { useQuery } from "@tanstack/react-query";

import { getMyProfile } from "@/api/profiles";
import { queryKeys } from "@/api/queryKeys";

export function useMyProfile() {
  return useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: getMyProfile,
  });
}
