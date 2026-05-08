import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import SupplierHeader from '../components/pages/supplier/SupplierHeader';
import SupplierMetrics from '../components/pages/supplier/SupplierMetrics';
import SupplierDirectory from '../components/pages/supplier/SupplierDirectory';

export interface SupplierRecord {
  id_produsen: number;
  nama_produsen: string;
  alamat: string | null;
  kota: string | null;
  kontak: string | null;
  email: string | null;
  status: 'aktif' | 'menunggu' | 'ditangguhkan';
  created_at?: string | null;
}

export default function Supplier() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    supplier: SupplierRecord | null;
  }>({
    isOpen: false,
    mode: 'add',
    supplier: null,
  });

  const openAddModal = () => {
    setModalState({ isOpen: true, mode: 'add', supplier: null });
  };

  const openEditModal = (supplier: SupplierRecord) => {
    setModalState({ isOpen: true, mode: 'edit', supplier });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <>
      <Helmet>
        <title>Sumber Bahan | Penjamu Handal</title>
        <meta name="description" content="Manajemen pemasok dan jaringan bahan baku artisanal Penjamu Handal." />
      </Helmet>

      <AppShell>
        <main className="w-full max-w-[1400px] px-4 pb-24 pt-4 sm:px-6 md:px-10 lg:px-12">
          <SupplierHeader />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 xl:gap-10">
            <div className="col-span-1 lg:col-span-4">
              <SupplierMetrics />
            </div>
            <div className="col-span-1 lg:col-span-8">
              <SupplierDirectory
                modalState={modalState}
                onAddSupplier={openAddModal}
                onEditSupplier={openEditModal}
                onCloseModal={closeModal}
              />
            </div>
          </div>
        </main>
      </AppShell>
    </>
  );
}
