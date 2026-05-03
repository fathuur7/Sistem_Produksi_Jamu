import { Link } from 'react-router-dom';

export default function TopBar() {
  const user = (() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? (JSON.parse(raw) as { username?: string; email?: string } | null) : null;
    } catch {
      return null;
    }
  })();

  const displayName = user?.username || user?.email || 'Pengguna';
  const subtitle = user?.email ? user.email : '—';

  return (
    <header className="flex justify-between items-center px-8 py-4 sticky top-0 z-40 bg-surface/70 backdrop-blur-md border-b border-primary/10">
      {/* Search */}
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60 text-[20px]">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-container-highest border-none rounded-lg focus:ring-1 focus:ring-secondary-container transition-all text-sm font-medium"
            placeholder="Cari batch, rempah, atau pesanan..."
            type="text"
          />
        </div>
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-4">
        <Link to="/notifications" className="p-2 text-on-surface/70 hover:bg-surface-container rounded-lg transition-all relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error"></span>
        </Link>
        <button className="p-2 text-on-surface/70 hover:bg-surface-container rounded-lg transition-all">
          <span className="material-symbols-outlined">help_outline</span>
        </button>

        <div className="h-8 w-px bg-outline-variant opacity-30 mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-primary leading-tight">{displayName}</p>
            <p className="text-[10px] tracking-wider text-on-surface-variant font-semibold">{subtitle}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center border-2 border-primary/10">
            <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
              person
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
