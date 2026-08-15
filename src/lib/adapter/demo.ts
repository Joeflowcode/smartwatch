import { findCityPack, hydrateCityPack } from "../../data";
import type { AdapterResult, HuntQuery } from "../../types";
import type { SaleAdapter } from "./types";

export const demoAdapter: SaleAdapter = {
  id: "demo",
  label: "Bundled demo seed",
  async load(query: HuntQuery): Promise<AdapterResult> {
    const pack = findCityPack(query.city, query.zip) ?? findCityPack();
    if (!pack) {
      return {
        sales: [],
        source: "demo",
        note: "No demo city pack is installed.",
      };
    }

    return {
      sales: hydrateCityPack(pack),
      source: "demo",
      cityName: pack.name,
      note: pack.dataNote,
    };
  },
};
