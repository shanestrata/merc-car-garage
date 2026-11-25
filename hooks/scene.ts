// The garage backdrop, drawn as old-school pixel art on a 240 x 135 grid: every
// shape is whole grid pixels and the SVG scales it up with crisp edges.
// Layout: screen banks on the back wall, a big pit wall stand front right,
// a crew member checking screens along the back, and a driver who walks through
// along the front every so often.

const W = 240
const H = 135

// ---- Palette ------------------------------------------------------------------

const P: Record<string, string> = {
  q: '#19b5a8', // team teal
  Q: '#0f6e67', // dark teal
  h: '#3b2a20', // hair
  y: '#c9a227', // blond hair
  n: '#7a4a2a', // auburn hair
  s: '#d9a27a', // skin
  e: '#101214', // eye
  t: '#1f8f86', // team shirt
  w: '#c9d4d8', // silver
  d: '#3d4a55', // trousers
  b: '#0a0b0c', // boots
  k: '#0e1113', // headset band and mic
  c: '#2fd3c4', // headset cups, lit
  g: '#7fe0d6', // tablet glow
  m: '#2a3135', // chair
  V: '#0b3b3a', // visor
  v: '#4fe6d6', // visor glint
  K: '#14181a', // gloves, HANS
}

// Rows of characters to pixel rects, merging runs so the SVG stays small.
function sprite(rows: readonly string[], ox = 0, oy = 0): string {
  const out: string[] = []
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const ch = row[x]!
      let end = x + 1
      while (end < row.length && row[end] === ch) end++
      const fill = P[ch]
      if (fill !== undefined) {
        out.push(`<rect x="${ox + x}" y="${oy + y}" width="${end - x}" height="1" fill="${fill}"/>`)
      }
      x = end
    }
  })
  return out.join('')
}

const mirror = (rows: readonly string[]) => rows.map(row => [...row].reverse().join(''))
const recolor = (rows: readonly string[], from: string, to: string) => rows.map(row => row.split(from).join(to))
const rect = (x: number, y: number, w: number, h: number, fill: string, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra}/>`

// ---- People -------------------------------------------------------------------

const LEGS_STAND = ['...dddd...', '...dd.dd..', '...dd.dd..', '...dd.dd..', '...dd.dd..', '...bbbbbbb']
const LEGS_STRIDE = ['...dddd...', '..dd..dd..', '.dd....dd.', '.dd....dd.', '.dd....dd.', 'bbb....bbb']
const LEGS_PASS = ['...dddd...', '...ddddd..', '....ddd...', '....ddd...', '....ddd...', '....bbbb..']

const CREW_BODY = [
  '...qqqq...',
  '..qqqqqqqq',
  '..hhssss..',
  '..hsssess.',
  '..hsssss..',
  '...ssss...',
  '..kttttk..',
  '..tttttt..',
  '..twtttgg.',
  '..tttttgg.',
  '..tttttt..',
  '..dddddd..',
]

const DRIVER_BODY = [
  '...wwww...',
  '..wwwwwww.',
  '.wwwwVVVV.',
  '.wwwwVvVV.',
  '.qqqqqqqq.',
  '..wwwwww..',
  '...KKKK...',
  '..tttttt..',
  '.ttwwtttt.',
  '.tt.tttKK.',
  '.KK.tttt..',
  '..wwwwww..',
]

// A walking figure: body, standing legs and two walking frames. Feet end on the origin.
function figure(body: readonly string[], legColor: string, cls: string): string {
  const legs = (rows: readonly string[]) => recolor(rows, 'd', legColor)
  const top = -(body.length + 6)
  return `<g class="${cls}-face"><g transform="translate(-5 ${top})">
${sprite(body)}
<g class="${cls}-stand">${sprite(legs(LEGS_STAND), 0, body.length)}</g>
<g class="${cls}-walk">
<g class="leg-a">${sprite(legs(LEGS_STRIDE), 0, body.length)}</g>
<g class="leg-b">${sprite(legs(LEGS_PASS), 0, body.length)}</g>
</g>
</g></g>`
}

const CHECK_BUBBLE = `<g transform="translate(2 -26)">
${rect(0, 0, 9, 7, '#0b0e10', ' stroke="#2fd3c4" stroke-width="1"')}
${rect(0, 7, 2, 2, '#2fd3c4')}
${rect(2, 4, 1, 1, '#7fe0d6')}${rect(3, 5, 1, 1, '#7fe0d6')}${rect(4, 4, 1, 1, '#7fe0d6')}${rect(5, 3, 1, 1, '#7fe0d6')}${rect(6, 2, 1, 1, '#7fe0d6')}
</g>`

function crewMember(): string {
  return `<g transform="translate(0 93)"><g class="walkx">
