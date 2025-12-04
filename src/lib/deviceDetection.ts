// Utility to detect if the current device is mobile
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check user agent for mobile devices
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  // Also check screen width as a fallback
  const isSmallScreen = window.innerWidth < 768;
  
  return mobileRegex.test(userAgent) || isSmallScreen;
};

