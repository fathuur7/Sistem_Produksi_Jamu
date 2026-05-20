// ============================================
// Custom Hook - Inventory Table Logic
// ============================================

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { InventoryItem, SaveBahanData, AdjustStockData } from '../types/inventory';
import { fetchBahanData, saveBahan, deleteBahan, adjustStock } from '../services/inventoryService';
import { validateBahanForm } from '../utils/inventory';

interface FormState {
  nama: string;
  kategori: string;
  satuan: string;
  stokAwal: string;
  threshold: string;
  hargaSatuan: string;
}

const initialFormState: FormState = {
  nama: '',
  kategori: '',
  satuan: '',
  stokAwal: '',
  threshold: '',
  hargaSatuan: '',
};

/**
 * Custom hook untuk manage inventory table
 */
export function useInventoryTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; itemId: string | number | null; itemName: string }>({ isOpen: false, itemId: null, itemName: '' });
  const [restockModal, setRestockModal] = useState<{ isOpen: boolean; item: InventoryItem | null; value: string }>({ isOpen: false, item: null, value: '' });

  const ITEMS_PER_PAGE = 5;

  // ============ Queries & Mutations ============

  // Fetch inventory data
  const { data: bahanData = [], isLoading, error, refetch } = useQuery({
    queryKey: ['bahan-inventory'],
    queryFn: fetchBahanData,
  });

  const categoryOptions = useMemo(() => {
    return ['all', ...new Set(bahanData.map(item => item.category).filter(Boolean))];
  }, [bahanData]);

  const filteredBahanData = useMemo(() => {
    return bahanData.filter(item => {
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesCategory && matchesStatus;
    });
  }, [bahanData, filterCategory, filterStatus]);

  // Save mutation
  const mutationSave = useMutation({
    mutationFn: async (data: SaveBahanData) => {
      return saveBahan(data, modalMode, editingItem?.id);
    },
    onSuccess: () => {
      refetch();
      closeModal();
    },
  });

  // Delete mutation
  const mutationDelete = useMutation({
    mutationFn: deleteBahan,
    onSuccess: () => refetch(),
  });

  // Adjust stock mutation
  const mutationAdjust = useMutation({
    mutationFn: async ({ id, quantity, type }: AdjustStockData) => {
      return adjustStock(id, quantity, type, 'Restock dari inventory');
    },
    onSuccess: () => refetch(),
  });

  // ============ Modal Management ============

  const openAddModal = () => {
    setModalMode('add');
    setEditingItem(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setModalMode('edit');
    setEditingItem(item);
    setFormData({
      nama: item.name || '',
      kategori: item.category || '',
      satuan: item.unit || '',
      stokAwal: String(item.stock),
      threshold: String(item.threshold),
      hargaSatuan: String(item.hargaSatuan || 0),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(initialFormState);
  };

  // ============ Form Handling ============

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = validateBahanForm(formData.nama, formData.kategori, formData.satuan);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Prepare data
    const dataToSave: SaveBahanData = {
      nama: formData.nama,
      kategori: formData.kategori,
      satuan: formData.satuan,
      stokAwal: parseFloat(formData.stokAwal) || 0,
      threshold: parseFloat(formData.threshold) || 10,
      hargaSatuan: parseFloat(formData.hargaSatuan) || 0,
    };

    mutationSave.mutate(dataToSave);
  };

  // ============ Action Handlers ============

  const handleDelete = (id: string | number, itemName: string) => {
    setConfirmModal({ isOpen: true, itemId: id, itemName });
  };

  const confirmDelete = () => {
    if (confirmModal.itemId) {
      mutationDelete.mutate(confirmModal.itemId);
      setConfirmModal({ isOpen: false, itemId: null, itemName: '' });
    }
  };

  const cancelDelete = () => {
    setConfirmModal({ isOpen: false, itemId: null, itemName: '' });
  };

  const handleRestock = (item: InventoryItem) => {
    setRestockModal({ isOpen: true, item, value: String(item.stock) });
  };

  const confirmRestock = () => {
    if (restockModal.item) {
      const newStock = Number(restockModal.value);
      if (!isNaN(newStock) && newStock > restockModal.item.stock) {
        const quantity = newStock - restockModal.item.stock;
        mutationAdjust.mutate({ id: restockModal.item.id, quantity, type: 'add' });
        setRestockModal({ isOpen: false, item: null, value: '' });
      }
    }
  };

  const cancelRestock = () => {
    setRestockModal({ isOpen: false, item: null, value: '' });
  };

  // ============ Pagination ============

  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, filterStatus]);

  const totalItems = filteredBahanData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageData = filteredBahanData.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    const pageNum = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPrevious = () => goToPage(currentPage - 1);
  const goToNext = () => goToPage(currentPage + 1);

  // ============ Return State ============

  return {
    // Data
    bahanData,
    currentPageData,
    isLoading,
    error,

    // Pagination
    currentPage,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    goToPrevious,
    goToNext,

    // Filter
    isFilterOpen,
    setIsFilterOpen,
    filterCategory,
    setFilterCategory,
    filterStatus,
    setFilterStatus,
    categoryOptions,
    filteredBahanData,

    // Modal
    isModalOpen,
    modalMode,
    editingItem,
    openAddModal,
    openEditModal,
    closeModal,

    // Form
    formData,
    handleFormChange,
    handleSubmit,

    // Actions
    handleDelete,
    handleRestock,

    // Mutations
    mutationSave,
    mutationDelete,
    mutationAdjust,

    // Confirmation Modal
    confirmModal,
    confirmDelete,
    cancelDelete,

    // Restock Modal
    restockModal,
    confirmRestock,
    cancelRestock,
    setRestockModal,

    // Refetch
    refetch,
  };
}