${rect(-4, 0, 9, 1, '#2fd3c4', ' opacity="0.25"')}
${figure(CREW_BODY, 'd', 'crew')}
<g class="bubble">${CHECK_BUBBLE}</g>
</g></g>`
}

function driver(): string {
  return `<g transform="translate(0 131)"><g class="drivex">
${rect(-4, 0, 9, 1, '#000000', ' opacity="0.35"')}
${figure(DRIVER_BODY, 't', 'drv')}
</g></g>`
}

// Pit wall engineers, seen from behind: facing the screens, or turned to look around.
const HEAD_BACK = [
  '....kkkk....',
  '...khhhhk...',
  '..khhhhhhk..',
  '.cchhhhhhcc.',
  '.cchhhhhhcc.',
  '...hhhhhh...',
  '....ssss....',
]
const HEAD_TURNED = [
  '...kkkkk....',
  '..hhhhhhk...',
  '.ssshhhhhk..',
  '.sesshhcch..',
  '.ssssshcch..',
  'kksssshhh...',
  '....ssss....',
]
const SEATED = [
  '.tttttttttt.',
  'tttttttttttt',
  'ttwttttttwtt',
  'tttttttttttt',
  'tttttttttttt',
  'mmmmmmmmmmmm',
  'mmmmmmmmmmmm',
  'mmmmmmmmmmmm',
  '.....mm.....',
  '.....mm.....',
  '.....mm.....',
  '..mmmmmmmm..',
  '.b...bb...b.',
]

// The far-right engineer swings his chair right round to watch the garage.
const HEAD_FRONT = [
  '....kkkk....',
  '...khhhhk...',
  '..khhhhhhk..',
  '.cchessehcc.',
  '.cchsssshcc.',
  '...kkssss...',
  '....ssss....',
]
const SEATED_FRONT = [
  'm.tttttttt.m',
  'mttwttttwttm',
  'mttttttttttm',
  'mttttwwttttm',
  'mssttttttssm',
  'mmddddddddmm',
  'mmddddddddmm',
  '..dd....dd..',
  '..dd....dd..',
  '..dd.mm.dd..',
  '.bbb.mm.bbb.',
  '..mmmmmmmm..',
  '.b...bb...b.',
]

function swivelEngineer(x: number, y: number, hair: string): string {
  const head = (rows: readonly string[]) => recolor(rows, 'h', hair)
  const body = y + HEAD_BACK.length
  return `<g>
${rect(x + 1, body + SEATED.length, 10, 1, '#000000', ' opacity="0.35"')}
<g class="sw-back">${sprite(head(HEAD_BACK), x, y)}${sprite(SEATED, x, body)}</g>
<g class="sw-left">${sprite(head(HEAD_TURNED), x, y)}${sprite(SEATED, x, body)}</g>
<g class="sw-front">${sprite(head(HEAD_FRONT), x, y)}${sprite(SEATED_FRONT, x, body)}</g>
<g class="sw-right">${sprite(head(mirror(HEAD_TURNED)), x, y)}${sprite(SEATED, x, body)}</g>
</g>`
}

function engineer(x: number, y: number, cls: string, faceRight: boolean, hair: string): string {
  const back = recolor(HEAD_BACK, 'h', hair)
  const turned = recolor(faceRight ? mirror(HEAD_TURNED) : HEAD_TURNED, 'h', hair)
  return `<g>
${rect(x + 1, y + HEAD_BACK.length + SEATED.length, 10, 1, '#000000', ' opacity="0.35"')}
<g class="${cls}-back">${sprite(back, x, y)}</g>
<g class="${cls}-turn">${sprite(turned, x, y)}</g>
${sprite(SEATED, x, y + HEAD_BACK.length)}
</g>`
}

// ---- Screens ------------------------------------------------------------------

// Deterministic data so the traces look like telemetry, not sine waves.
function data(seed: number, n: number, lo: number, hi: number): number[] {
  let s = seed
  let v = (lo + hi) / 2
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280
    v += Math.round(((s / 233280) - 0.5) * 4)
    v = Math.max(lo, Math.min(hi, v))
    out.push(v)
  }
  return out
}

// A wall screen: a pixel trace that scrolls one pixel at a time.
function wallScreen(x: number, y: number, w: number, h: number, seed: number, color: string, dur: number, racing: boolean): string {
  const ys = data(seed, w, 2, h - 4)
  const trace = (dx: number) => ys.map((v, i) => rect(dx + i, v, 1, 1, color)).join('')
  return `<g transform="translate(${x} ${y})">
${rect(-1, -1, w + 2, h + 2, '#2a3337')}
${rect(0, 0, w, h, '#061012')}
${rect(0, Math.floor(h / 2), w, 1, '#0f2624')}
${racing
  ? `<svg x="0" y="0" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" overflow="hidden">
<g class="scroll" style="animation-duration:${Math.round(dur / 4)}s;animation-timing-function:steps(${w})">${trace(0)}${trace(w)}</g>
</svg>`
  : `${rect(0, Math.floor(h / 2) + 3, w, 1, color, ' opacity="0.45"')}<g class="nodata">${pixelText('NO DATA', Math.max(0, Math.floor((w - textWidth('NO DATA')) / 2)), 3, '#56646a')}</g>`}
