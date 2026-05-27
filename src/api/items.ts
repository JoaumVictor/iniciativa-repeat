import { client } from "@/api/client";
import { mockItems } from "@/mocks/items";
import { Item } from "@/types/item";

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function listItems(): Promise<Item[]> {
  if (!process.env.EXPO_PUBLIC_API_URL) {
    await wait(200);
    return mockItems;
  }

  const { data } = await client.get<Item[]>("/items");
  return data;
}

export async function getItemById(id: string): Promise<Item> {
  if (!process.env.EXPO_PUBLIC_API_URL) {
    await wait(200);
    const item = mockItems.find((entry) => entry.id === id);

    if (!item) {
      throw new Error("Item not found");
    }

    return item;
  }

  const { data } = await client.get<Item>(`/items/${id}`);
  return data;
}
