export type Item = {
  id: string;
  title: string;
  description: string;
  status: "ativo" | "pausado" | "rascunho";
  updatedAt: string;
  updatedAtLabel: string;
};