${rect(1, h - 2, Math.floor(w * 0.35), 1, color)}
${rect(Math.floor(w * 0.35) + 2, h - 2, Math.floor(w * 0.2), 1, '#c9a227')}
</g>`
}

// An onboard helmet-cam feed: the track rushing towards the cockpit.
// The sky, grass and asphalt are drawn once; only the kerbs and centre line move,
// in four frames that cycle, so the screen stays cheap and calm to look at.
function helmetCam(x: number, y: number, w: number, h: number, bend: number, carAhead: boolean, racing: boolean): string {
  const frameRect = `${rect(-1, -1, w + 2, h + 2, '#2a3337')}${rect(0, 0, w, h, '#061012')}`
  if (!racing) {
    const label = 'NO FEED'
    return `<g transform="translate(${x} ${y})">${frameRect}
${rect(0, Math.floor(h / 2) + 3, w, 1, '#56646a', ' opacity="0.45"')}
<g class="nodata">${pixelText(label, Math.max(0, Math.floor((w - textWidth(label)) / 2)), 3, '#56646a')}</g>
</g>`
  }
  const hy = 6
  const rows: { r: number; left: number; right: number; kerb: number; centre: number }[] = []
  for (let r = hy + 1; r < h; r++) {
    const t = (r - hy) / (h - 1 - hy)
    const half = 1 + t * 14
    const centre = w / 2 + bend * (1 - t) * (1 - t) * 8
    rows.push({ r, left: Math.round(centre - half), right: Math.round(centre + half), kerb: 1 + Math.floor(t * 2), centre: Math.round(centre) })
  }
  const still: string[] = [
    rect(0, 0, w, hy, '#16324a'),
    rect(0, hy - 1, w, 1, '#1e4560'),
    rect(0, hy, w, h - hy, '#1f4a2c'),
    rect(0, hy, w, 1, '#173822'),
  ]
  for (const row of rows) {
    const l = Math.max(0, row.left)
    const rr = Math.min(w, row.right)
    if (rr > l) still.push(rect(l, row.r, rr - l, 1, '#3a4045'))
  }
  const frames: string[] = []
  for (let f = 0; f < 4; f++) {
    const out: string[] = []
    for (const row of rows) {
      const colour = (row.r + 4 - f) % 4 < 2 ? '#d64a3a' : '#e8ecee'
      const lk = Math.max(0, row.left)
      const rk = Math.min(w - row.kerb, row.right - row.kerb)
      if (row.left + row.kerb > 0) out.push(rect(lk, row.r, Math.min(row.kerb, row.left + row.kerb - lk), 1, colour))
      if (rk >= 0 && rk < w) out.push(rect(rk, row.r, Math.min(row.kerb, w - rk), 1, colour))
      if ((row.r + 4 - f) % 4 === 0) out.push(rect(row.centre, row.r, 1, 1, '#c9d4d8'))
    }
    if (carAhead) {
      const cy = f < 2 ? 9 : 10
      const cx = Math.round(w / 2 + bend * 0.45 * 8) - 3
      out.push(rect(cx, cy - 1, 6, 1, '#0e1113'), rect(cx + 1, cy, 4, 2, '#19b5a8'), rect(cx, cy + 1, 1, 1, '#0a0b0c'), rect(cx + 5, cy + 1, 1, 1, '#0a0b0c'))
      if (f % 2 === 0) out.push(rect(cx + 2, cy + 2, 2, 1, '#e0463c'))
    }
    frames.push(`<g class="cam cam${f}">${out.join('')}</g>`)
  }
  // Cockpit: halo bar and centre pillar, mirrors, steering wheel with shift lights.
  const cockpit = [
    rect(0, 0, w, 1, '#0b0d0e'),
    rect(Math.floor(w / 2) - 1, 0, 2, 4, '#0b0d0e'),
    rect(0, h - 5, 3, 2, '#111416'),
    rect(w - 3, h - 5, 3, 2, '#111416'),
    rect(Math.floor(w / 2) - 6, h - 3, 12, 3, '#111416'),
    rect(Math.floor(w / 2) - 4, h - 3, 2, 1, '#4fbf6a'),
    rect(Math.floor(w / 2) - 1, h - 3, 2, 1, '#e3a21a'),
    rect(Math.floor(w / 2) + 2, h - 3, 2, 1, '#e0463c'),
    rect(1, 1, 2, 1, '#e0463c'),
  ]
  return `<g transform="translate(${x} ${y})">${frameRect}
