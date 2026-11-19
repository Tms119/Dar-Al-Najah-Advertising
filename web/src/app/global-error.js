'use client';

// last-resort boundary if the root layout itself fails
export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#F6F2EC', color: '#121212', display: 'grid', placeItems: 'center', minHeight: '100vh', margin: 0 }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <h1>Something went wrong</h1>
          <p>Please refresh the page.</p>
          <button onClick={reset} style={{ padding: '12px 22px', borderRadius: 999, border: 0, background: '#121212', color: '#fff', fontWeight: 600 }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
