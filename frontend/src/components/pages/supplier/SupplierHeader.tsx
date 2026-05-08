export default function SupplierHeader() {
  return (
    <section className="mb-10 md:mb-14">
      <div className="max-w-3xl">
        <nav className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant/55">
          <span>Apoteker</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-secondary">Sumber Bahan</span>
        </nav>

        <h3 className="font-headline text-[clamp(2.8rem,6vw,5rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-primary">
          Jejaring Pemasok
        </h3>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-on-surface-variant md:text-xl">
          Kurasi pemasok bahan baku, pantau status kontrak, dan simpan jalur kontak penting dalam satu permukaan kerja yang rapi untuk tim produksi.
        </p>
      </div>

      <div className="mt-8 h-px w-full bg-gradient-to-r from-outline-variant/20 via-outline-variant/45 to-transparent" />
    </section>
  );
}
