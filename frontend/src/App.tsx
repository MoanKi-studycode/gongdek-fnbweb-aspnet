import { RouterProvider } from 'react-router';
import { router } from '@/router';
import { POSProvider } from '@/contexts/POSContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <POSProvider>
          <RouterProvider router={router} />
          <Toaster />
        </POSProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
