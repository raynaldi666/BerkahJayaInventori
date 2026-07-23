'use client';

import React, { useState } from 'react';
import { useStore, Pelanggan } from '@/context/StoreContext';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

export default function MasterPelanggan() {
  const { pelanggan, addPelanggan, updatePelanggan, deletePelanggan } = useStore();

  // State untuk mengontrol Modal Input Pelanggan
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form States
  const [namaPelanggan, setNamaPelanggan] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [telp, setTelp] = useState('');
  const [alamatPelanggan, setAlamatPelanggan] = useState('');
  const [alamatPengiriman, setAlamatPengiriman] = useState('');

  // Handler memicu mode edit data master
  const handleKlikEdit = (p: Pelanggan) => {
    setEditId(p.id);
    setNamaPelanggan(p.namaPelanggan);
    setContactPerson(p.contactPerson);
    setTelp(p.telp);
    setAlamatPelanggan(p.alamatPelanggan);
    setAlamatPengiriman(p.alamatPengiriman || '');
    setIsCustomerModalOpen(true);
  };

  const handleHapus = async (id: string) => {
    if (confirm('Hapus profil pelanggan ini?')) {
      await deletePelanggan(id);
      toast('✓ Data pelanggan berhasil dihapus');
    }
  };

  // Handler simpan data (Tambah baru & Edit penyesuaian)
  const handleSimpanProfilPelanggan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPelanggan.trim()) return;

    const payload = {
      namaPelanggan,
      contactPerson,
      telp,
      alamatPelanggan,
      alamatPengiriman
    };

    if (editId) {
      await updatePelanggan( editId, payload );
      toast('✓ Data pelanggan berhasil diperbarui');
    } else {
      await addPelanggan(payload);
      toast('✓ Pelanggan baru berhasil ditambahkan');
    }

    resetForm();
    setIsCustomerModalOpen(false);
  };

  const resetForm = () => {
    setEditId(null);
    setNamaPelanggan('');
    setContactPerson('');
    setTelp('');
    setAlamatPelanggan('');
    setAlamatPengiriman('');
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Data Master Pelanggan</span>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setIsCustomerModalOpen(true); }}>
          <i className="fa-solid fa-plus"></i> Tambah Pelanggan Baru
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Pelanggan</th>
              <th>Contact Person</th>
              <th>No. Telepon</th>
              <th>Alamat Penagihan</th>
              <th>Alamat Tujuan Pengiriman (Proyek)</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pelanggan.length > 0 ? (
              pelanggan.map(c => (
                <tr key={c.id}>
                  <td className="mono">{c.id}</td>
                  <td><strong>{c.namaPelanggan}</strong></td>
                  <td>{c.contactPerson}</td>
                  <td>{c.telp}</td>
                  <td><span style={{ fontSize: '11px', color: 'var(--text2)' }}>{c.alamatPelanggan}</span></td>
                  <td><span style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: 5 }}>{c.alamatPengiriman || '-'}</span></td>
                  <td style={{ textAlign: 'center', display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button className="btn btn-icon btn-primary" onClick={() => handleKlikEdit(c)} title="Ubah Data">
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button className="btn btn-icon btn-danger" onClick={() => handleHapus(c.id)} title="Hapus">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className="empty">
                    <i className="fa-solid fa-users-gear"></i>
                    <p>Belum ada database profil pelanggan</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ==================== POP-UP MODAL: FORM TAMBAH/EDIT PROFIL PELANGGAN ==================== */}
      <Modal 
        isOpen={isCustomerModalOpen} 
        onClose={() => { setIsCustomerModalOpen(false); resetForm(); }} 
        title={editId ? "Ubah Informasi Pelanggan" : "Tambah Pelanggan"}
      >
        <form onSubmit={handleSimpanProfilPelanggan}>
          <div className="form-group">
            <label className="form-label">Nama Pelanggan  <span style={{ color: 'red' }}>*</span></label>
            <input className="input" type="text" placeholder="Contoh: Toko Bangun Sejahtera / Pak Haryanto" value={namaPelanggan} onChange={e => setNamaPelanggan(e.target.value)} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Contact Person (CP) <span style={{ color: 'red' }}>*</span></label>
              <input className="input" type="text" placeholder="Contoh: Ahmad" value={contactPerson} onChange={e => setContactPerson(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">No. Telepon / WA Aktif <span style={{ color: 'red' }}>*</span></label>
              <input className="input" type="text" placeholder="0857XXXXXXXX" value={telp} onChange={e => setTelp(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Alamat Kantor / Rumah Utama <span style={{ color: 'red' }}>*</span></label>
            <textarea 
              className="input" 
              placeholder="Masukkan alamat tinggal atau alamat kantor utama pelanggan..."
              rows={2} 
              value={alamatPelanggan} 
              onChange={e => setAlamatPelanggan(e.target.value)} 
              style={{ resize: 'vertical', fontFamily: 'inherit', padding: '8px' }}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Alamat Pengiriman Logistik (Lokasi Proyek) <span style={{ color: 'red' }}>*</span></label>
            <textarea 
              className="input" 
              placeholder="Masukkan alamat tujuan bongkar muat barang / perumahan / proyek konstruksi..."
              rows={2} 
              value={alamatPengiriman} 
              onChange={e => setAlamatPengiriman(e.target.value)} 
              style={{ resize: 'vertical', fontFamily: 'inherit', padding: '8px' }}
              required 
            />
          </div>

          <div className="modal-footer" style={{ marginTop: '24px' }}>
            <button className="btn" type="button" onClick={() => { setIsCustomerModalOpen(false); resetForm(); }}>Batal</button>
            <button className="btn btn-primary" type="submit">
              <i className="fa-solid fa-floppy-disk"></i> Simpan Profil Pelanggan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}