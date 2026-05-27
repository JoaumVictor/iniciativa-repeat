export const queryKeys = {
  profile: {
    me: ["profile", "me"] as const,
  },
  feed: {
    my: ["feed", "my"] as const,
  },
  parties: {
    all: ["parties", "all"] as const,
    favorites: ["parties", "favorites"] as const,
  },
  items: {
    all: ["items"] as const,
    detail: (id: string) => ["items", id] as const,
  },
};
