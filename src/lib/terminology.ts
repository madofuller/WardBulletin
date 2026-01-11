import { TERMINOLOGY } from './config';

export const terminology = TERMINOLOGY;

// Helper functions to get terminology-aware labels
export function getUnitLabel(): string {
  return terminology.unit;
}

export function getUnitLowercase(): string {
  return terminology.unitLowercase;
}

export function getHigherUnitLabel(): string {
  return terminology.higherUnit;
}

export function getHigherUnitLowercase(): string {
  return terminology.higherUnitLowercase;
}

export function getLeaderTitle(): string {
  return terminology.leader;
}

export function getLeadershipBodyTitle(): string {
  return terminology.leadershipBody;
}

export function getUnitPossessive(): string {
  return terminology.unitPossessive;
}

// Helper function to get audience display name
export function getAudienceDisplayName(audience: string): string {
  switch (audience) {
    case 'ward':
    case 'branch':
      return terminology.unit;
    case 'stake':
    case 'district':
      return terminology.higherUnit;
    case 'relief_society':
      return 'Relief Society';
    case 'elders_quorum':
      return 'Elders Quorum';
    case 'young_women':
      return 'Young Women';
    case 'young_men':
      return 'Young Men';
    case 'youth':
      return 'Youth';
    case 'primary':
      return 'Primary';
    case 'sunday_school':
      return 'Sunday School';
    case 'gospel_doctrine':
      return 'Gospel Doctrine';
    case 'other':
      return 'Other';
    default:
      return audience;
  }
}

// Helper function to get the appropriate higher unit label based on context
// Branches can be in either Stakes or Districts, so we need to be flexible
export function getHigherUnitLabelForContext(isBranch: boolean = false): string {
  if (isBranch) {
    // For branches, we default to District but could be Stake
    return 'District/Stake';
  }
  return terminology.higherUnit;
}

// Helper function to get the correct audience value based on current terminology
export function getAudienceValue(type: 'unit' | 'higher_unit'): string {
  if (type === 'unit') {
    return terminology.unitLowercase;
  } else if (type === 'higher_unit') {
    return terminology.higherUnitLowercase;
  }
  return 'other';
}

// Template string helpers for dynamic content
export function getUnitNameLabel(): string {
  return `${terminology.unit} Name`;
}

export function getUnitLeadershipLabel(): string {
  return `${terminology.unit} Leadership`;
}

export function getUnitMissionariesLabel(): string {
  return `${terminology.unit} Missionaries`;
}

export function getLeadershipMessageLabel(): string {
  return `${terminology.leadershipBody} Message`;
}