<svg x="0" y="0" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" overflow="hidden">
${still.join('')}
${frames.join('\n')}
${cockpit.join('')}
</svg>
</g>`
}

// A pit wall monitor: blocky bars, two frames that swap.
function barScreen(x: number, y: number, w: number, h: number, seed: number, color: string, racing: boolean): string {
  if (!racing) {
    const out = [rect(x - 1, y - 1, w + 2, h + 2, '#3a4448'), rect(x, y, w, h, '#061012')]
    for (let i = 1; i < w - 1; i += 3) out.push(rect(x + i, y + h - 2, 2, 1, color, ' opacity="0.5"'))
    return out.join('')
  }
  const frame = (s: number) => {
    const vals = data(s, w, 2, h - 3)
    const out: string[] = []
    for (let i = 1; i < w - 1; i += 3) {
      const bh = h - 1 - vals[i]!
      out.push(rect(x + i, y + h - 1 - bh, 2, bh, color))
    }
    return out.join('')
  }
  return `${rect(x - 1, y - 1, w + 2, h + 2, '#3a4448')}${rect(x, y, w, h, '#061012')}
<g class="bars-a">${frame(seed)}</g><g class="bars-b">${frame(seed + 11)}</g>`
}

// The timing tower on the right wall: positions and gap bars, two frames.
function timingTower(x: number, y: number, racing: boolean): string {
  const rowColors = ['#19b5a8', '#d64a3a', '#c9a227', '#19b5a8', '#8fa8c8', '#d64a3a']
  const frame = (order: number[], gaps: number[]) =>
    order.map((c, i) => `${rect(x + 3, y + 4 + i * 5, 3, 3, '#c9d4d8')}${rect(x + 8, y + 4 + i * 5, 3, 3, rowColors[c]!)}${rect(x + 13, y + 5 + i * 5, gaps[i]!, 1, '#4b5a60')}`).join('')
  return `${rect(x - 1, y - 1, 52, 35, '#2a3337')}${rect(x, y, 50, 33, '#061012')}
${rect(x, y, 50, 2, '#19b5a8')}
${racing
  ? `<g class="tw tw0">${frame([0, 1, 2, 3, 4, 5], [4, 10, 15, 21, 26, 32])}</g>
<g class="tw tw1">${frame([1, 0, 2, 4, 3, 5], [3, 9, 16, 20, 27, 33])}</g>
<g class="tw tw2">${frame([1, 2, 0, 4, 5, 3], [2, 6, 14, 22, 25, 34])}</g>
<g class="tw tw3">${frame([0, 2, 1, 5, 4, 3], [1, 5, 12, 19, 28, 31])}</g>`
  : frame([0, 1, 2, 3, 4, 5], [4, 10, 15, 21, 26, 32])}`
}

// ---- Garage props -------------------------------------------------------------

function tyreStack(x: number, baseY: number, band: string, count: number): string {
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    const y = baseY - (i + 1) * 7
    out.push(rect(x + 1, y, 18, 7, '#0d0f10'))
    out.push(rect(x, y + 1, 20, 5, '#0d0f10'))
    out.push(rect(x + 1, y + 3, 18, 1, band))
    out.push(rect(x + 2, y, 16, 1, '#22272a'))
  }
  out.push(rect(x + 6, baseY - count * 7, 8, 1, '#050607'))
  return out.join('')
}

function toolCart(x: number, y: number): string {
  const out = [rect(x, y, 18, 24, '#1f2528'), rect(x, y, 18, 2, '#19b5a8')]
  for (let i = 0; i < 4; i++) {
    out.push(rect(x + 1, y + 3 + i * 5, 16, 4, '#2e363a'))
    out.push(rect(x + 7, y + 4 + i * 5, 4, 1, '#9aa5aa'))
  }
  out.push(rect(x + 1, y + 24, 2, 2, '#0a0b0c'), rect(x + 15, y + 24, 2, 2, '#0a0b0c'))
  return out.join('')
}

const PIT_X = 159
const PIT_W = 46
const PIT_Y = 72
const PIT_H = 14

// One digit that counts by itself: the digits 0 to 9 stacked in a 3 x 5 window,
// stepped upwards once every tenth of its period, started `elapsed` seconds in.
function odometer(x: number, y: number, periodS: number, elapsedS: number, color: string): string {
  const digits = '0123456789'.split('').map((d, i) => pixelText(d, 0, i * 5, color)).join('')
  return `<svg x="${x}" y="${y}" width="3" height="5" viewBox="0 0 3 5" overflow="hidden">
