import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../../store/useAuthStore';

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((s) => s.setUser);
  // Halaman yang dituju sebelum diredirect ke login (dari PrivateRoute)
  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      if (!email || !password) {
        toast.error('Email dan password harus diisi');
        return;
      }
    
      setIsLoading(true);
    
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // kirim/terima HttpOnly cookie
          body: JSON.stringify({ email, password }),
        });
      
        const data = await response.json();
      
        if (!response.ok) {
          throw new Error(data.message || 'Login gagal');
        }
      
        // Simpan user di Zustand store
        setUser(data.user);
        toast.success(`Selamat datang, ${data.user.username}!`);
      
        // ── LOGIKA REDIRECT BERDASARKAN ROLE ──────────────────────
        const userRole = data.user.role;
        const defaultDashboard = userRole === 'admin' ? '/admin/dashboard' : '/staff/dashboard';
      
        // Jika dari sistem awalnya mau diarahkan ke rute '/dashboard' lama atau halaman depan '/', 
        // kita timpa dengan dashboard spesifik sesuai role. 
        // Jika mereka sebelumnya sedang buka halaman lain (misal /staff/inventory), biarkan lanjut ke sana.
        const targetRoute = (from === '/dashboard' || from === '/') ? defaultDashboard : from;
      
        navigate(targetRoute, { replace: true });
        // ──────────────────────────────────────────────────────────
        
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Login gagal. Periksa email dan password Anda.'
        );
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className="w-full max-w-sm mx-auto">

      {/* ── Mobile-only header ─────────────────────────────── */}
      <div className="lg:hidden mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
          <span
            className="material-symbols-outlined text-primary text-[28px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            eco
          </span>
        </div>
        <h1 className="text-primary font-headline text-2xl font-extrabold tracking-tight">
          Penjamu Handal
        </h1>
        <p className="text-on-surface-variant text-sm font-medium mt-1">
          Apotek Digital Produksi Jamu
        </p>
      </div>

      {/* ── Heading ────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-on-surface font-headline text-2xl sm:text-3xl font-bold tracking-tight mb-2 leading-tight">
          Selamat Datang Kembali
        </h2>
        <p className="text-on-surface-variant text-sm sm:text-base font-medium">
          Masuk untuk mengakses konsol produksi Anda.
        </p>
      </div>

      {/* ── Form ───────────────────────────────────────────── */}
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase"
            htmlFor="login-email"
          >
            Alamat Email
          </label>
          <div className={`relative flex items-center rounded-xl transition-all duration-200
            ${focusedField === 'email'
              ? 'ring-2 ring-primary bg-surface-container-lowest shadow-sm'
              : 'bg-surface-container-highest hover:bg-surface-container-high'
            }`}
          >
            <span
              className={`material-symbols-outlined absolute left-4 text-[20px] transition-colors duration-200
                ${focusedField === 'email' ? 'text-primary' : 'text-outline'}`}
            >
              mail
            </span>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="admin@penjamuhandal.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              disabled={isLoading}
              className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm sm:text-base text-on-surface placeholder:text-outline/50 outline-none rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            className="block text-xs font-bold text-on-surface-variant tracking-widest uppercase"
            htmlFor="login-password"
          >
            Kata Sandi
          </label>
          <div className={`relative flex items-center rounded-xl transition-all duration-200
            ${focusedField === 'password'
              ? 'ring-2 ring-primary bg-surface-container-lowest shadow-sm'
              : 'bg-surface-container-highest hover:bg-surface-container-high'
            }`}
          >
            <span
              className={`material-symbols-outlined absolute left-4 text-[20px] transition-colors duration-200
                ${focusedField === 'password' ? 'text-primary' : 'text-outline'}`}
            >
              lock
            </span>
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              disabled={isLoading}
              className="w-full bg-transparent pl-11 pr-12 py-3.5 text-sm sm:text-base text-on-surface placeholder:text-outline/50 outline-none rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-all"
              tabIndex={-1}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {/* Remember me & forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              id="login-remember"
              name="remember"
              type="checkbox"
              disabled={isLoading}
              className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer bg-surface-container-highest accent-primary"
            />
            <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
              Ingat saya
            </span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-bold text-primary hover:text-secondary transition-colors underline-offset-4 hover:underline"
          >
            Lupa kata sandi?
          </Link>
        </div>

        {/* Submit button */}
        <button
          id="login-submit"
          type="submit"
          disabled={isLoading}
          className="w-full apothecary-gradient text-on-primary font-bold text-sm sm:text-base py-3.5 rounded-xl custom-shadow
            hover:scale-[1.02] hover:shadow-lg
            active:scale-[0.98]
            disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
            transition-all duration-200 flex items-center justify-center gap-2.5
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">
                progress_activity
              </span>
              Memproses...
            </>
          ) : (
            <>
              Masuk ke Konsol
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      {/* ── Divider ────────────────────────────────────────── */}
      <div className="mt-8 flex items-center gap-3">
        <div className="flex-1 h-px bg-outline-variant/30" />
        <span className="text-[11px] font-bold text-outline tracking-widest uppercase">atau</span>
        <div className="flex-1 h-px bg-outline-variant/30" />
      </div>

      {/* ── Request Access ─────────────────────────────────── */}
      <div className="mt-6 text-center">
        <p className="text-on-surface-variant text-sm">
          Belum punya akun?{' '}
          <Link
            to="/request-access"
            className="text-primary font-bold hover:text-secondary transition-colors underline-offset-4 hover:underline ml-0.5"
          >
            Minta Akses
          </Link>
        </p>
      </div>

      {/* ── Production step indicator ──────────────────────── */}
      <div className="mt-10 hidden sm:block">
        <div className="grid grid-cols-3 gap-2">
          <div className="h-1 bg-primary rounded-full" />
          <div className="h-1 bg-surface-container-high rounded-full" />
          <div className="h-1 bg-surface-container-high rounded-full" />
        </div>
        <div className="mt-2 flex justify-between text-[9px] uppercase tracking-[0.15em] font-bold text-outline">
          <span>Ekstraksi</span>
          <span className="opacity-40">Distilasi</span>
          <span className="opacity-40">Pembotolan</span>
        </div>
      </div>

    </div>
  );
}
