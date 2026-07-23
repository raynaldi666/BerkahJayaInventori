'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/Toast';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Email dan password harus diisi', true);
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Full reload to ensure Firebase auth state is fresh in all components
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error(error);
      toast('Gagal login. Periksa email dan password Anda.', true);
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div className="brand-icon" style={{ margin: '0 auto 12px', width: '48px', height: '48px', fontSize: '24px' }}>
          <i className="fa-solid fa-store"></i>
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text)' }}>Berkah Jaya</h1>
        <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '4px' }}>Silakan login untuk mengakses dashboard</p>
      </div>

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input 
            type="email" 
            className="input" 
            placeholder="admin@tokoinventory.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label">Password</label>
          <input 
            type="password" 
            className="input" 
            placeholder="••••••••" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
          disabled={loading}
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
        <span style={{ color: 'var(--text2)' }}>Belum punya akun? </span>
        <Link href="/register" style={{ color: 'var(--blue)', fontWeight: 500, textDecoration: 'none' }}>
          Daftar Sekarang
        </Link>
      </div>
    </div>
  );
}
