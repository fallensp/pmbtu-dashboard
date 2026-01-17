import type { Pot, PotMetrics, TrendData, RiskLevel } from '@/types';
import { AREAS_BY_PHASE, POTS_PER_AREA, THRESHOLDS } from '@/data/constants';
import { randomBetween, randomInt } from '@/lib/utils';

function generateMetrics(riskLevel: RiskLevel): PotMetrics {
  let fe: number, si: number, temperature: number, voltage: number;
  let molarRatio: number, aeFrequency: number;

  switch (riskLevel) {
    case 'critical':
      fe = randomBetween(0.16, 0.25);
      si = randomBetween(0.06, 0.10);
      temperature = randomBetween(950, 980);
      voltage = randomBetween(3.8, 4.3);
      molarRatio = randomBetween(2.1, 2.9);
      aeFrequency = randomInt(2, 5);
      break;
    case 'high':
      fe = randomBetween(0.12, 0.18);
      si = randomBetween(0.05, 0.07);
      temperature = randomBetween(958, 976);
      voltage = randomBetween(3.9, 4.2);
      molarRatio = randomBetween(2.2, 2.8);
      aeFrequency = randomInt(1, 3);
      break;
    case 'moderate':
      fe = randomBetween(0.08, 0.14);
      si = randomBetween(0.04, 0.06);
      temperature = randomBetween(962, 973);
      voltage = randomBetween(3.95, 4.1);
      molarRatio = randomBetween(2.3, 2.7);
      aeFrequency = randomInt(0, 2);
      break;
    case 'shutdown':
      fe = 0;
      si = 0;
      temperature = 25;
      voltage = 0;
      molarRatio = 0;
      aeFrequency = 0;
      break;
    default: // normal
      fe = randomBetween(0.04, 0.09);
      si = randomBetween(0.02, 0.045);
      temperature = randomBetween(964, 971);
      voltage = randomBetween(3.98, 4.05);
      molarRatio = randomBetween(2.4, 2.6);
      aeFrequency = 0;
  }

  const feSlope = riskLevel === 'critical' || riskLevel === 'high'
    ? randomBetween(0.002, 0.008)
    : randomBetween(-0.002, 0.003);

  const siSlope = riskLevel === 'critical' || riskLevel === 'high'
    ? randomBetween(0.001, 0.004)
    : randomBetween(-0.001, 0.002);

  return {
    fe: Number(fe.toFixed(4)),
    si: Number(si.toFixed(4)),
    temperature: Number(temperature.toFixed(1)),
    voltage: Number(voltage.toFixed(3)),
    molarRatio: Number(molarRatio.toFixed(2)),
    aeFrequency,
    feSlope: Number(feSlope.toFixed(5)),
    siSlope: Number(siSlope.toFixed(5)),
  };
}

function generateTrends(metrics: PotMetrics, days: number = 30): TrendData[] {
  const trends: TrendData[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const noise = () => randomBetween(-0.01, 0.01);
    const trendFactor = (days - i) / days;

    trends.push({
      date,
      fe: Number((metrics.fe - metrics.feSlope * i + noise()).toFixed(4)),
      si: Number((metrics.si - metrics.siSlope * i + noise() * 0.5).toFixed(4)),
      temperature: Number((metrics.temperature + randomBetween(-3, 3)).toFixed(1)),
      voltage: Number((metrics.voltage + randomBetween(-0.05, 0.05)).toFixed(3)),
      aiScore: Number((50 + trendFactor * 40 + randomBetween(-10, 10)).toFixed(1)),
    });
  }

  return trends;
}

function calculateAIScore(metrics: PotMetrics, riskLevel: RiskLevel): number {
  if (riskLevel === 'shutdown') return 0;

  let score = 100;

  // Fe contribution (0-30 points deducted)
  if (metrics.fe >= THRESHOLDS.fe.critical) score -= 30;
  else if (metrics.fe >= THRESHOLDS.fe.moderate) score -= 15;
  else if (metrics.fe >= THRESHOLDS.fe.normal) score -= 5;

  // Si contribution (0-25 points deducted)
  if (metrics.si >= THRESHOLDS.si.critical) score -= 25;
  else if (metrics.si >= THRESHOLDS.si.moderate) score -= 12;
  else if (metrics.si >= THRESHOLDS.si.normal) score -= 4;

  // Temperature contribution (0-20 points deducted)
  if (metrics.temperature > THRESHOLDS.temperature.critical_high ||
      metrics.temperature < THRESHOLDS.temperature.critical_low) score -= 20;
  else if (metrics.temperature > THRESHOLDS.temperature.normal_high ||
           metrics.temperature < THRESHOLDS.temperature.normal_low) score -= 8;

  // Slope trends (0-15 points deducted)
  if (metrics.feSlope > 0.005) score -= 15;
  else if (metrics.feSlope > 0.002) score -= 7;

  // AE frequency (0-10 points deducted)
  if (metrics.aeFrequency >= THRESHOLDS.aeFrequency.critical) score -= 10;
  else if (metrics.aeFrequency >= THRESHOLDS.aeFrequency.moderate) score -= 5;

  return Math.max(0, Math.min(100, score + randomBetween(-5, 5)));
}

function assignRiskLevel(): RiskLevel {
  const rand = Math.random();
  // Distribution: 0.3% critical, 1.3% high, 5% moderate, ~93% normal, 0.4% shutdown
  if (rand < 0.003) return 'critical';
  if (rand < 0.016) return 'high';
  if (rand < 0.066) return 'moderate';
  if (rand < 0.996) return 'normal';
  return 'shutdown';
}

export function generatePots(): Pot[] {
  const pots: Pot[] = [];

  for (const phase of [1, 2, 3] as const) {
    const areas = AREAS_BY_PHASE[phase];

    for (const area of areas) {
      for (let pos = 1; pos <= POTS_PER_AREA; pos++) {
        const riskLevel = assignRiskLevel();
        const metrics = generateMetrics(riskLevel);
        const aiScore = calculateAIScore(metrics, riskLevel);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - randomInt(100, 2000));

        const lastTapDate = new Date();
        lastTapDate.setHours(lastTapDate.getHours() - randomInt(1, 48));

        const pot: Pot = {
          id: `${phase}-${area}-${String(pos).padStart(3, '0')}`,
          phase,
          area,
          position: pos,
          riskLevel,
          aiScore: Number(aiScore.toFixed(1)),
          age: Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
          startDate,
          lastTapDate,
          metrics,
          trends: generateTrends(metrics),
        };

        pots.push(pot);
      }
    }
  }

  return pots;
}

// Pre-generated pots for consistent mock data
let cachedPots: Pot[] | null = null;

export function getPots(): Pot[] {
  if (!cachedPots) {
    cachedPots = generatePots();
  }
  return cachedPots;
}

export function getPotById(id: string): Pot | undefined {
  return getPots().find(p => p.id === id);
}

export function getPotsFiltered(
  phase?: number | null,
  areas?: string[],
  riskLevels?: RiskLevel[]
): Pot[] {
  let filtered = getPots();

  if (phase) {
    filtered = filtered.filter(p => p.phase === phase);
  }

  if (areas && areas.length > 0) {
    filtered = filtered.filter(p => areas.includes(p.area));
  }

  if (riskLevels && riskLevels.length > 0) {
    filtered = filtered.filter(p => riskLevels.includes(p.riskLevel));
  }

  return filtered;
}
