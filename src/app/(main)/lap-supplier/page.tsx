'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';

export default function LaporanSupplier() {
  const { supplier, pembelian } = useStore();

  // 🛠️ REVISI POIN 8: State untuk pencarian nama supplier
  const [search, setSearch] = useState('');

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  const handlePrint = () => {
    window.print();
  };

  // 🛠️ REVISI POIN 8: Memfilter data supplier berdasarkan input karakter user
  const filteredSupplier = supplier.filter(s => 
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 🛠️ REVISI POIN 8: Panel Filter Pencarian */}
      <div className="card">
        <div className="card-header">
          <span className="card-title"><i className="fa-solid fa-filter"></i> Filter Laporan</span>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ maxWidth: '360px' }}>
            <label className="form-label" style={{ marginBottom: '6px' }}>Cari Nama Supplier / PT</label>
            <div className="search-wrap" style={{ width: '100%' }}>
              <i className="fa-solid fa-magnifying-glass"></i>
              <input 
                className="input" 
                placeholder="Ketik nama supplier..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* TABEL LAPORAN */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Laporan Pembelian per Supplier</span>
          <button className="btn btn-sm" onClick={handlePrint}>
            <i className="fa-solid fa-print"></i> Cetak
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Supplier / PT</th>
                <th>Kontak Utama</th>
                <th style={{ textAlign: 'center' }}>Jml Transaksi</th>
                <th>Total Pembelian</th>
                <th>Item Terbanyak Dibeli</th>
              </tr>
            </thead>
            <tbody>
              {filteredSupplier.length > 0 ? (
                filteredSupplier.map(s => {
                  const sPurchases = pembelian.filter(p => p.supplierId === s.id);
                  const jmlTrans = sPurchases.length;
                  const total = sPurchases.reduce((a, p) => a + (p.totalPembelian || 0), 0);
                  
                  // Hitung item terbanyak
                  const itemCounts: { [key: string]: number } = {};
                  sPurchases.forEach(p => {
                    if (p.detail) {
                      p.detail.forEach(d => {
                        itemCounts[d.namaBarang] = (itemCounts[d.namaBarang] || 0) + d.qty;
                      });
                    }
                  });

                  let topItem = '-';
                  let maxQty = 0;
                  Object.entries(itemCounts).forEach(([b, q]) => {
                    if (q > maxQty) {
                      maxQty = q;
                      topItem = b;
                    }
                  });

                  return (
                    <tr key={s.id}>
                      <td className="mono">{s.id}</td>
                      <td><strong>{s.nama}</strong></td>
                      <td>{s.telp || s.telpSeluler || '-'}</td>
                      <td style={{ textAlign: 'center' }}>{jmlTrans} Transaksi</td>
                      <td><strong style={{ color: 'var(--blue)' }}>{fmt(total)}</strong></td>
                      <td style={{ color: 'var(--text2)', fontSize: '12px' }}>
                        {topItem} {maxQty > 0 ? `(${maxQty} Item)` : ''}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="empty">
                      <i className="fa-solid fa-file-invoice"></i>
                      <p>Tidak ada data supplier yang cocok dengan pencarian</p>
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