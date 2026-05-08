import { useNavigate } from 'react-router-dom';

export default function RecipesHeader() {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-4 md:gap-6">
        <div className="max-w-2xl">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary tracking-tight mb-3 md:mb-4 font-headline">Perpustakaan Resep</h1>
          <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
            Kecerdasan inti dari Penjamu Handal. Kelola resep leluhur Anda dengan presisi laboratorium. Pastikan setiap batch Jamu memenuhi standar potensi dan kemurnian tertinggi.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/production')}
          className="bg-secondary-container text-on-secondary-container px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-transform hover:-translate-y-1 hover:shadow-lg w-full md:w-auto"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          <span>Tambah Resep Baru</span>
        </button>
      </div>
    </>
  );
}
