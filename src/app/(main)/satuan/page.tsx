'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';

export default function MasterSatuan() {
  const { satuanData, addSatuan, deleteSatuan, updateSatuan } = useStore();
  const [namaSatuan, setNamaSatuan] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 💡 STATE BARU: Untuk melacak status edit
  const [editId, setEditId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSatuan.trim()) return;

    try {
      setLoading(true);
      if (editId) {
        // 💡 MODE EDIT: Update data yang sudah ada di Firebase
        await updateSatuan(editId, namaSatuan.trim());
        setEditId(null);
      } else {
        // MODE TAMBAH: Tambah data baru
        await addSatuan(namaSatuan.trim());
      }
      setNamaSatuan('');
    } catch (error) {
      console.error("Gagal memproses data satuan:", error);
    } finally {
      setLoading(false);
    }
  };

  // 💡 FUNGSI BARU: Trigger saat tombol edit di tabel diklik
  const handleEditClick = (id: string, nama: string) => {
    setEditId(id);
    setNamaSatuan(nama);
  };

  // 💡 FUNGSI BARU: Membatalkan mode edit
  const handleBatalEdit = () => {
    setEditId(null);
    setNamaSatuan('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* HEADER PAGE */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Master Data Satuan</h1>
        <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Kelola daftar konversi satuan material bangunan toko</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* FORM TAMBAH / EDIT SATUAN */}
        <div className="card">
          <div className="card-header">
            {/* 💡 Judul panel berubah dinamis sesuai mode */}
            <span className="card-title">{editId ? ' Edit Satuan' : ' Tambah Satuan Baru'}</span>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Nama Satuan <span style={{ color: 'red' }}>*</span></label>
              <input 
                className="input"
                type="text"
                placeholder="Contoh: Pcs, Sak, Batang, Lembar"
                value={namaSatuan}
                onChange={e => setNamaSatuan(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 1, justifyContent: 'center' }}
                disabled={loading}
              >
                <i className={editId ? "fa-solid fa-floppy-disk" : "fa-solid fa-plus"}></i> {loading ? 'Memproses...' : editId ? 'Simpan Perubahan' : 'Tambah Satuan'}
              </button>

              {/* 💡 Tombol Batal muncul hanya saat dalam mode edit */}
              {editId && (
                <button 
                  type="button" 
                  className="btn" 
                  onClick={handleBatalEdit}
                  disabled={loading}
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* TABEL DATA MASTER SATUAN */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Daftar Satuan Terdaftar</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>ID Satuan</th>
                  <th>Nama Satuan</th>
                  <th style={{ width: '180px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {satuanData.length > 0 ? (
                  satuanData.map((satuan) => (
                    <tr key={satuan.id} style={{ background: editId === satuan.id ? 'var(--surface2, rgba(0,0,0,0.02))' : 'transparent' }}>
                      <td className="mono">{satuan.id}</td>
                      <td><strong>{satuan.nama}</strong></td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          {/* 💡 TOMBOL EDIT BARU */}
                          <button 
                            className="btn btn-sm"
                            style={{ color: 'var(--blue, #0288d1)', background: 'rgba(2, 136, 209, 0.1)', border: 'none' }}
                            onClick={() => handleEditClick(satuan.id, satuan.nama)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Edit
                          </button>

                          <button 
                            className="btn btn-sm" 
                            style={{ color: 'var(--red)', background: 'rgba(239, 83, 80, 0.1)', border: 'none' }}
                            onClick={() => {
                              if (confirm(`Hapus satuan "${satuan.nama}"? Opsi ini tidak dapat dibatalkan.`)) {
                                deleteSatuan(satuan.id);
                                if (editId === satuan.id) handleBatalEdit();
                              }
                            }}
                          >
                            <i className="fa-solid fa-trash-can"></i> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>
                      <div className="empty" style={{ padding: '40px 0' }}>
                        <i className="fa-solid fa-box-open" style={{ fontSize: '32px', color: 'var(--text2)' }}></i>
                        <p style={{ marginTop: '8px' }}>Belum ada data satuan. Silakan tambahkan di panel kiri.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}