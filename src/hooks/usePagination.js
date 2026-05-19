import { useState, useMemo } from 'react';

const usePagination = (items, defaultPageSize = 10) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const goToPage = (p) => setPage(Math.max(1, Math.min(p, totalPages)));

  const changePageSize = (size) => {
    setPageSize(Number(size));
    setPage(1);
  };

  return { paginated, page: currentPage, totalPages, pageSize, total: items.length, goToPage, changePageSize };
};

export default usePagination;
