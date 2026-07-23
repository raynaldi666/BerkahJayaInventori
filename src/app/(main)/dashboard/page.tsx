'use client';

import React from 'react';
import StatCard from '@/components/StatCard';
import { useStore } from '@/context/StoreContext';

// 💡 Fungsi Helper untuk konversi format ID menjadi Invoice Baru sesuai tipe transaksi
const formatInvoiceDashboard = (id: string, tglStr: string, type: 'Beli' | 'Jual') => {
  try {
    if (!id) return '';
    const urutan = id.replace(/[^0-9]/g, '').slice(-3).padStart(3, '0');
    const parts = tglStr ? tglStr.split('/') : [];
    let tahun = '2026';
    let bulan = '07';
    
    if (parts.length === 3) {
      bulan = parts[1].padStart(2, '0');
      tahun = parts[2];
    } else if (tglStr) {
      const dateObj = new Date(tglStr);
      if (!isNaN(dateObj.getTime())) {
        tahun = dateObj.getFullYear().toString();
        bulan = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      }
    }
    
    const prefix = type === 'Beli' ? 'FB' : 'FJ';
    return `${prefix}-${tahun}/${bulan}/${urutan}`;
  } catch (e) {
    return id;
  }
};

export default function Dashboard() {
  const { barang, pembelian, penjualan } = useStore();

  const totalBarang = barang.length;

  // 🗓️ Ambil Bulan (01-12) dan Tahun aktif dari sistem komputer saat ini
  const targetBulanSekarang = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const targetTahunSekarang = new Date().getFullYear().toString();

  // 💡 HANYA HITUNG PEMBELIAN BULAN BERJALAN
  const totalPengeluaran = pembelian.reduce((acc, p) => {
    const parts = p.tgl ? p.tgl.split('/') : [];
    if (parts.length === 3 && parts[1] === targetBulanSekarang && parts[2] === targetTahunSekarang) {
      return acc + (Number(p.totalPembelian) || 0);
    }
    return acc;
  }, 0);

  // 💡 HANYA HITUNG PENJUALAN BULAN BERJALAN
  const totalPendapatan = penjualan.reduce((acc, p) => {
    const parts = p.tgl ? p.tgl.split('/') : [];
    if (parts.length === 3 && parts[1] === targetBulanSekarang && parts[2] === targetTahunSekarang) {
      return acc + (Number(p.totalPenjualan) || 0);
    }
    return acc;
  }, 0);

  const stokTipis = barang.filter(b => b.stok <= b.minstok);

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  // Helper untuk mengubah string tanggal "DD/MM/YYYY" menjadi objek Date yang valid untuk sorting
  const parseDateId = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
    return new Date(dateStr);
  };

  // Menggabungkan transaksi untuk list aktivitas terbaru
  const allTransactions = [
    ...pembelian.map(p => ({ id: p.id, tgl: p.tgl, nama: p.supplierNama, total: p.totalPembelian, type: 'Beli' as const })),
    ...penjualan.map(p => ({ id: p.id, tgl: p.tgl, nama: p.pelangganNama, total: p.totalPenjualan, type: 'Jual' as const }))
  ].sort((a, b) => parseDateId(b.tgl).getTime() - parseDateId(a.tgl).getTime()).slice(0, 5);

  return (
    <>
      {/* BAGIAN ATAS: StatCard */}
      <div className="stats-grid">
        <StatCard 
          icon="fa-boxes-stacked" iconBg="#f0efe9" iconColor="#1a1917"
          label="Total Jenis Barang" value={totalBarang} sub="Barang Terdaftar"
        />
        <StatCard 
          icon="fa-truck-ramp-box" iconBg="#dce8fb" iconColor="#1a3a6b"
          label="Total Pembelian Bulan ini" value={fmt(totalPengeluaran)} sub=" "
        />
        <StatCard 
          icon="fa-cart-arrow-down" iconBg="#e6f4ea" iconColor="#137333"
          label="Total Penjualan Bulan ini" value={fmt(totalPendapatan)} sub=" "
        />
      </div>

      <div className="grid-2" style={{ marginTop: '24px' }}>
        {/* TABEL 1: Aktivitas Transaksi Terbaru */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Aktivitas Transaksi Terbaru</span>
          </div>
          <div className="table-wrap">
            {allTransactions.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Nota</th>
                    <th>Tanggal</th>
                    <th>Pihak Kedua</th>
                    <th>Tipe</th>
                    <th style={{ textAlign: 'right' }}>Total Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {allTransactions.map((tx, idx) => (
                    <tr key={idx}>
                      <td className="mono">
                        <strong>{formatInvoiceDashboard(tx.id, tx.tgl, tx.type)}</strong>
                      </td>
                      <td>{tx.tgl}</td>
                      <td><strong>{tx.nama}</strong></td>
                      <td>
                        <span style={{
                          background: tx.type === 'Beli' ? '#e8f0fe' : '#e6f4ea',
                          color: tx.type === 'Beli' ? '#1a73e8' : '#137333',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {tx.type === 'Beli' ? 'PEMBELIAN' : 'PENJUALAN'}
                        </span>
                      </td>
                      <td className="mono" style={{ textAlign: 'right', fontWeight: '600' }}>{fmt(tx.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty">
                <i className="fa-solid fa-file-invoice"></i>
                <p>Belum ada aktivitas transaksi</p>
              </div>
            )}
          </div>
        </div>

        {/* TABEL 2: Peringatan Stok Menipis */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#d93025', fontSize: '13px', marginRight: '6px' }}></i> 
              Peringatan Stok Menipis
            </span>
          </div>
          <div className="table-wrap">
            {stokTipis.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Nama Barang</th>
                    <th>Stok Aktual</th>
                    <th>Batas Minimum</th>
                  </tr>
                </thead>
                <tbody>
                  {stokTipis.map(b => (
                    <tr key={b.id}>
                      <td><strong>{b.nama}</strong></td>
                      <td style={{ color: '#d93025', fontWeight: 700 }}>{b.stok} {b.satuan}</td>
                      <td style={{ color: 'var(--text3)' }}>{b.minstok} {b.satuan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty">
                <i className="fa-solid fa-check-circle" style={{ color: '#137333' }}></i>
                <p>Semua stok aman aman saja</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}