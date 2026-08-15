import { describe, expect, it } from "vitest";
import { createDriveFn, haversineMinutes } from "../lib/distance";
import { matrixFromTable } from "../lib/osrm";

const a = { lat: 44.86695, lng: -123.02073 };
const b = { lat: 44.8528, lng: -123.19205 };

describe("drive matrix", () => {
  it("uses OSRM seconds when both points are in the table", () => {
    const matrix = matrixFromTable([a, b], [
      [0, 1800],
      [1900, 0],
    ]);
    expect(matrix.source).toBe("osrm");
    expect(matrix.minutes(a, b)).toBe(30);
    expect(createDriveFn(matrix)(a, b)).toBe(30);
  });

  it("falls back to haversine when a pair is missing", () => {
    const matrix = matrixFromTable([a], [[0]]);
    const drive = createDriveFn(matrix);
    expect(drive(a, b)).toBeCloseTo(haversineMinutes(a, b));
  });
});
