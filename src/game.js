const canvas = document.getElementById('stage')
, stage = canvas.getContext('2d')
, stageW = 800
, stageH = 400
, pi = 3.14159
, state = {}

canvas.width = stageW
canvas.height = stageH

const range = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
}

const midPoint = (p1, p2) => ({
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2
})

const clr = () => {
    stage.fillStyle = 'black'
    stage.fillRect(0, 0, stageW, stageH)
}

const Sprout = (x, y) => ({
    x, y, lines: 0,
    hover: false
})

const init = () =>
      Object.assign(state, {
          sprouts: [
              Sprout(range(40, stageW - 40),
                     range(40, stageH - 40)),
              Sprout(range(40, stageW - 40),
                     range(40, stageH - 40))
          ],
          points: [],
          lines: [],
          isDrawing: false
      })

const update = dt => {}

const renderLine = points => {
    if (points.length >= 2) {
        let p1 = points[0]
        , p2 = points[1]

        stage.strokeStyle = 'pink'
        stage.lineWidth = 4
        stage.lineJoin = stage.lineCap = 'round'
        stage.beginPath()
        stage.moveTo(p1.x, p1.y)

        for (let i = 1; i < points.length; i++) {
            const mid = midPoint(p1, p2)
            stage.quadraticCurveTo(p1.x, p1.y, mid.x, mid.y)
            p1 = points[i]
            p2 = points[i+1]
        }

        stage.lineTo(p1.x, p1.y)
        stage.stroke()
        stage.closePath()
    }
}

const render = () => {
    const {sprouts} = state

    clr()

    for (let sprout of sprouts) {
        stage.fillStyle = sprout.hover
            ? 'green'
            : 'white'
        stage.strokeStyle = 'white'
        stage.lineWidth = 0
        stage.beginPath()
        stage.arc(sprout.x, sprout.y, 20, 0, 2 * pi, false)
        stage.fill()
        stage.closePath()
        stage.stroke()
    }

    renderLine(state.points)

    for (let line of state.lines) {
        renderLine(line)
    }
}

const loop = dt => {
    update(dt)
    render()
    window.requestAnimationFrame(loop)
}

init()
window.requestAnimationFrame(loop)

const pointInRadius = (x1, y1, cx, cy, r) =>
    Math.pow(x1 - cx, 2) + Math.pow(y1 - cy, 2) <= Math.pow(r, 2)

canvas.onmousedown = ev => {
    const {clientX: mx, clientY: my} = ev
    , {sprouts} = state

    for (let sprout of sprouts) {
        if (pointInRadius(mx, my, sprout.x, sprout.y, 20)) {
            state.isDrawing = true
            state.points.push({x: sprout.x, y: sprout.y})
        }
    }
}

canvas.onmousemove = ev => {
    const {sprouts} = state
    , {clientX: mx, clientY: my} = ev

    for (let sprout of sprouts) {
        if (pointInRadius(mx, my, sprout.x, sprout.y, 20)) {
            sprout.hover = true
        } else {
            sprout.hover = false
        }
    }

    if (state.isDrawing) {
        state.points.push({x: mx, y: my})
    }
}

canvas.onmouseup = ev => {
    const {clientX: mx, clientY: my} = ev
    , {sprouts} = state
    state.isDrawing = false

    for (let sprout of sprouts) {
        if (pointInRadius(mx, my, sprout.x, sprout.y, 20)) {
            state.lines.push(state.points.slice())
            state.points.length = 0
            return
        }
    }
    state.points.length = 0
}
