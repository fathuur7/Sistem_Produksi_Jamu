import type { InventoryItem } from '../../../types/inventory';

interface InventoryTableRowProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onRestock: (item: InventoryItem) => void;
  onDelete: (id: string | number, itemName: string) => void;
}

export function InventoryTableRow({ item, onEdit, onRestock, onDelete }: InventoryTableRowProps) {
  return (
    <tr className="hover:bg-surface-container-low/40 transition-colors group">
      {/* Bahan Name & Variety */}
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-bold text-on-surface text-lg">{item.name}</p>
            <p className="text-xs text-on-surface/50">{item.variety}</p>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-8 py-6">
        <span className="text-sm font-medium text-on-surface/70 bg-surface-container px-3 py-1 rounded-full border border-outline-variant/10">
          {item.category}
        </span>
      </td>

      {/* Current Stock with Progress Bar */}
      <td className="px-8 py-6">
        <div className="flex flex-col">
          <span className={`text-xl font-bold ${item.status === 'Kritis' ? 'text-error' : 'text-primary'}`}>
            {item.stock} {item.unit}
          </span>
          <div className="w-24 h-1.5 bg-surface-container rounded-full mt-2 overflow-hidden shadow-inner">
            <div className={`h-full ${item.barFill} rounded-full`} style={{ width: item.barPercentage }}></div>
          </div>
        </div>
      </td>

      {/* Minimum Threshold */}
      <td className="px-8 py-6">
        <span className="text-sm font-bold text-on-surface/40">
          {item.threshold.toFixed(1)} {item.unit}
        </span>
      </td>

      {/* Status Badge */}
      <td className="px-8 py-6 text-center">
        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 ${item.statusClass} rounded-full text-xs font-bold uppercase tracking-wider`}>
          <span
            className={`w-1.5 h-1.5 rounded-full ${item.statusDot} ${item.status === 'Kritis' ? 'animate-pulse' : ''}`}
          ></span>
          {item.status}
        </span>
      </td>

      {/* Action Buttons */}
      <td className="px-8 py-6 text-right">
        <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Edit Button */}
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-primary hover:bg-primary-fixed/30 rounded-lg transition-colors focus:opacity-100"
            title="Edit Data"
            aria-label={`Edit ${item.name}`}
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>

          {/* Restock Button */}
          <button
            onClick={() => onRestock(item)}
            className={`p-2 rounded-lg transition-colors focus:opacity-100 ${
              item.status === 'Kritis'
                ? 'text-secondary bg-secondary-fixed/30 hover:bg-secondary-fixed/50'
                : 'text-secondary hover:bg-secondary-fixed/20'
            }`}
            title="Isi Ulang Stok (Restock)"
            aria-label={`Restock ${item.name}`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {item.status === 'Kritis' ? 'autorenew' : 'inventory_2'}
            </span>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(item.id, item.name)}
            className="p-2 text-error hover:bg-error-container/30 rounded-lg transition-colors focus:opacity-100"
            title="Hapus Data"
            aria-label={`Delete ${item.name}`}
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
