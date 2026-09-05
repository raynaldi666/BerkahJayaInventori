'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

// ==================== INTERFACES MASTER & TRANSAKSI ====================

export interface SatuanMaster {
  id: string;
  nama: string;
}

export interface Barang {
  id: string;
  nama: string;
  kategori: string;
  satuan: string;
  hbeli: number;
  hjual: number;
  stok: number;
  minstok: number;
  keterangan?: string;
}

export interface Supplier {
  id: string;
  nama: string;
  jenisSupplier: string;
  kontakOrang: string;
  telp: string;
  telpSeluler: string;
  email: string;
  alamat: string;
}

export interface Pelanggan {
  id: string;
  namaPelanggan: string;
  contactPerson: string;
  telp: string;
  alamatPelanggan: string;
  alamatPengiriman: string;
}

export interface DetailTransaksi {
  barangId: string;
  kodeBarang: string;
  namaBarang: string;
  qty: number;
  satuan: string;
  hargaSatuan: number;
  subtotal: number;
}

export interface Pembelian {
  id: string;
  tgl: string;
  supplierId: string;
  supplierNama: string;
  noInvoiceSupplier: string;
  tglInvoiceSupplier: string;
  tglTerimaBarang: string;
  status: 'Lunas' | 'Belum Lunas';
  totalPembelian: number;
  detail: DetailTransaksi[];
}

export interface Penjualan {
  id: string;
  tgl: string;
  pelangganId: string;
  pelangganNama: string;
  alamatPengiriman: string;
  status: 'Lunas' | 'Belum Lunas';
  totalPenjualan: number;
  detail: DetailTransaksi[];
}

export interface AdjustmentStok {
  id: string;
  tgl: string;
  barangId: string;
  namaBarang: string;
  qty: number;
  satuan: string;
  keterangan: string;
  stokSebelum: number;
  stokSesudah: number;
}

interface StoreContextProps {
  satuanData: SatuanMaster[];
  barang: Barang[];
  supplier: Supplier[];
  pelanggan: Pelanggan[];
  pembelian: Pembelian[];
  penjualan: Penjualan[];
  adjustment: AdjustmentStok[];
  
  genIdBarang: (kategori: string) => string;
  
  addSatuan: (nama: string) => Promise<void>;
  deleteSatuan: (id: string) => Promise<void>;
  updateSatuan: (id: string, nama: string) => Promise<void>;
  
  addBarang: (data: Omit<Barang, 'id' | 'stok'> & { id: string }) => Promise<void>;
  deleteBarang: (id: string) => Promise<void>;
  updateBarang: (id: string, data: Partial<Barang>) => Promise<void>;
  
