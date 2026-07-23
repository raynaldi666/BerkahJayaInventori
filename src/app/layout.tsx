import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { AuthProvider } from '@/context/AuthContext';
import ToastContainer from '@/components/Toast';

export const metadata: Metadata = {
  title: 'Berkah Jaya — Material Bangunan',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          <StoreProvider>
            {children}
            <ToastContainer />
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
