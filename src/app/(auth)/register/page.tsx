'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/Toast';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      toast('Semua kolom wajib diisi', true);
      return;
    }

    if (password !== confirmPassword) {
      toast('Password dan konfirmasi password tidak cocok', true);
      return;
    }

    if (password.length < 6) {
      toast('Password minimal 6 karakter', true);
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error(error);
      let errMsg = 'Gagal melakukan registrasi.';
      if (error.code === 'auth/email-already-in-use') {
        errMsg = 'Email sudah terdaftar.';
      }
      toast(errMsg, true);
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div className="brand-icon" style={{ margin: '0 auto 12px', width: '48px', height: '48px', fontSize: '24px' }}>
          <i className="fa-solid fa-store"></i>
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text)' }}>Daftar Admin Berkah Jaya</h1>
        <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '4px' }}>Buat akun untuk mengakses</p>
      </div>

      <form onSubmit={handleRegister}>
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
        <div className="form-group">
          <label className="form-label">Password</label>
          <input 
            type="password" 
            className="input" 
            placeholder="Minimal 6 karakter" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label">Konfirmasi Password</label>
          <input 
            type="password" 
            className="input" 
            placeholder="Ulangi password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
          disabled={loading}
        >
          {loading ? 'Memproses...' : 'Daftar'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
        <span style={{ color: 'var(--text2)' }}>Sudah punya akun? </span>
        <Link href="/login" style={{ color: 'var(--blue)', fontWeight: 500, textDecoration: 'none' }}>
          Masuk di sini
        </Link>
      </div>
    </div>
  );
}
