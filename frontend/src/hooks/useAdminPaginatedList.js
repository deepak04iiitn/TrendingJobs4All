import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Shared server-side pagination/search/filter state for admin list pages.
 *
 * `fetchFn` must return `{ items, total, extra? }` for a given `{ page, limit, ...filters }`
 * request — adapt whatever shape the underlying API returns before returning it here.
 *
 * `filters` is any plain object (search term, status, date, tab, sort, etc.) — changing any
 * value in it resets to page 1 and refetches after a short debounce. Page navigation via
 * `goToPage` fetches immediately (no debounce), since it's a direct user action.
 */
export function useAdminPaginatedList(fetchFn, filters, limit = 12) {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [extra, setExtra] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const runFetch = useCallback(
    async (targetPage) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchFnRef.current({ page: targetPage, limit, ...filtersRef.current });
        setRows(result.items || []);
        setTotal(result.total || 0);
        setExtra(result.extra || {});
        setPage(targetPage);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  const filtersKey = JSON.stringify(filters);
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      runFetch(1);
      return undefined;
    }
    const t = setTimeout(() => runFetch(1), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, limit]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    page,
    goToPage: runFetch,
    rows,
    total,
    totalPages,
    limit,
    loading,
    error,
    extra,
    reload: () => runFetch(page),
  };
}
