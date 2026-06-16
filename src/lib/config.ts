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

// The unit-type switch reloads the page so every label re-renders
// consistently. The editor flushes its draft in beforeunload, so no work is
// lost — suppress its "unsaved changes" dialog, which would otherwise be a
// false alarm and, when cancelled, leave the app half-toggled.
let unloadWarningSuppressed = false;
export const suppressUnloadWarning = (): void => {
  unloadWarningSuppressed = true;
};
export const isUnloadWarningSuppressed = (): boolean => unloadWarningSuppressed;

export const setSelectedUnitType = (unitType: UnitType): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedUnitType', unitType);
    suppressUnloadWarning();
    window.location.reload();
  }
};

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

// Read live on every call: the value can change after module load (cloud
// profile sync on login writes localStorage), and a frozen snapshot left the
// UI showing the wrong unit's terminology until a manual refresh.
export const getCurrentUnitType = (): UnitType => {
  return getSelectedUnitType();
};

