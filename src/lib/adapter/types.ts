import type { AdapterResult, HuntQuery } from "../../types";

export interface SaleAdapter {
  id: "demo" | "user" | "licensed-feed";
  label: string;
  load(query: HuntQuery): Promise<AdapterResult>;
}
