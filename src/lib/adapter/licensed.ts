import type { AdapterResult } from "../../types";
import type { SaleAdapter } from "./types";

export const licensedFeedAdapter: SaleAdapter = {
  id: "licensed-feed",
  label: "Licensed live feed (stub)",
  async load(): Promise<AdapterResult> {
    return {
      sales: [],
      source: "licensed-feed",
      note: "Licensed live feed is not connected. EstateSales.net has no public read API for their national directory; partner keys are for companies posting their own sales. This stub is the hook for a future licensed feed — it does not scrape EstateSales.net, Facebook, or Craigslist.",
    };
  },
};
