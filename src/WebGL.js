import v from './shaders/master.vert'
import f from './shaders/master.frag'

import * as glMatrix from 'gl-matrix'

import m4 from './utils/m4'

import FpsMeter from 'fpsmeter'

export default class WebGL {
  constructor({ camera }) {
    this.camera = camera

    this.time = 0

    this.canvas = document.createElement('canvas')
    this.canvas.height = window.innerHeight * 2
    this.canvas.width = window.innerWidth * 2

    this.meter = new FPSMeter({
      heat: 2,
      graph: 1,
      history: 20,
      theme: 'colorful'
    })

    this.canvas.style.height = window.innerHeight + 'px'
    this.canvas.style.width = window.innerWidth + 'px'

    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl')

    this.vertexShader = this.compileShader(this.gl.VERTEX_SHADER, v)
    this.fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, f)

    this.program = this.linkProgram([this.fragmentShader, this.vertexShader])

    this.gl.useProgram(this.program)

    this.positionAttribLoc = this.gl.getAttribLocation(this.program, 'a_position')

    this.reverseMatrixUniformLoc = this.gl.getUniformLocation(this.program, 'u_inverseProjectionMatrix')
    this.reverseModelUniformLoc = this.gl.getUniformLocation(this.program, 'u_modelInverse')

    this.circlePositionsUniformsLoc = [
      this.gl.getUniformLocation(this.program, 'u_circle1Position'),
      this.gl.getUniformLocation(this.program, 'u_circle2Position'),
      this.gl.getUniformLocation(this.program, 'u_circle3Position')
    ]

    this.circleColorsUniformsLoc = [
      this.gl.getUniformLocation(this.program, 'u_circle1Color'),
      this.gl.getUniformLocation(this.program, 'u_circle2Color'),
      this.gl.getUniformLocation(this.program, 'u_circle3Color')
    ]

    this.positionsBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionsBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.createQuad()), this.gl.STATIC_DRAW)

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionsBuffer)
    this.gl.enableVertexAttribArray(this.positionAttribLoc)
    this.gl.vertexAttribPointer(this.positionAttribLoc, 2, this.gl.FLOAT, false, 0, 0)

    this.render()
  }

  compileShader(type, src) {
    let shader = this.gl.createShader(type)
    this.gl.shaderSource(shader, src)
    this.gl.compileShader(shader)

    let success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)

    if (success) {
      return shader
    }

    console.warn('shader not compiled :(', this.gl.getShaderInfoLog(shader))
  }

  linkProgram(shaders) {
    let program = this.gl.createProgram()
    shaders.forEach(shader => {
      this.gl.attachShader(program, shader)
    })
    this.gl.linkProgram(program)

    let success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS)

    if (success) {
      return program
    }

    console.warn('program not linked :(', this.gl.getProgramInfoLog(program))
  }

  createQuad() {
    //prettier-ignore
    let buffer = [
          -1, -1,
          -1, 1,
          1, 1,

          1, 1,
          1, -1,
          -1, -1,
      ]

    return buffer
  }

  render() {
    this.meter.tick()

    this.time++
    this.gl.uniform3f(this.circlePositionsUniformsLoc[0], 0.4, 0.4 + Math.cos(this.time / 30), -1)
    this.gl.uniform3f(this.circleColorsUniformsLoc[0], 0.3, 0.3, 1)

    this.gl.uniform3f(this.circlePositionsUniformsLoc[1], -2, 0.2, 0)
    this.gl.uniform3f(this.circleColorsUniformsLoc[1], 1, 0.3, 0.3)

    this.gl.uniform3f(this.circlePositionsUniformsLoc[2], -0.5, 1, 1)
    this.gl.uniform3f(this.circleColorsUniformsLoc[2], 0.3, 1, 0.3)

    this.gl.uniformMatrix4fv(this.reverseMatrixUniformLoc, false, this.camera.inverseProjection)

    let rotation = m4.rotateY(this.time / 60)
    this.gl.uniformMatrix4fv(
      this.reverseModelUniformLoc,
      false,
      m4.inverse(m4.transpose(m4.lookAt([Math.cos(this.time / 120) * 5, 0, -5 * Math.sin(this.time / 120)], [0, 0, 0], [0, 1, 0])))
    )
    //console.log(this.camera.model)

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6)

    requestAnimationFrame(this.render.bind(this))
  }
}
