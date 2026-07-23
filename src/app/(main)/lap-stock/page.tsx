'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';

export default function LaporanStok() {
  const { barang } = useStore();

  // --- STATE FILTER REVISI (POIN 6) ---
  const [search, setSearch] = useState(''); // Fitur pencarian nama barang baru
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [hanyaStokKosong, setHanyaStokKosong] = useState(false);

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  // --- LOGIKA PENYARINGAN DATAsecara REAL-TIME ---
  const filteredBarang = barang.filter(b => {
    const cocokNama = b.nama.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
    const cocokKategori = filterKategori === 'Semua' || b.kategori === filterKategori;
    const cocokStok = !hanyaStokKosong || b.stok <= 0;
    return cocokNama && cocokKategori && cocokStok;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* ==================== PANEL SELEKSI & FILTER BARU ==================== */}
      <div className="card">
        <div className="card-header">
          <span className="card-title"><i className="fa-solid fa-filter"></i> Seleksi Kriteria Stok</span>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
          
          {/* 🛠️ REVISI POIN 6: Input Pencarian Teks Nama Barang */}
          <div style={{ flex: '1', minWidth: '240px' }}>
            <label className="form-label" style={{ marginBottom: '6px' }}>Cari Nama / Kode Barang</label>
            <div className="search-wrap" style={{ width: '100%' }}>
              <i className="fa-solid fa-magnifying-glass"></i>
              <input 
                className="input" 
                placeholder="Ketik nama material..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ width: '220px' }}>
            <label className="form-label" style={{ marginBottom: '6px' }}>Kelompok Barang</label>
            <select className="input" value={filterKategori} onChange={e => setFilterKategori(e.target.value)}>
              <option value="Semua">Semua Kelompok</option>
              <option value="Semen & Bahan Dasar">Semen & Bahan Dasar</option>
              <option value="Besi & Baja">Besi & Baja</option>
              <option value="Cat & Pelapis">Cat & Pelapis</option>
              <option value="Keramik & Granit">Keramik & Granit</option>
              <option value="Pipa & Sanitasi">Pipa & Sanitasi</option>
              <option value="Kayu & Triplek">Kayu & Triplek</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
            <input 
              type="checkbox" 
              id="empty-stock" 
              checked={hanyaStokKosong} 
              onChange={e => setHanyaStokKosong(e.target.checked)} 
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="empty-stock" style={{ fontSize: '14px', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}>
              Hanya tampilkan stok habis (≤ 0)
            </label>
          </div>
        </div>
      </div>

      {/* ==================== PANEL TABEL LAPORAN ==================== */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Laporan Stok Barang</span>
          <button className="btn btn-sm" onClick={handlePrint}>
            <i className="fa-solid fa-print"></i> Cetak Laporan
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Barang</th>
                <th>Kelompok</th>
                {/* 🛠️ REVISI POIN 6: Posisi kolom dibalik, Stok Aktual diletakkan sebelum Satuan */}
                <th style={{ textAlign: 'center' }}>Stok Aktual</th>
                <th>Satuan</th>
                <th style={{ textAlign: 'center' }}>Min. Stok Alert</th>
                <th>Harga Beli Akhir</th>
                <th>Harga Jual Toko</th>
              </tr>
            </thead>
            <tbody>
              {filteredBarang.length > 0 ? (
                filteredBarang.map(b => (
                  <tr key={b.id}>
                    <td className="mono">{b.id}</td>
                    <td><strong>{b.nama}</strong></td>
                    <td><span className="badge">{b.kategori || 'Lain-Lain'}</span></td>
                    {/* 🛠️ REVISI POIN 6: Nilai angka kuantitas dibaca di depan */}
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ 
                        color: b.stok <= b.minstok ? 'var(--red)' : 'inherit', 
                        fontWeight: b.stok <= b.minstok ? 'bold' : 'normal' 
                      }}>
                        {b.stok}
                      </span>
                    </td>
                    <td>{b.satuan}</td>
                    <td style={{ textAlign: 'center', color: 'var(--text2)' }}>{b.minstok}</td>
                    <td>{fmt(b.hbeli)}</td>
                    <td><strong style={{ color: 'var(--green)' }}>{fmt(b.hjual)}</strong></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8}>
                    <div className="empty">
                      <i className="fa-solid fa-chart-bar"></i>
                      <p>Tidak ada data laporan stok yang cocok dengan kriteria filter</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}