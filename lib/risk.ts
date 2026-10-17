import { RiskLevel } from './types';

export interface RiskAnalysis {
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  primaryRiskFactor: string;
  divergenceIndex: number; // negative indicates crowd crush compression
  recommendation: string;
}

/**
 * Computes multi-factor crowd risk based on Fruin's Level of Service (LoS):
 * - Density > 3.8 people/m²: physical contact unavoidable
 * - Density > 4.5 people/m²: shockwaves & compressive crush risk
 * - Negative velocity gradient (crowd compressing into a bottleneck)
 */
export function evaluateCrowdRisk(
  avgDensityM2: number,
  peakDensityM2: number,
  flowSpeedMps: number,
  headcount: number
): RiskAnalysis {
  // Base score from peak density (0-55 pts)
  const densityScore = Math.min(60, (peakDensityM2 / 5.2) * 60);

  // Flow deceleration score (0-25 pts): low speed with high headcount indicates chokepoint stoppage
  let velocityPenalty = 0;
  if (flowSpeedMps < 0.4 && peakDensityM2 > 3.0) {
    velocityPenalty = 25;
  } else if (flowSpeedMps < 0.8 && peakDensityM2 > 2.5) {
    velocityPenalty = 15;
  }

  // Volume scale (0-15 pts)
  const volumeScore = Math.min(15, (headcount / 2000) * 15);

  const rawScore = Math.round(densityScore + velocityPenalty + volumeScore);
  const riskScore = Math.max(8, Math.min(98, rawScore));

  let riskLevel: RiskLevel = 'safe';
  let primaryRiskFactor = 'Nominal laminar pedestrian flow';
  let recommendation = 'Standard perimeter monitoring active. No intervention needed.';

  if (riskScore >= 72 || peakDensityM2 >= 4.2) {
    riskLevel = 'critical';
    primaryRiskFactor = `Compressive peak density (${peakDensityM2.toFixed(1)} ppl/m²) at chokepoint`;
    recommendation = 'TRIGGER EMERGENCY DIVERSION. Open Auxiliary Egress Corridor C and pause upstream ingress.';
  } else if (riskScore >= 42 || peakDensityM2 >= 2.8) {
    riskLevel = 'watch';
    primaryRiskFactor = `Elevated density approaching chokepoint threshold (${peakDensityM2.toFixed(1)} ppl/m²)`;
    recommendation = 'Deploy marshals to maintain walking cadence. Broadcast slow-down advisory.';
  }

  return {
    riskScore,
    riskLevel,
    primaryRiskFactor,
    divergenceIndex: Number((flowSpeedMps - 1.2).toFixed(2)),
    recommendation
  };
}
