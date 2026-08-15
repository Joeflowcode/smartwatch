import type { AdapterResult, HuntQuery, Sale } from "../../types";
import { demoAdapter } from "./demo";
import { licensedFeedAdapter } from "./licensed";
import { userAdapter } from "./user";

export { demoAdapter } from "./demo";
export { licensedFeedAdapter } from "./licensed";
export { userAdapter, parseUserSales } from "./user";

export async function loadSales(
  query: HuntQuery,
  pasted?: string,
): Promise<AdapterResult> {
  const licensed = await licensedFeedAdapter.load(query);
  if (licensed.sales.length > 0) return licensed;

  if (pasted?.trim()) {
    const user = await userAdapter(pasted).load(query);
    if (user.sales.length > 0) return user;
    if (pasted.trim()) {
      const demo = await demoAdapter.load(query);
      return {
        ...demo,
        note: `${user.note} Falling back to demo seed. ${demo.note}`,
      };
    }
  }

  return demoAdapter.load(query);
}

export function mergeSales(results: AdapterResult[]): Sale[] {
  const seen = new Set<string>();
  const sales: Sale[] = [];
  for (const result of results) {
    for (const sale of result.sales) {
      const key = `${sale.address.toLowerCase()}|${sale.name.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      sales.push(sale);
    }
  }
  return sales;
}
