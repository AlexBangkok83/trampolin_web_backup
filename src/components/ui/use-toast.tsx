import * as React from 'react';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  id?: string;
}

interface ToastContextType {
  toast: (props: ToastProps) => void;
  dismiss: (id: string) => void;
  toasts: ToastProps[];
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const toast = React.useCallback(
    ({ title, description, variant = 'default' }: ToastProps) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((currentToasts) => [...currentToasts, { id, title, description, variant }]);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        dismiss(id);
      }, 5000);

      return id;
    },
    [dismiss],
  );

  const value = React.useMemo(
    () => ({
      toast,
      dismiss,
      toasts,
    }),
    [toast, dismiss, toasts],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex flex-col space-y-2">
        {toasts.map(({ id, title, description, variant = 'default' }) => (
          <div
            key={id}
            className={`rounded-md p-4 shadow-lg ${
              variant === 'destructive'
                ? 'border border-red-200 bg-red-100 text-red-800'
                : 'border border-gray-200 bg-white text-gray-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                {title && <h4 className="font-medium">{title}</h4>}
                {description && <p className="text-sm">{description}</p>}
              </div>
              <button
                onClick={() => dismiss(id!)}
                className="ml-4 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
