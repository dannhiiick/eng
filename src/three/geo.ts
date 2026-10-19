import * as THREE from 'three'

type LonLat = [number, number]

// Coarse, hand-drawn continent outlines (lon, lat). Rendered as a dotted globe,
// so low precision still reads clearly.
const LAND: LonLat[][] = [
  // North America
  [
    [-168, 66], [-162, 70], [-140, 70], [-125, 70], [-95, 72], [-80, 73], [-65, 60], [-55, 52],
    [-66, 45], [-70, 42], [-76, 35], [-81, 31], [-80, 25], [-82, 28], [-85, 30], [-90, 29],
    [-97, 27], [-97, 21], [-92, 18], [-87, 21], [-88, 16], [-84, 11], [-79, 9], [-77, 8],
    [-80, 7], [-85, 10], [-87, 13], [-92, 14], [-96, 16], [-105, 20], [-110, 24], [-112, 30],
    [-117, 32], [-124, 40], [-124, 48], [-130, 55], [-140, 60], [-152, 59], [-158, 56], [-165, 60],
  ],
  // Canadian Arctic
  [[-120, 72], [-80, 72], [-75, 80], [-95, 82], [-120, 77]],
  // Greenland
  [[-55, 60], [-43, 60], [-20, 70], [-18, 77], [-30, 83], [-60, 82], [-72, 78], [-58, 75], [-52, 68]],
  // South America
  [
    [-77, 8], [-72, 12], [-62, 11], [-52, 5], [-50, 0], [-35, -5], [-35, -9], [-39, -15],
    [-41, -22], [-48, -26], [-53, -34], [-58, -38], [-65, -41], [-65, -47], [-69, -52], [-72, -54],
    [-75, -50], [-73, -40], [-71, -30], [-70, -18], [-76, -14], [-81, -5], [-80, 0], [-78, 3],
  ],
  // Europe
  [
    [-10, 36], [-9, 43], [-2, 43], [-4, 48], [2, 51], [5, 53], [8, 57], [10, 54], [14, 54],
    [20, 55], [22, 60], [25, 65], [21, 69], [28, 71], [40, 68], [45, 68], [60, 69], [60, 55],
    [50, 45], [40, 47], [36, 45], [29, 41], [26, 40], [23, 37], [20, 40], [16, 38], [12, 44],
    [8, 44], [3, 43], [-1, 37],
  ],
  // Scandinavia
  [[5, 58], [5, 62], [14, 67], [20, 70], [28, 71], [30, 66], [22, 60], [18, 59], [12, 56]],
  // Asia
  [
    [26, 40], [36, 36], [35, 32], [35, 28], [39, 21], [43, 13], [52, 16], [57, 22], [60, 25],
    [67, 25], [72, 21], [77, 8], [80, 13], [80, 16], [88, 22], [92, 21], [98, 16], [98, 8],
    [103, 1], [104, 10], [109, 12], [106, 20], [110, 21], [117, 24], [122, 30], [121, 37],
    [118, 39], [122, 40], [127, 38], [129, 35], [130, 43], [135, 44], [141, 52], [136, 54],
    [142, 59], [155, 59], [163, 61], [170, 60], [180, 65], [180, 70], [160, 71], [140, 73],
    [110, 77], [100, 79], [80, 73], [70, 73], [60, 69], [60, 55], [50, 45], [45, 42], [40, 41], [36, 41],
  ],
  // Africa
  [
    [-17, 21], [-16, 28], [-10, 30], [-6, 36], [10, 37], [11, 33], [20, 31], [25, 32], [32, 31],
    [33, 28], [36, 22], [39, 16], [43, 12], [51, 12], [51, 10], [44, -2], [40, -5], [40, -15],
    [35, -24], [32, -29], [27, -34], [20, -35], [17, -29], [12, -17], [13, -12], [12, -5],
    [9, 0], [9, 4], [5, 6], [-4, 5], [-8, 4], [-13, 8], [-17, 14],
  ],
  [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]], // Madagascar
  [
    [114, -22], [114, -34], [118, -35], [124, -33], [131, -31], [138, -35], [141, -38], [147, -38],
    [150, -37], [153, -28], [153, -25], [146, -19], [142, -11], [136, -12], [136, -15], [130, -12],
    [126, -14], [122, -18],
  ], // Australia
  [[95, 5], [98, 4], [106, -6], [102, -5]], // Sumatra
  [[109, 1], [113, -3], [116, -4], [119, 1], [117, 7], [113, 3]], // Borneo
  [[131, -1], [141, -3], [150, -10], [143, -9], [137, -5]], // New Guinea
  [[130, 31], [135, 34], [140, 35], [142, 40], [141, 45], [140, 41], [136, 37], [131, 34]], // Japan
  [[-5, 50], [1, 51], [1, 53], [-3, 56], [-5, 58], [-6, 55], [-3, 54], [-5, 52]], // Great Britain
  [[-10, 52], [-6, 52], [-6, 55], [-8, 55]], // Ireland
  [[-24, 64], [-14, 64], [-14, 66], [-22, 66]], // Iceland
  [[167, -46], [174, -41], [178, -38], [173, -35], [172, -41]], // New Zealand
  [[-180, -68], [180, -68], [180, -90], [-180, -90]], // Antarctica
]

const WATER: LonLat[][] = [
  [[-95, 60], [-88, 56], [-80, 52], [-78, 58], [-82, 63], [-92, 64]], // Hudson Bay
  [[28, 41], [28, 46], [34, 46], [41, 42], [36, 41]], // Black Sea
  [[47, 37], [50, 37], [54, 40], [52, 45], [48, 46], [47, 42]], // Caspian Sea
]

export function latLonToVec3(lat: number, lon: number, r = 1) {
  const phi = THREE.MathUtils.degToRad(90 - lat)
  const theta = THREE.MathUtils.degToRad(lon + 180)
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  )
}

function buildMask() {
  const w = 720
  const h = 360
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, w, h)
  const draw = (polys: LonLat[][], color: string) => {
    ctx.fillStyle = color
    for (const poly of polys) {
      ctx.beginPath()
      poly.forEach(([lon, lat], i) => {
        const x = ((lon + 180) / 360) * w
        const y = ((90 - lat) / 180) * h
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()
      ctx.fill()
    }
  }
  draw(LAND, '#fff')
  draw(WATER, '#000')
  const data = ctx.getImageData(0, 0, w, h).data
  return (lat: number, lon: number) => {
    const x = Math.min(w - 1, Math.max(0, Math.floor(((lon + 180) / 360) * w)))
    const y = Math.min(h - 1, Math.max(0, Math.floor(((90 - lat) / 180) * h)))
    return data[(y * w + x) * 4] > 128
  }
}

/** Evenly spaced points on a unit sphere that fall on land. */
export function buildLandDots(count = 16000) {
  const isLand = buildMask()
  const points: THREE.Vector3[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const radius = Math.sqrt(1 - y * y)
    const a = golden * i
    const p = new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius)
    const lat = 90 - THREE.MathUtils.radToDeg(Math.acos(p.y))
    // Inverse of latLonToVec3
    let lon = THREE.MathUtils.radToDeg(Math.atan2(p.z, -p.x)) - 180
    if (lon < -180) lon += 360
    if (isLand(lat, lon)) points.push(p)
  }
  return points
}
