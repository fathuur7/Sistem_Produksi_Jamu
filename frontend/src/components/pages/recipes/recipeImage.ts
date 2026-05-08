const DEFAULT_RECIPE_IMAGE = '/jamu.jpg';

const RECIPE_IMAGE_BY_KEYWORD: Array<{ keywords: string[]; image: string }> = [
  {
    keywords: ['jahe', 'kunyit', 'imunitas', 'hangat'],
    image: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?q=80&w=1600&auto=format&fit=crop',
  },
  {
    keywords: ['temulawak', 'hati', 'pencernaan', 'liver'],
    image: 'https://images.unsplash.com/photo-1518860306256-36469c8a8f2f?q=80&w=1600&auto=format&fit=crop',
  },
  {
    keywords: ['rempah', 'angin', 'kencur', 'kapulaga'],
    image: 'https://images.unsplash.com/photo-1515586000433-45406d8e6662?q=80&w=1600&auto=format&fit=crop',
  },
  {
    keywords: ['pelangsing', 'diet', 'detoks', 'bangle'],
    image: 'https://images.unsplash.com/photo-1514996937319-344454492b37?q=80&w=1600&auto=format&fit=crop',
  },
  {
    keywords: ['wedang', 'secang', 'antioksidan'],
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1600&auto=format&fit=crop',
  },
  {
    keywords: ['mahkota', 'dewa', 'diabetes', 'plus'],
    image: 'https://images.unsplash.com/photo-1515586424178-8f6d8c0c3c8a?q=80&w=1600&auto=format&fit=crop',
  },
  {
    keywords: ['wanita', 'kewanitaan', 'khusus wanita'],
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop',
  },
  {
    keywords: ['pria', 'suami istri', 'vitalitas'],
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1600&auto=format&fit=crop',
  },
];

function normalizeText(value: string) {
  return value.toLowerCase();
}

export function getRecipeImage(name: string, jenis?: string | null) {
  const searchableText = `${normalizeText(name)} ${normalizeText(jenis ?? '')}`;
  const matched = RECIPE_IMAGE_BY_KEYWORD.find(({ keywords }) =>
    keywords.some(keyword => searchableText.includes(keyword)),
  );

  return matched?.image ?? DEFAULT_RECIPE_IMAGE;
}
