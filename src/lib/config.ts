// Hardcoded domain configuration - revert from environment variables
export const FULL_DOMAIN = 'wardbulletin.com';
export const SHORT_DOMAIN = 'mwbltn.com';

// Unit Type Configuration
export type UnitType = 'ward' | 'branch';

// Check localStorage for user preference, default to Ward
const getSelectedUnitType = (): UnitType => {
  if (typeof window === 'undefined') return 'ward'; // SSR safety
  const stored = localStorage.getItem('selectedUnitType') as UnitType;
  return stored && ['ward', 'branch'].includes(stored) ? stored : 'ward';
};

export const setSelectedUnitType = (unitType: UnitType): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedUnitType', unitType);
    // Force reload of terminology
    window.location.reload();
  }
};

const SELECTED_UNIT_TYPE = getSelectedUnitType();

// Get terminology based on selected unit type
export const getTerminologyForUnitType = (unitType: UnitType) => {
  switch (unitType) {
    case 'ward':
      return {
        unit: 'Ward',
        unitLowercase: 'ward',
        higherUnit: 'Stake',
        higherUnitLowercase: 'stake',
        leader: 'Bishop',
        leadershipBody: 'Bishopric',
        unitPossessive: "Ward's"
      };
    case 'branch':
      return {
        unit: 'Branch',
        unitLowercase: 'branch',
        higherUnit: 'District/Stake', // Branches can be in either
        higherUnitLowercase: 'district/stake',
        leader: 'Branch President',
        leadershipBody: 'Branch Presidency',
        unitPossessive: "Branch's"
      };
    default:
      return getTerminologyForUnitType('ward');
  }
};

export const TERMINOLOGY = getTerminologyForUnitType(SELECTED_UNIT_TYPE);

export const getCurrentUnitType = (): UnitType => {
  return SELECTED_UNIT_TYPE;
};

