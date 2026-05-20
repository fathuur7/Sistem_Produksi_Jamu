import { Helmet } from 'react-helmet-async';
import AppShell from '../../components/layout/AppShell';
import RecipesHeader from '../../components/pages/recipes/RecipesHeader';
import RecipeGrid from '../../components/pages/recipes/RecipeGrid';
import RecipeStats from '../../components/pages/recipes/RecipeStats';

export default function Recipes() {
  return (
    <>
      <Helmet>
        <title>Perpustakaan Resep | Penjamu Handal</title>
        <meta name="description" content="Manajemen formula herbal dan resep jamu tradisional." />
      </Helmet>

      <AppShell>
        <main className="p-4 sm:p-6 md:p-12 max-w-7xl w-full mx-auto pb-24">
          <RecipesHeader />
          <RecipeGrid />
          <RecipeStats />
        </main>
      </AppShell>
    </>
  );
}
