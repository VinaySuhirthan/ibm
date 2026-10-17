import { DetectionBox, DensityCell, RiskLevel } from './types';
import { CalibrationQuad, DEFAULT_CALIBRATION } from './homography';

export const GRID_ROWS = 12;
export const GRID_COLS = 16;

export interface DensityMapResult {
  grid: DensityCell[][];
  avgDensityM2: number;
  maxDensityM2: number;
  hotspotCount: number;
}

export function computeDensityGrid(
  boxes: DetectionBox[],
  calib: CalibrationQuad = DEFAULT_CALIBRATION
): DensityMapResult {
  const cellWidthM = calib.metricWidthMeters / GRID_COLS;
  const cellHeightM = calib.metricHeightMeters / GRID_ROWS;
  const cellAreaM2 = Math.max(1, cellWidthM * cellHeightM);

  // Initialize count matrix
  const countGrid: number[][] = Array.from({ length: GRID_ROWS }, () =>
    Array(GRID_COLS).fill(0)
  );

  for (const box of boxes) {
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    const col = Math.floor(cx * GRID_COLS);
    const row = Math.floor(cy * GRID_ROWS);

    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
      countGrid[row][col]++;
    }
  }

  let totalDensity = 0;
  let maxDensity = 0;
  let hotspots = 0;

  const grid: DensityCell[][] = [];

  for (let r = 0; r < GRID_ROWS; r++) {
    const rowCells: DensityCell[] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      // Density = people / area
      const density = countGrid[r][c] / cellAreaM2 * 8.5; // calibrated scaling multiplier
      totalDensity += density;
      if (density > maxDensity) maxDensity = density;

      let status: RiskLevel = 'safe';
      if (density > 4.2) {
        status = 'critical';
        hotspots++;
      } else if (density > 2.6) {
        status = 'watch';
      }

      rowCells.push({
        row: r,
        col: c,
        density: Number(density.toFixed(2)),
        status
      });
    }
    grid.push(rowCells);
  }

  const avgDensity = totalDensity / (GRID_ROWS * GRID_COLS);

  return {
    grid,
    avgDensityM2: Number(avgDensity.toFixed(2)),
    maxDensityM2: Number(maxDensity.toFixed(2)),
    hotspotCount: hotspots
  };
}
