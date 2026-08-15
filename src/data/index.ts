import salem from "./cities/salem-or.json";
import type { CityPack, Sale } from "../types";
import { inferTags } from "../lib/tags";

export const CITY_PACKS: CityPack[] = [salem as CityPack];

export function hydrateCityPack(pack: CityPack): Sale[] {
  return pack.sales.map((raw) => ({
    ...raw,
    source: "demo" as const,
    tags: raw.tags?.length
      ? raw.tags
      : inferTags(`${raw.name} ${raw.description}`),
  }));
}

export function findCityPack(city?: string, zip?: string): CityPack | undefined {
  const cityNorm = city?.trim().toLowerCase();
  const zipNorm = zip?.trim();

  if (zipNorm) {
    const byZip = CITY_PACKS.find((pack) => pack.zips.includes(zipNorm));
    if (byZip) return byZip;
  }

  if (cityNorm) {
    return CITY_PACKS.find((pack) => {
      const name = pack.name.toLowerCase();
      return (
        name.includes(cityNorm) ||
        cityNorm.includes(pack.name.split(",")[0].toLowerCase()) ||
        cityNorm.includes(pack.id.replace("-", " "))
      );
    });
  }

  return CITY_PACKS[0];
}
