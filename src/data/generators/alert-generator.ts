import type { Alert, AlertSeverity, AlertStatus, AlertType, Pot } from '@/types';
import { getPots } from './pot-generator';
import { randomInt, pickRandom } from '@/lib/utils';
import { ALERT_TYPE_LABELS } from '@/data/constants';

const ALERT_DESCRIPTIONS: Record<AlertType, (pot: Pot) => string> = {
  fe_high: (pot) => `Iron content at ${pot.metrics.fe.toFixed(3)}% exceeds threshold. Recommend immediate inspection.`,
  si_high: (pot) => `Silicon content at ${pot.metrics.si.toFixed(3)}% exceeds threshold. Check for contamination.`,
  temp_high: (pot) => `Temperature at ${pot.metrics.temperature}°C above normal range. Verify cooling system.`,
  temp_low: (pot) => `Temperature at ${pot.metrics.temperature}°C below normal range. Check power supply.`,
  voltage_spike: (pot) => `Voltage fluctuation detected at ${pot.metrics.voltage}V. Monitor anode condition.`,
  ae_frequency: (pot) => `Anode effect frequency at ${pot.metrics.aeFrequency} events. Review alumina feeding.`,
  prediction: (pot) => `AI model predicts elevated risk (score: ${pot.aiScore}) within 7 days. Preventive action recommended.`,
};

function generateAlertsForPot(pot: Pot): Alert[] {
  const alerts: Alert[] = [];

  if (pot.riskLevel === 'shutdown' || pot.riskLevel === 'normal') {
    return alerts;
  }

  // Determine alert types based on pot conditions
  const alertTypes: AlertType[] = [];

  if (pot.metrics.fe >= 0.10) alertTypes.push('fe_high');
  if (pot.metrics.si >= 0.05) alertTypes.push('si_high');
  if (pot.metrics.temperature > 975) alertTypes.push('temp_high');
  if (pot.metrics.temperature < 960) alertTypes.push('temp_low');
  if (pot.metrics.aeFrequency > 0) alertTypes.push('ae_frequency');
  if (pot.aiScore < 60 && pot.riskLevel !== 'critical') alertTypes.push('prediction');

  // Generate alerts for each type
  alertTypes.forEach((type, index) => {
    const createdAt = new Date();
    createdAt.setHours(createdAt.getHours() - randomInt(1, 72));

    const severity: AlertSeverity = pot.riskLevel === 'critical' ? 'critical'
      : pot.riskLevel === 'high' ? 'high' : 'moderate';

    const statusRand = Math.random();
    let status: AlertStatus = 'active';
    let acknowledgedAt: Date | undefined;
    let resolvedAt: Date | undefined;
    let assignee: string | undefined;

    if (statusRand > 0.7) {
      status = 'acknowledged';
      acknowledgedAt = new Date(createdAt);
      acknowledgedAt.setHours(acknowledgedAt.getHours() + randomInt(1, 4));
      assignee = pickRandom(['John Lee', 'Sarah Chen', 'Ahmad Ibrahim', 'Maria Tan']);
    } else if (statusRand > 0.85) {
      status = 'resolved';
      acknowledgedAt = new Date(createdAt);
      acknowledgedAt.setHours(acknowledgedAt.getHours() + randomInt(1, 4));
      resolvedAt = new Date(acknowledgedAt);
      resolvedAt.setHours(resolvedAt.getHours() + randomInt(2, 24));
      assignee = pickRandom(['John Lee', 'Sarah Chen', 'Ahmad Ibrahim', 'Maria Tan']);
    }

    alerts.push({
      id: `alert-${pot.id}-${type}-${index}`,
      potId: pot.id,
      type,
      severity,
      status,
      title: `${ALERT_TYPE_LABELS[type]} - Pot ${pot.id}`,
      description: ALERT_DESCRIPTIONS[type](pot),
      createdAt,
      acknowledgedAt,
      resolvedAt,
      assignee,
    });
  });

  return alerts;
}

let cachedAlerts: Alert[] | null = null;

export function getAlerts(): Alert[] {
  if (!cachedAlerts) {
    const pots = getPots();
    const riskyPots = pots.filter(p => p.riskLevel !== 'normal' && p.riskLevel !== 'shutdown');
    cachedAlerts = riskyPots.flatMap(generateAlertsForPot);
    // Sort by created date descending
    cachedAlerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  return cachedAlerts;
}

export function getActiveAlerts(): Alert[] {
  return getAlerts().filter(a => a.status === 'active');
}

export function getCriticalAlerts(): Alert[] {
  return getAlerts().filter(a => a.severity === 'critical' && a.status === 'active');
}

export function getAlertsByPot(potId: string): Alert[] {
  return getAlerts().filter(a => a.potId === potId);
}
