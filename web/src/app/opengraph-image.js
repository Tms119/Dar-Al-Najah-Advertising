import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const alt = 'Dar Al Najah Advertising. Printing, embroidery, gifts and photo studio in Dubai';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage() {
  const logo = await readFile(join(process.cwd(), 'public/brand/logo-1200.png'));
  const src = `data:image/png;base64,${logo.toString('base64')}`;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, fontFamily: 'sans-serif' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={760} height={381} alt="" />
        <div style={{ display: 'flex', gap: 16, fontSize: 28, color: '#121212' }}>
          <span>Printing</span><span style={{ color: '#21AAE1' }}>·</span>
          <span>Embroidery</span><span style={{ color: '#21AAE1' }}>·</span>
          <span>Gifts</span><span style={{ color: '#21AAE1' }}>·</span>
          <span>Photo Studio</span><span style={{ color: '#21AAE1' }}>·</span>
          <span>Dubai</span>
        </div>
      </div>
    ),
    size,
  );
}
