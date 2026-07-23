'use client';

import React, { useState } from 'react';
import { useStore, DetailTransaksi } from '@/context/StoreContext';
import Modal from '@/components/Modal';

interface TransaksiMapped {
  id: string;
  tgl: string;
  jenis: 'Pembelian' | 'Penjualan';
  dokumen: string;
  pihak: string;
  total: number;
  status: string;
  detail: DetailTransaksi[];
}

// 💡 Fungsi Helper Utama untuk mengubah ID menjadi format Invoice Baru sesuai jenis transaksi
const formatInvoiceLaporan = (id: string, tglStr: string, jenis: 'Pembelian' | 'Penjualan') => {
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
    
    const prefix = jenis === 'Pembelian' ? 'FB' : 'FJ';
    return `${prefix}-${tahun}/${bulan}/${urutan}`;
  } catch (e) {
    return id;
  }
};

export default function LaporanTransaksi() {
  const { pembelian, penjualan } = useStore();

  // --- STATE FILTER MULTI-KRITERIA ---
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterJenis, setFilterJenis] = useState('Semua'); 
  const [filterStatus, setFilterStatus] = useState('Semua'); 

  // --- STATE MODAL RINCIAN ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransaksiMapped | null>(null);

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  const parseTanggalSistem = (tglStr: string) => {
    if (!tglStr) return new Date(0);
    const [hari, bulan, tahun] = tglStr.split('/');
    return new Date(Number(tahun), Number(bulan) - 1, Number(hari));
  };

  // Gabungkan dan petakan struktur data dari Context
  const allTrans: TransaksiMapped[] = [
    ...pembelian.map((p) => ({
      id: p.id,
      tgl: p.tgl,
      jenis: 'Pembelian' as const,
      dokumen: p.noInvoiceSupplier || p.id,
      pihak: p.supplierNama || 'Supplier Umum',
      total: p.totalPembelian || 0,
      status: p.status || 'Lunas',
      detail: p.detail || []
    })),
    ...penjualan.map((s) => ({
      id: s.id,
      tgl: s.tgl,
      jenis: 'Penjualan' as const,
      dokumen: s.id,
      pihak: s.pelangganNama || 'Pelanggan Umum',
      total: s.totalPenjualan || 0,
      status: s.status || 'Lunas',
      detail: s.detail || []
    }))
  ];

  // --- LOGIKA FILTER MULTI-KRITERIA ---
  const filteredTrans = allTrans.filter((t) => {
    if (startDate || endDate) {
      const currentTxDate = parseTanggalSistem(t.tgl);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        if (currentTxDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23,59,59,999);
        if (currentTxDate > end) return false;
      }
    }
    if (filterJenis !== 'Semua' && t.jenis !== filterJenis) return false;
    if (filterStatus !== 'Semua' && t.status !== filterStatus) return false;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const bukaRincian = (tx: TransaksiMapped) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* ==================== PANEL FILTER MULTI-KRITERIA ==================== */}
      <div className="card">
        <div className="card-header">
          <span className="card-title"><i className="fa-solid fa-filter"></i> Seleksi Kriteria Laporan Transaksi</span>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ width: '160px' }}>
            <label className="form-label" style={{ marginBottom: '6px' }}>Mulai Tanggal</label>
            <input className="input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div style={{ width: '160px' }}>
            <label className="form-label" style={{ marginBottom: '6px' }}>Sampai Tanggal</label>
            <input className="input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div style={{ width: '180px' }}>
            <label className="form-label" style={{ marginBottom: '6px' }}>Jenis Transaksi</label>
            <select className="input" value={filterJenis} onChange={e => setFilterJenis(e.target.value)}>
              <option value="Semua">Semua Jenis</option>
              <option value="Pembelian">Pembelian</option>
              <option value="Penjualan">Penjualan</option>
            </select>
          </div>
          <div style={{ width: '180px' }}>
            <label className="form-label" style={{ marginBottom: '6px' }}>Status Pembayaran</label>
            <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="Semua">Semua Status</option>
              <option value="Lunas">Lunas</option>
              <option value="Belum Lunas">Belum Lunas</option>
            </select>
          </div>
        </div>
      </div>

      {/* ==================== TABEL UTAMA LAPORAN ==================== */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Jurnal Mutasi Transaksi Keuangan</span>
          <button className="btn btn-sm" onClick={handlePrint}>
            <i className="fa-solid fa-print"></i> Cetak Dokumen
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>No. Dokumen / Faktur</th>
                <th>Nama Pihak (Supplier/Pelanggan)</th>
                <th>Total Nominal</th>
                <th>Status</th>
                <th className="no-print" style={{ textAlign: 'center', width: '120px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrans.length > 0 ? (
                filteredTrans.map((t) => (
                  <tr key={`${t.jenis}-${t.id}`}>
                    <td>{t.tgl}</td>
                    <td>
                      <span className={`badge ${t.jenis === 'Pembelian' ? 'badge-blue' : 'badge-green'}`}>
                        {t.jenis}
                      </span>
                    </td>
                    {/* 💡 SINKRONISASI TABEL LAPORAN: Mengubah t.id mentah menjadi format No. Invoice ber-prefix baru (FB-... / FJ-...) */}
                    <td className="mono">
                      <strong>{formatInvoiceLaporan(t.id, t.tgl, t.jenis)}</strong>
                    </td>
                    <td><strong>{t.pihak}</strong></td>
                    <td><strong style={{ color: t.jenis === 'Penjualan' ? 'var(--green)' : 'inherit' }}>{fmt(t.total)}</strong></td>
                    <td>
                      <span className={`badge ${t.status === 'Lunas' ? 'badge-success' : 'badge-danger'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="no-print" style={{ textAlign: 'center' }}>
                      <button 
                        className="btn btn-sm" 
                        style={{ padding: '4px 10px', fontSize: '12px', background: 'var(--surface2)', border: '1px solid var(--border)' }}
                        onClick={() => bukaRincian(t)}
                      >
                        <i className="fa-solid fa-eye"></i> Rincian
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className="empty">
                      <i className="fa-solid fa-file-lines"></i>
                      <p>Tidak ada riwayat mutasi transaksi pada kriteria filter ini</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== POP-UP MODAL RINCIAN READ-ONLY ==================== */}
      {/* 💡 SINKRONISASI JUDUL MODAL: Judul pop-up detail selaras dengan format baru */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedTx(null); }} 
        title={`Rincian Barang - ${selectedTx ? formatInvoiceLaporan(selectedTx.id, selectedTx.tgl, selectedTx.jenis) : ''}`}
      >
        {selectedTx && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px', background: 'var(--surface2)', padding: '12px', borderRadius: '6px' }}>
              <div>
                {/* 💡 SINKRONISASI ISI DESKRIPSI MODAL */}
                <span style={{ color: 'var(--text2)' }}>No. Invoice:</span>
                <p><strong>{formatInvoiceLaporan(selectedTx.id, selectedTx.tgl, selectedTx.jenis)}</strong></p>
              </div>
              <div>
                <span style={{ color: 'var(--text2)' }}>Nama Pihak Kedua:</span>
                <p><strong>{selectedTx.pihak}</strong></p>
              </div>
              <div>
                <span style={{ color: 'var(--text2)' }}>Tanggal Input Jurnal:</span>
                <p><strong>{selectedTx.tgl}</strong></p>
              </div>
              <div>
                <span style={{ color: 'var(--text2)' }}>Status Nota Keuangan:</span>
                <p><strong>{selectedTx.status}</strong></p>
              </div>
            </div>

            <div style={{ maxHeight: '260px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '6px' }}>
              <table style={{ margin: 0, width: '100%' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: '8px' }}>Nama Barang</th>
                    <th style={{ textAlign: 'center', padding: '8px' }}>Qty</th>
                    <th style={{ padding: '8px' }}>Satuan</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Harga</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTx.detail.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '8px' }}>{item.namaBarang}</td>
                      <td style={{ textAlign: 'center', padding: '8px' }}>{item.qty}</td>
                      <td style={{ padding: '8px' }}>{(item.satuan || '').trim()}</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>{Math.round(item.hargaSatuan).toLocaleString('id-ID')}</td>
                      <td style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold' }}>{Math.round(item.subtotal).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ textAlign: 'right', borderTop: '2px dashed var(--border)', paddingTop: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text2)' }}>Total Transaksi Bersih:</span>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: selectedTx.jenis === 'Penjualan' ? 'var(--green)' : 'inherit' }}>{fmt(selectedTx.total)}</h3>
            </div>

            <div className="modal-footer" style={{ padding: 0, marginTop: '8px' }}>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>
                Tutup Pratinjau
              </button>
            </div>
          </div>
        )}
      </Modal>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}