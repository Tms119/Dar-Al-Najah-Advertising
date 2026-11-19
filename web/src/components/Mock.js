/* Illustrated product mockups — flat, bold, print-shop style.
   Placeholders until real product photos are uploaded via admin. */

const INK = '#121212';
const PAPER = '#FFFFFF';
const s = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' };

const Lines = ({ x, y, w, n = 3, gap = 9, color = INK, op = 0.18 }) => (
  <g opacity={op}>
    {Array.from({ length: n }).map((_, i) => (
      <rect key={i} x={x} y={y + i * gap} width={i === n - 1 ? w * 0.6 : w} height="4" rx="2" fill={color} />
    ))}
  </g>
);

const shapes = {
  card: (c) => (
    <>
      <rect x="38" y="62" width="120" height="72" rx="8" fill={c} {...s} transform="rotate(-10 98 98)" />
      <rect x="44" y="72" width="120" height="72" rx="8" fill={PAPER} {...s} transform="rotate(6 104 108)" />
      <g transform="rotate(6 104 108)">
        <circle cx="68" cy="96" r="10" fill={c} />
        <Lines x={86} y={90} w={56} n={2} />
        <Lines x={56} y={120} w={90} n={2} gap={8} />
      </g>
    </>
  ),
  flyer: (c) => (
    <>
      <rect x="62" y="30" width="92" height="128" rx="4" fill={c} {...s} transform="rotate(8 108 94)" />
      <rect x="48" y="40" width="92" height="128" rx="4" fill={PAPER} {...s} />
      <rect x="48" y="40" width="92" height="50" fill={c} {...s} />
      <circle cx="94" cy="65" r="14" fill={PAPER} {...s} />
      <Lines x={60} y={102} w={68} n={4} />
      <rect x="60" y="142" width="36" height="12" rx="6" fill={INK} />
    </>
  ),
  poster: (c) => (
    <>
      <rect x="50" y="22" width="100" height="148" rx="3" fill={PAPER} {...s} />
      <circle cx="100" cy="78" r="34" fill={c} {...s} />
      <rect x="62" y="122" width="76" height="12" rx="2" fill={INK} />
      <Lines x={62} y={142} w={76} n={2} />
      <path d="M100 18v-8" {...s} />
    </>
  ),
  booklet: (c) => (
    <>
      <path d="M100 60 Q70 46 32 54 V150 Q70 142 100 156 Z" fill={PAPER} {...s} />
      <path d="M100 60 Q130 46 168 54 V150 Q130 142 100 156 Z" fill={c} {...s} />
      <Lines x={44} y={74} w={44} n={6} gap={10} />
      <rect x="114" y="74" width="40" height="34" rx="3" fill={PAPER} opacity="0.85" />
      <Lines x={114} y={118} w={40} n={3} gap={9} color={PAPER} op={0.7} />
    </>
  ),
  folder: (c) => (
    <>
      <rect x="62" y="34" width="86" height="116" rx="3" fill={PAPER} {...s} transform="rotate(6 105 92)" />
      <path d="M40 60 H96 L106 70 H160 V166 H40 Z" fill={c} {...s} />
      <path d="M40 110 L160 92 V166 H40 Z" fill={c} {...s} style={{ filter: 'brightness(0.85)' }} />
      <rect x="60" y="136" width="44" height="8" rx="4" fill={PAPER} />
    </>
  ),
  calendar: (c) => (
    <>
      <rect x="40" y="44" width="120" height="120" rx="10" fill={PAPER} {...s} />
      <path d="M40 54 Q40 44 50 44 H150 Q160 44 160 54 V76 H40 Z" fill={c} {...s} />
      {[64, 88, 112, 136].map((x) => <rect key={x} x={x - 3} y="34" width="6" height="20" rx="3" fill={INK} />)}
      {[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((col) => (
        <rect key={`${r}${col}`} x={52 + col * 20} y={88 + r * 18} width="14" height="11" rx="2"
          fill={r === 1 && col === 2 ? c : INK} opacity={r === 1 && col === 2 ? 1 : 0.15} />
      )))}
    </>
  ),
  envelope: (c) => (
    <>
      <rect x="30" y="58" width="140" height="92" rx="6" fill={PAPER} {...s} />
      <path d="M30 64 L100 112 L170 64" fill="none" {...s} />
      <path d="M30 64 Q30 58 36 58 H164 Q170 58 170 64 L100 112 Z" fill={c} {...s} />
      <circle cx="100" cy="104" r="10" fill={INK} />
    </>
  ),
  badge: (c) => (
    <>
      <path d="M86 20 L100 48 L114 20" fill="none" {...s} stroke={c} strokeWidth="8" />
      <rect x="92" y="42" width="16" height="12" rx="3" fill={INK} />
      <rect x="58" y="52" width="84" height="122" rx="10" fill={PAPER} {...s} />
      <rect x="58" y="52" width="84" height="30" rx="10" fill={c} {...s} />
      <circle cx="100" cy="106" r="18" fill={c} opacity="0.25" {...s} />
      <Lines x={72} y={134} w={56} n={3} />
    </>
  ),
  banner: (c) => (
    <>
      <path d="M30 40 V170 M170 40 V170" {...s} strokeWidth="5" />
      <rect x="30" y="52" width="140" height="78" fill={c} {...s} />
      <rect x="44" y="70" width="80" height="14" rx="2" fill={PAPER} />
      <rect x="44" y="92" width="56" height="8" rx="2" fill={PAPER} opacity="0.7" />
      {[38, 162].map((x) => [60, 122].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="3.5" fill={PAPER} {...s} strokeWidth="2" />))}
    </>
  ),
  rollup: (c) => (
    <>
      <rect x="64" y="20" width="72" height="150" fill={c} {...s} />
      <rect x="74" y="34" width="52" height="10" rx="2" fill={PAPER} />
      <circle cx="100" cy="86" r="22" fill={PAPER} opacity="0.9" />
      <Lines x={74} y={124} w={52} n={3} color={PAPER} op={0.8} />
      <rect x="54" y="168" width="92" height="14" rx="4" fill="#cfcfcf" {...s} />
      <path d="M60 182 L54 190 M140 182 L146 190" {...s} />
    </>
  ),
  sticker: (c) => (
    <>
      <circle cx="100" cy="100" r="64" fill={c} {...s} />
      <circle cx="100" cy="100" r="44" fill="none" stroke={PAPER} strokeWidth="4" strokeDasharray="6 8" />
      <path d="M86 92 l8 16 l22 -26" fill="none" stroke={PAPER} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M146 128 Q132 128 128 146 Q150 150 146 128Z" fill={PAPER} {...s} />
    </>
  ),
  box: (c) => (
    <>
      <path d="M100 40 L164 70 L100 100 L36 70 Z" fill={PAPER} {...s} />
      <path d="M36 70 L100 100 V170 L36 140 Z" fill={c} {...s} />
      <path d="M164 70 L100 100 V170 L164 140 Z" fill={c} {...s} style={{ filter: 'brightness(0.8)' }} />
      <path d="M68 55 L132 85" stroke={c} strokeWidth="10" />
      <circle cx="68" cy="118" r="12" fill={PAPER} opacity="0.85" />
    </>
  ),
  bag: (c) => (
    <>
      <path d="M74 66 Q74 30 100 30 Q126 30 126 66" fill="none" {...s} strokeWidth="5" />
      <path d="M44 64 H156 L164 172 H36 Z" fill={c} {...s} />
      <path d="M44 64 L56 78 L56 172" fill="none" {...s} opacity="0.35" />
      <circle cx="100" cy="116" r="22" fill={PAPER} {...s} />
      <path d="M92 116 h16 M100 108 v16" {...s} stroke={c} strokeWidth="4" />
    </>
  ),
  tag: (c) => (
    <>
      <path d="M100 20 Q130 30 112 54" fill="none" {...s} />
      <path d="M70 60 L100 40 L130 60 V170 H70 Z" fill={c} {...s} />
      <circle cx="100" cy="62" r="7" fill={PAPER} {...s} />
      <rect x="80" y="92" width="40" height="40" rx="20" fill={PAPER} opacity="0.9" />
      <Lines x={80} y={144} w={40} n={2} color={PAPER} op={0.8} />
    </>
  ),
  notebook: (c) => (
    <>
      <rect x="52" y="30" width="100" height="140" rx="8" fill={c} {...s} />
      <rect x="52" y="30" width="16" height="140" rx="4" fill={INK} opacity="0.2" />
      <rect x="132" y="30" width="7" height="140" fill={INK} />
      <rect x="78" y="70" width="40" height="24" rx="3" fill={PAPER} />
      <path d="M138 170 v14 l-4 -4 l-4 4 v-14" fill={c} {...s} strokeWidth="2" />
    </>
  ),
  shirt: (c) => (
    <>
      <path d="M72 38 L48 46 L24 74 L44 92 L58 82 V168 H142 V82 L156 92 L176 74 L152 46 L128 38 Q100 62 72 38Z" fill={c} {...s} />
      <path d="M72 38 Q100 62 128 38" fill="none" {...s} />
      <circle cx="100" cy="104" r="18" fill={PAPER} opacity="0.9" />
      <path d="M92 104 h16" stroke={c} strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  hoodie: (c) => (
    <>
      <path d="M70 44 L46 52 L26 120 L46 126 L58 90 V170 H142 V90 L154 126 L174 120 L154 52 L130 44Z" fill={c} {...s} />
      <path d="M70 44 Q70 18 100 18 Q130 18 130 44 Q118 70 100 70 Q82 70 70 44Z" fill={c} {...s} style={{ filter: 'brightness(0.85)' }} />
      <path d="M92 70 v26 M108 70 v26" {...s} strokeWidth="2.5" />
      <rect x="72" y="134" width="56" height="26" rx="6" fill="none" {...s} opacity="0.5" />
    </>
  ),
  patch: (c) => (
    <>
      <circle cx="100" cy="100" r="66" fill={INK} />
      <circle cx="100" cy="100" r="58" fill={c} />
      <circle cx="100" cy="100" r="52" fill="none" stroke={PAPER} strokeWidth="3" strokeDasharray="5 6" />
      <path d="M100 66 l10 22 l24 3 l-18 16 l5 24 l-21 -12 l-21 12 l5 -24 l-18 -16 l24 -3z" fill={PAPER} />
    </>
  ),
  abaya: (c) => (
    <>
      <path d="M82 28 L60 36 L30 110 L50 116 L64 80 L50 176 H150 L136 80 L150 116 L170 110 L140 36 L118 28 Q100 44 82 28Z" fill={INK} {...s} />
      <path d="M100 40 V176" stroke={c} strokeWidth="4" strokeDasharray="2 6" />
      <path d="M58 168 Q100 156 142 168" fill="none" stroke={c} strokeWidth="5" />
      <path d="M38 104 l14 5" stroke={c} strokeWidth="4" />
      <path d="M162 104 l-14 5" stroke={c} strokeWidth="4" />
    </>
  ),
  cap: (c) => (
    <>
      <path d="M40 120 Q40 56 100 56 Q160 56 160 120 Z" fill={c} {...s} />
      <path d="M100 56 V120 M70 64 Q80 90 76 120 M130 64 Q120 90 124 120" fill="none" {...s} opacity="0.35" />
      <path d="M40 120 H160 Q186 122 186 136 Q150 146 40 132 Z" fill={c} {...s} style={{ filter: 'brightness(0.8)' }} />
      <circle cx="100" cy="54" r="5" fill={INK} />
      <circle cx="100" cy="94" r="12" fill={PAPER} />
    </>
  ),
  towel: (c) => (
    <>
      <rect x="40" y="110" width="120" height="44" rx="10" fill={PAPER} {...s} />
      <rect x="44" y="76" width="112" height="40" rx="10" fill={c} {...s} />
      <rect x="48" y="46" width="104" height="36" rx="10" fill={c} {...s} style={{ filter: 'brightness(1.15)' }} />
      <path d="M60 96 H140" stroke={PAPER} strokeWidth="3" strokeDasharray="4 5" />
      <path d="M60 132 H140" stroke={c} strokeWidth="3" strokeDasharray="4 5" />
    </>
  ),
  apron: (c) => (
    <>
      <path d="M78 22 Q100 10 122 22" fill="none" {...s} />
      <path d="M78 30 H122 V70 Q150 70 156 84 L140 176 H60 L44 84 Q50 70 78 70 Z" fill={c} {...s} />
      <path d="M44 84 L20 96 M156 84 L180 96" {...s} />
      <rect x="74" y="118" width="52" height="30" rx="4" fill="none" {...s} />
      <circle cx="100" cy="88" r="10" fill={PAPER} />
    </>
  ),
  shorts: (c) => (
    <>
      <path d="M46 48 H154 L168 160 H112 L100 96 L88 160 H32 Z" fill={c} {...s} />
      <rect x="46" y="48" width="108" height="16" fill={INK} opacity="0.85" />
      <path d="M40 140 L36 160 M160 140 L164 160" stroke={PAPER} strokeWidth="5" />
    </>
  ),
  cube: (c) => (
    <>
      <path d="M100 30 L160 60 V130 L100 162 L40 130 V60 Z" fill="#EAF6FF" {...s} opacity="0.95" />
      <path d="M40 60 L100 92 L160 60 M100 92 V162" fill="none" {...s} opacity="0.4" />
      <path d="M100 70 q-14 -16 -26 0 q-6 14 26 34 q32 -20 26 -34 q-12 -16 -26 0z" fill={c} />
    </>
  ),
  pillow: (c) => (
    <>
      <path d="M40 46 Q100 34 160 46 Q172 100 160 154 Q100 166 40 154 Q28 100 40 46Z" fill={c} {...s} />
      <path d="M58 64 Q100 56 142 64 Q150 100 142 136 Q100 144 58 136 Q50 100 58 64Z" fill="none" stroke={PAPER} strokeWidth="3" strokeDasharray="5 6" />
      <path d="M100 82 q-14 -16 -26 0 q-6 14 26 34 q32 -20 26 -34 q-12 -16 -26 0z" fill={PAPER} />
    </>
  ),
  vest: (c) => (
    <>
      <path d="M68 26 L44 40 L40 174 H160 L156 40 L132 26 Q120 74 100 74 Q80 74 68 26Z" fill={c} {...s} />
      <path d="M100 74 V174" {...s} />
      <rect x="40" y="110" width="120" height="12" fill="#D9D9D9" {...s} strokeWidth="2" />
      <rect x="40" y="140" width="120" height="12" fill="#D9D9D9" {...s} strokeWidth="2" />
    </>
  ),
  helmet: (c) => (
    <>
      <path d="M44 128 Q44 54 100 50 Q156 54 156 128 Z" fill={c} {...s} />
      <path d="M100 50 V128" {...s} opacity="0.3" strokeWidth="10" />
      <path d="M28 128 H172 Q172 144 156 144 H44 Q28 144 28 128Z" fill={c} {...s} style={{ filter: 'brightness(0.85)' }} />
      <rect x="62" y="96" width="30" height="16" rx="3" fill={PAPER} />
    </>
  ),
  bottle: (c) => (
    <>
      <rect x="84" y="20" width="32" height="22" rx="4" fill={INK} />
      <path d="M80 42 H120 V56 Q136 62 136 80 V172 Q136 180 128 180 H72 Q64 180 64 172 V80 Q64 62 80 56Z" fill={c} {...s} />
      <rect x="64" y="96" width="72" height="50" fill={PAPER} {...s} />
      <circle cx="100" cy="121" r="12" fill={c} />
    </>
  ),
  mug: (c) => (
    <>
      <path d="M140 76 Q176 76 172 108 Q168 138 140 134" fill="none" {...s} strokeWidth="10" stroke={INK} />
      <path d="M140 76 Q176 76 172 108 Q168 138 140 134" fill="none" strokeWidth="4" stroke={PAPER} />
      <path d="M40 56 H144 V150 Q144 170 124 170 H60 Q40 170 40 150Z" fill={PAPER} {...s} />
      <rect x="40" y="76" width="104" height="54" fill={c} />
      <path d="M40 56 H144 V150 Q144 170 124 170 H60 Q40 170 40 150Z" fill="none" {...s} />
      <path d="M70 36 q8 -8 0 -16 M92 36 q8 -8 0 -16 M114 36 q8 -8 0 -16" fill="none" {...s} opacity="0.4" />
      <circle cx="92" cy="103" r="12" fill={PAPER} />
    </>
  ),
  plate: (c) => (
    <>
      <rect x="26" y="62" width="148" height="78" rx="10" fill={c} {...s} />
      <rect x="38" y="74" width="124" height="54" rx="4" fill="none" stroke={PAPER} strokeWidth="2.5" />
      {[[36, 72], [164, 72], [36, 130], [164, 130]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="4" fill={PAPER} {...s} strokeWidth="2" />)}
      <rect x="56" y="88" width="88" height="12" rx="2" fill={PAPER} />
      <rect x="72" y="108" width="56" height="7" rx="2" fill={PAPER} opacity="0.7" />
    </>
  ),
  pen: (c) => (
    <g transform="rotate(-38 100 100)">
      <rect x="30" y="88" width="120" height="24" rx="12" fill={c} {...s} />
      <path d="M150 90 L178 100 L150 110Z" fill="#E8E8E8" {...s} />
      <rect x="42" y="80" width="40" height="8" rx="4" fill={INK} />
      <rect x="62" y="96" width="60" height="7" rx="3" fill={PAPER} opacity="0.85" />
    </g>
  ),
  keychain: (c) => (
    <>
      <circle cx="76" cy="58" r="26" fill="none" {...s} strokeWidth="6" />
      <path d="M92 78 L104 92" {...s} strokeWidth="5" />
      <rect x="92" y="88" width="72" height="72" rx="18" fill={c} {...s} transform="rotate(12 128 124)" />
      <circle cx="130" cy="126" r="14" fill={PAPER} />
    </>
  ),
  flag: (c) => (
    <>
      <path d="M44 26 V182" {...s} strokeWidth="6" />
      <circle cx="44" cy="24" r="6" fill={INK} />
      <path d="M47 36 Q86 22 116 38 Q146 54 176 40 V112 Q146 126 116 110 Q86 94 47 108Z" fill={c} {...s} />
      <circle cx="108" cy="74" r="14" fill={PAPER} />
    </>
  ),
  ribbon: (c) => (
    <>
      <path d="M100 96 Q60 48 40 70 Q28 92 100 96 Q172 92 160 70 Q140 48 100 96Z" fill={c} {...s} />
      <path d="M96 100 L70 170 L84 160 L92 176 L102 104 M104 100 L130 170 L116 160 L108 176 L98 104" fill={c} {...s} />
      <rect x="90" y="86" width="20" height="20" rx="5" fill={c} {...s} style={{ filter: 'brightness(0.85)' }} />
    </>
  ),
  lanyard: (c) => (
    <>
      <path d="M50 14 L94 120 M150 14 L106 120" stroke={c} strokeWidth="14" strokeLinecap="round" />
      <path d="M50 14 L94 120 M150 14 L106 120" stroke={PAPER} strokeWidth="2" strokeDasharray="6 10" />
      <rect x="92" y="116" width="16" height="16" rx="3" fill="#BDBDBD" {...s} strokeWidth="2" />
      <rect x="66" y="130" width="68" height="54" rx="8" fill={PAPER} {...s} />
      <circle cx="86" cy="156" r="10" fill={c} />
      <Lines x={102} y={148} w={24} n={2} />
    </>
  ),
  usb: (c) => (
    <g transform="rotate(-20 100 100)">
      <rect x="52" y="74" width="96" height="52" rx="12" fill={c} {...s} />
      <rect x="148" y="84" width="30" height="32" rx="2" fill="#E0E0E0" {...s} />
      <rect x="156" y="92" width="7" height="6" fill={INK} /><rect x="156" y="102" width="7" height="6" fill={INK} />
      <circle cx="68" cy="100" r="5" fill={PAPER} {...s} strokeWidth="2" />
      <rect x="86" y="92" width="44" height="16" rx="3" fill={PAPER} />
    </g>
  ),
  puzzle: (c) => (
    <>
      <path d="M40 40 H96 V58 a10 10 0 1 1 0 20 V96 H78 a10 10 0 1 0 -20 0 H40Z" fill={c} {...s} />
      <path d="M104 40 H160 V96 H142 a10 10 0 1 0 -20 0 H104 V78 a10 10 0 1 1 0 -20Z" fill={PAPER} {...s} />
      <path d="M40 104 H58 a10 10 0 1 1 20 0 H96 V160 H40Z" fill={PAPER} {...s} transform="translate(-4 6) rotate(-4 68 132)" />
      <path d="M104 104 H122 a10 10 0 1 1 20 0 H160 V160 H104Z" fill={c} {...s} style={{ filter: 'brightness(0.85)' }} />
    </>
  ),
  photo: (c) => (
    <>
      <rect x="58" y="34" width="96" height="116" rx="4" fill={PAPER} {...s} transform="rotate(10 106 92)" />
      <rect x="44" y="44" width="96" height="116" rx="4" fill={PAPER} {...s} transform="rotate(-6 92 102)" />
      <g transform="rotate(-6 92 102)">
        <rect x="54" y="54" width="76" height="76" fill={c} opacity="0.3" />
        <circle cx="92" cy="84" r="14" fill={c} />
        <path d="M66 130 Q66 104 92 104 Q118 104 118 130Z" fill={c} />
      </g>
    </>
  ),
  camera: (c) => (
    <>
      <path d="M70 58 L80 42 H120 L130 58Z" fill={INK} />
      <rect x="28" y="58" width="144" height="100" rx="14" fill={c} {...s} />
      <rect x="28" y="78" width="144" height="58" fill={INK} opacity="0.12" />
      <circle cx="100" cy="108" r="34" fill={PAPER} {...s} />
      <circle cx="100" cy="108" r="20" fill={INK} />
      <circle cx="94" cy="102" r="6" fill={PAPER} opacity="0.8" />
      <rect x="140" y="68" width="18" height="8" rx="3" fill={PAPER} />
    </>
  ),
  film: (c) => (
    <g transform="rotate(-10 100 100)">
      <rect x="18" y="62" width="164" height="76" fill={INK} />
      {Array.from({ length: 10 }).map((_, i) => (
        <g key={i}><rect x={24 + i * 16} y="66" width="8" height="7" rx="1.5" fill={PAPER} /><rect x={24 + i * 16} y="127" width="8" height="7" rx="1.5" fill={PAPER} /></g>
      ))}
      {[0, 1, 2].map((i) => <rect key={i} x={26 + i * 52} y="80" width="44" height="40" rx="2" fill={c} opacity={1 - i * 0.25} />)}
    </g>
  ),
};

export default function Mock({ shape = 'card', color = '#2B3BFF', className = '', title }) {
  const draw = shapes[shape] || shapes.card;
  return (
    <svg className={className} viewBox="0 0 200 200" role="img" aria-label={title || shape} xmlns="http://www.w3.org/2000/svg">
      {draw(color)}
    </svg>
  );
}
