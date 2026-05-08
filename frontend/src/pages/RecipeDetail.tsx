import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AppShell from '../components/layout/AppShell';
import { getRecipeImage } from '../components/pages/recipes/recipeImage';
import Image from '../components/Image';

interface Komposisi {
  id_rempah: number;
  nama_rempah: string;
  banyak_rempah: string | null;
}

interface Khasiat {
  id_khasiat: number;
  khasiat: string;
  ket_khasiat: string | null;
}

interface Produsen {
  nama_produsen: string;
}

interface JamuDetail {
  id_jamu: number;
  nama_jamu: string;
  ket_jamu: string | null;
  jenis: string | null;
  perizinan: string | null;
  produsen: Produsen | null;   // nested object dari Sequelize include
  komposisi: Komposisi[];
  khasiat: Khasiat[];
}

async function fetchJamu(id: string): Promise<JamuDetail> {
  const res = await fetch(`/api/jamu/${id}`);
  if (!res.ok) throw new Error('Resep tidak ditemukan');
  return res.json();
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: jamu, isLoading, error } = useQuery({
    queryKey: ['jamu-detail', id],
    queryFn: () => fetchJamu(id!),
    enabled: !!id,
  });

  const title = jamu ? `${jamu.nama_jamu} - Detail Resep | Penjamu Handal` : 'Detail Resep | Penjamu Handal';
  const heroImage = jamu ? getRecipeImage(jamu.nama_jamu, jamu.jenis) : undefined;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={jamu?.ket_jamu ?? 'Detail resep dan komposisi produksi jamu.'} />
      </Helmet>

      <AppShell>
        <main className="p-4 sm:p-6 md:p-10 lg:p-12 w-full max-w-[1300px] mx-auto pb-24">

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-32 gap-3 text-on-surface/40">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium">Memuat detail resep...</span>
              </div>
            )}

            {/* Error */}
            {error && !isLoading && (
              <div className="text-center py-24">
                <span className="material-symbols-outlined text-6xl text-error mb-4 block">error</span>
                <p className="text-xl font-bold text-on-surface mb-2">Resep tidak ditemukan</p>
                <Link to="/recipes" className="text-primary font-bold hover:underline">← Kembali ke Resep</Link>
              </div>
            )}

            {/* Content */}
            {!isLoading && !error && jamu && (
              <>
                {/* Hero */}
                <div className="relative w-full h-[260px] sm:h-[340px] md:h-[440px] rounded-2xl md:rounded-3xl overflow-hidden mb-6 md:mb-10 shadow-sm">
                  <Image
                    src={heroImage}
                    alt={jamu.nama_jamu}
                    fallbackSrc="/jamu.jpg"
                    wrapperClassName="absolute inset-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  <div className="absolute inset-0 p-5 sm:p-8 md:p-12 flex flex-col justify-between">
                    <div>
                      <Link to="/recipes" className="inline-flex items-center gap-2 bg-surface/50 backdrop-blur-md px-4 py-2 rounded-xl text-on-surface hover:bg-surface transition-colors shadow-sm font-bold text-sm">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Kembali ke Resep
                      </Link>
                    </div>
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        {jamu.jenis && (
                          <span className="bg-secondary text-on-secondary px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase shadow-sm capitalize">
                            {jamu.jenis}
                          </span>
                        )}
                        {jamu.perizinan && (
                          <span className="bg-surface-container-highest/80 backdrop-blur-sm text-on-surface font-bold px-3 py-1 rounded-full text-[10px] tracking-widest uppercase shadow-sm">
                            {jamu.perizinan}
                          </span>
                        )}
                      </div>
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-headline text-primary tracking-tight mb-3 drop-shadow-md capitalize">
                        {jamu.nama_jamu}
                      </h1>
                      <p className="text-sm sm:text-base md:text-lg text-on-surface-variant font-medium leading-relaxed max-w-2xl drop-shadow-sm line-clamp-3 md:line-clamp-none">
                        {jamu.ket_jamu ?? 'Tidak ada deskripsi tersedia.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detail Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
                  {/* Kolom Kiri */}
                  <div className="lg:col-span-2 space-y-10">

                    {/* Komposisi */}
                    <div className="bg-surface-container-lowest rounded-2xl md:rounded-3xl p-5 md:p-8 border border-outline-variant/10 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary-container text-on-primary-container rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined">nutrition</span>
                        </div>
                        <h3 className="text-2xl font-bold font-headline text-primary">Komposisi Botani</h3>
                      </div>

                      {jamu.komposisi.length === 0 ? (
                        <p className="text-sm text-on-surface/40 italic">Data komposisi belum tersedia</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {jamu.komposisi.map((k) => (
                            <div key={k.id_rempah} className="flex justify-between items-center bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                              <span className="font-bold text-on-surface capitalize">{k.nama_rempah}</span>
                              <span className="text-sm font-bold text-on-surface-variant/70">
                                {k.banyak_rempah ?? '—'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Khasiat */}
                    <div className="bg-surface-container-lowest rounded-2xl md:rounded-3xl p-5 md:p-8 border border-outline-variant/10 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined">healing</span>
                        </div>
                        <h3 className="text-2xl font-bold font-headline text-primary">Khasiat</h3>
                      </div>

                      {jamu.khasiat.length === 0 ? (
                        <p className="text-sm text-on-surface/40 italic">Data khasiat belum tersedia</p>
                      ) : (
                        <div className="space-y-3">
                          {jamu.khasiat.map((k) => (
                            <div key={k.id_khasiat} className="flex gap-3 items-start bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                              <span className="material-symbols-outlined text-tertiary-fixed text-[18px] mt-0.5 shrink-0">check_circle</span>
                              <div>
                                <p className="font-bold text-on-surface text-sm">{k.khasiat}</p>
                                {k.ket_khasiat && <p className="text-xs text-on-surface-variant mt-1">{k.ket_khasiat}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Kolom Kanan — sticky di desktop */}
                  <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
                    <div className="bg-primary/5 rounded-2xl md:rounded-3xl p-5 md:p-6 border border-primary/10 shadow-sm relative overflow-hidden">
                      <div className="absolute -bottom-10 -right-10 opacity-5 text-primary pointer-events-none">
                        <span className="material-symbols-outlined text-[150px]" style={{ fontVariationSettings: "'FILL' 1" }}>precision_manufacturing</span>
                      </div>
                      <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant/60 mb-6">Info Produk</h4>

                      <div className="space-y-5 relative z-10">
                        <div>
                          <p className="text-xs font-bold text-on-surface-variant mb-1">Jenis</p>
                          <div className="flex items-center gap-2 text-primary font-bold capitalize">
                            <span className="material-symbols-outlined text-[18px]">category</span>
                            {jamu.jenis ?? '—'}
                          </div>
                        </div>
                        <hr className="border-outline-variant/20" />
                        <div>
                          <p className="text-xs font-bold text-on-surface-variant mb-1">Perizinan</p>
                          <div className="flex items-center gap-2 text-primary font-bold">
                            <span className="material-symbols-outlined text-[18px]">verified</span>
                            {jamu.perizinan ?? '—'}
                          </div>
                        </div>
                        <hr className="border-outline-variant/20" />
                        <div>
                          <p className="text-xs font-bold text-on-surface-variant mb-1">Produsen</p>
                          <div className="flex items-center gap-2 text-primary font-bold">
                            <span className="material-symbols-outlined text-[18px]">factory</span>
                            {jamu.produsen?.nama_produsen ?? '—'}
                          </div>
                        </div>
                        <hr className="border-outline-variant/20" />
                        <div>
                          <p className="text-xs font-bold text-on-surface-variant mb-1">Total Bahan</p>
                          <div className="flex items-center gap-2 text-primary font-bold">
                            <span className="material-symbols-outlined text-[18px]">nutrition</span>
                            {jamu.komposisi.length} bahan
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/production"
                        className="w-full mt-8 bg-primary text-on-primary py-3.5 rounded-xl font-bold text-sm shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        Mulai Batch Baru
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
      </AppShell>
    </>
  );
}
