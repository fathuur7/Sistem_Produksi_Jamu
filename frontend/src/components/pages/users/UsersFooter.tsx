export default function UsersFooter() {
  return (
    <div className="bg-surface-container-low/40 p-8 rounded-2xl flex flex-col sm:flex-row items-center gap-6 border border-outline-variant/10 border-dashed mb-12">
      <div className="w-14 h-14 bg-surface-container-highest rounded-2xl flex items-center justify-center shadow-inner shrink-0 text-secondary">
        <span className="material-symbols-outlined text-3xl">lightbulb</span>
      </div>
      <div>
        <h4 className="text-lg font-headline font-bold text-primary mb-1">Hierarki Staf & Kebersihan Akses</h4>
        <p className="text-sm font-medium text-on-surface-variant/80 leading-relaxed md:max-w-4xl">
          Naikkan peran ke <span className="font-bold text-primary">Administrator</span> atau <span className="font-bold text-primary">Supervisor</span> hanya saat memang diperlukan. Direktori ini membantu tim menjaga siapa yang punya akses penuh, siapa yang mengawasi operasi, dan siapa yang fokus ke kerja harian.
        </p>
      </div>
    </div>
  );
}
