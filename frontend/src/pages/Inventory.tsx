import { Helmet } from 'react-helmet-async';
import AppShell from '../components/layout/AppShell';
import InventoryHeader from '../components/pages/inventory/InventoryHeader';
import InventoryTable from '../components/pages/inventory/InventoryTable';
import InventoryBento from '../components/pages/inventory/InventoryBento';
import { useInventoryTable } from '../hooks/useInventoryTable';

export default function Inventory() {
  const inventory = useInventoryTable();

  return (
    <>
      <Helmet>
        <title>Inventaris | Penjamu Handal</title>
        <meta name="description" content="Manajemen stok bahan baku esensial untuk produksi Jamu." />
      </Helmet>

      <AppShell>
        <main className="mx-auto w-full max-w-[1400px] space-y-6 px-4 pb-20 pt-4 sm:px-6 md:px-10 lg:px-12">
          <InventoryHeader
            isFilterOpen={inventory.isFilterOpen}
            categories={inventory.categoryOptions.filter(category => category !== 'all')}
            filterCategory={inventory.filterCategory}
            filterStatus={inventory.filterStatus}
            onToggleFilter={() => inventory.setIsFilterOpen(prev => !prev)}
            onCategoryChange={inventory.setFilterCategory}
            onStatusChange={inventory.setFilterStatus}
            onResetFilters={() => {
              inventory.setFilterCategory('all');
              inventory.setFilterStatus('all');
            }}
          />
          <InventoryTable
            isLoading={inventory.isLoading}
            error={inventory.error instanceof Error ? inventory.error : null}
            currentPageData={inventory.currentPageData}
            currentPage={inventory.currentPage}
            totalItems={inventory.totalItems}
            totalPages={inventory.totalPages}
            startIndex={inventory.startIndex}
            endIndex={inventory.endIndex}
            goToPage={inventory.goToPage}
            goToPrevious={inventory.goToPrevious}
            goToNext={inventory.goToNext}
            onAddNew={inventory.openAddModal}
            onEdit={inventory.openEditModal}
            onRestock={inventory.handleRestock}
            onDelete={inventory.handleDelete}
            isModalOpen={inventory.isModalOpen}
            modalMode={inventory.modalMode}
            formData={inventory.formData}
            isSavePending={inventory.mutationSave.isPending}
            onFormChange={inventory.handleFormChange}
            onSubmit={inventory.handleSubmit}
            onCloseModal={inventory.closeModal}
            confirmModal={inventory.confirmModal}
            confirmDelete={inventory.confirmDelete}
            cancelDelete={inventory.cancelDelete}
            isDeletePending={inventory.mutationDelete.isPending}
            restockModal={inventory.restockModal}
            onRestockValueChange={(value) => inventory.setRestockModal({ ...inventory.restockModal, value })}
            confirmRestock={inventory.confirmRestock}
            cancelRestock={inventory.cancelRestock}
            isRestockPending={inventory.mutationAdjust.isPending}
            refetch={inventory.refetch}
          />
          <InventoryBento items={inventory.bahanData} />
        </main>
      </AppShell>
    </>
  );
}
