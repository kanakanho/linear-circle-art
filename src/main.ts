import p5 from 'p5'

function sketch(p: p5) {
  p.setup = () => {
    const windowSize = Math.min(window.innerWidth, window.innerHeight)
    p.createCanvas(windowSize, windowSize)
    p.background(36)
  }

  p.draw = () => {
    p.background(36)
  }

  // 画面幅が変更されたときにキャンバスのサイズを変更する
  p.windowResized = () => {
    console.log('window resized')
    const windowSize = Math.min(window.innerWidth, window.innerHeight)
    p.resizeCanvas(windowSize, windowSize)
  }
}

// eslint-disable-next-line no-new, new-cap
new p5(sketch)
