import { useQuery } from "@tanstack/react-query";

import { getItemById, listItems } from "@/api/items";
import { queryKeys } from "@/api/queryKeys";

export function useItemsQuery() {
  return useQuery({
    queryKey: queryKeys.items.all,
    queryFn: listItems,
  });
}

export function useItemQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.items.detail(id),
    queryFn: () => getItemById(id),
    enabled: Boolean(id),
  });
}
