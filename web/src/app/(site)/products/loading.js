export default function Loading() {
  return (
    <div className="catalog page-pad" aria-busy="true" aria-label="Loading products">
      <div className="container">
        <div className="sk" style={{ height: 110, width: '55%', marginTop: 30, borderRadius: 16 }} />
        <div className="sk sk-line" style={{ width: '40%', marginTop: 20 }} />
        <div className="p-grid" style={{ marginTop: 40 }}>
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="sk" style={{ aspectRatio: '1 / 1.25', borderRadius: 'var(--r)' }} />)}
        </div>
      </div>
    </div>
  );
}
