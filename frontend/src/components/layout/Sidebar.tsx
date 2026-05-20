import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { mainNavItems, adminNavItems } from '../../config/navigation';
import { useAuthStore } from '../../store/useAuthStore';

interface SidebarProps {
  className?: string;
  /** Controlled dari luar (mobile drawer) */
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ className = '', isOpen, onClose }: SidebarProps) {
  const { pathname } = useLocation();
  const { user } = useAuthStore();
  const userRole = user?.role || 'staff';

  // Tutup drawer saat navigasi (mobile)
  useEffect(() => {
    if (onClose) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const navLink = (item: { to: string; icon: string; label: string }, iconSize = '') => {
    const isActive = pathname === item.to;
    return (
      <Link
        key={item.to}
        to={item.to}
        className={`px-6 py-4 flex items-center gap-3 transition-colors ${
          isActive
            ? 'text-primary-container font-bold border-l-4 border-secondary-container bg-surface/50'
            : 'text-on-surface/60 hover:bg-surface hover:text-on-surface border-l-4 border-transparent'
        }`}
      >
        <span className={`material-symbols-outlined ${iconSize}`}>{item.icon}</span>
        <span>{item.label}</span>
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-screen py-8">
      {/* Branding */}
      <div className="px-8 mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-primary-container font-headline">
            Penjamu Handal
          </h1>
          <p className="text-xs font-semibold tracking-widest uppercase opacity-50 px-1">
            Digital Apothecary
          </p>
        </div>
        {/* Close button — hanya tampil di mobile drawer */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-surface text-on-surface/60 hover:text-on-surface transition-colors"
            aria-label="Tutup menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-6">
        <div className="space-y-1">
          {mainNavItems
            .filter((item) => !item.roles || item.roles.includes(userRole))
            .map((item) => navLink(item))}
        </div>

        {adminNavItems.filter((item) => !item.roles || item.roles.includes(userRole)).length > 0 && (
          <div className="space-y-1">
            <p className="px-8 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/40">
              Administrasi
            </p>
            {adminNavItems
              .filter((item) => !item.roles || item.roles.includes(userRole))
              .map((item) => navLink(item, 'text-[20px]'))}
          </div>
        )}
      </nav>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar (always visible ≥ lg) ── */}
      <aside
        className={`hidden lg:flex h-full w-72 flex-col fixed left-0 top-0 bg-surface-container-low z-50 ${className}`}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {isOpen !== undefined && (
        <>
          {/* Backdrop */}
          <div
            className={`lg:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
              isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <aside
            className={`lg:hidden fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 shadow-2xl
              transform transition-transform duration-300 ease-in-out
              ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
