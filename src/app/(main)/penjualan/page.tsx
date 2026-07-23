'use client';

import React, { useState, useEffect } from 'react';
import { useStore, Penjualan, DetailTransaksi } from '@/context/StoreContext';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

const formatInvoicePenjualan = (id: string, tglStr: string) => {
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
    
    return `FJ-${tahun}/${bulan}/${urutan}`;
  } catch (e) {
    return id; 
  }
};

export default function TransaksiPenjualan() {
  const { penjualan, pelanggan, barang, createPenjualan, updatePenjualan, deletePenjualan } = useStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNota, setSelectedNota] = useState<Penjualan | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [selectedPelangganId, setSelectedPelangganId] = useState('');
  const [alamatPengirimanSesaat, setAlamatPengirimanSesaat] = useState('');
  const [statusBayar, setStatusBayar] = useState<'Lunas' | 'Belum Lunas'>('Lunas');
  
  const [pelangganSearchQuery, setPelangganSearchQuery] = useState('');
  const [isPelangganFocus, setIsPelangganFocus] = useState(false);
  
  const [txItems, setTxItems] = useState<{ barangId: string; qty: number | string; hargaJual: number; searchQuery: string; isFocus: boolean }[]>([
    { barangId: '', qty: '', hargaJual: 0, searchQuery: '', isFocus: false }
  ]);

  const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  useEffect(() => {
    if (selectedPelangganId && selectedPelangganId !== 'UMUM') {
      const p = pelanggan.find(x => x.id === selectedPelangganId);
      if (p) setAlamatPengirimanSesaat(p.alamatPengiriman || p.alamatPelanggan);
    }
  }, [selectedPelangganId, pelanggan]);

  const handleSetPelangganUmum = () => {
    setSelectedPelangganId('UMUM');
    setAlamatPengirimanSesaat('-');
    setIsPelangganFocus(false);
    toast('Transaksi diatur ke Pelanggan Umum');
  };

  const handleSelectPelanggan = (id: string, nama: string) => {
    setSelectedPelangganId(id);
    setPelangganSearchQuery(''); // Reset query search di dalam dropdown setelah pilih
    setIsPelangganFocus(false);
  };

  const handleAddRow = () => {
    setTxItems([...txItems, { barangId: '', qty: '', hargaJual: 0, searchQuery: '', isFocus: false }]);
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

  const handleHargaJualChange = (idx: number, val: string) => {
    const next = [...txItems];
    next[idx].hargaJual = Number(val) || 0;
    setTxItems(next);
  };

  const hitungSubtotalBaris = (item: { qty: number | string; hargaJual: number }) => {
    const kuantitas = item.qty === '' ? 0 : Number(item.qty);
    return kuantitas * item.hargaJual;
  };

  const hitungGrandTotalForm = () => {
    return txItems.reduce((acc, curr) => acc + hitungSubtotalBaris(curr), 0);
  };

  const handleSimpanTransaksi = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let namaFinalPelanggan = 'Pelanggan Umum';
    if (selectedPelangganId && selectedPelangganId !== 'UMUM') {
      const pData = pelanggan.find(x => x.id === selectedPelangganId);
      if (pData) namaFinalPelanggan = pData.namaPelanggan;
    }

    const validItems = txItems.filter(x => x.barangId !== '');
    if (validItems.length === 0) {
      return toast('Pilih minimal 1 nama barang material pengeluaran yang valid!', true);
    }

    const hasInvalidQty = validItems.some(x => x.qty === '' || Number(x.qty) <= 0);
    if (hasInvalidQty) {
      return toast('Gagal! Semua item barang yang dipilih wajib diisi jumlah Qty-nya dengan benar!', true);
    }

    for (const item of validItems) {
      const b = barang.find(x => x.id === item.barangId)!;
      const kuantitasDibutuhkan = Number(item.qty);

      if (editId) {
        const notaLama = penjualan.find(x => x.id === editId);
        const detailLama = notaLama?.detail.find(d => d.barangId === item.barangId);
        const qtyLama = detailLama ? detailLama.qty : 0;

        if (kuantitasDibutuhkan > (b.stok + qtyLama)) {
          return toast(`Gagal Simpan! Stok Barang "${b.nama}" tidak mencukupi. Sisa gudang: ${b.stok + qtyLama} ${b.satuan}`, true);
        }
      } else {
        if (kuantitasDibutuhkan > b.stok) {
          return toast(`Gagal Simpan! Stok Barang "${b.nama}" tidak mencukupi. Sisa gudang: ${b.stok} ${b.satuan}`, true);
        }
      }
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
        hargaSatuan: item.hargaJual,
        subtotal: kuantitas * item.hargaJual
      };
    });

    const grandTotal = detailList.reduce((acc, curr) => acc + curr.subtotal, 0);

    if (editId) {
      await updatePenjualan(editId, {
        pelangganId: selectedPelangganId || 'UMUM',
        pelangganNama: namaFinalPelanggan,
        alamatPengiriman: alamatPengirimanSesaat || '-',
        status: statusBayar,
        totalPenjualan: grandTotal,
        detail: detailList
      });
      toast('✓ Nota Penjualan Berhasil Diperbarui!');
    } else {
      await createPenjualan({
        pelangganId: selectedPelangganId || 'UMUM',
        pelangganNama: namaFinalPelanggan,
        alamatPengiriman: alamatPengirimanSesaat || '-',
        status: statusBayar,
        totalPenjualan: grandTotal,
        detail: detailList
      });
      toast('✓ Nota Penjualan Berhasil Disimpan!');
    }

    resetForm();
    setIsFormOpen(false);
  };

  const handleEditClick = (p: Penjualan) => {
    setEditId(p.id);
    setSelectedPelangganId(p.pelangganId);
    setPelangganSearchQuery('');
    setAlamatPengirimanSesaat(p.alamatPengiriman);
    setStatusBayar(p.status);
    setTxItems(p.detail.map(d => ({ barangId: d.barangId, qty: d.qty, hargaJual: d.hargaSatuan, searchQuery: d.namaBarang, isFocus: false })));
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setEditId(null);
    setSelectedPelangganId('');
    setPelangganSearchQuery('');
    setAlamatPengirimanSesaat('');
    setStatusBayar('Lunas');
    setTxItems([{ barangId: '', qty: '', hargaJual: 0, searchQuery: '', isFocus: false }]);
  };

  const handleCetakNota = (p: Penjualan) => {
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

    const noInvoiceBaru = formatInvoicePenjualan(p.id, p.tgl);

    const htmlContent = `
      <html>
      <head>
        <title>Nota Penjualan Toko - ${noInvoiceBaru}</title>
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
          <div style="text-align: right;"><h3>FAKTUR PENJUALAN</h3><p>No. Invoice: ${noInvoiceBaru}</p></div>
        </div>
        <p>Pelanggan / Pembeli: <strong>${p.pelangganNama}</strong></p>
        <p>Alamat Pengiriman Tujuan: ${p.alamatPengiriman}</p>
        <p>Tanggal Transaksi Nota: ${p.tgl}</p>
        <table>
          <thead>
            <tr>
              <th>No.</th><th>Nama Material</th><th>Qty</th><th class="text-right">Satuan</th><th class="text-right">Harga Jual Satuan</th><th class="text-right">Subtotal</th>
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
        <h3 style="text-align: right; margin-top: 20px;">Grand Total Tagihan: Rp ${p.totalPenjualan.toLocaleString('id-ID')}</h3>
      </body>
      </html>
    `;

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open(); doc.write(htmlContent); doc.close();
      setTimeout(() => { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); }, 250);
    }
  };

  // Filter list pelanggan di dalam box dropdown search
  const filteredDropdownPelanggan = pelanggan.filter(p =>
    p.namaPelanggan.toLowerCase().includes(pelangganSearchQuery.toLowerCase())
  );

  // Ambil nama tersemat saat ini untuk display di kepala select dropdown
  const labelPelangganTerpilih = selectedPelangganId === 'UMUM' 
    ? 'Pelanggan Umum' 
    : (pelanggan.find(x => x.id === selectedPelangganId)?.namaPelanggan || ' Pilih Pelanggan ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>Transaksi Penjualan</h1>
          <p style={{ color: 'var(--text2)', fontSize: '13px' }}>Catat penjualan keluar barang material komersial toko ke customer</p>
        </div>
        <button className="btn btn-green" onClick={() => { resetForm(); setIsFormOpen(true); }}>
          <i className="fa-solid fa-cart-plus"></i> Catat Penjualan Baru
        </button>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Riwayat Penjualan Barang</span></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>No Invoice</th><th>Tanggal Nota</th><th>Nama Pelanggan</th><th>Tujuan Pengiriman</th><th>Status Pembayaran</th><th>Total Transaksi</th><th style={{ textAlign: 'center', width: '120px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {penjualan.map(p => (
                <tr key={p.id}>
                  <td className="mono"><strong>{formatInvoicePenjualan(p.id, p.tgl)}</strong></td>
                  <td>{p.tgl}</td>
                  <td><strong>{p.pelangganNama}</strong></td>
                  <td><span className="text-muted" style={{ fontSize: '12px' }}>{p.alamatPengiriman}</span></td>
                  <td><span className={`badge ${p.status === 'Lunas' ? 'badge-success' : 'badge-danger'}`}>{p.status}</span></td>
                  <td><strong style={{ color: 'var(--green)' }}>{fmt(p.totalPenjualan)}</strong></td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button className="btn btn-icon btn-primary" onClick={() => { setSelectedNota(p); setIsModalOpen(true); }} title="Buka Detail"><i className="fa-solid fa-folder-open"></i></button>
                      <button className="btn btn-icon" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }} onClick={() => handleEditClick(p)} title="Edit Transaksi"><i className="fa-solid fa-pen-to-square" style={{ color: 'var(--green)' }}></i></button>
                      <button className="btn btn-icon btn-danger" onClick={() => { if(confirm('Hapus nota transaksi?')) deletePenjualan(p.id); }} title="Hapus"><i className="fa-solid fa-trash-can"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isFormOpen} onClose={() => { resetForm(); setIsFormOpen(false); }} title={editId ? `Edit Nota Penjualan: ${formatInvoicePenjualan(editId, txItems[0]?.searchQuery || '')}` : "Formulir Catat Penjualan Toko"}>
        <form onSubmit={handleSimpanTransaksi} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-row">
            <div className="form-group" style={{ position: 'relative', flex: 2 }}>
              <label className="form-label" style={{ marginBottom: '4px' }}>Nama pelanggan</label>

              {/* 💡 2-IN-1 HYBRID DROPDOWN SYSTEM */}
              <div 
                className="input" 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'var(--surface)' }}
                onClick={() => setIsPelangganFocus(!isPelangganFocus)}
              >
                <span style={{ fontWeight: selectedPelangganId ? 'bold' : 'normal' }}>{labelPelangganTerpilih}</span>
                <i className={`fa-solid ${isPelangganFocus ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ fontSize: '12px', color: 'var(--text2)' }}></i>
              </div>

              {/* Box Kontainer Menu Dropdown yang berisi Kolom Search */}
              {isPelangganFocus && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  
                  {/* Bagian Input Search di dalam Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface2)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '12px', color: 'var(--text2)', marginRight: '6px' }}></i>
                    <input 
                      type="text" 
                      placeholder="Ketik untuk memfilter nama..." 
                      value={pelangganSearchQuery} 
                      onChange={(e) => setPelangganSearchQuery(e.target.value)}
                      style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', padding: '6px 0', fontSize: '13px', color: 'var(--text1)' }}
                      onClick={(e) => e.stopPropagation()} // Supaya tidak menutup dropdown saat diklik
                    />
                  </div>

                  {/* List Opsi Dropdown */}
                  <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                    {filteredDropdownPelanggan.length > 0 ? (
                      filteredDropdownPelanggan.map(pl => (
                        <div 
                          key={pl.id} 
                          style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: '13px', borderRadius: '4px' }} 
                          onClick={(e) => { e.stopPropagation(); handleSelectPelanggan(pl.id, pl.namaPelanggan); }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface2)'} 
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <strong>{pl.namaPelanggan}</strong> <span style={{ color: 'var(--text2)', fontSize: '11px' }}>({pl.contactPerson || 'Pelanggan'})</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '8px 12px', color: 'var(--text2)', fontSize: '12px' }}>Pelanggan tidak ditemukan</div>
                    )}
                  </div>
                </div>
              )}

              {/* Checkbox Eceran di bagian bawah */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', color: 'var(--text2)', userSelect: 'none', marginTop: '8px' }}>
                <input 
                  type="checkbox" 
                  checked={selectedPelangganId === 'UMUM'}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleSetPelangganUmum();
                    } else {
                      resetForm();
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <span>Tandai sebagai pelanggan umum</span>
              </label>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Status Bayar Pembeli</label>
              <select className="input" value={statusBayar} onChange={e => setStatusBayar(e.target.value as any)}>
                <option value="Lunas">Lunas</option>
                <option value="Belum Lunas">Belum Lunas</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Alamat Pengiriman Tujuan (Opsional)</label>
            <textarea className="input" rows={2} placeholder="Alamat lengkap pengantaran muatan material... (Bisa dikosongkan jika eceran)" value={alamatPengirimanSesaat} onChange={e => setAlamatPengirimanSesaat(e.target.value)} />
          </div>

          <div style={{ margin: '10px 0 5px 0', fontWeight: 'bold' }}><span>Daftar Muatan Barang Keluar</span></div>

          {txItems.map((item, idx) => {
            const currentB = barang.find(x => x.id === item.barangId);
            const filteredBarangOptions = item.searchQuery.trim() === '' || item.barangId !== '' ? [] :
              barang.filter(b => b.nama.toLowerCase().includes(item.searchQuery.toLowerCase())).slice(0, 5);

            return (
              <div className="form-row" key={idx} style={{ alignItems: 'center', background: 'var(--surface1)', padding: '10px', borderRadius: '6px', gap: '10px' }}>
                <div className="form-group" style={{ flex: 3, position: 'relative' }}>
                  <label className="form-label">Pilih Nama Produk Material</label>
                  <input 
                    className="input"
                    type="text"
                    placeholder="Masukkan kata kunci produk..."
                    value={item.searchQuery}
                    onFocus={() => { const next = [...txItems]; next[idx].isFocus = true; setTxItems(next); }}
                    onBlur={() => { setTimeout(() => { const next = [...txItems]; if(next[idx]) next[idx].isFocus = false; setTxItems(next); }, 200); }}
                    onChange={(e) => { const next = [...txItems]; next[idx].searchQuery = e.target.value; next[idx].barangId = ''; setTxItems(next); }}
                    required
                  />
                  {item.isFocus && filteredBarangOptions.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', zIndex: 120, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                      {filteredBarangOptions.map(b => (
                        <div key={b.id} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: '13px' }} onMouseDown={() => { const next = [...txItems]; next[idx].barangId = b.id; next[idx].searchQuery = b.nama; next[idx].hargaJual = b.hjual || 0; setTxItems(next); }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <strong>{b.nama}</strong> <span style={{ color: 'var(--text2)', fontSize: '11px' }}>- Sisa Gudang: {b.stok} ({b.satuan})</span>
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
                  <label className="form-label">Harga Jual Satuan (Rp)</label>
                  <input className="input" type="number" min="0" value={item.hargaJual} onChange={e => handleHargaJualChange(idx, e.target.value)} required />
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
            <button type="button" className="btn btn-sm" onClick={handleAddRow}>+ Tambah Baris Transaksi</button>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '13px', color: 'var(--text2)' }}>Total Nominal Tagihan:</span>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--green)', margin: 0 }}>{fmt(hitungGrandTotalForm())}</h3>
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '15px' }}>
            <button type="button" className="btn" onClick={() => { resetForm(); setIsFormOpen(false); }}>Batal</button>
            <button type="submit" className="btn btn-green"><i className="fa-solid fa-square-check"></i> {editId ? 'Perbarui Nota Faktur' : 'Simpan & Validasi Keluar'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedNota(null); }} title={selectedNota ? `Lembar Rincian Penjualan Toko - ${formatInvoicePenjualan(selectedNota.id, selectedNota.tgl)}` : "Lembar Rincian Penjualan"}>
        {selectedNota && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', marginBottom: '15px' }}>
              <div>
                <p style={{ margin: '4px 0' }}>No. Invoice: <strong>{formatInvoicePenjualan(selectedNota.id, selectedNota.tgl)}</strong></p>
                <p style={{ margin: '4px 0' }}>Pelanggan: <strong>{selectedNota.pelangganNama}</strong></p>
                <p style={{ margin: '4px 0' }}>Tujuan Muatan: <span className="text-muted">{selectedNota.alamatPengiriman || '-'}</span></p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '4px 0' }}>Tanggal Nota: {selectedNota.tgl}</p>
                <p style={{ margin: '4px 0' }}>Status: <span className={`badge ${selectedNota.status === 'Lunas' ? 'badge-success' : 'badge-danger'}`}>{selectedNota.status}</span></p>
              </div>
            </div>
            <div className="table-wrap" style={{ marginBottom: '15px', width: '100%' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Item Barang</th><th>Qty</th><th style={{ textAlign: 'right' }}>Satuan</th><th style={{ textAlign: 'right' }}>Harga Jual</th><th>Subtotal</th>
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
              <span style={{ color: 'var(--text2)', fontSize: '13px' }}>Grand Total Tagihan:</span>
              <strong style={{ fontSize: '16px', color: 'var(--text1)' }}>{fmt(selectedNota.totalPenjualan)}</strong>
            </div>
            <div className="modal-footer">
              <button className="btn" type="button" onClick={() => { setIsModalOpen(false); setSelectedNota(null); }}>Tutup</button>
              <button className="btn btn-green" type="button" onClick={() => handleCetakNota(selectedNota)}><i className="fa-solid fa-print"></i> Cetak / Print Nota</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}