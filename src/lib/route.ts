import type {
  CategoryId,
  HuntQuery,
  LatLng,
  RankedStop,
  RoutePlan,
  Sale,
  StopRole,
} from "../types";
import { angleDegrees, driveMinutes, haversineMiles, toXY } from "./distance";
import {
  closeOn,
  formatClose,
  formatHours,
  isOpenOn,
  parseClock,
} from "./hours";
import { stopMapsUrl, routeMapsUrl } from "./maps";
import { saleMatchesCategories } from "./tags";
import { saturdayOf, sundayOf } from "./weekend";

const EARLY_CLOSE = "14:00";
const HALF_DAY_OUTLIER_MINUTES = 20;
const END_EXTENSION_MILES = 4.5;
const OPPOSITE_ANGLE = 110;
const OPPOSITE_MIN_MILES = 1.5;

export interface PartitionedSales {
  saturday: Sale[];
  sunday: Sale[];
  skipped: Sale[];
}

function isEarlyClose(sale: Sale, saturday: string): boolean {
  const close = closeOn(sale, saturday);
  if (!close) return false;
  return parseClock(close) <= parseClock(EARLY_CLOSE);
}

function isBackbone(sale: Sale, saturday: string): boolean {
  return sale.lastDay || isEarlyClose(sale, saturday);
}

function nearestNeighbor(start: LatLng, stops: Sale[]): Sale[] {
  const remaining = [...stops];
  const ordered: Sale[] = [];
  let current = start;

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDrive = Number.POSITIVE_INFINITY;
    remaining.forEach((sale, index) => {
      const minutes = driveMinutes(current, sale);
      if (minutes < bestDrive) {
        bestDrive = minutes;
        bestIdx = index;
      }
    });
    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push(next);
    current = next;
  }

  return ordered;
}

function orderMorningMust(start: LatLng, must: Sale[], saturday: string): Sale[] {
  const byClose = [...must].sort((a, b) => {
    const closeA = closeOn(a, saturday) ?? "23:59";
    const closeB = closeOn(b, saturday) ?? "23:59";
    const closeCmp = parseClock(closeA) - parseClock(closeB);
    if (closeCmp !== 0) return closeCmp;
    return driveMinutes(start, a) - driveMinutes(start, b);
  });
  return byClose;
}

function isOppositeOfSweep(
  sale: Sale,
  backbone: Sale[],
  origin: LatLng,
): boolean {
  if (backbone.length === 0) return false;

  let nearestIdx = 0;
  let nearestMiles = Number.POSITIVE_INFINITY;
  backbone.forEach((stop, index) => {
    const miles = haversineMiles(sale, stop);
    if (miles < nearestMiles) {
      nearestMiles = miles;
      nearestIdx = index;
    }
  });

  const nearest = backbone[nearestIdx];
  if (nearestIdx === backbone.length - 1) {
    return nearestMiles > END_EXTENSION_MILES;
  }

  const sweep = toXY(backbone[nearestIdx + 1], origin);
  const nearestXY = toXY(nearest, origin);
  const saleXY = toXY(sale, origin);
  const angle = angleDegrees(
    { x: sweep.x - nearestXY.x, y: sweep.y - nearestXY.y },
    { x: saleXY.x - nearestXY.x, y: saleXY.y - nearestXY.y },
  );

  return angle > OPPOSITE_ANGLE && nearestMiles > OPPOSITE_MIN_MILES;
}

function halfDayOutlier(
  sale: Sale,
  cluster: Sale[],
  saturday: string,
): boolean {
  const close = closeOn(sale, saturday);
  if (!close || parseClock(close) > parseClock("12:00")) return false;
  if (cluster.length === 0) return false;

  const centroid = {
    lat: cluster.reduce((sum, item) => sum + item.lat, 0) / cluster.length,
    lng: cluster.reduce((sum, item) => sum + item.lng, 0) / cluster.length,
  };
  return driveMinutes(sale, centroid) >= HALF_DAY_OUTLIER_MINUTES;
}

