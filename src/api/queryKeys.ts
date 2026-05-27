export const queryKeys = {
  items: {
    all: ["items"] as const,
    detail: (id: string) => ["items", id] as const,
  },
};
