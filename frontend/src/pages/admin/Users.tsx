import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AppShell from '../../components/layout/AppShell';
import UsersHeader from '../../components/pages/users/UsersHeader';
import UsersMetrics from '../../components/pages/users/UsersMetrics';
import UsersTable from '../../components/pages/users/UsersTable';
import UsersFooter from '../../components/pages/users/UsersFooter';
import UsersDialog, { type UserFormState } from '../../components/pages/users/UsersDialog';
import UsersDeleteDialog from '../../components/pages/users/UsersDeleteDialog';
import {
  createUser,
  deleteUser,
  fetchCities,
  fetchUsers,
  updateUser,
  updateUserPassword,
  type UserRecord,
} from '../../services/userService';
import { queryClient } from '../../utils/queryClient';
import { useAuthStore } from '../../store/useAuthStore';

const initialFormState: UserFormState = {
  username: '',
  email: '',
  role: 'staff',
  id_kota: '',
  password: '',
};

function toFormState(user: UserRecord | null): UserFormState {
  if (!user) {
    return initialFormState;
  }

  return {
    username: user.username,
    email: user.email,
    role: user.role,
    id_kota: user.id_kota ? String(user.id_kota) : '',
    password: '',
  };
}

export default function Users() {
  const currentUser = useAuthStore((state) => state.user);
  const refreshSession = useAuthStore((state) => state.fetchMe);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    user: UserRecord | null;
  }>({
    isOpen: false,
    mode: 'add',
    user: null,
  });
  const [formData, setFormData] = useState<UserFormState>(initialFormState);
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);

  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const { data: cities = [], isLoading: isCitiesLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: fetchCities,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: UserFormState) => {
      const body = {
        username: payload.username.trim(),
        email: payload.email.trim(),
        role: payload.role,
        id_kota: payload.id_kota ? Number(payload.id_kota) : null,
      };

      if (modalState.mode === 'add') {
        return createUser({
          ...body,
          password: payload.password.trim(),
        });
      }

      if (!modalState.user) {
        throw new Error('Data pengguna tidak ditemukan');
      }

      await updateUser(modalState.user.id_user, body);

      const password = payload.password.trim();
      if (password) {
        await updateUserPassword(modalState.user.id_user, password);
      }

      return { message: 'User diperbarui' };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });

      if (modalState.user?.id_user === currentUser?.id_user) {
        await refreshSession();
      }

      toast.success(modalState.mode === 'add' ? 'Pengguna ditambahkan' : 'Pengguna diperbarui');
      handleCloseModal();
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteTarget(null);
      toast.success('Pengguna dihapus');
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message);
    },
  });

  const handleOpenAddModal = () => {
    setFormData(initialFormState);
    setModalState({ isOpen: true, mode: 'add', user: null });
  };

  const handleOpenEditModal = (user: UserRecord) => {
    setFormData(toFormState(user));
    setModalState({ isOpen: true, mode: 'edit', user });
  };

  const handleCloseModal = () => {
    setFormData(initialFormState);
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDeleteUser = (user: UserRecord) => {
    setDeleteTarget(user);
  };

  const handleCloseDeleteDialog = () => {
    if (!deleteMutation.isPending) {
      setDeleteTarget(null);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id_user);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.username.trim()) {
      toast.error('Username wajib diisi');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email wajib diisi');
      return;
    }

    if (modalState.mode === 'add' && formData.password.trim().length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    if (modalState.mode === 'edit' && formData.password.trim() && formData.password.trim().length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }

    saveMutation.mutate(formData);
  };

  const adminCount = users.filter((user) => user.role === 'admin').length;
  const supervisorCount = users.filter((user) => user.role === 'supervisor').length;

  return (
    <>
      <Helmet>
        <title>Direktori Staf | Penjamu Handal</title>
        <meta name="description" content="Manajemen tata kelola akses dan peran staf laboratorium Penjamu Handal." />
      </Helmet>

      <AppShell>
        <main className="p-4 sm:p-6 md:p-12 w-full max-w-[1300px] mx-auto pb-24 flex-1">
          <UsersHeader
            totalUsers={users.length}
            adminCount={adminCount}
            supervisorCount={supervisorCount}
            onAddUser={handleOpenAddModal}
          />
          <UsersMetrics users={users} isLoading={isLoading} />
          <UsersTable
            users={users}
            isLoading={isLoading}
            errorMessage={error instanceof Error ? error.message : null}
            onAddUser={handleOpenAddModal}
            onEditUser={handleOpenEditModal}
            onDeleteUser={handleDeleteUser}
            currentUserId={currentUser?.id_user}
            isDeleting={deleteMutation.isPending}
          />
          <UsersFooter />
          <UsersDialog
            modalState={modalState}
            formData={formData}
            setFormData={setFormData}
            cities={cities}
            isCitiesLoading={isCitiesLoading}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            isSaving={saveMutation.isPending}
          />
          <UsersDeleteDialog
            user={deleteTarget}
            isDeleting={deleteMutation.isPending}
            onCancel={handleCloseDeleteDialog}
            onConfirm={handleConfirmDelete}
          />
        </main>
      </AppShell>
    </>
  );
}