<g class="odo" style="animation-duration:${periodS}s;animation-delay:-${(elapsedS % periodS).toFixed(2)}s">${digits}</g>
</svg>`
}

/** What the pit stop board shows: a stop in progress, or a finished one and its time. */
export type PitStopView = { tool: string; startedAt: number; ms?: number; colour?: string }

// The board over the wide middle pit wall screen.
export function pitStopBoard(stop: PitStopView, nowMs: number): string {
  const out = [rect(PIT_X - 1, PIT_Y - 1, PIT_W + 2, PIT_H + 2, '#e3a21a'), rect(PIT_X, PIT_Y, PIT_W, PIT_H, '#061012')]
  const centre = (text: string) => PIT_X + Math.max(0, Math.floor((PIT_W - textWidth(text)) / 2))
  if (stop.ms === undefined) {
    const elapsed = Math.max(0, (nowMs - stop.startedAt) / 1000)
    out.push(pixelText('PIT STOP', centre('PIT STOP'), PIT_Y + 2, '#e7b63a'))
    const x = PIT_X + Math.floor((PIT_W - 19) / 2)
    const y = PIT_Y + 8
    out.push(odometer(x, y, 100, elapsed, '#eef2f3'))
    out.push(odometer(x + 4, y, 10, elapsed, '#eef2f3'))
    out.push(pixelText('.', x + 8, y, '#eef2f3'))
    out.push(odometer(x + 12, y, 1, elapsed, '#eef2f3'))
    out.push(pixelText('S', x + 16, y, '#eef2f3'))
  } else {
    let name = stop.tool.toUpperCase().replace(/[^A-Z0-9 .!]/g, ' ').trim() || 'TOOL'
    while (textWidth(name) > PIT_W - 2) name = name.slice(0, -1)
    const time = `${Math.min(stop.ms / 1000, 999.9).toFixed(1)}S`
    out.push(pixelText(name, centre(name), PIT_Y + 2, '#c9d4d8'))
    out.push(pixelText(time, centre(time), PIT_Y + 8, stop.colour ?? '#e7b63a'))
  }
  // The crew goes quiet on the radio while a stop is on the board.
  return `<style>.radio { visibility: hidden; }</style><g>${out.join('')}</g>`
}

function pitWall(racing: boolean): string {
  const out: string[] = []
  // Awning and posts.
  out.push(rect(124, 60, 116, 4, '#19b5a8'))
  out.push(rect(124, 64, 116, 1, '#c9d4d8'))
  out.push(rect(124, 65, 116, 2, '#0f6e67'))
  out.push(rect(127, 67, 2, 52, '#3a4448'), rect(235, 67, 2, 52, '#3a4448'))
  // Monitors on arms.
  // The wide middle screen doubles as the pit stop board.
  const screens: [number, number, string][] = [[134, 21, '#2fd3c4'], [PIT_X, PIT_W, '#e7b63a'], [209, 21, '#2fd3c4']]
  screens.forEach(([x, w, color], i) => {
    out.push(barScreen(x, 72, w, 14, i * 7 + 3, color, racing))
    out.push(rect(x + Math.floor(w / 2) - 1, 87, 3, 5, '#2a3135'))
  })
  // Desk.
  out.push(rect(126, 92, 112, 2, '#9aa5aa'))
  out.push(rect(126, 94, 112, 3, '#2a3135'))
  out.push(rect(126, 97, 112, 18, '#14181a'))
  out.push(rect(126, 97, 112, 1, '#19b5a8'))
  out.push(rect(126, 115, 112, 2, '#0a0b0c'))
  // Engineers.
  out.push(engineer(140, 90, 'eng1', false, 'h'))
  out.push(engineer(172, 90, 'eng2', true, 'y'))
  out.push(racing ? engineer(204, 90, 'eng3', false, 'n') : swivelEngineer(204, 90, 'n'))
  out.push(radio(racing ? RADIO_RACE : RADIO, racing ? 3 : RADIO_SLOT))
  if (racing) out.push(`<g class="live">${rect(224, 60, 9, 3, '#ff4b3e')}</g>`)
  out.push('__PITSTOP__')
  return out.join('\n')
}

// ---- Team radio: a 3x5 pixel font and speech bubbles over the engineers --------

const FONT: Record<string, string[]> = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'], D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'], K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'], M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  N: ['#..#', '##.#', '#.##', '#..#', '#..#'], O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
  P: ['##.', '#.#', '##.', '#..', '#..'], R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'], V: ['#.#', '#.#', '#.#', '#.#', '.#.'], W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'],
  X: ['#.#', '#.#', '.#.', '#.#', '#.#'], Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  '0': ['###', '#.#', '#.#', '#.#', '###'], '1': ['.#.', '##.', '.#.', '.#.', '###'],
  '2': ['##.', '..#', '.#.', '#..', '###'], '3': ['##.', '..#', '.#.', '..#', '##.'],
  '4': ['#.#', '#.#', '###', '..#', '..#'], '8': ['###', '#.#', '###', '#.#', '###'],
  '5': ['###', '#..', '##.', '..#', '##.'], '6': ['.##', '#..', '###', '#.#', '###'],
  '7': ['###', '..#', '.#.', '.#.', '.#.'], '9': ['###', '#.#', '###', '..#', '##.'],
  '.': ['...', '...', '...', '...', '.#.'], '!': ['.#.', '.#.', '.#.', '...', '.#.'],
  ' ': ['...', '...', '...', '...', '...'],
}

function pixelText(text: string, x: number, y: number, color: string): string {
  // Lay the glyphs out as five rows of '#' and '.', then draw each run of '#' as one rect.
  const rows = ['', '', '', '', '']
  for (const ch of text) {
    const glyph = FONT[ch] ?? FONT[' ']!
    glyph.forEach((row, gy) => {
      rows[gy] += row + '.'
    })
  }
  const out: string[] = []
  rows.forEach((row, gy) => {
    let gx = 0
    while (gx < row.length) {
      if (row[gx] !== '#') {
        gx++
        continue
      }
      let end = gx + 1
      while (row[end] === '#') end++
      out.push(rect(x + gx, y + gy, end - gx, 1, color))
      gx = end
    }
  })
  return out.join('')
}

// Width of a line of pixel text, in grid pixels.
function textWidth(text: string): number {
  let w = 0
  for (const ch of text) w += (FONT[ch] ?? FONT[' ']!)[0]!.length + 1
  return w - 1
}

// Who says what, in order. One message every 5 seconds, each up for about 3.5.
// Between turns it's practice: relaxed setup and data chatter.
const RADIO: [number, string, string][] = [
  [0, 'RADIO CHECK', '#eef2f3'],
  [1, 'LOUD AND CLEAR', '#2fd3c4'],
  [2, 'INSTALL LAP NEXT', '#eef2f3'],
  [0, 'MORE FRONT WING', '#e7b63a'],
  [1, 'TYRE TEMPS OK', '#2fd3c4'],
  [2, 'BRAKE BIAS UP ONE', '#eef2f3'],
  [0, 'LONG RUN AFTER THIS', '#eef2f3'],
  [1, 'COPY', '#2fd3c4'],
  [2, 'CHECK THE DATA', '#e7b63a'],
  [0, 'OUT IN 5 MIN', '#eef2f3'],
  [1, 'TRACK IS DRY', '#2fd3c4'],
  [2, 'GOOD SESSION', '#e7b63a'],
]
const RADIO_SLOT = 5
// While Claude works: quicker, busier calls.
const RADIO_RACE: [number, string, string][] = [
  [1, 'PUSH PUSH', '#e7b63a'],
  [0, 'SECTOR 1 GREEN', '#4fbf6a'],
  [2, 'PURPLE S2!', '#b07be0'],
  [0, 'GAP 0.4', '#2fd3c4'],
  [1, 'DRS ENABLED', '#2fd3c4'],
  [2, 'KEEP PUSHING', '#eef2f3'],
  [0, 'OVERTAKE MODE', '#e7b63a'],
  [1, 'HOLD POSITION', '#eef2f3'],
  [2, 'TYRES LOOK GOOD', '#4fbf6a'],
  [0, 'FASTEST LAP', '#b07be0'],
]
const ENGINEER_X = [140, 172, 204]

function radio(list: [number, string, string][], slot: number): string {
  return list.map(([who, text, color], i) => {
    const cx = ENGINEER_X[who]! + 6
    const w = textWidth(text) + 4
    const x = Math.max(2, Math.min(W - w - 2, cx - Math.floor(w / 2)))
    const y = 78
    return `<g class="radio" style="animation-delay:${i * slot - list.length * slot}s;animation-duration:${list.length * slot}s">
