import { ImageResponse } from 'next/og';

export const alt = 'Dar Al Najah Advertising — Printing, Embroidery & Gifts in Dubai';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  const dot = (bg) => ({ width: 46, height: 46, borderRadius: 999, background: bg });
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: '#F6F2EC', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={dot('#00B4F0')} /><div style={dot('#FF3D7F')} /><div style={dot('#FFB800')} /><div style={dot('#121212')} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 0.9, color: '#121212', letterSpacing: -4 }}>PRINT THAT</div>
          <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 0.9, color: '#2B3BFF', letterSpacing: -4 }}>GETS NOTICED.</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 30, color: '#121212' }}>
          <span style={{ fontWeight: 800 }}>DAR AL NAJAH ADVERTISING</span>
          <span style={{ color: '#6B665F' }}>Printing · Embroidery · Gifts · Photo · Dubai</span>
        </div>
      </div>
    ),
    size,
  );
}
