import p5 from 'p5'

// 定数
const NUM_VERTICES = 4
const RADIUS = 600
const ADD_LINE_INTERVAL = 0.05 // 秒（1本追加の間隔）

interface Vertex { x: number, y: number }
interface Shape {
  vertices: Vertex[]
  edges: Array<[number, number]> // ローカルインデックス
}

let CENTER: Vertex = { x: 0, y: 0 }

// 現在描画されている全頂点・線
let currentVertices: Vertex[] = []
let currentEdges: Array<[number, number]> = []

// 次に追加すべき線のキュー
const pendingEdges: Array<[number, number]> = []

let lastAddTime = 0
let generation = 0

function getVertexOnCircle(center: Vertex, radius: number, angle: number): Vertex {
  return {
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle),
  }
}

function rotateVertex(v: Vertex, center: Vertex, angle: number): Vertex {
  const dx = v.x - center.x
  const dy = v.y - center.y
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)
  return {
    x: center.x + dx * cosA - dy * sinA,
    y: center.y + dx * sinA + dy * cosA,
  }
}

// 初期世代の形状
function createInitialShape(): Shape {
  const vertices: Vertex[] = []
  const edges: Array<[number, number]> = []

  for (let i = 0; i < NUM_VERTICES; i++) {
    const angle = (2 * Math.PI * i) / NUM_VERTICES
    vertices.push(getVertexOnCircle(CENTER, RADIUS, angle))
    edges.push([i, (i + 1) % NUM_VERTICES]) // 外周
  }
  for (let i = 0; i < NUM_VERTICES / 2; i++) {
    edges.push([i, i + NUM_VERTICES / 2]) // 対角線
  }

  return { vertices, edges }
}

// 新世代の新しい頂点と線を作成（まだ描画はしない）
function prepareNextGeneration(offsetAngle: number) {
  const rotatedVertices = currentVertices.map(v => rotateVertex(v, CENTER, offsetAngle))
  const vertexOffset = currentVertices.length

  // 新頂点を currentVertices に追加
  currentVertices.push(...rotatedVertices)

  // 新しい線リスト作成（旧辺コピー、新辺、旧↔新の全結合）
  const rotatedEdges = currentEdges.map(([a, b]) => [a + vertexOffset, b + vertexOffset] as [number, number])

  const crossEdges: Array<[number, number]> = []
  for (let oldIdx = 0; oldIdx < vertexOffset; oldIdx++) {
    for (let newIdx = 0; newIdx < rotatedVertices.length; newIdx++) {
      crossEdges.push([oldIdx, newIdx + vertexOffset])
    }
  }

  // キューに追加（描画は1本ずつ）
  pendingEdges.push(...rotatedEdges, ...crossEdges)
}

function sketch(p: p5) {
  p.setup = () => {
    const windowSize = Math.min(window.innerWidth, window.innerHeight)
    p.createCanvas(windowSize, windowSize)
    p.background(36)
    CENTER = { x: windowSize / 2, y: windowSize / 2 }
    lastAddTime = p.millis()
    generation = 1

    // 初期世代を作って即描画リストに追加
    const initialShape = createInitialShape()
    currentVertices = [...initialShape.vertices]
    currentEdges = [...initialShape.edges]
  }

  p.draw = () => {
    p.background(36)

    // 現在までの全線を描画
    p.stroke(255)
    currentEdges.forEach(([a, b]) => {
      const va = currentVertices[a]
      const vb = currentVertices[b]
      p.line(va.x, va.y, vb.x, vb.y)
    })

    // 一定間隔で1本だけ追加
    if ((p.millis() - lastAddTime) / 1000 > ADD_LINE_INTERVAL) {
      if (pendingEdges.length > 0) {
        // キューから1本取り出して描画リストへ
        currentEdges.push(pendingEdges.shift()!)
      }
      else {
        // 次世代を準備
        generation++
        const offsetAngle = Math.PI / (NUM_VERTICES * (2 ** (generation - 2)))
        prepareNextGeneration(offsetAngle)
      }
      lastAddTime = p.millis()
    }
  }

  p.windowResized = () => {
    const windowSize = Math.min(window.innerWidth, window.innerHeight)
    p.resizeCanvas(windowSize, windowSize)
    CENTER = { x: windowSize / 2, y: windowSize / 2 }
  }
}

// eslint-disable-next-line no-new, new-cap
new p5(sketch)
