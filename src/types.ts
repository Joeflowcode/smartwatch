export const CATEGORIES = [
  { id: "electronics", label: "Electronics" },
  { id: "vintage", label: "Vintage" },
  { id: "clothing", label: "Clothing" },
  { id: "games", label: "Games / consoles" },
  { id: "crts", label: "CRTs" },
  { id: "tools", label: "Tools" },
  { id: "furniture", label: "Furniture" },
  { id: "jewelry", label: "Jewelry" },
  { id: "records", label: "Records" },
  { id: "cameras", label: "Cameras" },
  { id: "toys", label: "Toys" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export type SaleSource = "demo" | "user" | "licensed-feed";

export interface SaleTag {
  id: CategoryId;
  label: string;
  inferred: boolean;
}

export interface SaleHours {
  date: string;
  open: string;
  close: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Sale {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  hours: SaleHours[];
  lastDay: boolean;
  description: string;
  tags: SaleTag[];
  source: SaleSource;
}

export interface CityPack {
  id: string;
  name: string;
  state: string;
  kind: "seed" | "example";
  zips: string[];
  timezone: string;
  dataNote: string;
  defaultStart: {
    label: string;
    lat: number;
    lng: number;
  };
  sales: Array<
    Omit<Sale, "tags" | "source"> & {
      tags?: SaleTag[];
    }
  >;
}

export type StopRole = "first" | "next" | "last";

export interface RankedStop {
  sale: Sale;
  role: StopRole;
  why: string;
  mapsUrl: string;
  closeLabel: string;
  hoursLabel: string;
  arriveLabel?: string;
  leaveLabel?: string;
  driveLabel?: string;
  timingNote?: string;
  missed?: boolean;
  leaveByLabel?: string;
  driveMinutes?: number;
  arriveMinutes?: number;
  closeMinutes?: number;
}

export interface RoutePlan {
  saturday: RankedStop[];
  sunday: RankedStop[];
  skipped: RankedStop[];
  mapsUrl: string | null;
  sundayMapsUrl: string | null;
  sourceNote: string;
  driveSource: "osrm" | "haversine";
}

export interface HuntQuery {
  start: LatLng;
  startLabel: string;
  city?: string;
  zip?: string;
  windowStart: string;
  windowEnd: string;
  categories: CategoryId[];
  halfDay: boolean;
  departAt?: string;
  sundayDepartAt?: string;
  excludeIds?: string[];
  feedUrl?: string;
}

export interface AdapterResult {
  sales: Sale[];
  source: SaleSource;
  note: string;
  cityName?: string;
}