  addSupplier: (data: Omit<Supplier, 'id'>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>;
  
  addPelanggan: (data: Omit<Pelanggan, 'id'>) => Promise<void>;
  deletePelanggan: (id: string) => Promise<void>;
  updatePelanggan: (id: string, data: Partial<Pelanggan>) => Promise<void>;
  
  createPembelian: (data: Omit<Pembelian, 'id' | 'tgl'>) => Promise<void>;
  updatePembelian: (id: string, data: Partial<Pembelian>) => Promise<void>;
  deletePembelian: (id: string) => Promise<void>;
  
  createPenjualan: (data: Omit<Penjualan, 'id' | 'tgl'>) => Promise<void>;
  updatePenjualan: (id: string, data: Partial<Penjualan>) => Promise<void>;
  deletePenjualan: (id: string) => Promise<void>;
  
  addAdjustment: (data: Omit<AdjustmentStok, 'id' | 'stokSebelum' | 'stokSesudah'>) => Promise<void>;
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [satuanData, setSatuanData] = useState<SatuanMaster[]>([]);
  const [barang, setBarang] = useState<Barang[]>([]);
  const [supplier, setSupplier] = useState<Supplier[]>([]);
  const [pelanggan, setPelanggan] = useState<Pelanggan[]>([]);
  const [pembelian, setPembelian] = useState<Pembelian[]>([]);
  const [penjualan, setPenjualan] = useState<Penjualan[]>([]);
  const [adjustment, setAdjustment] = useState<AdjustmentStok[]>([]);

  useEffect(() => {
    const unsubSatuan = onSnapshot(collection(db, 'satuan'), (snap) => {
      setSatuanData(snap.docs.map(d => d.data() as SatuanMaster));
    });
    const unsubBarang = onSnapshot(collection(db, 'barang'), (snap) => {
      setBarang(snap.docs.map(d => d.data() as Barang));
    });
    const unsubSupplier = onSnapshot(collection(db, 'supplier'), (snap) => {
      setSupplier(snap.docs.map(d => d.data() as Supplier));
    });
    const unsubPelanggan = onSnapshot(collection(db, 'pelanggan'), (snap) => {
      setPelanggan(snap.docs.map(d => d.data() as Pelanggan));
    });
    const unsubPembelian = onSnapshot(collection(db, 'pembelian'), (snap) => {
      setPembelian(snap.docs.map(d => d.data() as Pembelian));
    });
    const unsubPenjualan = onSnapshot(collection(db, 'penjualan'), (snap) => {
      setPenjualan(snap.docs.map(d => d.data() as Penjualan));
    });
    const unsubAdjust = onSnapshot(collection(db, 'adjustment'), (snap) => {
      setAdjustment(snap.docs.map(d => d.data() as AdjustmentStok));
    });

    return () => {
      unsubSatuan(); unsubBarang(); unsubSupplier();
      unsubPelanggan(); unsubPembelian(); unsubPenjualan(); unsubAdjust();
    };
  }, []);

  const genIdBarang = (kategori: string) => {
    let prefixKategori = 'OT';
    if (kategori === 'Semen & Bahan Dasar') prefixKategori = 'BD';
    else if (kategori === 'Besi & Baja') prefixKategori = 'BL';
    else if (kategori === 'Cat & Pelapis') prefixKategori = 'CT';
    else if (kategori === 'Keramik & Granit') prefixKategori = 'KL';
    else if (kategori === 'Pipa & Sanitasi') prefixKategori = 'PK';
    else if (kategori === 'Kayu & Triplek') prefixKategori = 'KT';
    
    const barangSamaKategori = barang.filter(b => b.id.startsWith(prefixKategori));
    const ambilAngka = barangSamaKategori.map(b => {
      const angka = parseInt(b.id.replace(prefixKategori, ''), 10);
      return isNaN(angka) ? 0 : angka;
    });
    const angkaBerikutnya = ambilAngka.length > 0 ? Math.max(...ambilAngka) + 1 : 1;
    return `${prefixKategori}${String(angkaBerikutnya).padStart(4, '0')}`;
  };

  const genIdTransaksi = (prefix: 'SP' | 'PL' | 'BM' | 'FK' | 'ADJ' | 'ST') => {
    let listData: { id: string }[] = [];
    if (prefix === 'SP') listData = supplier;
    else if (prefix === 'PL') listData = pelanggan;
    else if (prefix === 'BM') listData = pembelian;
    else if (prefix === 'FK') listData = penjualan;
    else if (prefix === 'ADJ') listData = adjustment.map(a => ({ id: a.id }));
    else if (prefix === 'ST') listData = satuanData;

    const ambilAngka = listData.map(item => {
      const angka = parseInt(item.id.replace(prefix, ''), 10);
      return isNaN(angka) ? 0 : angka;
    });
    const angkaBerikutnya = ambilAngka.length > 0 ? Math.max(...ambilAngka) + 1 : 1;
    const digitPad = (prefix === 'BM' || prefix === 'FK' || prefix === 'ADJ') ? 4 : 3;
    return prefix + String(angkaBerikutnya).padStart(digitPad, '0');
  };

  // ==================== 1. MASTER SATUAN ====================
  const addSatuan = async (nama: string) => {
    const nextId = genIdTransaksi('ST');
    await setDoc(doc(db, 'satuan', nextId), { id: nextId, nama });
  };

  const deleteSatuan = async (id: string) => {
    await deleteDoc(doc(db, 'satuan', id));
  };

  // 💡 FIX POSITION: Mengeluarkan fungsi updateSatuan ke area provider utama agar bisa diexport
  const updateSatuan = async (id: string, nama: string) => {
    await setDoc(doc(db, 'satuan', id), { id, nama });
  };

  // ==================== 2. MASTER BARANG ====================
  const addBarang = async (data: Omit<Barang, 'id' | 'stok'> & { id: string }) => {
    await setDoc(doc(db, 'barang', data.id), { ...data, stok: 0 });
  };

  const deleteBarang = async (id: string) => {
    await deleteDoc(doc(db, 'barang', id));
  };

  const updateBarang = async (id: string, data: Partial<Barang>) => {
    const target = barang.find(b => b.id === id);
     if (!target) return;

    // If kategori is changing, create a new ID and migrate references.
    if (data.kategori && data.kategori !== target.kategori) {
      const newId = genIdBarang(data.kategori);
      const newBarang: Barang = { ...target, ...data, id: newId } as Barang;

      // Create new barang document with the new ID
      await setDoc(doc(db, 'barang', newId), newBarang);

      // Update references in pembelian (detail.barangId, detail.kodeBarang, detail.namaBarang)
      for (const p of pembelian) {
        let changed = false;
        const newDetail = p.detail.map(d => {
          if (d.barangId === id) {
            changed = true;
            return { ...d, barangId: newId, kodeBarang: newId, namaBarang: newBarang.nama }; 
          }
          return d;
        });
        if (changed) {
          await setDoc(doc(db, 'pembelian', p.id), { ...p, detail: newDetail });
        }
      }

      // Update references in penjualan (detail.barangId, detail.kodeBarang, detail.namaBarang)
      for (const p of penjualan) {
        let changed = false;
        const newDetail = p.detail.map(d => {
          if (d.barangId === id) {
            changed = true;
            return { ...d, barangId: newId, kodeBarang: newId, namaBarang: newBarang.nama };
          }
          return d;
        });
        if (changed) {
          await setDoc(doc(db, 'penjualan', p.id), { ...p, detail: newDetail });
        }
      }

      // Update references in adjustment (barangId, namaBarang)
      for (const a of adjustment) {
        if (a.barangId === id) {
          await setDoc(doc(db, 'adjustment', a.id), { ...a, barangId: newId, namaBarang: newBarang.nama });
        }
      }

      // Remove old barang document
      await deleteDoc(doc(db, 'barang', id));

      return;
    }

    // Default: update in-place
    await setDoc(doc(db, 'barang', id), { ...target, ...data });
  };

  // ==================== 3. MASTER SUPPLIER ====================
  const addSupplier = async (data: Omit<Supplier, 'id'>) => {
    const nextId = genIdTransaksi('SP');
    await setDoc(doc(db, 'supplier', nextId), { ...data, id: nextId });
  };

  const deleteSupplier = async (id: string) => {
    await deleteDoc(doc(db, 'supplier', id));
  };

  const updateSupplier = async (id: string, data: Partial<Supplier>) => {
    const target = supplier.find(s => s.id === id);
    if (target) await setDoc(doc(db, 'supplier', id), { ...target, ...data });
  };

  // ==================== 4. MASTER PELANGGAN ====================
  const addPelanggan = async (data: Omit<Pelanggan, 'id'>) => {
    const nextId = genIdTransaksi('PL');
    await setDoc(doc(db, 'pelanggan', nextId), { ...data, id: nextId });
  };

  const deletePelanggan = async (id: string) => {
    await deleteDoc(doc(db, 'pelanggan', id));
  };

  const updatePelanggan = async (id: string, data: Partial<Pelanggan>) => {
    const target = pelanggan.find(p => p.id === id);
    if (target) await setDoc(doc(db, 'pelanggan', id), { ...target, ...data });
  };

  // ==================== 5. TRANSAKSI PEMBELIAN ====================
  const createPembelian = async (data: Omit<Pembelian, 'id' | 'tgl'>) => {
    const nextId = genIdTransaksi('BM');
    const tglNow = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' });
    for (const item of data.detail) {
      const b = barang.find(x => x.id === item.barangId);
      if (b) await setDoc(doc(db, 'barang', b.id), { ...b, stok: b.stok + item.qty });
    }
    await setDoc(doc(db, 'pembelian', nextId), { ...data, id: nextId, tgl: tglNow });
  };

  const updatePembelian = async (id: string, data: Partial<Pembelian>) => {
    const target = pembelian.find(p => p.id === id);
    if (!target) return;
    for (const item of target.detail) {
      const b = barang.find(x => x.id === item.barangId);
      if (b) await setDoc(doc(db, 'barang', b.id), { ...b, stok: b.stok - item.qty });
    }
    const updatedData = { ...target, ...data };
    for (const item of updatedData.detail) {
      const b = barang.find(x => x.id === item.barangId);
      if (b) {
        const freshBarang = barang.find(x => x.id === item.barangId)!;
        await setDoc(doc(db, 'barang', b.id), { ...freshBarang, stok: freshBarang.stok + item.qty });
      }
    }
    await setDoc(doc(db, 'pembelian', id), updatedData);
  };

  const deletePembelian = async (id: string) => {
    const target = pembelian.find(p => p.id === id);
    if (!target) return;
    for (const item of target.detail) {
      const b = barang.find(x => x.id === item.barangId);
      if (b) await setDoc(doc(db, 'barang', b.id), { ...b, stok: b.stok - item.qty });
    }
    await deleteDoc(doc(db, 'pembelian', id));
  };

  // ==================== 6. TRANSAKSI PENJUALAN ====================
  const createPenjualan = async (data: Omit<Penjualan, 'id' | 'tgl'>) => {
    const nextId = genIdTransaksi('FK');
    const tglNow = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' });
    for (const item of data.detail) {
      const b = barang.find(x => x.id === item.barangId);
      if (b) await setDoc(doc(db, 'barang', b.id), { ...b, stok: b.stok - item.qty });
    }
    await setDoc(doc(db, 'penjualan', nextId), { ...data, id: nextId, tgl: tglNow });
  };

  const updatePenjualan = async (id: string, data: Partial<Penjualan>) => {
    const target = penjualan.find(p => p.id === id);
    if (!target) return;
    for (const item of target.detail) {
      const b = barang.find(x => x.id === item.barangId);
      if (b) await setDoc(doc(db, 'barang', b.id), { ...b, stok: b.stok + item.qty });
    }
    const updatedData = { ...target, ...data };
    for (const item of updatedData.detail) {
      const b = barang.find(x => x.id === item.barangId);
      if (b) {
        const freshBarang = barang.find(x => x.id === item.barangId)!;
        await setDoc(doc(db, 'barang', b.id), { ...freshBarang, stok: freshBarang.stok - item.qty });
      }
    }
    await setDoc(doc(db, 'penjualan', id), updatedData);
  };

  const deletePenjualan = async (id: string) => {
    const target = penjualan.find(p => p.id === id);
    if (!target) return;
    for (const item of target.detail) {
      const b = barang.find(x => x.id === item.barangId);
      if (b) await setDoc(doc(db, 'barang', b.id), { ...b, stok: b.stok + item.qty });
    }
    await deleteDoc(doc(db, 'penjualan', id));
  };

  // ==================== 7. MUTASI ADJUSTMENT STOK ====================
  const addAdjustment = async (data: Omit<AdjustmentStok, 'id' | 'stokSebelum' | 'stokSesudah'>) => {
    const targetB = barang.find(x => x.id === data.barangId);
    if (!targetB) return;

    const nextId = genIdTransaksi('ADJ');
    const stokLama = targetB.stok;
    const stokBaru = stokLama + data.qty;

    await setDoc(doc(db, 'barang', data.barangId), { ...targetB, stok: stokBaru });

    await setDoc(doc(db, 'adjustment', nextId), {
      id: nextId,
      stokSebelum: stokLama,
      stokSesudah: stokBaru,
      ...data
    });
  };

  return (
    <StoreContext.Provider value={{
      satuanData, barang, supplier, pelanggan, pembelian, penjualan, adjustment,
      genIdBarang, addAdjustment,
      addSatuan, deleteSatuan, updateSatuan, addBarang, deleteBarang, updateBarang,
      addSupplier, deleteSupplier, updateSupplier, addPelanggan, deletePelanggan, updatePelanggan,
      createPembelian, updatePembelian, deletePembelian,
      createPenjualan, updatePenjualan, deletePenjualan
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
}