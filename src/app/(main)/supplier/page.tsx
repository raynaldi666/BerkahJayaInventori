'use client';

import React, { useState } from 'react';
import { useStore, Supplier } from '@/context/StoreContext';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

export default function MasterSupplier() {
  const { supplier, addSupplier, updateSupplier, deleteSupplier } = useStore();

  // State untuk mengontrol Modal Input Profil Supplier
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Form States
  const [nama, setNama] = useState('');
  const [jenisSupplier, setJenisSupplier] = useState('Pasir');
  const [kontakOrang, setKontakOrang] = useState('');
  const [telp, setTelp] = useState('');
  const [telpSeluler, setTelpSeluler] = useState('');
  const [email, setEmail] = useState('');
  const [alamat, setAlamat] = useState('');

  // Handler saat tombol edit (✏️) diklik
  const handleKlikEdit = (s: Supplier) => {
    setEditId(s.id);
    setNama(s.nama);
    setJenisSupplier(s.jenisSupplier || 'Pasir');
    setKontakOrang(s.kontakOrang);
    setTelp(s.telp);
    setTelpSeluler(s.telpSeluler);
    setEmail(s.email || '');
    setAlamat(s.alamat);
    setIsSupplierModalOpen(true);
  };

  // Handler hapus data master
  const handleHapus = async (id: string) => {
    if (confirm('Hapus profil supplier ini?')) {
      await deleteSupplier(id);
      toast('✓ Profil supplier berhasil dihapus');
    }
  };

  // Handler simpan profil supplier (Bisa Tambah Baru & Edit)
  const handleSimpanProfilSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    const payload = {
      nama,
      jenisSupplier,
      kontakOrang,
      telp,
      telpSeluler,
      email,
      alamat
    };

    if (editId) {
      await updateSupplier(editId,payload );
      toast('✓ Data supplier berhasil diperbarui');
    } else {
      await addSupplier(payload);
      toast('✓ Supplier baru berhasil didaftarkan');
    }

    resetForm();
    setIsSupplierModalOpen(false);
  };

  const resetForm = () => {
    setEditId(null);
    setNama('');
    setJenisSupplier('Pasir');
    setKontakOrang('');
    setTelp('');
    setTelpSeluler('');
    setEmail('');
    setAlamat('');
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Data Master Supplier / Distributor</span>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setIsSupplierModalOpen(true); }}>
          <i className="fa-solid fa-plus"></i> Tambah Supplier Baru
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Supplier</th>
              <th>Jenis Material</th>
              <th>Contact Person</th>
              <th>No. Telepon</th>
              <th>Email</th>
              <th>Alamat Kantor / Gudang</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {supplier.length > 0 ? (
              supplier.map(s => (
                <tr key={s.id}>
                  <td className="mono">{s.id}</td>
                  <td><strong>{s.nama}</strong></td>
                  <td><span className="badge" style={{ background: 'var(--surface2)', color: 'var(--text1)' }}>{s.jenisSupplier || '-'}</span></td>
                  <td>{s.kontakOrang}</td>
                  <td>{s.telpSeluler || s.telp}</td>
                  <td>{s.email || '-'}</td>
                  <td><span style={{ fontSize: '11px', color: 'var(--text2)' }}>{s.alamat}</span></td>
                  <td style={{ textAlign: 'center', display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button className="btn btn-icon btn-primary" onClick={() => handleKlikEdit(s)} title="Ubah Data">
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button className="btn btn-icon btn-danger" onClick={() => handleHapus(s.id)} title="Hapus">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>
                  <div className="empty">
                    <i className="fa-solid fa-truck-field"></i>
                    <p>Belum ada data distributor rekanan toko</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ==================== POP-UP MODAL: FORM TAMBAH/EDIT PROFIL SUPPLIER ==================== */}
      <Modal 
        isOpen={isSupplierModalOpen} 
        onClose={() => { setIsSupplierModalOpen(false); resetForm(); }} 
        title={editId ? "Ubah Data Profil Supplier" : "Tambah Supplier"}
      >
        <form onSubmit={handleSimpanProfilSupplier}>
          <div className="form-group">
            <label className="form-label">Nama Perusahaan / Supplier <span style={{ color: 'red' }}>*</span></label>
            <input className="input" type="text" placeholder="Contoh: PT Semen Nusantara" value={nama} onChange={e => setNama(e.target.value)} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Jenis Material</label>
              <select className="input" value={jenisSupplier} onChange={e => setJenisSupplier(e.target.value)}>
                <option>Pasir</option>
                <option>Cat</option>
                <option>Bata</option>
                <option>Rooster</option>
                <option>Semen</option>
                <option>Besi & Baja</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Nama Kontak (CP) <span style={{ color: 'red' }}>*</span></label>
              <input className="input" type="text" placeholder="Contoh: Budi Santoso" value={kontakOrang} onChange={e => setKontakOrang(e.target.value)} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">No. Telepon Kantor</label>
              <input className="input" type="text" placeholder="021-XXXXXXX" value={telp} onChange={e => setTelp(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">No. Handphone Seluler <span style={{ color: 'red' }}>*</span></label>
              <input className="input" type="text" placeholder="0812XXXXXXXX" value={telpSeluler} onChange={e => setTelpSeluler(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Alamat Email Perusahaan</label>
            <input className="input" type="email" placeholder="distributor@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Alamat Kantor Pusat / Gudang <span style={{ color: 'red' }}>*</span></label>
            <textarea 
              className="input" 
              placeholder="Masukkan alamat lengkap kantor atau lokasi gudang distributor..."
              rows={3} 
              value={alamat} 
              onChange={e => setAlamat(e.target.value)} 
              style={{ resize: 'vertical', fontFamily: 'inherit', padding: '8px' }}
              required 
            />
          </div>

          <div className="modal-footer" style={{ marginTop: '24px' }}>
            <button className="btn" type="button" onClick={() => { setIsSupplierModalOpen(false); resetForm(); }}>Batal</button>
            <button className="btn btn-primary" type="submit">
              <i className="fa-solid fa-floppy-disk"></i> Simpan Profil Supplier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}