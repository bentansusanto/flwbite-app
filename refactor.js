const fs = require('fs');
const file = 'src/components/modules/purchases/receiving/PurchaseReceivingPage.tsx';
let data = fs.readFileSync(file, 'utf8');

if (!data.includes('paginatedReceipts')) {
  data = data.replace(
    /const \[search, setSearch\] = useState\(""\);/,
    `const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);`
  );

  if (!data.includes('RefreshCcw')) {
    data = data.replace(/ChevronDown\n\} from "lucide-react";/, 'ChevronDown, RefreshCcw\n} from "lucide-react";');
  }

  const oldHeader = /<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">\s*<div className="relative max-w-sm w-full">([\s\S]*?)<\/button>\s*<\/div>/;
  const newHeader = `<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm w-full">
              $1
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 h-11 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 transition-colors">
                <Filter size={16} /> Filter
              </button>
              <button onClick={() => { setSearch(""); setCurrentPage(1); }} className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 h-11 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 transition-colors">
                 <RefreshCcw size={16} /> Reset
              </button>
            </div>
          </div>`;
  data = data.replace(oldHeader, newHeader);

  const paginationLogic = `
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedReceipts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const startItem = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filtered.length);
`;
  data = data.replace(/const filtered = useMemo\(\(\) => \{[\s\S]*?\}, \[receipts, search\]\);/, (match) => match + '\n' + paginationLogic);

  data = data.replace(/filtered\.map\(/, 'paginatedReceipts.map(');

  const paginationUI = `
        {/* Pagination Section */}
        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-3.5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-400">
              {filtered.length === 0 ? "0 receipt" : \`\${startItem}–\${endItem} dari \${filtered.length} receipt\`}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">Tampilkan</span>
              <select
                value={pageSize}
                onChange={(e) => {setPageSize(Number(e.target.value)); setCurrentPage(1);}}
                className="appearance-none h-7 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                {[5, 10, 25, 50].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="text-xs text-gray-400">per halaman</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronDown size={13} className="rotate-90" />
              <ChevronDown size={13} className="-ml-2 rotate-90" />
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronDown size={13} className="rotate-90" />
            </button>
            
            <span className="px-4 text-xs font-medium text-gray-600 dark:text-gray-400">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronDown size={13} className="-rotate-90" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronDown size={13} className="-rotate-90" />
              <ChevronDown size={13} className="-ml-2 -rotate-90" />
            </button>
          </div>
        </div>`;
  
  data = data.replace(/<\/table>\s*<\/div>\s*<\/div>/, '</table>\n        </div>\n' + paginationUI + '\n      </div>');

  data = data.replace(/<th className="px-5/g, '<th className="whitespace-nowrap px-5');
  data = data.replace(/<td className="px-5/g, '<td className="whitespace-nowrap px-5');

  const fixSelect = (selectCode) => {
    let replaced = selectCode.replace(/className="/, 'className="appearance-none ');
    return \`<div className="relative">
              \${replaced}
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>\`;
  };

  data = data.replace(/<select[\s\S]*?value=\{form\.purchase_order_id\}[\s\S]*?<\/select>/, fixSelect);
  data = data.replace(/<select[\s\S]*?value=\{form\.status\}[\s\S]*?<\/select>/, fixSelect);

  fs.writeFileSync(file, data);
  console.log('Done refactoring');
}
