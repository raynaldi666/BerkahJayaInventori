'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

export default function TransaksiAdjustment() {
  const { adjustment, barang, addAdjustment } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [tgl, setTgl] = useState('');
  const [barangId, setBarangId] = useState('');
  const [sistem, setSistem] = useState('0');
  const [satuan, setSatuan] = useState('-'); 
  const [jumlahSelisih, setJumlahSelisih] = useState(''); // Mendukung nilai minus otomatis (Contoh: -1 atau 40)
  const [ket, setKet] = useState('');

  useEffect(() => {
    setTgl(new Date().toISOString().slice(0, 10));
  }, []);

  // Sinkronisasi data stok sistem dan satuan berdasarkan barang terpilih
  useEffect(() => {
    if (!barangId && barang.length > 0) {
      const first = barang[0];
      setBarangId(first.id);
      setSistem(first.stok.toString());
      setSatuan(first.satuan);
      return;
    }

    const selected = barang.find(x => x.id === barangId);
    if (selected) {
      setSistem(selected.stok.toString());
      setSatuan(selected.satuan);
    }
  }, [barang, barangId]);

  const handleBarangChange = (id: string) => {
    setBarangId(id);
    const b = barang.find(x => x.id === id);
    if (b) {
      setSistem(b.stok.toString());
      setSatuan(b.satuan);
    }
  };

  const handleTambah = async () => {
    const nilaiMutasi = Number(jumlahSelisih);

    if (!jumlahSelisih.trim() || isNaN(nilaiMutasi) || nilaiMutasi === 0) { 
      toast('Jumlah perubahan wajib diisi dengan angka bilangan bulat positif atau negatif!', true); 
      return; 
    }

    const b = barang.find(x => x.id === barangId);
    if (!b) return;

    // Proteksi agar stok sistem tidak menjadi minus di cloud jika dikurangi berlebihan
    if (nilaiMutasi < 0 && b.stok < Math.abs(nilaiMutasi)) {
      toast(`Gagal! Pengurangan berlebihan, stok ${b.nama} saat ini hanya ${b.stok} ${b.satuan}.`, true);
      return;
    }

    await addAdjustment({
      tgl,
      barangId,
      namaBarang: b.nama,
      qty: nilaiMutasi, // Langsung mengirimkan angka murni positif atau negatif (+40 / -1)
      satuan: b.satuan,
      keterangan: ket
    });
    
    setJumlahSelisih(''); 
    setKet('');
    setIsModalOpen(false);

    toast(`✓ Adjustment berhasil dicatat. Selisih: ${nilaiMutasi > 0 ? '+' : ''}${nilaiMutasi} ${b.satuan}`);
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Stock Adjustment (Penyesuaian Stok Gudang)</span>
        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          <i className="fa-solid fa-plus"></i> Buat Adjustment
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No. ADJ</th>
              <th>Tanggal</th>
              <th>Kode Barang</th>
              <th>Nama Barang</th>
              <th>Qty Perubahan (Selisih)</th>
              <th>Satuan</th>
              <th>Keterangan / Alasan</th>
            </tr>
          </thead>
          <tbody>
            {adjustment.length > 0 ? (
              adjustment.map(adj => (
                <tr key={adj.id}>
                  <td className="mono">{adj.id}</td>
                  <td>{adj.tgl}</td>
                  <td className="mono">{adj.barangId}</td>
                  <td><strong>{adj.namaBarang}</strong></td>
                  <td>
                    <span style={{ 
                      color: adj.qty > 0 ? 'var(--green)' : adj.qty < 0 ? 'var(--red)' : 'inherit', 
                      fontWeight: 'bold' 
                    }}>
                      {adj.qty > 0 ? '+' : ''}{adj.qty}
                    </span>
                  </td>
                  <td>{adj.satuan}</td>
                  <td style={{ color: 'var(--text2)', fontSize: '13px' }}>{adj.keterangan || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className="empty">
                    <i className="fa-solid fa-sliders"></i>
                    <p>Belum ada data riwayat adjustment</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ==================== POP-UP MODAL FORM ADJUSTMENT REVISI ==================== */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Form Input Adjustment Stok">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <input className="input" type="date" value={tgl} onChange={e => setTgl(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Barang Yang Disesuaikan <span style={{ color: 'red' }}>*</span></label>
            <select className="input" value={barangId} onChange={e => handleBarangChange(e.target.value)}>
              {barang.map(b => <option key={b.id} value={b.id}>[{b.id}] {b.nama} (Sisa: {b.stok})</option>)}
            </select>
          </div>
        </div>
        
        <div className="form-row" style={{ alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Stok Sistem Saat Ini</label>
            <input className="input" readOnly value={`${sistem} ${satuan}`} style={{ background: 'var(--surface2)', fontWeight: 'bold' }} />
          </div>

          {/* 🛠️ REVISI POIN 5: Menghapus dropdown Aksi Koreksi, menggantinya dengan petunjuk input tanda minus */}
          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label">
              Jumlah Selisih Kuantitas <span style={{ color: 'red' }}>*</span>
              <span style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 'normal', marginLeft: '6px' }}>
                (Gunakan tanda minus <strong style={{ color: 'var(--red)' }}>-</strong> jika mengurangi)
              </span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                className="input" 
                type="number" 
                placeholder="Contoh: 40 atau -1" 
                value={jumlahSelisih} 
                onChange={e => setJumlahSelisih(e.target.value)} 
                required 
              />
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text2)', minWidth: '40px' }}>{satuan}</span>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Keterangan / Alasan Koreksi <span style={{ color: 'red' }}>*</span></label>
          <input 
            className="input" 
            placeholder="Contoh: Dikurangi 1 Sak untuk di eceran / untuk di ecer di oper dari stock 1 sak 40 kg" 
            value={ket} 
            onChange={e => setKet(e.target.value)} 
            required
          />
        </div>

        <div className="modal-footer" style={{ marginTop: '20px' }}>
          <button className="btn" onClick={() => setIsModalOpen(false)}>Batal</button>
          <button className="btn btn-primary" onClick={handleTambah}><i className="fa-solid fa-floppy-disk"></i> Simpan Adjustment</button>
        </div>
      </Modal>
    </div>
  );
}