${rect(x - 1, y - 1, w + 2, 11, '#19b5a8')}
${rect(x, y, w, 9, '#061012')}
${rect(cx - 1, y + 10, 3, 1, '#19b5a8')}${rect(cx, y + 11, 1, 1, '#19b5a8')}
${pixelText(text, x + 2, y + 2, color)}
</g>`
  }).join('\n')
}

// ---- The scene ----------------------------------------------------------------

function wall(): string {
  const out = [rect(0, 8, W, 70, '#141a1d')]
  for (let x = 24; x < W; x += 24) out.push(rect(x, 8, 1, 70, '#1a2125'))
  out.push(rect(0, 68, W, 2, '#19b5a8'), rect(0, 71, W, 1, '#56646a'))
  out.push(rect(0, 77, W, 1, '#2a3337'))
  return out.join('')
}

function floor(): string {
  const out = [rect(0, 78, W, H - 78, '#1b2124')]
  for (const y of [84, 93, 105, 120]) out.push(rect(0, y, W, 1, '#20282b'))
  for (let x = 12; x < W; x += 30) out.push(rect(x, 78, 1, H - 78, '#1e2528'))
  out.push(rect(0, 132, W, 1, '#c9a227'))
  return out.join('')
}

function ceiling(): string {
  const out = [rect(0, 0, W, 8, '#0b0e10')]
  for (const x of [16, 76, 136, 196]) out.push(`<rect class="lamp" x="${x}" y="3" width="28" height="2" fill="#e9f6f5"/>`)
  return out.join('')
}

const CAR = [
  'qqq.......................',
  'qqq........kk.............',
  '.q......wwwkkww...........',
  '.qqqqqqqqqqqqqqqqqqqqqwwww',
  '..bbb.qqqqqqqqqqqq..bbb..w',
  '.bbwbb.............bbwbb..',
  '..bbb...............bbb...',
]

function buildScene(racing: boolean, launch = false): string {
  const radioList = racing ? RADIO_RACE : RADIO
  const radioShown = (70 / radioList.length).toFixed(2)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges" style="--t: __CLOCK__s">
<style>
.scroll { animation-name: scroll; animation-iteration-count: infinite; }
@keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-30px); } }
.lamp { opacity: 0.9; animation: lamp 9s steps(3) infinite alternate; }
@keyframes lamp { from { opacity: 0.9; } to { opacity: 0.7; } }
.leg-a { opacity: 1; animation: legA 0.8s linear infinite; }
@keyframes legA { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }
.leg-b { opacity: 0; animation: legB 0.8s linear infinite; }
@keyframes legB { 0%, 50% { opacity: 0; } 50.01%, 100% { opacity: 1; } }
.walkx { transform: translateX(46px); animation: walkx 48s steps(240) infinite; }
@keyframes walkx { 0%, 14% { transform: translateX(46px); } 47%, 61% { transform: translateX(122px); } 94%, 100% { transform: translateX(46px); } }
.crew-face { transform: scaleX(1); animation: crewface 48s linear infinite; }
@keyframes crewface { 0%, 13% { transform: scaleX(-1); } 13.01%, 60% { transform: scaleX(1); } 60.01%, 100% { transform: scaleX(-1); } }
.crew-stand { opacity: 1; animation: crewstand 48s linear infinite; }
@keyframes crewstand { 0%, 14% { opacity: 1; } 14.01%, 47% { opacity: 0; } 47.01%, 61% { opacity: 1; } 61.01%, 94% { opacity: 0; } 94.01%, 100% { opacity: 1; } }
.crew-walk { opacity: 0; animation: crewwalk 48s linear infinite; }
@keyframes crewwalk { 0%, 14% { opacity: 0; } 14.01%, 47% { opacity: 1; } 47.01%, 61% { opacity: 0; } 61.01%, 94% { opacity: 1; } 94.01%, 100% { opacity: 0; } }
.bubble { opacity: 0; animation: bubble 48s linear infinite; }
@keyframes bubble { 0%, 3% { opacity: 0; } 3.01%, 12% { opacity: 1; } 12.01%, 50% { opacity: 0; } 50.01%, 59% { opacity: 1; } 59.01%, 100% { opacity: 0; } }
.drivex { transform: translateX(-16px); animation: drivex 45s steps(270) infinite; }
@keyframes drivex { 0%, 60% { transform: translateX(-16px); } 90%, 100% { transform: translateX(256px); } }
.drv-stand { opacity: 0; }
.drv-walk { opacity: 1; }
.eng1-back, .eng2-back, .eng3-back { opacity: 1; }
.eng1-turn, .eng2-turn, .eng3-turn { opacity: 0; }
.eng1-back { animation: e1back 13s linear infinite; } .eng1-turn { animation: e1turn 13s linear infinite; }
@keyframes e1back { 0%, 70% { opacity: 1; } 70.01%, 84% { opacity: 0; } 84.01%, 100% { opacity: 1; } }
@keyframes e1turn { 0%, 70% { opacity: 0; } 70.01%, 84% { opacity: 1; } 84.01%, 100% { opacity: 0; } }
.eng2-back { animation: e2back 17s linear infinite; } .eng2-turn { animation: e2turn 17s linear infinite; }
@keyframes e2back { 0%, 28% { opacity: 1; } 28.01%, 38% { opacity: 0; } 38.01%, 100% { opacity: 1; } }
@keyframes e2turn { 0%, 28% { opacity: 0; } 28.01%, 38% { opacity: 1; } 38.01%, 100% { opacity: 0; } }
.eng3-back { animation: e3back 21s linear infinite; } .eng3-turn { animation: e3turn 21s linear infinite; }
.sw-back { opacity: 1; animation: swback 26s linear infinite; }
.sw-left { opacity: 0; animation: swleft 26s linear infinite; }
.sw-front { opacity: 0; animation: swfront 26s linear infinite; }
.sw-right { opacity: 0; animation: swright 26s linear infinite; }
@keyframes swback { 0%, 30% { opacity: 1; } 30.01%, 78% { opacity: 0; } 78.01%, 100% { opacity: 1; } }
@keyframes swleft { 0%, 30% { opacity: 0; } 30.01%, 33% { opacity: 1; } 33.01%, 100% { opacity: 0; } }
@keyframes swfront { 0%, 33% { opacity: 0; } 33.01%, 75% { opacity: 1; } 75.01%, 100% { opacity: 0; } }
@keyframes swright { 0%, 75% { opacity: 0; } 75.01%, 78% { opacity: 1; } 78.01%, 100% { opacity: 0; } }
@keyframes e3back { 0%, 52% { opacity: 1; } 52.01%, 61% { opacity: 0; } 61.01%, 100% { opacity: 1; } }
@keyframes e3turn { 0%, 52% { opacity: 0; } 52.01%, 61% { opacity: 1; } 61.01%, 100% { opacity: 0; } }
.bars-a { opacity: 1; animation: barsA 6s linear infinite; }
.bars-b { opacity: 0; animation: barsB 6s linear infinite; }
@keyframes barsA { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }
@keyframes barsB { 0%, 50% { opacity: 0; } 50.01%, 100% { opacity: 1; } }
.tower-a { opacity: 1; animation: barsA 10s linear infinite; }
.tower-b { opacity: 0; animation: barsB 10s linear infinite; }
.radio { opacity: 0; animation: radio 60s linear infinite; }
@keyframes radio { 0%, ${radioShown}% { opacity: 1; } ${(Number(radioShown) + 0.01).toFixed(2)}%, 100% { opacity: 0; } }
.cam { opacity: 0; animation: tw 1.2s linear infinite; }
.cam0 { opacity: 1; } .cam1 { animation-delay: -0.9s; } .cam2 { animation-delay: -0.6s; } .cam3 { animation-delay: -0.3s; }
.odo { animation-name: odo; animation-timing-function: steps(10); animation-iteration-count: infinite; }
@keyframes odo { from { transform: translateY(0); } to { transform: translateY(-50px); } }
.nodata { opacity: 1; animation: nodata 4s steps(2) infinite alternate; }
@keyframes nodata { from { opacity: 1; } to { opacity: 0.35; } }
.tw { opacity: 0; animation: tw 6s linear infinite; }
.tw0 { opacity: 1; } .tw1 { animation-delay: -4.5s; } .tw2 { animation-delay: -3s; } .tw3 { animation-delay: -1.5s; }
@keyframes tw { 0%, 25% { opacity: 1; } 25.01%, 100% { opacity: 0; } }
.live { opacity: 1; animation: live 2s steps(2) infinite alternate; }
@keyframes live { from { opacity: 1; } to { opacity: 0.4; } }
.launch { transform: translateX(-100px); animation: launch 1.4s steps(70) 1 forwards; }
@keyframes launch { 0% { transform: translateX(-100px); } 100% { transform: translateX(330px); } }

.lamp, .leg-a, .leg-b, .walkx, .crew-face, .crew-stand, .crew-walk, .bubble, .drivex,
.eng1-back, .eng1-turn, .eng2-back, .eng2-turn, .eng3-back, .eng3-turn,
.sw-back, .sw-left, .sw-front, .sw-right { animation-delay: calc(var(--t) * -1); }
</style>
<!-- ceiling and back wall -->
${ceiling()}
${wall()}
<!-- screen banks on the back wall -->
${helmetCam(16, 16, 30, 18, 1, false, racing)}
${wallScreen(50, 16, 30, 18, 19, '#c9d4d8', 26, racing)}
${helmetCam(16, 39, 30, 18, -1, true, racing)}
${wallScreen(50, 39, 30, 18, 43, '#2fd3c4', 30, racing)}
${wallScreen(94, 16, 30, 18, 57, '#2fd3c4', 24, racing)}
${wallScreen(128, 16, 30, 18, 61, '#e7b63a', 28, racing)}
${timingTower(176, 16, racing)}
<!-- floor -->
${floor()}
<!-- crew member checking the screens -->
${crewMember()}
<!-- props on the left -->
${tyreStack(4, 124, '#d64a3a', 5)}
${tyreStack(26, 124, '#c9a227', 4)}
${toolCart(50, 98)}
<!-- the pit wall -->
${pitWall(racing)}
<!-- the driver, now and then -->
${launch ? `<!-- lights out: the launch -->
<g transform="translate(0 99)"><g class="launch">
${rect(-70, 9, 60, 1, '#e9f6f5', ' opacity="0.5"')}${rect(-50, 14, 44, 1, '#2fd3c4', ' opacity="0.6"')}${rect(-90, 18, 70, 1, '#e9f6f5', ' opacity="0.35"')}
<g transform="scale(3)">${sprite(CAR)}</g>
</g></g>` : ''}
${racing ? '' : driver()}
</svg>`
}

// The crew's loops run off the clock, not from when the scene was drawn, so the
// walker and the pit wall keep their place when the garage switches modes.
export function atTime(scene: string, nowMs: number, board = ''): string {
  return scene.replace('__CLOCK__', ((nowMs / 1000) % 100000).toFixed(2)).replace('__PITSTOP__', board)
}

export const GARAGE_IDLE = buildScene(false)
export const GARAGE_RACE = buildScene(true)
export const GARAGE_LAUNCH = buildScene(true, true)
