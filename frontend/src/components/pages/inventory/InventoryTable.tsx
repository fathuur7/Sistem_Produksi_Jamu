// ============================================
// InventoryTable Component - Main UI
// ============================================

import { AddEditModal } from './AddEditModal';
import { InventoryTableRow } from './InventoryTableRow';
import { LoadingState, ErrorState, EmptyState } from './StateComponents';
import { Pagination } from './Pagination';
import { TableHeader } from './TableHeader';
import { ConfirmationModal } from './ConfirmationModal';
import { RestockModal } from './RestockModal';

interface InventoryTableProps {
  isLoading: boolean;
  error: Error | null;
  currentPageData: Array<{
    id: string | number;
    name: string;
    variety: string;
    category: string;
    stock: number;
    threshold: number;
    unit: string;
    status: string;
    icon: string;
    bgColor: string;
    iconColor: string;
    statusClass: string;
    statusDot: string;
    barFill: string;
    barPercentage: string;
  }>;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  goToPage: (page: number) => void;
  goToPrevious: () => void;
  goToNext: () => void;
  onAddNew: () => void;
  onEdit: (item: { id: string | number; name: string; variety: string; category: string; stock: number; threshold: number; unit: string; status: string; icon: string; bgColor: string; iconColor: string; statusClass: string; statusDot: string; barFill: string; barPercentage: string; }) => void;
  onRestock: (item: { id: string | number; name: string; variety: string; category: string; stock: number; threshold: number; unit: string; status: string; icon: string; bgColor: string; iconColor: string; statusClass: string; statusDot: string; barFill: string; barPercentage: string; }) => void;
  onDelete: (id: string | number, itemName: string) => void;
  isModalOpen: boolean;
  modalMode: 'add' | 'edit';
  formData: { nama: string; kategori: string; satuan: string; stokAwal: string; threshold: string; hargaSatuan: string };
  isSavePending: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCloseModal: () => void;
  confirmModal: { isOpen: boolean; itemId: string | number | null; itemName: string };
  confirmDelete: () => void;
  cancelDelete: () => void;
  isDeletePending: boolean;
  restockModal: { isOpen: boolean; item: { id: string | number; name: string; variety: string; category: string; stock: number; threshold: number; unit: string; status: string; icon: string; bgColor: string; iconColor: string; statusClass: string; statusDot: string; barFill: string; barPercentage: string; } | null; value: string };
  onRestockValueChange: (value: string) => void;
  confirmRestock: () => void;
  cancelRestock: () => void;
  isRestockPending: boolean;
  refetch: () => void;
}

function InventoryTable({
  isLoading,
  error,
  currentPageData,
  currentPage,
  totalItems,
  totalPages,
  startIndex,
  endIndex,
  goToPage,
  goToPrevious,
  goToNext,
  onAddNew,
  onEdit,
  onRestock,
  onDelete,
  isModalOpen,
  modalMode,
  formData,
  isSavePending,
  onFormChange,
  onSubmit,
  onCloseModal,
  confirmModal,
  confirmDelete,
  cancelDelete,
  isDeletePending,
  restockModal,
  onRestockValueChange,
  confirmRestock,
  cancelRestock,
  isRestockPending,
  refetch,
}: InventoryTableProps) {

  return (
    <>
      {/* Modal untuk Add/Edit Bahan */}
      <AddEditModal
        isOpen={isModalOpen}
        mode={modalMode}
        formData={formData}
        isPending={isSavePending}
        onFormChange={onFormChange}
        onSubmit={onSubmit}
        onClose={onCloseModal}
      />

      {/* Confirmation Modal untuk Delete */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        itemName={confirmModal.itemName}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={isDeletePending}
      />

      {/* Restock Modal */}
      <RestockModal
        isOpen={restockModal.isOpen}
        item={restockModal.item}
        value={restockModal.value}
        onValueChange={onRestockValueChange}
        onConfirm={confirmRestock}
        onCancel={cancelRestock}
        isLoading={isRestockPending}
      />

      {/* Loading State */}
      {isLoading && <LoadingState />}

      {/* Error State */}
      {error && !isLoading && <ErrorState error={error} onRetry={refetch} />}

      {/* Empty State */}
      {!isLoading && !error && totalItems === 0 && <EmptyState onAddNew={onAddNew} />}

      {/* Table Data */}
      {!isLoading && !error && totalItems > 0 && (
        <>
          <div className="overflow-hidden rounded-[2rem] border border-outline-variant/12 bg-surface-container-lowest shadow-[0_26px_70px_-50px_rgba(28,28,19,0.42)]">
            <TableHeader
              onAddNew={onAddNew}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
            />

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-200">
                {/* Table Header */}
                <thead>
                  <tr className="bg-surface-container-high/30">
                    <th className="px-8 py-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-on-surface/40">
                      Bahan Baku
                    </th>
                    <th className="px-8 py-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-on-surface/40">
                      Kategori
                    </th>
                    <th className="px-8 py-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-on-surface/40">
                      Stok Saat Ini
                    </th>
                    <th className="px-8 py-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-on-surface/40">
                      Batas Minimum
                    </th>
                    <th className="px-8 py-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-on-surface/40 text-center">
                      Status
                    </th>
                    <th className="px-8 py-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-on-surface/40 text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-surface-container/30">
                  {currentPageData.map(item => (
                    <InventoryTableRow
                      key={item.id}
                      item={item}
                      onEdit={onEdit}
                      onRestock={onRestock}
                      onDelete={onDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={totalItems}
              onPrevious={goToPrevious}
              onNext={goToNext}
              onGoToPage={goToPage}
            />
          </div>
        </>
      )}
    </>
  );
}

export default InventoryTable;
