'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItems = [
    { label: 'Utama', items: [{ name: 'Dashboard', path: '/dashboard', icon: 'fa-gauge-high' }] },
    {
      label: 'Master Data',
      items: [
        { name: 'Barang', path: '/barang', icon: 'fa-boxes-stacked' },
        { name: 'Supplier', path: '/supplier', icon: 'fa-truck' },
        { name: 'Pelanggan', path: '/pelanggan', icon: 'fa-users' },
        { name: 'Satuan', path: '/satuan', icon: 'fa-ruler' },
        
      ],
    },
    {
      label: 'Transaksi',
      items: [
        { name: 'Pembelian', path: '/pembelian', icon: 'fa-cart-shopping' },
        { name: 'Penjualan', path: '/penjualan', icon: 'fa-receipt' },
        { name: 'Adjustment', path: '/adjustment', icon: 'fa-arrows-up-down' },
      ],
    },
    {
      label: 'Laporan',
      items: [
        { name: 'Stok', path: '/lap-stock', icon: 'fa-chart-bar' },
        { name: 'Transaksi', path: '/lap-transaksi', icon: 'fa-file-lines' },
        { name: 'Supplier', path: '/lap-supplier', icon: 'fa-file-invoice' },
      ],
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <div className="brand-icon">
            <i className="fa-solid fa-store"></i>
          </div>
          <div>
            <div className="brand-name">Berkah Jaya</div>
            <div className="brand-sub">Toko Bangunan</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
        {navItems.map((section, idx) => (
          <div className="nav-section" key={idx}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  href={item.path}
                  key={item.name}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <i className={`fa-solid ${item.icon}`}></i> {item.name}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ padding: '16px 18px', marginTop: 'auto', borderTop: '1px solid var(--border)' }}>
        <button 
          onClick={handleLogout}
          className="btn" 
          style={{ width: '100%', justifyContent: 'center', color: 'var(--red)', borderColor: 'var(--red-bg)', background: 'var(--red-bg)' }}
        >
          <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
        </button>
        
      </div>
    </aside>
  );
}
