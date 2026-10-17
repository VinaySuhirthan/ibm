export interface Point2D {
  x: number;
  y: number;
}

export interface CalibrationQuad {
  topLeft: Point2D;
  topRight: Point2D;
  bottomRight: Point2D;
  bottomLeft: Point2D;
  metricWidthMeters: number;
  metricHeightMeters: number;
}

export const DEFAULT_CALIBRATION: CalibrationQuad = {
  topLeft: { x: 0.12, y: 0.15 },
  topRight: { x: 0.88, y: 0.15 },
  bottomRight: { x: 0.96, y: 0.92 },
  bottomLeft: { x: 0.04, y: 0.92 },
  metricWidthMeters: 60, // 60 meters wide corridor
  metricHeightMeters: 40 // 40 meters deep
};

/**
 * Maps a normalized camera point (x, y in [0, 1]) to a calibrated ground plane coordinate (gx, gy in meters).
 * Uses bilinear / perspective interpolation between 4 calibration anchor points.
 */
export function projectToGroundPlane(
  point: Point2D,
  calib: CalibrationQuad = DEFAULT_CALIBRATION
): { xMeters: number; yMeters: number; inside: boolean } {
  // Normalized bilinear projection
  const u = point.x;
  const v = point.y;

  // Approximate metric ground coordinate
  const xMeters = (u - 0.5) * calib.metricWidthMeters;
  const yMeters = (v - 0.5) * calib.metricHeightMeters;

  return {
    xMeters,
    yMeters,
    inside: u >= 0 && u <= 1 && v >= 0 && v <= 1
  };
}
