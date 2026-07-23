'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Show loading spinner while Firebase resolves
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '8px',
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
            color: '#fff', fontSize: '20px'
          }}>
            <i className="fa-solid fa-store"></i>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text3)' }}>Memuat...</div>
        </div>
      </div>
    );
  }

  // Don't render main content if not authenticated (redirect is in progress)
  if (!user) return null;

  return (
    <div id="app">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}