export function partitionSales(
  sales: Sale[],
  start: LatLng,
  saturday: string,
  sunday: string | undefined,
  halfDay: boolean,
): PartitionedSales {
  const openSaturday = sales.filter((sale) => isOpenOn(sale, saturday));
  const sundayOnly = sales.filter(
    (sale) => sunday && !isOpenOn(sale, saturday) && isOpenOn(sale, sunday),
  );

  const morningMust = openSaturday.filter((sale) => isEarlyClose(sale, saturday));
  const optional = openSaturday.filter((sale) => !isBackbone(sale, saturday));
  const lateLastDay = openSaturday.filter(
    (sale) => sale.lastDay && !isEarlyClose(sale, saturday),
  );

  const backbone = orderMorningMust(start, [...morningMust, ...lateLastDay], saturday);
  const leftover: Sale[] = [...sundayOnly];
  const keepOptional: Sale[] = [];

  for (const sale of optional) {
    const openSunday = Boolean(sunday && isOpenOn(sale, sunday));
    if (openSunday && isOppositeOfSweep(sale, backbone, start)) {
      leftover.push(sale);
    } else {
      keepOptional.push(sale);
    }
  }

  let saturdayPool = [...morningMust, ...lateLastDay, ...keepOptional];
  const skipped: Sale[] = [];

  if (halfDay) {
    const cluster = saturdayPool.filter((sale) => sale.id !== backbone[0]?.id);
    saturdayPool = saturdayPool.filter((sale) => {
      if (halfDayOutlier(sale, cluster, saturday)) {
        skipped.push(sale);
        return false;
      }
      return true;
    });
  }

  return { saturday: saturdayPool, sunday: leftover, skipped };
}

export function orderSaturday(start: LatLng, sales: Sale[], saturday: string): Sale[] {
  const morning = orderMorningMust(
    start,
    sales.filter((sale) => isEarlyClose(sale, saturday)),
    saturday,
  );
  const rest = sales.filter((sale) => !morning.some((item) => item.id === sale.id));
  const lastMorning = morning[morning.length - 1] ?? start;
  return [...morning, ...nearestNeighbor(lastMorning, rest)];
}

function assignRoles(sales: Sale[]): StopRole[] {
  return sales.map((_, index) => {
    if (index === 0) return "first";
    if (index === sales.length - 1 && sales.length > 1) return "last";
    return "next";
  });
}

function whyFor(
  sale: Sale,
  role: StopRole,
  saturday: string,
  kind: "saturday" | "sunday" | "skipped",
  categories: CategoryId[],
): string {
  if (kind === "skipped") {
    return "Half-day skip: early close 20+ minutes off the main cluster.";
  }
  if (kind === "sunday") {
    return "Open Sunday and off the Saturday sweep — leftover pocket.";
  }

  const close = closeOn(sale, saturday);
  const huntHits = sale.tags
    .filter((tag) => categories.includes(tag.id))
    .map((tag) => tag.label.toLowerCase());

  if (sale.lastDay && close && parseClock(close) <= parseClock("13:00")) {
    return `Last day, closes ${close === "12:00" ? "noon" : "1pm"} — go now or miss it.`;
  }
  if (sale.lastDay) {
    return huntHits.length
      ? `Last day Saturday. Listing points to ${huntHits.join(", ")}.`
      : "Last day Saturday.";
  }
  if (huntHits.length) {
    return `On the Saturday sweep. Listing points to ${huntHits.join(", ")}.`;
  }
  if (role === "last") return "Last stop on the Saturday sweep.";
  return "On the Saturday sweep.";
}

export function planRoute(
  sales: Sale[],
  query: HuntQuery,
  sourceNote: string,
): RoutePlan {
  const saturday = saturdayOf(query.windowStart, query.windowEnd);
  const sunday = sundayOf(query.windowStart, query.windowEnd);

  const inWindow = sales.filter((sale) =>
    sale.hours.some(
      (entry) => entry.date >= query.windowStart && entry.date <= query.windowEnd,
    ),
  );
  const filtered = inWindow.filter((sale) =>
    saleMatchesCategories(sale.tags, query.categories),
  );

  const parts = partitionSales(
    filtered,
    query.start,
    saturday,
    sunday,
    query.halfDay,
  );
  const ordered = orderSaturday(query.start, parts.saturday, saturday);

  const rank = (
    list: Sale[],
    kind: "saturday" | "sunday" | "skipped",
    date: string,
  ): RankedStop[] => {
    const roles = assignRoles(list);
    return list.map((sale, index) => ({
      sale,
      role: roles[index],
      why: whyFor(sale, roles[index], saturday, kind, query.categories),
      mapsUrl: stopMapsUrl(sale.address, query.startLabel),
      closeLabel: formatClose(sale, date),
      hoursLabel: formatHours(sale),
    }));
  };

  return {
    saturday: rank(ordered, "saturday", saturday),
    sunday: rank(parts.sunday, "sunday", sunday ?? saturday),
    skipped: rank(parts.skipped, "skipped", saturday),
    mapsUrl: routeMapsUrl(
      query.startLabel,
      ordered.map((sale) => sale.address),
    ),
    sourceNote,
  };
}
