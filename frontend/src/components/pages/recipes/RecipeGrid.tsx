

interface Recipe {
  id: number;
  title: string;
  category: string;
  categoryClass: string;
  difficulty: string;
  difficultyIcon: string;
  difficultyClass: string;
  description: string;
  ingredients: string[];
  image: string;
}

const recipes: Recipe[] = [
  {
    id: 1,
    title: 'Kunyit Asam',
    category: 'Imunitas',
    categoryClass: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    difficulty: 'Mudah',
    difficultyIcon: 'speed',
    difficultyClass: 'text-secondary',
    description: 'Campuran tradisional untuk detoksifikasi dan vitalitas kulit cerah. Sangat diminati untuk eceran.',
    ingredients: ['Kunyit', 'Asam Jawa', 'Gula Aren'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfeYiKdj1P7ZoRIfQlu7ChjCxGVnXiFJUqed6Z2wB_oXAtoAJI0--z5LdIdWLJIXr0Nlpped_c5mXoJ_jxQJ56K93jY0jcbv9f54j4hqALGuxxNl7hyZrdUhpzMWE1sJ_mGngSYghLWEiYOoS7Z8-wHQ3KdxXCy3Sf7theW-8NTSdGYpX4viYUpX2WTvUDbCz3p-1PRZHKTfoC4ta28_4oif2yoYU1ACxtOY5-l0OMUm5yTQkwLJ3NEcVbZYdW66dBwqP2C3sVhliw'
  },
  {
    id: 2,
    title: 'Beras Kencur',
    category: 'Vitalitas',
    categoryClass: 'bg-secondary-container text-on-secondary-container',
    difficulty: 'Mahir',
    difficultyIcon: 'speed',
    difficultyClass: 'text-error',
    description: 'Diformulasikan untuk pemulihan otot dan penambah stamina. Membutuhkan siklus fermentasi 48 jam.',
    ingredients: ['Kencur', 'Beras', 'Jahe'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKY2m5JNCY6YaIQYKcxcxoq2C1olSA57A26a_H5d17QM6snO3ezHMUMmi1h4fRIg5sWWjGwcxjx55_n_OTELlv7wXm-XiTFZEIoqRGEJtAC1Fn8ThjCvLpCqkpHMhCYxasSJ7Vk8kJPhWGaUO2GdpJN3qkgBzY4Dz2oZToQ6OY3veZPPVSuR0NF8dp9T7xaXhpAwiotDOyGM_bKao0eeTk4eDXDhccVtA0A6TH7cHonq1zA25xanQZ7mMEj0JOj7yFY2MvkD8RK7QW'
  },
  {
    id: 3,
    title: 'Temulawak Gold',
    category: 'Pencernaan',
    categoryClass: 'bg-tertiary-container text-on-tertiary-container',
    difficulty: 'Menengah',
    difficultyIcon: 'speed',
    difficultyClass: 'text-on-secondary-fixed-variant',
    description: 'Pelindung fungsi hati dan peningkat nafsu makan. Menggunakan metode ekstraksi konsentrat tinggi.',
    ingredients: ['Temulawak', 'Madu Hutan', 'Jeruk Nipis'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASJEwLV0PNcfQC8tv_nupwterehmf82iAAuLgYJReFu-Dm3rzngmIgOtlE3luhAAB-DMo2O0uIFmYYiF2LGZTv51-mhgoNUHtf3imn3zIBhODdo68Tg2QDnTdOyY9iDudhVy7ye93kPaAa-JSK05tvy1Z5O46hhZD8uAyxj-lS-JTa4FxHUp6gASkefCDt2HWibPCw8rBs4CsjDiz2vB4oGL9YKOaTu9QdjRUpF21M9lgtlI2NDDQDohqGrpgJcTxL1FqZFOeBmnLz'
  },
  {
    id: 4,
    title: 'Cabe Puyang',
    category: 'Pegal Linu',
    categoryClass: 'bg-primary-container text-on-primary-container',
    difficulty: 'Mudah',
    difficultyIcon: 'speed',
    difficultyClass: 'text-primary',
    description: 'Ramuan andalan untuk meredakan nyeri otot dan kelelahan setelah bekerja berat. Sangat populer di kalangan pekerja fisik.',
    ingredients: ['Cabe Jawa', 'Lempuyang', 'Jahe Emprit'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASJEwLV0PNcfQC8tv_nupwterehmf82iAAuLgYJReFu-Dm3rzngmIgOtlE3luhAAB-DMo2O0uIFmYYiF2LGZTv51-mhgoNUHtf3imn3zIBhODdo68Tg2QDnTdOyY9iDudhVy7ye93kPaAa-JSK05tvy1Z5O46hhZD8uAyxj-lS-JTa4FxHUp6gASkefCDt2HWibPCw8rBs4CsjDiz2vB4oGL9YKOaTu9QdjRUpF21M9lgtlI2NDDQDohqGrpgJcTxL1FqZFOeBmnLz'
  },
  {
    id: 5,
    title: 'Pahitan Brotowali',
    category: 'Detoksifikasi',
    categoryClass: 'bg-error-container text-on-error-container',
    difficulty: 'Mahir',
    difficultyIcon: 'speed',
    difficultyClass: 'text-error',
    description: 'Membantu pembersihan darah dan menjaga kadar gula. Membutuhkan teknik perebusan khusus untuk menyeimbangkan rasa pahitnya.',
    ingredients: ['Sambiloto', 'Brotowali', 'Akar Alang-alang'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASJEwLV0PNcfQC8tv_nupwterehmf82iAAuLgYJReFu-Dm3rzngmIgOtlE3luhAAB-DMo2O0uIFmYYiF2LGZTv51-mhgoNUHtf3imn3zIBhODdo68Tg2QDnTdOyY9iDudhVy7ye93kPaAa-JSK05tvy1Z5O46hhZD8uAyxj-lS-JTa4FxHUp6gASkefCDt2HWibPCw8rBs4CsjDiz2vB4oGL9YKOaTu9QdjRUpF21M9lgtlI2NDDQDohqGrpgJcTxL1FqZFOeBmnLz'
  },
  {
    id: 6,
    title: 'Kunci Sirih',
    category: 'Kecantikan',
    categoryClass: 'bg-primary-fixed text-on-primary-fixed-variant',
    difficulty: 'Menengah',
    difficultyIcon: 'speed',
    difficultyClass: 'text-on-secondary-fixed-variant',
    description: 'Menjaga kesehatan organ dalam dan menghilangkan bau badan. Menggunakan metode perasan daun sirih segar untuk hasil maksimal.',
    ingredients: ['Temu Kunci', 'Daun Sirih', 'Kayu Manis'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASJEwLV0PNcfQC8tv_nupwterehmf82iAAuLgYJReFu-Dm3rzngmIgOtlE3luhAAB-DMo2O0uIFmYYiF2LGZTv51-mhgoNUHtf3imn3zIBhODdo68Tg2QDnTdOyY9iDudhVy7ye93kPaAa-JSK05tvy1Z5O46hhZD8uAyxj-lS-JTa4FxHUp6gASkefCDt2HWibPCw8rBs4CsjDiz2vB4oGL9YKOaTu9QdjRUpF21M9lgtlI2NDDQDohqGrpgJcTxL1FqZFOeBmnLz'
  }
];

export default function RecipeGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {recipes.map((recipe, index) => (
        <div 
          key={recipe.id} 
          className={`bg-surface-container-lowest rounded-xl overflow-hidden group hover:shadow-xl transition-all duration-500 border border-transparent hover:border-outline-variant/20 flex flex-col shadow-sm ${index % 2 !== 0 ? 'xl:mt-6' : ''}`}
        >
          <div className="h-56 overflow-hidden relative">
            <img 
              alt={recipe.title} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              src={recipe.image}
            />
            <div className="absolute top-4 left-4">
              <span className={`${recipe.categoryClass} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm`}>
                {recipe.category}
              </span>
            </div>
          </div>
          <div className="p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-primary font-headline">{recipe.title}</h3>
              <div className={`flex items-center ${recipe.difficultyClass} font-bold text-xs uppercase tracking-tighter`}>
                <span className="material-symbols-outlined text-sm mr-1">{recipe.difficultyIcon}</span> {recipe.difficulty}
              </div>
            </div>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed flex-1">
              {recipe.description}
            </p>
            <div className="mt-auto">
              <div className="text-[10px] font-bold text-on-surface/40 uppercase tracking-widest mb-3">Bahan Utama</div>
              <div className="flex flex-wrap gap-2 mb-8">
                {recipe.ingredients.map((ing, i) => (
                  <span key={i} className="px-2.5 py-1 bg-surface-container-low rounded text-xs font-medium border border-outline-variant/10">
                    {ing}
                  </span>
                ))}
              </div>
              <button className="w-full border border-primary/20 text-primary py-3 rounded-lg font-bold text-sm hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2">
                Lihat Detail <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Card: New Recipe Placeholder */}
      <div className="border-2 border-dashed border-outline-variant/40 rounded-xl flex flex-col items-center justify-center p-12 group cursor-pointer hover:bg-surface-container-high/30 transition-all min-h-75">
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
          <span className="material-symbols-outlined text-3xl text-outline">add_circle</span>
        </div>
        <h3 className="text-xl font-bold text-primary mb-2 font-headline">Buat Formula Baru</h3>
        <p className="text-xs text-on-surface-variant text-center px-4 leading-relaxed">Mulai rancang kombinasi herbal baru untuk pengetesan laboratorium.</p>
      </div>
    </div>
  );
}
