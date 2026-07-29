export default function AdminDataTable({ columns, rows, empty = 'No records found.', keyField = '_id', loading = false }) {
  if (!rows?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E5DCCE] bg-[#FFFDF8] px-6 py-14 text-center text-sm text-[#78716C]">
        {loading ? 'Loading...' : empty}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] transition-opacity ${loading ? 'opacity-60' : 'opacity-100'}`}>
      {loading && (
        <div className="absolute right-3 top-3 z-10 h-4 w-4 animate-spin rounded-full border-2 border-[#E5DCCE] border-t-[#C4A574]" aria-label="Refreshing" />
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[#E5DCCE] bg-[#F7F3EC] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B5A48]">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[keyField]} className="border-b border-[#E5DCCE] last:border-0 hover:bg-[#F7F3EC]/50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-middle text-[#57534E]">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
