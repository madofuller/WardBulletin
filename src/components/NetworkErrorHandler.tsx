import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface NetworkErrorHandlerProps {
  children: React.ReactNode;
  onRetry?: () => void;
  showOfflineIndicator?: boolean;
  showStatusIndicator?: boolean;
}

interface NetworkStatus {
  isOnline: boolean;
  isConnecting: boolean;
  lastError: string | null;
  retryCount: number;
}

export default function NetworkErrorHandler({ 
  children, 
  onRetry,
  showOfflineIndicator = true,
  showStatusIndicator = false
}: NetworkErrorHandlerProps) {
  const { t } = useTranslation();
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isConnecting: false,
    lastError: null,
    retryCount: 0
  });

  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: true,
        lastError: null,
        retryCount: 0
      }));
      
      if (showOfflineBanner) {
        setShowOfflineBanner(false);
        toast.success(t('success.connectionRestored', 'Connection restored!'), {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />
        });
      }
    };

    const handleOffline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false,
        lastError: 'No internet connection'
      }));
      
      if (showOfflineIndicator) {
        setShowOfflineBanner(true);
        toast.error(t('errors.currentlyOffline', 'You are currently offline. Some features may be limited.'), {
          icon: <WifiOff className="w-5 h-5 text-red-600" />
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showOfflineIndicator, showOfflineBanner]);

  const handleRetry = async () => {
    setNetworkStatus(prev => ({
      ...prev,
      isConnecting: true,
      retryCount: prev.retryCount + 1
    }));

    try {
      if (onRetry) {
        await onRetry();
      } else {
        // Default retry: test connection
        await testConnection();
      }
      
      setNetworkStatus(prev => ({
        ...prev,
        isConnecting: false,
        lastError: null
      }));
    } catch (error) {
      setNetworkStatus(prev => ({
        ...prev,
        isConnecting: false,
        lastError: error instanceof Error ? error.message : 'Connection failed'
      }));
    }
  };

  const testConnection = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000);

      fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      })
        .then(() => {
          clearTimeout(timeout);
          resolve();
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  };

  const getErrorMessage = (error: string): string => {
    const errorMessages: Record<string, string> = {
      'No internet connection': 'Please check your internet connection and try again.',
      'Connection timeout': 'The request took too long. Please try again.',
      'Failed to fetch': 'Unable to connect to the server. Please check your connection.',
      'Network Error': 'A network error occurred. Please try again.',
      'default': 'An unexpected error occurred. Please try again.'
    };

    return errorMessages[error] || errorMessages.default;
  };

  return (
    <>
      {/* Offline Banner */}
      {showOfflineBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 text-center">
          <div className="flex items-center justify-center space-x-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">
              You are currently offline. Some features may be limited.
            </span>
          </div>
        </div>
      )}

      {/* Network Error Modal */}
      {networkStatus.lastError && !networkStatus.isOnline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <WifiOff className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Connection Error
              </h3>
              
              <p className="text-gray-600 mb-6">
                {getErrorMessage(networkStatus.lastError)}
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  disabled={networkStatus.isConnecting}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {networkStatus.isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </>
                  )}
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Refresh Page
                </button>
              </div>

              {networkStatus.retryCount > 0 && (
                <p className="text-xs text-gray-500 mt-4">
                  Retry attempt: {networkStatus.retryCount}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Connection Status Indicator */}
      {showStatusIndicator && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-full shadow-lg transition-all duration-300 ${
            networkStatus.isOnline 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {networkStatus.isOnline ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            <span className="text-xs font-medium">
              {networkStatus.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      )}

      {children}
    </>
  );
}

// Hook for components to use network status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
};

// Component for showing network-aware loading states
export const NetworkAwareLoader: React.FC<{
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
  children: React.ReactNode;
}> = ({ isLoading, error, onRetry, children }) => {
  const { t } = useTranslation();
  const { isOnline } = useNetworkStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
        <span className="text-gray-600">{t('common.loading', 'Loading...')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-red-600 font-medium">Error loading content</span>
        </div>
        
        {!isOnline && (
          <p className="text-gray-600 text-sm mb-4 text-center">
            You appear to be offline. Please check your connection.
          </p>
        )}
        
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={!isOnline}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}; 