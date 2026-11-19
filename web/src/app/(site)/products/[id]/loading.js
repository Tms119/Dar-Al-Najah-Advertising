export default function Loading() {
  return (
    <div className="pdp page-pad" aria-busy="true" aria-label="Loading product">
      <div className="container">
        <div className="sk sk-line" style={{ width: 220, marginTop: 10 }} />
        <section className="pdp-main" style={{ marginTop: 24 }}>
          <div className="sk" style={{ aspectRatio: '1', borderRadius: 'var(--r-lg)' }} />
          <div>
            <div className="sk sk-line" style={{ width: 120, height: 28 }} />
            <div className="sk" style={{ height: 70, width: '80%', marginTop: 18, borderRadius: 14 }} />
            <div className="sk sk-line" style={{ width: '95%', marginTop: 24 }} />
            <div className="sk sk-line" style={{ width: '70%' }} />
            {[0, 1, 2].map((i) => <div key={i} className="sk" style={{ height: 44, width: '60%', marginTop: 22, borderRadius: 14 }} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
