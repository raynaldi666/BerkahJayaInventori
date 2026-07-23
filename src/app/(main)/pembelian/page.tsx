'use client';

import React, { useState } from 'react';
import { useStore, Pembelian, DetailTransaksi } from '@/context/StoreContext';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

const formatInvoicePembelian = (id: string, tglStr: string) => {
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
    return `FB-${tahun}/${bulan}/${urutan}`;
  } catch (e) {
    return id;
  }
};

export default function TransaksiPembelian() {
  const { pembelian, supplier, barang, createPembelian, updatePembelian, deletePembelian } = useStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNota, setSelectedNota] = useState<Pembelian | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [noInvoiceSupplier, setNoInvoiceSupplier] = useState('');
  const [tglInvoiceSupplier, setTglInvoiceSupplier] = useState('');
  const [tglTerimaBarang, setTglTerimaBarang] = useState('');
  const [statusBayar, setStatusBayar] = useState<'Lunas' | 'Belum Lunas'>('Lunas');

  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [isSupplierFocus, setIsSupplierFocus] = useState(false);

  const [txItems, setTxItems] = useState<{ barangId: string; qty: number | string; hargaBeli: number; searchQuery: string; isFocus: boolean }[]>([
    { barangId: '', qty: '', hargaBeli: 0, searchQuery: '', isFocus: false }
  ]);

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  const handleSelectSupplier = (sId: string, sNama: string) => {
    setSelectedSupplierId(sId);
    setSupplierSearchQuery(''); // Reset query search di dalam dropdown
    setIsSupplierFocus(false);
  };

  const handleAddRow = () => {
    setTxItems([...txItems, { barangId: '', qty: '', hargaBeli: 0, searchQuery: '', isFocus: false }]);
  };

  const handleRemoveRow = (idx: number) => {
    if (txItems.length === 1) return;
    setTxItems(txItems.filter((_, i) => i !== idx));
  };

  const handleQtyChange = (idx: number, val: string) => {
    const next = [...txItems];
    next[idx].qty = val === '' ? '' : Number(val);
    setTxItems(next);
  };

  const handleHargaBeliChange = (idx: number, val: string) => {
    const next = [...txItems];
    next[idx].hargaBeli = Number(val) || 0;
    setTxItems(next);
  };

  const hitungSubtotalBaris = (item: { qty: number | string; hargaBeli: number }) => {
    const kuantitas = item.qty === '' ? 0 : Number(item.qty);
    return kuantitas * item.hargaBeli;
  };

  const hitungGrandTotalForm = () => {
    return txItems.reduce((acc, curr) => acc + hitungSubtotalBaris(curr), 0);
  };

  const handleSimpanTransaksi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      return toast('Harap pilih supplier yang valid dari daftar sugesti', true);
    }

    const validItems = txItems.filter(x => x.barangId !== '');
    if (validItems.length === 0) {
      return toast('Pilih minimal 1 nama barang material restock yang valid!', true);
    }

    const hasInvalidQty = validItems.some(x => x.qty === '' || Number(x.qty) <= 0);
    if (hasInvalidQty) {
      return toast('Gagal! Semua item barang yang dipilih wajib diisi jumlah Qty-nya dengan benar!', true);
    }

    const detailList: DetailTransaksi[] = validItems.map(item => {
      const b = barang.find(x => x.id === item.barangId)!;
      const kuantitas = Number(item.qty);
      return {
        barangId: b.id,
        kodeBarang: b.id,
        namaBarang: b.nama,
        satuan: b.satuan,
        qty: kuantitas,
        hargaSatuan: item.hargaBeli,
        subtotal: kuantitas * item.hargaBeli
      };
    });

    const grandTotal = detailList.reduce((acc, curr) => acc + curr.subtotal, 0);
    const sData = supplier.find(x => x.id === selectedSupplierId)!;

    if (editId) {
      await updatePembelian(editId, {
        supplierId: selectedSupplierId,
        supplierNama: sData.nama,
        noInvoiceSupplier: noInvoiceSupplier || '-',
        tglInvoiceSupplier: tglInvoiceSupplier || '-',
        tglTerimaBarang: tglTerimaBarang || '-',
        status: statusBayar,
        totalPembelian: grandTotal,
        detail: detailList
      });
      toast('✓ Nota Pembelian Berhasil Diperbarui!');
    } else {
      await createPembelian({
        supplierId: selectedSupplierId,
        supplierNama: sData.nama,
        noInvoiceSupplier: noInvoiceSupplier || '-',
        tglInvoiceSupplier: tglInvoiceSupplier || '-',
        tglTerimaBarang: tglTerimaBarang || '-',
        status: statusBayar,
        totalPembelian: grandTotal,
        detail: detailList
      });
      toast('✓ Nota Restock Masuk Berhasil Di-Validasi!');
    }

    resetForm();
    setIsFormOpen(false);
  };

  const handleEditClick = (p: Pembelian) => {
    setEditId(p.id);
    setSelectedSupplierId(p.supplierId);
    setSupplierSearchQuery('');
    setNoInvoiceSupplier(p.noInvoiceSupplier);
    setTglInvoiceSupplier(p.tglInvoiceSupplier);
    setTglTerimaBarang(p.tglTerimaBarang);
    setStatusBayar(p.status);
    setTxItems(p.detail.map(d => ({ barangId: d.barangId, qty: d.qty, hargaBeli: d.hargaSatuan, searchQuery: d.namaBarang, isFocus: false })));
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setEditId(null);
    setSelectedSupplierId('');
    setSupplierSearchQuery('');
    setNoInvoiceSupplier('');
    setTglInvoiceSupplier('');
    setTglTerimaBarang('');
    setStatusBayar('Lunas');
    setTxItems([{ barangId: '', qty: '', hargaBeli: 0, searchQuery: '', isFocus: false }]);
  };

  const handleCetakNota = (p: Pembelian) => {
    let iframe = document.getElementById('print-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'print-iframe';
      iframe.style.position = 'absolute';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
    }

    const noInvoiceBaru = formatInvoicePembelian(p.id, p.tgl || p.tglTerimaBarang);

    const htmlContent = `
      <html>
      <head>
        <title>Nota Restock Masuk - ${noInvoiceBaru}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 13px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f4f4f4; }
          .text-right { text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <div><h2>BERKAH JAYA</h2></div>
          <div style="text-align: right;"><h3>PEMBELIAN</h3><p>No. Invoice: ${noInvoiceBaru}</p></div>
        </div>
        <p>Supplier/Distributor: <strong>${p.supplierNama}</strong></p>
        <p>Tanggal Diterima Gudang: ${p.tglTerimaBarang}</p>
        <table>
          <thead>
            <tr>
              <th>No.</th><th>Nama Material</th><th>Qty</th><th class="text-right">Satuan</th><th class="text-right">Harga Beli Faktur</th><th class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${p.detail.map((item, idx) => `
              <tr>
                <td>${idx + 1}</td><td>${item.namaBarang}</td><td>${item.qty}</td><td class="text-right">${item.satuan}</td><td class="text-right">Rp ${item.hargaSatuan.toLocaleString('id-ID')}</td><td class="text-right">Rp ${item.subtotal.toLocaleString('id-ID')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <h3 style="text-align: right; margin-top: 20px;">Grand Total Pengadaan: Rp ${p.totalPembelian.toLocaleString('id-ID')}</h3>
      </body>
      </html>
    `;

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open(); doc.write(htmlContent); doc.close();
      setTimeout(() => { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); }, 250);
    }
  };

  const filteredDropdownSupplier = supplier.filter(s =>
    s.nama.toLowerCase().includes(supplierSearchQuery.toLowerCase())
  );

  const labelSupplierTerpilih = supplier.find(x => x.id === selectedSupplierId)?.nama || ' Pilih Supplier ';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>Transaksi Pembelian</h1>
          <p style={{ color: 'var(--text2)', fontSize: '13px' }}>Input nota pengadaan masuk barang material dari distributor</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsFormOpen(true); }}>
          <i className="fa-solid fa-plus"></i> Input Pembelian Barang Baru
        </button>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Riwayat Pembelian Barang</span></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>No Invoice</th><th>No. Invoice Supplier</th><th>Tanggal Terima</th><th>Nama Supplier</th><th>Status Pembayaran</th><th>Total Nominal</th><th style={{ textAlign: 'center', width: '120px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pembelian.map(p => (
                <tr key={p.id}>
                  <td className="mono"><strong>{formatInvoicePembelian(p.id, p.tgl || p.tglTerimaBarang)}</strong></td>
                  <td>{p.noInvoiceSupplier}</td>
                  <td>{p.tglTerimaBarang}</td>
                  <td><strong>{p.supplierNama}</strong></td>
                  <td><span className={`badge ${p.status === 'Lunas' ? 'badge-success' : 'badge-danger'}`}>{p.status}</span></td>
                  <td><strong style={{ color: 'var(--blue)' }}>{fmt(p.totalPembelian)}</strong></td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button className="btn btn-icon btn-primary" onClick={() => { setSelectedNota(p); setIsModalOpen(true); }} title="Buka Detail"><i className="fa-solid fa-folder-open"></i></button>
                      <button className="btn btn-icon" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }} onClick={() => handleEditClick(p)} title="Edit Transaksi"><i className="fa-solid fa-pen-to-square" style={{ color: 'var(--blue)' }}></i></button>
                      <button className="btn btn-icon btn-danger" onClick={() => { if(confirm('Hapus?')) deletePembelian(p.id); }} title="Hapus"><i className="fa-solid fa-trash-can"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isFormOpen} onClose={() => { resetForm(); setIsFormOpen(false); }} title={editId ? `Edit Nota Pembelian: ${formatInvoicePembelian(editId, tglTerimaBarang)}` : "Formulir Pembelian"}>
        <form onSubmit={handleSimpanTransaksi} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-row">
            <div className="form-group" style={{ position: 'relative', flex: 2 }}>
              <label className="form-label">Nama Supplier</label>

              {/* 💡 2-IN-1 HYBRID DROPDOWN SYSTEM */}
              <div 
                className="input" 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'var(--surface)' }}
                onClick={() => setIsSupplierFocus(!isSupplierFocus)}
              >
                <span style={{ fontWeight: selectedSupplierId ? 'bold' : 'normal' }}>{labelSupplierTerpilih}</span>
                <i className={`fa-solid ${isSupplierFocus ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ fontSize: '12px', color: 'var(--text2)' }}></i>
              </div>

              {isSupplierFocus && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface2)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '12px', color: 'var(--text2)', marginRight: '6px' }}></i>
                    <input 
                      type="text" 
                      placeholder="Ketik untuk memfilter supplier..." 
                      value={supplierSearchQuery} 
                      onChange={(e) => setSupplierSearchQuery(e.target.value)}
                      style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', padding: '6px 0', fontSize: '13px', color: 'var(--text1)' }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                    {filteredDropdownSupplier.length > 0 ? (
                      filteredDropdownSupplier.map(s => (
                        <div 
                          key={s.id} 
                          style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: '13px', borderRadius: '4px' }} 
                          onClick={(e) => { e.stopPropagation(); handleSelectSupplier(s.id, s.nama); }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface2)'} 
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <strong>{s.nama}</strong> <span style={{ color: 'var(--text2)', fontSize: '11px' }}>({s.jenisSupplier || 'Mitra'})</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '8px 12px', color: 'var(--text2)', fontSize: '12px' }}>Supplier tidak ditemukan</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Status Tagihan</label>
              <select className="input" value={statusBayar} onChange={e => setStatusBayar(e.target.value as any)}>
                <option value="Lunas">Lunas</option>
                <option value="Belum Lunas">Belum Lunas</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nomor Invoice</label>
              <input className="input" placeholder="INV/XYZ/2026/001" value={noInvoiceSupplier} onChange={e => setNoInvoiceSupplier(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Tanggal Invoice</label>
              <input className="input" type="date" value={tglInvoiceSupplier} onChange={e => setTglInvoiceSupplier(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Tanggal Penerimaan</label>
              <input className="input" type="date" value={tglTerimaBarang} onChange={e => setTglTerimaBarang(e.target.value)} required />
            </div>
          </div>

          <div style={{ margin: '10px 0 5px 0', fontWeight: 'bold' }}>Daftar Pembelian</div>

          {txItems.map((item, idx) => {
            const currentB = barang.find(x => x.id === item.barangId);
            const filteredBarangOptions = item.searchQuery.trim() === '' || item.barangId !== '' ? [] :
              barang.filter(b => b.nama.toLowerCase().includes(item.searchQuery.toLowerCase())).slice(0, 5);

            return (
              <div className="form-row" key={idx} style={{ alignItems: 'center', background: 'var(--surface1)', padding: '10px', borderRadius: '6px', gap: '10px' }}>
                <div className="form-group" style={{ flex: 3, position: 'relative' }}>
                  <label className="form-label">Ketik Nama Barang / Material</label>
                  <input 
                    className="input"
                    type="text"
                    placeholder="Masukkan nama material..."
                    value={item.searchQuery}
                    onFocus={() => { const next = [...txItems]; next[idx].isFocus = true; setTxItems(next); }}
                    onBlur={() => { setTimeout(() => { const next = [...txItems]; if(next[idx]) next[idx].isFocus = false; setTxItems(next); }, 200); }}
                    onChange={(e) => { const next = [...txItems]; next[idx].searchQuery = e.target.value; next[idx].barangId = ''; setTxItems(next); }}
                    required
                  />
                  {item.isFocus && filteredBarangOptions.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', zIndex: 120, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                      {filteredBarangOptions.map(b => (
                        <div key={b.id} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: '13px' }} onMouseDown={() => { const next = [...txItems]; next[idx].barangId = b.id; next[idx].searchQuery = b.nama; next[idx].hargaBeli = b.hbeli || 0; setTxItems(next); }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <strong>{b.nama}</strong> <span style={{ color: 'var(--text2)', fontSize: '11px' }}>({b.satuan})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ flex: 1.5 }}>
                  <label className="form-label">Qty</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <input className="input" type="number" min="1" style={{ flex: 1 }} value={item.qty} onChange={e => handleQtyChange(idx, e.target.value)} required />
                    <span style={{ fontSize: '13px', color: 'var(--text1)', fontWeight: 'bold', minWidth: '35px' }}>{currentB ? currentB.satuan : '-'}</span>
                  </div>
                </div>

                <div className="form-group" style={{ flex: 1.5 }}>
                  <label className="form-label">Harga Beli Faktur</label>
                  <input className="input" type="number" min="0" value={item.hargaBeli} onChange={e => handleHargaBeliChange(idx, e.target.value)} required />
                </div>

                <div className="form-group" style={{ flex: 1.5 }}>
                  <label className="form-label">Subtotal</label>
                  <input className="input" value={fmt(hitungSubtotalBaris(item))} disabled style={{ background: 'var(--surface2)', fontWeight: 'bold' }} />
                </div>

                <button type="button" className="btn btn-icon btn-danger" disabled={txItems.length === 1} onClick={() => handleRemoveRow(idx)} style={{ alignSelf: 'center', marginTop: '16px' }}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            );
          })}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <button type="button" className="btn btn-sm" onClick={handleAddRow}>+ Tambah Baris Barang</button>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '13px', color: 'var(--text2)' }}>Total Nominal Faktur:</span>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--blue)', margin: 0 }}>{fmt(hitungGrandTotalForm())}</h3>
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '15px' }}>
            <button type="button" className="btn" onClick={() => { resetForm(); setIsFormOpen(false); }}>Batal</button>
            <button type="submit" className="btn btn-primary"><i className="fa-solid fa-floppy-disk"></i> {editId ? 'Perbarui Nota Restock' : 'Simpan & Validasi Faktur'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedNota(null); }} title={selectedNota ? `Lembar Detail Pengadaan Gudang - ${formatInvoicePembelian(selectedNota.id, selectedNota.tgl || selectedNota.tglTerimaBarang)}` : "Lembar Detail Pengadaan Gudang"}>
        {selectedNota && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', marginBottom: '15px' }}>
              <div>
                <p style={{ margin: '4px 0' }}>No. Invoice: <strong>{formatInvoicePembelian(selectedNota.id, selectedNota.tgl || selectedNota.tglTerimaBarang)}</strong></p>
                <p style={{ margin: '4px 0' }}>Invoice Asli: <strong>{selectedNota.noInvoiceSupplier}</strong></p>
                <p style={{ margin: '4px 0' }}>Supplier: <strong>{selectedNota.supplierNama}</strong></p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '4px 0' }}>Tgl Diterima: {selectedNota.tglTerimaBarang}</p>
                <p style={{ margin: '4px 0' }}>Status: <span className={`badge ${selectedNota.status === 'Lunas' ? 'badge-success' : 'badge-danger'}`}>{selectedNota.status}</span></p>
              </div>
            </div>
            <div className="table-wrap" style={{ marginBottom: '15px', width: '100%' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Item Barang</th><th>Qty</th><th style={{ textAlign: 'right' }}>Satuan</th><th style={{ textAlign: 'right' }}>Harga Beli</th><th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedNota.detail.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.namaBarang}</strong></td><td>{item.qty}</td><td style={{ textAlign: 'right' }}>{item.satuan}</td><td style={{ textAlign: 'right' }}>{fmt(item.hargaSatuan)}</td><td>{fmt(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', width: '100%', boxSizing: 'border-box' }}>
              <span style={{ color: 'var(--text2)', fontSize: '13px' }}>Grand Total Faktur:</span>
              <strong style={{ fontSize: '16px', color: 'var(--text1)' }}>{fmt(selectedNota.totalPembelian)}</strong>
            </div>
            <div className="modal-footer">
              <button className="btn" type="button" onClick={() => { setIsModalOpen(false); setSelectedNota(null); }}>Tutup</button>
              <button className="btn btn-primary" type="button" onClick={() => handleCetakNota(selectedNota)}><i className="fa-solid fa-print"></i> Cetak / Print Nota</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}