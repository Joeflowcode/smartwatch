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
  formatDrive,
  formatHours,
  isOpenOn,
  minutesToClock,
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
export const DWELL_MINUTES = 25;

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

function routeMinutes(start: LatLng, stops: Sale[]): number {
  let total = 0;
  let current = start;
  for (const stop of stops) {
    total += driveMinutes(current, stop);
    current = stop;
  }
  return total;
}

function cheapestInsert(
  start: LatLng,
  route: Sale[],
  stop: Sale,
  afterIndex: number,
): Sale[] {
  let best = [...route, stop];
  let bestCost = Number.POSITIVE_INFINITY;
  const from = Math.max(afterIndex, 0);

  for (let index = from; index <= route.length; index += 1) {
    const candidate = [...route.slice(0, index), stop, ...route.slice(index)];
    const cost = routeMinutes(start, candidate);
    if (cost < bestCost) {
      bestCost = cost;
      best = candidate;
    }
  }

  return best;
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
  const lockedAfter = morning.length;
  let route = [...morning];

  const remainingLastDay = sales
    .filter((sale) => sale.lastDay && !route.some((item) => item.id === sale.id))
    .sort((a, b) => {
      const closeA = closeOn(a, saturday) ?? "23:59";
      const closeB = closeOn(b, saturday) ?? "23:59";
      return parseClock(closeA) - parseClock(closeB);
    });

  for (const stop of remainingLastDay) {
    route = cheapestInsert(start, route, stop, lockedAfter);
  }

  const optional = sales
    .filter((sale) => !route.some((item) => item.id === sale.id))
    .sort((a, b) => {
      const closeA = closeOn(a, saturday) ?? "23:59";
      const closeB = closeOn(b, saturday) ?? "23:59";
      const closeCmp = parseClock(closeA) - parseClock(closeB);
      if (closeCmp !== 0) return closeCmp;
      const near = (sale: Sale) =>
        Math.min(
          driveMinutes(start, sale),
          ...route.map((item) => driveMinutes(item, sale)),
        );
      return near(a) - near(b);
    });

  for (const stop of optional) {
    route = cheapestInsert(start, route, stop, lockedAfter);
  }

  return route;
}

export interface StopTiming {
  arrive: number;
  leave: number;
  drive: number;
  missed: boolean;
  slack: number;
}

export function timeStops(
  start: LatLng,
  sales: Sale[],
  date: string,
  departMinutes: number,
  dwell = DWELL_MINUTES,
): StopTiming[] {
  const timings: StopTiming[] = [];
  let current = start;
  let clock = departMinutes;

  for (const sale of sales) {
    const drive = driveMinutes(current, sale);
    const arrive = clock + drive;
    const close = closeOn(sale, date);
    const closeMin = close ? parseClock(close) : 24 * 60;
    const slack = closeMin - arrive;
    timings.push({
      arrive,
      leave: arrive + dwell,
      drive,
      missed: slack < 0,
      slack,
    });
    current = sale;
    clock = arrive + dwell;
  }

  return timings;
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
  const huntHits = sale.tags
    .filter((tag) => categories.includes(tag.id))
    .map((tag) => tag.label.toLowerCase());

  if (kind === "skipped") {
    return "Half-day skip: early close 20+ minutes off the main cluster.";
  }
  if (kind === "sunday") {
    return huntHits.length
      ? `Sunday leftover pocket. Listing points to ${huntHits.join(", ")}.`
      : "Open Sunday and off the Saturday sweep — leftover pocket.";
  }

  const close = closeOn(sale, saturday);

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

function rankStops(
  list: Sale[],
  kind: "saturday" | "sunday" | "skipped",
  date: string,
  query: HuntQuery,
  saturday: string,
  departMinutes: number,
): RankedStop[] {
  const roles = assignRoles(list);
  const timings =
    kind === "skipped" ? [] : timeStops(query.start, list, date, departMinutes);

  return list.map((sale, index) => {
    const timing = timings[index];
    const tight = Boolean(timing && !timing.missed && timing.slack < 30);
    return {
      sale,
      role: roles[index],
      why: whyFor(sale, roles[index], saturday, kind, query.categories),
      mapsUrl: stopMapsUrl(sale.address, query.startLabel),
      closeLabel: formatClose(sale, date),
      hoursLabel: formatHours(sale),
      arriveLabel: timing ? `Arrive ${minutesToClock(timing.arrive)}` : undefined,
      leaveLabel: timing ? `leave ${minutesToClock(timing.leave)}` : undefined,
      driveLabel: timing ? formatDrive(timing.drive) : undefined,
      timingNote: timing?.missed
        ? "Would miss the posted close"
        : tight
          ? "Tight on the close"
          : undefined,
      missed: timing?.missed,
    };
  });
}

export function planRoute(
  sales: Sale[],
  query: HuntQuery,
  sourceNote: string,
): RoutePlan {
  const saturday = saturdayOf(query.windowStart, query.windowEnd);
  const sunday = sundayOf(query.windowStart, query.windowEnd);
  const exclude = new Set(query.excludeIds ?? []);
  const departMinutes = parseClock(query.departAt ?? "09:00");

  const inWindow = sales.filter((sale) =>
    sale.hours.some(
      (entry) => entry.date >= query.windowStart && entry.date <= query.windowEnd,
    ),
  );
  const filtered = inWindow.filter(
    (sale) =>
      !exclude.has(sale.id) && saleMatchesCategories(sale.tags, query.categories),
  );

  const parts = partitionSales(
    filtered,
    query.start,
    saturday,
    sunday,
    query.halfDay,
  );
  const ordered = orderSaturday(query.start, parts.saturday, saturday);
  const sundayOrdered = sunday
    ? orderSaturday(query.start, parts.sunday, sunday)
    : parts.sunday;

  return {
    saturday: rankStops(ordered, "saturday", saturday, query, saturday, departMinutes),
    sunday: rankStops(
      sundayOrdered,
      "sunday",
      sunday ?? saturday,
      query,
      saturday,
      departMinutes,
    ),
    skipped: rankStops(parts.skipped, "skipped", saturday, query, saturday, departMinutes),
    mapsUrl: routeMapsUrl(
      query.startLabel,
      ordered.map((sale) => sale.address),
    ),
    sundayMapsUrl: routeMapsUrl(
      query.startLabel,
      sundayOrdered.map((sale) => sale.address),
    ),
    sourceNote,
  };
}
