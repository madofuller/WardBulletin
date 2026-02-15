import { TERMINOLOGY, getTerminologyForUnitType, UnitType } from './config';
import { TFunction } from 'i18next';

export const terminology = TERMINOLOGY;

// Helper function to get terminology based on optional override
function getTerminology(unitTypeOverride?: UnitType) {
  return unitTypeOverride
    ? getTerminologyForUnitType(unitTypeOverride)
    : TERMINOLOGY;
}

// Helper functions to get terminology-aware labels
export function getUnitLabel(unitTypeOverride?: UnitType): string {
  return getTerminology(unitTypeOverride).unit;
}

export function getUnitLowercase(unitTypeOverride?: UnitType): string {
  return getTerminology(unitTypeOverride).unitLowercase;
}

export function getHigherUnitLabel(unitTypeOverride?: UnitType): string {
  return getTerminology(unitTypeOverride).higherUnit;
}

export function getHigherUnitLowercase(unitTypeOverride?: UnitType): string {
  return getTerminology(unitTypeOverride).higherUnitLowercase;
}

export function getLeaderTitle(unitTypeOverride?: UnitType): string {
  return getTerminology(unitTypeOverride).leader;
}

export function getLeadershipBodyTitle(unitTypeOverride?: UnitType): string {
  return getTerminology(unitTypeOverride).leadershipBody;
}

export function getUnitPossessive(unitTypeOverride?: UnitType): string {
  return getTerminology(unitTypeOverride).unitPossessive;
}

// Helper function to get audience display name
export function getAudienceDisplayName(audience: string, unitTypeOverride?: UnitType): string {
  const term = getTerminology(unitTypeOverride);
  switch (audience) {
    case 'ward':
    case 'branch':
      return term.unit;
    case 'stake':
    case 'district':
      return term.higherUnit;
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
export function getHigherUnitLabelForContext(isBranch: boolean = false, unitTypeOverride?: UnitType): string {
  if (isBranch) {
    // For branches, we default to District but could be Stake
    return 'District/Stake';
  }
  return getTerminology(unitTypeOverride).higherUnit;
}

// Helper function to get the correct audience value based on current terminology
export function getAudienceValue(type: 'unit' | 'higher_unit', unitTypeOverride?: UnitType): string {
  const term = getTerminology(unitTypeOverride);
  if (type === 'unit') {
    return term.unitLowercase;
  } else if (type === 'higher_unit') {
    return term.higherUnitLowercase;
  }
  return 'other';
}

// Template string helpers for dynamic content
export function getUnitNameLabel(unitTypeOverride?: UnitType): string {
  return `${getTerminology(unitTypeOverride).unit} Name`;
}

export function getUnitLeadershipLabel(unitTypeOverride?: UnitType): string {
  return `${getTerminology(unitTypeOverride).unit} Leadership`;
}

export function getUnitMissionariesLabel(unitTypeOverride?: UnitType): string {
  return `${getTerminology(unitTypeOverride).unit} Missionaries`;
}

export function getLeadershipMessageLabel(unitTypeOverride?: UnitType): string {
  return `${getTerminology(unitTypeOverride).leadershipBody} Message`;
}

// Re-export UnitType for convenience
export type { UnitType } from './config';

// ========================================
// TRANSLATED TERMINOLOGY HELPERS
// ========================================
// These functions return translated unit labels using i18next

/**
 * Get the translated unit label (Ward/Branch) based on unit type
 */
export function getTranslatedUnitLabel(t: TFunction, unitTypeOverride?: UnitType): string {
  const unitType = unitTypeOverride || (typeof window !== 'undefined' ? localStorage.getItem('selectedUnitType') as UnitType : 'ward') || 'ward';
  return unitType === 'branch' ? t('terminology.branch') : t('terminology.ward');
}

/**
 * Get the translated unit label in lowercase
 */
export function getTranslatedUnitLowercase(t: TFunction, unitTypeOverride?: UnitType): string {
  const unitType = unitTypeOverride || (typeof window !== 'undefined' ? localStorage.getItem('selectedUnitType') as UnitType : 'ward') || 'ward';
  return unitType === 'branch' ? t('terminology.branchLowercase') : t('terminology.wardLowercase');
}

/**
 * Get the translated higher unit label (Stake/District)
 */
export function getTranslatedHigherUnitLabel(t: TFunction, unitTypeOverride?: UnitType): string {
  const unitType = unitTypeOverride || (typeof window !== 'undefined' ? localStorage.getItem('selectedUnitType') as UnitType : 'ward') || 'ward';
  return unitType === 'branch' ? t('terminology.districtStake') : t('terminology.stake');
}

/**
 * Get the translated leadership body label (Bishopric/Branch Presidency)
 */
export function getTranslatedLeadershipBody(t: TFunction, unitTypeOverride?: UnitType): string {
  const unitType = unitTypeOverride || (typeof window !== 'undefined' ? localStorage.getItem('selectedUnitType') as UnitType : 'ward') || 'ward';
  return unitType === 'branch' ? t('terminology.branchPresidency') : t('terminology.bishopric');
}

/**
 * Get the translated leader title (Bishop/Branch President)
 */
export function getTranslatedLeaderTitle(t: TFunction, unitTypeOverride?: UnitType): string {
  const unitType = unitTypeOverride || (typeof window !== 'undefined' ? localStorage.getItem('selectedUnitType') as UnitType : 'ward') || 'ward';
  return unitType === 'branch' ? t('terminology.branchPresident') : t('terminology.bishop');
}