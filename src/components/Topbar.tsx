'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/barang': 'Master Barang',
  '/supplier': 'Master Supplier',
  '/pelanggan': 'Master Pelanggan',
  '/pembelian': 'Transaksi Pembelian',
  '/penjualan': 'Transaksi Penjualan',
  '/lap-stock': 'Laporan Stok',
  '/lap-stock/adjustment': 'Adjustment Stok',
  '/lap-transaksi': 'Laporan Transaksi',
  '/lap-supplier': 'Laporan Supplier',
};

export default function Topbar() {
  const pathname = usePathname();
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const today = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setDateStr(today);
  }, []);

  const title = pageTitles[pathname] || 'Dashboard';

  return (
    <div className="topbar">
      <span className="topbar-title">{title}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="topbar-date">{dateStr}</span>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600 }}>
          
        </div>
      </div>
    </div>
  );
}
