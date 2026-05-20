import { useState } from 'react';

const sopSteps = [
  {
    step: 1,
    title: 'Cek Suhu Ekstraksi',
    desc: 'Pastikan suhu air mendidih tepat di 85°C sebelum pencampuran infusi.',
    active: true,
  },
  {
    step: 2,
    title: 'Durasi Agitasi',
    desc: 'Pertahankan rotasi pengadukan yang stabil selama tepat 12 menit.',
    active: true,
  },
  {
    step: 3,
    title: 'Filtrasi Steril',
    desc: 'Lewatkan hasil sari melalui saringan filter 50-mikron secara perlahan.',
    active: false,
  }
];

export interface SOPValidationProps {
  onExecute: () => Promise<void>;
  blockingIssues?: string[];
  executeError?: string | null;
  disabled?: boolean;
  isExecuting?: boolean;
}

export default function SOPValidation({
  onExecute,
  blockingIssues = [],
  executeError,
  disabled = false,
  isExecuting = false,
}: SOPValidationProps) {
  const [confirmed, setConfirmed] = useState(false);
  const canExecute = confirmed && !disabled && blockingIssues.length === 0;

  return (
    <div className="space-y-8 flex-1 flex flex-col">
      <section className="bg-surface-container-highest p-8 rounded-xl border border-outline-variant/20 shadow-sm flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2 font-headline">
          <span className="material-symbols-outlined text-secondary">assignment</span>
          SOP & Validasi
        </h3>
        
        <div className="space-y-6 mb-8 flex-1">
          {sopSteps.map((item) => (
            <div key={item.step} className="flex gap-4">
              <div 
                className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm ${
                  item.active 
                    ? 'bg-primary text-on-primary' 
                    : 'bg-outline-variant text-on-surface/40'
                }`}
              >
                {item.step}
              </div>
              <div className={item.active ? '' : 'opacity-40 grayscale'}>
                <p className="text-sm font-bold text-on-surface">{item.title}</p>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-surface-container-lowest rounded-lg mb-8 shadow-inner border border-primary/5">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input 
              className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary focus:ring-2 cursor-pointer transition-colors" 
              type="checkbox" 
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span className="text-xs font-bold leading-relaxed text-on-surface-variant group-hover:text-on-surface transition-colors">
              Saya mengonfirmasi bahwa semua bahan telah ditimbang secara presisi sesuai dengan standar apoteker dan area produksi telah disanitasi.
            </span>
          </label>
        </div>

        {(blockingIssues.length > 0 || executeError) && (
          <div className="space-y-2 mb-6">
            {blockingIssues.map((msg, idx) => (
              <div key={idx} className="bg-secondary/10 border border-secondary/20 rounded-xl px-4 py-3 flex items-start gap-2">
                <span className="material-symbols-outlined text-secondary text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                <p className="text-xs text-on-surface-variant/80 font-bold leading-relaxed">{msg}</p>
              </div>
            ))}
            {executeError && (
              <div className="bg-error/10 border border-error/20 rounded-xl px-4 py-3 flex items-start gap-2">
                <span className="material-symbols-outlined text-error text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                <p className="text-xs text-error font-bold leading-relaxed">{executeError}</p>
              </div>
            )}
          </div>
        )}
        
        <button
          onClick={() => onExecute()}
          disabled={!canExecute || isExecuting}
          className="w-full apothecary-gradient py-4 rounded-xl text-on-primary font-bold shadow-lg shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExecuting ? 'Mengeksekusi…' : 'Validasi & Eksekusi'}
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </button>
      </section>

      {/* Decorative Herbal Image */}
      <div className="rounded-xl overflow-hidden h-48 relative group shadow-md border border-primary/10">
        <img 
          alt="Herbarium Background" 
          className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDztOmjUuKaetMS6gvRUhMHxr59vp4lqrzJDMWW5jfNCFCka4jWCJ1NHeOwO-u3SzKAmTe_jonmU11Uoq9s6ZvheZwNNGBtIJNwuLpmkNMWtMwcKtyllSqBekH3jP9k_rHqRbLLDLPYmAJQjG3Kxv6UTg8N_8407nQ1B2nci6SHBUSqe6heB_l0bkGKAQ35r8agwjI7cSwbiSMkiPNaQzArmv4RIQmjXyPVc9Tu2RcMYDOttWyQw5gfUqdnZBA3z8-uwsfN_0b87n_7"
        />
        <div className="absolute inset-0 bg-primary/60 mix-blend-multiply group-hover:bg-primary/40 transition-colors"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-t from-black/40 to-transparent">
          <p className="text-on-primary font-headline text-lg font-extrabold leading-tight tracking-wide drop-shadow-md">Tradisi Bertemu Presisi</p>
          <p className="text-on-primary/90 text-[10px] uppercase tracking-widest mt-2 font-bold drop-shadow">Warisan Botani Madura</p>
        </div>
      </div>
    </div>
  );
}
