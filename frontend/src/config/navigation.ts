export const mainNavItems = [
  // Dashboard dibedakan, yang muncul sesuai siapa yang login
  { icon: 'dashboard', label: 'Dashboard', to: '/staff/dashboard', roles: ['staff'] },
  { icon: 'dashboard', label: 'Dashboard Admin', to: '/admin/dashboard', roles: ['admin'] },

  // Tombol Produksi cuma muncul untuk Staff
  { icon: 'precision_manufacturing', label: 'Produksi Jamu', to: '/staff/production', roles: ['staff'] },
  { icon: 'settings', label: 'Pengaturan', to: '/staff/settings', roles: ['staff'] },
];

export const adminNavItems = [
  // Semua fitur manajemen ini murni cuma muncul untuk Admin
  { icon: 'inventory_2', label: 'Inventaris Gudang', to: '/admin/inventory', roles: ['admin'] },
  { icon: 'menu_book', label: 'Resep Jamu', to: '/admin/recipes', roles: ['admin'] },
  { icon: 'local_shipping', label: 'Mitra Supplier', to: '/admin/supplier', roles: ['admin'] },
  { icon: 'analytics', label: 'Laporan Produksi', to: '/admin/reports', roles: ['admin'] },
  { icon: 'manage_accounts', label: 'Direktori Staf', to: '/admin/users', roles: ['admin'] },
  { icon: 'settings', label: 'Pengaturan', to: '/admin/settings', roles: ['admin'] },
];