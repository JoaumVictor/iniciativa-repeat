import { useEffect } from "react";

import { useAuthStore } from "@/store/authStore";

export function useAuthBootstrap() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);
}
