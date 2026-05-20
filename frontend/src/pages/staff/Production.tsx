import { Helmet } from 'react-helmet-async';
import AppShell from '../../components/layout/AppShell';
import RecipeFormulation from '../../components/pages/production/RecipeFormulation';
import IngredientComposition from '../../components/pages/production/IngredientComposition';
import OutputEstimation from '../../components/pages/production/OutputEstimation';
import SOPValidation from '../../components/pages/production/SOPValidation';
import { useProductionWorkbench } from '../../hooks/useProductionWorkbench';
import toast from 'react-hot-toast';

export default function Production() {
  const wb = useProductionWorkbench();

  const rows = wb.computed.rows.map((r) => ({
    item: { id_rempah: r.item.id_rempah, nama_rempah: r.item.nama_rempah },
    bahan: r.bahan ? {
      id: r.bahan.id,
      nama: r.bahan.nama,
      kategori: r.bahan.kategori,
      satuan: r.bahan.satuan,
    } : null,
    category: r.category,
    inputQty: r.inputQty,
    inputUnit: r.inputUnit,
    status: r.status,
    display: r.display,
  }));

  async function handleExecute() {
    try {
      const result = await wb.executeBatch();
      toast.success(`Batch ${result.kode_batch} berhasil dieksekusi!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengeksekusi batch';
      toast.error(message);
    }
  }

  return (
    <>
      <Helmet>
        <title>Konsol Produksi | Penjamu Handal</title>
        <meta name="description" content="Input staff untuk formulasi batch produksi Jamu Madura." />
      </Helmet>

      <AppShell>
        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 mb-8 text-sm font-bold text-on-surface-variant/50 uppercase tracking-widest">
            <span>Konsol Produksi</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary">Input Staff</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Kolom Kiri: Form & Tabel */}
            <div className="col-span-1 lg:col-span-8 space-y-8 flex flex-col">
              <RecipeFormulation
                jamuList={wb.jamuList}
                isLoadingJamuList={wb.isLoadingJamuList}
                error={wb.jamuListError}
                selectedJamuId={wb.selectedJamuId}
                onChangeJamu={wb.setSelectedJamuId}
                batchKg={wb.batchKg}
                onChangeBatchKg={wb.setBatchKg}
              />
              <IngredientComposition
                rows={rows}
                isLoading={wb.isLoadingRequirements}
                error={wb.requirementsError}
                onChangeQty={(bahanId, qty) => wb.updateInput(bahanId, { qty })}
              />
            </div>

            {/* Kolom Kanan: Stats & SOP */}
            <div className="col-span-1 lg:col-span-4 space-y-8 flex flex-col">
              <OutputEstimation
                jamu={wb.requirements?.jamu ?? null}
                batchKg={wb.batchValue}
                batchValid={wb.batchValid}
              />
              <SOPValidation
                onExecute={handleExecute}
                blockingIssues={wb.computed.blockingIssues}
                executeError={wb.executeError}
                disabled={!wb.selectedJamuId || !wb.batchValid || wb.isLoadingRequirements}
                isExecuting={wb.isExecuting}
              />
            </div>
          </div>
        </main>
      </AppShell>
    </>
  );
}
