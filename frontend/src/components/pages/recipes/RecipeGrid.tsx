import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getRecipeImage } from './recipeImage';
import Image from '../../Image';

interface Produsen {
  nama_produsen: string;
}

interface Jamu {
  id_jamu: number;
  nama_jamu: string;
  ket_jamu: string | null;
  jenis: string | null;
  perizinan: string | null;
  produsen: Produsen | null;   // nested object dari Sequelize include
}

// Warna kategori berdasarkan jenis
function getCategoryStyle(jenis: string | null) {
  const map: Record<string, string> = {
    pil:     'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    serbuk:  'bg-secondary-container text-on-secondary-container',
    kapsul:  'bg-tertiary-container text-on-tertiary-container',
    cair:    'bg-primary-container text-on-primary-container',
    selai:   'bg-error-container text-on-error-container',
    krim:    'bg-primary-fixed text-on-primary-fixed-variant',
  };
  return map[jenis ?? ''] ?? 'bg-surface-container text-on-surface-variant';
}

async function fetchJamu(search: string): Promise<Jamu[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetch(`/api/jamu${params}`);
  if (!res.ok) throw new Error('Gagal memuat resep');
  const json = await res.json();
  return Array.isArray(json) ? json : [];
}

const ITEMS_PER_PAGE = 6;

function normalizeJenis(value: string | null | undefined) {
  const normalized = (value ?? '').trim().toLowerCase();
  return normalized || 'umum';
}

function formatJenisLabel(value: string) {
  if (value === 'umum') {
    return 'Umum';
  }

  return value
    .split(/[\s/-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function RecipeGrid() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: allJamu = [], isLoading, error } = useQuery({
    queryKey: ['jamu-list', search],
    queryFn: () => fetchJamu(search),
  });

  const categories = useMemo(() => {
    const values = Array.from(new Set(allJamu.map((item) => normalizeJenis(item.jenis))));
    return values.sort((a, b) => a.localeCompare(b));
  }, [allJamu]);

  const filteredJamu = useMemo(() => {
    if (activeCategory === 'all') {
      return allJamu;
    }

    return allJamu.filter((item) => normalizeJenis(item.jenis) === activeCategory);
  }, [activeCategory, allJamu]);

  const totalPages = Math.ceil(filteredJamu.length / ITEMS_PER_PAGE);
  const paged = filteredJamu.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Search bar */}
      <div className="relative w-full sm:max-w-md">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">search</span>
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Cari nama jamu, khasiat..."
          className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
        />
      </div>

      {!isLoading && !error && categories.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveCategory('all');
              setPage(1);
            }}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all border ${
              activeCategory === 'all'
                ? 'bg-primary text-on-primary border-primary shadow-[0_12px_30px_-18px_rgba(0,53,39,0.85)]'
                : 'bg-surface-container-high/80 text-on-surface-variant border-transparent hover:bg-surface-container-highest'
            }`}
          >
            Semua Formula
          </button>

          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setActiveCategory(category);
                setPage(1);
              }}
              className={`px-6 py-3 rounded-2xl text-sm font-bold capitalize transition-all border ${
                activeCategory === category
                  ? 'bg-surface-container-lowest text-primary border-primary shadow-[0_10px_24px_-20px_rgba(0,53,39,0.6)]'
                  : 'bg-surface-container-high/80 text-on-surface-variant border-transparent hover:bg-surface-container-highest'
              }`}
            >
              {formatJenisLabel(category)}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 gap-3 text-on-surface/40">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Memuat resep...</span>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="p-6 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
          Gagal memuat data resep. Pastikan backend berjalan.
        </div>
      )}

      {/* Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {paged.map((jamu, index) => (
            <div
              key={jamu.id_jamu}
              className={`bg-surface-container-lowest rounded-xl overflow-hidden group hover:shadow-xl transition-all duration-500 border border-transparent hover:border-outline-variant/20 flex flex-col shadow-sm ${
                index % 2 !== 0 ? 'xl:mt-6' : ''
              }`}
            >
              <div className="h-48 overflow-hidden relative bg-surface-container-high">
                <Image
                  src={getRecipeImage(jamu.nama_jamu, jamu.jenis)}
                  alt={jamu.nama_jamu}
                  fallbackSrc="/jamu.jpg"
                  wrapperClassName="absolute inset-0"
                  className="group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className={`${getCategoryStyle(jamu.jenis)} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm capitalize`}>
                    {jamu.jenis ?? 'Umum'}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-primary font-headline capitalize">{jamu.nama_jamu}</h3>
                  {jamu.perizinan && (
                    <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase bg-surface-container px-2 py-1 rounded">
                      {jamu.perizinan}
                    </span>
                  )}
                </div>

                <p className="text-sm text-on-surface-variant mb-4 leading-relaxed flex-1 line-clamp-3">
                  {jamu.ket_jamu ?? 'Tidak ada deskripsi tersedia.'}
                </p>

                {jamu.produsen && (
                  <p className="text-xs text-on-surface/40 font-medium mb-4">
                    <span className="material-symbols-outlined text-[12px] mr-1 align-middle">factory</span>
                    {jamu.produsen.nama_produsen}
                  </p>
                )}

                <button
                  onClick={() => navigate(`/recipes/${jamu.id_jamu}`)}
                  className="w-full border border-primary/20 text-primary py-3 rounded-lg font-bold text-sm hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2 mt-auto"
                >
                  Lihat Detail <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}

        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filteredJamu.length === 0 && (
        <div className="text-center py-16 text-on-surface/40">
          <span className="material-symbols-outlined text-5xl mb-4 block">search_off</span>
          <p className="font-medium">
            Tidak ada resep ditemukan
            {search ? ` untuk "${search}"` : ''}
            {activeCategory !== 'all' ? ` pada kategori ${formatJenisLabel(activeCategory)}` : ''}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 sm:gap-2 pt-4 flex-wrap">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/30 text-on-surface/40 hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-colors ${
                page === n ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface/60 hover:bg-surface-container-high'
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/30 text-on-surface/40 hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
}
