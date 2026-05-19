const PAGE_SIZES = [5, 10, 15, 20];

const Pagination = ({ page, totalPages, pageSize, total, goToPage, changePageSize }) => {
  if (total === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="pagination">
      <span className="pagination-info">{start}–{end} / {total}</span>

      <div className="pagination-controls">
        <button className="pg-btn" onClick={() => goToPage(1)} disabled={page === 1}>«</button>
        <button className="pg-btn" onClick={() => goToPage(page - 1)} disabled={page === 1}>‹</button>
        <span className="pg-current">{page} / {totalPages}</span>
        <button className="pg-btn" onClick={() => goToPage(page + 1)} disabled={page === totalPages}>›</button>
        <button className="pg-btn" onClick={() => goToPage(totalPages)} disabled={page === totalPages}>»</button>
      </div>

      <div className="pagination-sizes">
        {PAGE_SIZES.map(s => (
          <button
            key={s}
            className={`pg-size-btn ${pageSize === s ? 'active' : ''}`}
            onClick={() => changePageSize(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Pagination;
