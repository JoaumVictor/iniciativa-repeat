import { formatDateLabel } from "@/utils/format";
import { Item } from "@/types/item";

const baseItems: Omit<Item, "updatedAtLabel">[] = [
  {
    id: "1",
    title: "Painel principal",
    description: "Visão resumida para começar a navegação do app.",
    status: "ativo",
    updatedAt: "2026-05-26T10:00:00.000Z",
  },
  {
    id: "2",
    title: "Fluxo de revisão",
    description: "Exemplo de registro com rota de detalhe dedicada.",
    status: "pausado",
    updatedAt: "2026-05-25T14:30:00.000Z",
  },
  {
    id: "3",
    title: "Rascunho base",
    description: "Entrada neutra para demonstrar a estrutura modular.",
    status: "rascunho",
    updatedAt: "2026-05-24T08:15:00.000Z",
  },
];

export const mockItems: Item[] = baseItems.map((item) => ({
  ...item,
  updatedAtLabel: formatDateLabel(item.updatedAt),
}));
